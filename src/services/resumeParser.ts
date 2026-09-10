import type { ResumeData, ExperienceItem, EducationItem, SkillCategory } from '../types/resume';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import mammoth from 'mammoth';
import { getStoredApiKey } from './geminiService';

// Configure local worker bundled by Vite
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Extracts plain text from an uploaded PDF file
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => (item.str ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}

/**
 * Extracts plain text from an uploaded Word DOCX file
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Parses raw text into structured ResumeData
 */
export async function parseResumeText(rawText: string): Promise<ResumeData> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('No readable text found to parse.');
  }

  const apiKey = getStoredApiKey();

  // If Gemini API Key is available, try Gemini semantic parser first
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `
Extract and structure the following resume text into strict JSON matching this exact ResumeData schema:
{
  "personalInfo": {
    "fullName": "Candidate Full Name",
    "jobTitle": "Target Job Title or Current Role",
    "email": "email@example.com",
    "phone": "Phone number",
    "location": "City, State or Country",
    "website": "Portfolio URL or empty",
    "linkedin": "LinkedIn profile URL or empty",
    "github": "GitHub profile URL or empty"
  },
  "summary": "Professional summary or objective",
  "experience": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "role": "Job Title",
      "location": "Location or empty",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or Present",
      "current": true,
      "highlights": ["Bullet point 1", "Bullet point 2"]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "University/College Name",
      "degree": "Degree name (e.g. Bachelor of Science)",
      "fieldOfStudy": "Major or Field",
      "location": "Location or empty",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "gpa": "GPA or empty"
    }
  ],
  "skills": [
    {
      "id": "cat-1",
      "name": "Technical Skills",
      "skills": ["Skill1", "Skill2"]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "title": "Project Title",
      "subtitle": "Subtitle or empty",
      "description": "Short description",
      "technologies": ["Tech1", "Tech2"],
      "link": "Live URL or empty",
      "github": "Repo URL or empty"
    }
  ],
  "certifications": []
}

Raw Resume Text:
"""
${rawText.slice(0, 10000)}
"""

Output only valid JSON, without any markdown code blocks or surrounding text.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2500 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.personalInfo) {
          return fillDefaults(parsed);
        }
      }
    } catch (e) {
      console.warn('Gemini parser fallback to heuristic parser:', e);
    }
  }

  // Smart Local Heuristic Parser (no API key needed!)
  return parseResumeHeuristically(rawText);
}

/**
 * Intelligent local regex & NLP heuristic resume parser
 */
function parseResumeHeuristically(text: string): ResumeData {
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Email extraction
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Phone extraction
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. URLs
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i) ||
                        text.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  const linkedin = linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : '';

  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i) ||
                      text.match(/github\.com\/[A-Za-z0-9_-]+/i);
  const github = githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : '';

  const websiteMatch = text.match(/https?:\/\/(?!www\.linkedin|www\.github)[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s]*)?/i);
  const website = websiteMatch ? websiteMatch[0] : '';

  // 4. Candidate Name & Job Title
  let fullName = '';
  let jobTitle = '';
  let location = '';

  // Look at first 6 lines
  for (let i = 0; i < Math.min(rawLines.length, 6); i++) {
    const line = rawLines[i];
    if (
      !line.includes('@') &&
      !line.match(/\d{3}[-.\s]?\d{3}/) &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum') &&
      !line.toLowerCase().includes('page') &&
      line.length < 50
    ) {
      if (!fullName && line.split(/\s+/).length <= 4 && !/engineer|developer|manager|specialist|analyst/i.test(line)) {
        fullName = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
      } else if (!jobTitle && /engineer|developer|manager|designer|specialist|lead|analyst|architect|consultant|officer/i.test(line)) {
        jobTitle = line;
      } else if (!location && /([A-Z][a-zA-Z]+,\s*[A-Z]{2})|remote|united states|california|new york|texas|india|london|canada/i.test(line)) {
        location = line;
      }
    }
  }

  // Fallback name from email if needed
  if (!fullName && email) {
    const username = email.split('@')[0].replace(/[._0-9-]/g, ' ').trim();
    fullName = username
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // 5. Section Boundary Detection
  const sectionKeywords: { key: string; regex: RegExp }[] = [
    { key: 'summary', regex: /^(professional summary|summary|about me|profile|objective|career objective)$/i },
    { key: 'experience', regex: /^(work experience|professional experience|experience|employment history|work history)$/i },
    { key: 'education', regex: /^(education|academic background|qualifications|academic history)$/i },
    { key: 'skills', regex: /^(skills|technical skills|core competencies|areas of expertise|technologies)$/i },
    { key: 'projects', regex: /^(projects|key projects|personal projects|featured projects)$/i },
    { key: 'certifications', regex: /^(certifications|licenses|credentials|awards)$/i },
  ];

  const sectionBlocks: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    other: [],
  };

  let currentSection = 'summary';

  for (const line of rawLines) {
    const matchedSection = sectionKeywords.find((s) => s.regex.test(line.replace(/[:\-_]/g, '').trim()));
    if (matchedSection) {
      currentSection = matchedSection.key;
      continue;
    }
    if (sectionBlocks[currentSection]) {
      sectionBlocks[currentSection].push(line);
    } else {
      sectionBlocks.other.push(line);
    }
  }

  // Summary (only if actually present in the resume)
  const summary = sectionBlocks.summary.length > 0
    ? sectionBlocks.summary.slice(0, 5).join(' ').trim()
    : '';

  // Experience (only if actually present)
  const experience: ExperienceItem[] = [];
  if (sectionBlocks.experience.length > 0) {
    const expLines = sectionBlocks.experience;
    const bullets: string[] = [];
    let detectedCompany = '';
    let detectedRole = jobTitle || '';

    for (const line of expLines) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 40) {
        const cleanBullet = line.replace(/^[-•*]\s*/, '').trim();
        if (cleanBullet) bullets.push(cleanBullet);
      } else if (!bullets.length && line.length < 50) {
        if (/engineer|developer|manager|lead|analyst|specialist|intern/i.test(line)) {
          detectedRole = line;
        } else if (!detectedCompany) {
          detectedCompany = line;
        }
      }
    }

    if (detectedRole || detectedCompany || bullets.length > 0) {
      experience.push({
        id: `exp-${Date.now()}-1`,
        company: detectedCompany || 'Organization',
        role: detectedRole || 'Role',
        location: location || '',
        startDate: '',
        endDate: 'Present',
        current: true,
        highlights: bullets,
      });
    }
  }

  // Education
  const education: EducationItem[] = [];
  const eduLines = sectionBlocks.education.length > 0
    ? sectionBlocks.education
    : rawLines.filter((l) => /bachelor|master|b\.tech|b\.e\.|degree|university|college|institute/i.test(l));

  if (eduLines.length > 0) {
    const institutionLine = eduLines[0];
    const degreeLine = eduLines.find((l) => /bachelor|master|b\.tech|b\.e\.|degree/i.test(l)) || institutionLine;
    education.push({
      id: `edu-${Date.now()}-1`,
      institution: institutionLine,
      degree: degreeLine !== institutionLine ? degreeLine : 'Degree / Program',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
    });
  }

  // Skills
  const commonSkillDictionary = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'PostgreSQL',
    'Docker', 'AWS', 'Kubernetes', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git', 'Go',
    'MongoDB', 'GraphQL', 'REST APIs', 'Agile', 'Scrum', 'Figma', 'Next.js', 'Redis',
    'Project Management', 'Problem Solving', 'Leadership', 'CI/CD'
  ];

  const detectedSkills: string[] = [];
  const fullTextLower = text.toLowerCase();

  // If skills block exists, grab words from it
  if (sectionBlocks.skills.length > 0) {
    const rawSkills = sectionBlocks.skills.join(', ').split(/[,•|/;\n]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 35);
    detectedSkills.push(...rawSkills);
  }

  commonSkillDictionary.forEach((skill) => {
    if (fullTextLower.includes(skill.toLowerCase()) && !detectedSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      detectedSkills.push(skill);
    }
  });

  const finalSkills: SkillCategory[] = [
    {
      id: 'cat-imported-1',
      name: 'Key Competencies & Technologies',
      skills: detectedSkills.length > 0 ? Array.from(new Set(detectedSkills)).slice(0, 15) : ['Problem Solving', 'Communication', 'Agile Methodologies', 'Leadership'],
    },
  ];

  return {
    personalInfo: {
      fullName: fullName || 'Your Name',
      jobTitle: jobTitle || 'Professional',
      email: email || '',
      phone: phone || '',
      location: location || '',
      website: website || '',
      linkedin: linkedin || '',
      github: github || '',
    },
    summary,
    experience,
    education,
    skills: finalSkills,
    projects: [],
    certifications: [],
  };
}

function fillDefaults(parsed: any): ResumeData {
  return {
    personalInfo: {
      fullName: parsed.personalInfo?.fullName || '',
      jobTitle: parsed.personalInfo?.jobTitle || '',
      email: parsed.personalInfo?.email || '',
      phone: parsed.personalInfo?.phone || '',
      location: parsed.personalInfo?.location || '',
      website: parsed.personalInfo?.website || '',
      linkedin: parsed.personalInfo?.linkedin || '',
      github: parsed.personalInfo?.github || '',
    },
    summary: parsed.summary || '',
    experience: Array.isArray(parsed.experience)
      ? parsed.experience
          .filter((exp: any) => exp && (exp.role || exp.company || (Array.isArray(exp.highlights) && exp.highlights.length > 0)))
          .map((exp: any, i: number) => ({
            id: exp.id || `exp-${Date.now()}-${i}`,
            company: exp.company || '',
            role: exp.role || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            current: Boolean(exp.current),
            highlights: Array.isArray(exp.highlights) ? exp.highlights.filter((h: any) => typeof h === 'string' && h.trim()) : [],
          }))
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education
          .filter((edu: any) => edu && (edu.institution || edu.degree))
          .map((edu: any, i: number) => ({
            id: edu.id || `edu-${Date.now()}-${i}`,
            institution: edu.institution || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            location: edu.location || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            gpa: edu.gpa || '',
          }))
      : [],
    skills: Array.isArray(parsed.skills) && parsed.skills.length > 0
      ? parsed.skills
          .filter((c: any) => c && Array.isArray(c.skills) && c.skills.length > 0)
          .map((c: any, i: number) => ({
            id: c.id || `cat-${Date.now()}-${i}`,
            name: c.name || 'Skills',
            skills: c.skills,
          }))
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((p: any, i: number) => ({
          id: p.id || `proj-${Date.now()}-${i}`,
          title: p.title || '',
          subtitle: p.subtitle || '',
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          link: p.link || '',
          github: p.github || '',
        }))
      : [],
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications.map((cert: any, i: number) => ({
          id: cert.id || `cert-${Date.now()}-${i}`,
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
        }))
      : [],
  };
}
