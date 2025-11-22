
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Immigration Calculator
            </h1>
            <p className="text-lg text-slate-700 max-w-2xl">
              Estimate your CRS score and instantly check eligibility.
            </p>
          </div>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/50 p-1 rounded-xl">
              <TabsTrigger value="calculator" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Calculator</TabsTrigger>
              <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Historical Data</TabsTrigger>
              <TabsTrigger value="programs" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Programs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Calculator Inputs (Span 7) */}
              <Card className="lg:col-span-7 shadow-xl border-0 rounded-2xl bg-white overflow-hidden">
                <CardHeader className="pb-6 border-b border-slate-100 bg-white pt-8 px-8">
                  <div className="flex justify-between items-start flex-col gap-4">
                    <CardTitle className="text-2xl font-bold text-slate-900">Your Profile</CardTitle>
                    <div className="flex flex-wrap gap-2 w-full">
                       <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 px-3 py-1.5 text-sm font-medium" onClick={() => loadScenario('phd')}>
                         UofT STEM PhD
                       </Badge>
                       <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 px-3 py-1.5 text-sm font-medium" onClick={() => loadScenario('bachelor')}>
                         Waterloo STEM
                       </Badge>
                       <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 px-3 py-1.5 text-sm font-medium" onClick={() => loadScenario('diploma')}>
                         Conestoga Diploma + French
                       </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Tip Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Age & Points Warning</p>
                      <p>Points for age start decreasing after 29. Gaining more work experience or education often takes time, which increases your age and might lower your overall score.</p>
                    </div>
                  </div>

                  {/* Age & Education */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-slate-900">Age</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={profile.age} 
                          onChange={(e) => updateProfile('age', parseInt(e.target.value) || 0)}
                          className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-slate-900 focus:ring-0 rounded-xl px-4 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-slate-900">Education</Label>
                      <Select value={profile.education} onValueChange={(v) => updateProfile('education', v)}>
                        <SelectTrigger className="h-12 text-lg bg-slate-50 border-slate-200 focus:ring-0 rounded-xl px-4">
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
                      <Label className="text-base font-medium text-slate-900">English Level</Label>
                      <Select value={profile.languageEnglish} onValueChange={(v) => updateProfile('languageEnglish', v)}>
                        <SelectTrigger className="h-12 text-lg bg-slate-50 border-slate-200 focus:ring-0 rounded-xl px-4">
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
                      <Label className="text-base font-medium text-slate-900">French Level</Label>
                      <Select value={profile.languageFrench} onValueChange={(v) => updateProfile('languageFrench', v)}>
                        <SelectTrigger className="h-12 text-lg bg-slate-50 border-slate-200 focus:ring-0 rounded-xl px-4">
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
                      <Label className="text-base font-medium text-slate-900">Canadian Experience</Label>
                      <Select value={String(profile.workExperienceCanada)} onValueChange={(v) => updateProfile('workExperienceCanada', parseInt(v))}>
                        <SelectTrigger className="h-12 text-lg bg-slate-50 border-slate-200 focus:ring-0 rounded-xl px-4">
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
                        <Label className="text-base font-medium text-slate-900">Foreign Experience</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm bg-slate-900 text-white p-3 rounded-lg shadow-xl border-0">
                              <p>Only counts <strong>full-time</strong> (30h/week) skilled work experience gained <strong>outside Canada</strong> in the last 10 years.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select value={String(profile.workExperienceForeign)} onValueChange={(v) => updateProfile('workExperienceForeign', parseInt(v))}>
                        <SelectTrigger className="h-12 text-lg bg-slate-50 border-slate-200 focus:ring-0 rounded-xl px-4">
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
                        <Label className="text-base font-medium text-slate-900">Primary Occupation</Label>
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">Tip: Try changing this!</span>
                      </div>
                      <Select value={profile.occupationCategory} onValueChange={(v) => updateProfile('occupationCategory', v)}>
                        <SelectTrigger className="h-12 text-lg bg-slate-50 border-slate-200 focus:ring-0 rounded-xl px-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General / Other</SelectItem>
                          <SelectItem value="STEM">STEM (Science, Tech, Engineering, Math)</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Trades">Trades</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="Agriculture">Agriculture</SelectItem>
                          <SelectItem value="French">French Speaker (Priority)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-500">Certain categories like Healthcare, STEM, and Trades often have lower cutoff scores.</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer" onClick={() => updateProfile('nomination', !profile.nomination)}>
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-slate-900 cursor-pointer">Provincial Nomination</Label>
                        <p className="text-sm text-slate-500">Adds 600 points to your score</p>
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
                <Card className="shadow-xl border-0 rounded-2xl bg-white overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">Estimated CRS Score</h2>
                    <div className="text-8xl font-bold text-slate-900 tracking-tighter mb-6">{score.total}</div>
                    
                    {/* Latest Eligible Draw Section */}
                    {eligibleDraws.length > 0 && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl">
                        <div className="text-xs uppercase tracking-wide text-green-700 font-semibold mb-1">Last Eligible Draw</div>
                        <div className="flex flex-col items-center">
                          <div className="font-bold text-lg text-slate-900">
                            {formatDate(eligibleDraws[0].date)}
                          </div>
                          <div className="text-sm text-slate-500 font-medium mb-2">
                            ({getDaysAgo(eligibleDraws[0].date)})
                          </div>
                          <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-white border-green-200 text-green-800">{eligibleDraws[0].type}</Badge>
                            <span>CRS {eligibleDraws[0].score}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                       <div className="text-center">
                         <span className="block text-2xl font-bold text-slate-900">{score.breakdown.core}</span>
                         <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Core</span>
                       </div>
                       <div className="text-center border-l border-slate-100">
                         <span className="block text-2xl font-bold text-slate-900">{score.breakdown.transferability}</span>
                         <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Transfer</span>
                       </div>
                       <div className="text-center border-l border-slate-100">
                         <span className="block text-2xl font-bold text-slate-900">{score.breakdown.additional}</span>
                         <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Bonus</span>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Eligibility Results */}
                <Card className="shadow-xl border-0 rounded-2xl bg-white overflow-hidden flex flex-col max-h-[600px]">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 py-5 px-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
                      {eligibleDraws.length > 0 ? (
                        <div className="bg-green-100 p-1.5 rounded-full">
                          <CheckCircle2 className="text-green-600 h-5 w-5" />
                        </div>
                      ) : (
                        <div className="bg-red-100 p-1.5 rounded-full">
                          <XCircle className="text-red-600 h-5 w-5" />
                        </div>
                      )}
                      {eligibleDraws.length > 0 ? 'Eligible for Draws' : 'Not Currently Eligible'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 min-h-0">
                    <ScrollArea className="h-[400px]">
                       {eligibleDraws.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {eligibleDraws.map((draw) => (
                            <div key={draw.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                              <div className="space-y-1">
                                <div className="font-semibold text-slate-900">{draw.type} Draw</div>
                                <div className="text-sm text-slate-500">{formatDate(draw.date)}</div>
                              </div>
                              <div className="text-right">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-900 hover:bg-slate-200 border-0 px-3 py-1 text-sm font-medium">
                                  {draw.score} CRS
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-4">
                           <div className="bg-slate-50 p-4 rounded-full">
                             <XCircle className="h-8 w-8 text-slate-300" />
                           </div>
                           <div className="space-y-1">
                             <p className="font-medium text-slate-900">No matching draws found</p>
                             <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                               Based on recent data (2024/2025), this profile score of <strong>{score.total}</strong> would likely <strong>not have been selected</strong> for Permanent Residency.
                             </p>
                           </div>
                         </div>
                       )}
                    </ScrollArea>
                  </CardContent>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-center text-slate-400 font-medium uppercase tracking-wider">
                    Historical Data (2023-2025)
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <Card className="shadow-xl border-0 rounded-2xl bg-white overflow-hidden">
              <CardHeader className="pb-6 border-b border-slate-100 bg-white pt-8 px-8">
                <CardTitle className="text-2xl font-bold text-slate-900">Historical Express Entry Draws (2023-2025)</CardTitle>
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
                          <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-0">
                            {draw.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">{draw.score}</TableCell>
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
              <Card className="shadow-lg border-0 rounded-2xl bg-white overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Canadian Experience Class (CEC)</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
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

              <Card className="shadow-lg border-0 rounded-2xl bg-white overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Federal Skilled Worker (FSW)</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
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

              <Card className="shadow-lg border-0 rounded-2xl bg-white overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Category-Based Selection</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Special draws for candidates with specific skills, training, or language ability. Categories include:
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-1">
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
