import React, { useState, useMemo } from 'react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import {
  Search,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BookOpen,
  FileCheck,
  ShieldCheck,
  Zap,
  Calendar,
  Copy,
  Check,
} from 'lucide-react';
import {
  analyzeJobDescription,
  generateSkillGapRoadmap,
} from '../../services/geminiService';
import { SAMPLE_JOB_DESCRIPTION } from '../../data/sampleResumes';
import confetti from 'canvas-confetti';

interface Props {
  currentResume: ResumeData;
  masterResume?: ResumeData;
  theme: ResumeTheme;
  onApplyTargetedResume: (targetedResume: ResumeData) => void;
  onNavigateToBuilder?: () => void;
}

export const JobMatcher: React.FC<Props> = ({
  currentResume,
  masterResume,
  onApplyTargetedResume,
  onNavigateToBuilder,
}) => {
  const [jdText, setJdText] = useState<string>(SAMPLE_JOB_DESCRIPTION);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [targetedResumePreview, setTargetedResumePreview] = useState<ResumeData | null>(null);

  // Resume all skills flat list
  const resumeSkills = useMemo(() => {
    const list: string[] = [];
    (currentResume.skills || []).forEach((c) => {
      c.skills.forEach((s) => list.push(s.toLowerCase()));
    });
    return new Set(list);
  }, [currentResume]);

  const fullResumeText = useMemo(() => {
    return JSON.stringify(currentResume).toLowerCase();
  }, [currentResume]);

  // Extracted JD Analysis State
  const [jdAnalysis, setJdAnalysis] = useState<{
    roleTitle: string;
    requiredSkills: string[];
    preferredSkills: string[];
    experienceRequired: string;
    responsibilities: string[];
    keywords: string[];
  }>({
    roleTitle: 'Senior Software Engineer - Full Stack',
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
    preferredSkills: ['GraphQL', 'Redis', 'Go', 'Microservices'],
    experienceRequired: '5+ years',
    responsibilities: [
      'Design and develop scalable microservices using Node.js and TypeScript.',
      'Build responsive web interfaces with React and Tailwind CSS.',
      'Architect cloud infrastructure on AWS with automated CI/CD pipelines.',
    ],
    keywords: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD', 'GraphQL', 'Redis'],
  });

  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeJobDescription(jdText);
      setJdAnalysis(res);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Skill categorization: Strong vs Partial vs Missing
  const categorizedSkills = useMemo(() => {
    const strong: string[] = [];
    const partial: string[] = [];
    const missing: string[] = [];

    const allJdSkills = Array.from(new Set([...jdAnalysis.requiredSkills, ...jdAnalysis.keywords]));

    allJdSkills.forEach((skill) => {
      const sLower = skill.toLowerCase();
      if (resumeSkills.has(sLower)) {
        strong.push(skill);
      } else if (fullResumeText.includes(sLower)) {
        partial.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const total = allJdSkills.length || 1;
    const matchScore = Math.min(100, Math.round(((strong.length * 1.0 + partial.length * 0.5) / total) * 100));

    return { strong, partial, missing, matchScore };
  }, [jdAnalysis, resumeSkills, fullResumeText]);

  // 4-Week Learning Roadmap
  const roadmap = useMemo(() => {
    return generateSkillGapRoadmap(categorizedSkills.missing, jdAnalysis.roleTitle);
  }, [categorizedSkills.missing, jdAnalysis.roleTitle]);

  // Generate Targeted Resume from Master / Current Resume
  const handleGenerateTargetedResume = () => {
    const base = masterResume || currentResume;

    // Filter projects & experiences that contain target keywords
    const keywordsLower = jdAnalysis.keywords.map((k) => k.toLowerCase());

    const targetedExperience = base.experience.map((exp) => {
      // Prioritize highlights that match target role keywords
      const prioritized = [...exp.highlights].sort((a, b) => {
        const aMatches = keywordsLower.filter((k) => a.toLowerCase().includes(k)).length;
        const bMatches = keywordsLower.filter((k) => b.toLowerCase().includes(k)).length;
        return bMatches - aMatches;
      });
      return { ...exp, highlights: prioritized };
    });

    // Targeted targeted resume data
    const targeted: ResumeData = {
      ...base,
      personalInfo: {
        ...base.personalInfo,
        jobTitle: jdAnalysis.roleTitle || base.personalInfo.jobTitle,
      },
      summary: `Accomplished ${jdAnalysis.roleTitle || base.personalInfo.jobTitle} with extensive hands-on expertise in ${categorizedSkills.strong.slice(0, 4).join(', ')}. Demonstrated success driving high-throughput architecture, improving operational efficiency, and delivering scalable customer-facing platforms.`,
      experience: targetedExperience,
      isMasterResume: false,
    };

    setTargetedResumePreview(targeted);
    setShowComparison(true);
  };

  const handleCopySkill = (skill: string) => {
    navigator.clipboard.writeText(skill);
    setCopiedKeyword(skill);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-100">
      {/* Header Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Job Match & Skill Gap Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Targeted Job Alignment & Learning Roadmap
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Compare your resume against any job description, pinpoint skill gaps, and spawn targeted resumes from your Master Career Database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateTargetedResume}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition transform hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Targeted Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Job Description Input & Match KPI */}
        <div className="lg:col-span-5 space-y-6">
          {/* Job Description Input Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-400" />
                <span>Target Job Description</span>
              </label>
              <button
                onClick={() => setJdText(SAMPLE_JOB_DESCRIPTION)}
                className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
              >
                Load Sample Tech JD
              </button>
            </div>

            <textarea
              rows={8}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description from LinkedIn, Indeed, Greenhouse, or company careers page..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
            />

            <button
              onClick={handleAnalyzeJD}
              disabled={isAnalyzing || !jdText.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md"
            >
              <Zap className="w-4 h-4" />
              <span>{isAnalyzing ? 'Extracting Requirements...' : 'Analyze Job Description'}</span>
            </button>
          </div>

          {/* Match Score Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Calculated Job Match</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                {categorizedSkills.matchScore >= 80 ? '🟢 Strong Fit' : categorizedSkills.matchScore >= 60 ? '🟡 Moderate Fit' : '🔴 Low Fit'}
              </span>
            </div>

            {/* Circular Meter */}
            <div className="relative inline-flex items-center justify-center my-2">
              <div
                className="w-28 h-28 rounded-full border-8 flex items-center justify-center transition-all duration-500"
                style={{
                  borderColor:
                    categorizedSkills.matchScore >= 80
                      ? '#10b981'
                      : categorizedSkills.matchScore >= 60
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              >
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {categorizedSkills.matchScore}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">Match</span>
                </div>
              </div>
            </div>

            {/* Match Breakdown Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-emerald-400 font-bold block text-sm">{categorizedSkills.strong.length}</span>
                <span className="text-[10px] text-emerald-300/80">Strong (✓)</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30">
                <span className="text-amber-400 font-bold block text-sm">{categorizedSkills.partial.length}</span>
                <span className="text-[10px] text-amber-300/80">Partial (⚠)</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                <span className="text-rose-400 font-bold block text-sm">{categorizedSkills.missing.length}</span>
                <span className="text-[10px] text-rose-300/80">Missing (✗)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Detailed Breakdown & Learning Roadmap */}
        <div className="lg:col-span-7 space-y-6">
          {/* Skill Breakdown Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-400" />
                <span>Job Skill Match Breakdown</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">Click skill to copy</span>
            </h3>

            {/* Strong Skills */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strong Matches ({categorizedSkills.strong.length}) — Prominently in Skills:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categorizedSkills.strong.length > 0 ? (
                  categorizedSkills.strong.map((sk) => (
                    <button
                      key={sk}
                      onClick={() => handleCopySkill(sk)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-1 hover:bg-emerald-900/60 transition"
                      title="Click to copy"
                    >
                      <span>{sk}</span>
                      {copiedKeyword === sk ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-400/60" />}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No exact skill matches detected.</span>
                )}
              </div>
            </div>

            {/* Partial Skills */}
            {categorizedSkills.partial.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Partial Matches ({categorizedSkills.partial.length}) — Found in Text, not Skills Section:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {categorizedSkills.partial.map((sk) => (
                    <button
                      key={sk}
                      onClick={() => handleCopySkill(sk)}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-1 hover:bg-amber-900/60 transition"
                      title="Click to copy"
                    >
                      <span>{sk}</span>
                      {copiedKeyword === sk ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3 text-amber-400/60" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>Missing Key Requirements ({categorizedSkills.missing.length}):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categorizedSkills.missing.length > 0 ? (
                  categorizedSkills.missing.map((sk) => (
                    <button
                      key={sk}
                      onClick={() => handleCopySkill(sk)}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-1 hover:bg-rose-900/60 transition"
                      title="Click to copy"
                    >
                      <span>{sk}</span>
                      {copiedKeyword === sk ? <Check className="w-3 h-3 text-rose-400" /> : <Copy className="w-3 h-3 text-rose-400/60" />}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 font-medium">
                    Outstanding! Your resume covers all extracted job requirements.
                  </span>
                )}
              </div>
            </div>

            {/* Anti-Keyword Stuffing Ethical Advice */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Strategic Keyword Placement (No Keyword Stuffing)</span>
              </div>
              <p>
                Do not blindly paste missing skills in a comma-separated list. If you have genuinely used{' '}
                <strong className="text-white">{categorizedSkills.missing[0] || 'the technology'}</strong>, introduce it with context inside a specific Project or Experience bullet to satisfy ATS algorithms and human interviewers.
              </p>
            </div>
          </div>

          {/* 4-Week Skill Gap Roadmap Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">4-Week Recommended Learning Roadmap</h3>
                  <p className="text-xs text-slate-400">Step-by-step curriculum to close skill gaps for this role</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-900/30 text-purple-300 font-medium border border-purple-700/40">
                Structured Plan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roadmap.map((week) => (
                <div
                  key={week.week}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400">
                      Week {week.week}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {week.estimatedHours}h study
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{week.title}</h4>
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Focus: </span>
                    <span className="text-purple-300 font-medium">{week.focusSkill}</span>
                  </div>
                  <ul className="text-[11px] text-slate-400 list-disc pl-4 space-y-0.5">
                    {week.topics.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                  <div className="pt-1.5 border-t border-slate-900 text-[10px] text-emerald-400 font-medium">
                    🛠️ Project: {week.suggestedProject}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Targeted Resume Side-by-Side Comparison Modal */}
      {showComparison && targetedResumePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4">
          <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-3 border-b border-slate-800 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-sm">Original vs Job-Optimized Resume Comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onApplyTargetedResume(targetedResumePreview);
                  setShowComparison(false);
                  if (onNavigateToBuilder) onNavigateToBuilder();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                <Check className="w-4 h-4" /> Load Targeted Resume in Builder
              </button>
              <button
                onClick={() => setShowComparison(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>

          {/* Comparison Split Columns */}
          <div className="flex-1 overflow-auto py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Resume Side */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-3 text-xs">
              <div className="pb-2 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-300">Original Resume</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Baseline</span>
              </div>
              <div>
                <strong className="text-slate-200 block">{currentResume.personalInfo.fullName}</strong>
                <span className="text-slate-400">{currentResume.personalInfo.jobTitle}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Summary</span>
                <p className="text-slate-300 leading-relaxed">{currentResume.summary}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Experience Order</span>
                {currentResume.experience.map((exp) => (
                  <div key={exp.id} className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px]">
                    <div className="font-semibold text-slate-200">{exp.role} • {exp.company}</div>
                    <p className="text-slate-400 mt-1 line-clamp-2">{exp.highlights[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Targeted Resume Side */}
            <div className="bg-blue-950/20 border border-blue-500/40 rounded-xl p-4 overflow-y-auto space-y-3 text-xs">
              <div className="pb-2 border-b border-blue-500/30 flex justify-between items-center">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Job-Optimized Targeted Resume
                </span>
                <span className="text-[10px] bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded text-blue-300 font-semibold">
                  +18% Match Projected
                </span>
              </div>
              <div>
                <strong className="text-white block">{targetedResumePreview.personalInfo.fullName}</strong>
                <span className="text-blue-400 font-medium">{targetedResumePreview.personalInfo.jobTitle}</span>
              </div>
              <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-500/30">
                <span className="text-[10px] font-bold text-blue-400 block mb-1 uppercase">Tailored Summary</span>
                <p className="text-blue-100 leading-relaxed">{targetedResumePreview.summary}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-400 block uppercase">Keywords Prioritized</span>
                {targetedResumePreview.experience.map((exp) => (
                  <div key={exp.id} className="p-2 bg-slate-950/80 rounded border border-blue-500/20 text-[11px]">
                    <div className="font-semibold text-slate-200">{exp.role} • {exp.company}</div>
                    <p className="text-slate-300 mt-1 line-clamp-2">{exp.highlights[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
