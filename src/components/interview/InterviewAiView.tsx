import React, { useState, useEffect, useMemo } from 'react';
import type { ResumeData, MockInterviewQuestion } from '../../types/resume';
import {
  generateElevatorPitch,
  generateInterviewQuestionBank,
  evaluateInterviewAnswer,
} from '../../services/geminiService';
import {
  Mic,
  Sparkles,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Award,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Send,
  Loader2,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  resumeData: ResumeData;
  targetRole?: string;
  onNavigateToBuilder?: () => void;
}

export const InterviewAiView: React.FC<Props> = ({
  resumeData,
  targetRole,
}) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'bank' | 'simulator'>('pitch');

  // Pitch State
  const [pitchDuration, setPitchDuration] = useState<'30s' | '60s' | '90s'>('60s');
  const [pitchTone, setPitchTone] = useState<'confident' | 'technical' | 'conversational'>('confident');
  const [pitchData, setPitchData] = useState<{
    pitch: string;
    bulletPoints: string[];
    estimatedWordCount: number;
  }>({
    pitch: '',
    bulletPoints: [],
    estimatedWordCount: 0,
  });
  const [isGeneratingPitch, setIsGeneratingPitch] = useState<boolean>(false);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  // Pitch Timer State
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Question Bank State
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hr' | 'technical' | 'project' | 'job-specific'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [expandedHintId, setExpandedHintId] = useState<string | null>(null);
  const [customQuestionInput, setCustomQuestionInput] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Simulator State
  const [activeSimulatorQuestion, setActiveSimulatorQuestion] = useState<MockInterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    relevance: number;
    clarity: number;
    confidence: number;
    technical: number;
    communication: number;
    strengths: string[];
    improvements: string[];
    modelAnswer: string;
  } | null>(null);
  const [simTimerSeconds, setSimTimerSeconds] = useState<number>(0);
  const [simTimerActive, setSimTimerActive] = useState<boolean>(false);

  const handleGeneratePitch = async () => {
    setIsGeneratingPitch(true);
    try {
      const res = await generateElevatorPitch(resumeData, pitchDuration, pitchTone);
      setPitchData(res);
    } catch (e) {
      console.error('Failed to generate pitch', e);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const bank = await generateInterviewQuestionBank(resumeData, targetRole);
      setQuestions(bank);
      if (bank.length > 0 && !activeSimulatorQuestion) {
        setActiveSimulatorQuestion(bank[0]);
      }
    } catch (e) {
      console.error('Failed to load questions', e);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Initial Load for Pitch
  useEffect(() => {
    handleGeneratePitch();
  }, [pitchDuration, pitchTone]);

  // Initial Load for Question Bank
  useEffect(() => {
    loadQuestions();
  }, [resumeData]);

  // Pitch timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Simulator timer effect
  useEffect(() => {
    let interval: any = null;
    if (simTimerActive) {
      interval = setInterval(() => {
        setSimTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [simTimerActive]);

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitchData.pitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleStartPracticeInSim = (q: MockInterviewQuestion) => {
    setActiveSimulatorQuestion(q);
    setUserAnswer('');
    setEvaluationResult(null);
    setSimTimerSeconds(0);
    setSimTimerActive(true);
    setActiveTab('simulator');
  };

  const handleEvaluateAnswer = async () => {
    if (!activeSimulatorQuestion || !userAnswer.trim()) return;
    setIsEvaluating(true);
    setSimTimerActive(false);
    try {
      const evalRes = await evaluateInterviewAnswer(
        activeSimulatorQuestion.question,
        userAnswer,
        resumeData
      );
      setEvaluationResult(evalRes);
      if (evalRes.score >= 80) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (e) {
      console.error('Evaluation failed', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAddCustomQuestion = () => {
    if (!customQuestionInput.trim()) return;
    const newQ: MockInterviewQuestion = {
      id: `custom-${Date.now()}`,
      category: 'job-specific',
      question: customQuestionInput.trim(),
      sampleAnswer: 'Use the STAR format: Outline context, your specific contributions, and the final impact.',
    };
    setQuestions([newQ, ...questions]);
    setCustomQuestionInput('');
    setShowCustomModal(false);
    handleStartPracticeInSim(newQ);
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
      const matchesSearch =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.sampleAnswer?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [questions, selectedCategory, searchQuery]);

  const targetRoleDisplay = targetRole || resumeData.personalInfo.jobTitle || 'Software Professional';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles className="w-3 h-3" />
                AI Career Co-Pilot
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Truth Mode Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Interview AI Suite
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Sharpen your elevator pitch, drill into resume-specific project questions, and simulate real interview conversations with instant scoring and feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 self-start md:self-auto">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Candidate Role</span>
              <span className="font-semibold text-white">{targetRoleDisplay}</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'pitch'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>"Tell Me About Yourself" Pitch</span>
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'bank'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Question Bank ({questions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Interactive Mock Simulator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ELEVATOR PITCH */}
      {activeTab === 'pitch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pitch Editor & Script Pane */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Target Length:</span>
                  <div className="inline-flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    {(['30s', '60s', '90s'] as const).map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setPitchDuration(dur)}
                        className={`px-3 py-1 rounded-md transition font-semibold cursor-pointer ${
                          pitchDuration === dur
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {dur === '30s' ? '30s (Quick)' : dur === '60s' ? '60s (Standard)' : '90s (Executive)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Tone:</span>
                  <select
                    value={pitchTone}
                    onChange={(e) => setPitchTone(e.target.value as any)}
                    aria-label="Pitch Tone"
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="confident">Confident & Direct</option>
                    <option value="technical">Technical & Deep</option>
                    <option value="conversational">Warm & Conversational</option>
                  </select>

                  <button
                    onClick={handleGeneratePitch}
                    disabled={isGeneratingPitch}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                  >
                    {isGeneratingPitch ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Pitch Script Box */}
              <div className="relative bg-slate-950/80 rounded-xl p-6 border border-slate-800/80 min-h-[180px]">
                {isGeneratingPitch ? (
                  <div className="flex flex-col items-center justify-center h-44 gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-xs font-medium">Synthesizing personalized pitch from your resume...</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pb-2 border-b border-slate-850">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Mic className="w-3.5 h-3.5 text-blue-400" />
                        Spoken Teleprompter Script
                      </span>
                      <span>
                        ~{pitchData.estimatedWordCount} words • Spoken pace: ~
                        {pitchDuration === '30s' ? '30 sec' : pitchDuration === '60s' ? '1 min' : '1.5 min'}
                      </span>
                    </div>

                    <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-normal font-sans selection:bg-blue-600 selection:text-white">
                      "{pitchData.pitch}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPitch}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition border border-slate-700 cursor-pointer"
                  >
                    {copiedPitch ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => {
                    const pitchQ: MockInterviewQuestion = {
                      id: 'pitch-practice',
                      category: 'hr',
                      question: 'Tell me about yourself and walk me through your background.',
                      sampleAnswer: pitchData.pitch,
                    };
                    handleStartPracticeInSim(pitchQ);
                  }}
                  className="flex items-center gap-2 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  <span>Practice in Mock Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Practice Timer & Anchor Beats Pane */}
          <div className="lg:col-span-4 space-y-6">
            {/* Rehearsal Stopwatch */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-blue-400" />
                  Rehearsal Timer
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Target: {pitchDuration}
                </span>
              </div>

              <div className="text-center py-4 bg-slate-950/80 rounded-xl border border-slate-850">
                <div className="text-4xl font-mono font-bold text-white tracking-wider">
                  {Math.floor(timerSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(timerSeconds % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {timerActive ? 'Speaking now... keep eye contact!' : 'Press Start and speak aloud'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    timerActive
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{timerActive ? 'Pause' : 'Start Timer'}</span>
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(0);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Anchor Beats / Talking Points */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Anchor Talking Points
              </span>
              <p className="text-xs text-slate-400">
                Memorize the sequence of beats rather than word-for-word so you sound natural:
              </p>

              <div className="space-y-2 mt-2">
                {pitchData.bulletPoints.map((beat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{beat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { id: 'all', label: 'All Questions' },
                  { id: 'hr', label: 'HR & Behavioral' },
                  { id: 'technical', label: 'Technical' },
                  { id: 'project', label: 'My Projects' },
                  { id: 'job-specific', label: 'Role Specific' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right actions: search + add custom */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full md:w-56 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowCustomModal(true)}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Custom</span>
              </button>
            </div>
          </div>

          {/* Questions Grid */}
          {isLoadingQuestions ? (
            <div className="flex flex-col items-center justify-center p-16 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs">Generating role-specific questions from your resume...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">No interview questions match your filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs text-blue-400 hover:underline mt-2 inline-block cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuestions.map((q) => {
                const isExpanded = expandedHintId === q.id;
                const categoryColor =
                  q.category === 'hr'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : q.category === 'technical'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : q.category === 'project'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                return (
                  <div
                    key={q.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between group shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColor}`}
                        >
                          {q.category === 'hr'
                            ? 'HR / Behavioral'
                            : q.category === 'technical'
                            ? 'Technical Stack'
                            : q.category === 'project'
                            ? 'Resume Project'
                            : 'Role Specific'}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition leading-snug">
                        {q.question}
                      </h3>

                      {/* STAR Hint Accordion */}
                      {q.sampleAnswer && (
                        <div>
                          <button
                            onClick={() => setExpandedHintId(isExpanded ? null : q.id)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          >
                            <Lightbulb className="w-3 h-3 text-amber-400" />
                            <span>{isExpanded ? 'Hide STAR Framework Guide' : 'View STAR Framework Guide'}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-150">
                              <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                                Recommended Approach:
                              </span>
                              {q.sampleAnswer}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-850 flex items-center justify-end">
                      <button
                        onClick={() => handleStartPracticeInSim(q)}
                        className="flex items-center gap-1.5 text-xs bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer"
                      >
                        <span>Practice in Simulator</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MOCK SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Active Question Bar */}
            <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-850 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Simulator Prompt
                  </span>
                </div>

                {/* Question switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Switch:</span>
                  <select
                    value={activeSimulatorQuestion?.id || ''}
                    onChange={(e) => {
                      const found = questions.find((q) => q.id === e.target.value);
                      if (found) {
                        setActiveSimulatorQuestion(found);
                        setUserAnswer('');
                        setEvaluationResult(null);
                        setSimTimerSeconds(0);
                        setSimTimerActive(true);
                      }
                    }}
                    aria-label="Active Simulator Question"
                    className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 max-w-xs truncate focus:outline-none focus:border-blue-500"
                  >
                    {questions.map((q) => (
                      <option key={q.id} value={q.id}>
                        [{q.category.toUpperCase()}] {q.question.slice(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                "{activeSimulatorQuestion?.question || 'Tell me about a challenging problem you solved recently.'}"
              </h2>

              {activeSimulatorQuestion?.sampleAnswer && (
                <div className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Coach Tip: </strong>
                    {activeSimulatorQuestion.sampleAnswer}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  Your Response (Type or dictate your answer):
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500">
                    {userAnswer.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <span className="font-mono text-blue-400">
                    ⏱️{' '}
                    {Math.floor(simTimerSeconds / 60)
                      .toString()
                      .padStart(2, '0')}
                    :{(simTimerSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Structure your answer with STAR (Situation, Task, Action, Result). Highlight your specific technical ownership and end metrics..."
                rows={7}
                className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-500">
                  💡 Tip: Mention specific frameworks, metrics (%, numbers), and what you learned.
                </span>

                <button
                  onClick={handleEvaluateAnswer}
                  disabled={isEvaluating || !userAnswer.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Response...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit for AI Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Evaluation Result Card */}
            {evaluationResult && (
              <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Score Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
                      Candidate Assessment Score
                    </span>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <span>Overall Score: {evaluationResult.score}/100</span>
                      {evaluationResult.score >= 85 ? (
                        <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          🌟 Interview Ready
                        </span>
                      ) : evaluationResult.score >= 70 ? (
                        <span className="text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                          👍 Solid Foundation
                        </span>
                      ) : (
                        <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                          ⚠️ Needs Polish
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Circular visual */}
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-slate-400">
                      <div>Simulated Time: {simTimerSeconds}s</div>
                      <div className="text-emerald-400">Scored on 5 Competencies</div>
                    </div>
                  </div>
                </div>

                {/* 5-Dimension Radar / Progress Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { label: 'Relevance', score: evaluationResult.relevance },
                    { label: 'Clarity & Brevity', score: evaluationResult.clarity },
                    { label: 'Confidence', score: evaluationResult.confidence },
                    { label: 'Technical Depth', score: evaluationResult.technical },
                    { label: 'STAR Structure', score: evaluationResult.communication },
                  ].map((dim) => (
                    <div key={dim.label} className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{dim.label}</span>
                        <span className="font-bold text-white">{dim.score}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dim.score >= 80 ? 'bg-emerald-500' : dim.score >= 65 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths & Improvements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Key Strengths Observed
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {evaluationResult.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      Actionable Improvements
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {evaluationResult.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Ideal Model Answer */}
                <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-5 space-y-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    AI Model Answer (How to nail this question):
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    "{evaluationResult.modelAnswer}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Question Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Custom Interview Question</h3>
            <p className="text-xs text-slate-400">
              Paste a question from a recruiter email, glassdoor, or job posting to rehearse:
            </p>
            <textarea
              value={customQuestionInput}
              onChange={(e) => setCustomQuestionInput(e.target.value)}
              placeholder="e.g. How would you design a rate limiter in distributed systems?"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-xs px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomQuestion}
                disabled={!customQuestionInput.trim()}
                className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-xl cursor-pointer"
              >
                Add & Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
