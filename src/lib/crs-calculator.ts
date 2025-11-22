
// Simplified CRS Calculator Logic
// Based on official CRS criteria (Single applicant logic mostly, with spouse placeholders)

export type DrawType = 'General' | 'French' | 'STEM' | 'Healthcare' | 'Trades' | 'Transport' | 'Agriculture' | 'PNP' | 'CEC' | 'Fsw' | 'Education';

export interface Draw {
  id: string;
  date: string;
  type: DrawType;
  score: number;
  invitations: number;
}

export type EducationLevel = 
  | 'None' 
  | 'Secondary' 
  | 'OneYear' 
  | 'TwoYear' 
  | 'Bachelor' 
  | 'TwoOrMore' 
  | 'Master' 
  | 'PhD';

export type LanguageLevel = 'None' | 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserProfile {
  age: number;
  education: EducationLevel;
  languageEnglish: LanguageLevel;
  languageFrench: LanguageLevel;
  workExperienceCanada: number; // years
  workExperienceForeign: number; // years
  certificateOfQualification: boolean;
  spouse?: {
    education?: EducationLevel;
    languageEnglish?: LanguageLevel;
    languageFrench?: LanguageLevel;
    workExperienceCanada?: number;
  };
  // jobOffer: boolean; // Removed as per request
  nomination: boolean;
  siblingInCanada: boolean;
}

// --- Helper Functions for Points ---

// Age Points (Single Applicant)
const getAgePoints = (age: number): number => {
  if (age < 18) return 0;
  if (age === 18) return 99;
  if (age === 19) return 105;
  if (age >= 20 && age <= 29) return 110;
  if (age === 30) return 105;
  if (age === 31) return 99;
  if (age === 32) return 94;
  if (age === 33) return 88;
  if (age === 34) return 83;
  if (age === 35) return 77;
  if (age === 36) return 72;
  if (age === 37) return 66;
  if (age === 38) return 61;
  if (age === 39) return 55;
  if (age === 40) return 50;
  if (age === 41) return 39;
  if (age === 42) return 28;
  if (age === 43) return 17;
  if (age === 44) return 6;
  return 0;
};

// Education Points (Single Applicant)
const getEducationPoints = (level: EducationLevel): number => {
  switch (level) {
    case 'PhD': return 150;
    case 'Master': return 135;
    case 'TwoOrMore': return 128;
    case 'Bachelor': return 120;
    case 'TwoYear': return 98;
    case 'OneYear': return 90;
    case 'Secondary': return 30;
    default: return 0;
  }
};

// Language Points (CLB approximation)
// Advanced -> CLB 10+, Intermediate -> CLB 7-9, Beginner -> CLB 4-6, None -> <4
// Max per skill: 34 (Single), 32 (With Spouse) - Using Single for simplicity for now
const getLanguagePointsPerSkill = (level: LanguageLevel, isFirstLanguage: boolean = true): number => {
  // Simplified: Returns total for 4 skills (Reading, Writing, Listening, Speaking)
  // We assume consistent level across all 4 skills for simplicity in this calculator
  
  if (isFirstLanguage) {
    // Points per skill: 
    // Advanced (CLB 10): 34 * 4 = 136
    // Intermediate (CLB 9): 31 * 4 = 124
    // Intermediate (CLB 8): 23 * 4 = 92
    // Beginner (CLB 7): 17 * 4 = 68
    // Lower: 0
    switch (level) {
      case 'Advanced': return 136; // CLB 10
      case 'Intermediate': return 92; // Averaging CLB 8/9 approx
      case 'Beginner': return 68; // CLB 7 minimum for FSW
      default: return 0;
    }
  } else {
    // Second language points (French if English is first, or vice versa)
    // Max 24 total (6 per skill)
    // CLB 9+: 6 * 4 = 24
    // CLB 7/8: 3 * 4 = 12
    // CLB 5/6: 1 * 4 = 4
    switch (level) {
      case 'Advanced': return 24;
      case 'Intermediate': return 12;
      case 'Beginner': return 4;
      default: return 0;
    }
  }
};

// Work Experience Points (Canadian)
const getCanadianWorkPoints = (years: number): number => {
  if (years >= 5) return 80;
  if (years === 4) return 72;
  if (years === 3) return 64;
  if (years === 2) return 53;
  if (years === 1) return 40;
  return 0;
};

// Skill Transferability Factors (The complex part)
const getTransferabilityPoints = (profile: UserProfile): number => {
  let points = 0;
  
  // 1. Education + Language
  // If CLB 9+ (Intermediate/Advanced) on all skills
  const strongLanguage = profile.languageEnglish === 'Advanced' || profile.languageEnglish === 'Intermediate'; // Simplified check for CLB 9
  const twoOrMore = profile.education === 'TwoOrMore' || profile.education === 'Master' || profile.education === 'PhD';
  
  if (strongLanguage && twoOrMore) points += 50;
  else if (strongLanguage && (profile.education === 'Bachelor' || profile.education === 'TwoYear')) points += 25; // Simplified
  
  // 2. Education + Canadian Work
  const strongCdnWork = profile.workExperienceCanada >= 2;
  if (strongCdnWork && twoOrMore) points += 50;
  else if (strongCdnWork && (profile.education === 'Bachelor' || profile.education === 'TwoYear')) points += 25; // Simplified

  // 3. Foreign Work + Language
  const strongForeignWork = profile.workExperienceForeign >= 3;
  if (strongLanguage && strongForeignWork) points += 50;
  else if (strongLanguage && profile.workExperienceForeign >= 1) points += 25;

  // 4. Foreign Work + Canadian Work
  if (strongCdnWork && strongForeignWork) points += 50;
  else if (strongCdnWork && profile.workExperienceForeign >= 1) points += 25;

  // Cap at 100 total for transferability
  return Math.min(points, 100);
};

const getAdditionalPoints = (profile: UserProfile): number => {
  let points = 0;
  
  if (profile.nomination) points += 600;
  // Job offer points removed as per request
  if (profile.siblingInCanada) points += 15;
  
  // French ability additional points
  // NCLC 7+ in French AND CLB 4 or lower in English -> 25
  // NCLC 7+ in French AND CLB 5+ in English -> 50
  if (profile.languageFrench === 'Advanced' || profile.languageFrench === 'Intermediate') {
    if (profile.languageEnglish !== 'None') {
      points += 50;
    } else {
      points += 25;
    }
  }

  return points;
};

export const calculateCRS = (profile: UserProfile): { total: number, breakdown: any } => {
  const coreHumanCapital = 
    getAgePoints(profile.age) + 
    getEducationPoints(profile.education) + 
    getLanguagePointsPerSkill(profile.languageEnglish, true) + 
    getLanguagePointsPerSkill(profile.languageFrench, false) + 
    getCanadianWorkPoints(profile.workExperienceCanada);

  const transferability = getTransferabilityPoints(profile);
  
  const additional = getAdditionalPoints(profile);

  const total = Math.min(coreHumanCapital + transferability, 600) + additional; // Core + Transferability cap is 600 usually, but this formula is a simplification. 
  // Actually: Core/Spouse factors max 500 (single) or 460 (married).
  // Skill transferability max 100.
  // Additional max 600.
  
  // Let's refine the cap logic slightly for Single Applicant
  const coreMax = 500;
  const transferabilityMax = 100;
  const additionalMax = 600; // Theoretically higher but realistically capped by PNP

  const finalCore = Math.min(coreHumanCapital, coreMax);
  const finalTrans = Math.min(transferability, transferabilityMax);
  
  const grandTotal = finalCore + finalTrans + additional;

  return {
    total: grandTotal,
    breakdown: {
      core: finalCore,
      transferability: finalTrans,
      additional: additional,
      age: getAgePoints(profile.age),
      education: getEducationPoints(profile.education),
      language: getLanguagePointsPerSkill(profile.languageEnglish, true) + getLanguagePointsPerSkill(profile.languageFrench, false),
    }
  };
};
