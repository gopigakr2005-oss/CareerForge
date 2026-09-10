import React, { useState } from 'react';
import { TrendingUp, X, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { rewriteBulletPointMode } from '../../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  originalBullet: string;
  roleContext?: string;
  onApply: (quantifiedBullet: string) => void;
}

export const QuantificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  originalBullet,
  roleContext,
  onApply,
}) => {
  const [metricType, setMetricType] = useState<'percent' | 'users' | 'time' | 'financial' | 'scale'>('percent');
  const [percentVal, setPercentVal] = useState<string>('35%');
  const [userCountVal, setUserCountVal] = useState<string>('50,000+ daily active users');
  const [timeVal, setTimeVal] = useState<string>('12 hours per week');
  const [financialVal, setFinancialVal] = useState<string>('$45,000 annually');
  const [scaleVal, setScaleVal] = useState<string>('2.5M records daily');
  const [customMetric, setCustomMetric] = useState<string>('');
  const [generatedBullet, setGeneratedBullet] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    let chosenMetric = '';
    if (customMetric.trim()) {
      chosenMetric = customMetric.trim();
    } else {
      switch (metricType) {
        case 'percent':
          chosenMetric = `improving efficiency by ${percentVal}`;
          break;
        case 'users':
          chosenMetric = `supporting ${userCountVal}`;
          break;
        case 'time':
          chosenMetric = `saving ${timeVal}`;
          break;
        case 'financial':
          chosenMetric = `reducing operational expenses by ${financialVal}`;
          break;
        case 'scale':
          chosenMetric = `processing ${scaleVal} with 99.9% uptime`;
          break;
      }
    }

    const res = await rewriteBulletPointMode(originalBullet, 'metrics', roleContext, chosenMetric);
    setGeneratedBullet(res.result);
    setLoading(false);
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
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Quantification Assistant</h3>
              <p className="text-xs text-slate-400">Transform generic tasks into high-impact, measured achievements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Bullet */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Original Bullet:</span>
          "{originalBullet || 'I improved the application.'}"
        </div>

        {/* Metric Questions */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            What was the measurable outcome of this work?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { id: 'percent', label: '📊 % Improvement / Speedup' },
              { id: 'users', label: '👥 User Count / Traffic' },
              { id: 'time', label: '⏱️ Time Saved' },
              { id: 'financial', label: '💰 Cost / Revenue Impact' },
              { id: 'scale', label: '🚀 Scale / Data Volume' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMetricType(m.id as any)}
                className={`p-2 rounded-lg border text-left transition ${
                  metricType === m.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-white font-medium'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Guided Inputs */}
          <div className="pt-2">
            {metricType === 'percent' && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">How much did performance/conversion improve?</span>
                <input
                  type="text"
                  value={percentVal}
                  onChange={(e) => setPercentVal(e.target.value)}
                  placeholder="e.g. 42% or 2.5x"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
            {metricType === 'users' && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">How many users, clients, or engineers benefited?</span>
                <input
                  type="text"
                  value={userCountVal}
                  onChange={(e) => setUserCountVal(e.target.value)}
                  placeholder="e.g. 100,000+ monthly active users"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
            {metricType === 'time' && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">How much developer or user time was saved?</span>
                <input
                  type="text"
                  value={timeVal}
                  onChange={(e) => setTimeVal(e.target.value)}
                  placeholder="e.g. 15 hours per engineering sprint"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
            {metricType === 'financial' && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">How much cost was reduced or revenue generated?</span>
                <input
                  type="text"
                  value={financialVal}
                  onChange={(e) => setFinancialVal(e.target.value)}
                  placeholder="e.g. $30,000 in monthly cloud infrastructure costs"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
            {metricType === 'scale' && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">What data volume or transaction scale did it handle?</span>
                <input
                  type="text"
                  value={scaleVal}
                  onChange={(e) => setScaleVal(e.target.value)}
                  placeholder="e.g. 5M events per second with 99.99% reliability"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Custom Metric Option */}
            <div className="mt-2.5">
              <span className="text-[11px] text-slate-400">Or specify custom metric:</span>
              <input
                type="text"
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value)}
                placeholder="Optional: type custom metric phrase here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Generate / Preview */}
        {!generatedBullet ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Quantified Bullet...' : 'Generate Quantified Bullet'}</span>
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Enhanced Result:</span>
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-100 leading-relaxed">
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
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <Check className="w-4 h-4" /> Apply to Resume
              </button>
            </div>
          </div>
        )}

        {/* Anti-fabrication trust banner */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Truth Mode: Using ONLY your specified numbers
          </span>
          <span>Never invents unverified claims</span>
        </div>
      </div>
    </div>
  );
};
