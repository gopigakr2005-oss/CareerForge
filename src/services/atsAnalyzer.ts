import type {
  ResumeData,
  AtsAnalysisResult,
  AtsCategoryScore,
  AtsWeakPhrase,
  RoleBenchmark,
  ExperienceLevel,
  AtsCheckMode,
  AtsChecklistCheck,
} from '../types/resume';
import { ROLE_BENCHMARKS } from '../data/roleBenchmarks';

// Comprehensive dictionary of high-impact action verbs
const ACTION_VERBS = new Set([
  'architected', 'accelerated', 'achieved', 'administered', 'analyzed', 'automated',
  'built', 'boosted', 'championed', 'coached', 'collaborated', 'consolidated',
  'converted', 'created', 'decreased', 'delivered', 'deployed', 'designed',
  'developed', 'devised', 'doubled', 'drove', 'eliminated', 'enabled',
  'engineered', 'enhanced', 'established', 'executed', 'expanded', 'expedited',
  'formulated', 'generated', 'governed', 'guided', 'halved', 'headed',
  'implemented', 'improved', 'increased', 'initiated', 'innovated', 'instituted',
  'integrated', 'introduced', 'launched', 'led', 'leveraged', 'managed',
  'maximized', 'mentored', 'migrated', 'minimized', 'modernized', 'negotiated',
  'optimized', 'orchestrated', 'overhauled', 'pioneered', 'planned', 'produced',
  'reduced', 'refactored', 're-engineered', 'resolved', 'restructured', 'revamped',
  'scaled', 'secured', 'simplified', 'spearheaded', 'standardized', 'streamlined',
  'strengthened', 'surpassed', 'trained', 'transformed', 'upgraded', 'validated'
]);

// Weak phrases and passive language to flag
const WEAK_PHRASES: { pattern: RegExp; reason: string; suggestion: string }[] = [
  {
    pattern: /\b(responsible for|responsibilities included|in charge of)\b/gi,
    reason: 'Passive phrasing. It describes duties rather than accomplishments.',
    suggestion: 'Replace with an active verb like "Led", "Executed", "Orchestrated", or "Managed".',
  },
  {
    pattern: /\b(helped with|assisted in|assisted with|worked on)\b/gi,
    reason: 'Minimizes your direct impact and ownership.',
    suggestion: 'Use direct impact verbs like "Contributed to", "Co-engineered", "Co-designed", or specify your exact role.',
  },
  {
    pattern: /\b(duties included|tasks were|handled)\b/gi,
    reason: 'Sounds like a job description rather than demonstrated achievement.',
    suggestion: 'Start bullet points with powerful action verbs like "Spearheaded", "Implemented", or "Delivered".',
  },
  {
    pattern: /\b(hard worker|team player|detail-oriented|results-driven)\b/gi,
    reason: 'Overused buzzwords that recruiters skim past without evidence.',
    suggestion: 'Demonstrate these traits with quantified metrics and real outcomes instead of buzzwords.',
  },
  {
    pattern: /\b(successfully)\b/gi,
    reason: 'Filler word. Your accomplishments already imply success when backed by metrics.',
    suggestion: 'Remove "successfully" and emphasize the measurable outcome (e.g., "Increased sales by 20%").',
  },
];

// Common tech & professional keywords for automatic extraction
const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'react.js', 'vue', 'angular', 'next.js', 'svelte', 'node.js', 'express', 'django', 'fastapi', 'spring boot',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest api', 'restful',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'git', 'github actions', 'jenkins',
  'html5', 'css3', 'tailwind css', 'sass', 'microservices', 'distributed systems', 'system design',
  'agile', 'scrum', 'jira', 'figma', 'product management', 'product discovery', 'a/b testing', 'analytics',
  'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'nlp', 'data science', 'pandas', 'numpy', 'scikit-learn',
  'langchain', 'llamaindex', 'rag', 'vector database', 'pinecone', 'chroma', 'prompt engineering',
  'mlops', 'mlflow', 'triton', 'torchserve', 'onnx', 'bigquery', 'snowflake', 'tableau', 'power bi',
  'cybersecurity', 'devops', 'linux', 'cloud computing', 'unit testing', 'jest', 'cypress'
];

/**
 * Converts ResumeData into clean searchable plain text
 */
export function resumeDataToText(resume: ResumeData): string {
  const parts: string[] = [
    resume.personalInfo.fullName,
    resume.personalInfo.jobTitle,
    resume.personalInfo.location,
    resume.summary,
  ];

  resume.experience.forEach((exp) => {
    parts.push(`${exp.role} ${exp.company} ${exp.location}`);
    parts.push(...exp.highlights);
  });

  resume.education.forEach((edu) => {
    parts.push(`${edu.degree} ${edu.fieldOfStudy} ${edu.institution}`);
  });

  resume.skills.forEach((cat) => {
    parts.push(cat.name);
    parts.push(...cat.skills);
  });

  resume.projects.forEach((proj) => {
    parts.push(`${proj.title} ${proj.description}`);
    parts.push(...proj.technologies);
  });

  resume.certifications.forEach((cert) => {
    parts.push(`${cert.name} ${cert.issuer}`);
  });

  return parts.join(' \n ');
}

/**
 * Extracts all bullet points from ResumeData
 */
export function extractBulletPoints(resume: ResumeData): string[] {
  const bullets: string[] = [];
  resume.experience.forEach((exp) => bullets.push(...exp.highlights));
  resume.projects.forEach((proj) => {
    if (proj.description) bullets.push(proj.description);
  });
  return bullets;
}

/**
 * Extracts potential keywords and technical skills from text
 */
export function extractKeywordsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  COMMON_SKILLS.forEach((skill) => {
    // Regex boundary check
    const regex = new RegExp(`(^|[^a-z0-9#+.-])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9#+.-]|$)`, 'i');
    if (regex.test(lower)) {
      matched.add(skill);
    }
  });

  // Extract capitalized words & acronyms (e.g. AWS, CI/CD, SaaS, OKRs, SLA)
  const acronyms = text.match(/\b[A-Z0-9]{2,}\b/g);
  if (acronyms) {
    acronyms.forEach((acronym) => {
      const a = acronym.toLowerCase();
      if (!['and', 'for', 'the', 'with', 'from', 'that', 'this'].includes(a)) {
        matched.add(a);
      }
    });
  }

  return Array.from(matched);
}

/**
 * Helper to test if a phrase or skill exists in text
 */
function textContainsSkill(text: string, skill: string): boolean {
  const clean = text.toLowerCase();
  const target = skill.toLowerCase().trim();
  if (clean.includes(target)) return true;
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^a-z0-9#+.-])${escaped}([^a-z0-9#+.-]|$)`, 'i');
  return regex.test(clean);
}

/**
 * Core ATS Analysis Function with Role Benchmarking & Level Calibration
 */
export function analyzeResume(
  resumeText: string,
  jobDescriptionText?: string,
  bulletPointsList?: string[],
  roleBenchmark: RoleBenchmark = ROLE_BENCHMARKS['data-scientist'],
  experienceLevel: ExperienceLevel = 'fresher',
  checkMode: AtsCheckMode = 'role-preset'
): AtsAnalysisResult {
  const cleanResume = resumeText.toLowerCase();
  const bullets =
    bulletPointsList && bulletPointsList.length > 0
      ? bulletPointsList
      : resumeText
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.startsWith('•') || l.startsWith('-') || l.length > 25);

  // 1. Weak Phrases Detection
  const weakPhrases: AtsWeakPhrase[] = [];
  WEAK_PHRASES.forEach(({ pattern, reason, suggestion }) => {
    const matches = resumeText.match(pattern);
    if (matches) {
      const uniqueMatched = Array.from(new Set(matches));
      uniqueMatched.forEach((phrase) => {
        weakPhrases.push({
          original: phrase,
          reason,
          suggestion,
        });
      });
    }
  });

  // 2. Action Verbs Detection
  const words = cleanResume.match(/[a-z-]+/g) || [];
  const actionVerbsFound = Array.from(new Set(words.filter((w) => ACTION_VERBS.has(w))));

  // 3. Metrics and Quantification
  const metricRegex =
    /(\b\d+([.,]\d+)?\s*(%|k|m|b|x|\+)?\b|\$\s*\d+([.,]\d+)?|\b\d+\s*(users|clients|engineers|team members|hours|days|weeks|percent|accuracy|samples|records|requests|stars)\b)/gi;
  let quantifiedBulletsCount = 0;
  let totalMetricsCount = 0;

  bullets.forEach((bullet) => {
    const matches = bullet.match(metricRegex);
    if (matches && matches.length > 0) {
      quantifiedBulletsCount++;
      totalMetricsCount += matches.length;
    }
  });

  const bulletCount = Math.max(bullets.length, 1);
  const quantifiedRatio = Math.round((quantifiedBulletsCount / bulletCount) * 100);

  // 4. Role Skill Matching (Core & Secondary Skills)
  const matchedRoleSkills: string[] = [];
  const missingRoleSkills: string[] = [];

  roleBenchmark.coreSkills.forEach((skill) => {
    if (textContainsSkill(cleanResume, skill)) {
      matchedRoleSkills.push(skill);
    } else {
      missingRoleSkills.push(skill);
    }
  });

  roleBenchmark.secondarySkills.forEach((skill) => {
    if (textContainsSkill(cleanResume, skill)) {
      if (!matchedRoleSkills.includes(skill)) {
        matchedRoleSkills.push(skill);
      }
    }
  });

  // 5. Job Description Keyword Matching
  let matchedKeywords: string[] = [];
  let missingKeywords: string[] = [];

  const effectiveJd =
    checkMode === 'custom-jd' && jobDescriptionText && jobDescriptionText.trim().length > 20
      ? jobDescriptionText
      : roleBenchmark.sampleJobDescription;

  const jdKeywords = extractKeywordsFromText(effectiveJd);
  const resumeKeywords = new Set(extractKeywordsFromText(resumeText));

  jdKeywords.forEach((kw) => {
    if (resumeKeywords.has(kw) || textContainsSkill(cleanResume, kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // 6. Dynamic Calibration by Experience Level (Fresher vs Mid vs Senior)
  const isFresher = experienceLevel === 'fresher';
  const isSenior = experienceLevel === 'senior';
  const categoryScores: AtsCategoryScore[] = [];

  // Core Role Match Percentage
  const coreTotal = roleBenchmark.coreSkills.length;
  const coreMatched = roleBenchmark.coreSkills.filter((s) => textContainsSkill(cleanResume, s)).length;
  const coreSkillScore = Math.min(100, Math.round((coreMatched / Math.max(coreTotal * 0.7, 1)) * 100));

  // Projects Detection
  const hasProjects =
    cleanResume.includes('project') ||
    cleanResume.includes('capstone') ||
    cleanResume.includes('github.com') ||
    cleanResume.includes('kaggle') ||
    cleanResume.includes('pipeline') ||
    cleanResume.includes('built');

  // Education Detection
  const hasEducation =
    cleanResume.includes('education') ||
    cleanResume.includes('degree') ||
    cleanResume.includes('university') ||
    cleanResume.includes('college') ||
    cleanResume.includes('bachelor') ||
    cleanResume.includes('master');

  // Work Experience Detection
  const hasWorkExperience =
    cleanResume.includes('experience') ||
    cleanResume.includes('employment') ||
    cleanResume.includes('worked at') ||
    cleanResume.includes('engineer at') ||
    cleanResume.includes('intern');

  if (isFresher) {
    // ---------------- FRESHER CALIBRATION ----------------
    // Category 1: Projects & Practical Implementation (Weight: 35%)
    let projectScore = 80;
    if (hasProjects) projectScore += 10;
    if (cleanResume.includes('github') || cleanResume.includes('kaggle')) projectScore += 10;
    if (bullets.length >= 4) projectScore += 5;
    if (quantifiedBulletsCount >= 2) projectScore += 5;
    projectScore = Math.min(100, projectScore);

    categoryScores.push({
      name: 'Projects & Practical Implementation',
      score: projectScore,
      weight: 35,
      feedback:
        projectScore >= 85
          ? `Exceptional project showcase for a ${roleBenchmark.title} fresher! Capstone projects and technical implementations carry heavy ATS weight.`
          : `Ensure you highlight end-to-end projects with public GitHub/Kaggle links and technologies used.`,
      status: projectScore >= 80 ? 'excellent' : projectScore >= 65 ? 'good' : 'warning',
    });

    // Category 2: Role Foundational Skills (Weight: 35%)
    categoryScores.push({
      name: `${roleBenchmark.title} Core Skills`,
      score: coreSkillScore,
      weight: 35,
      feedback:
        coreSkillScore >= 80
          ? `Matched ${coreMatched}/${coreTotal} non-negotiable core skills for ${roleBenchmark.title} (e.g. ${matchedRoleSkills.slice(0, 4).join(', ')}).`
          : `Missing key foundational skills: ${missingRoleSkills.slice(0, 4).join(', ')}. Include these in your Skills section or project descriptions.`,
      status: coreSkillScore >= 80 ? 'excellent' : coreSkillScore >= 60 ? 'good' : 'critical',
    });

    // Category 3: Action Verbs & Initiative (Weight: 15%)
    const verbCount = actionVerbsFound.length;
    const verbScore = Math.min(100, Math.round((verbCount / 6) * 100));
    categoryScores.push({
      name: 'Action Verbs & Proactivity',
      score: verbScore,
      weight: 15,
      feedback:
        verbCount >= 5
          ? `Detected ${verbCount} strong action verbs (${actionVerbsFound.slice(0, 3).join(', ')}). Demonstrates high builder initiative!`
          : `Only found ${verbCount} action verbs. Start project bullets with verbs like "Built", "Engineered", "Analyzed", or "Implemented".`,
      status: verbScore >= 75 ? 'excellent' : 'warning',
    });

    // Category 4: ATS Structure & Education (Weight: 15%) - NO WORK EXPERIENCE PENALTY
    let structScore = 100;
    if (!cleanResume.includes('@')) structScore -= 30;
    if (!hasEducation) structScore -= 30;
    if (resumeText.length < 250) structScore -= 20;

    categoryScores.push({
      name: 'Structure & Education (Fresher ATS)',
      score: Math.max(30, structScore),
      weight: 15,
      feedback:
        hasEducation
          ? 'Contact information, education, and credentials are well-structured without corporate experience penalty.'
          : 'Be sure your degree, university, graduation date, and email are clearly listed.',
      status: structScore >= 85 ? 'excellent' : 'warning',
    });
  } else if (isSenior) {
    // ---------------- SENIOR CALIBRATION ----------------
    // Category 1: Impact & Measurable Metrics (Weight: 30%)
    let metricScore = Math.min(100, Math.round(quantifiedRatio * 1.5));
    if (quantifiedRatio >= 50) metricScore = 95;
    else if (quantifiedRatio >= 35) metricScore = 80;
    else metricScore = 50;

    categoryScores.push({
      name: 'Executive Impact & ROI Metrics',
      score: metricScore,
      weight: 30,
      feedback:
        quantifiedRatio >= 45
          ? `${quantifiedRatio}% of bullets include quantified metrics (\$, %, scale). Senior roles require quantifiable business impact.`
          : `Senior recruiters look for quantified results (e.g. latency cut by 40%, \$1.2M saved, 10M requests/day). Only ${quantifiedRatio}% of bullets have numbers.`,
      status: metricScore >= 80 ? 'excellent' : 'warning',
    });

    // Category 2: Production Scale & Experience Depth (Weight: 25%)
    let expScore = hasWorkExperience ? 90 : 40;
    if (cleanResume.includes('architected') || cleanResume.includes('spearheaded') || cleanResume.includes('scaled')) {
      expScore = Math.min(100, expScore + 10);
    }
    categoryScores.push({
      name: 'Experience Depth & Architecture',
      score: expScore,
      weight: 25,
      feedback:
        expScore >= 85
          ? 'Strong demonstration of senior ownership, systems architecture, and production delivery.'
          : 'Highlight multi-year progression, architectural leadership, and cross-team execution.',
      status: expScore >= 80 ? 'excellent' : 'warning',
    });

    // Category 3: Advanced Tech Stack & MLOps/Cloud (Weight: 25%)
    categoryScores.push({
      name: `${roleBenchmark.title} Advanced Alignment`,
      score: coreSkillScore,
      weight: 25,
      feedback: `Matched ${matchedRoleSkills.length} key competencies for Senior ${roleBenchmark.title}.`,
      status: coreSkillScore >= 80 ? 'excellent' : 'good',
    });

    // Category 4: Leadership Verbs & Structure (Weight: 20%)
    const leadershipVerbs = actionVerbsFound.filter((v) =>
      ['architected', 'spearheaded', 'led', 'mentored', 'orchestrated', 'scaled', 'governed', 'drove'].includes(v)
    );
    const leadScore = Math.min(100, leadershipVerbs.length >= 3 ? 95 : leadershipVerbs.length >= 1 ? 80 : 55);
    categoryScores.push({
      name: 'Leadership & Strategic Tone',
      score: leadScore,
      weight: 20,
      feedback:
        leadershipVerbs.length >= 2
          ? `Detected senior leadership verbs (${leadershipVerbs.join(', ')}). Demonstrates high ownership.`
          : 'Incorporate leadership verbs such as "Architected", "Spearheaded", "Mentored", or "Scaled".',
      status: leadScore >= 80 ? 'excellent' : 'warning',
    });
  } else {
    // ---------------- MID-LEVEL CALIBRATION (2-4 yrs) ----------------
    let metricScore = Math.min(100, Math.round(quantifiedRatio * 1.3));
    if (quantifiedRatio >= 40) metricScore = 90;
    else if (quantifiedRatio >= 25) metricScore = 75;
    else metricScore = 55;

    categoryScores.push({
      name: 'Measurable Achievements',
      score: metricScore,
      weight: 25,
      feedback: `${quantifiedRatio}% of bullets include metrics or measurable outcomes.`,
      status: metricScore >= 80 ? 'excellent' : 'good',
    });

    categoryScores.push({
      name: `${roleBenchmark.title} Skills & Tools`,
      score: coreSkillScore,
      weight: 35,
      feedback: `Covering ${matchedRoleSkills.length} core & secondary skills for ${roleBenchmark.title}.`,
      status: coreSkillScore >= 80 ? 'excellent' : 'warning',
    });

    const verbScore = Math.min(100, Math.round((actionVerbsFound.length / 8) * 100));
    categoryScores.push({
      name: 'Action Verbs & Impact',
      score: Math.max(50, verbScore),
      weight: 20,
      feedback: `Found ${actionVerbsFound.length} strong action verbs across your achievements.`,
      status: verbScore >= 75 ? 'excellent' : 'good',
    });

    let structScore = 100;
    if (!cleanResume.includes('@')) structScore -= 25;
    if (!hasEducation) structScore -= 20;
    if (!hasWorkExperience) structScore -= 20;
    categoryScores.push({
      name: 'Structure & ATS Parsability',
      score: Math.max(40, structScore),
      weight: 20,
      feedback: 'Standard ATS-parseable sections and professional layout.',
      status: structScore >= 85 ? 'excellent' : 'warning',
    });
  }

  // Calculate Overall Weighted Score
  const weightedSum = categoryScores.reduce((acc, cat) => acc + cat.score * (cat.weight / 100), 0);
  const overallScore = Math.min(100, Math.max(20, Math.round(weightedSum)));

  // Generate Tailored Checklist
  const checklist: AtsChecklistCheck[] = [];
  if (isFresher) {
    checklist.push({
      label: 'End-to-End Technical Projects',
      passed: hasProjects,
      tip: hasProjects
        ? 'Projects section detected with concrete technical work.'
        : 'Add 2–3 capstone or academic projects with problem description and tech stack.',
    });
    checklist.push({
      label: 'GitHub / Kaggle / Portfolio Links',
      passed: cleanResume.includes('github') || cleanResume.includes('kaggle') || cleanResume.includes('http'),
      tip: 'Recruiters inspect code repositories to verify hands-on coding skills for freshers.',
    });
    checklist.push({
      label: `${roleBenchmark.title} Core Foundation`,
      passed: coreMatched >= Math.floor(coreTotal * 0.5),
      tip: `Include target role foundations: ${roleBenchmark.coreSkills.slice(0, 4).join(', ')}.`,
    });
    checklist.push({
      label: 'Education & Degree Verification',
      passed: hasEducation,
      tip: 'Ensure your degree, university, graduation year, and relevant coursework are listed.',
    });
    checklist.push({
      label: 'Quantified Model / Project Results',
      passed: quantifiedBulletsCount >= 1,
      tip: 'Even in projects, quantify metrics (e.g. 91% accuracy, 12,000 samples, 45ms inference).',
    });
  } else {
    checklist.push({
      label: 'Measurable Outcomes (XYZ Formula)',
      passed: quantifiedRatio >= 35,
      tip: 'Use: Accomplished [X], measured by [Y], by doing [Z].',
    });
    checklist.push({
      label: `${roleBenchmark.title} Keywords Coverage`,
      passed: coreMatched >= Math.floor(coreTotal * 0.6),
      tip: `Incorporate high-priority keywords: ${roleBenchmark.coreSkills.slice(0, 4).join(', ')}.`,
    });
    checklist.push({
      label: 'Work Experience Progression',
      passed: hasWorkExperience,
      tip: 'List chronological roles with company name, title, dates, and accomplishments.',
    });
    checklist.push({
      label: 'Strong Action Verbs (Zero Passive Voice)',
      passed: actionVerbsFound.length >= 6 && weakPhrases.length === 0,
      tip: 'Start every bullet with high-power action verbs.',
    });
    checklist.push({
      label: 'Clean ATS Contact & Formatting',
      passed: cleanResume.includes('@'),
      tip: 'Ensure standard fonts, clear headings, email, phone, and location.',
    });
  }

  // Recommendations Roadmap
  const recommendations: string[] = [];
  if (missingRoleSkills.length > 0) {
    recommendations.push(
      `Incorporate top missing skills for ${roleBenchmark.title}: ${missingRoleSkills.slice(0, 4).join(', ')}.`
    );
  }
  if (isFresher && !cleanResume.includes('github')) {
    recommendations.push(
      'Add your GitHub or Kaggle profile link near your contact info so recruiters can review your code.'
    );
  }
  if (quantifiedRatio < 40) {
    recommendations.push(
      'Boost quantification: add numbers (%, datasets size, speed, user count) to at least 40% of your bullets.'
    );
  }
  if (weakPhrases.length > 0) {
    recommendations.push(`Eliminate passive phrasing like "${weakPhrases[0].original}" to project confidence.`);
  }
  if (actionVerbsFound.length < 5) {
    recommendations.push(
      'Begin bullet points with decisive verbs like "Engineered", "Orchestrated", "Implemented", or "Optimized".'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      `Outstanding resume! Perfectly tailored for a ${experienceLevel} ${roleBenchmark.title} role with optimal ATS compliance.`
    );
  }

  return {
    overallScore,
    categoryScores,
    matchedKeywords,
    missingKeywords,
    weakPhrases,
    actionVerbsFound,
    metricsFoundCount: totalMetricsCount,
    bulletPointsCount: bulletCount,
    quantifiedRatio,
    recommendations,
    targetRole: roleBenchmark.id,
    experienceLevel,
    checkMode,
    roleBenchmark,
    matchedRoleSkills,
    missingRoleSkills,
    checklist,
  };
}
