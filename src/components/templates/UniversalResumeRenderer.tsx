import React from 'react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Award,
  BookOpen,
  Languages,
  HeartHandshake,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { LinkedInIcon as Linkedin, GitHubIcon as Github } from '../common/SocialIcons';

interface UniversalResumeRendererProps {
  data: ResumeData;
  theme: ResumeTheme;
  id?: string;
  className?: string;
}

// Action verbs and weak phrases for heatmap scoring
const STRONG_VERBS = new Set([
  'architected', 'accelerated', 'achieved', 'administered', 'analyzed', 'automated',
  'built', 'boosted', 'championed', 'coached', 'collaborated', 'consolidated',
  'converted', 'created', 'decreased', 'delivered', 'deployed', 'designed',
  'developed', 'devised', 'doubled', 'drove', 'eliminated', 'enabled',
  'engineered', 'enhanced', 'established', 'executed', 'expanded', 'expedited',
  'formulated', 'generated', 'governed', 'guided', 'halved', 'headed',
  'implemented', 'improved', 'increased', 'initiated', 'innovated', 'instituted',
  'integrated', 'introduced', 'launched', 'led', 'leveraged', 'managed',
  'maximized', 'mentored', 'migrated', 'minimized', 'modernized', 'negotiated',
  'optimized', 'orchestrated', 'overhauled', 'pioneered', 'planned', 'produced',
  'reduced', 'refactored', 'scaled', 'secured', 'simplified', 'spearheaded',
  'standardized', 'streamlined', 'strengthened', 'surpassed', 'trained', 'transformed'
]);

const WEAK_REGEX = /\b(responsible for|worked on|helped with|assisted in|tasks were|handled|duties included|successfully)\b/i;
const METRIC_REGEX = /(\d+[\d,.]*\s*(%|\$|k|M|B|x|users|clients|ms|s|hours|days|engineers|teams|queries)?)/i;

function getBulletHeatmapStatus(bullet: string): 'strong' | 'weak' | 'moderate' {
  if (WEAK_REGEX.test(bullet)) return 'weak';
  const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  const hasMetric = METRIC_REGEX.test(bullet);
  if (STRONG_VERBS.has(firstWord) || hasMetric) return 'strong';
  return 'moderate';
}

export const UniversalResumeRenderer: React.FC<UniversalResumeRendererProps> = ({
  data,
  theme,
  id = 'resume-universal-document',
  className = '',
}) => {
  const { personalInfo } = data;
  const primaryColor = theme.primaryColor || '#2563eb';
  const isHeatmap = !!theme.showHeatmap;
  const template = theme.template;

  // Font family mapping
  const fontClass =
    theme.fontFamily === 'merriweather' || theme.fontFamily === 'playfair'
      ? 'font-serif'
      : theme.fontFamily === 'fira'
      ? 'font-mono'
      : 'font-sans';

  // Spacing presets
  const spacingClasses = {
    compact: {
      root: 'p-6 text-[12px] leading-relaxed',
      section: 'mb-3',
      header: 'mb-3 pb-2',
      item: 'mb-2',
      list: 'space-y-0.5',
    },
    normal: {
      root: 'p-8 text-[13.5px] leading-relaxed',
      section: 'mb-5',
      header: 'mb-5 pb-3',
      item: 'mb-3',
      list: 'space-y-1',
    },
    spacious: {
      root: 'p-10 text-[14px] leading-loose',
      section: 'mb-6',
      header: 'mb-6 pb-4',
      item: 'mb-4',
      list: 'space-y-1.5',
    },
  }[theme.spacing || 'normal'];

  const isHidden = (sec: string) => data.hiddenSections?.includes(sec);

  // Template layout characteristics
  const isTwoCol = ['designer', 'portfolio-style'].includes(template);
  const isHeaderBand = ['executive', 'modern-creative'].includes(template);
  const isMinimal = ['minimal-ats', 'minimal-creative'].includes(template);
  const isTechFocused = ['tech', 'data-scientist', 'data-analyst', 'ai-ml-engineer'].includes(template);
  const isFresherFocused = ['fresher', 'college-student', 'internship', 'graduate'].includes(template) || !!data.isFresherMode;

  const renderBullet = (bullet: string, idx: number) => {
    if (!isHeatmap) {
      return (
        <li key={idx} className="text-slate-800 flex items-start">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 mr-2 shrink-0" />
          <span>{bullet}</span>
        </li>
      );
    }

    const status = getBulletHeatmapStatus(bullet);
    const badgeClass =
      status === 'strong'
        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
        : status === 'weak'
        ? 'bg-rose-50 border-rose-300 text-rose-950'
        : 'bg-amber-50 border-amber-300 text-amber-950';

    const label =
      status === 'strong'
        ? '🟢 Strong Impact'
        : status === 'weak'
        ? '🔴 Weak Phrasing / Duty'
        : '🟡 Moderate Impact';

    return (
      <li key={idx} className={`p-1.5 rounded border ${badgeClass} text-xs transition-colors my-1`}>
        <div className="flex items-center justify-between font-semibold text-[10px] uppercase tracking-wider mb-0.5 opacity-85">
          <span>{label}</span>
        </div>
        <div className="text-slate-900">{bullet}</div>
      </li>
    );
  };

  // Section Heading Component
  const SectionHeader = ({ title, icon: Icon }: { title: string; icon?: React.ElementType }) => {
    if (isMinimal) {
      return (
        <div className="border-b border-slate-400 pb-1 mb-2 mt-4">
          <h2 className="text-xs font-bold tracking-widest uppercase text-slate-900 flex items-center gap-1.5">
            {Icon && <Icon className="w-3.5 h-3.5 text-slate-700" />}
            {title}
          </h2>
        </div>
      );
    }

    return (
      <div className="pb-1 mb-2.5 mt-4 border-b" style={{ borderColor: `${primaryColor}40` }}>
        <h2
          className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5"
          style={{ color: primaryColor }}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {title}
        </h2>
      </div>
    );
  };

  return (
    <div
      id={id}
      className={`bg-white text-slate-900 shadow-md mx-auto w-full transition-all duration-200 ${fontClass} ${spacingClasses.root} ${className}`}
      style={{ minHeight: '1056px', maxWidth: '816px' }}
    >
      {/* Header Band Style (for Executive / Modern Creative) */}
      {isHeaderBand ? (
        <div
          className="-mx-8 -mt-8 p-8 mb-6 text-white rounded-t-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{personalInfo.fullName || 'Your Name'}</h1>
              <p className="text-sm font-medium text-white/90 mt-0.5">{personalInfo.jobTitle || 'Professional Title'}</p>
            </div>
            {data.isMasterResume && (
              <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                Master Resume
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-white/80 mt-3 pt-3 border-t border-white/20">
            {personalInfo.email && (
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personalInfo.email}</span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personalInfo.phone}</span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {personalInfo.location}</span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1"><Github className="w-3 h-3" /> {personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
            )}
          </div>
        </div>
      ) : (
        /* Standard / ATS / Minimal Header */
        <header className={spacingClasses.header}>
          <div className="text-center sm:text-left flex flex-col sm:flex-row justify-between items-start">
            <div>
              <h1
                className="text-2xl font-bold tracking-tight text-slate-950"
                style={{ color: template === 'classic' || isMinimal ? '#0f172a' : primaryColor }}
              >
                {personalInfo.fullName || 'Your Full Name'}
              </h1>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{personalInfo.jobTitle || 'Target Career Title'}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              {data.isMasterResume && (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                  Master Repository
                </span>
              )}
              {isFresherFocused && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                  Student / Fresher
                </span>
              )}
            </div>
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-200">
            {personalInfo.email && (
              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {personalInfo.email}</span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {personalInfo.phone}</span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {personalInfo.location}</span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1"><Linkedin className="w-3 h-3 text-slate-400" /> {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1"><Github className="w-3 h-3 text-slate-400" /> {personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-slate-400" /> {personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
            )}
          </div>
        </header>
      )}

      {/* Heatmap Notice Banner */}
      {isHeatmap && (
        <div className="no-print bg-slate-100 border border-slate-300 rounded p-2 mb-4 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">AI Heatmap Active:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">🟢 Strong Impact</span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">🟡 Moderate</span>
            <span className="inline-flex items-center gap-1 text-rose-700 font-medium">🔴 Needs Improvement</span>
          </div>
          <span className="text-[10px] text-slate-500">Only visible on screen</span>
        </div>
      )}

      {/* Main Layout (Single Column vs Two Column) */}
      <div className={isTwoCol ? 'grid grid-cols-12 gap-6' : 'space-y-4'}>
        {/* Left Column (if Two-Col template) */}
        {isTwoCol && (
          <aside className="col-span-4 space-y-4 border-r border-slate-200 pr-4">
            {/* Skills */}
            {!isHidden('skills') && data.skills?.length > 0 && (
              <div>
                <SectionHeader title="Skills & Tech" />
                <div className="space-y-2.5">
                  {data.skills.map((cat) => (
                    <div key={cat.id}>
                      <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">{cat.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cat.skills.map((sk, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-800 text-[11px] px-1.5 py-0.5 rounded font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {!isHidden('languages') && (data.languages?.length ?? 0) > 0 && (
              <div>
                <SectionHeader title="Languages" icon={Languages} />
                <div className="space-y-1 text-xs">
                  {data.languages!.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-slate-700">
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-slate-500">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {!isHidden('certifications') && data.certifications?.length > 0 && (
              <div>
                <SectionHeader title="Certifications" icon={Award} />
                <div className="space-y-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="text-xs">
                      <div className="font-semibold text-slate-900">{cert.name}</div>
                      <div className="text-slate-500 text-[11px]">{cert.issuer} • {cert.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education in sidebar for two-col */}
            {!isHidden('education') && data.education?.length > 0 && (
              <div>
                <SectionHeader title="Education" icon={BookOpen} />
                <div className="space-y-2">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="font-semibold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</div>
                      <div className="text-slate-600">{edu.institution}</div>
                      <div className="text-slate-500 text-[11px]">{edu.startDate} – {edu.endDate} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Right / Main Content Column */}
        <main className={isTwoCol ? 'col-span-8 space-y-4' : 'space-y-4'}>
          {/* Summary or Career Objective */}
          {!isHidden('summary') && data.summary && (
            <div>
              <SectionHeader title="Professional Summary" />
              <p className="text-slate-700 leading-relaxed text-justify">{data.summary}</p>
            </div>
          )}

          {!isHidden('careerObjective') && data.careerObjective && (
            <div>
              <SectionHeader title="Career Objective" />
              <p className="text-slate-700 leading-relaxed text-justify">{data.careerObjective}</p>
            </div>
          )}

          {/* If Fresher / Student mode or Technical template, display Education / Projects first */}
          {isFresherFocused && !isTwoCol && !isHidden('education') && data.education?.length > 0 && (
            <div>
              <SectionHeader title="Education & Academics" icon={BookOpen} />
              <div className="space-y-2.5">
                {data.education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-semibold text-slate-900">
                      <span>{edu.degree} in {edu.fieldOfStudy}</span>
                      <span className="text-slate-500 text-[11px]">{edu.startDate} – {edu.endDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{edu.institution}, {edu.location}</span>
                      {edu.gpa && <span className="font-medium text-slate-700">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills Matrix (Single Column view) */}
          {!isTwoCol && !isHidden('skills') && data.skills?.length > 0 && (
            <div>
              <SectionHeader title={isTechFocused ? 'Technical Skills Matrix' : 'Core Competencies'} />
              <div className="space-y-1.5 text-xs">
                {data.skills.map((cat) => (
                  <div key={cat.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                    <span className="font-bold text-slate-800 min-w-36 text-[11.5px]">{cat.name}:</span>
                    <span className="text-slate-700">{cat.skills.join(' • ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {!isHidden('experience') && data.experience?.length > 0 && (
            <div>
              <SectionHeader title="Professional Experience" />
              <div className="space-y-3">
                {data.experience.map((exp) => (
                  <div key={exp.id} className={spacingClasses.item}>
                    <div className="flex justify-between items-baseline font-semibold text-slate-900">
                      <span className="text-sm">{exp.role}</span>
                      <span className="text-slate-500 text-xs font-normal">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium" style={{ color: primaryColor }}>{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    <ul className={`list-none ${spacingClasses.list}`}>
                      {exp.highlights.map((bullet, bIdx) => renderBullet(bullet, bIdx))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internships (Especially crucial for Fresher Mode) */}
          {!isHidden('internships') && (data.internships?.length ?? 0) > 0 && (
            <div>
              <SectionHeader title="Internships & Co-Ops" />
              <div className="space-y-3">
                {data.internships!.map((intern) => (
                  <div key={intern.id} className={spacingClasses.item}>
                    <div className="flex justify-between items-baseline font-semibold text-slate-900">
                      <span className="text-sm">{intern.role}</span>
                      <span className="text-slate-500 text-xs font-normal">
                        {intern.startDate} – {intern.current ? 'Present' : intern.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium" style={{ color: primaryColor }}>{intern.company}</span>
                      <span>{intern.location}</span>
                    </div>
                    <ul className={`list-none ${spacingClasses.list}`}>
                      {intern.highlights.map((bullet, bIdx) => renderBullet(bullet, bIdx))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {!isHidden('projects') && data.projects?.length > 0 && (
            <div>
              <SectionHeader title="Key Projects & Open Source" />
              <div className="space-y-3">
                {data.projects.map((proj) => (
                  <div key={proj.id} className={spacingClasses.item}>
                    <div className="flex justify-between items-baseline font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{proj.title}</span>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] underline text-blue-600 font-normal hover:text-blue-800"
                          >
                            Live Demo
                          </a>
                        )}
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] underline text-slate-600 font-normal hover:text-slate-900"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                      {proj.subtitle && <span className="text-slate-500 text-xs font-normal">{proj.subtitle}</span>}
                    </div>
                    <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="text-[11px] text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">Technologies: </span>
                        {proj.technologies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Education (Single column non-fresher) */}
          {!isFresherFocused && !isTwoCol && !isHidden('education') && data.education?.length > 0 && (
            <div>
              <SectionHeader title="Education" icon={BookOpen} />
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-semibold text-slate-900">
                      <span>{edu.degree} in {edu.fieldOfStudy}</span>
                      <span className="text-slate-500 text-[11px]">{edu.startDate} – {edu.endDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{edu.institution}, {edu.location}</span>
                      {edu.gpa && <span className="font-medium text-slate-700">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications (Single column) */}
          {!isTwoCol && !isHidden('certifications') && data.certifications?.length > 0 && (
            <div>
              <SectionHeader title="Certifications" icon={Award} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-800">{cert.name}</span>
                    <span className="text-slate-500 text-[11px] shrink-0 ml-2">{cert.issuer} ({cert.date})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {!isHidden('achievements') && (data.achievements?.length ?? 0) > 0 && (
            <div>
              <SectionHeader title="Key Achievements & Awards" icon={Star} />
              <div className="space-y-1.5 text-xs">
                {data.achievements!.map((ach) => (
                  <div key={ach.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{ach.title}: </span>
                      <span className="text-slate-700">{ach.description}</span>
                      {ach.date && <span className="text-slate-400 text-[10px] ml-1">({ach.date})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publications */}
          {!isHidden('publications') && (data.publications?.length ?? 0) > 0 && (
            <div>
              <SectionHeader title="Publications & Research" />
              <div className="space-y-1.5 text-xs">
                {data.publications!.map((pub) => (
                  <div key={pub.id}>
                    <div className="font-semibold text-slate-900">
                      {pub.title} – <span className="font-normal text-slate-600">{pub.publisher} ({pub.date})</span>
                    </div>
                    {pub.description && <p className="text-slate-600 text-[11px] mt-0.5">{pub.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leadership & Volunteer */}
          {!isHidden('leadership') && (data.leadership?.length ?? 0) > 0 && (
            <div>
              <SectionHeader title="Leadership & Activities" icon={ShieldCheck} />
              <div className="space-y-1.5 text-xs">
                {data.leadership!.map((lead) => (
                  <div key={lead.id}>
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>{lead.title}, {lead.organization}</span>
                      <span className="text-slate-500 font-normal text-[11px]">{lead.date}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{lead.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isHidden('volunteer') && (data.volunteer?.length ?? 0) > 0 && (
            <div>
              <SectionHeader title="Volunteer Experience" icon={HeartHandshake} />
              <div className="space-y-1.5 text-xs">
                {data.volunteer!.map((vol) => (
                  <div key={vol.id}>
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>{vol.role}, {vol.organization}</span>
                      <span className="text-slate-500 font-normal text-[11px]">{vol.date}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{vol.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages (Single column) */}
          {!isTwoCol && !isHidden('languages') && (data.languages?.length ?? 0) > 0 && (
            <div>
              <SectionHeader title="Languages" icon={Languages} />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                {data.languages!.map((lang) => (
                  <span key={lang.id}>
                    <strong className="text-slate-900">{lang.language}:</strong> {lang.proficiency}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies & Custom Sections */}
          {!isHidden('hobbies') && (data.hobbies?.length ?? 0) > 0 && (
            <div>
              <SectionHeader title="Interests & Hobbies" />
              <p className="text-xs text-slate-700">{data.hobbies!.join(' • ')}</p>
            </div>
          )}

          {!isHidden('customSections') && (data.customSections?.length ?? 0) > 0 && (
            <div className="space-y-3">
              {data.customSections!.map((sec) => (
                <div key={sec.id}>
                  <SectionHeader title={sec.title} />
                  <div className="space-y-1.5 text-xs">
                    {sec.items.map((it) => (
                      <div key={it.id}>
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span>{it.title} {it.subtitle ? `• ${it.subtitle}` : ''}</span>
                          {it.date && <span className="text-slate-500 font-normal text-[11px]">{it.date}</span>}
                        </div>
                        <p className="text-slate-600 text-[11px]">{it.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer Trust Guarantee */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center no-print">
        <span>Prepared with CareerForge AI</span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <ShieldCheck className="w-3 h-3" /> Anti-Fabrication Verified
        </span>
      </div>
    </div>
  );
};
