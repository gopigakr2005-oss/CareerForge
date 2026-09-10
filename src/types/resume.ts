export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  photoUrl?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url?: string;
  description?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  date: string;
  description: string;
}

export interface LeadershipItem {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  items: {
    id: string;
    title: string;
    subtitle?: string;
    date?: string;
    description: string;
  }[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  careerObjective?: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  internships?: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
  achievements?: AchievementItem[];
  publications?: PublicationItem[];
  languages?: LanguageItem[];
  volunteer?: VolunteerItem[];
  leadership?: LeadershipItem[];
  hobbies?: string[];
  customSections?: CustomSectionItem[];
  sectionOrder?: string[];
  hiddenSections?: string[];
  isMasterResume?: boolean;
  isFresherMode?: boolean;
}

export type TemplateId =
  // ATS Templates (4)
  | 'classic'
  | 'modern'
  | 'minimal-ats'
  | 'professional-ats'
  // Student / Fresher (4)
  | 'fresher'
  | 'college-student'
  | 'internship'
  | 'graduate'
  // Technical (4)
  | 'tech'
  | 'data-scientist'
  | 'data-analyst'
  | 'ai-ml-engineer'
  // Professional (4)
  | 'executive'
  | 'corporate'
  | 'management'
  | 'consultant'
  // Creative (4)
  | 'designer'
  | 'modern-creative'
  | 'portfolio-style'
  | 'minimal-creative';

export type TemplateType = TemplateId;

export type FontFamily = 'inter' | 'roboto' | 'merriweather' | 'outfit' | 'playfair' | 'fira';

export interface ResumeTheme {
  template: TemplateType;
  templateId?: TemplateId;
  primaryColor: string;
  fontFamily: FontFamily;
  spacing: 'compact' | 'normal' | 'spacious';
  showHeatmap?: boolean;
  showPhoto?: boolean;
}

export interface AtsCategoryScore {
  name: string;
  score: number; // 0 - 100
  weight: number;
  feedback: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface AtsWeakPhrase {
  original: string;
  reason: string;
  suggestion: string;
}

export type TargetRole = 'data-scientist' | 'ai-engineer' | 'ml-engineer' | 'fullstack-engineer';

export type ExperienceLevel = 'fresher' | 'mid' | 'senior';

export type AtsCheckMode = 'role-preset' | 'custom-jd';

export interface RoleBenchmark {
  id: TargetRole;
  title: string;
  badge: string;
  description: string;
  coreSkills: string[];
  secondarySkills: string[];
  fresherExpectations: string[];
  midExpectations: string[];
  seniorExpectations: string[];
  sampleJobDescription: string;
}

export interface AtsChecklistCheck {
  label: string;
  passed: boolean;
  tip: string;
}

export interface AtsAnalysisResult {
  overallScore: number; // 0 - 100
  categoryScores: AtsCategoryScore[];
  matchedKeywords: string[];
  missingKeywords: string[];
  weakPhrases: AtsWeakPhrase[];
  actionVerbsFound: string[];
  metricsFoundCount: number;
  bulletPointsCount: number;
  quantifiedRatio: number; // percentage of bullets with numbers/metrics
  recommendations: string[];
  targetRole?: TargetRole;
  experienceLevel?: ExperienceLevel;
  checkMode?: AtsCheckMode;
  roleBenchmark?: RoleBenchmark;
  matchedRoleSkills: string[];
  missingRoleSkills: string[];
  checklist: AtsChecklistCheck[];
}

export interface JobApplication {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  dateApplied: string;
  status: 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
  resumeUsed: string;
  jobDescription?: string;
  interviewDate?: string;
  notes: string;
}

export interface CoverLetterData {
  id: string;
  company: string;
  jobTitle: string;
  recipientName?: string;
  tone: 'formal' | 'friendly' | 'concise' | 'professional';
  content: string;
  createdAt: string;
}

export interface MockInterviewQuestion {
  id: string;
  category: 'hr' | 'technical' | 'project' | 'job-specific';
  question: string;
  sampleAnswer?: string;
  userAnswer?: string;
  feedback?: {
    score: number;
    relevance: number;
    clarity: number;
    confidence: number;
    technical: number;
    communication: number;
    tips: string[];
  };
}

export interface ResumeVersion {
  id: string;
  name: string;
  lastUpdated: string;
  atsScore: number;
  jobMatchScore: number;
  isMaster?: boolean;
  data: ResumeData;
  theme: ResumeTheme;
}

export interface CareerEvolutionPoint {
  month: string;
  atsScore: number;
  resumeScore: number;
  jobMatchScore: number;
  applications: number;
  interviews: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  truthMode: boolean;
  simpleEnglishMode: boolean;
  language: 'en' | 'hi' | 'ta';
  isPro: boolean;
}
