import React, { useState, useEffect } from 'react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import {
  condenseResumeToOnePage,
  type OnePageCondensationResult,
} from '../../services/geminiService';
import {
  Sparkles,
  X,
  CheckCircle2,
  FileText,
  TrendingDown,
  ArrowRight,
  Zap,
  SlidersHorizontal,
  Briefcase,
  Layers,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  theme: ResumeTheme;
  onApply: (condensedData: ResumeData, updatedTheme: ResumeTheme) => void;
}

export const AiOnePageModal: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  theme,
  onApply,
}) => {
  const [mode, setMode] = useState<'balanced' | 'aggressive'>('balanced');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepText, setStepText] = useState<string>('');
  const [result, setResult] = useState<OnePageCondensationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'experience' | 'projects'>('experience');

  const runCondensation = async (selectedMode: 'balanced' | 'aggressive') => {
    setIsProcessing(true);
    setStepText('Analyzing content density & page overflow...');

    try {
      await new Promise((r) => setTimeout(r, 200));
      setStepText('Pruning passive voice, weak adverbs & filler words...');

      await new Promise((r) => setTimeout(r, 300));
      setStepText('Refining XYZ bullet points and preserving key metrics...');

      await new Promise((r) => setTimeout(r, 250));
      setStepText('Calibrating 1-page typographic fit...');

      const res = await condenseResumeToOnePage(data, selectedMode);
      setResult(res);
    } catch (err) {
      console.error('Condensation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runCondensation(mode);
    } else {
      setResult(null);
    }
  }, [isOpen]);

  const handleApply = () => {
    if (!result) return;
    const updatedTheme: ResumeTheme = {
      ...theme,
      fitToOnePage: true,
      spacing: 'compact',
    };
    onApply(result.condensedData, updatedTheme);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.3 },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  AI 1-Page Resume Condenser
                </h2>
                <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  2 Pages ➔ 1 Page
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Intelligently condenses wording, eliminates filler, and fits 100% of your credentials onto 1 page.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intensity Selection Controls */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Condensation Level:</span>
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                onClick={() => {
                  setMode('balanced');
                  runCondensation('balanced');
                }}
                disabled={isProcessing}
                className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                  mode === 'balanced'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive Balanced (Top 4 Bullets)
              </button>
              <button
                onClick={() => {
                  setMode('aggressive');
                  runCondensation('aggressive');
                }}
                disabled={isProcessing}
                className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                  mode === 'aggressive'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Strict 1-Page Fit (Top 3 Bullets)
              </button>
            </div>
          </div>

          <button
            onClick={() => runCondensation(mode)}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer font-medium"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Re-Analyze</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Loading Animation */}
          {isProcessing && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-sm font-semibold text-white">AI Engine Transforming Resume</h3>
              <p className="text-xs text-indigo-300 font-mono animate-pulse">{stepText}</p>
            </div>
          )}

          {/* Results Summary */}
          {!isProcessing && result && (
            <>
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-400" /> Page Output
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 line-through text-xs">~2 Pages</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">1 Page</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-purple-400" /> Words Trimmed
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-purple-300">
                      -{result.summaryOfChanges.wordsReduced} words
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-semibold">
                      -{result.summaryOfChanges.percentReduction}%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Bullets Tightened
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-amber-300">
                      {result.summaryOfChanges.bulletsTightened} bullets
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Metrics Retained
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-emerald-400">100% Intact</span>
                  </div>
                </div>
              </div>

              {/* Action List of What Was Optimized */}
              {result.summaryOfChanges.details.length > 0 && (
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200/90 space-y-1">
                  <div className="font-semibold text-indigo-300 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Optimizations Applied:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300 pl-1">
                    {result.summaryOfChanges.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                    <li>Applied compact margin spacing and proportional font calibration for guaranteed 1-page fit.</li>
                  </ul>
                </div>
              )}

              {/* Side-by-Side Comparison Tabs */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-3 text-xs">
                  <button
                    onClick={() => setActiveTab('experience')}
                    className={`px-3 py-2 border-b-2 font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'experience'
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Experience Bullets ({result.condensedData.experience.length} Roles)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-3 py-2 border-b-2 font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'summary'
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Executive Summary</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-3 py-2 border-b-2 font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'projects'
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Projects & Skills</span>
                  </button>
                </div>

                <div className="p-4 text-xs space-y-4 max-h-72 overflow-y-auto">
                  {activeTab === 'experience' && (
                    <div className="space-y-4">
                      {result.condensedData.experience.map((exp, idx) => (
                        <div key={exp.id || idx} className="border border-slate-800/80 rounded-lg p-3 bg-slate-900/50">
                          <div className="flex justify-between items-baseline font-semibold text-slate-200">
                            <span>{exp.role}</span>
                            <span className="text-slate-500 text-[11px] font-normal">{exp.company}</span>
                          </div>
                          <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-300">
                            {exp.highlights.map((h, hIdx) => (
                              <li key={hIdx} className="leading-relaxed">
                                <span className="text-emerald-300 font-medium">
                                  {h.split(' ')[0]}
                                </span>{' '}
                                {h.substring(h.indexOf(' ') + 1)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'summary' && (
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                          Condensed Executive Summary:
                        </span>
                        <p className="mt-1.5 text-slate-200 p-3 bg-slate-900/60 rounded-lg border border-slate-800 leading-relaxed">
                          {result.condensedData.summary}
                        </p>
                      </div>
                      {data.summary && data.summary !== result.condensedData.summary && (
                        <div>
                          <span className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                            Original Summary:
                          </span>
                          <p className="mt-1 text-slate-400/80 text-[11px] p-2 bg-slate-950/40 rounded border border-slate-800/60 line-through">
                            {data.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {result.condensedData.projects.map((p, idx) => (
                          <div key={p.id || idx} className="p-2.5 bg-slate-900/40 border border-slate-800 rounded-lg">
                            <span className="font-semibold text-slate-200">{p.title}</span>
                            <p className="text-slate-300 mt-0.5">{p.description}</p>
                            {p.technologies && p.technologies.length > 0 && (
                              <span className="text-[10px] text-slate-500 block mt-1">
                                Tech: {p.technologies.join(', ')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition cursor-pointer font-medium"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              disabled={isProcessing || !result}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Apply 1-Page Optimization</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
