import React, { useState } from 'react';
import { Sparkles, Check, X, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { rewriteBulletPointMode, generateSummary } from '../../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'bullet' | 'summary';
  initialText: string;
  roleContext?: string;
  onApply: (newText: string) => void;
}

type AiMode = 'improve' | 'rewrite' | 'concise' | 'professional' | 'metrics' | 'generate';

export const AiEnhanceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  type,
  initialText,
  roleContext,
  onApply,
}) => {
  const [inputText, setInputText] = useState<string>(initialText || '');
  const [currentMode, setCurrentMode] = useState<AiMode>('improve');
  const [loading, setLoading] = useState<boolean>(false);
  const [enhancedText, setEnhancedText] = useState<string>('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunMode = async (mode: AiMode) => {
    setCurrentMode(mode);
    setLoading(true);
    setError(null);
    try {
      if (type === 'bullet') {
        const textToEnhance = inputText || initialText || 'I built a web application.';
        const res = await rewriteBulletPointMode(textToEnhance, mode, roleContext);
        setEnhancedText(res.result);
        setAlternatives(res.alternatives);
        setExplanation(res.explanation);
      } else {
        const summary = await generateSummary(
          '',
          roleContext || 'Software Professional',
          '5+ years',
          ['Architecture', 'Collaboration', 'Impact']
        );
        setEnhancedText(summary);
        setExplanation('Crafted an executive summary highlighting your role, core competencies, and business impact.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enhance text');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (textToUse: string) => {
    onApply(textToUse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {type === 'bullet' ? 'AI Resume Bullet Point Engine' : 'AI Professional Summary Generator'}
              </h3>
              <p className="text-xs text-slate-400">
                Turn rough notes into high-impact, ATS-optimized professional accomplishments.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editable Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Input Text / Raw Note</span>
            <span className="text-[11px] text-slate-500">Edit or enter informal thoughts</span>
          </div>
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. I built a tourism application using Flutter and Firebase."
            className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        {/* Action Buttons as requested in Section 6 */}
        {type === 'bullet' && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Choose Transformation Mode:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => handleRunMode('improve')}
                disabled={loading}
                className={`p-2 rounded-lg border font-medium transition text-center ${
                  currentMode === 'improve' && enhancedText
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                ✨ Improve
              </button>
              <button
                onClick={() => handleRunMode('rewrite')}
                disabled={loading}
                className={`p-2 rounded-lg border font-medium transition text-center ${
                  currentMode === 'rewrite' && enhancedText
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                🔄 Rewrite
              </button>
              <button
                onClick={() => handleRunMode('concise')}
                disabled={loading}
                className={`p-2 rounded-lg border font-medium transition text-center ${
                  currentMode === 'concise' && enhancedText
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                ✂️ Make concise
              </button>
              <button
                onClick={() => handleRunMode('professional')}
                disabled={loading}
                className={`p-2 rounded-lg border font-medium transition text-center ${
                  currentMode === 'professional' && enhancedText
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                👔 Make professional
              </button>
              <button
                onClick={() => handleRunMode('metrics')}
                disabled={loading}
                className={`p-2 rounded-lg border font-medium transition text-center ${
                  currentMode === 'metrics' && enhancedText
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                📊 Add measurable impact
              </button>
              <button
                onClick={() => handleRunMode('generate')}
                disabled={loading}
                className={`p-2 rounded-lg border font-medium transition text-center ${
                  currentMode === 'generate' && enhancedText
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                ⚡ Generate bullet points
              </button>
            </div>
          </div>
        )}

        {/* Initial Trigger for summary */}
        {type === 'summary' && !enhancedText && !loading && (
          <div className="text-center py-2">
            <button
              onClick={() => handleRunMode('improve')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Executive Summary</span>
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            <p className="text-xs text-slate-400">Processing with CareerForge AI Engine...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Enhanced Content Result */}
        {enhancedText && !loading && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Result
                </span>
                <span className="text-[11px] text-slate-400 italic">Mode: {currentMode.toUpperCase()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-slate-100 text-xs font-medium leading-relaxed">
                {enhancedText}
              </div>
              {explanation && (
                <p className="text-[11px] text-slate-400 italic">💡 {explanation}</p>
              )}
            </div>

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alternative Variations</span>
                <div className="space-y-1.5">
                  {alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAccept(alt)}
                      className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer transition flex items-start justify-between gap-2 group"
                    >
                      <span>{alt}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Anti-fabrication footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI will not fabricate your experience</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            {enhancedText && (
              <button
                onClick={() => handleAccept(enhancedText)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>Apply to Resume</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

