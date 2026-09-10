import React, { useState, useEffect, useMemo } from 'react';
import type { JobApplication, ResumeData } from '../../types/resume';
import {
  Briefcase,
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  resumeData?: ResumeData;
  onSelectRoleForInterview?: (role: string) => void;
}

const STORAGE_KEY = 'RESUMAI_JOB_APPLICATIONS_V1';

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    company: 'Stripe',
    jobTitle: 'Senior Full Stack Engineer',
    location: 'Remote, US',
    dateApplied: '2026-08-28',
    status: 'Interview',
    resumeUsed: 'Master Resume (v2.1)',
    interviewDate: '2026-09-08',
    notes: 'Technical screen completed with Lead Architect. System design round scheduled next week.',
  },
  {
    id: 'app-2',
    company: 'Vercel',
    jobTitle: 'Frontend Platform Engineer',
    location: 'Remote',
    dateApplied: '2026-09-01',
    status: 'Assessment',
    resumeUsed: 'Targeted: React/Next.js Expert',
    notes: 'Take-home assessment on Server Components optimization received. Due in 48 hours.',
  },
  {
    id: 'app-3',
    company: 'Datadog',
    jobTitle: 'Software Engineer - Distributed Systems',
    location: 'New York, NY',
    dateApplied: '2026-08-15',
    status: 'Offer',
    resumeUsed: 'Master Resume',
    notes: 'Offer package received: $165k base + equity. Reviewing benefits and deadline.',
  },
  {
    id: 'app-4',
    company: 'Cloudflare',
    jobTitle: 'Systems Infrastructure Engineer',
    location: 'Austin, TX',
    dateApplied: '2026-08-20',
    status: 'Applied',
    resumeUsed: 'Targeted: Cloudflare',
    notes: 'Applied via employee referral from college alumni network.',
  },
  {
    id: 'app-5',
    company: 'Shopify',
    jobTitle: 'Senior Backend Developer',
    location: 'Remote, Canada/US',
    dateApplied: '2026-08-10',
    status: 'Saved',
    resumeUsed: 'Master Resume',
    notes: 'Tailoring resume using Job Matcher before applying tomorrow.',
  },
  {
    id: 'app-6',
    company: 'Airbnb',
    jobTitle: 'Full Stack Engineer - Guest Experience',
    location: 'San Francisco, CA',
    dateApplied: '2026-07-22',
    status: 'Rejected',
    resumeUsed: 'General Tech Resume',
    notes: 'Role closed due to internal headcount freeze. Encouraged to reapply next quarter.',
  },
];

const STATUS_COLUMNS: Array<{
  id: JobApplication['status'];
  label: string;
  color: string;
  badge: string;
}> = [
  { id: 'Saved', label: 'Saved', color: 'border-slate-700 bg-slate-900/40', badge: 'bg-slate-700 text-slate-300' },
  { id: 'Applied', label: 'Applied', color: 'border-blue-900/60 bg-blue-950/20', badge: 'bg-blue-600/20 text-blue-400 border-blue-500/30' },
  { id: 'Assessment', label: 'Assessment', color: 'border-purple-900/60 bg-purple-950/20', badge: 'bg-purple-600/20 text-purple-400 border-purple-500/30' },
  { id: 'Interview', label: 'Interviewing', color: 'border-amber-900/60 bg-amber-950/20', badge: 'bg-amber-600/20 text-amber-400 border-amber-500/30' },
  { id: 'Offer', label: 'Offer Received', color: 'border-emerald-900/60 bg-emerald-950/20', badge: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30' },
  { id: 'Rejected', label: 'Rejected', color: 'border-red-900/40 bg-red-950/10', badge: 'bg-red-600/10 text-red-400 border-red-500/20' },
];

export const ApplicationTrackerView: React.FC<Props> = ({
  resumeData,
  onSelectRoleForInterview,
}) => {
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved applications', e);
    }
    return INITIAL_APPLICATIONS;
  });

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form state
  const [formState, setFormState] = useState<{
    company: string;
    jobTitle: string;
    location: string;
    dateApplied: string;
    status: JobApplication['status'];
    resumeUsed: string;
    interviewDate: string;
    notes: string;
  }>({
    company: '',
    jobTitle: '',
    location: 'Remote',
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'Applied',
    resumeUsed: 'Master Resume',
    interviewDate: '',
    notes: '',
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to save applications', e);
    }
  }, [applications]);

  // Funnel Analytics calculations
  const analytics = useMemo(() => {
    const total = applications.length;
    const appliedCount = applications.filter((a) => a.status !== 'Saved').length;
    const interviewCount = applications.filter(
      (a) => a.status === 'Interview' || a.status === 'Offer'
    ).length;
    const assessmentCount = applications.filter((a) => a.status === 'Assessment').length;
    const offerCount = applications.filter((a) => a.status === 'Offer').length;

    const responseRate = appliedCount > 0 ? Math.round(((interviewCount + assessmentCount) / appliedCount) * 100) : 0;
    const interviewRate = appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0;
    const offerRate = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;

    return {
      total,
      appliedCount,
      interviewCount,
      offerCount,
      responseRate,
      interviewRate,
      offerRate,
    };
  }, [applications]);

  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFormState({
      company: '',
      jobTitle: resumeData?.personalInfo.jobTitle || 'Software Engineer',
      location: 'Remote',
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'Applied',
      resumeUsed: 'Master Resume',
      interviewDate: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setFormState({
      company: app.company,
      jobTitle: app.jobTitle,
      location: app.location,
      dateApplied: app.dateApplied,
      status: app.status,
      resumeUsed: app.resumeUsed,
      interviewDate: app.interviewDate || '',
      notes: app.notes,
    });
    setIsModalOpen(true);
  };

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.company.trim() || !formState.jobTitle.trim()) return;

    if (editingApp) {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === editingApp.id
            ? {
                ...a,
                ...formState,
              }
            : a
        )
      );
    } else {
      const newApp: JobApplication = {
        id: `app-${Date.now()}`,
        ...formState,
      };
      setApplications([newApp, ...applications]);
      if (formState.status === 'Offer') {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteApp = (id: string) => {
    if (confirm('Delete this application entry?')) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleUpdateStatus = (appId: string, newStatus: JobApplication['status']) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    if (newStatus === 'Offer') {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter((a) => {
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesSearch =
        a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Mission Control */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Briefcase className="w-3 h-3" />
                Pipeline Manager
              </span>
              <span className="text-[11px] text-slate-400">
                Tracking {applications.length} applications
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Job Application Tracker
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Organize your job search pipeline from initial application to offer letters with conversion analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          </div>
        </div>

        {/* Analytics KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Tracked</span>
            <div className="text-xl font-bold text-white mt-0.5">{analytics.total}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Applied</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{analytics.appliedCount}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Interviewing</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{analytics.interviewCount}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Offers</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{analytics.offerCount}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Response Rate</span>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{analytics.responseRate}%</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Interview Rate</span>
            <div className="text-xl font-bold text-teal-400 mt-0.5">{analytics.interviewRate}%</div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, title, or notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by application status"
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            {STATUS_COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        {/* Kanban vs List toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
              viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((column) => {
            const colApps = filteredApps.filter((a) => a.status === column.id);

            return (
              <div
                key={column.id}
                className={`rounded-2xl border p-3 flex flex-col gap-3 min-h-[500px] ${column.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-200">{column.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${column.badge}`}>
                    {colApps.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition shadow-lg space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition leading-snug">
                            {app.company}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                            {app.jobTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Location & Resume tag */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-500" />
                          {app.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 truncate max-w-[120px]" title={app.resumeUsed}>
                          <FileText className="w-2.5 h-2.5 text-blue-400" />
                          {app.resumeUsed}
                        </span>
                      </div>

                      {/* Notes / Next steps */}
                      {app.notes && (
                        <p className="text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-850 line-clamp-2 leading-relaxed">
                          {app.notes}
                        </p>
                      )}

                      {/* Interview Reminder */}
                      {app.interviewDate && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 font-medium">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>Round on {app.interviewDate}</span>
                        </div>
                      )}

                      {/* Status Move Shortcuts */}
                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{app.dateApplied}</span>
                        <div className="flex items-center gap-1">
                          {column.id === 'Interview' && onSelectRoleForInterview && (
                            <button
                              onClick={() => onSelectRoleForInterview(app.jobTitle)}
                              className="text-blue-400 hover:underline font-semibold"
                            >
                              Prep AI →
                            </button>
                          )}
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value as any)}
                            aria-label={`Update status for ${app.company}`}
                            className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            {STATUS_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                Move: {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-600 italic">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Company</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Applied Date</th>
                  <th className="py-3.5 px-4 font-semibold">Resume Used</th>
                  <th className="py-3.5 px-4 font-semibold">Next Step / Notes</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredApps.map((app) => {
                  const statusMeta = STATUS_COLUMNS.find((c) => c.id === app.status) || STATUS_COLUMNS[0];
                  return (
                    <tr key={app.id} className="hover:bg-slate-850/60 transition group">
                      <td className="py-3.5 px-4 font-bold text-white">{app.company}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{app.jobTitle}</td>
                      <td className="py-3.5 px-4 text-slate-400">{app.location}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{app.dateApplied}</td>
                      <td className="py-3.5 px-4 text-blue-400">{app.resumeUsed}</td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {app.interviewDate ? `Interview: ${app.interviewDate}` : app.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white">
              {editingApp ? 'Edit Application Details' : 'Add New Job Application'}
            </h3>

            <form onSubmit={handleSaveApp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    placeholder="e.g. Google, Stripe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formState.jobTitle}
                    onChange={(e) => setFormState({ ...formState, jobTitle: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    placeholder="Remote / San Francisco"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Date Applied</label>
                  <input
                    type="date"
                    value={formState.dateApplied}
                    onChange={(e) => setFormState({ ...formState, dateApplied: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Application Status</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {STATUS_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Resume Version Used</label>
                  <input
                    type="text"
                    value={formState.resumeUsed}
                    onChange={(e) => setFormState({ ...formState, resumeUsed: e.target.value })}
                    placeholder="Master Resume / Targeted Vercel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Next Step / Interview Date (Optional)</label>
                <input
                  type="date"
                  value={formState.interviewDate}
                  onChange={(e) => setFormState({ ...formState, interviewDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Notes & Context</label>
                <textarea
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  placeholder="Referral contact, recruiter notes, salary range, interview rounds..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl transition cursor-pointer"
                >
                  {editingApp ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
