import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  FileEdit,
  FileCheck,
  Target,
  Mic,
  Briefcase,
  Wrench,
  Download,
  Upload,
  Key,
  ChevronDown,
  Globe,
} from 'lucide-react';
import type { ResumeData } from '../../types/resume';
import { SAMPLE_SOFTWARE_ENGINEER, SAMPLE_PRODUCT_MANAGER, SAMPLE_DATA_SCIENTIST_FRESHER as SAMPLE_DATA_SCIENTIST } from '../../data/sampleResumes';
import { getStoredApiKey } from '../../services/geminiService';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'builder'
  | 'checker'
  | 'matcher'
  | 'interview'
  | 'applications'
  | 'tools';

interface Props {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  resumeData: ResumeData;
  onLoadResume: (data: ResumeData) => void;
  onOpenApiKeyModal: () => void;
  onOpenImportModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onViewChange,
  resumeData,
  onLoadResume,
  onOpenApiKeyModal,
  onOpenImportModal,
}) => {
  const hasApiKey = Boolean(getStoredApiKey());

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(resumeData.personalInfo.fullName || 'resume')
      .toLowerCase()
      .replace(/\s+/g, '_')}_data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const navItems: Array<{ id: AppView; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', label: 'Builder', icon: FileEdit },
    { id: 'checker', label: 'ATS Checker', icon: FileCheck },
    { id: 'matcher', label: 'Job Matcher', icon: Target },
    { id: 'interview', label: 'Interview AI', icon: Mic },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'tools', label: 'Career Tools', icon: Wrench },
  ];

  return (
    <header className="no-print bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center justify-between w-full xl:w-auto">
          <button
            onClick={() => onViewChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-white text-base sm:text-lg">
                  CareerForge<span className="text-blue-400 font-extrabold">.ai</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded-sm">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none hidden sm:block">
                Build a Resume That Gets You Noticed
              </p>
            </div>
          </button>

          {/* Quick Landing View Link for Mobile */}
          <button
            onClick={() => onViewChange('landing')}
            className="xl:hidden text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </div>

        {/* Center View Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-2">
          {/* Landing Page button */}
          <button
            onClick={() => onViewChange('landing')}
            className={`hidden xl:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              currentView === 'landing'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="View Landing Page"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Sample Loader */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer">
              <span>Samples</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 text-xs hidden group-hover:block z-50">
              <button
                onClick={() => onLoadResume(SAMPLE_SOFTWARE_ENGINEER)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Full Stack Engineer
              </button>
              <button
                onClick={() => onLoadResume(SAMPLE_PRODUCT_MANAGER)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Senior Product Manager
              </button>
              <button
                onClick={() => onLoadResume(SAMPLE_DATA_SCIENTIST)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Lead Data Scientist
              </button>
            </div>
          </div>

          {/* Import Resume (PDF / JSON / TXT) */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
            title="Import Resume from PDF, Word, JSON, or Text"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            title="Save Resume JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              hasApiKey
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Configure Gemini API Key (Optional, high-speed offline fallback active)"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hasApiKey ? 'Gemini AI' : 'API Key'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

