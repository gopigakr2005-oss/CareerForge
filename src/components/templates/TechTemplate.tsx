import React from 'react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import { Mail, Phone, MapPin, Globe, ExternalLink, Terminal } from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '../common/SocialIcons';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
}

export const TechTemplate: React.FC<Props> = ({ data, theme }) => {
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
    <div className={`p-8 bg-white text-gray-800 ${fontClass} text-xs leading-relaxed`}>
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-300 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-gray-500" />
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-gray-950">
              {personalInfo.fullName || 'dev_name'}
            </h1>
          </div>
          <p className="text-sm font-mono font-medium text-gray-600 mt-1">
            {personalInfo.jobTitle || 'Full Stack Engineer'}
          </p>
        </div>

        <div className="text-[11px] font-mono space-y-1 text-gray-600">
          <div className="flex items-center gap-2">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-gray-400" />
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-400" />
                {personalInfo.phone}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {personalInfo.location}
              </span>
            )}
            {personalInfo.github && (
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                <GitHubIcon className="w-3 h-3" />
                github
              </a>
            )}
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                <LinkedInIcon className="w-3 h-3" />
                linkedin
              </a>
            )}
            {personalInfo.website && (
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                <Globe className="w-3 h-3" />
                web
              </a>
            )}
          </div>
        </div>
      </header>

      <div className={`mt-4 ${spacingClass}`}>
        {/* Technical Summary */}
        {summary && (
          <section>
            <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[11px] font-bold text-gray-900">
              <span style={{ color: theme.primaryColor }}>//</span> <span>OVERVIEW</span>
            </div>
            <p className="text-gray-700 bg-gray-50 border border-gray-200 p-2.5 rounded font-sans text-xs">
              {summary}
            </p>
          </section>
        )}

        {/* Technical Skills Stack */}
        {skills.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2 font-mono text-[11px] font-bold text-gray-900">
              <span style={{ color: theme.primaryColor }}>//</span> <span>TECHNICAL_SKILLS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/50 p-2.5 rounded border border-gray-200 text-xs">
              {skills.map((cat) => (
                <div key={cat.id}>
                  <span className="font-mono font-bold text-gray-700 text-[11px] block">{cat.name}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cat.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white border border-gray-300 text-gray-800"
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

        {/* Experience */}
        {experience.filter((e) => e.role || e.company || (e.highlights && e.highlights.some((h) => h.trim()))).length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2.5 font-mono text-[11px] font-bold text-gray-900">
              <span style={{ color: theme.primaryColor }}>//</span> <span>WORK_EXPERIENCE</span>
            </div>
            <div className="space-y-3.5">
              {experience
                .filter((e) => e.role || e.company || (e.highlights && e.highlights.some((h) => h.trim())))
                .map((exp) => (
                  <div key={exp.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-mono">
                      <span className="font-bold text-sm text-gray-900">{exp.role || exp.company}</span>
                      {(exp.startDate || exp.endDate || exp.current) && (
                        <span className="text-[11px] text-gray-500">
                          {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? '>' : ''} {exp.current ? 'Present' : exp.endDate}
                        </span>
                      )}
                    </div>
                    {exp.role && exp.company && (
                      <div className="text-[11px] text-gray-600 font-semibold mb-1">
                        <span style={{ color: theme.primaryColor }}>@{exp.company}</span>
                        {exp.location && <span className="text-gray-400 font-normal"> · {exp.location}</span>}
                      </div>
                    )}
                    {exp.highlights && exp.highlights.filter((h) => h.trim()).length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700">
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

        {/* Featured Projects */}
        {projects.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2 font-mono text-[11px] font-bold text-gray-900">
              <span style={{ color: theme.primaryColor }}>//</span> <span>FEATURED_PROJECTS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="p-2.5 rounded border border-gray-200 bg-white">
                  <div className="flex justify-between items-start font-mono text-xs">
                    <span className="font-bold text-gray-900">{proj.title}</span>
                    <div className="flex gap-2 text-[11px]">
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proj.github && (
                        <a href={proj.github} target="_blank" rel="noreferrer" className="text-gray-600 hover:underline">
                          <GitHubIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-[11px] mt-1">{proj.description}</p>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="font-mono text-[9px] bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {education.length > 0 && (
            <section>
              <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[11px] font-bold text-gray-900">
                <span style={{ color: theme.primaryColor }}>//</span> <span>EDUCATION</span>
              </div>
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="font-bold text-gray-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                  <div className="text-gray-600 text-[11px]">{edu.institution}</div>
                  <div className="font-mono text-[10px] text-gray-400">{edu.startDate} - {edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}</div>
                </div>
              ))}
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[11px] font-bold text-gray-900">
                <span style={{ color: theme.primaryColor }}>//</span> <span>CERTIFICATIONS</span>
              </div>
              <div className="space-y-1 text-xs">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <span className="font-semibold text-gray-900">{cert.name}</span>
                    <span className="font-mono text-gray-500 text-[10px]"> [{cert.issuer} · {cert.date}]</span>
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
