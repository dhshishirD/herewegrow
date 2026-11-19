// CV builder presets for people applying abroad, opened with /builder?preset=<id>.
// Kept small and free of layout code so the build-time SEO pages can use it too.

import type { DesignId } from './designList';

/** Special layouts drawn instead of a design. */
export type AbroadLayout = 'europass' | 'scholarship' | 'academic';

export interface AbroadPreset {
  design: DesignId;
  accent: string;
  /** Turns on the personal-details block (nationality, date of birth, marital status). */
  showPersonal: boolean;
  /** A special layout drawn instead of the design (the design stays the free Classic one). */
  layout?: AbroadLayout;
}

export const ABROAD_PRESETS: Record<string, AbroadPreset> = {
  // Photo design that anyone can try for free, one page, personal details on.
  gulf: { design: 'modern', accent: '#0f766e', showPersonal: true },
  // Europass-style layout (our own, unofficial): one column, dates left, CEFR language grid. Free to preview and print.
  // Photo, date of birth, nationality and gender stay off.
  europass: { design: 'classic', accent: '#1d5bd8', showPersonal: false, layout: 'europass' },
  // Education-first CVs for scholarships and masters/PhD (scholarship) or academic posts (academic). Serif, photo and personal details off.
  scholarship: { design: 'classic', accent: '#1e3a5f', showPersonal: false, layout: 'scholarship' },
  academic: { design: 'classic', accent: '#1e3a5f', showPersonal: false, layout: 'academic' },
};

export const abroadPreset = (id: string | null | undefined): AbroadPreset | null =>
  id && Object.prototype.hasOwnProperty.call(ABROAD_PRESETS, id) ? ABROAD_PRESETS[id] : null;
