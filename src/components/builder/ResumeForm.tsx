import React, { useState } from 'react';
import type {
  ResumeData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillCategory,
  CertificationItem,
  AchievementItem,
  PublicationItem,
  LanguageItem,
  VolunteerItem,
  LeadershipItem,
  CustomSectionItem,
} from '../../types/resume';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  Sparkles,
  Star,
  BookOpen,
  Languages,
  HeartHandshake,
  ShieldCheck,
  Compass,
  Smile,
  Layers,
  Eye,
  EyeOff,
  TrendingUp,
  Target,
} from 'lucide-react';
import { suggestSkillsForRole, rewriteBulletPointMode } from '../../services/geminiService';
import { QuantificationModal } from '../modals/QuantificationModal';
import { StarGeneratorModal } from '../modals/StarGeneratorModal';
import { SimpleEnglishModal } from '../modals/SimpleEnglishModal';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onOpenAiEnhance: (type: 'bullet' | 'summary', text: string, role?: string, onApply?: (val: string) => void) => void;
}

type TabType =
  | 'personal'
  | 'summary'
  | 'objective'
  | 'education'
  | 'experience'
  | 'internships'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'achievements'
  | 'publications'
  | 'languages'
  | 'volunteer'
  | 'leadership'
  | 'hobbies'
  | 'custom'
  | 'sections';

export const ResumeForm: React.FC<Props> = ({ data, onChange, onOpenAiEnhance }) => {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});

  // Education handlers
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof EducationItem, val: string) => {
    onChange({
      ...data,
      education: data.education.map((edu) => (edu.id === id ? { ...edu, [field]: val } : edu)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  // Skills handlers
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      skills: [],
    };
    onChange({ ...data, skills: [...data.skills, newCat] });
  };

  const removeSkillCategory = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((c) => c.id !== id),
    });
  };

  const updateSkillCategoryName = (id: string, name: string) => {
    onChange({
      ...data,
      skills: data.skills.map((c) => (c.id === id ? { ...c, name } : c)),
    });
  };

  const addSkillTag = (catId: string, skill: string) => {
    if (!skill.trim()) return;
    onChange({
      ...data,
      skills: data.skills.map((c) => {
        if (c.id !== catId) return c;
        if (c.skills.includes(skill.trim())) return c;
        return { ...c, skills: [...c.skills, skill.trim()] };
      }),
    });
    setNewSkillInputs({ ...newSkillInputs, [catId]: '' });
  };

  const removeSkillTag = (catId: string, skillIdx: number) => {
    onChange({
      ...data,
      skills: data.skills.map((c) => {
        if (c.id !== catId) return c;
        return { ...c, skills: c.skills.filter((_, i) => i !== skillIdx) };
      }),
    });
  };

  const handleSuggestSkills = async () => {
    setSuggestingSkills(true);
    try {
      const allSkills = data.skills.flatMap((c) => c.skills);
      const suggestions = await suggestSkillsForRole(data.personalInfo.jobTitle || 'Engineer', allSkills);
      if (suggestions.length > 0) {
        // Add to first category or create one
        if (data.skills.length > 0) {
          const firstId = data.skills[0].id;
          onChange({
            ...data,
            skills: data.skills.map((c) => (c.id === firstId ? { ...c, skills: [...c.skills, ...suggestions.slice(0, 4)] } : c)),
          });
        }
      }
    } finally {
      setSuggestingSkills(false);
    }
  };

  // Projects handlers
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      technologies: [],
    };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const updateProject = (id: string, field: keyof ProjectItem, val: any) => {
    onChange({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
    });
  };

  const updatePersonalInfo = (field: keyof typeof data.personalInfo, val: string) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: val } });
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      highlights: [''],
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, val: any) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp)),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((exp) => exp.id !== id),
    });
  };

  const addHighlight = (expId: string) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) =>
        exp.id === expId ? { ...exp, highlights: [...exp.highlights, ''] } : exp
      ),
    });
  };

  const updateHighlight = (expId: string, hIdx: number, val: string) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              highlights: exp.highlights.map((h, i) => (i === hIdx ? val : h)),
            }
          : exp
      ),
    });
  };

  const removeHighlight = (expId: string, hIdx: number) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              highlights: exp.highlights.filter((_, i) => i !== hIdx),
            }
          : exp
      ),
    });
  };

  // Certifications handlers
  const addCertification = () => {
    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
    };
    onChange({ ...data, certifications: [...(data.certifications || []), newCert] });
  };

  const updateCertification = (id: string, field: keyof CertificationItem, val: string) => {
    onChange({
      ...data,
      certifications: (data.certifications || []).map((c) => (c.id === id ? { ...c, [field]: val } : c)),
    });
  };

  const removeCertification = (id: string) => {
    onChange({
      ...data,
      certifications: (data.certifications || []).filter((c) => c.id !== id),
    });
  };

  // Additional section handlers
  const addInternship = () => {
    const newIntern: ExperienceItem = {
      id: `intern-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      highlights: [''],
    };
    onChange({ ...data, internships: [newIntern, ...(data.internships || [])] });
  };

  const updateInternship = (id: string, field: keyof ExperienceItem, val: any) => {
    onChange({
      ...data,
      internships: (data.internships || []).map((it) => (it.id === id ? { ...it, [field]: val } : it)),
    });
  };

  const removeInternship = (id: string) => {
    onChange({
      ...data,
      internships: (data.internships || []).filter((it) => it.id !== id),
    });
  };

  const addAchievement = () => {
    const newAch: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: '',
      description: '',
      date: '',
    };
    onChange({ ...data, achievements: [...(data.achievements || []), newAch] });
  };

  const updateAchievement = (id: string, field: keyof AchievementItem, val: string) => {
    onChange({
      ...data,
      achievements: (data.achievements || []).map((a) => (a.id === id ? { ...a, [field]: val } : a)),
    });
  };

  const removeAchievement = (id: string) => {
    onChange({
      ...data,
      achievements: (data.achievements || []).filter((a) => a.id !== id),
    });
  };

  const addPublication = () => {
    const newPub: PublicationItem = {
      id: `pub-${Date.now()}`,
      title: '',
      publisher: '',
      date: '',
      url: '',
      description: '',
    };
    onChange({ ...data, publications: [...(data.publications || []), newPub] });
  };

  const updatePublication = (id: string, field: keyof PublicationItem, val: string) => {
    onChange({
      ...data,
      publications: (data.publications || []).map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    });
  };

  const removePublication = (id: string) => {
    onChange({
      ...data,
      publications: (data.publications || []).filter((p) => p.id !== id),
    });
  };

  const addLanguage = () => {
    const newLang: LanguageItem = {
      id: `lang-${Date.now()}`,
      language: '',
      proficiency: 'Professional',
    };
    onChange({ ...data, languages: [...(data.languages || []), newLang] });
  };

  const updateLanguage = (id: string, field: keyof LanguageItem, val: any) => {
    onChange({
      ...data,
      languages: (data.languages || []).map((l) => (l.id === id ? { ...l, [field]: val } : l)),
    });
  };

  const removeLanguage = (id: string) => {
    onChange({
      ...data,
      languages: (data.languages || []).filter((l) => l.id !== id),
    });
  };

  const addVolunteer = () => {
    const newVol: VolunteerItem = {
      id: `vol-${Date.now()}`,
      organization: '',
      role: '',
      date: '',
      description: '',
    };
    onChange({ ...data, volunteer: [...(data.volunteer || []), newVol] });
  };

  const updateVolunteer = (id: string, field: keyof VolunteerItem, val: string) => {
    onChange({
      ...data,
      volunteer: (data.volunteer || []).map((v) => (v.id === id ? { ...v, [field]: val } : v)),
    });
  };

  const removeVolunteer = (id: string) => {
    onChange({
      ...data,
      volunteer: (data.volunteer || []).filter((v) => v.id !== id),
    });
  };

  const addLeadership = () => {
    const newLead: LeadershipItem = {
      id: `lead-${Date.now()}`,
      title: '',
      organization: '',
      date: '',
      description: '',
    };
    onChange({ ...data, leadership: [...(data.leadership || []), newLead] });
  };

  const updateLeadership = (id: string, field: keyof LeadershipItem, val: string) => {
    onChange({
      ...data,
      leadership: (data.leadership || []).map((l) => (l.id === id ? { ...l, [field]: val } : l)),
    });
  };

  const removeLeadership = (id: string) => {
    onChange({
      ...data,
      leadership: (data.leadership || []).filter((l) => l.id !== id),
    });
  };

  const addCustomSection = () => {
    const newSec: CustomSectionItem = {
      id: `custom-${Date.now()}`,
      title: 'Additional Section',
      items: [
        {
          id: `item-${Date.now()}`,
          title: '',
          subtitle: '',
          date: '',
          description: '',
        },
      ],
    };
    onChange({ ...data, customSections: [...(data.customSections || []), newSec] });
  };

  const updateCustomSectionTitle = (secId: string, title: string) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).map((s) => (s.id === secId ? { ...s, title } : s)),
    });
  };

  const removeCustomSection = (secId: string) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).filter((s) => s.id !== secId),
    });
  };

  const addCustomItem = (secId: string) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          items: [
            ...s.items,
            {
              id: `c-item-${Date.now()}`,
              title: '',
              subtitle: '',
              date: '',
              description: '',
            },
          ],
        };
      }),
    });
  };

  const updateCustomItem = (secId: string, itemId: string, field: string, val: string) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          items: s.items.map((it) => (it.id === itemId ? { ...it, [field]: val } : it)),
        };
      }),
    });
  };

  const removeCustomItem = (secId: string, itemId: string) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).map((s) => {
        if (s.id !== secId) return s;
        return { ...s, items: s.items.filter((it) => it.id !== itemId) };
      }),
    });
  };

  // Section hide/show toggle
  const toggleHideSection = (sec: string) => {
    const hidden = data.hiddenSections || [];
    const isHidden = hidden.includes(sec);
    const newHidden = isHidden ? hidden.filter((s) => s !== sec) : [...hidden, sec];
    onChange({ ...data, hiddenSections: newHidden });
  };

  // Modal states
  const [quantModal, setQuantModal] = useState<{ isOpen: boolean; text: string; onApply?: (val: string) => void }>({
    isOpen: false,
    text: '',
  });

  const [starModal, setStarModal] = useState<{ isOpen: boolean; onApply?: (val: string) => void }>({
    isOpen: false,
  });

  const [simpleEngModal, setSimpleEngModal] = useState<{ isOpen: boolean; text: string; onApply?: (val: string) => void }>({
    isOpen: false,
    text: '',
  });

  const navTabs = [
    { id: 'personal', label: '1. Contact', icon: User },
    { id: 'summary', label: '2. Summary', icon: FileText },
    { id: 'objective', label: '3. Objective', icon: Compass },
    { id: 'experience', label: '4. Experience', icon: Briefcase, count: data.experience?.length || 0 },
    { id: 'internships', label: '5. Internships', icon: Briefcase, count: data.internships?.length || 0 },
    { id: 'projects', label: '6. Projects', icon: FolderGit2, count: data.projects?.length || 0 },
    { id: 'education', label: '7. Education', icon: GraduationCap, count: data.education?.length || 0 },
    { id: 'skills', label: '8. Skills', icon: Wrench, count: data.skills?.reduce((acc, c) => acc + c.skills.length, 0) || 0 },
    { id: 'certifications', label: '9. Certs', icon: Award, count: data.certifications?.length || 0 },
    { id: 'achievements', label: '10. Achievements', icon: Star, count: data.achievements?.length || 0 },
    { id: 'publications', label: '11. Papers', icon: BookOpen, count: data.publications?.length || 0 },
    { id: 'languages', label: '12. Languages', icon: Languages, count: data.languages?.length || 0 },
    { id: 'volunteer', label: '13. Volunteer', icon: HeartHandshake, count: data.volunteer?.length || 0 },
    { id: 'leadership', label: '14. Leadership', icon: ShieldCheck, count: data.leadership?.length || 0 },
    { id: 'hobbies', label: '15. Hobbies', icon: Smile, count: data.hobbies?.length || 0 },
    { id: 'custom', label: '16. Custom', icon: Layers, count: data.customSections?.length || 0 },
    { id: 'sections', label: '⚙️ Manager', icon: Layers },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Top Banner Modes */}
      <div className="no-print bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          {/* Master Resume Toggle */}
          <button
            onClick={() => onChange({ ...data, isMasterResume: !data.isMasterResume })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition font-medium ${
              data.isMasterResume
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="When active, this resume acts as your master database of all career records"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Resume: {data.isMasterResume ? 'ON' : 'OFF'}</span>
          </button>

          {/* Fresher Mode Toggle */}
          <button
            onClick={() => onChange({ ...data, isFresherMode: !data.isFresherMode })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition font-medium ${
              data.isFresherMode
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Optimizes builder for students & freshers without corporate experience"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Fresher Mode: {data.isFresherMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Anti-fabrication indicator */}
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Truth Mode: Never fabricates</span>
        </div>
      </div>

      {/* Tab Navigation Strip */}
      <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 scrollbar-none px-2 py-1.5 gap-1">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="ml-0.5 px-1 rounded-full text-[9px] bg-slate-800 text-slate-400 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Form Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* 1. PERSONAL INFO TAB */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Contact & Personal Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={data.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={data.personalInfo.jobTitle}
                  onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="alex.morgan@example.com"
                  value={data.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 234-5678"
                  value={data.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={data.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Portfolio / Website</label>
                <input
                  type="url"
                  placeholder="https://alexmorgan.dev"
                  value={data.personalInfo.website}
                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/alexmorgan"
                  value={data.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">GitHub / Code Repository</label>
                <input
                  type="url"
                  placeholder="https://github.com/alexmorgan"
                  value={data.personalInfo.github}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Executive / Professional Summary</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    onOpenAiEnhance('summary', data.summary, data.personalInfo.jobTitle, (val) =>
                      onChange({ ...data, summary: val })
                    )
                  }
                  className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg transition"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              placeholder="3-4 sentences outlining your core value proposition, key technical expertise, and measurable accomplishments..."
              value={data.summary}
              onChange={(e) => onChange({ ...data, summary: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500 leading-relaxed"
            />

            {/* Quick Action buttons */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={async () => {
                  const res = await rewriteBulletPointMode(data.summary, 'improve', data.personalInfo.jobTitle);
                  onChange({ ...data, summary: res.result });
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              >
                ⚡ Improve Clarity
              </button>
              <button
                onClick={async () => {
                  const res = await rewriteBulletPointMode(data.summary, 'concise', data.personalInfo.jobTitle);
                  onChange({ ...data, summary: res.result });
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              >
                ✂️ Make Concise
              </button>
              <button
                onClick={async () => {
                  const res = await rewriteBulletPointMode(data.summary, 'professional', data.personalInfo.jobTitle);
                  onChange({ ...data, summary: res.result });
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              >
                👔 Make Executive
              </button>
              <button
                onClick={() =>
                  setSimpleEngModal({
                    isOpen: true,
                    text: data.summary,
                    onApply: (v) => onChange({ ...data, summary: v }),
                  })
                }
                className="px-2 py-1 bg-purple-900/40 border border-purple-600/40 text-purple-300 rounded hover:bg-purple-900/60 transition"
              >
                🌐 Simple English Converter
              </button>
            </div>
          </div>
        )}

        {/* 3. CAREER OBJECTIVE TAB */}
        {activeTab === 'objective' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Career Objective (Ideal for Freshers & Career Switchers)</span>
            </h3>
            <p className="text-xs text-slate-400">
              A forward-looking statement of the position you seek and how your enthusiasm and academic foundation align with company growth.
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Motivated Computer Science graduate seeking an Associate Software Engineer role to leverage knowledge of Python, React, and RESTful APIs to deliver high-quality web software."
              value={data.careerObjective || ''}
              onChange={(e) => onChange({ ...data, careerObjective: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
            />
          </div>
        )}

        {/* 4. WORK EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Professional Experience</span>
              </h3>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {data.experience.map((exp) => (
              <div key={exp.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">
                    {exp.role || 'New Role'} at {exp.company || 'Company'}
                  </span>
                  <button onClick={() => removeExperience(exp.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. CloudScale Tech"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Job Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-400 block mb-1">Start Date</label>
                      <input
                        type="text"
                        placeholder="2022-03"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-400 block mb-1">End Date</label>
                      <input
                        type="text"
                        placeholder="Present"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Highlights / Bullet points */}
                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <label className="text-[11px] font-semibold text-slate-400 block">Key Bullet Points & Accomplishments</label>
                  {exp.highlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="space-y-1">
                      <div className="flex gap-1.5 items-start">
                        <textarea
                          rows={2}
                          value={highlight}
                          onChange={(e) => updateHighlight(exp.id, hIdx, e.target.value)}
                          placeholder="Accomplished [X] as measured by [Y], by doing [Z]..."
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
                        />
                        <button
                          onClick={() => removeHighlight(exp.id, hIdx)}
                          className="text-slate-500 hover:text-red-400 p-1.5 mt-1"
                          title="Delete bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* AI Toolbar for bullet */}
                      <div className="flex flex-wrap gap-1 text-[10px] pl-1">
                        <button
                          onClick={() =>
                            onOpenAiEnhance('bullet', highlight, exp.role, (val) =>
                              updateHighlight(exp.id, hIdx, val)
                            )
                          }
                          className="px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
                        >
                          <Sparkles className="w-2.5 h-2.5 inline mr-1" /> AI Polish
                        </button>
                        <button
                          onClick={() =>
                            setQuantModal({
                              isOpen: true,
                              text: highlight,
                              onApply: (v) => updateHighlight(exp.id, hIdx, v),
                            })
                          }
                          className="px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30"
                        >
                          <TrendingUp className="w-2.5 h-2.5 inline mr-1" /> Add Metrics
                        </button>
                        <button
                          onClick={() =>
                            setStarModal({
                              isOpen: true,
                              onApply: (v) => updateHighlight(exp.id, hIdx, v),
                            })
                          }
                          className="px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30"
                        >
                          <Target className="w-2.5 h-2.5 inline mr-1" /> STAR Method
                        </button>
                        <button
                          onClick={() =>
                            setSimpleEngModal({
                              isOpen: true,
                              text: highlight,
                              onApply: (v) => updateHighlight(exp.id, hIdx, v),
                            })
                          }
                          className="px-1.5 py-0.5 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30"
                        >
                          🌐 Simple English
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addHighlight(exp.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 font-medium"
                  >
                    <Plus className="w-3 h-3" /> Add Another Bullet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. INTERNSHIPS TAB */}
        {activeTab === 'internships' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Internships & Traineeships</span>
              </h3>
              <button
                onClick={addInternship}
                className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Internship</span>
              </button>
            </div>

            {(data.internships || []).map((intern) => (
              <div key={intern.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">
                    {intern.role || 'Intern Role'} at {intern.company || 'Company'}
                  </span>
                  <button onClick={() => removeInternship(intern.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Google Summer of Code / TechCorp"
                      value={intern.company}
                      onChange={(e) => updateInternship(intern.id, 'company', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineering Intern"
                      value={intern.role}
                      onChange={(e) => updateInternship(intern.id, 'role', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote / Bangalore"
                      value={intern.location}
                      onChange={(e) => updateInternship(intern.id, 'location', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-400 block mb-1">Dates</label>
                      <input
                        type="text"
                        placeholder="Jun 2023 – Aug 2023"
                        value={intern.startDate}
                        onChange={(e) => updateInternship(intern.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-400" />
                <span>Projects & Open Source</span>
              </h3>
              <button
                onClick={addProject}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {data.projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">{proj.title || 'Untitled Project'}</span>
                  <button onClick={() => removeProject(proj.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Tracing Dashboard"
                      value={proj.title}
                      onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Subtitle / One-liner</label>
                    <input
                      type="text"
                      placeholder="e.g. Real-time observability engine"
                      value={proj.subtitle || ''}
                      onChange={(e) => updateProject(proj.id, 'subtitle', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Live Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={proj.link || ''}
                      onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">GitHub Repo URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={proj.github || ''}
                      onChange={(e) => updateProject(proj.id, 'github', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe problem solved, technical complexity, and outcomes..."
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Go, Docker"
                    value={proj.technologies.join(', ')}
                    onChange={(e) =>
                      updateProject(
                        proj.id,
                        'technologies',
                        e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                      )
                    }
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. EDUCATION TAB */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>Education & Academics</span>
              </h3>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree</span>
              </button>
            </div>

            {data.education.map((edu) => (
              <div key={edu.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">
                    {edu.degree || 'Degree'} at {edu.institution || 'University'}
                  </span>
                  <button onClick={() => removeEducation(edu.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Institution</label>
                    <input
                      type="text"
                      placeholder="e.g. UC Berkeley"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Degree</label>
                    <input
                      type="text"
                      placeholder="e.g. Bachelor of Science"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Field of Study</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-400 block mb-1">Dates</label>
                      <input
                        type="text"
                        placeholder="2019 – 2023"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-400 block mb-1">GPA (Optional)</label>
                      <input
                        type="text"
                        placeholder="3.8 / 4.0"
                        value={edu.gpa || ''}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 8. SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Skills & Competencies</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSuggestSkills}
                  disabled={suggestingSkills}
                  className="flex items-center gap-1 text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 px-2.5 py-1.5 rounded-lg transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{suggestingSkills ? 'Suggesting...' : 'AI Suggest Skills'}</span>
                </button>
                <button
                  onClick={addSkillCategory}
                  className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {data.skills.map((cat) => (
              <div key={cat.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateSkillCategoryName(cat.id, e.target.value)}
                    className="font-semibold text-xs text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 focus:border-blue-500"
                  />
                  <button onClick={() => removeSkillCategory(cat.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {cat.skills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2 py-1 rounded flex items-center gap-1"
                    >
                      {sk}
                      <button
                        onClick={() => removeSkillTag(cat.id, idx)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add skill..."
                      value={newSkillInputs[cat.id] || ''}
                      onChange={(e) => setNewSkillInputs({ ...newSkillInputs, [cat.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkillTag(cat.id, newSkillInputs[cat.id] || '');
                        }
                      }}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:border-blue-500 w-28"
                    />
                    <button
                      onClick={() => addSkillTag(cat.id, newSkillInputs[cat.id] || '')}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 9. CERTIFICATIONS TAB */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400" />
                <span>Certifications & Credentials</span>
              </h3>
              <button
                onClick={addCertification}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>

            {data.certifications.map((cert) => (
              <div key={cert.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">{cert.name || 'New Certification'}</span>
                  <button onClick={() => removeCertification(cert.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Certification Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AWS Certified Solutions Architect"
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Issuer</label>
                    <input
                      type="text"
                      placeholder="e.g. Amazon Web Services"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Date</label>
                    <input
                      type="text"
                      placeholder="2023"
                      value={cert.date}
                      onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 10. ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Key Achievements & Honors</span>
              </h3>
              <button
                onClick={addAchievement}
                className="flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Achievement</span>
              </button>
            </div>

            {(data.achievements || []).map((ach) => (
              <div key={ach.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="Award / Milestone title..."
                    value={ach.title}
                    onChange={(e) => updateAchievement(ach.id, 'title', e.target.value)}
                    className="font-semibold text-xs text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 w-2/3"
                  />
                  <button onClick={() => removeAchievement(ach.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Describe your achievement with concrete metrics..."
                  value={ach.description}
                  onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* 11. PUBLICATIONS TAB */}
        {activeTab === 'publications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Publications & Research Papers</span>
              </h3>
              <button
                onClick={addPublication}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Publication</span>
              </button>
            </div>

            {(data.publications || []).map((pub) => (
              <div key={pub.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">{pub.title || 'Untitled Paper'}</span>
                  <button onClick={() => removePublication(pub.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Paper Title"
                    value={pub.title}
                    onChange={(e) => updatePublication(pub.id, 'title', e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Publisher / Conference"
                    value={pub.publisher}
                    onChange={(e) => updatePublication(pub.id, 'publisher', e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 12. LANGUAGES TAB */}
        {activeTab === 'languages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-purple-400" />
                <span>Languages</span>
              </h3>
              <button
                onClick={addLanguage}
                className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Language</span>
              </button>
            </div>

            {(data.languages || []).map((lang) => (
              <div key={lang.id} className="flex gap-2 items-center p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <input
                  type="text"
                  placeholder="e.g. English, Hindi, Tamil"
                  value={lang.language}
                  onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                  className="flex-1 p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                />
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Professional">Professional</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
                <button onClick={() => removeLanguage(lang.id)} className="text-slate-500 hover:text-red-400 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 13. VOLUNTEER TAB */}
        {activeTab === 'volunteer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span>Volunteer Experience</span>
              </h3>
              <button
                onClick={addVolunteer}
                className="flex items-center gap-1 text-xs bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Volunteer Role</span>
              </button>
            </div>

            {(data.volunteer || []).map((vol) => (
              <div key={vol.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">{vol.role || 'Volunteer'}</span>
                  <button onClick={() => removeVolunteer(vol.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Organization"
                    value={vol.organization}
                    onChange={(e) => updateVolunteer(vol.id, 'organization', e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={vol.role}
                    onChange={(e) => updateVolunteer(vol.id, 'role', e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 14. LEADERSHIP TAB */}
        {activeTab === 'leadership' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Leadership & Extracurriculars</span>
              </h3>
              <button
                onClick={addLeadership}
                className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Leadership Role</span>
              </button>
            </div>

            {(data.leadership || []).map((lead) => (
              <div key={lead.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">{lead.title || 'Leadership Role'}</span>
                  <button onClick={() => removeLeadership(lead.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title (e.g. Club President)"
                    value={lead.title}
                    onChange={(e) => updateLeadership(lead.id, 'title', e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Organization (e.g. IEEE Chapter)"
                    value={lead.organization}
                    onChange={(e) => updateLeadership(lead.id, 'organization', e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 15. HOBBIES TAB */}
        {activeTab === 'hobbies' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Smile className="w-4 h-4 text-amber-400" />
              <span>Interests & Hobbies</span>
            </h3>
            <input
              type="text"
              placeholder="e.g. Open Source Contributions, Competitive Chess, Marathon Running, Photography"
              value={(data.hobbies || []).join(', ')}
              onChange={(e) =>
                onChange({
                  ...data,
                  hobbies: e.target.value.split(',').map((h) => h.trim()).filter(Boolean),
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
            />
            <p className="text-[11px] text-slate-400">Comma-separated list of genuine personal pursuits and hobbies.</p>
          </div>
        )}

        {/* 16. CUSTOM SECTIONS TAB */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Custom Sections</span>
              </h3>
              <button
                onClick={addCustomSection}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Section</span>
              </button>
            </div>

            {(data.customSections || []).map((sec) => (
              <div key={sec.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => updateCustomSectionTitle(sec.id, e.target.value)}
                    className="font-semibold text-xs text-white bg-slate-900 px-2 py-1 rounded border border-slate-800"
                  />
                  <button onClick={() => removeCustomSection(sec.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {sec.items.map((it) => (
                  <div key={it.id} className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        placeholder="Item Title..."
                        value={it.title}
                        onChange={(e) => updateCustomItem(sec.id, it.id, 'title', e.target.value)}
                        className="bg-transparent text-xs text-white flex-1"
                      />
                      <button onClick={() => removeCustomItem(sec.id, it.id)} className="text-slate-500 hover:text-red-400 text-xs">
                        ×
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Item details..."
                      value={it.description}
                      onChange={(e) => updateCustomItem(sec.id, it.id, 'description', e.target.value)}
                      className="w-full bg-slate-950 p-1.5 rounded text-xs text-slate-300"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addCustomItem(sec.id)}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SECTION MANAGER TAB */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Section Visibility & Reorder Manager</span>
            </h3>
            <p className="text-xs text-slate-400">
              Toggle visibility of any section on your resume or hide sections that do not apply to your current job target.
            </p>

            <div className="space-y-2">
              {[
                { id: 'summary', label: 'Professional Summary' },
                { id: 'careerObjective', label: 'Career Objective' },
                { id: 'skills', label: 'Skills & Tech Stack' },
                { id: 'experience', label: 'Work Experience' },
                { id: 'internships', label: 'Internships' },
                { id: 'projects', label: 'Projects' },
                { id: 'education', label: 'Education' },
                { id: 'certifications', label: 'Certifications' },
                { id: 'achievements', label: 'Achievements & Awards' },
                { id: 'publications', label: 'Publications' },
                { id: 'languages', label: 'Languages' },
                { id: 'volunteer', label: 'Volunteer Experience' },
                { id: 'leadership', label: 'Leadership' },
                { id: 'hobbies', label: 'Hobbies & Interests' },
              ].map((sec) => {
                const isHidden = (data.hiddenSections || []).includes(sec.id);
                return (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs"
                  >
                    <span className={`font-medium ${isHidden ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {sec.label}
                    </span>
                    <button
                      onClick={() => toggleHideSection(sec.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition ${
                        isHidden
                          ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          : 'bg-blue-600/20 border-blue-500 text-blue-400'
                      }`}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isHidden ? 'Hidden' : 'Visible'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quantification Modal */}
      <QuantificationModal
        isOpen={quantModal.isOpen}
        onClose={() => setQuantModal({ isOpen: false, text: '' })}
        originalBullet={quantModal.text}
        roleContext={data.personalInfo.jobTitle}
        onApply={(v) => {
          if (quantModal.onApply) quantModal.onApply(v);
        }}
      />

      {/* STAR Generator Modal */}
      <StarGeneratorModal
        isOpen={starModal.isOpen}
        onClose={() => setStarModal({ isOpen: false })}
        roleContext={data.personalInfo.jobTitle}
        onApply={(v) => {
          if (starModal.onApply) starModal.onApply(v);
        }}
      />

      {/* Simple English Modal */}
      <SimpleEnglishModal
        isOpen={simpleEngModal.isOpen}
        onClose={() => setSimpleEngModal({ isOpen: false, text: '' })}
        initialText={simpleEngModal.text}
        onApply={(v) => {
          if (simpleEngModal.onApply) simpleEngModal.onApply(v);
        }}
      />
    </div>
  );
};
