import React, { useState } from 'react';
import { Key, ShieldCheck, X, Check, Trash2, ExternalLink } from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey, clearStoredApiKey } from '../../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      saveStoredApiKey(apiKey);
    } else {
      clearStoredApiKey();
    }
    setSaved(true);
    onKeyUpdated();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    clearStoredApiKey();
    setApiKey('');
    onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Google Gemini API Configuration</h3>
              <p className="text-xs text-slate-400">Optional AI Power-up</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Zero-Setup Friendly:</span> ResumAI includes a built-in smart ATS heuristic engine that works immediately without any API key! Connecting your Gemini key activates deep LLM rewriting.
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Gemini API Key</label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
          />
          <p className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
            <span>Stored locally in your browser only.</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Key</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saved ? 'Saved!' : 'Save Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
