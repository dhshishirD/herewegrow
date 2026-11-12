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
  'hwg-cv-designed-teacher-cv': { design: 'chalk', accent: '#0e3b2e' },
  'hwg-cv-designed-student-higher-study-cv': { design: 'scholar', accent: '#7c2d12' },
  'hwg-cv-designed-accountant-cv': { design: 'ledger', accent: '#0f766e' },
  'hwg-cv-designed-admin-officer-cv': { design: 'office', accent: '#0f766e' },
  'hwg-cv-designed-sales-marketing-cv': { design: 'spark', accent: '#1e3a5f' },
  'hwg-cv-designed-customer-service-cv': { design: 'support', accent: '#6d28d9' },
  'hwg-cv-designed-gulf-job-cv': { design: 'passport', accent: '#0e3b2e' },
  'hwg-cv-designed-driver-cv': { design: 'road', accent: '#334155' },
  'hwg-cv-designed-merchandiser-cv': { design: 'orbit', accent: '#7c2d12' },
};

export const presetFor = (templateId: string | null | undefined) => (templateId ? TEMPLATE_PRESETS[templateId] ?? null : null);
