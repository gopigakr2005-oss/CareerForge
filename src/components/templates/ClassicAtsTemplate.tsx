import React from 'react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '../common/SocialIcons';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
}

export const ClassicAtsTemplate: React.FC<Props> = ({ data, theme }) => {
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
    <div className={`p-8 text-gray-900 bg-white ${fontClass} leading-relaxed text-sm`}>
      {/* Header */}
      <header className="border-b-2 pb-4 text-center" style={{ borderColor: theme.primaryColor }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase" style={{ color: theme.primaryColor }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        {personalInfo.jobTitle && (
          <p className="text-base font-semibold text-gray-700 mt-1">{personalInfo.jobTitle}</p>
        )}

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="underline">
                {personalInfo.website.replace(/^https?:\/\//, '')}
              </a>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <LinkedInIcon className="w-3.5 h-3.5" />
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="underline">
                LinkedIn
              </a>
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <GitHubIcon className="w-3.5 h-3.5" />
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="underline">
                GitHub
              </a>
            </span>
          )}
        </div>
      </header>

      <div className={`mt-4 ${spacingClass}`}>
        {/* Professional Summary */}
        {summary && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
              style={{ color: theme.primaryColor, borderColor: '#cbd5e1' }}
            >
              Professional Summary
            </h2>
            <p className="text-xs text-gray-700 leading-normal">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.filter((e) => e.role || e.company || (e.highlights && e.highlights.some((h) => h.trim()))).length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
              style={{ color: theme.primaryColor, borderColor: '#cbd5e1' }}
            >
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experience
                .filter((e) => e.role || e.company || (e.highlights && e.highlights.some((h) => h.trim())))
                .map((exp) => (
                  <div key={exp.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-semibold text-gray-900">
                      <div>
                        {exp.role && <span className="text-sm font-bold">{exp.role}</span>}
                        {exp.role && exp.company && <span className="text-gray-400"> | </span>}
                        {exp.company && <span className="text-gray-600">{exp.company}</span>}
                      </div>
                      {(exp.startDate || exp.endDate || exp.current) && (
                        <span className="text-gray-500 text-xs">
                          {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? '–' : ''} {exp.current ? 'Present' : exp.endDate}
                        </span>
                      )}
                    </div>
                    {exp.location && <div className="text-gray-500 italic text-[11px] mb-1">{exp.location}</div>}
                    {exp.highlights && exp.highlights.filter((h) => h.trim()).length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700 mt-1">
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

        {/* Education */}
        {education.filter((e) => e.degree || e.institution).length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
              style={{ color: theme.primaryColor, borderColor: '#cbd5e1' }}
            >
              Education
            </h2>
            <div className="space-y-2">
              {education
                .filter((e) => e.degree || e.institution)
                .map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline text-xs">
                    <div>
                      {edu.degree && <span className="font-bold text-gray-900">{edu.degree}</span>}
                      {edu.degree && edu.fieldOfStudy && <span> in {edu.fieldOfStudy}</span>}
                      {edu.institution && (
                        <span className="text-gray-600">
                          {edu.degree ? `, ${edu.institution}` : edu.institution}
                        </span>
                      )}
                      {edu.gpa && <span className="text-gray-500 text-[11px] ml-2 font-medium">(GPA: {edu.gpa})</span>}
                    </div>
                    {(edu.startDate || edu.endDate) && (
                      <span className="text-gray-500 text-xs">
                        {edu.startDate} {edu.startDate && edu.endDate ? '–' : ''} {edu.endDate}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
              style={{ color: theme.primaryColor, borderColor: '#cbd5e1' }}
            >
              Skills & Competencies
            </h2>
            <div className="space-y-1 text-xs">
              {skills.map((cat) => (
                <div key={cat.id} className="flex items-baseline gap-2">
                  <span className="font-bold text-gray-800 min-w-[130px]">{cat.name}:</span>
                  <span className="text-gray-700">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
              style={{ color: theme.primaryColor, borderColor: '#cbd5e1' }}
            >
              Key Projects
            </h2>
            <div className="space-y-2 text-xs">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline font-semibold">
                    <span className="font-bold text-gray-900">
                      {proj.title} {proj.subtitle ? `– ${proj.subtitle}` : ''}
                    </span>
                    <div className="flex gap-2 text-[11px] text-blue-600">
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="underline">
                          Live Demo
                        </a>
                      )}
                      {proj.github && (
                        <a href={proj.github} target="_blank" rel="noreferrer" className="underline">
                          Source Code
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-0.5">{proj.description}</p>
                  {proj.technologies.length > 0 && (
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      <span className="font-semibold">Technologies:</span> {proj.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
              style={{ color: theme.primaryColor, borderColor: '#cbd5e1' }}
            >
              Certifications & Credentials
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-700">
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <span className="font-semibold text-gray-900">{cert.name}</span>
                  <span className="text-gray-500"> ({cert.issuer}, {cert.date})</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
