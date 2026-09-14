import React, { useState } from 'react';
import type { ResumeTheme, FontFamily } from '../../types/resume';
import { TEMPLATE_DEFINITIONS } from '../../data/templateDefinitions';
import { Palette, Type, Layout, AlignJustify, Flame, Check } from 'lucide-react';

interface Props {
  theme: ResumeTheme;
  onChange: (theme: ResumeTheme) => void;
}

const PALETTES = [
  { name: 'Royal Blue', color: '#2563eb' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Violet', color: '#7c3aed' },
  { name: 'Deep Slate', color: '#1e293b' },
  { name: 'Crimson', color: '#dc2626' },
  { name: 'Teal', color: '#0d9488' },
  { name: 'Amber', color: '#d97706' },
  { name: 'Indigo', color: '#4f46e5' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Charcoal', color: '#334155' },
];

const FONTS: { id: FontFamily; label: string }[] = [
  { id: 'inter', label: 'Inter (Sans)' },
  { id: 'roboto', label: 'Roboto (Clean)' },
  { id: 'merriweather', label: 'Merriweather (Serif)' },
  { id: 'outfit', label: 'Outfit (Modern)' },
  { id: 'playfair', label: 'Playfair (Editorial)' },
  { id: 'fira', label: 'Fira (Code)' },
];

type CategoryFilter = 'all' | 'ats' | 'fresher' | 'technical' | 'professional' | 'creative';

export const ThemeSelector: React.FC<Props> = ({ theme, onChange }) => {
  const [selectedCat, setSelectedCat] = useState<CategoryFilter>('all');

  const filteredTemplates = TEMPLATE_DEFINITIONS.filter(
    (t) => selectedCat === 'all' || t.category === selectedCat
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 space-y-4 shadow-xl">
      {/* Category Tabs & Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Layout className="w-4 h-4 text-blue-400" />
          <span>Resume Template ({TEMPLATE_DEFINITIONS.length} Available)</span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1 text-[11px]">
          {(
            [
              { id: 'all', label: 'All (20)' },
              { id: 'ats', label: 'ATS' },
              { id: 'fresher', label: 'Fresher' },
              { id: 'technical', label: 'Tech' },
              { id: 'professional', label: 'Executive' },
              { id: 'creative', label: 'Creative' },
            ] as { id: CategoryFilter; label: string }[]
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-2 py-0.5 rounded-full font-medium transition ${
                selectedCat === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 20 Template Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
        {filteredTemplates.map((tmpl) => {
          const isSelected = theme.template === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => onChange({ ...theme, template: tmpl.id })}
              className={`text-left p-2.5 rounded-lg border transition relative text-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/15 text-white shadow-md'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-200 text-xs truncate">{tmpl.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tmpl.description}</div>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[9.5px]">
                <span className="px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 font-medium">
                  {tmpl.categoryLabel}
                </span>
                {tmpl.atsFriendly && <span className="text-emerald-400">✓ ATS</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Customization Toolbar: Colors, Typography, Spacing, Heatmap Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800 text-xs items-center">
        {/* Color Palette */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Accent Color</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PALETTES.map((p) => (
              <button
                key={p.color}
                onClick={() => onChange({ ...theme, primaryColor: p.color })}
                className={`w-5 h-5 rounded-full border transition transform hover:scale-110 ${
                  theme.primaryColor.toLowerCase() === p.color.toLowerCase()
                    ? 'border-white ring-2 ring-blue-500/50 scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              />
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span>Font Style</span>
          </div>
          <select
            value={theme.fontFamily}
            onChange={(e) => onChange({ ...theme, fontFamily: e.target.value as FontFamily })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Spacing */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <AlignJustify className="w-3.5 h-3.5 text-slate-400" />
            <span>Density</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['compact', 'normal', 'spacious'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onChange({ ...theme, spacing: s })}
                className={`px-2 py-1 rounded-lg border capitalize transition text-center text-[11px] ${
                  theme.spacing === s
                    ? 'border-blue-500 bg-blue-500/20 text-white font-medium'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* AI Heatmap Toggle */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Resume Heatmap</span>
          </div>
          <button
            onClick={() => onChange({ ...theme, showHeatmap: !theme.showHeatmap })}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              theme.showHeatmap
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${theme.showHeatmap ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>{theme.showHeatmap ? 'Heatmap: ON' : 'Show Heatmap'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Layout & Formatting Row: 1-Page Fit, Dividers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs items-center">
        {/* 1-Page Auto-Fit Mode */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div>
            <span className="font-semibold text-slate-200 block text-xs">Fit to 1 Page</span>
            <span className="text-[10px] text-slate-400">Auto-compacts fonts and margins</span>
          </div>
          <button
            onClick={() => onChange({ ...theme, fitToOnePage: !theme.fitToOnePage })}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              theme.fitToOnePage
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {theme.fitToOnePage ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        {/* Section Divider Style */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="font-semibold text-slate-200 text-xs">Section Lines:</span>
          <select
            value={theme.dividerStyle || 'solid'}
            onChange={(e) => onChange({ ...theme, dividerStyle: e.target.value as any })}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs capitalize focus:outline-none"
          >
            <option value="solid">Solid Line</option>
            <option value="dashed">Dashed Line</option>
            <option value="dotted">Dotted Line</option>
            <option value="double">Double Line</option>
            <option value="gradient">Gradient Line</option>
            <option value="none">No Divider</option>
          </select>
        </div>

        {/* Vertical Separators Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div>
            <span className="font-semibold text-slate-200 block text-xs">Vertical Dividers</span>
            <span className="text-[10px] text-slate-400">Separators in contact bars</span>
          </div>
          <button
            onClick={() => onChange({ ...theme, showVerticalDividers: theme.showVerticalDividers === false })}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              theme.showVerticalDividers !== false
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {theme.showVerticalDividers !== false ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

