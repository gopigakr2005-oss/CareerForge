import type { ResumeData, MockInterviewQuestion } from '../types/resume';

const STORAGE_KEY = 'RESUMAI_GEMINI_API_KEY';

export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

export function saveStoredApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Invokes Gemini REST API directly with prompt
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API key provided');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `Gemini API request failed with HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  return text.trim();
}

/**
 * AI Bullet Point Enhancer
 * Takes a plain resume bullet and converts it to a high-impact, XYZ-format bullet.
 */
export async function enhanceBulletPoint(
  originalBullet: string,
  role?: string
): Promise<{ enhanced: string; alternatives: string[]; explanation: string }> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const prompt = `
You are an expert Executive Resume Coach and ATS Specialist.
Rewrite the following resume bullet point for a "${role || 'Professional'}" role.
Follow Google's XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
Start with a strong action verb (e.g., Spearheaded, Architected, Accelerated, Reduced).
Include realistic placeholders for metrics like [X%], [\$Y], or [Z users] if none were provided.

Original Bullet:
"${originalBullet}"

Format your response strictly as JSON with the following structure:
{
  "enhanced": "Best single enhanced bullet point",
  "alternatives": ["Alternative variation 1", "Alternative variation 2"],
  "explanation": "Brief 1-sentence note explaining what was improved"
}
Output only valid JSON, without markdown formatting or code blocks.`;

      const responseText = await callGemini(prompt, 'You are an expert career and resume coaching AI. Respond only in clean JSON.');
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        enhanced: parsed.enhanced || originalBullet,
        alternatives: parsed.alternatives || [],
        explanation: parsed.explanation || 'Enhanced using Google XYZ formula and action verbs.',
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local enhancer:', err);
    }
  }

  // Heuristic Smart Fallback (No API key needed!)
  const trimmed = originalBullet.trim().replace(/^[-•*]\s*/, '');
  let enhanced = trimmed;

  const actionVerbStarters = ['Spearheaded the development of', 'Architected and optimized', 'Engineered and scaled', 'Accelerated delivery of', 'Orchestrated the deployment of'];
  const randomStarter = actionVerbStarters[Math.floor(Math.random() * actionVerbStarters.length)];

  // Clean weak starters
  if (/^(responsible for|worked on|helped with|assisted in|handled)\s+/i.test(enhanced)) {
    enhanced = enhanced.replace(/^(responsible for|worked on|helped with|assisted in|handled)\s+/i, `${randomStarter} `);
  } else if (!/^[A-Z][a-z]+ed\b/.test(enhanced)) {
    enhanced = `${randomStarter} ${enhanced.charAt(0).toLowerCase() + enhanced.slice(1)}`;
  }

  // Add impact metric if none exists
  if (!/\b(\d+%|\$\d+|\d+x|\d+\s*(users|clients|hours))\b/i.test(enhanced)) {
    enhanced += ', resulting in a 35% improvement in operational efficiency and reduced turnaround time';
  }

  return {
    enhanced,
    alternatives: [
      `Streamlined ${trimmed.toLowerCase()}, driving a 28% increase in productivity across cross-functional teams.`,
      `Executed end-to-end delivery of ${trimmed.toLowerCase()}, cutting overhead costs by 20% and improving reliability.`,
    ],
    explanation: 'Upgraded with strong action verbs and quantified impact metrics (Local Heuristic Mode).',
  };
}

/**
 * AI Professional Summary Generator
 */
export async function generateSummary(
  fullName: string,
  jobTitle: string,
  yearsOfExperience: string,
  topSkills: string[]
): Promise<string> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const prompt = `
Generate a powerful, ATS-optimized 3-sentence professional summary for a resume.
Candidate Name: ${fullName || 'Candidate'}
Target Role: ${jobTitle || 'Professional'}
Experience: ${yearsOfExperience || '5+ years'}
Key Skills: ${topSkills.join(', ') || 'Software Engineering, Strategy, Collaboration'}

Guidelines:
1. First sentence: Clear value proposition and experience level.
2. Second sentence: Key achievements, quantified results, and core technologies/competencies.
3. Third sentence: What they bring to prospective teams or organizations.
Return only the text of the summary without quotation marks.`;

      return await callGemini(prompt, 'You are an executive resume writer. Produce crisp, high-impact resume summaries.');
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local generator:', err);
    }
  }

  // Smart Heuristic Fallback
  const skillsList = topSkills.length > 0 ? topSkills.slice(0, 4).join(', ') : 'modern industry practices and team leadership';
  return `Results-driven ${jobTitle || 'Professional'} with ${yearsOfExperience || '5+ years'} of experience delivering high-impact solutions in dynamic environments. Proven track record in ${skillsList}, with a strong focus on driving measurable business growth and engineering excellence. Dedicated to building scalable, user-centric systems and collaborating across cross-functional teams.`;
}

/**
 * AI Skills Suggester
 */
export async function suggestSkillsForRole(jobTitle: string, currentSkills: string[]): Promise<string[]> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const prompt = `
List 8 highly sought-after industry skills (technical and domain-specific) for a "${jobTitle}" role that are not in this list: ${currentSkills.join(', ')}.
Return strictly a JSON array of strings: ["Skill 1", "Skill 2", ...] without markdown.`;

      const text = await callGemini(prompt);
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const skills = JSON.parse(cleaned);
      if (Array.isArray(skills)) return skills;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local suggestions:', err);
    }
  }

  // Local fallback dictionary
  const roleLower = jobTitle.toLowerCase();
  let defaultSuggestions = ['Problem Solving', 'Agile Methodologies', 'Cross-Functional Leadership', 'CI/CD Pipelines'];

  if (roleLower.includes('frontend') || roleLower.includes('web') || roleLower.includes('ui')) {
    defaultSuggestions = ['TypeScript', 'React.js', 'Next.js', 'Tailwind CSS', 'Web Performance', 'GraphQL', 'Jest', 'Accessibility (a11y)'];
  } else if (roleLower.includes('backend') || roleLower.includes('cloud') || roleLower.includes('software')) {
    defaultSuggestions = ['Node.js', 'PostgreSQL', 'Docker', 'AWS (Lambda/ECS)', 'Redis', 'Microservices', 'GraphQL', 'System Design'];
  } else if (roleLower.includes('data') || roleLower.includes('ml') || roleLower.includes('machine learning')) {
    defaultSuggestions = ['Python', 'SQL', 'Pandas & NumPy', 'PyTorch', 'Data Modeling', 'Tableau', 'BigQuery', 'Feature Engineering'];
  } else if (roleLower.includes('product') || roleLower.includes('manager')) {
    defaultSuggestions = ['Product Discovery', 'Roadmapping', 'A/B Testing', 'Amplitude', 'User Interviews', 'OKRs', 'Go-to-Market', 'SQL'];
  }

  const currentSet = new Set(currentSkills.map((s) => s.toLowerCase()));
  return defaultSuggestions.filter((s) => !currentSet.has(s.toLowerCase()));
}

/**
 * AI Bullet Point Rewriter with multiple transformation modes
 */
export async function rewriteBulletPointMode(
  bullet: string,
  mode: 'improve' | 'rewrite' | 'concise' | 'professional' | 'metrics' | 'generate',
  roleContext?: string,
  userSuppliedMetrics?: string
): Promise<{ result: string; alternatives: string[]; explanation: string }> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const modeInstructions: Record<string, string> = {
        improve: 'Improve overall clarity, grammar, and impact while preserving exact facts.',
        rewrite: 'Completely rewrite the sentence structure using strong action verbs and fresh phrasing.',
        concise: 'Make it as concise and direct as possible without losing critical context or achievements.',
        professional: 'Elevate the vocabulary and tone to executive-level professional English.',
        metrics: userSuppliedMetrics
          ? `Incorporate the following user-provided metrics without fabricating extra numbers: "${userSuppliedMetrics}".`
          : 'Refine metrics phrasing without inventing fake data or ungrounded numbers.',
        generate: 'Transform this raw informal project or task description into high-caliber resume bullet points.',
      };

      const prompt = `
You are CareerForge AI, a top-tier Career Coach and Resume Strategist with strict Anti-Fabrication rules.
Transform this resume input for a "${roleContext || 'Professional'}" role.
Mode: ${mode.toUpperCase()}
Instruction: ${modeInstructions[mode]}
Raw input: "${bullet}"

Anti-Fabrication Rule: Do NOT invent metrics, companies, or results that were not in the input. If no numbers were given, focus on scope, technical complexity, and methodologies.

Return strictly a JSON object:
{
  "result": "Primary best version",
  "alternatives": ["Alternative variation 1", "Alternative variation 2"],
  "explanation": "Brief explanation of how the bullet was enhanced"
}
Output only valid JSON without markdown.`;

      const text = await callGemini(prompt, 'You are an expert resume coach. Output strictly valid JSON.');
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        result: parsed.result || bullet,
        alternatives: parsed.alternatives || [],
        explanation: parsed.explanation || 'Refined using AI resume optimization.',
      };
    } catch (e) {
      console.warn('Gemini rewrite failed, using heuristic engine:', e);
    }
  }

  // Smart Heuristic Engine
  const trimmed = bullet.trim().replace(/^[-•*]\s*/, '');
  let result = trimmed;
  let explanation = 'Enhanced using CareerForge AI heuristics.';
  const alternatives: string[] = [];

  if (mode === 'concise') {
    result = result.replace(/\b(in order to|with the intention of|responsible for managing|successfully)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
    explanation = 'Removed filler words and passive phrasing for maximum conciseness.';
    alternatives.push(result.split(',')[0]);
  } else if (mode === 'professional') {
    result = result.replace(/\bmade\b/gi, 'Architected')
      .replace(/\bbuilt\b/gi, 'Engineered')
      .replace(/\bworked on\b/gi, 'Collaborated on the development of')
      .replace(/\bhelped\b/gi, 'Facilitated')
      .replace(/\bchanged\b/gi, 'Modernized');
    explanation = 'Elevated action verbs to industry-standard professional terminology.';
    alternatives.push(`Spearheaded implementation of ${trimmed.toLowerCase()}.`);
  } else if (mode === 'metrics' && userSuppliedMetrics) {
    result = `${trimmed}, achieving ${userSuppliedMetrics}.`;
    explanation = 'Seamlessly integrated user-verified metrics.';
    alternatives.push(`Drove ${userSuppliedMetrics} by delivering ${trimmed.toLowerCase()}.`);
  } else if (mode === 'generate') {
    result = `Engineered and deployed ${trimmed.toLowerCase()}, ensuring robust architecture and seamless user experience.`;
    explanation = 'Transformed raw note into structured engineering bullet point.';
    alternatives.push(`Delivered end-to-end implementation of ${trimmed.toLowerCase()} aligned with performance goals.`);
  } else {
    // Default Improve / Rewrite
    const starters = ['Spearheaded the development of', 'Architected and optimized', 'Engineered and scaled', 'Orchestrated the delivery of'];
    const starter = starters[Math.floor(Math.random() * starters.length)];
    result = `${starter} ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}`;
    explanation = 'Upgraded with strong action verbs and professional cadence.';
    alternatives.push(`Accelerated progress on ${trimmed.toLowerCase()} across agile sprints.`);
  }

  return { result, alternatives, explanation };
}

/**
 * STAR Framework Bullet Point Generator
 * Situation -> Task -> Action -> Result
 */
export function generateStarBulletLocal(params: {
  situation: string;
  task: string;
  action: string;
  result: string;
  technology?: string;
}): string {
  const { situation, task, action, result, technology } = params;
  const techClause = technology ? ` utilizing ${technology}` : '';
  if (result) {
    return `${action.trim()}${techClause} to address ${task.trim()} during ${situation.trim()}, resulting in ${result.trim()}.`;
  }
  return `${action.trim()}${techClause} to resolve ${task.trim()} within ${situation.trim()}, ensuring optimal delivery and quality.`;
}

/**
 * Job Description Skill & Requirement Extractor
 */
export async function analyzeJobDescription(jdText: string): Promise<{
  roleTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequired: string;
  responsibilities: string[];
  keywords: string[];
}> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const prompt = `
Analyze the following Job Description. Extract:
1. roleTitle (string)
2. requiredSkills (string array of must-have technical/domain skills)
3. preferredSkills (string array of nice-to-have skills)
4. experienceRequired (string e.g. "3-5 years")
5. responsibilities (string array of top 3-5 core duties)
6. keywords (string array of high-priority ATS keywords)

Job Description:
"""${jdText}"""

Return strictly a JSON object conforming to this schema without markdown:
{
  "roleTitle": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "experienceRequired": "",
  "responsibilities": [],
  "keywords": []
}`;
      const text = await callGemini(prompt);
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Gemini JD analysis failed, using heuristic parser:', e);
    }
  }

  // Local Heuristic Parser
  const lines = jdText.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || 'Software Professional';
  const roleTitle = firstLine.replace(/^(job title|role|position):/i, '').trim();

  const commonKeywords = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'AWS', 'Docker',
    'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs', 'CI/CD',
    'Git', 'Tailwind CSS', 'SQL', 'Agile', 'Scrum', 'Microservices', 'System Design'
  ];

  const foundKeywords = commonKeywords.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, 'i').test(jdText)
  );

  return {
    roleTitle,
    requiredSkills: foundKeywords.slice(0, 8),
    preferredSkills: foundKeywords.slice(8, 14),
    experienceRequired: jdText.match(/\b(\d+[-+]\s*(?:years|yrs))\b/i)?.[1] || '3+ years',
    responsibilities: [
      'Architect and build resilient software applications and microservices.',
      'Collaborate with cross-functional product and engineering teams.',
      'Optimize performance, security, and scalability across the stack.',
    ],
    keywords: foundKeywords,
  };
}

/**
 * 4-Week Skill Gap Learning Roadmap Generator
 */
export function generateSkillGapRoadmap(
  missingSkills: string[],
  targetRole: string
): {
  week: number;
  title: string;
  focusSkill: string;
  topics: string[];
  suggestedProject: string;
  estimatedHours: number;
}[] {
  const skillsToMap = missingSkills.length > 0 ? missingSkills : ['System Design', 'Cloud Architecture', 'Advanced SQL', 'CI/CD Automation'];

  return [
    {
      week: 1,
      title: 'Foundations & Core Mechanics',
      focusSkill: skillsToMap[0] || 'Core Skill',
      topics: ['Fundamentals & syntax', 'Standard libraries and best practices', 'Hands-on basic exercises'],
      suggestedProject: `Build a starter prototype demonstrating ${skillsToMap[0] || 'core concepts'}`,
      estimatedHours: 10,
    },
    {
      week: 2,
      title: 'Intermediate Integration & Tooling',
      focusSkill: skillsToMap[1] || 'Integration Tools',
      topics: ['Connecting with databases and APIs', 'Error handling & edge cases', 'Unit test coverage'],
      suggestedProject: `Integrate ${skillsToMap[1] || 'tool'} into an existing project with automated tests`,
      estimatedHours: 12,
    },
    {
      week: 3,
      title: 'Advanced Architecture & Performance',
      focusSkill: skillsToMap[2] || 'System Scaling',
      topics: ['Concurrency & caching patterns', 'Benchmarking and profiling', 'Production security checks'],
      suggestedProject: `Benchmark and optimize ${skillsToMap[2] || 'service'} under simulated high traffic`,
      estimatedHours: 14,
    },
    {
      week: 4,
      title: 'End-to-End Capstone & Interview Readiness',
      focusSkill: skillsToMap[3] || 'Capstone Application',
      topics: ['End-to-end deployment to cloud', 'Architectural diagrams and documentation', 'Mock technical interview questions'],
      suggestedProject: `Full portfolio showcase project tailored for ${targetRole || 'target roles'}`,
      estimatedHours: 15,
    },
  ];
}

/**
 * Interview Preparation Question Bank Generator
 */
export async function generateInterviewQuestionsAI(
  role: string,
  skills: string[],
  projects: string[],
  jd?: string
): Promise<{
  id: string;
  category: 'hr' | 'technical' | 'project' | 'job-specific';
  question: string;
  sampleAnswer: string;
}[]> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const prompt = `
Generate 6 realistic interview questions for a candidate applying for "${role}".
Key Skills: ${skills.slice(0, 6).join(', ')}
Key Projects: ${projects.slice(0, 3).join(', ')}
${jd ? `Job Description snippet: ${jd.slice(0, 400)}` : ''}

Include:
- 1 HR / Behavioral question
- 2 Technical questions tailored to the skills
- 2 Project-deep dive questions based on their projects
- 1 Job-specific scenario question

Format strictly as JSON array of objects:
[
  {
    "id": "q1",
    "category": "hr",
    "question": "Question text",
    "sampleAnswer": "Comprehensive model answer using STAR method"
  }
]
No markdown codeblocks.`;
      const res = await callGemini(prompt);
      const cleaned = res.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Gemini interview generation failed, using fallback bank:', e);
    }
  }

  // High quality realistic local questions
  const topSkill = skills[0] || 'TypeScript';
  const topProject = projects[0] || 'Distributed Cloud Platform';

  return [
    {
      id: 'q-hr-1',
      category: 'hr',
      question: 'Tell me about a time you had a technical disagreement with a team member and how you resolved it.',
      sampleAnswer: 'In my previous project, a teammate wanted to use MongoDB while I advocated for PostgreSQL due to strict relational integrity requirements. Instead of debating, I built a quick prototype demonstrating transaction rollbacks and query performance. We evaluated it together against our data schema, agreed on Postgres, and delivered on time without data anomalies.',
    },
    {
      id: 'q-tech-1',
      category: 'technical',
      question: `How do you handle memory management and race conditions when scaling ${topSkill} applications under heavy concurrent load?`,
      sampleAnswer: `When scaling ${topSkill}, I prevent race conditions by implementing distributed locking (e.g. via Redis Redlock) or database-level optimistic concurrency with version stamps. For memory leaks, I profile heap allocations using Chrome DevTools or pprof, monitor garbage collection pause times, and ensure unclosed connections or event listeners are cleaned up properly.`,
    },
    {
      id: 'q-tech-2',
      category: 'technical',
      question: 'Explain how you design an idempotent RESTful API for payment or mission-critical transactions.',
      sampleAnswer: 'I mandate unique Idempotency-Keys in the request header generated by the client. The server checks the key in an atomic cache (like Redis with a TTL). If currently processing, it returns a 409 Conflict. If already completed, it returns the cached result. If new, it executes the operation inside a database transaction and stores the response.',
    },
    {
      id: 'q-proj-1',
      category: 'project',
      question: `In your project "${topProject}", what was the most difficult architectural bottleneck you encountered, and how did you resolve it?`,
      sampleAnswer: `The biggest challenge in "${topProject}" was high p99 latency during database write spikes. We addressed this by decoupling ingestion from persistence using an event queue (Kafka/RabbitMQ) and worker pools. This flattened traffic spikes and dropped our p99 latency by over 40%.`,
    },
    {
      id: 'q-proj-2',
      category: 'project',
      question: `If you were to rewrite "${topProject}" today from scratch, what architectural decision would you make differently?`,
      sampleAnswer: 'I would introduce structured distributed tracing and OpenTelemetry from day one rather than retrofitting it later. Having unified traces across all services earlier would have saved countless hours during debugging integration bottlenecks.',
    },
    {
      id: 'q-job-1',
      category: 'job-specific',
      question: `Why are you particularly interested in this ${role} role, and how will your background accelerate our team goals?`,
      sampleAnswer: `This role directly aligns with my passion for building resilient, high-throughput systems. Having already worked hands-on with ${skills.slice(0, 3).join(' and ')}, I can immediately contribute to your engineering roadmap without a lengthy ramp-up period, while upholding strong code quality and testing standards.`,
    },
  ];
}

/**
 * AI Mock Interview Answer Evaluator
 */
export async function evaluateInterviewAnswerAI(
  question: string,
  userAnswer: string,
  category: string
): Promise<{
  score: number;
  relevance: number;
  clarity: number;
  confidence: number;
  technical: number;
  communication: number;
  tips: string[];
}> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const prompt = `
You are an expert technical interviewer and hiring manager.
Question: "${question}"
Category: "${category}"
Candidate's Answer: "${userAnswer}"

Evaluate the answer and provide:
- score (overall 0-100)
- relevance (0-100)
- clarity (0-100)
- confidence (0-100)
- technical (0-100)
- communication (0-100)
- tips (array of 2-3 specific actionable feedback points)

Format strictly as JSON without markdown.`;
      const res = await callGemini(prompt);
      const cleaned = res.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Gemini answer evaluation failed, using heuristic grader:', e);
    }
  }

  // Local Evaluator Heuristics
  const wordCount = userAnswer.trim().split(/\s+/).length;
  const hasStarStructure = /situation|task|action|result|because|when|implemented|led|optimized/i.test(userAnswer);
  const hasMetrics = /\d+|%|\$|speed|improved|reduced/i.test(userAnswer);

  let score = 70;
  if (wordCount >= 40) score += 10;
  if (hasStarStructure) score += 10;
  if (hasMetrics) score += 8;
  score = Math.min(95, Math.max(45, score));

  const tips: string[] = [];
  if (wordCount < 30) {
    tips.push('Expand your answer with more concrete context. Aim for 2-3 minutes of detailed storytelling.');
  } else {
    tips.push('Good explanation depth. Make sure to clearly separate the Action you took from team-wide effort.');
  }

  if (!hasMetrics) {
    tips.push('Quantify the outcome: mention the percentage performance gain, time saved, or user impact.');
  } else {
    tips.push('Great use of measurable impact in your narrative.');
  }

  return {
    score,
    relevance: Math.min(100, score + 4),
    clarity: Math.min(100, score - 2),
    confidence: Math.min(100, score + 1),
    technical: Math.min(100, score + 3),
    communication: Math.min(100, score),
    tips,
  };
}

/**
 * AI "Tell Me About Yourself" Pitch Generator (30s, 60s, 90s)
 */
export function generateTellMeAboutYourself(
  name: string,
  title: string,
  experienceYears: string,
  topSkills: string[],
  topAchievement: string
): {
  thirtySeconds: string;
  sixtySeconds: string;
  ninetySeconds: string;
} {
  const candidateName = name || 'I';
  const role = title || 'Software Engineer';
  const skills = topSkills.slice(0, 3).join(', ') || 'modern engineering and problem solving';
  const feat = topAchievement || 'driving scalable architecture and reducing latency by 40%';

  return {
    thirtySeconds: `Hi, I'm ${candidateName}, a ${role} with ${experienceYears} of experience specializing in ${skills}. I'm known for ${feat}. I'm excited about this opportunity because it allows me to bring my hands-on technical ownership to scale your core platform.`,
    sixtySeconds: `Hello! I'm ${candidateName}, and I've spent the past ${experienceYears} building high-performance systems as a ${role}. My core technical toolkit revolves around ${skills}. In my previous work, I spearheaded ${feat}, collaborating closely with cross-functional product and engineering teams. What drives me most is solving complex bottlenecks and translating business goals into robust software. I've been following your company's growth, and I'm eager to contribute to your upcoming architecture initiatives.`,
    ninetySeconds: `Hi everyone, I'm ${candidateName}. Over the past ${experienceYears}, I've developed my career as a ${role}, focusing primarily on ${skills}. Early in my career, I focused on mastering clean code, automated testing, and scalable backend services. In my most recent role, I had the opportunity to lead initiatives like ${feat}, where I owned the technical architecture from discovery to production deployment with 99.9% uptime. Beyond writing code, I love mentoring teammates, establishing CI/CD best practices, and working with product partners to ensure we build what users truly need. I'm looking for my next challenge where I can tackle complex distributed problems, and that's exactly what drew me to your team today.`,
  };
}

/**
 * Cover Letter Generator
 */
export async function generateCoverLetterAI(params: {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  companyName: string;
  recipientName?: string;
  tone: 'formal' | 'friendly' | 'concise' | 'professional';
  skills: string[];
  summary: string;
}): Promise<string> {
  const { candidateName, jobTitle, companyName, recipientName, tone, skills } = params;
  const salutation = recipientName ? `Dear ${recipientName},` : `Dear Hiring Team at ${companyName},`;

  if (tone === 'concise') {
    return `${salutation}

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}. 

With a proven background in ${skills.slice(0, 4).join(', ')}, I specialize in architecting resilient solutions and delivering measurable business outcomes. My experience aligns directly with the requirements for this role, and I am confident in my ability to make an immediate impact on your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my skill set can support ${companyName}'s goals.

Sincerely,
${candidateName}`;
  }

  if (tone === 'friendly') {
    return `${salutation}

I was thrilled to see the opening for the ${jobTitle} role at ${companyName}! Having followed your company's exciting momentum and engineering culture, I would love the chance to bring my passion and experience to the team.

Throughout my career, I have dedicated myself to mastering ${skills.slice(0, 4).join(', ')}. What excites me most about ${companyName} is your dedication to building innovative, user-first products. I thrive in collaborative environments where I can build clean software, learn continuously, and support my teammates.

I would love to connect and chat about how we can work together to build great things at ${companyName}.

Warm regards,
${candidateName}`;
  }

  // Formal / Professional default
  return `${salutation}

Please accept this letter as an expression of my strong interest in the ${jobTitle} position currently open at ${companyName}. With a dedicated track record in ${skills.slice(0, 4).join(', ')}, I am eager to leverage my technical capabilities to drive continued success for your organization.

Throughout my tenure, I have focused on solving high-complexity problems, architecting robust systems, and collaborating cross-functionally to achieve measurable results. I pride myself on maintaining high standards of software quality, data integrity, and operational excellence. 

${companyName}'s reputation for innovation and market leadership makes this opportunity particularly compelling. I am confident that my technical proficiency and disciplined work ethic will make me a valuable addition to your engineering group.

Thank you for your consideration. I look forward to the opportunity to speak with you regarding how my qualifications align with your objectives.

Sincerely,
${candidateName}`;
}

/**
 * "Why Am I Not Getting Interviews?" Diagnostic Engine
 */
export function diagnoseResumeIssues(
  resumeText: string,
  hasMetrics: boolean,
  metricCount: number,
  bulletCount: number,
  missingSkillsCount: number
): {
  overallScore: number;
  findings: {
    category: string;
    severity: 'critical' | 'warning' | 'tip';
    problem: string;
    whyItMatters: string;
    howToFix: string;
  }[];
} {
  const findings: {
    category: string;
    severity: 'critical' | 'warning' | 'tip';
    problem: string;
    whyItMatters: string;
    howToFix: string;
  }[] = [];

  let overallScore = 85;

  // 1. Metrics check
  const metricRatio = bulletCount > 0 ? (metricCount / bulletCount) : 0;
  if (!hasMetrics || metricRatio < 0.3) {
    overallScore -= 20;
    findings.push({
      category: 'Quantified Impact',
      severity: 'critical',
      problem: 'Only a small percentage of your bullet points contain measurable results (% numbers, dollar values, or user counts).',
      whyItMatters: 'Recruiters and hiring managers spend an average of 6 seconds per resume. Resumes without numbers read like job duty lists rather than proven achievements.',
      howToFix: 'Use the CareerForge Quantification Assistant to add metrics (e.g. "Reduced query latency by 35%" or "Served 50K+ daily active users").',
    });
  }

  // 2. Action verbs check
  if (/responsible for|worked on|helped with/i.test(resumeText)) {
    overallScore -= 15;
    findings.push({
      category: 'Action Verbs & Ownership',
      severity: 'critical',
      problem: 'Passive phrasing detected ("worked on", "responsible for", "helped with").',
      whyItMatters: 'Passive phrases minimize your personal contribution and make it ambiguous whether you led the project or were merely a bystander.',
      howToFix: 'Replace with decisive verbs like "Architected", "Spearheaded", "Engineered", or "Automated".',
    });
  }

  // 3. ATS Keywords match
  if (missingSkillsCount > 3) {
    overallScore -= 15;
    findings.push({
      category: 'ATS Keyword Density',
      severity: 'warning',
      problem: `${missingSkillsCount} critical industry keywords for your target role appear to be missing.`,
      whyItMatters: 'Automated ATS filters screen out resumes that do not meet keyword thresholds before human recruiters ever see them.',
      howToFix: 'Review the Job Matcher and legitimately weave relevant missing skills into your Skills and Experience sections.',
    });
  }

  // 4. Summary targeting
  if (resumeText.length < 500) {
    overallScore -= 15;
    findings.push({
      category: 'Resume Substance',
      severity: 'warning',
      problem: 'The resume content is relatively brief and may not provide enough depth for senior screening.',
      whyItMatters: 'Thin resumes give recruiters too little evidence of technical proficiency and project scale.',
      howToFix: 'Add 2-3 detailed project entries highlighting technologies, architecture, and live links.',
    });
  } else {
    findings.push({
      category: 'Formatting & Length',
      severity: 'tip',
      problem: 'Ensure your resume stays within 1-2 pages maximum.',
      whyItMatters: 'Long multi-page resumes dilute your strongest accomplishments.',
      howToFix: 'Keep your bullet count to 3-5 high-impact bullets per role.',
    });
  }

  return {
    overallScore: Math.max(30, overallScore),
    findings,
  };
}

/**
 * Simple English to Professional English Mode
 */
export function convertSimpleEnglish(input: string): {
  professional: string;
  explanation: string;
} {
  const trimmed = input.trim();
  let professional = trimmed;

  const replacements: [RegExp, string][] = [
    [/i made (an? )?app for tourist people/i, 'Developed a responsive tourism application designed to help travelers discover and navigate local attractions.'],
    [/i did work on website/i, 'Engineered and maintained user-facing web applications utilizing modern component frameworks.'],
    [/i helped my team do testing/i, 'Collaborated with QA engineers to implement automated end-to-end integration tests.'],
    [/i fixed bugs in database/i, 'Optimized query performance and resolved database concurrency bottlenecks.'],
    [/i worked with my boss/i, 'Partnered with senior leadership to deliver strategic initiatives on schedule.'],
  ];

  for (const [pattern, rep] of replacements) {
    if (pattern.test(trimmed)) {
      return {
        professional: rep,
        explanation: 'Converted informal wording into industry-standard technical phrasing.',
      };
    }
  }

  // General heuristic transformation
  professional = trimmed
    .replace(/\bi (built|made)\b/gi, 'Architected and engineered')
    .replace(/\bi worked on\b/gi, 'Contributed to the development and scaling of')
    .replace(/\bi did\b/gi, 'Executed')
    .replace(/\bvery good\b/gi, 'high-performance')
    .replace(/\blot of users\b/gi, 'high-volume concurrent users');

  return {
    professional,
    explanation: 'Polished grammar, improved verb strength, and elevated sentence structure.',
  };
}

/**
 * AI "Tell Me About Yourself" Elevator Pitch Generator
 */
export async function generateElevatorPitch(
  resume: ResumeData,
  duration: '30s' | '60s' | '90s',
  tone: 'confident' | 'technical' | 'conversational' = 'confident'
): Promise<{ pitch: string; bulletPoints: string[]; estimatedWordCount: number }> {
  const name = resume.personalInfo.fullName || 'I';
  const role = resume.personalInfo.jobTitle || 'Software Engineer';
  const skills = resume.skills.slice(0, 5).map((s) => s.name).join(', ') || 'modern technologies and software engineering';
  const topExp = resume.experience[0];
  const topProject = resume.projects[0];

  const wordTargets = {
    '30s': { min: 60, max: 80, time: '30 seconds' },
    '60s': { min: 130, max: 155, time: '60 seconds' },
    '90s': { min: 200, max: 235, time: '90 seconds' },
  }[duration];

  const apiKey = getStoredApiKey();
  if (apiKey) {
    try {
      const prompt = `
You are an elite Executive Career Coach.
Generate a compelling "Tell Me About Yourself" elevator pitch for an interview.
Candidate: ${name}
Target Role: ${role}
Core Skills: ${skills}
Most Recent Experience: ${topExp ? `${topExp.role} at ${topExp.company} - ${topExp.highlights?.[0] || ''}` : 'Independent Projects & Education'}
Top Project: ${topProject ? `${topProject.title} - ${topProject.description}` : 'Full-stack application development'}
Target Length: Strictly ${wordTargets.time} (${wordTargets.min} - ${wordTargets.max} words).
Tone: ${tone}.

Format response strictly as JSON:
{
  "pitch": "Full speech script written in first person ('I am...') ready to be spoken naturally.",
  "bulletPoints": ["Key beat 1 (The Hook)", "Key beat 2 (Core Accomplishment)", "Key beat 3 (Why This Role)"]
}
Output only valid JSON.`;

      const responseText = await callGemini(prompt, 'You are an executive career interview coach.');
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const words = parsed.pitch.split(/\s+/).filter(Boolean).length;
      return {
        pitch: parsed.pitch,
        bulletPoints: parsed.bulletPoints || [],
        estimatedWordCount: words,
      };
    } catch (e) {
      console.warn('Gemini pitch generation failed, using heuristic pitch', e);
    }
  }

  // High-impact local heuristic generator
  const hook = `Hi, I'm ${name}, a ${role} specialized in building scalable, user-centric systems with ${skills}.`;
  
  let body = '';
  if (topExp) {
    body = `Recently at ${topExp.company}, I worked as a ${topExp.role}, focusing on delivering robust production features and optimizing performance. ${topExp.highlights?.[0] ? `Specifically, I ${topExp.highlights[0].toLowerCase().replace(/^spearheaded |^engineered |^developed /i, '')}` : ''}`;
  } else if (topProject) {
    body = `Recently, I developed ${topProject.title}, ${topProject.description ? topProject.description.toLowerCase() : 'a high-performance application built to solve real-world user bottlenecks'}.`;
  } else {
    body = `Over the past several years, I have honed deep expertise in engineering maintainable software architectures and translating complex product specifications into intuitive user experiences.`;
  }

  const closer = `What excites me most right now is applying these competencies to high-impact challenges where engineering rigor and business value intersect. That's exactly what drew me to this opportunity.`;

  let pitch = '';
  let beats: string[] = [];

  if (duration === '30s') {
    pitch = `${hook} ${body.split('.')[0]}. ${closer.split('.')[0]}—which is why I'm thrilled to be speaking with you today.`;
    beats = [
      `Hook: Introduce yourself as a ${role} with strength in ${skills.split(',')[0] || 'engineering'}.`,
      `Core Win: Highlight your primary achievement from recent work.`,
      `The Bridge: Express clear alignment with this position.`,
    ];
  } else if (duration === '60s') {
    pitch = `${hook} ${body} Throughout my journey, I've prioritized writing clean, observable code while collaborating closely with cross-functional product and design partners to accelerate delivery cycles. ${closer}`;
    beats = [
      `The Hook: Crisp identity statement establishing your domain authority.`,
      `The Proof: Concrete contributions at ${topExp?.company || 'recent projects'} with measurable context.`,
      `The Methodology: Collaboration, engineering quality, and problem-solving approach.`,
      `The Future: Direct bridge to why this specific team and role are the next step.`,
    ];
  } else {
    // 90s
    pitch = `${hook} ${body} Beyond individual execution, I've led architectural discussions, contributed to code reviews, and championed best practices such as automated testing and continuous integration to keep deployment velocity high. In parallel, I've continued expanding my capabilities in modern tooling and distributed systems. What stands out to me about your team is the high bar for craftsmanship and the scale of the problems you are solving. I'm eager to bring my hands-on problem-solving mindset and technical discipline to help drive measurable outcomes here.`;
    beats = [
      `The Foundation: Professional identity, core stack, and focus area.`,
      `Major Achievements: Specific impact at ${topExp?.company || 'top projects'}.`,
      `Engineering Depth: Leadership, code review standards, and CI/CD discipline.`,
      `Continuous Learning: Proactive adoption of modern industry paradigms.`,
      `Strategic Alignment: Genuine enthusiasm for the company's technical vision.`,
    ];
  }

  const words = pitch.split(/\s+/).filter(Boolean).length;
  return {
    pitch,
    bulletPoints: beats,
    estimatedWordCount: words,
  };
}

/**
 * Generates tailored Interview Question Bank based on candidate's resume
 */
export async function generateInterviewQuestionBank(
  resume: ResumeData,
  targetRole?: string
): Promise<MockInterviewQuestion[]> {
  const role = targetRole || resume.personalInfo.jobTitle || 'Software Engineer';
  const skills = resume.skills.slice(0, 4).map((s) => s.name);
  const projects = resume.projects.slice(0, 2);
  const exp = resume.experience[0];

  const apiKey = getStoredApiKey();
  if (apiKey) {
    try {
      const prompt = `
You are a Lead Hiring Manager. Generate a tailored interview question bank for a candidate applying for: ${role}.
Candidate Top Skills: ${skills.join(', ')}
Candidate Projects: ${projects.map((p) => p.title).join(', ')}
Recent Work: ${exp ? `${exp.role} at ${exp.company}` : 'Academic / Freelance'}

Provide exactly 8 interview questions (2 HR, 2 Technical, 2 Project-specific, 2 Job-specific).
Format strictly as JSON:
[
  {
    "id": "q1",
    "category": "hr",
    "question": "Question text",
    "sampleAnswer": "High-level STAR outline hint for answering this effectively."
  }
]
Categories must be one of: "hr", "technical", "project", "job-specific".
Output only valid JSON array.`;

      const responseText = await callGemini(prompt, 'You are an interview question generator.');
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Gemini question generation failed, using intelligent fallback bank', e);
    }
  }

  // High quality dynamic fallback questions
  const bank: MockInterviewQuestion[] = [
    {
      id: 'hr-1',
      category: 'hr',
      question: `Why are you interested in transitioning into or growing as a ${role}?`,
      sampleAnswer: 'Structure your answer around 3 pillars: (1) Passion for the craft, (2) Proven impact in recent roles, (3) Growth opportunity and alignment with the company mission.',
    },
    {
      id: 'hr-2',
      category: 'hr',
      question: 'Describe a situation where you had a disagreement with a team member or stakeholder. How did you resolve it?',
      sampleAnswer: 'Use the STAR format: Explain the root cause of disagreement without blaming, how you presented data or ran a small spike, reached alignment, and protected team velocity.',
    },
    {
      id: 'tech-1',
      category: 'technical',
      question: `In your work with ${skills[0] || 'modern frameworks'}, how do you handle state management, scalability, and performance bottlenecks?`,
      sampleAnswer: 'Discuss profiling tools, memoization, lazy loading, caching layers, and how you monitor production latency.',
    },
    {
      id: 'tech-2',
      category: 'technical',
      question: `How do you ensure code reliability and maintainability across a team? What is your testing and CI/CD strategy?`,
      sampleAnswer: 'Cover unit test coverage (e.g. Jest/Vitest), end-to-end integration (Playwright/Cypress), static analysis (TypeScript, ESLint), and pre-merge GitHub Actions.',
    },
    {
      id: 'proj-1',
      category: 'project',
      question: projects[0]
        ? `On your resume you built "${projects[0].title}". What was the most difficult architectural decision you had to make during that project?`
        : 'Walk me through the most technically complex project on your resume. What was your specific architectural contribution?',
      sampleAnswer: 'Focus on the "why" rather than just the "what". Highlight tradeoffs considered (e.g., SQL vs NoSQL, serverless vs containers) and the measurable result.',
    },
    {
      id: 'proj-2',
      category: 'project',
      question: projects[1]
        ? `Regarding "${projects[1].title}", if you had another month to work on it, what would you refactor or optimize?`
        : 'If you could revisit a project you recently shipped, what would you design differently with what you know today?',
      sampleAnswer: 'Demonstrates technical maturity and self-reflection. Discuss caching, database indexing, accessibility, or security hardening.',
    },
    {
      id: 'job-1',
      category: 'job-specific',
      question: `As a ${role}, how do you prioritize between technical debt and urgent feature requests under tight deadlines?`,
      sampleAnswer: 'Explain the 80/20 rule, creating technical debt tickets in the sprint backlog, and explaining technical debt to product managers in terms of customer downtime and release risk.',
    },
    {
      id: 'job-2',
      category: 'job-specific',
      question: 'Tell me about a time an unexpected bug or outage reached production. How did you diagnose, mitigate, and prevent recurrence?',
      sampleAnswer: 'Walk through incident triage: rollback first to restore service, root-cause analysis via logs, blameless post-mortem, and writing a regression test.',
    },
  ];

  return bank;
}

/**
 * AI Mock Interview Answer Evaluator
 * Evaluates candidate response across 5 dimensions with actionable feedback and a model answer.
 */
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  resume: ResumeData
): Promise<{
  score: number;
  relevance: number;
  clarity: number;
  confidence: number;
  technical: number;
  communication: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}> {
  const trimmed = answer.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  const apiKey = getStoredApiKey();
  if (apiKey && wordCount > 10) {
    try {
      const prompt = `
You are a Principal Hiring Assessor. Evaluate this candidate's interview answer.
Target Role: ${resume.personalInfo.jobTitle || 'Professional'}
Interview Question: "${question}"
Candidate Answer: "${trimmed}"

Score the answer strictly from 0 to 100 on these 5 dimensions:
- relevance (did they directly answer the question?)
- clarity (concise, structured, easy to follow)
- confidence (authoritative, positive, active voice)
- technical (demonstrated domain knowledge, tools, metrics)
- communication (good narrative, STAR structure)

Provide 2-3 specific strengths, 2-3 actionable improvements, and a gold-standard Model Answer.
Format strictly as JSON:
{
  "score": 85,
  "relevance": 90,
  "clarity": 82,
  "confidence": 85,
  "technical": 80,
  "communication": 88,
  "strengths": ["Strengths list..."],
  "improvements": ["Improvements list..."],
  "modelAnswer": "Gold standard response..."
}
Output only valid JSON.`;

      const responseText = await callGemini(prompt, 'You are an objective, encouraging, high-standards interview assessor.');
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (e) {
      console.warn('Gemini answer evaluation failed, using deterministic evaluation engine', e);
    }
  }

  // High-accuracy deterministic heuristic evaluation
  let relevance = 75;
  let clarity = 70;
  let confidence = 75;
  let technical = 70;
  let communication = 70;

  const strengths: string[] = [];
  const improvements: string[] = [];

  // Length check
  if (wordCount < 25) {
    clarity -= 20;
    communication -= 25;
    relevance -= 15;
    improvements.push('Your answer is too brief. In an interview, provide context, action, and results (aim for 60-150 words).');
  } else if (wordCount > 40 && wordCount < 200) {
    clarity += 15;
    communication += 10;
    strengths.push('Good answer length—detailed enough to convey value without rambling.');
  } else if (wordCount >= 200) {
    clarity -= 10;
    improvements.push('Answer is somewhat lengthy; ensure you summarize your key takeaway upfront before giving supporting details.');
  }

  // Action verbs check
  const actionVerbs = ['implemented', 'architected', 'resolved', 'led', 'designed', 'optimized', 'reduced', 'increased', 'shipped'];
  const foundVerbs = actionVerbs.filter((v) => new RegExp(`\\b${v}`, 'i').test(trimmed));
  if (foundVerbs.length >= 2) {
    confidence += 12;
    strengths.push(`Strong proactive ownership language used (${foundVerbs.slice(0, 2).join(', ')}).`);
  } else {
    confidence -= 10;
    improvements.push('Incorporate strong active verbs (e.g. "I spearheaded", "I diagnosed", "I engineered") rather than passive phrases.');
  }

  // Metrics check
  const hasNumbers = /\d+%|\d+x|\$\d+|\b\d+\b/i.test(trimmed);
  if (hasNumbers) {
    technical += 15;
    strengths.push('Great inclusion of quantifiable outcomes and concrete numbers to validate impact.');
  } else {
    improvements.push('Add quantifiable evidence (e.g., "% latency reduced", "number of users affected", or "hours saved").');
  }

  // Technical terms check
  const techKeywords = ['architecture', 'database', 'api', 'performance', 'testing', 'component', 'pipeline', 'scale', 'cache', 'security'];
  const matchedTech = techKeywords.filter((k) => new RegExp(`\\b${k}`, 'i').test(trimmed));
  if (matchedTech.length >= 2) {
    technical += 10;
    strengths.push(`Demonstrated solid domain depth by referencing key concepts (${matchedTech.join(', ')}).`);
  }

  // STAR indicator
  const hasStar = /\b(situation|task|action|result|because|therefore|in order to|as a result)\b/i.test(trimmed);
  if (hasStar) {
    communication += 12;
    strengths.push('Clear logical structure following problem → action → outcome.');
  } else {
    improvements.push('Structure your answer using the STAR method: State the Situation, your Task, what you personally Did, and the Result.');
  }

  // Clamp 0-100
  relevance = Math.min(98, Math.max(30, relevance));
  clarity = Math.min(98, Math.max(30, clarity));
  confidence = Math.min(98, Math.max(30, confidence));
  technical = Math.min(98, Math.max(30, technical));
  communication = Math.min(98, Math.max(30, communication));

  const overallScore = Math.round((relevance * 0.25) + (clarity * 0.2) + (confidence * 0.15) + (technical * 0.2) + (communication * 0.2));

  // Fallback model answer
  const modelAnswer = `When faced with this scenario, I begin by breaking the core requirement down into measurable objectives. First, I established clear alignment with key stakeholders and gathered baseline metrics. Next, I engineered a robust solution utilizing modern best practices, introducing thorough automated tests to prevent regressions. As a direct result, we successfully delivered the feature on schedule with zero production rollbacks and improved overall throughput by over 25%.`;

  return {
    score: overallScore,
    relevance,
    clarity,
    confidence,
    technical,
    communication,
    strengths: strengths.length > 0 ? strengths : ['Clear, professional attitude and willingness to tackle difficult questions.'],
    improvements: improvements.length > 0 ? improvements : ['Maintain eye contact and conclude with a decisive closing sentence.'],
    modelAnswer,
  };
}

/**
 * AI Cover Letter Generator
 */
export async function generateCoverLetterContent(
  resume: ResumeData,
  company: string,
  jobTitle: string,
  tone: 'formal' | 'friendly' | 'concise' | 'professional' = 'professional',
  jobDescription?: string
): Promise<string> {
  const name = resume.personalInfo.fullName || 'Candidate';
  const email = resume.personalInfo.email || 'candidate@example.com';
  const phone = resume.personalInfo.phone || '';
  const topExp = resume.experience[0];
  const skills = resume.skills.slice(0, 5).map((s) => s.name).join(', ') || 'modern software engineering';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const apiKey = getStoredApiKey();
  if (apiKey) {
    try {
      const prompt = `
Write a high-converting cover letter tailored for:
Candidate: ${name} (${email})
Company: ${company}
Target Role: ${jobTitle}
Tone: ${tone}
Skills: ${skills}
Most Recent Role: ${topExp ? `${topExp.role} at ${topExp.company}` : 'Technical Projects'}
${jobDescription ? `Job Description details: ${jobDescription.slice(0, 800)}` : ''}

Generate a clean, persuasive 3-4 paragraph cover letter.
Do not invent false employers or exaggerated metrics. Maintain strict Truth Mode.
Return only the text of the letter without markdown or json.`;

      const responseText = await callGemini(prompt, 'You are an executive career advisor writing a bespoke cover letter.');
      if (responseText && responseText.length > 100) {
        return responseText.trim();
      }
    } catch (e) {
      console.warn('Gemini cover letter generation failed, using structured template', e);
    }
  }

  // High quality deterministic template
  let intro = '';
  let body1 = '';
  let body2 = '';
  let closing = '';

  if (tone === 'formal') {
    intro = `Dear Hiring Team at ${company},\n\nI am writing to formally submit my application for the ${jobTitle} position. With a strong track record in ${skills}, I have consistently delivered robust, scalable solutions and am eager to bring this same operational rigor to ${company}.`;
    body1 = topExp
      ? `In my previous capacity as ${topExp.role} at ${topExp.company}, I spearheaded critical engineering efforts that prioritized architectural integrity and performance. ${topExp.highlights?.[0] || 'I led development sprints and partnered with cross-functional teams to reliably ship core features on schedule.'}`
      : `Throughout my software engineering career, I have developed and deployed production-grade applications, prioritizing maintainable code architecture, rigorous testing, and responsive design.`;
    body2 = `What distinguishes my approach is a steadfast dedication to engineering excellence and measurable business outcomes. I am confident that my technical proficiency in ${skills} aligns closely with ${company}'s current technical initiatives and long-term vision.`;
    closing = `Thank you for your time and consideration. I welcome the opportunity to discuss how my qualifications align with the needs of your team.\n\nSincerely,\n${name}\n${email}${phone ? ` | ${phone}` : ''}`;
  } else if (tone === 'friendly') {
    intro = `Hi ${company} Team,\n\nI was thrilled to see the opening for the ${jobTitle} role! Having followed ${company}'s inspiring work, I knew immediately that this was a team where I could contribute meaningful impact and continue to grow.`;
    body1 = topExp
      ? `During my time as ${topExp.role} at ${topExp.company}, I loved tackling tough challenges—from optimizing latency to building features that our users genuinely enjoyed. ${topExp.highlights?.[0] || 'I really enjoy working with smart, driven peers to solve real customer problems.'}`
      : `I've spent significant time building and refining applications using ${skills}, with a relentless focus on creating delightful user experiences and rock-solid code.`;
    body2 = `I thrive in collaborative, fast-paced environments where curiosity and execution go hand in hand. I'd love to bring my energy, technical toolkit, and creative problem-solving mindset to the ${jobTitle} opening at ${company}.`;
    closing = `I'd love to chat more about how I can help ${company} achieve its goals this year. Looking forward to connecting!\n\nWarm regards,\n${name}\n${email}${phone ? ` | ${phone}` : ''}`;
  } else if (tone === 'concise') {
    intro = `Dear Hiring Manager,\n\nI am excited to apply for the ${jobTitle} role at ${company}. As a specialist in ${skills}, I bring direct experience delivering high-performance software solutions.`;
    body1 = topExp
      ? `Key Highlight: As ${topExp.role} at ${topExp.company}, ${topExp.highlights?.[0] || 'I drove core product development and optimized application delivery pipelines.'}`
      : `Key Highlight: Engineered modern full-stack web applications with high test coverage, modern UX patterns, and secure APIs.`;
    body2 = `My technical background and disciplined execution make me well-prepared to hit the ground running at ${company}.`;
    closing = `I welcome the opportunity to speak with your team.\n\nBest,\n${name}\n${email}${phone ? ` | ${phone}` : ''}`;
  } else {
    // professional default
    intro = `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the ${jobTitle} position at ${company}. Having specialized in ${skills}, I have developed a strong foundation in architecting high-quality, maintainable systems that generate tangible business value.`;
    body1 = topExp
      ? `Most recently, as ${topExp.role} at ${topExp.company}, I contributed to mission-critical initiatives. ${topExp.highlights?.[0] || 'I collaborated with product managers and engineers to scale our platforms while ensuring high availability and code maintainability.'}`
      : `Through extensive hands-on development, I have architected complex full-stack applications with high test coverage, responsive modern interfaces, and resilient backend services.`;
    body2 = `${company}'s commitment to innovation and customer success deeply resonates with me. I am particularly drawn to this role because it presents an exciting opportunity to apply my expertise in ${skills} toward solving ambitious problems with a world-class team.`;
    closing = `I look forward to discussing how my experience and passion can contribute to the ongoing success of ${company}.\n\nWarm regards,\n${name}\n${email}${phone ? ` | ${phone}` : ''}`;
  }

  return `${today}\n\n${intro}\n\n${body1}\n\n${body2}\n\n${closing}`;
}


