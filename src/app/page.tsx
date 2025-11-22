
'use client';

import { useState, useEffect } from 'react';
import { calculateCRS, UserProfile, Draw, DrawType, EducationLevel, LanguageLevel } from '@/lib/crs-calculator';
import { recentDraws } from '@/lib/draws';
import { formatDate, getDaysAgo } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, Info, ExternalLink, TrendingUp, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Helper function for eligibility check
const checkEligibility = (score: number, category: DrawType, profile: UserProfile) => {
  const eligibleDraws = recentDraws.filter(draw => {
    if (draw.type === 'General') return score >= draw.score;
    if (draw.type === 'French') {
       return (category === 'French' || (profile.languageFrench !== 'None' && profile.languageFrench !== 'Beginner')) && score >= draw.score;
    }
    if (draw.type === category) return score >= draw.score;
    // CEC logic simplified: if user has >=1 year Canadian exp, they qualify for CEC draws
    if (draw.type === 'CEC') {
        return profile.workExperienceCanada >= 1 && score >= draw.score;
    }
    return false;
  });
  return eligibleDraws;
};

export default function Home() {
  const [profile, setProfile] = useState<UserProfile & { occupationCategory: DrawType }>({
    age: 29,
    education: 'Bachelor',
    languageEnglish: 'Intermediate',
    languageFrench: 'None',
    workExperienceCanada: 0,
    workExperienceForeign: 1,
    certificateOfQualification: false,
    nomination: false,
    siblingInCanada: false,
    occupationCategory: 'General'
  });

  const [score, setScore] = useState({ total: 0, breakdown: {} as any });
  const [eligibleDraws, setEligibleDraws] = useState<Draw[]>([]);

  useEffect(() => {
    const newScore = calculateCRS(profile);
    setScore(newScore);
    setEligibleDraws(checkEligibility(newScore.total, profile.occupationCategory, profile));
  }, [profile]);

  const updateProfile = (key: string, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  // Scenario Handlers
  const loadScenario = (type: 'phd' | 'diploma' | 'bachelor') => {
    switch(type) {
      case 'phd': // UofT STEM PhD
        setProfile({
          age: 28,
          education: 'PhD',
          languageEnglish: 'Advanced',
          languageFrench: 'None',
          workExperienceCanada: 1, // Assuming TA/RA work or PostDoc
          workExperienceForeign: 0,
          certificateOfQualification: false,
          nomination: false,
          siblingInCanada: false,
          occupationCategory: 'STEM'
        });
        break;
      case 'diploma': // Conestoga 2-Year + French
        setProfile({
          age: 24,
          education: 'TwoYear',
          languageEnglish: 'Intermediate',
          languageFrench: 'Intermediate', // Added French as per request
          workExperienceCanada: 1, // PGWP work
          workExperienceForeign: 0,
          certificateOfQualification: false,
          nomination: false,
          siblingInCanada: false,
          occupationCategory: 'French' // Targeting French draws
        });
        break;
      case 'bachelor': // Waterloo STEM Undergrad
        setProfile({
          age: 23,
          education: 'Bachelor',
          languageEnglish: 'Advanced',
          languageFrench: 'None',
          workExperienceCanada: 1, // Co-op + PGWP
          workExperienceForeign: 0,
          certificateOfQualification: false,
          nomination: false,
          siblingInCanada: false,
          occupationCategory: 'STEM'
        });
        break;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans" style={{ backgroundColor: '#C7C7E0' }}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div className="space-y-4 max-w-3xl">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-financier)' }}>
                Immigration Calculator
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Estimate your Express Entry score and check eligibility for recent draws.
              </p>
            </div>
            {/* Explanation Card */}
            <div className="mt-6 p-6 rounded-lg border border-border/50" style={{ backgroundColor: 'rgba(245, 244, 252, 0.7)', backdropFilter: 'blur(8px)' }}>
              <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: 'var(--font-financier)', color: '#28253B' }}>
                How the CRS Points System Works
              </h2>
              <ul className="list-disc list-inside space-y-2 text-base leading-relaxed" style={{ color: '#28253B' }}>
                <li><strong>Core factors</strong> (age, education, language, work experience) and <strong>transferability factors</strong> (combinations of skills) form your base score.</li>
                <li><strong>Additional points</strong> come from provincial nominations, French language proficiency, or siblings in Canada.</li>
                <li>The government holds regular draws and invites candidates above the cutoff score. Category-based draws (healthcare, STEM, French) often have lower thresholds.</li>
              </ul>
            </div>
          </div>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-border/50 shadow-sm h-10">
              <TabsTrigger value="calculator" className="h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium text-sm">Calculator</TabsTrigger>
              <TabsTrigger value="data" className="h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium text-sm">Historical Data</TabsTrigger>
              <TabsTrigger value="programs" className="h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium text-sm">Programs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Calculator Inputs (Span 7) */}
              <Card className="lg:col-span-7 shadow-xl border border-border/50 rounded-lg bg-white overflow-hidden">
                <CardHeader className="pb-6 border-b border-border bg-white pt-10 px-10">
                  <div className="flex justify-between items-start flex-col gap-5">
                    <CardTitle className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-financier)' }}>Your Profile</CardTitle>
                    <div className="flex flex-wrap gap-2 w-full">
                       <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80 px-4 py-2 text-sm font-semibold border border-border/50 transition-colors" onClick={() => loadScenario('phd')}>
                         UofT STEM PhD
                       </Badge>
                       <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80 px-4 py-2 text-sm font-semibold border border-border/50 transition-colors" onClick={() => loadScenario('bachelor')}>
                         Waterloo STEM
                       </Badge>
                       <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80 px-4 py-2 text-sm font-semibold border border-border/50 transition-colors" onClick={() => loadScenario('diploma')}>
                         Conestoga Diploma + French
                       </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  {/* Tip Box */}
                  <div className="bg-amber-50/80 border border-amber-200/50 rounded-lg p-5 flex gap-4 items-start backdrop-blur-sm">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 leading-relaxed">
                      <p className="font-semibold mb-1.5">Age & Points Disclaimer</p>
                      <p>Points for age start decreasing after 29. Gaining more work experience or education often takes time, which increases your age and might lower your overall score.</p>
                    </div>
                  </div>

                  {/* Age & Education */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground">Age</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={profile.age} 
                          onChange={(e) => updateProfile('age', parseInt(e.target.value) || 0)}
                          className="h-12 text-base bg-muted/50 border-input focus:border-foreground focus:ring-2 focus:ring-ring/20 rounded-lg px-4 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground">Education</Label>
                      <Select value={profile.education} onValueChange={(v) => updateProfile('education', v)}>
                        <SelectTrigger className="h-12 text-base bg-muted/50 border-input focus:ring-2 focus:ring-ring/20 rounded-lg px-4 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">Secondary or Less</SelectItem>
                          <SelectItem value="Secondary">Secondary Diploma</SelectItem>
                          <SelectItem value="OneYear">1-Year Degree/Diploma</SelectItem>
                          <SelectItem value="TwoYear">2-Year Degree/Diploma</SelectItem>
                          <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="TwoOrMore">Two or more certificates</SelectItem>
                          <SelectItem value="Master">Master's Degree</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground">English Level</Label>
                      <Select value={profile.languageEnglish} onValueChange={(v) => updateProfile('languageEnglish', v)}>
                        <SelectTrigger className="h-12 text-base bg-muted/50 border-input focus:ring-2 focus:ring-ring/20 rounded-lg px-4 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None / Basic</SelectItem>
                          <SelectItem value="Beginner">Basic (Simple conversation)</SelectItem>
                          <SelectItem value="Intermediate">Intermediate (Good for work)</SelectItem>
                          <SelectItem value="Advanced">Fluent / Native-like</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground">French Level</Label>
                      <Select value={profile.languageFrench} onValueChange={(v) => updateProfile('languageFrench', v)}>
                        <SelectTrigger className="h-12 text-base bg-muted/50 border-input focus:ring-2 focus:ring-ring/20 rounded-lg px-4 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None / Basic</SelectItem>
                          <SelectItem value="Beginner">Basic (Simple conversation)</SelectItem>
                          <SelectItem value="Intermediate">Intermediate (Good for work)</SelectItem>
                          <SelectItem value="Advanced">Fluent / Native-like</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground">Canadian Experience</Label>
                      <Select value={String(profile.workExperienceCanada)} onValueChange={(v) => updateProfile('workExperienceCanada', parseInt(v))}>
                        <SelectTrigger className="h-12 text-base bg-muted/50 border-input focus:ring-2 focus:ring-ring/20 rounded-lg px-4 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          <SelectItem value="1">1 Year</SelectItem>
                          <SelectItem value="2">2 Years</SelectItem>
                          <SelectItem value="3">3 Years</SelectItem>
                          <SelectItem value="4">4 Years</SelectItem>
                          <SelectItem value="5">5+ Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-foreground">Foreign Experience</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm bg-foreground text-background p-3 rounded-lg shadow-xl border-0">
                              <p>Only counts <strong>full-time</strong> (30h/week) skilled work experience gained <strong>outside Canada</strong> in the last 10 years.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select value={String(profile.workExperienceForeign)} onValueChange={(v) => updateProfile('workExperienceForeign', parseInt(v))}>
                        <SelectTrigger className="h-12 text-base bg-muted/50 border-input focus:ring-2 focus:ring-ring/20 rounded-lg px-4 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          <SelectItem value="1">1 Year</SelectItem>
                          <SelectItem value="2">2 Years</SelectItem>
                          <SelectItem value="3">3+ Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Occupation & Nomination */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-semibold text-foreground">Primary Occupation</Label>
                        <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded">Tip: Try changing this!</span>
                      </div>
                      <Select value={profile.occupationCategory} onValueChange={(v) => updateProfile('occupationCategory', v)}>
                        <SelectTrigger className="h-12 text-base bg-muted/50 border-input focus:ring-2 focus:ring-ring/20 rounded-lg px-4 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General / Other</SelectItem>
                          <SelectItem value="STEM">STEM (Science, Tech, Engineering, Math)</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Trades">Trades</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="Agriculture">Agriculture</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">Certain categories like Healthcare, STEM, and Trades often have lower cutoff scores.</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-5 bg-muted/30 rounded-lg border border-border hover:border-foreground/20 transition-colors cursor-pointer" onClick={() => updateProfile('nomination', !profile.nomination)}>
                      <div className="space-y-1">
                        <Label className="text-base font-semibold text-foreground cursor-pointer">Provincial Nomination</Label>
                        <p className="text-sm text-muted-foreground">Adds 600 points to your score</p>
                      </div>
                      <Switch 
                        checked={profile.nomination}
                        onCheckedChange={(v) => updateProfile('nomination', v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Results (Span 5) */}
              <div className="lg:col-span-5 space-y-6 sticky top-8">
                {/* Score Card */}
                <Card className="shadow-xl border border-border/50 rounded-lg overflow-hidden" style={{ backgroundColor: '#EBF4FF' }}>
                  <CardContent className="p-10 text-center">
                    <h2 className="text-xs uppercase tracking-widest font-semibold mb-6" style={{ color: '#64748b' }}>Estimated CRS Score</h2>
                    <div className="text-9xl font-bold tracking-tighter mb-8" style={{ fontFamily: 'var(--font-financier)', color: '#28253B' }}>{score.total}</div>
                    
                    {/* Latest Eligible Draw Section */}
                    {eligibleDraws.length > 0 && (
                      <div className="mb-8 p-5 rounded-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#1e40af' }}>Last Eligible Draw</div>
                        <div className="flex flex-col items-center">
                          <div className="font-bold text-xl" style={{ fontFamily: 'var(--font-financier)', color: '#28253B' }}>
                            {formatDate(eligibleDraws[0].date)}
                          </div>
                          <div className="text-sm font-medium mb-3" style={{ color: '#64748b' }}>
                            ({getDaysAgo(eligibleDraws[0].date)})
                          </div>
                          <div className="text-sm flex items-center gap-2 mt-1" style={{ color: '#28253B' }}>
                            <Badge variant="outline" className="bg-white border-blue-300 text-blue-800 font-semibold">{eligibleDraws[0].type}</Badge>
                            <span className="font-medium">CRS {eligibleDraws[0].score}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 pt-8" style={{ borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
                       <div className="text-center">
                         <span className="block text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-financier)', color: '#28253B' }}>{score.breakdown.core}</span>
                         <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#64748b' }}>Core</span>
                       </div>
                       <div className="text-center" style={{ borderLeft: '1px solid rgba(59, 130, 246, 0.2)' }}>
                         <span className="block text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-financier)', color: '#28253B' }}>{score.breakdown.transferability}</span>
                         <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#64748b' }}>Transfer</span>
                       </div>
                       <div className="text-center" style={{ borderLeft: '1px solid rgba(59, 130, 246, 0.2)' }}>
                         <span className="block text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-financier)', color: '#28253B' }}>{score.breakdown.additional}</span>
                         <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#64748b' }}>Bonus</span>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Eligibility Results */}
                <Card className="shadow-xl border border-border/50 rounded-lg overflow-hidden flex flex-col max-h-[600px]" style={{ backgroundColor: '#FEF2F2' }}>
                  <CardHeader className="border-b border-border/50 py-6 px-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                    <CardTitle className="text-xl font-bold flex items-center gap-3" style={{ fontFamily: 'var(--font-financier)', color: '#28253B' }}>
                      {eligibleDraws.length > 0 ? (
                        <div className="p-1.5 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                          <CheckCircle2 className="h-5 w-5" style={{ color: '#16a34a' }} />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                          <XCircle className="h-5 w-5" style={{ color: '#dc2626' }} />
                        </div>
                      )}
                      {eligibleDraws.length > 0 ? 'Eligible for Draws' : 'Not Currently Eligible'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 min-h-0">
                    <ScrollArea className="h-[400px]">
                       {eligibleDraws.length > 0 ? (
                        <div style={{ borderTop: '1px solid rgba(220, 38, 38, 0.1)' }}>
                          {eligibleDraws.map((draw, index) => (
                            <div key={draw.id} className="p-6 transition-colors flex justify-between items-center group" style={{ 
                              borderTop: index > 0 ? '1px solid rgba(220, 38, 38, 0.1)' : 'none',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <div className="space-y-1.5">
                                <div className="font-semibold text-base" style={{ color: '#28253B' }}>{draw.type} Draw</div>
                                <div className="text-sm" style={{ color: '#64748b' }}>{formatDate(draw.date)}</div>
                              </div>
                              <div className="text-right">
                                <Badge variant="secondary" className="border-0 px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#28253B' }}>
                                  {draw.score} CRS
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-5">
                           <div className="p-5 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                             <XCircle className="h-10 w-10" style={{ color: '#94a3b8' }} />
                           </div>
                           <div className="space-y-2">
                             <p className="font-semibold text-lg" style={{ color: '#28253B' }}>No matching draws found</p>
                             <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: '#64748b' }}>
                               Based on recent data (2024/2025), this profile score of <strong style={{ color: '#28253B' }}>{score.total}</strong> would likely <strong style={{ color: '#28253B' }}>not have been selected</strong> for Permanent Residency.
                             </p>
                           </div>
                         </div>
                       )}
                    </ScrollArea>
                  </CardContent>
                  <div className="p-5 text-xs text-center font-semibold uppercase tracking-widest" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', borderTop: '1px solid rgba(220, 38, 38, 0.1)', color: '#64748b' }}>
                    Historical Data (2023-2025)
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <Card className="shadow-xl border border-border/50 rounded-lg bg-white overflow-hidden">
              <CardHeader className="pb-6 border-b border-border bg-white pt-10 px-10">
                <CardTitle className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-financier)' }}>Historical Express Entry Draws (2023-2025)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">CRS Cutoff</TableHead>
                      <TableHead className="text-right">Invitations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDraws.map((draw) => (
                      <TableRow key={draw.id}>
                        <TableCell className="font-medium">{formatDate(draw.date)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted text-foreground border-0 font-semibold">
                            {draw.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground">{draw.score}</TableCell>
                        <TableCell className="text-right">{draw.invitations.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <Card className="shadow-lg rounded-lg bg-white overflow-hidden hover:shadow-xl transition-shadow" style={{ border: '1px solid rgba(0, 0, 0, 0.15)' }}>
                <CardHeader className="bg-muted/30 border-b pb-5" style={{ borderColor: 'rgba(0, 0, 0, 0.15)' }}>
                  <CardTitle className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-financier)' }}>Canadian Experience Class (CEC)</CardTitle>
                </CardHeader>
                <CardContent className="p-7 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For skilled workers who have at least <strong>1 year of full-time skilled work experience in Canada</strong> in the last 3 years.
                  </p>
                  <div className="pt-2">
                    <a 
                      href="https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/canadian-experience-class.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg rounded-lg bg-white overflow-hidden hover:shadow-xl transition-shadow" style={{ border: '1px solid rgba(0, 0, 0, 0.15)' }}>
                <CardHeader className="bg-muted/30 border-b pb-5" style={{ borderColor: 'rgba(0, 0, 0, 0.15)' }}>
                  <CardTitle className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-financier)' }}>Federal Skilled Worker (FSW)</CardTitle>
                </CardHeader>
                <CardContent className="p-7 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For skilled workers with <strong>foreign work experience</strong>. Requires at least 1 year of continuous full-time paid work experience in the same job within the last 10 years.
                  </p>
                  <div className="pt-2">
                    <a 
                      href="https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg rounded-lg bg-white overflow-hidden hover:shadow-xl transition-shadow" style={{ border: '1px solid rgba(0, 0, 0, 0.15)' }}>
                <CardHeader className="bg-muted/30 border-b pb-5" style={{ borderColor: 'rgba(0, 0, 0, 0.15)' }}>
                  <CardTitle className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-financier)' }}>Category-Based Selection</CardTitle>
                </CardHeader>
                <CardContent className="p-7 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Special draws for candidates with specific skills, training, or language ability. Categories include:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-1">
                    <li>French-language proficiency</li>
                    <li>Healthcare occupations</li>
                    <li>STEM occupations</li>
                    <li>Trade occupations</li>
                    <li>Transport occupations</li>
                    <li>Agriculture and agri-food</li>
                  </ul>
                  <div className="pt-2">
                    <a 
                      href="https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations/category-based-selection.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
