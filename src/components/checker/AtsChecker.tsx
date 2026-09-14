import React, { useState, useEffect, useMemo } from 'react';
import type {
  ResumeData,
  AtsAnalysisResult,
  TargetRole,
  ExperienceLevel,
  AtsCheckMode,
} from '../../types/resume';
import {
  analyzeResume,
  resumeDataToText,
  extractBulletPoints,
} from '../../services/atsAnalyzer';
import { ROLE_BENCHMARKS, ROLE_LIST } from '../../data/roleBenchmarks';
import { getSampleResumeForRole } from '../../data/sampleResumes';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  FileText,
  TrendingUp,
  Sparkles,
  Search,
  Zap,
  ShieldCheck,
  RefreshCw,
  FileEdit,
  GraduationCap,
  Copy,
  Check,
  Info,
  Layers,
  Sparkle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  currentResume: ResumeData;
  onApplyFixToResume?: (bulletIdx: number, newText: string) => void;
  onNavigateToBuilder?: () => void;
  onLoadSampleResume?: (resume: ResumeData) => void;
}

export const AtsChecker: React.FC<Props> = ({
  currentResume,
  onNavigateToBuilder,
  onLoadSampleResume,
}) => {
  // Role & Level State
  const [selectedRole, setSelectedRole] = useState<TargetRole>('data-scientist');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('fresher');
  const [checkMode, setCheckMode] = useState<AtsCheckMode>('role-preset');

  // Active view tab: report vs raw ATS plain-text parser preview
  const [resultsTab, setResultsTab] = useState<'report' | 'raw-ats'>('report');
  const [copiedAtsText, setCopiedAtsText] = useState<boolean>(false);

  // Input Text State
  const [sourceMode, setSourceMode] = useState<'current' | 'custom'>('current');
  const [customResumeText, setCustomResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [copiedSkills, setCopiedSkills] = useState<boolean>(false);

  // Active benchmark definition
  const currentBenchmark = ROLE_BENCHMARKS[selectedRole] || ROLE_BENCHMARKS['data-scientist'];

  // Resume text to analyze
  const activeResumeText = useMemo(() => {
    if (sourceMode === 'current') {
      return resumeDataToText(currentResume);
    }
    return customResumeText;
  }, [sourceMode, currentResume, customResumeText]);

  // Bullet points list
  const activeBullets = useMemo(() => {
    if (sourceMode === 'current') {
      return extractBulletPoints(currentResume);
    }
    return undefined;
  }, [sourceMode, currentResume]);

  // Compute ATS analysis results
  const [results, setResults] = useState<AtsAnalysisResult>(() =>
    analyzeResume(
      activeResumeText,
      jobDescription,
      activeBullets,
      currentBenchmark,
      experienceLevel,
      checkMode,
      sourceMode === 'current' ? currentResume : undefined
    )
  );

  const runAnalysis = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = analyzeResume(
        activeResumeText,
        jobDescription,
        activeBullets,
        currentBenchmark,
        experienceLevel,
        checkMode,
        sourceMode === 'current' ? currentResume : undefined
      );
      setResults(res);
      setIsScanning(false);
      if (res.overallScore >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }, 200);
  };

  // Re-run whenever role, level, checkMode, resume text, or JD changes
  useEffect(() => {
    runAnalysis();
  }, [
    selectedRole,
    experienceLevel,
    checkMode,
    sourceMode,
    currentResume,
    customResumeText,
    jobDescription,
  ]);

  // Load sample resume for the active role & level
  const handleLoadSample = () => {
    const sample = getSampleResumeForRole(selectedRole, experienceLevel);
    if (onLoadSampleResume) {
      onLoadSampleResume(sample);
    }
  };

  // Populate benchmark sample JD into custom JD textarea
  const handleLoadSampleJd = () => {
    setJobDescription(currentBenchmark.sampleJobDescription);
    setCheckMode('custom-jd');
  };

  // Copy missing skills to clipboard
  const handleCopyMissingSkills = () => {
    const textToCopy = results.missingRoleSkills.join(', ');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedSkills(true);
      setTimeout(() => setCopiedSkills(false), 2000);
    });
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 65) return 'text-blue-400 stroke-blue-500';
    if (score >= 50) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (score >= 65) return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Role & Level Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">AI ATS Resume Checker & Role Calibrator</h2>
              {currentResume.personalInfo.fullName && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  {currentResume.personalInfo.fullName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deep scan your resume against industry benchmarks for specialized tech roles or custom job descriptions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToBuilder && (
              <button
                onClick={onNavigateToBuilder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
                title="Switch to Resume Builder to edit details"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Edit in Builder</span>
              </button>
            )}

            <button
              onClick={runAnalysis}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Rescan'}</span>
            </button>

            {onLoadSampleResume && (
              <button
                onClick={handleLoadSample}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition"
                title={`Load curated sample resume for ${currentBenchmark.title} (${experienceLevel})`}
              >
                <Sparkle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Load {currentBenchmark.title} Sample</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: Select Target Role */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Target Role</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {ROLE_LIST.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-900/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{role.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{role.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Select Experience Level (3 Options: Fresher, Mid-Level, Senior) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select Experience Level (3 Calibration Options)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              ATS scoring automatically recalibrates weights & penalties
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => setExperienceLevel('fresher')}
              className={`p-3 rounded-xl text-left border transition-all ${
                experienceLevel === 'fresher'
                  ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-md shadow-emerald-900/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                <span>🌱 Fresher (0–1 yrs / Student)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                <strong>0% penalty</strong> for missing corporate work experience. Scored on Projects, Core Foundations & Education.
              </p>
            </button>

            <button
              onClick={() => setExperienceLevel('mid')}
              className={`p-3 rounded-xl text-left border transition-all ${
                experienceLevel === 'mid'
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-900/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
                <span>⚡ Mid-Level (2–4 yrs)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                Evaluates production accomplishments, role tools, quantified metrics, and autonomous delivery.
              </p>
            </button>

            <button
              onClick={() => setExperienceLevel('senior')}
              className={`p-3 rounded-xl text-left border transition-all ${
                experienceLevel === 'senior'
                  ? 'bg-purple-600/15 border-purple-500 text-white shadow-md shadow-purple-900/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-purple-400">
                <span>🏆 Senior / Lead (5+ yrs)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                Evaluates business ROI metrics (\$, %), systems architecture, leadership verbs, and team scale.
              </p>
            </button>
          </div>
        </div>

        {/* Dynamic Role Benchmark Notice Banner */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">
                Grading as: {currentBenchmark.title} ({experienceLevel === 'fresher' ? 'Fresher' : experienceLevel === 'mid' ? 'Mid-Level' : 'Senior/Lead'})
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {experienceLevel === 'fresher' && currentBenchmark.fresherExpectations[0]}
                {experienceLevel === 'mid' && currentBenchmark.midExpectations[0]}
                {experienceLevel === 'senior' && currentBenchmark.seniorExpectations[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLoadSampleJd}
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 underline"
            >
              Load {currentBenchmark.title} JD
            </button>
          </div>
        </div>

        {/* STEP 3: Evaluation Mode & Source Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-800">
          {/* Dual Check Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCheckMode('role-preset')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                checkMode === 'role-preset'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Role Benchmark Mode</span>
            </button>
            <button
              onClick={() => setCheckMode('custom-jd')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                checkMode === 'custom-jd'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Custom Job Description Match</span>
            </button>
          </div>

          {/* Active Resume vs Custom Text Source */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSourceMode('current')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                sourceMode === 'current'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Resume
            </button>
            <button
              onClick={() => setSourceMode('custom')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                sourceMode === 'custom'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Raw Text
            </button>
          </div>
        </div>

        {/* Custom Resume Raw Textarea */}
        {sourceMode === 'custom' && (
          <div className="pt-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Paste Raw Resume Text</label>
            <textarea
              rows={4}
              placeholder="Paste raw text of any resume here..."
              value={customResumeText}
              onChange={(e) => setCustomResumeText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500 font-mono leading-relaxed"
            />
          </div>
        )}

        {/* Custom Job Description Input (Always visible or highlighted when in custom-jd mode) */}
        {checkMode === 'custom-jd' && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Target Job Description (Direct Match Analysis)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSampleJd}
                  className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Use {currentBenchmark.title} JD
                </button>
                <button
                  onClick={() => setJobDescription('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              placeholder={`Paste the job description for ${currentBenchmark.title} here to test exact keyword match %...`}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-blue-500 leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* View Mode Tab Switcher: Compliance Report vs Simulated Raw ATS Parser View */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResultsTab('report')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              resultsTab === 'report'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>ATS Compliance Report</span>
          </button>
          <button
            onClick={() => setResultsTab('raw-ats')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              resultsTab === 'raw-ats'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Simulated Raw ATS Parser View</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>6-Category Weighted ATS Algorithm (100% Calibrated)</span>
        </div>
      </div>

      {/* Tab 1: Simulated Raw ATS Parser View */}
      {resultsTab === 'raw-ats' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Simulated Enterprise ATS Plain-Text Stream</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enterprise ATS software (Workday, Taleo, Greenhouse, Lever) converts formatted resumes into plain text before scanning.
              </p>
            </div>
            <button
              onClick={() => {
                if (results.rawAtsText) {
                  navigator.clipboard.writeText(results.rawAtsText);
                  setCopiedAtsText(true);
                  setTimeout(() => setCopiedAtsText(false), 2000);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition self-start sm:self-auto cursor-pointer"
            >
              {copiedAtsText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Plain Text!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ATS Plain Text</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px]">
            {results.rawAtsText}
          </pre>
        </div>
      ) : (
        /* Tab 2: Main Results Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Overall Score Meter & Category Gauges */}
          <div className="space-y-6">
            {/* Radial Score Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                <span>Overall ATS Score</span>
                <span className="text-blue-400">•</span>
                <span className="text-slate-300">{currentBenchmark.title}</span>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={getScoreColor(results.overallScore)}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - results.overallScore / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white font-mono">{results.overallScore}</span>
                  <span className="text-[11px] text-slate-400 uppercase font-medium mt-0.5">out of 100</span>
                </div>
              </div>

              {/* Rating Tag */}
              <div className="mt-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getScoreBg(
                    results.overallScore
                  )}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {results.overallScore >= 80
                    ? 'Strong ATS Pass Rate'
                    : results.overallScore >= 65
                    ? 'Good - Minor Tweaks Needed'
                    : 'Needs ATS Optimization'}
                </span>
              </div>

              {/* Calibration Notice */}
              <div className="mt-3 text-[11px] text-slate-400">
                Calibrated for: <span className="text-white font-semibold capitalize">{experienceLevel}</span>
                {experienceLevel === 'fresher' && (
                  <span className="text-emerald-400 block mt-0.5">✓ No work experience penalty</span>
                )}
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] uppercase">Core Skills Matched</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {results.matchedRoleSkills.length} / {currentBenchmark.coreSkills.length}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] uppercase">Quantified Bullets</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {results.quantifiedRatio}%
                  </div>
                </div>
              </div>
            </div>

            {/* 10-Point Itemized ATS Audit Checklist */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>10-Point ATS Compliance Audit</span>
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {results.checklist.filter((c) => c.passed).length} / {results.checklist.length} Passed
                </span>
              </div>

              <div className="space-y-2.5">
                {results.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border space-y-1 text-xs transition ${
                      item.passed
                        ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        : 'bg-amber-950/20 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.category && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline">
                            {item.category}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.passed
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          }`}
                        >
                          {item.passed ? 'Passed' : 'Attention'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight pl-6">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>

          {/* Category Breakdown Bars */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Scoring Weight Breakdown
            </h3>

            <div className="space-y-3.5">
              {results.categoryScores.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">
                      {cat.name}{' '}
                      <span className="text-slate-500 text-[10px]">({cat.weight}% weight)</span>
                    </span>
                    <span className="font-mono font-bold text-white">{cat.score}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.score >= 80
                          ? 'bg-emerald-500'
                          : cat.score >= 60
                          ? 'bg-blue-500'
                          : cat.score >= 40
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{cat.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Role Skills Match, Custom JD Match, Weak Phrases, AI Action Roadmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role Skills Alignment Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{currentBenchmark.title} Skill Alignment</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Core competencies evaluated by recruiters and ATS filters for this role
                </p>
              </div>

              {results.missingRoleSkills.length > 0 && (
                <button
                  onClick={handleCopyMissingSkills}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700 self-start sm:self-auto"
                >
                  {copiedSkills ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Missing Skills</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Matched Skills */}
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Matched Role Skills ({results.matchedRoleSkills.length})</span>
              </div>
              {results.matchedRoleSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {results.matchedRoleSkills.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No direct matching core skills found yet.</p>
              )}
            </div>

            {/* Missing Skills */}
            {results.missingRoleSkills.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Missing High-Priority Skills ({results.missingRoleSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {results.missingRoleSkills.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 italic">
                  💡 Tip: Incorporate these foundational terms into your Projects, Skills, or Experience bullets to satisfy ATS role filters.
                </p>
              </div>
            )}
          </div>

          {/* Custom Job Description Alignment Card (if in custom-jd mode or JD is active) */}
          {(checkMode === 'custom-jd' || (jobDescription && jobDescription.trim().length > 20)) && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <span>Custom Job Description Match</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {results.matchedKeywords.length} Matched / {results.missingKeywords.length} Missing
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Matched JD Terms</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {results.matchedKeywords.slice(0, 15).map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {results.missingKeywords.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missing JD Requirements</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.missingKeywords.slice(0, 15).map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weak Phrases & Passive Voice Detector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Passive Language & Cliché Detector</span>
              </h3>
              <span className="text-xs text-slate-400">
                {results.weakPhrases.length} flags found
              </span>
            </div>

            {results.weakPhrases.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Excellent! No passive voice, vague duties, or generic cliches were detected in your resume.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {results.weakPhrases.map((phrase, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-400 line-through">
                        "{phrase.original}"
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Flagged</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{phrase.reason}</p>
                    <div className="text-emerald-400 font-medium text-[11px] flex items-center gap-1 pt-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{phrase.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actionable AI Optimization Roadmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                Prioritized Improvement Roadmap ({currentBenchmark.title} • {experienceLevel})
              </h3>
            </div>

            <div className="space-y-2.5">
              {results.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
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
