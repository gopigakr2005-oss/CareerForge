import React, { useState } from 'react';
import { TEMPLATE_DEFINITIONS } from '../../data/templateDefinitions';
import type { TemplateId } from '../../types/resume';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  FileEdit,
  Zap,
  Target,
  Mic,
  ChevronDown,
  ChevronRight,
  Users,
  Code2,
  GraduationCap,
  Briefcase,
  LayoutDashboard,
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onCheckResume: () => void;
  onSelectTemplate: (templateId: TemplateId) => void;
  onNavigateToDashboard: () => void;
}

export const LandingPage: React.FC<Props> = ({
  onGetStarted,
  onCheckResume,
  onSelectTemplate,
  onNavigateToDashboard,
}) => {
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const filteredTemplates = TEMPLATE_DEFINITIONS.filter(
    (t) => selectedTemplateCategory === 'all' || t.category === selectedTemplateCategory
  );

  const faqs = [
    {
      q: 'How does CareerForge AI ensure my resume passes ATS scanners?',
      a: 'CareerForge AI uses standardized single and two-column layouts formatted according to parsing standards used by Workday, Greenhouse, Lever, and Taleo. Resumes are rendered with accessible semantic typography, clean date formatting, and zero un-parseable graphics or tables.',
    },
    {
      q: 'What is Truth Mode (Anti-Fabrication)?',
      a: 'Unlike generic AI bots that invent fake metrics (like "increased sales by 482%"), CareerForge AI strictly requires you to supply realistic baseline metrics or estimates. Our AI only structures your genuine achievements into the Google XYZ framework ("Accomplished X as measured by Y, by doing Z").',
    },
    {
      q: 'Can I use this if I am a college student or fresher with no experience?',
      a: 'Yes! CareerForge AI features a dedicated Fresher Mode that automatically restructures your resume to put coursework, academic projects, hackathons, and technical skills at the very top. Corporate work experience is never required.',
    },
    {
      q: 'What export formats are supported?',
      a: 'You can export pixel-perfect, vector-sharp PDF documents directly formatted for ATS reading, as well as Word (.docx) files, raw plain text copy, and one-click hosted portfolio websites.',
    },
    {
      q: 'How does the Job Description Matcher work?',
      a: 'Paste any job posting into the Matcher. Our engine scans for critical hard skills, soft competencies, and experience requirements, identifies missing keywords, and automatically generates a 4-week learning roadmap.',
    },
  ];

  return (
    <div className="space-y-24 py-6 animate-in fade-in duration-300">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden text-center max-w-5xl mx-auto px-4 pt-8 pb-12">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/20 blur-3xl pointer-events-none rounded-full"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 animate-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen AI Career Acceleration Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          <span className="text-slate-400">v2.4 Released</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
          Build a Resume That <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Gets You Noticed.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          Not just another resume maker. An all-in-one{' '}
          <strong className="text-white font-semibold">
            AI Resume Builder, ATS Analyzer, Job Matcher, and Interview Coach
          </strong>{' '}
          engineered to turn applications into offers with zero fake metrics.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-7 py-4 rounded-2xl shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
          >
            <FileEdit className="w-5 h-5" />
            <span>Create My Resume</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onCheckResume}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold px-6 py-4 rounded-2xl border border-slate-700/80 transition cursor-pointer text-sm sm:text-base shadow-lg"
          >
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>Check My Resume</span>
          </button>

          <button
            onClick={onNavigateToDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold px-6 py-4 rounded-2xl border border-slate-700/80 transition cursor-pointer text-sm sm:text-base shadow-lg"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span>Mission Control</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 mt-12 pt-8 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Zero-Fabrication Truth Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>100% ATS Compatible Vector PDFs</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Trusted by 50,000+ Job Seekers</span>
          </div>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE ATS SCORE PREVIEW BANNER */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
                Algorithmic Audit Preview
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                See How Top Recruiters & ATS Scanners Score Your Resume
              </h3>
            </div>
            <button
              onClick={onCheckResume}
              className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer self-start md:self-auto"
            >
              <span>Scan Your Resume Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">ATS Match Score</span>
                <span className="text-emerald-400 font-bold">92/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[92%]"></div>
              </div>
              <p className="text-[11px] text-slate-500">Passes enterprise filters in Workday & Greenhouse.</p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">STAR Quantified Impact</span>
                <span className="text-blue-400 font-bold">88/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-[88%]"></div>
              </div>
              <p className="text-[11px] text-slate-500">Google XYZ formula applied to 9 of 10 bullets.</p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Role Keywords Match</span>
                <span className="text-purple-400 font-bold">85/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full w-[85%]"></div>
              </div>
              <p className="text-[11px] text-slate-500">Core technologies, frameworks & libraries detected.</p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Weak Phrases Removed</span>
                <span className="text-teal-400 font-bold">100% Clean</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full w-full"></div>
              </div>
              <p className="text-[11px] text-slate-500">Zero passive fluff ("responsible for", "helped").</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 20-TEMPLATE SHOWCASE GALLERY */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Engineered for Every Career Stage
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            20 Professional, Field-Tested Templates
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            From single-column ATS-hardened layouts to modern two-column tech resumes and student portfolios.
          </p>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All 20 Templates' },
              { id: 'ats', label: 'ATS Compliant (4)' },
              { id: 'fresher', label: 'Student & Fresher (4)' },
              { id: 'technical', label: 'Technical & Data (4)' },
              { id: 'professional', label: 'Corporate & Executive (4)' },
              { id: 'creative', label: 'Modern & Portfolio (4)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedTemplateCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedTemplateCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-500/10 transition group flex flex-col justify-between"
            >
              {/* Thumbnail Representation */}
              <div className="h-44 bg-slate-950 p-4 border-b border-slate-800/80 relative flex flex-col justify-between overflow-hidden">
                {/* Visual miniature layout bars */}
                <div className="space-y-2 opacity-70 group-hover:opacity-100 transition">
                  <div className="h-3 w-1/2 rounded bg-blue-400/30"></div>
                  <div className="h-1.5 w-1/3 rounded bg-slate-700"></div>
                  <div className="h-1 w-full rounded bg-slate-800 mt-2"></div>
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-5/6 rounded bg-slate-800"></div>
                    <div className="h-1.5 w-4/6 rounded bg-slate-800"></div>
                    <div className="h-1.5 w-3/4 rounded bg-slate-800"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 uppercase font-semibold">{template.layout}</span>
                  {template.atsFriendly && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      ATS Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Template Info & Action */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onSelectTemplate(template.id);
                    onGetStarted();
                  }}
                  className="w-full text-xs font-semibold py-2 rounded-xl bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white transition cursor-pointer text-center"
                >
                  Use This Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THE 6-STEP CAREER PIPELINE FEATURE SHOWCASE */}
      <section className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            The Complete Career Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            From Blank Page to Signed Offer
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Everything you need across your job search lifecycle in a single unified workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Google XYZ STAR Generator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transform passive bullet points into quantifiable impact statements: "Accomplished [X] as measured by [Y], by doing [Z]".
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Truth Mode Anti-Fabrication</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never worry about hallucinated stats or exaggerated claims during an interview. Zero fake metrics guaranteed.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Job Matcher & 4-Week Roadmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare your resume side-by-side against any job description, uncover missing skills, and follow a weekly roadmap.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interview AI Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate 30s/60s/90s elevator pitches, answer resume-specific questions, and get evaluated on clarity, technical depth, and tone.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Job Pipeline Kanban</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track applications from Saved to Offer received. View response rate analytics, interview dates, and target notes.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Resume-to-Portfolio Website</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly turn your resume into a clean developer portfolio with a single click. Download index.html or host free on GitHub.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FRESHER MODE SPOTLIGHT */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-teal-950/40 via-blue-950/30 to-slate-900 border border-teal-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
                <GraduationCap className="w-4 h-4" />
                <span>Student & Fresher Mode</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                No Corporate Work Experience? No Problem.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Fresher Mode restructures your entire resume to highlight your strengths: academic projects, hackathons, open-source contributions, relevant coursework, and technical skills take center stage.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Project-first layout prioritizes GitHub repositories and live deployments.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>GitHub Profile Importer automatically adds your public repos in seconds.</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onGetStarted();
              }}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-2xl transition cursor-pointer shadow-lg shadow-teal-500/20 text-sm whitespace-nowrap"
            >
              Start in Student Mode →
            </button>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about CareerForge AI</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between text-sm font-semibold text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to Land Your Dream Job?
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Join thousands of candidates who transformed their applications into interviews with CareerForge AI.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5 cursor-pointer text-base"
        >
          Create My Resume Free →
        </button>
      </section>
    </div>
  );
};
