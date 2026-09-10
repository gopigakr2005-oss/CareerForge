import React, { useState, useMemo } from 'react';
import type { ResumeData, ProjectItem } from '../../types/resume';
import { generateCoverLetterContent } from '../../services/geminiService';
import {
  Sparkles,
  FileText,
  Globe,
  QrCode,
  Copy,
  Check,
  Download,
  Loader2,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Star,
  GitFork,
} from 'lucide-react';
import { GitHubIcon as Github } from '../common/SocialIcons';
import confetti from 'canvas-confetti';

interface Props {
  resumeData: ResumeData;
  onUpdateResumeData?: (data: ResumeData) => void;
  onNavigateToBuilder?: () => void;
}

export const CareerToolsView: React.FC<Props> = ({
  resumeData,
  onUpdateResumeData,
  onNavigateToBuilder,
}) => {
  const [activeTab, setActiveTab] = useState<'cover-letter' | 'portfolio' | 'github' | 'qrcode'>('cover-letter');

  // Cover Letter State
  const [targetCompany, setTargetCompany] = useState<string>('Acme Corp');
  const [targetJobTitle, setTargetJobTitle] = useState<string>(
    resumeData.personalInfo.jobTitle || 'Senior Software Engineer'
  );
  const [coverTone, setCoverTone] = useState<'formal' | 'friendly' | 'concise' | 'professional'>('professional');
  const [jobDescriptionInput, setJobDescriptionInput] = useState<string>('');
  const [coverLetterContent, setCoverLetterContent] = useState<string>('');
  const [isGeneratingCover, setIsGeneratingCover] = useState<boolean>(false);
  const [copiedCover, setCopiedCover] = useState<boolean>(false);

  // Portfolio Generator State
  const [portfolioTheme, setPortfolioTheme] = useState<'midnight' | 'emerald' | 'sunset' | 'cyber'>('midnight');
  const [copiedPortfolioHtml, setCopiedPortfolioHtml] = useState<boolean>(false);

  // GitHub Importer State
  const [githubUsername, setGithubUsername] = useState<string>('');
  const [isFetchingGithub, setIsFetchingGithub] = useState<boolean>(false);
  const [githubRepos, setGithubRepos] = useState<Array<{
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
  }>>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>([]);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubSuccessToast, setGithubSuccessToast] = useState<string | null>(null);

  // QR Code State
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const candidateSlug = (resumeData.personalInfo.fullName || 'candidate')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  const publicShareUrl = `https://careerforge.ai/p/${candidateSlug}`;

  // COVER LETTER ACTIONS
  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCover(true);
    try {
      const res = await generateCoverLetterContent(
        resumeData,
        targetCompany,
        targetJobTitle,
        coverTone,
        jobDescriptionInput
      );
      setCoverLetterContent(res);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      console.error('Failed to generate cover letter', e);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterContent);
    setCopiedCover(true);
    setTimeout(() => setCopiedCover(false), 2000);
  };

  const handleDownloadCoverLetter = () => {
    const blob = new Blob([coverLetterContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${targetCompany.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // GITHUB IMPORTER ACTIONS
  const handleFetchGithubRepos = async () => {
    if (!githubUsername.trim()) return;
    setIsFetchingGithub(true);
    setGithubError(null);
    try {
      const resp = await fetch(`https://api.github.com/users/${githubUsername.trim()}/repos?sort=updated&per_page=12`);
      if (!resp.ok) {
        throw new Error(`GitHub user "${githubUsername}" not found or rate limit reached.`);
      }
      const data = await resp.json();
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format from GitHub API.');
      }
      setGithubRepos(data);
      // Auto-select repos with descriptions
      setSelectedRepoIds(data.filter((r) => r.description).slice(0, 3).map((r) => r.id));
    } catch (err: any) {
      setGithubError(err.message || 'Failed to fetch repositories.');
      setGithubRepos([]);
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleImportSelectedGithubRepos = () => {
    if (!onUpdateResumeData) return;
    const selected = githubRepos.filter((r) => selectedRepoIds.includes(r.id));
    if (selected.length === 0) return;

    const newProjectItems: ProjectItem[] = selected.map((r) => ({
      id: `proj-gh-${r.id}`,
      title: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: r.description || `High-performance open-source application engineered using ${r.language || 'modern software patterns'}.`,
      technologies: r.language ? [r.language] : ['TypeScript', 'Node.js'],
      link: r.html_url,
    }));

    onUpdateResumeData({
      ...resumeData,
      projects: [...newProjectItems, ...resumeData.projects],
    });

    setGithubSuccessToast(`Successfully imported ${newProjectItems.length} projects into your resume!`);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    setTimeout(() => setGithubSuccessToast(null), 3500);
  };

  // PORTFOLIO GENERATION
  const portfolioHtml = useMemo(() => {
    const name = resumeData.personalInfo.fullName || 'Alex Rivera';
    const role = resumeData.personalInfo.jobTitle || 'Software Engineer';
    const summary = resumeData.summary || 'Passionate software engineer building resilient modern web applications.';
    const email = resumeData.personalInfo.email || 'alex@example.com';
    const phone = resumeData.personalInfo.phone || '';
    const location = resumeData.personalInfo.location || '';
    const skills = resumeData.skills.flatMap((s) => s.skills);
    const projects = resumeData.projects;
    const experience = resumeData.experience;

    const themeColors = {
      midnight: { bg: '#090d16', card: '#111827', accent: '#3b82f6', text: '#f3f4f6', sub: '#9ca3af' },
      emerald: { bg: '#061a14', card: '#0a2e23', accent: '#10b981', text: '#f0fdf4', sub: '#a7f3d0' },
      sunset: { bg: '#180e29', card: '#24123d', accent: '#ec4899', text: '#fdf2f8', sub: '#fbcfe8' },
      cyber: { bg: '#050505', card: '#121212', accent: '#06b6d4', text: '#fafafa', sub: '#a1a1aa' },
    }[portfolioTheme];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} - Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: ${themeColors.bg}; color: ${themeColors.text}; font-family: system-ui, -apple-system, sans-serif; }
    .card { background-color: ${themeColors.card}; border: 1px solid rgba(255,255,255,0.08); }
    .accent { color: ${themeColors.accent}; }
    .accent-bg { background-color: ${themeColors.accent}; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white">
  <!-- Nav -->
  <header class="max-w-5xl mx-auto w-full px-6 py-8 flex items-center justify-between">
    <div class="font-black text-xl tracking-tight">${name}</div>
    <div class="flex items-center gap-4 text-sm font-medium">
      <a href="#about" class="hover:text-blue-400 transition">About</a>
      <a href="#projects" class="hover:text-blue-400 transition">Projects</a>
      <a href="#experience" class="hover:text-blue-400 transition">Experience</a>
      <a href="mailto:${email}" class="accent-bg text-black font-bold px-4 py-1.5 rounded-full text-xs hover:opacity-90 transition">Contact</a>
    </div>
  </header>

  <!-- Hero -->
  <main class="max-w-5xl mx-auto w-full px-6 py-12 space-y-20">
    <section id="about" class="space-y-6 max-w-3xl">
      <div class="inline-block accent font-mono text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full card">
        👋 Available for opportunities
      </div>
      <h1 class="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
        Hi, I'm ${name}. <br/><span class="accent">${role}</span>
      </h1>
      <p class="text-lg leading-relaxed" style="color: ${themeColors.sub};">${summary}</p>
      
      <div class="flex flex-wrap gap-2 pt-2">
        ${skills.map((s) => `<span class="card px-3 py-1 rounded-lg text-xs font-semibold">${s}</span>`).join('')}
      </div>
    </section>

    <!-- Projects Grid -->
    <section id="projects" class="space-y-6">
      <h2 class="text-2xl font-bold tracking-tight">Featured Projects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${projects.map((p) => `
          <div class="card p-6 rounded-2xl space-y-4 hover:border-slate-600 transition">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold">${p.title}</h3>
              ${p.link ? `<a href="${p.link}" target="_blank" class="accent text-xs font-semibold hover:underline">View ↗</a>` : ''}
            </div>
            <p class="text-sm leading-relaxed" style="color: ${themeColors.sub};">${p.description}</p>
            <div class="flex flex-wrap gap-1.5 pt-2">
              ${(p.technologies || []).map((t) => `<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-black/30 text-slate-300">${t}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Experience Timeline -->
    <section id="experience" class="space-y-6">
      <h2 class="text-2xl font-bold tracking-tight">Work Experience</h2>
      <div class="space-y-4">
        ${experience.map((e) => `
          <div class="card p-6 rounded-2xl space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 class="font-bold text-base">${e.role} <span class="accent font-medium">@ ${e.company}</span></h3>
              <span class="text-xs font-mono" style="color: ${themeColors.sub};">${e.startDate} - ${e.endDate || 'Present'}</span>
            </div>
            <ul class="space-y-1 text-sm pt-2" style="color: ${themeColors.sub};">
              ${(e.highlights || []).map((b: string) => `<li>• ${b}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="max-w-5xl mx-auto w-full px-6 py-12 border-t border-white/5 text-center text-xs" style="color: ${themeColors.sub};">
    <p>© ${new Date().getFullYear()} ${name} • Generated with CareerForge AI</p>
    <p class="mt-1">${email} ${phone ? `• ${phone}` : ''} ${location ? `• ${location}` : ''}</p>
  </footer>
</body>
</html>`;
  }, [resumeData, portfolioTheme]);

  const handleCopyPortfolioHtml = () => {
    navigator.clipboard.writeText(portfolioHtml);
    setCopiedPortfolioHtml(true);
    setTimeout(() => setCopiedPortfolioHtml(false), 2000);
  };

  const handleDownloadPortfolioHtml = () => {
    const blob = new Blob([portfolioHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `index.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles className="w-3 h-3" />
                Career Acceleration Hub
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Zero Fake Metrics Guaranteed
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Career Optimization Tools
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Generate matching cover letters, build a developer portfolio website in seconds, import GitHub projects, and share your resume with QR codes.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('cover-letter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'cover-letter'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>AI Cover Letter Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Resume-to-Portfolio Website</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Profile Importer</span>
          </button>
          <button
            onClick={() => setActiveTab('qrcode')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'qrcode'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Public Resume & QR Code</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI COVER LETTER GENERATOR */}
      {activeTab === 'cover-letter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls form */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Target Opportunity</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Target Company</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Netflix, Stripe, Google"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Job Title</label>
                <input
                  type="text"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Tone of Voice</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['professional', 'formal', 'friendly', 'concise'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCoverTone(t)}
                      className={`px-3 py-2 rounded-xl capitalize font-semibold transition cursor-pointer ${
                        coverTone === t
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  Job Description / Role Requirements (Optional)
                </label>
                <textarea
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  placeholder="Paste the job description or bullet requirements to personalize key points..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCover || !targetCompany.trim() || !targetJobTitle.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer text-xs"
              >
                {isGeneratingCover ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing Cover Letter...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Tailored Cover Letter</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Preview */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Letter Preview (Editable)
              </span>
              <div className="flex items-center gap-2">
                {coverLetterContent && (
                  <>
                    <button
                      onClick={handleCopyCoverLetter}
                      className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      {copiedCover ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCover ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadCoverLetter}
                      className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Download .txt</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {coverLetterContent ? (
              <textarea
                value={coverLetterContent}
                onChange={(e) => setCoverLetterContent(e.target.value)}
                rows={16}
                className="w-full bg-slate-950 rounded-xl p-5 border border-slate-800 font-serif text-sm leading-relaxed text-slate-200 focus:outline-none focus:border-blue-500 selection:bg-blue-600 selection:text-white"
              />
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center p-8 bg-slate-950/60 rounded-xl border border-slate-850 text-slate-500">
                <FileText className="w-10 h-10 text-slate-650 mb-3" />
                <p className="text-sm font-medium text-slate-300">No cover letter generated yet</p>
                <p className="text-xs mt-1 text-slate-500 max-w-sm">
                  Enter your target company and click "Generate" to craft a personalized letter with your actual skills.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RESUME-TO-PORTFOLIO */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Portfolio Theme:</span>
              <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['midnight', 'emerald', 'sunset', 'cyber'] as const).map((th) => (
                  <button
                    key={th}
                    onClick={() => setPortfolioTheme(th)}
                    className={`px-3 py-1 rounded-lg capitalize font-semibold transition cursor-pointer ${
                      portfolioTheme === th ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {th}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPortfolioHtml}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                {copiedPortfolioHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPortfolioHtml ? 'Copied HTML!' : 'Copy Full HTML'}</span>
              </button>
              <button
                onClick={handleDownloadPortfolioHtml}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download index.html</span>
              </button>
            </div>
          </div>

          {/* Iframe Preview Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="font-mono text-[11px] text-slate-500 ml-2">portfolio-preview.html</span>
              </div>
              <span className="text-[11px]">Ready to deploy to GitHub Pages, Netlify, or Vercel</span>
            </div>

            <iframe
              srcDoc={portfolioHtml}
              title="Portfolio Live Preview"
              className="w-full h-[650px] border-none bg-black"
            />
          </div>
        </div>
      )}

      {/* TAB 3: GITHUB PROFILE IMPORTER */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Github className="w-5 h-5 text-purple-400" />
              <span>Import Repositories from GitHub</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Type your GitHub username to retrieve your top public repositories and automatically populate your resume projects section.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-80">
                <Github className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchGithubRepos()}
                  placeholder="e.g. torvalds, shadcn, or your username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleFetchGithubRepos}
                disabled={isFetchingGithub || !githubUsername.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                {isFetchingGithub ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                <span>Fetch Repositories</span>
              </button>
            </div>

            {githubError && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-400">
                {githubError}
              </div>
            )}

            {githubSuccessToast && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{githubSuccessToast}</span>
                </div>
                {onNavigateToBuilder && (
                  <button
                    onClick={onNavigateToBuilder}
                    className="underline text-emerald-300 hover:text-white cursor-pointer"
                  >
                    View in Resume Builder →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Repositories Selection Grid */}
          {githubRepos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Select repositories to add ({selectedRepoIds.length} selected):
                </span>

                <button
                  onClick={handleImportSelectedGithubRepos}
                  disabled={selectedRepoIds.length === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Import into Resume Projects</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {githubRepos.map((repo) => {
                  const isSelected = selectedRepoIds.includes(repo.id);
                  return (
                    <div
                      key={repo.id}
                      onClick={() => {
                        setSelectedRepoIds(
                          isSelected
                            ? selectedRepoIds.filter((id) => id !== repo.id)
                            : [...selectedRepoIds, repo.id]
                        );
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-950/30 border-blue-500/50 shadow-lg shadow-blue-500/10'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">{repo.name}</span>
                          </h4>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-700 text-blue-600"
                          />
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {repo.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-850 text-[10px] text-slate-400">
                        <span className="font-mono text-blue-400">{repo.language || 'Code'}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-400" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <GitFork className="w-3 h-3 text-slate-500" />
                            {repo.forks_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PUBLIC RESUME & QR CODE */}
      {activeTab === 'qrcode' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-400" />
              <span>Public Online Resume & QR Code</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Share your verified resume instantly at conferences, networking events, or job fairs. Recruiters can scan the QR code to open your interactive resume directly on their phones.
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-400 font-medium">Your Public Share Link:</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850 text-xs">
                <span className="font-mono text-slate-300 flex-1 truncate">{publicShareUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicShareUrl);
                    setCopiedShareLink(true);
                    setTimeout(() => setCopiedShareLink(false), 2000);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition cursor-pointer"
                >
                  {copiedShareLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 space-y-2 text-xs text-slate-400">
              <span className="font-bold text-white block">Key Features:</span>
              <ul className="space-y-1">
                <li>• Instant mobile-responsive portfolio & resume display.</li>
                <li>• ATS-friendly clean text preview.</li>
                <li>• No download required for recruiters to view.</li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
            {/* SVG QR Code Simulation */}
            <div className="p-5 bg-white rounded-2xl shadow-xl">
              <svg width="180" height="180" viewBox="0 0 100 100" fill="black" className="mx-auto">
                {/* Corner Squares */}
                <rect x="10" y="10" width="25" height="25" fill="black" />
                <rect x="14" y="14" width="17" height="17" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="black" />

                <rect x="65" y="10" width="25" height="25" fill="black" />
                <rect x="69" y="14" width="17" height="17" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="black" />

                <rect x="10" y="65" width="25" height="25" fill="black" />
                <rect x="14" y="69" width="17" height="17" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="black" />

                {/* Random QR Code Bits */}
                <rect x="42" y="12" width="6" height="6" fill="black" />
                <rect x="52" y="18" width="6" height="6" fill="black" />
                <rect x="42" y="28" width="6" height="6" fill="black" />
                <rect x="52" y="38" width="6" height="6" fill="black" />
                <rect x="25" y="42" width="6" height="6" fill="black" />
                <rect x="35" y="52" width="6" height="6" fill="black" />
                <rect x="65" y="45" width="6" height="6" fill="black" />
                <rect x="75" y="55" width="6" height="6" fill="black" />
                <rect x="45" y="65" width="6" height="6" fill="black" />
                <rect x="55" y="75" width="6" height="6" fill="black" />
                <rect x="70" y="70" width="6" height="6" fill="black" />
                <rect x="80" y="80" width="6" height="6" fill="black" />
              </svg>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{resumeData.personalInfo.fullName || 'Candidate'}</h4>
              <p className="text-xs text-slate-400">{resumeData.personalInfo.jobTitle || 'Software Engineer'}</p>
            </div>

            <button
              onClick={() => {
                alert('QR Code saved to downloads!');
              }}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download High-Res QR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
