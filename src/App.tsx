import { useState, useEffect } from 'react';
import type { ResumeData, ResumeTheme, ResumeVersion, TemplateId } from './types/resume';
import { SAMPLE_SOFTWARE_ENGINEER, DEFAULT_THEME } from './data/sampleResumes';
import { Navbar, type AppView } from './components/navbar/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { ResumeForm } from './components/builder/ResumeForm';
import { ThemeSelector } from './components/builder/ThemeSelector';
import { ResumePreview } from './components/preview/ResumePreview';
import { AtsChecker } from './components/checker/AtsChecker';
import { JobMatcher } from './components/matcher/JobMatcher';
import { InterviewAiView } from './components/interview/InterviewAiView';
import { ApplicationTrackerView } from './components/applications/ApplicationTrackerView';
import { CareerToolsView } from './components/tools/CareerToolsView';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { AiEnhanceModal } from './components/modals/AiEnhanceModal';
import { ImportResumeModal } from './components/modals/ImportResumeModal';
import { UniversalResumeRenderer } from './components/templates/UniversalResumeRenderer';
import confetti from 'canvas-confetti';

const RESUME_STORAGE_KEY = 'CAREERFORGE_ACTIVE_RESUME_V2';
const THEME_STORAGE_KEY = 'CAREERFORGE_ACTIVE_THEME_V2';
const RESUMES_LIST_STORAGE_KEY = 'CAREERFORGE_RESUMES_LIST_V2';
const LAST_SAVED_KEY = 'CAREERFORGE_LAST_SAVED_TIME_V2';

const INITIAL_RESUMES_LIST: ResumeVersion[] = [
  {
    id: 'res-master',
    name: 'Master Resume',
    lastUpdated: '2026-09-05',
    atsScore: 88,
    jobMatchScore: 92,
    isMaster: true,
    data: SAMPLE_SOFTWARE_ENGINEER,
    theme: DEFAULT_THEME,
  },
  {
    id: 'res-targeted-stripe',
    name: 'Targeted: Stripe Full Stack',
    lastUpdated: '2026-08-28',
    atsScore: 94,
    jobMatchScore: 96,
    isMaster: false,
    data: {
      ...SAMPLE_SOFTWARE_ENGINEER,
      personalInfo: {
        ...SAMPLE_SOFTWARE_ENGINEER.personalInfo,
        jobTitle: 'Senior Full Stack Engineer (Fintech & Cloud)',
      },
    },
    theme: { ...DEFAULT_THEME, template: 'tech' },
  },
];

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [activeInterviewRole, setActiveInterviewRole] = useState<string>('');

  // Load active resume from localStorage or default
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(RESUME_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved resume data from localStorage', e);
    }
    return SAMPLE_SOFTWARE_ENGINEER;
  });

  const [resumeTheme, setResumeTheme] = useState<ResumeTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved theme from localStorage', e);
    }
    return DEFAULT_THEME;
  });

  // Multi-resume list
  const [resumesList, setResumesList] = useState<ResumeVersion[]>(() => {
    try {
      const saved = localStorage.getItem(RESUMES_LIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved resumes list', e);
    }
    return INITIAL_RESUMES_LIST;
  });

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resumeData));
    } catch (e) {
      console.error('Failed to autosave resume data', e);
    }
  }, [resumeData]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(resumeTheme));
    } catch (e) {
      console.error('Failed to autosave theme', e);
    }
  }, [resumeTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(RESUMES_LIST_STORAGE_KEY, JSON.stringify(resumesList));
    } catch (e) {
      console.error('Failed to autosave resumes list', e);
    }
  }, [resumesList]);

  // Explicit Save state & handler
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_SAVED_KEY);
    } catch (e) {
      return null;
    }
  });

  const handleSaveResume = () => {
    try {
      localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resumeData));
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(resumeTheme));
      localStorage.setItem(RESUMES_LIST_STORAGE_KEY, JSON.stringify(resumesList));
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem(LAST_SAVED_KEY, timeStr);
      setLastSavedTime(timeStr);
      showToast('💾 Resume saved! Progress is stored locally and will reload automatically whenever you return.');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
      });
    } catch (e) {
      console.error('Failed to save resume', e);
      showToast('⚠️ Unable to save to browser storage.');
    }
  };

  // Modals state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [apiKeyVersion, setApiKeyVersion] = useState<number>(0);
  const [importToast, setImportToast] = useState<string | null>(null);

  const [aiModalState, setAiModalState] = useState<{
    isOpen: boolean;
    type: 'bullet' | 'summary';
    initialText: string;
    roleContext?: string;
    onApply?: (val: string) => void;
  }>({
    isOpen: false,
    type: 'bullet',
    initialText: '',
  });

  const handleOpenAiEnhance = (
    type: 'bullet' | 'summary',
    text: string,
    role?: string,
    onApply?: (val: string) => void
  ) => {
    setAiModalState({
      isOpen: true,
      type,
      initialText: text,
      roleContext: role,
      onApply,
    });
  };

  const showToast = (message: string) => {
    setImportToast(message);
    setTimeout(() => {
      setImportToast(null);
    }, 4500);
  };

  const handleImportSuccess = (data: ResumeData, targetView: AppView = 'checker') => {
    setResumeData(data);
    setCurrentView(targetView);
    showToast(
      targetView === 'checker'
        ? `Resume for "${data.personalInfo.fullName || 'Candidate'}" loaded! Scanning in ATS Checker...`
        : `Resume for "${data.personalInfo.fullName || 'Candidate'}" loaded into Resume Builder!`
    );
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.3 },
    });
  };

  // Multi-Resume Management
  const handleCreateNewResume = () => {
    const name = prompt('Enter a name for this resume version:', 'New Technical Resume');
    if (!name) return;

    const newVersion: ResumeVersion = {
      id: `res-${Date.now()}`,
      name,
      lastUpdated: new Date().toISOString().split('T')[0],
      atsScore: 75,
      jobMatchScore: 80,
      isMaster: false,
      data: {
        ...SAMPLE_SOFTWARE_ENGINEER,
        personalInfo: {
          ...SAMPLE_SOFTWARE_ENGINEER.personalInfo,
          jobTitle: name,
        },
      },
      theme: DEFAULT_THEME,
    };

    setResumesList([newVersion, ...resumesList]);
    setResumeData(newVersion.data);
    setResumeTheme(newVersion.theme);
    setCurrentView('builder');
    showToast(`Created new resume: "${name}"`);
  };

  const handleDuplicateResume = (resume: ResumeVersion) => {
    const cloned: ResumeVersion = {
      id: `res-${Date.now()}`,
      name: `${resume.name} (Copy)`,
      lastUpdated: new Date().toISOString().split('T')[0],
      atsScore: resume.atsScore,
      jobMatchScore: resume.jobMatchScore,
      isMaster: false,
      data: JSON.parse(JSON.stringify(resume.data)),
      theme: { ...resume.theme },
    };

    setResumesList([cloned, ...resumesList]);
    showToast(`Duplicated: "${cloned.name}"`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleDeleteResume = (id: string) => {
    if (confirm('Delete this resume variation?')) {
      const remaining = resumesList.filter((r) => r.id !== id);
      setResumesList(remaining);
      showToast('Resume variation deleted.');
    }
  };

  return (
    <>
      {/* Dedicated Static Print-Only Container (Zero UI clutter, natural multi-page flow) */}
      <div id="resume-print-document" className="hidden print:block w-full max-w-[210mm] mx-auto bg-white text-slate-900">
        <UniversalResumeRenderer
          data={resumeData}
          theme={resumeTheme}
          id="resume-print-inner"
        />
      </div>

      <div className="no-print min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        key={apiKeyVersion}
        currentView={currentView}
        onViewChange={setCurrentView}
        resumeData={resumeData}
        onLoadResume={(data) => {
          setResumeData(data);
          showToast(`Loaded "${data.personalInfo.jobTitle || 'Sample'}" resume profile.`);
        }}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onSave={handleSaveResume}
        lastSavedTime={lastSavedTime}
      />

      {/* Success Notification Banner */}
      {importToast && (
        <div className="no-print bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-200 sticky top-[57px] z-30">
          <span>{importToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentView('builder')}
            onCheckResume={() => setCurrentView('checker')}
            onSelectTemplate={(templateId: TemplateId) => {
              setResumeTheme((prev) => ({ ...prev, templateId }));
              setCurrentView('builder');
              showToast(`Applied template "${templateId}".`);
            }}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {/* VIEW 2: MISSION CONTROL DASHBOARD */}
        {currentView === 'dashboard' && (
          <DashboardView
            currentResume={resumeData}
            resumesList={resumesList}
            onNavigate={setCurrentView}
            onSelectResume={(res) => {
              setResumeData(res.data);
              setResumeTheme(res.theme);
              showToast(`Switched active resume to "${res.name}".`);
            }}
            onCreateNewResume={handleCreateNewResume}
            onDuplicateResume={handleDuplicateResume}
            onDeleteResume={handleDeleteResume}
          />
        )}

        {/* VIEW 3: RESUME BUILDER */}
        {currentView === 'builder' && (
          <div className="space-y-6">
            {/* Theme & Styling Bar */}
            <div className="no-print">
              <ThemeSelector theme={resumeTheme} onChange={setResumeTheme} />
            </div>

            {/* Builder Split Grid: Form on Left, Live Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Input Area */}
              <div className="no-print lg:col-span-6 h-[820px]">
                <ResumeForm
                  data={resumeData}
                  onChange={setResumeData}
                  onOpenAiEnhance={handleOpenAiEnhance}
                  onSave={handleSaveResume}
                  lastSavedTime={lastSavedTime}
                />
              </div>

              {/* Live Preview Pane */}
              <div className="lg:col-span-6 h-[820px]">
                <ResumePreview
                  data={resumeData}
                  theme={resumeTheme}
                  onThemeChange={setResumeTheme}
                  onUpdateData={setResumeData}
                  onSave={handleSaveResume}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: ATS CHECKER & HEATMAP */}
        {currentView === 'checker' && (
          <div className="no-print max-w-5xl mx-auto">
            <AtsChecker
              currentResume={resumeData}
              onNavigateToBuilder={() => setCurrentView('builder')}
              onLoadSampleResume={(resume) => setResumeData(resume)}
            />
          </div>
        )}

        {/* VIEW 5: JOB MATCHER & 4-WEEK ROADMAP */}
        {currentView === 'matcher' && (
          <div className="no-print max-w-5xl mx-auto">
            <JobMatcher
              currentResume={resumeData}
              theme={resumeTheme}
              onApplyTargetedResume={(targeted) => {
                setResumeData(targeted);
                setCurrentView('builder');
                showToast('Targeted Resume applied to Builder with tailored keywords!');
                confetti({ particleCount: 70, spread: 70, origin: { y: 0.4 } });
              }}
              onNavigateToBuilder={() => setCurrentView('builder')}
            />
          </div>
        )}

        {/* VIEW 6: INTERVIEW AI SUITE */}
        {currentView === 'interview' && (
          <div className="no-print max-w-5xl mx-auto">
            <InterviewAiView
              resumeData={resumeData}
              targetRole={activeInterviewRole || resumeData.personalInfo.jobTitle}
              onNavigateToBuilder={() => setCurrentView('builder')}
            />
          </div>
        )}

        {/* VIEW 7: APPLICATION TRACKER & ANALYTICS */}
        {currentView === 'applications' && (
          <div className="no-print w-full">
            <ApplicationTrackerView
              resumeData={resumeData}
              onSelectRoleForInterview={(role) => {
                setActiveInterviewRole(role);
                setCurrentView('interview');
                showToast(`Loaded interview simulator for "${role}".`);
              }}
            />
          </div>
        )}

        {/* VIEW 8: CAREER TOOLS (COVER LETTER, PORTFOLIO, GITHUB, QR) */}
        {currentView === 'tools' && (
          <div className="no-print max-w-5xl mx-auto">
            <CareerToolsView
              resumeData={resumeData}
              onUpdateResumeData={setResumeData}
              onNavigateToBuilder={() => setCurrentView('builder')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong className="text-slate-400">CareerForge AI</strong> • Build a Resume That Gets You Noticed • ATS-Optimized Formats
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button onClick={() => setCurrentView('landing')} className="hover:text-white cursor-pointer">
              Home
            </button>
            <button onClick={() => setCurrentView('builder')} className="hover:text-white cursor-pointer">
              Builder
            </button>
            <button onClick={() => setCurrentView('checker')} className="hover:text-white cursor-pointer">
              ATS Checker
            </button>
            <button onClick={() => setCurrentView('interview')} className="hover:text-white cursor-pointer">
              Interview AI
            </button>
            <button onClick={() => setCurrentView('tools')} className="hover:text-white cursor-pointer">
              Tools
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={() => setApiKeyVersion((v) => v + 1)}
      />

      <AiEnhanceModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState((prev) => ({ ...prev, isOpen: false }))}
        type={aiModalState.type}
        initialText={aiModalState.initialText}
        roleContext={aiModalState.roleContext}
        onApply={(newVal) => {
          if (aiModalState.onApply) {
            aiModalState.onApply(newVal);
          }
        }}
      />

      <ImportResumeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
    </>
  );
}

export default App;

