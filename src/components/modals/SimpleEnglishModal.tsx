import React, { useState } from 'react';
import { Languages, X, Check, Sparkles } from 'lucide-react';
import { convertSimpleEnglish } from '../../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  initialText?: string;
}

export const SimpleEnglishModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApply,
  initialText = '',
}) => {
  const [inputText, setInputText] = useState<string>(initialText || 'I made app for tourist people.');
  const [output, setOutput] = useState<{ professional: string; explanation: string } | null>(null);

  if (!isOpen) return null;

  const handleConvert = () => {
    if (!inputText.trim()) return;
    const res = convertSimpleEnglish(inputText);
    setOutput(res);
  };

  const handleConfirm = () => {
    if (output) {
      onApply(output.professional);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Simple English Mode</h3>
              <p className="text-xs text-slate-400">Write naturally in your words — AI translates it into executive English</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Write what you did in simple everyday words:
          </label>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. I made app for tourist people, or I helped my team fix bugs in database"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          />
          <div className="flex gap-2 text-[10px] text-slate-400">
            <span>Examples:</span>
            <button
              onClick={() => setInputText('I made app for tourist people.')}
              className="text-purple-400 hover:underline"
            >
              "I made app for tourist people"
            </button>
            <span>•</span>
            <button
              onClick={() => setInputText('I helped my team do testing.')}
              className="text-purple-400 hover:underline"
            >
              "I helped my team do testing"
            </button>
          </div>
        </div>

        {/* Action Button */}
        {!output ? (
          <button
            onClick={handleConvert}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" /> Convert to Professional English
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">Professional Version:</span>
              <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl text-xs text-purple-100 leading-relaxed font-medium">
                {output.professional}
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Why this is better: </span>
              {output.explanation}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConvert}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Try Again
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <Check className="w-4 h-4" /> Apply to Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
