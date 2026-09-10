import React, { useRef, useState } from 'react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import { UniversalResumeRenderer } from '../templates/UniversalResumeRenderer';
import {
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Printer,
  FileDown,
  Maximize2,
  X,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { resumeDataToText } from '../../services/atsAnalyzer';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
  onThemeChange?: (theme: ResumeTheme) => void;
}

export const ResumePreview: React.FC<Props> = ({ data, theme }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      window.print();
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = () => {
    const textContent = resumeDataToText(data);
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${data.personalInfo.fullName} Resume</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #1e293b;">
        <h1 style="color: #0f172a; margin-bottom: 2px;">${data.personalInfo.fullName}</h1>
        <p style="font-size: 14px; color: #475569; margin-top: 0;">${data.personalInfo.jobTitle} | ${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}</p>
        <hr style="border-top: 1px solid #cbd5e1;"/>
        <pre style="font-family: inherit; white-space: pre-wrap;">${textContent}</pre>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_CareerForge.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    const text = resumeDataToText(data);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Top Preview Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Preview</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {theme.template.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          {/* Controls & Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Device Mode Toggle */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 text-xs text-slate-400">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-slate-700 text-white shadow-xs' : 'hover:text-slate-200'}`}
                title="Desktop (A4)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-slate-700 text-white shadow-xs' : 'hover:text-slate-200'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom controls */}
            {previewMode === 'desktop' && (
              <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 text-xs text-slate-300">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-1 hover:text-white rounded"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px]">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(130, zoom + 10))}
                  className="p-1 hover:text-white rounded"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Fullscreen Modal Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
              title="Full screen view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy Plain Text */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title="Copy plain text for quick pasting into ATS forms"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* DOCX Export */}
            <button
              onClick={handleExportDocx}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title="Export formatted Word Document"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">DOCX</span>
            </button>

            {/* PDF Export */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg shadow-md transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Document Canvas Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start bg-slate-950/40">
          <div
            style={{
              transform: previewMode === 'desktop' ? `scale(${zoom / 100})` : 'scale(0.85)',
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              maxWidth: previewMode === 'mobile' ? '400px' : '820px',
              width: '100%',
            }}
          >
            <div
              ref={resumeRef}
              id="resume-document"
              className="resume-paper resume-page bg-white shadow-2xl rounded-sm overflow-hidden text-slate-900 border border-slate-200"
            >
              <UniversalResumeRenderer data={data} theme={theme} />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 max-w-5xl w-full mx-auto text-white">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Full Screen Preview</span>
              <span className="text-xs text-slate-400">• {data.personalInfo.fullName || 'Resume'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium"
              >
                <Printer className="w-3.5 h-3.5" /> Print / PDF
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
            <div className="max-w-3xl w-full bg-white rounded shadow-2xl overflow-hidden">
              <UniversalResumeRenderer data={data} theme={theme} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

