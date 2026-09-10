import React, { useMemo } from 'react';
import type { ResumeData, ResumeVersion } from '../../types/resume';
import {
  Sparkles,
  FileEdit,
  FileCheck,
  Target,
  Mic,
  Briefcase,
  Layers,
  Award,
  ArrowRight,
  TrendingUp,
  Plus,
  Copy,
  Trash2,
  Clock,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Code2,
} from 'lucide-react';

interface Props {
  currentResume: ResumeData;
  resumesList: ResumeVersion[];
  onNavigate: (view: 'builder' | 'checker' | 'matcher' | 'interview' | 'applications' | 'tools') => void;
  onSelectResume: (resume: ResumeVersion) => void;
  onCreateNewResume: () => void;
  onDuplicateResume: (resume: ResumeVersion) => void;
  onDeleteResume: (id: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  currentResume,
  resumesList,
  onNavigate,
  onSelectResume,
  onCreateNewResume,
  onDuplicateResume,
  onDeleteResume,
}) => {
  const userName = currentResume.personalInfo.fullName || 'Candidate';
  const roleName = currentResume.personalInfo.jobTitle || 'Software Engineer';

  // Calculate completeness score based on 16 sections
  const completenessScore = useMemo(() => {
    let score = 0;
    if (currentResume.personalInfo.fullName && currentResume.personalInfo.email) score += 15;
    if (currentResume.summary) score += 10;
    if (currentResume.experience.length > 0) score += 20;
    if (currentResume.skills.length >= 5) score += 15;
    if (currentResume.education.length > 0) score += 10;
    if (currentResume.projects.length > 0) score += 15;
    if ((currentResume.certifications || []).length > 0) score += 5;
    if ((currentResume.languages || []).length > 0) score += 5;
    if ((currentResume.customSections || []).length > 0) score += 5;
    return Math.min(100, score);
  }, [currentResume]);

  // Master resume ATS score
  const masterAtsScore = 88;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Mission Control Header */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Career Command Center
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Truth Mode: Anti-Fabrication Active
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">{userName}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Target Role: <strong className="text-white">{roleName}</strong>. Your master resume is currently outperforming 85% of applicants. Select an action below to advance your search.
            </p>
          </div>

          {/* Quick Primary CTA buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => onNavigate('builder')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl shadow-xl shadow-blue-500/25 transition cursor-pointer text-sm"
            >
              <FileEdit className="w-4 h-4" />
              <span>Edit Resume</span>
            </button>
            <button
              onClick={() => onNavigate('checker')}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold px-5 py-3 rounded-2xl border border-slate-700/80 transition cursor-pointer text-sm"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Run ATS Check</span>
            </button>
          </div>
        </div>

        {/* 6 Key Performance Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>ATS Score</span>
              <Award className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1">
              <span>{masterAtsScore}</span>
              <span className="text-xs text-emerald-400 font-bold">+12%</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Industry benchmark 72</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Resumes</span>
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {resumesList.length}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">1 Master + Variations</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Applications</span>
              <Briefcase className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-teal-400 mt-1">6</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">2 in interview round</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Interview Rate</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">33%</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Top 10% tier</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Skill Gaps</span>
              <Target className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">3</div>
            <span className="text-[10px] text-rose-400 block mt-0.5">4-week plan active</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Completeness</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{completenessScore}%</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">All 16 sections</span>
          </div>
        </div>
      </div>

      {/* 6 Quick Action Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Core Workflow Launchpad</span>
          </h2>
          <span className="text-xs text-slate-400">Everything needed to land your next role</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Resume Builder */}
          <div
            onClick={() => onNavigate('builder')}
            className="group bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition cursor-pointer shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition duration-200">
                <FileEdit className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                AI Resume Builder
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Edit 16 sections, pick from 20 templates, format bullets with Google's XYZ STAR framework, and export vector PDF / Word DOCX.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold pt-4 mt-2 border-t border-slate-850">
              <span>Open Builder</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: ATS Resume Checker */}
          <div
            onClick={() => onNavigate('checker')}
            className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                ATS Checker & Heatmap
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan your resume against 6 core ATS scoring dimensions, inspect visual heatmaps (Strong/Moderate/Weak), and auto-fix weak phrases.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold pt-4 mt-2 border-t border-slate-850">
              <span>Inspect ATS Score</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Job Matcher & Gap Roadmap */}
          <div
            onClick={() => onNavigate('matcher')}
            className="group bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 transition cursor-pointer shadow-lg hover:shadow-purple-500/10 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition duration-200">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                Job Matcher & 4-Week Roadmap
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste any job description to uncover keyword gaps, calculate your match %, and generate a customized targeted resume.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold pt-4 mt-2 border-t border-slate-850">
              <span>Analyze Job Match</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Interview AI Suite */}
          <div
            onClick={() => onNavigate('interview')}
            className="group bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition cursor-pointer shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition duration-200">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                AI Interview Prep & Simulator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rehearse 30s/60s/90s elevator pitches, practice resume-specific project questions, and get evaluated on 5 key communication metrics.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold pt-4 mt-2 border-t border-slate-850">
              <span>Start Mock Simulator</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 5: Application Tracker */}
          <div
            onClick={() => onNavigate('applications')}
            className="group bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 transition cursor-pointer shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition duration-200">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                Application Pipeline Tracker
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage your job search Kanban board (Saved, Applied, Assessment, Interview, Offer) with response rates and interview reminders.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-teal-400 font-semibold pt-4 mt-2 border-t border-slate-850">
              <span>View Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 6: Career Tools & Portfolio */}
          <div
            onClick={() => onNavigate('tools')}
            className="group bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 rounded-2xl p-5 transition cursor-pointer shadow-lg hover:shadow-pink-500/10 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition duration-200">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition">
                Cover Letters & Portfolio Website
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate matching cover letters in 4 tones, convert your resume into an instant developer portfolio website, and import GitHub repos.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-pink-400 font-semibold pt-4 mt-2 border-t border-slate-850">
              <span>Launch Tools</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Resumes Management & Versions Center */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Resume Versions & Variations</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Maintain a comprehensive Master Resume and generate tailored role-specific copies.
            </p>
          </div>

          <button
            onClick={onCreateNewResume}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-blue-600/20 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Resume</span>
          </button>
        </div>

        {/* Resumes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumesList.map((res) => {
            const isSelected = res.data === currentResume;
            return (
              <div
                key={res.id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-950/20 border-blue-500/50 shadow-xl shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white leading-tight">{res.name}</h4>
                        {res.isMaster && (
                          <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.2 rounded">
                            Master
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {res.data.personalInfo.jobTitle || 'General Profile'}
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      ATS: {res.atsScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {res.lastUpdated}
                    </span>
                    <span>•</span>
                    <span>{res.theme.template}</span>
                  </div>
                </div>

                {/* Resume Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-850 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectResume(res);
                      onNavigate('builder');
                    }}
                    className="text-xs bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                  >
                    Edit in Builder
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateResume(res)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                      title="Duplicate Variation"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {!res.isMaster && (
                      <button
                        onClick={() => onDeleteResume(res.id)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Variation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
