// Templates that can be opened in the CV builder: which builder design and colour matches each one.
// The builder redraws the design with the person's own details; the Word file is still sold separately.

import type { DesignId } from './designList';

export interface TemplatePreset { design: DesignId; accent: string }

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  'ats-graduate-standard-single-page': { design: 'classic', accent: '#334155' },
  'ats-banking-standard-bd': { design: 'bars', accent: '#1e3a5f' },
  'creative-corporate-bd-standard': { design: 'banner', accent: '#1e3a5f' },
  'creative-graduate-standard-bd': { design: 'modern', accent: '#0f766e' },
  'creative-modern-professional-2column-1page': { design: 'graphite', accent: '#1d5bd8' },
  // New Designed CVs (13 Nov 2026): closest built-in design and colour. The builder redraws it with the person's details.
  'hwg-cv-designed-fresher-cv': { design: 'journey', accent: '#1d5bd8' },
  'hwg-cv-designed-nurse-cv': { design: 'care', accent: '#0f766e' },
  'hwg-cv-designed-banker-cv': { design: 'ascent', accent: '#1e3a5f' },
  'hwg-cv-designed-it-software-cv': { design: 'terminal', accent: '#0f766e' },
};

export const presetFor = (templateId: string | null | undefined) => (templateId ? TEMPLATE_PRESETS[templateId] ?? null : null);
