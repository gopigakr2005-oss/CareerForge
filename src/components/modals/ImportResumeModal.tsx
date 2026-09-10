import React, { useState, useRef } from 'react';
import type { ResumeData } from '../../types/resume';
import {
  Upload,
  FileText,
  Sparkles,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Briefcase,
  Wrench,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import { extractTextFromPdf, extractTextFromDocx, parseResumeText } from '../../services/resumeParser';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (data: ResumeData, targetView?: 'builder' | 'checker') => void;
}

export const ImportResumeModal: React.FC<Props> = ({ isOpen, onClose, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const [extractedRawText, setExtractedRawText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ResumeData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setParsedPreview(null);
    setExtractedRawText('');
    setIsProcessing(true);

    try {
      const fileName = file.name.toLowerCase();
      let text = '';

      // Case 1: JSON File
      if (fileName.endsWith('.json')) {
        setStatusMessage('Reading JSON file...');
        text = await file.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed.personalInfo) {
            setParsedPreview(parsed);
            setExtractedRawText(JSON.stringify(parsed, null, 2));
            setIsProcessing(false);
            return;
          }
        } catch {
          // fallback to text parsing below
        }
      }
      // Case 2: Word DOCX
      else if (fileName.endsWith('.docx')) {
        setStatusMessage('Reading Word (.docx) document...');
        text = await extractTextFromDocx(file);
      }
      // Case 3: PDF File
      else if (fileName.endsWith('.pdf')) {
        setStatusMessage('Extracting text from PDF...');
        text = await extractTextFromPdf(file);
      }
      // Case 4: Plain Text or Markdown
      else {
        setStatusMessage('Reading text file...');
        text = await file.text();
      }

      if (!text || text.trim().length < 15) {
        throw new Error(
          'Could not extract text from this file (it might be a scanned image or protected). Please copy and paste your resume text into the "Paste Resume Text" tab!'
        );
      }

      setExtractedRawText(text);
      setStatusMessage('Structuring resume sections, experience & skills...');
      const result = await parseResumeText(text);
      setParsedPreview(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse resume file. Please try pasting the text.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleProcessPastedText = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('Please paste your resume text first.');
      return;
    }
    setErrorMessage(null);
    setIsProcessing(true);
    setStatusMessage('Analyzing resume text...');

    try {
      setExtractedRawText(pastedText);
      const result = await parseResumeText(pastedText);
      setParsedPreview(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process resume text.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Import Your Resume</h3>
              <p className="text-xs text-slate-400">Upload PDF, Word (.docx), TXT, or paste text to auto-fill the builder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold shrink-0">
          <button
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (PDF / DOCX / TXT)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('paste');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'paste' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Resume Text</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p>{errorMessage}</p>
              {activeTab === 'upload' && (
                <button
                  onClick={() => {
                    setActiveTab('paste');
                    setErrorMessage(null);
                  }}
                  className="text-blue-400 hover:underline font-semibold flex items-center gap-1 mt-1"
                >
                  <span>Switch to Paste Text tab</span> <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {/* Upload Mode Content */}
          {activeTab === 'upload' && !parsedPreview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/50 hover:bg-slate-950 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelected(f);
                  e.target.value = '';
                }}
                accept=".pdf,.docx,.json,.txt,.md"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Click or drag & drop your resume file</p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports <strong>PDF (.pdf)</strong>, <strong>Word (.docx)</strong>, <strong>Text (.txt)</strong>, or <strong>JSON</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300">.PDF</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300">.DOCX</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">.TXT</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">.JSON</span>
              </div>
            </div>
          )}

          {/* Paste Mode Content */}
          {activeTab === 'paste' && !parsedPreview && (
            <div className="space-y-3">
              <textarea
                rows={9}
                placeholder="Paste the text of your resume here (e.g. John Doe, Software Engineer, Experience, Skills...)"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500 leading-relaxed font-sans"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  {pastedText ? `${pastedText.length} characters` : 'Tip: You can copy directly from LinkedIn or Word'}
                </span>
                <button
                  onClick={handleProcessPastedText}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl shadow transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Parse & Import Resume</span>
                </button>
              </div>
            </div>
          )}

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-xs text-slate-300 font-medium">{statusMessage}</p>
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Resume Successfully Parsed & Structured!
                </span>
                <button
                  onClick={() => {
                    setParsedPreview(null);
                    setExtractedRawText('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Upload a different file
                </button>
              </div>

              {/* Summary of Parsed Information */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                {/* Candidate Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{parsedPreview.personalInfo.fullName}</h4>
                      <p className="text-slate-400 text-[11px]">{parsedPreview.personalInfo.jobTitle}</p>
                    </div>
                  </div>
                  {parsedPreview.personalInfo.email && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{parsedPreview.personalInfo.email}</span>
                    </div>
                  )}
                </div>

                {/* Professional Summary */}
                {parsedPreview.summary && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-0.5">Summary</span>
                    <p className="text-slate-300 leading-relaxed text-xs italic bg-slate-900/50 p-2 rounded-lg border border-slate-800/80">
                      "{parsedPreview.summary}"
                    </p>
                  </div>
                )}

                {/* Experience Highlights */}
                {parsedPreview.experience.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1 mb-1">
                      <Briefcase className="w-3 h-3" /> Experience ({parsedPreview.experience.length} Position)
                    </span>
                    <div className="space-y-1.5">
                      {parsedPreview.experience.map((exp, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/80 text-xs">
                          <div className="font-semibold text-slate-200">
                            {exp.role} <span className="text-slate-500 font-normal">at {exp.company}</span>
                          </div>
                          {exp.highlights.length > 0 && (
                            <ul className="list-disc list-outside ml-4 mt-1 text-[11px] text-slate-400 space-y-0.5">
                              {exp.highlights.slice(0, 3).map((h, hIdx) => (
                                <li key={hIdx}>{h}</li>
                              ))}
                              {exp.highlights.length > 3 && (
                                <li className="text-slate-500 italic">+{exp.highlights.length - 3} more bullet points</li>
                              )}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Preview */}
                {parsedPreview.skills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1 mb-1">
                      <Wrench className="w-3 h-3" /> Detected Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {parsedPreview.skills.flatMap((c) => c.skills).slice(0, 10).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Raw Text Drawer */}
              {extractedRawText && (
                <details className="text-xs text-slate-400">
                  <summary className="cursor-pointer hover:text-slate-200 select-none py-1">
                    View raw extracted text ({extractedRawText.length} characters)
                  </summary>
                  <pre className="mt-1 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] max-h-32 overflow-y-auto whitespace-pre-wrap font-mono text-slate-400">
                    {extractedRawText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          {parsedPreview ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onImportSuccess(parsedPreview, 'builder');
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              >
                Open in Builder
              </button>
              <button
                onClick={() => {
                  onImportSuccess(parsedPreview, 'checker');
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg transition transform hover:scale-[1.02]"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Analyze in ATS Checker</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
