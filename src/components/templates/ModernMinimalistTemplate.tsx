import React from 'react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import { Mail, Phone, MapPin, Globe, ExternalLink } from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '../common/SocialIcons';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
}

export const ModernMinimalistTemplate: React.FC<Props> = ({ data, theme }) => {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = data;

  const fontClass =
    theme.fontFamily === 'merriweather'
      ? 'font-serif'
      : theme.fontFamily === 'roboto'
      ? 'font-sans'
      : 'font-sans';

  const spacingClass =
    theme.spacing === 'compact' ? 'space-y-3' : theme.spacing === 'spacious' ? 'space-y-6' : 'space-y-4';

  return (
    <div className={`p-8 bg-white text-slate-800 ${fontClass} text-xs leading-relaxed`}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-sm font-medium mt-0.5" style={{ color: theme.primaryColor }}>
            {personalInfo.jobTitle || 'Professional Role'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:underline">
                Portfolio
              </a>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1.5">
              <LinkedInIcon className="w-3.5 h-3.5 text-slate-400" />
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                LinkedIn
              </a>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-1.5">
              <GitHubIcon className="w-3.5 h-3.5 text-slate-400" />
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:underline">
                GitHub
              </a>
            </div>
          )}
        </div>
      </div>

      <div className={`mt-5 ${spacingClass}`}>
        {/* Summary */}
        {summary && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">About Me</h2>
            </div>
            <p className="text-slate-600 pl-4 border-l-2 border-slate-100">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.filter((e) => e.role || e.company || (e.highlights && e.highlights.some((h) => h.trim()))).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Experience</h2>
            </div>
            <div className="space-y-4 pl-4 border-l-2 border-slate-100">
              {experience
                .filter((e) => e.role || e.company || (e.highlights && e.highlights.some((h) => h.trim())))
                .map((exp) => (
                  <div key={exp.id} className="relative">
                    <div className="flex justify-between items-baseline">
                      <div className="font-semibold text-slate-900">
                        {exp.role && <span className="text-sm font-bold">{exp.role}</span>}
                        {exp.role && exp.company && <span className="text-slate-400 font-normal"> · </span>}
                        {exp.company && <span className="text-slate-500 font-normal">{exp.company}</span>}
                      </div>
                      {(exp.startDate || exp.endDate || exp.current) && (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? '–' : ''} {exp.current ? 'Present' : exp.endDate}
                        </span>
                      )}
                    </div>
                    {exp.location && <div className="text-[11px] text-slate-400 mt-0.5">{exp.location}</div>}
                    {exp.highlights && exp.highlights.filter((h) => h.trim()).length > 0 && (
                      <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600">
                        {exp.highlights
                          .filter((h) => h.trim())
                          .map((bullet, idx) => (
                            <li key={idx}>{bullet}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Skills</h2>
            </div>
            <div className="pl-4 border-l-2 border-slate-100 space-y-2">
              {skills.map((cat) => (
                <div key={cat.id} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 w-28">{cat.name}:</span>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Projects</h2>
            </div>
            <div className="pl-4 border-l-2 border-slate-100 space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-900">
                      {proj.title} {proj.subtitle && <span className="text-slate-500 font-normal">({proj.subtitle})</span>}
                    </span>
                    <div className="flex gap-2 text-[10px]">
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-0.5 text-blue-600 hover:underline"
                        >
                          Demo <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {proj.github && (
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-0.5 text-slate-600 hover:underline"
                        >
                          Code <GitHubIcon className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600 mt-1">{proj.description}</p>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certifications Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {education.filter((e) => e.degree || e.institution).length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Education</h2>
              </div>
              <div className="pl-4 border-l-2 border-slate-100 space-y-2">
                {education
                  .filter((e) => e.degree || e.institution)
                  .map((edu) => (
                    <div key={edu.id}>
                      <div className="font-semibold text-slate-900">
                        {edu.degree && <span>{edu.degree}</span>}
                        {edu.degree && edu.fieldOfStudy && <span> in {edu.fieldOfStudy}</span>}
                      </div>
                      {edu.institution && <div className="text-slate-500 text-[11px]">{edu.institution}</div>}
                      {(edu.startDate || edu.endDate) && (
                        <div className="text-slate-400 text-[10px]">
                          {edu.startDate} {edu.startDate && edu.endDate ? '–' : ''} {edu.endDate} {edu.gpa && `· GPA: ${edu.gpa}`}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Certifications</h2>
              </div>
              <div className="pl-4 border-l-2 border-slate-100 space-y-1.5">
                {certifications.map((cert) => (
                  <div key={cert.id} className="text-[11px]">
                    <span className="font-semibold text-slate-900">{cert.name}</span>
                    <div className="text-slate-500 text-[10px]">{cert.issuer} · {cert.date}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
