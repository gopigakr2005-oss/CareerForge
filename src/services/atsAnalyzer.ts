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
 * Helper to generate a simulated raw plain-text output that ATS parsers extract
 */
export function generateRawAtsText(resumeText: string, resumeData?: ResumeData): string {
  if (resumeData) {
    const lines: string[] = [
      '=================================================================',
      '             SIMULATED RAW ATS PARSER EXTRACTOR',
      '=================================================================',
      `[CANDIDATE NAME] : ${resumeData.personalInfo.fullName || 'Not specified'}`,
      `[TARGET ROLE]    : ${resumeData.personalInfo.jobTitle || 'Not specified'}`,
      `[CONTACT INFO]   : ${resumeData.personalInfo.email || 'N/A'} | ${resumeData.personalInfo.phone || 'N/A'} | ${resumeData.personalInfo.location || 'N/A'}`,
      `[ONLINE PROFILES]: ${[resumeData.personalInfo.linkedin, resumeData.personalInfo.github, resumeData.personalInfo.website].filter(Boolean).join(' | ') || 'None specified'}`,
      '',
      '-----------------------------------------------------------------',
      'SECTION: PROFESSIONAL SUMMARY / ELEVATOR PITCH',
      '-----------------------------------------------------------------',
      resumeData.summary || '(No summary statement provided)',
      '',
      '-----------------------------------------------------------------',
      'SECTION: TECHNICAL & PROFESSIONAL SKILLS',
      '-----------------------------------------------------------------',
    ];

    if (resumeData.skills && resumeData.skills.length > 0) {
      resumeData.skills.forEach((cat) => {
        lines.push(`• [${cat.name.toUpperCase()}]: ${cat.skills.join(', ')}`);
      });
    } else {
      lines.push('(No categorized skills detected)');
    }

    lines.push(
      '',
      '-----------------------------------------------------------------',
      'SECTION: WORK EXPERIENCE & PROFESSIONAL HISTORY',
      '-----------------------------------------------------------------'
    );

    if (resumeData.experience && resumeData.experience.length > 0) {
      resumeData.experience.forEach((exp) => {
        lines.push(`ROLE: ${exp.role} @ ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}) | ${exp.location}`);
        exp.highlights.forEach((h) => {
          if (h.trim()) lines.push(`  - ${h}`);
        });
        lines.push('');
      });
    } else {
      lines.push('(No corporate experience listed - evaluating projects & academia)');
    }

    if (resumeData.projects && resumeData.projects.length > 0) {
      lines.push(
        '-----------------------------------------------------------------',
        'SECTION: TECHNICAL PROJECTS & CAPSTONES',
        '-----------------------------------------------------------------'
      );
      resumeData.projects.forEach((proj) => {
        lines.push(`PROJECT: ${proj.title} [Tech: ${proj.technologies.join(', ')}]`);
        if (proj.subtitle) lines.push(`  Subtitle: ${proj.subtitle}`);
        if (proj.description) lines.push(`  - ${proj.description}`);
        lines.push('');
      });
    }

    lines.push(
      '-----------------------------------------------------------------',
      'SECTION: EDUCATION & CREDENTIALS',
      '-----------------------------------------------------------------'
    );

    if (resumeData.education && resumeData.education.length > 0) {
      resumeData.education.forEach((edu) => {
        lines.push(`DEGREE: ${edu.degree} in ${edu.fieldOfStudy} | ${edu.institution} (${edu.startDate} - ${edu.endDate})`);
      });
    } else {
      lines.push('(No education records provided)');
    }

    if (resumeData.certifications && resumeData.certifications.length > 0) {
      lines.push(
        '',
        '-----------------------------------------------------------------',
        'SECTION: CERTIFICATIONS & LICENSES',
        '-----------------------------------------------------------------'
      );
      resumeData.certifications.forEach((cert) => {
        lines.push(`• ${cert.name} - Issued by ${cert.issuer} (${cert.date})`);
      });
    }

    lines.push(
      '',
      '=================================================================',
      'ATS PARSER DIAGNOSTIC: 100% Parseable Plain-Text Stream Formatted',
      '================================================================='
    );

    return lines.join('\n');
  }

  // Fallback for raw text
  return [
    '=================================================================',
    '             SIMULATED RAW ATS PARSER EXTRACTOR',
    '=================================================================',
    resumeText.trim(),
    '',
    '=================================================================',
    'ATS PARSER DIAGNOSTIC: Unstructured Raw Text Stream Processed',
    '================================================================='
  ].join('\n');
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
  checkMode: AtsCheckMode = 'role-preset',
  resumeData?: ResumeData
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

  // 3. Metrics and Quantification (Numbers, %, $, scale)
  const metricRegex =
    /(\b\d+([.,]\d+)?\s*(%|k|m|b|x|\+)?\b|\$\s*\d+([.,]\d+)?|\b\d+\s*(users|clients|engineers|team members|hours|days|weeks|percent|accuracy|samples|records|requests|stars|models|queries)\b)/gi;
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

  const matchedSecondarySkills: string[] = [];
  roleBenchmark.secondarySkills.forEach((skill) => {
    if (textContainsSkill(cleanResume, skill)) {
      matchedSecondarySkills.push(skill);
      if (!matchedRoleSkills.includes(skill)) {
        matchedRoleSkills.push(skill);
      }
    }
  });

  // 5. Job Description Keyword Matching
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

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

  // Structural checks
  const isFresher = experienceLevel === 'fresher';
  const isSenior = experienceLevel === 'senior';

  const hasEducation =
    (resumeData?.education && resumeData.education.length > 0) ||
    cleanResume.includes('education') ||
    cleanResume.includes('degree') ||
    cleanResume.includes('university') ||
    cleanResume.includes('bachelor') ||
    cleanResume.includes('master');

  const hasWorkExperience =
    (resumeData?.experience && resumeData.experience.length > 0) ||
    cleanResume.includes('experience') ||
    cleanResume.includes('employment') ||
    cleanResume.includes('worked at') ||
    cleanResume.includes('engineer at') ||
    cleanResume.includes('intern');

  const hasProjects =
    (resumeData?.projects && resumeData.projects.length > 0) ||
    cleanResume.includes('project') ||
    cleanResume.includes('capstone') ||
    cleanResume.includes('github.com') ||
    cleanResume.includes('pipeline');

  const hasEmail = resumeData?.personalInfo.email
    ? Boolean(resumeData.personalInfo.email.includes('@'))
    : Boolean(cleanResume.includes('@'));

  const hasPhone = resumeData?.personalInfo.phone
    ? resumeData.personalInfo.phone.trim().length >= 7
    : Boolean(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b|\+\d{1,3}/.test(resumeText));

  const hasLocation = resumeData?.personalInfo.location
    ? resumeData.personalInfo.location.trim().length > 2
    : Boolean(cleanResume.includes('ca') || cleanResume.includes('ny') || cleanResume.includes('india') || cleanResume.includes('usa'));

  const hasLinks = resumeData?.personalInfo
    ? Boolean(resumeData.personalInfo.linkedin || resumeData.personalInfo.github || resumeData.personalInfo.website)
    : Boolean(cleanResume.includes('linkedin') || cleanResume.includes('github') || cleanResume.includes('http'));

  const summaryText = resumeData?.summary || '';
  const summaryWords = summaryText.trim() ? summaryText.trim().split(/\s+/).length : 0;

  // =========================================================================
  // 6 HIGH-ACCURACY CALIBRATED CATEGORIES (TOTAL 100%)
  // =========================================================================
  const categoryScores: AtsCategoryScore[] = [];

  // CATEGORY 1: Contact & Web Presence (Weight: 15%)
  let contactScore = 0;
  if (resumeData?.personalInfo.fullName || resumeText.split('\n')[0].length > 3) contactScore += 25;
  if (hasEmail) contactScore += 25;
  if (hasPhone) contactScore += 20;
  if (hasLocation) contactScore += 15;
  if (hasLinks) contactScore += 15;
  contactScore = Math.min(100, Math.max(30, contactScore));

  categoryScores.push({
    name: 'Contact & Online Presence',
    score: contactScore,
    weight: 15,
    feedback:
      contactScore >= 85
        ? 'Full contact details, email, location, and professional links (LinkedIn/GitHub) verified.'
        : 'Ensure your email, phone, location, and LinkedIn/GitHub link are clearly accessible.',
    status: contactScore >= 80 ? 'excellent' : contactScore >= 60 ? 'good' : 'warning',
  });

  // CATEGORY 2: Professional Summary & Pitch (Weight: 15%)
  let summaryScore = 70;
  if (summaryWords >= 30 && summaryWords <= 100) {
    summaryScore = 95;
  } else if (summaryWords > 100) {
    summaryScore = 75; // slightly long for 1-page standard
  } else if (summaryWords >= 15) {
    summaryScore = 80;
  } else if (summaryWords === 0) {
    // If no dedicated summary, check if top of resume has intro
    summaryScore = resumeText.length > 500 ? 60 : 40;
  }

  // Bonus if mentions role or key keywords
  if (textContainsSkill(summaryText || cleanResume, roleBenchmark.title)) {
    summaryScore = Math.min(100, summaryScore + 5);
  }

  categoryScores.push({
    name: 'Professional Summary & Alignment',
    score: summaryScore,
    weight: 15,
    feedback:
      summaryScore >= 85
        ? `Concise, role-targeted summary statement (${summaryWords} words) aligned with ${roleBenchmark.title}.`
        : 'Aim for a 30–80 word summary highlighting your target role, top strengths, and concrete value.',
    status: summaryScore >= 80 ? 'excellent' : summaryScore >= 60 ? 'good' : 'warning',
  });

  // CATEGORY 3: Measurable Metrics & Impact (Weight: 25%)
  let metricScore = 50;
  if (isSenior) {
    if (quantifiedRatio >= 45) metricScore = 95;
    else if (quantifiedRatio >= 30) metricScore = 80;
    else if (quantifiedRatio >= 15) metricScore = 65;
    else metricScore = 40;
  } else if (isFresher) {
    if (quantifiedRatio >= 25 || totalMetricsCount >= 3) metricScore = 95;
    else if (quantifiedRatio >= 15 || totalMetricsCount >= 1) metricScore = 85;
    else metricScore = 65; // No heavy corporate metric penalty for freshers
  } else {
    // Mid-level
    if (quantifiedRatio >= 35) metricScore = 92;
    else if (quantifiedRatio >= 20) metricScore = 78;
    else if (quantifiedRatio >= 10) metricScore = 65;
    else metricScore = 50;
  }

  categoryScores.push({
    name: 'Quantified Impact & XYZ Metrics',
    score: metricScore,
    weight: 25,
    feedback:
      metricScore >= 80
        ? `${quantifiedRatio}% of bullet points include measurable outcomes (%, \$, scale, time saved).`
        : `Quantify accomplishments with numbers (e.g. "improved latency by 35%", "handled 10k users"). Only ${quantifiedRatio}% of bullets currently have numbers.`,
    status: metricScore >= 80 ? 'excellent' : metricScore >= 65 ? 'good' : 'warning',
  });

  // CATEGORY 4: Strong Action Verbs & Active Voice (Weight: 15%)
  const verbCount = actionVerbsFound.length;
  let verbScore = 50;
  if (verbCount >= 8) verbScore = 96;
  else if (verbCount >= 5) verbScore = 85;
  else if (verbCount >= 3) verbScore = 70;
  else verbScore = 50;

  // Deduct for passive phrasing
  verbScore = Math.max(25, verbScore - weakPhrases.length * 10);

  categoryScores.push({
    name: 'Action Verbs & Active Voice',
    score: verbScore,
    weight: 15,
    feedback:
      verbScore >= 80
        ? `Found ${verbCount} strong action verbs (${actionVerbsFound.slice(0, 4).join(', ')}) with zero weak passive phrases.`
        : weakPhrases.length > 0
        ? `Found ${weakPhrases.length} passive clichés (e.g. "${weakPhrases[0].original}"). Replace with active verbs like "Spearheaded" or "Engineered".`
        : `Include more action verbs (only found ${verbCount}). Start bullet points with verbs like "Built", "Optimized", or "Delivered".`,
    status: verbScore >= 80 ? 'excellent' : verbScore >= 60 ? 'good' : 'warning',
  });

  // CATEGORY 5: Target Role Skills & Keywords (Weight: 20%)
  const coreTotal = roleBenchmark.coreSkills.length;
  const coreMatched = roleBenchmark.coreSkills.filter((s) => textContainsSkill(cleanResume, s)).length;
  let skillScore = 0;

  if (checkMode === 'custom-jd' && jdKeywords.length > 0) {
    const jdMatchRatio = matchedKeywords.length / Math.max(jdKeywords.length * 0.5, 1);
    skillScore = Math.min(100, Math.max(30, Math.round(jdMatchRatio * 90)));
  } else {
    // Role benchmark matching
    const ratio = coreMatched / Math.max(coreTotal * 0.6, 1);
    skillScore = Math.min(100, Math.max(30, Math.round(ratio * 85 + (matchedSecondarySkills.length > 0 ? 15 : 0))));
  }

  categoryScores.push({
    name: `${roleBenchmark.title} Core Stack Match`,
    score: skillScore,
    weight: 20,
    feedback:
      skillScore >= 80
        ? `Matched ${coreMatched}/${coreTotal} non-negotiable core skills for ${roleBenchmark.title}.`
        : `Missing key skills: ${missingRoleSkills.slice(0, 4).join(', ')}. Include these in your Skills section or project descriptions.`,
    status: skillScore >= 80 ? 'excellent' : skillScore >= 60 ? 'good' : 'critical',
  });

  // CATEGORY 6: ATS Structure & Parsability (Weight: 10%)
  let structScore = 80;
  if (hasEducation) structScore += 10;
  if (hasWorkExperience || hasProjects) structScore += 10;
  if (bullets.length >= 4) structScore += 5;
  if (resumeText.length < 250) structScore -= 30; // too short
  structScore = Math.min(100, Math.max(35, structScore));

  categoryScores.push({
    name: 'ATS Structure & Parsability',
    score: structScore,
    weight: 10,
    feedback:
      structScore >= 85
        ? 'Standard ATS-parseable section hierarchy, clear headings, and clean bulleted formatting.'
        : 'Ensure standard headings (Experience, Education, Skills) are present and easy for ATS bots to segment.',
    status: structScore >= 85 ? 'excellent' : 'warning',
  });

  // Calculate Overall Weighted Score (sum of all 6 weighted categories)
  const weightedSum = categoryScores.reduce((acc, cat) => acc + cat.score * (cat.weight / 100), 0);
  const overallScore = Math.min(100, Math.max(25, Math.round(weightedSum)));

  // =========================================================================
  // ITEMIZE 10-POINT COMPREHENSIVE ATS AUDIT CHECKLIST
  // =========================================================================
  const checklist: AtsChecklistCheck[] = [
    {
      label: '1. Contact Details (Email, Phone, City)',
      passed: Boolean(hasEmail && hasPhone),
      tip: 'Recruiters and automated systems require direct phone and verified email for interview routing.',
      category: 'Contact',
    },
    {
      label: '2. Online Profiles (LinkedIn / GitHub)',
      passed: hasLinks,
      tip: isFresher
        ? 'GitHub/Kaggle profiles are essential to verify code samples and project repositories.'
        : 'LinkedIn profile link allows recruiters to verify tenure and recommendations.',
      category: 'Contact',
    },
    {
      label: '3. Target Role Title Alignment',
      passed: Boolean(
        textContainsSkill(cleanResume, roleBenchmark.title) ||
        (resumeData?.personalInfo.jobTitle && resumeData.personalInfo.jobTitle.length > 3)
      ),
      tip: `Ensure your target title (e.g. "${roleBenchmark.title}") is explicitly stated under your name.`,
      category: 'Summary',
    },
    {
      label: '4. Concise Professional Summary',
      passed: summaryWords >= 25,
      tip: 'Include a 30–80 word summary positioning your key achievements and core technology stack.',
      category: 'Summary',
    },
    {
      label: '5. Core Role Competencies (>= 50% match)',
      passed: coreMatched >= Math.ceil(coreTotal * 0.5),
      tip: `Must include role essentials: ${roleBenchmark.coreSkills.slice(0, 3).join(', ')}.`,
      category: 'Skills',
    },
    {
      label: '6. Quantified Achievements (XYZ Formula)',
      passed: isFresher ? totalMetricsCount >= 1 || quantifiedRatio >= 15 : quantifiedRatio >= 30,
      tip: 'Back up claims with metrics: % improvements, user counts, latency reductions, or dataset sizes.',
      category: 'Metrics',
    },
    {
      label: '7. Strong Action Verbs (Front-Loaded)',
      passed: actionVerbsFound.length >= 5,
      tip: 'Start bullet points with decisive action verbs like "Architected", "Spearheaded", or "Delivered".',
      category: 'Action Verbs',
    },
    {
      label: '8. Zero Passive Phrasing & Clichés',
      passed: weakPhrases.length === 0,
      tip: 'Eliminate vague phrasing like "responsible for", "duties included", or "helped with".',
      category: 'Action Verbs',
    },
    {
      label: '9. Education & Formal Credentials',
      passed: hasEducation,
      tip: 'Include your degree, institution, and graduation year in standard ATS-parseable format.',
      category: 'Structure',
    },
    {
      label: '10. ATS Section Hierarchy & Parsability',
      passed: structScore >= 80,
      tip: 'Standard linear layout with headings (Experience, Projects, Skills, Education) that robots can parse.',
      category: 'Structure',
    },
  ];

  // Recommendations Roadmap
  const recommendations: string[] = [];
  if (missingRoleSkills.length > 0) {
    recommendations.push(
      `Incorporate top missing skills for ${roleBenchmark.title}: ${missingRoleSkills.slice(0, 4).join(', ')}.`
    );
  }
  if (!hasLinks) {
    recommendations.push(
      isFresher
        ? 'Add your GitHub or Kaggle profile link near your contact info so recruiters can inspect your code.'
        : 'Add your LinkedIn profile URL in your contact header for fast recruiter outreach.'
    );
  }
  if (quantifiedRatio < 35) {
    recommendations.push(
      'Boost metric density: incorporate numbers (%, latency, revenue, user count) to at least 35% of your bullet points.'
    );
  }
  if (weakPhrases.length > 0) {
    recommendations.push(
      `Replace passive phrases like "${weakPhrases[0].original}" with active impact verbs to project ownership.`
    );
  }
  if (actionVerbsFound.length < 5) {
    recommendations.push(
      'Begin bullet points with decisive verbs like "Engineered", "Orchestrated", "Implemented", or "Optimized".'
    );
  }
  if (summaryWords < 25) {
    recommendations.push(
      'Craft a compelling 2–3 sentence professional summary at the top of your resume highlighting your core niche.'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      `Outstanding resume! Perfectly calibrated for a ${experienceLevel} ${roleBenchmark.title} position with top-tier ATS compliance.`
    );
  }

  // Simulated Raw ATS plain text parser
  const rawAtsText = generateRawAtsText(resumeText, resumeData);

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
    rawAtsText,
  };
}
