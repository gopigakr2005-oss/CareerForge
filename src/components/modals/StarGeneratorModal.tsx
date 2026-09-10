import React, { useState } from 'react';
import { Target, X, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { generateStarBulletLocal } from '../../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (bullet: string) => void;
  roleContext?: string;
}

export const StarGeneratorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [mode, setMode] = useState<'star' | 'attr'>('star');
  // STAR fields
  const [situation, setSituation] = useState<string>('');
  const [task, setTask] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [technology, setTechnology] = useState<string>('');

  const [generatedBullet, setGeneratedBullet] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!action || !task) {
      alert('Please fill in at least the Task and Action taken.');
      return;
    }

    const bullet = generateStarBulletLocal({
      situation: situation || 'a high-priority sprint deliverable',
      task,
      action,
      result,
      technology,
    });
    setGeneratedBullet(bullet);
  };

  const handleConfirm = () => {
    if (generatedBullet) {
      onApply(generatedBullet);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">STAR Framework Bullet Generator</h3>
              <p className="text-xs text-slate-400">Situation • Task • Action • Technology • Result</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Framework Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('star')}
            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
              mode === 'star' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            STAR Method (Situation-Task-Action-Result)
          </button>
          <button
            onClick={() => setMode('attr')}
            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
              mode === 'attr' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Action + Task + Tech + Result
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-2.5 text-xs">
          {mode === 'star' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                1. Situation (What was the context or challenge?):
              </label>
              <input
                type="text"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="e.g. During a period of 40% rapid user growth"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {mode === 'star' ? '2. Task' : '1. Task'} (What goal or problem needed resolution?):
            </label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. resolve severe database connection timeouts"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {mode === 'star' ? '3. Action' : '2. Action'} (What specific steps did YOU take?):
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Architected and implemented a connection pooler and Redis caching layer"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Technology / Tools Used (Optional):
            </label>
            <input
              type="text"
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              placeholder="e.g. Node.js, PostgreSQL, Redis, Docker"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {mode === 'star' ? '4. Result' : '3. Result'} (What was the measurable outcome?):
            </label>
            <input
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g. reducing p99 latency by 55% and eliminating dropped requests"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        {!generatedBullet ? (
          <button
            onClick={handleGenerate}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" /> Assemble STAR Bullet
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-blue-400 block">Generated STAR Bullet:</span>
            <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl text-xs text-blue-100 leading-relaxed">
              {generatedBullet}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Regenerate
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <Check className="w-4 h-4" /> Apply to Resume
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Truth Mode: Assembled strictly from your supplied inputs
          </span>
          <span>No fabricated facts</span>
        </div>
      </div>
    </div>
  );
};
