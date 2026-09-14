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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Edit3,
  Minimize2,
  Split,
  Minus,
  Download,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';
import { resumeDataToText } from '../../services/atsAnalyzer';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { AiOnePageModal } from '../modals/AiOnePageModal';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
  onThemeChange?: (theme: ResumeTheme) => void;
  onUpdateData?: (data: ResumeData) => void;
  onSave?: () => void;
}

export const ResumePreview: React.FC<Props> = ({ data, theme, onThemeChange, onUpdateData, onSave }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showToolsBar, setShowToolsBar] = useState<boolean>(true);
  const [isAiOnePageModalOpen, setIsAiOnePageModalOpen] = useState<boolean>(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const pdfCaptureRef = useRef<HTMLDivElement>(null);

  // System Print Export
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

  // High-Resolution Direct PDF Download (Ensures 100% Content & Zero Cutoffs)
  const handleDownloadDirectPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      // Brief pause to allow the dedicated capture element to mount, layout and load webfonts
      await new Promise((resolve) => setTimeout(resolve, 250));

      const captureElement = pdfCaptureRef.current;
      if (!captureElement) {
        throw new Error('PDF capture element unavailable');
      }

      const canvas = await html2canvas(captureElement, {
        scale: 2, // 300 DPI high resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 1024,
        scrollX: 0,
        scrollY: 0,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const a4Width = 210;
      const a4Height = 297;
      // Pixel height of 1 standard A4 page based on current canvas scale
      const pxPerMm = canvas.width / a4Width;
      const pageHeightPx = Math.round(a4Height * pxPerMm);

      if (theme.fitToOnePage || canvas.height <= pageHeightPx + 20) {
        // Single Page Mode: If slightly taller than 297mm, scale down proportionally so 100% of content fits on 1 page!
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageHeightPx;
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          const scale = canvas.height > pageHeightPx ? pageHeightPx / canvas.height : 1;
          const targetW = canvas.width * scale;
          const targetH = canvas.height * scale;
          const offsetX = (pageCanvas.width - targetW) / 2;
          pageCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, offsetX, 0, targetW, targetH);
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(pageImgData, 'JPEG', 0, 0, a4Width, a4Height);
        }
      } else {
        // Multi-page slicing: Page 1, Page 2, Page 3 etc. without any cut-off
        let currentY = 0;
        let page = 0;

        while (currentY < canvas.height) {
          const sliceHeight = Math.min(pageHeightPx, canvas.height - currentY);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageHeightPx;
          const pageCtx = pageCanvas.getContext('2d');
          if (pageCtx) {
            pageCtx.fillStyle = '#ffffff';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            pageCtx.drawImage(
              canvas,
              0, currentY, canvas.width, sliceHeight,
              0, 0, canvas.width, sliceHeight
            );
            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
            if (page > 0) {
              pdf.addPage();
            }
            pdf.addImage(pageImgData, 'JPEG', 0, 0, a4Width, a4Height);
          }
          currentY += pageHeightPx;
          page++;
        }
      }

      const fileName = `${(data.personalInfo.fullName || 'Resume').trim().replace(/\s+/g, '_')}_CareerForge.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Direct PDF export error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Unable to generate direct PDF: ${errMsg}. Please try using the Print button to save as PDF.`);
    } finally {
      setIsDownloadingPdf(false);
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

  const dividerStyles: ('solid' | 'dashed' | 'dotted' | 'double' | 'gradient' | 'none')[] = [
    'solid',
    'dashed',
    'dotted',
    'double',
    'gradient',
    'none',
  ];

  const cycleDividerStyle = () => {
    const current = theme.dividerStyle || 'solid';
    const nextIdx = (dividerStyles.indexOf(current) + 1) % dividerStyles.length;
    onThemeChange?.({ ...theme, dividerStyle: dividerStyles[nextIdx] });
  };

  return (
    <>
      {/* High-Resolution Dedicated Capture Element for Direct PDF Generation */}
      {isDownloadingPdf && (
        <div
          ref={pdfCaptureRef}
          id="resume-pdf-capture-container"
          className="no-print"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '794px', // Standard 210mm @ 96 DPI
            background: '#ffffff',
            zIndex: 99998,
            boxSizing: 'border-box',
          }}
        >
          <UniversalResumeRenderer
            data={data}
            theme={theme}
            onUpdateData={onUpdateData}
            id="resume-pdf-capture-renderer"
          />
        </div>
      )}

      {/* PDF Generation Progress Modal */}
      {isDownloadingPdf && (
        <div className="no-print fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl max-w-sm text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <h3 className="font-semibold text-base">Generating High-Resolution PDF</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rendering all sections (Summary, Experience, Projects, Education, Certifications) with 100% completeness.
            </p>
          </div>
        </div>
      )}

      <div className="no-print flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Top Preview Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Preview</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {theme.template.replace('-', ' ').toUpperCase()}
            </span>
            {theme.fitToOnePage && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold animate-pulse">
                1-PAGE FIT
              </span>
            )}
          </div>

          {/* Primary Action Buttons */}
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

            {/* Toggle Visual Toolbar */}
            <button
              onClick={() => setShowToolsBar(!showToolsBar)}
              className={`p-1.5 rounded-lg border transition ${
                showToolsBar
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle visual customization toolbar"
            >
              <Edit3 className="w-3.5 h-3.5" />
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

            {/* System Print PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-sm transition"
              title="Print via browser dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Save Resume Button */}
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 shadow-xs transition cursor-pointer"
                title="Save changes to browser storage"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Save</span>
              </button>
            )}

            {/* AI 1-Page Condenser Button */}
            <button
              onClick={() => setIsAiOnePageModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg shadow-md transition cursor-pointer border border-purple-400/30"
              title="Transform a 2-page resume into an executive, high-impact 1-page resume using AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI 1-Page Condenser</span>
              <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono font-bold">2P➔1P</span>
            </button>

            {/* Direct High-DPI Download PDF (Guarantees no paragraph elimination) */}
            <button
              onClick={handleDownloadDirectPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-lg shadow-md transition cursor-pointer"
              title="Direct high-res PDF download (Guarantees complete content and 1-page fit)"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Secondary Interactive Formatting & Visual Tools Toolbar */}
        {showToolsBar && (
          <div className="no-print flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Visual Tools:</span>

              {/* 1-Page Auto-Fit Toggle */}
              <button
                onClick={() => onThemeChange?.({ ...theme, fitToOnePage: !theme.fitToOnePage })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition cursor-pointer ${
                  theme.fitToOnePage
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
                title="Automatically adjust fonts and spacing so your entire resume fits neatly onto 1 page"
              >
                <Minimize2 className="w-3 h-3" />
                <span>Fit to 1 Page</span>
              </button>

              {/* AI 1-Page Quick Condenser */}
              <button
                onClick={() => setIsAiOnePageModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-md border border-purple-400/40 text-xs font-semibold shadow-xs transition cursor-pointer"
                title="AI automatically trims fluff, condenses bullets and fits your resume to 1 page"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Condense (2P ➔ 1P)</span>
              </button>

              {/* Text Alignment */}
              <div className="flex items-center bg-slate-800/90 rounded-md p-0.5 border border-slate-700">
                <button
                  onClick={() => onThemeChange?.({ ...theme, textAlign: 'left' })}
                  className={`p-1 rounded ${(!theme.textAlign || theme.textAlign === 'left') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Align text left"
                >
                  <AlignLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onThemeChange?.({ ...theme, textAlign: 'center' })}
                  className={`p-1 rounded ${theme.textAlign === 'center' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Align text center"
                >
                  <AlignCenter className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onThemeChange?.({ ...theme, textAlign: 'right' })}
                  className={`p-1 rounded ${theme.textAlign === 'right' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Align text right"
                >
                  <AlignRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onThemeChange?.({ ...theme, textAlign: 'justify' })}
                  className={`p-1 rounded ${theme.textAlign === 'justify' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Justify text"
                >
                  <AlignJustify className="w-3 h-3" />
                </button>
              </div>

              {/* Horizontal Divider Line Style */}
              <button
                onClick={cycleDividerStyle}
                className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-md border border-slate-700 transition cursor-pointer"
                title="Cycle section divider line styles: Solid, Dashed, Dotted, Double, Gradient, None"
              >
                <Minus className="w-3 h-3 text-blue-400" />
                <span>Divider: <strong className="text-white capitalize">{theme.dividerStyle || 'solid'}</strong></span>
              </button>

              {/* Vertical Dividers Toggle */}
              <button
                onClick={() => onThemeChange?.({ ...theme, showVerticalDividers: theme.showVerticalDividers === false })}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs transition cursor-pointer ${
                  theme.showVerticalDividers !== false
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Toggle vertical dividers in contact info and headers"
              >
                <Split className="w-3 h-3" />
                <span>Vertical Lines: {theme.showVerticalDividers !== false ? 'ON' : 'OFF'}</span>
              </button>

              {/* Direct In-Place Edit Mode */}
              <button
                onClick={() => onThemeChange?.({ ...theme, directEditMode: !theme.directEditMode })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition cursor-pointer ${
                  theme.directEditMode
                    ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
                title="Click and type directly on any text inside the preview"
              >
                <Edit3 className="w-3 h-3" />
                <span>Direct Edit: {theme.directEditMode ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-500">
              <span>A4 Dimensions: 210 × 297 mm</span>
            </div>
          </div>
        )}

        {/* Document Canvas Container */}
        <div className="preview-canvas-wrapper flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start bg-slate-950/40 relative">
          <div
            className="preview-transform-container"
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
              className="resume-paper resume-page bg-white shadow-2xl rounded-sm text-slate-900 border border-slate-200 relative"
            >
              <UniversalResumeRenderer
                data={data}
                theme={theme}
                onUpdateData={onUpdateData}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 max-w-5xl w-full mx-auto text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Full Screen Preview</span>
              <span className="text-xs text-slate-400">• {data.personalInfo.fullName || 'Resume'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAiOnePageModalOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium shadow cursor-pointer border border-purple-400/30"
                title="Transform 2-page resume into 1 page using AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>AI 1-Page Fit</span>
              </button>
              <button
                onClick={handleDownloadDirectPdf}
                disabled={isDownloadingPdf}
                className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg font-medium shadow cursor-pointer"
              >
                {isDownloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download PDF
              </button>
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 px-3 py-1.5 rounded-lg font-medium border border-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start bg-slate-900/50">
            <div className="resume-paper resume-page max-w-3xl w-full bg-white rounded-sm shadow-2xl text-slate-900 border border-slate-200" id="resume-document-fullscreen">
              <UniversalResumeRenderer data={data} theme={theme} onUpdateData={onUpdateData} />
            </div>
          </div>
        </div>
      )}

      {/* AI 1-Page Condenser Modal */}
      <AiOnePageModal
        isOpen={isAiOnePageModalOpen}
        onClose={() => setIsAiOnePageModalOpen(false)}
        data={data}
        theme={theme}
        onApply={(condensedData, updatedTheme) => {
          onUpdateData?.(condensedData);
          onThemeChange?.(updatedTheme);
        }}
      />
    </>
  );
};

