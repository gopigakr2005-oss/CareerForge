import React from 'react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '../common/SocialIcons';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
}

export const ExecutiveTemplate: React.FC<Props> = ({ data, theme }) => {
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
    <div className={`p-8 bg-white text-zinc-800 ${fontClass} text-xs leading-relaxed`}>
      {/* Top Banner Accent */}
      <div className="h-2 -mt-8 -mx-8 mb-6" style={{ backgroundColor: theme.primaryColor }} />

      {/* Header */}
      <header className="text-center pb-5 border-b-2 border-zinc-200">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p className="text-sm font-semibold tracking-widest uppercase mt-1" style={{ color: theme.primaryColor }}>
          {personalInfo.jobTitle || 'Executive Title'}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-1 mt-3 text-[11px] text-zinc-600">
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <LinkedInIcon className="w-3.5 h-3.5 text-zinc-400" />
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="underline">
                LinkedIn Profile
              </a>
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="underline">
                {personalInfo.website.replace(/^https?:\/\//, '')}
              </a>
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <GitHubIcon className="w-3.5 h-3.5 text-zinc-400" />
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="underline">
                GitHub
              </a>
            </span>
          )}
        </div>
      </header>

      <div className={`mt-5 ${spacingClass}`}>
        {/* Executive Summary */}
        {summary && (
          <section>
            <div className="flex items-center justify-center mb-2">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-zinc-100 text-zinc-800 rounded">
                Executive Profile
              </span>
            </div>
            <p className="text-center text-zinc-700 max-w-2xl mx-auto italic leading-normal">
              "{summary}"
            </p>
          </section>
        )}

        {/* Leadership & Professional Experience */}
        {experience.filter((e) => e.role || e.company || (e.highlights && e.highlights.some((h) => h.trim()))).length > 0 && (
          <section>
            <h2
              className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-3 border-b-2"
              style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
            >
              Professional Experience & Leadership
            </h2>
            <div className="space-y-4">
              {experience
                .filter((e) => e.role || e.company || (e.highlights && e.highlights.some((h) => h.trim())))
                .map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline font-bold text-zinc-900">
                      <span className="text-sm">{exp.role || exp.company}</span>
                      {(exp.startDate || exp.endDate || exp.current) && (
                        <span className="text-xs text-zinc-500 font-normal">
                          {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? '–' : ''} {exp.current ? 'Present' : exp.endDate}
                        </span>
                      )}
                    </div>
                    {exp.role && exp.company && (
                      <div className="flex justify-between text-[11px] text-zinc-600 font-medium mb-1">
                        <span>{exp.company}</span>
                        {exp.location && <span>{exp.location}</span>}
                      </div>
                    )}
                    {exp.highlights && exp.highlights.filter((h) => h.trim()).length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-zinc-700">
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

        {/* Key Projects */}
        {projects.length > 0 && (
          <section>
            <h2
              className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-3 border-b-2"
              style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
            >
              Key Initiatives & Strategic Projects
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline font-bold text-zinc-900">
                    <span>
                      {proj.title} {proj.subtitle && <span className="text-zinc-500 font-normal">({proj.subtitle})</span>}
                    </span>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 underline">
                        View Project
                      </a>
                    )}
                  </div>
                  <p className="text-zinc-700 mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Core Competencies & Skills */}
        {skills.length > 0 && (
          <section>
            <h2
              className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2.5 border-b-2"
              style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
            >
              Core Competencies & Capabilities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {skills.flatMap((cat) => cat.skills).slice(0, 12).map((skill, idx) => (
                <div key={idx} className="bg-zinc-50 border border-zinc-200 p-1.5 rounded text-center text-[11px] font-medium text-zinc-800">
                  {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {education.length > 0 && (
            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b-2"
                style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
              >
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-zinc-900">{edu.degree} {edu.fieldOfStudy ? `· ${edu.fieldOfStudy}` : ''}</div>
                    <div className="text-zinc-600 text-[11px]">{edu.institution}</div>
                    <div className="text-zinc-400 text-[10px]">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <h2
                className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b-2"
                style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
              >
                Certifications
              </h2>
              <div className="space-y-1.5">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <div className="font-bold text-zinc-900">{cert.name}</div>
                    <div className="text-zinc-500 text-[10px]">{cert.issuer} · {cert.date}</div>
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
