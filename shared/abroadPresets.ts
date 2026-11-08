// CV builder presets for people applying abroad, opened with /builder?preset=<id>.
// Kept small and free of layout code so the build-time SEO pages can use it too.

import type { DesignId } from './designList';

export interface AbroadPreset {
  design: DesignId;
  accent: string;
  /** Turns on the personal-details block (nationality, date of birth, marital status). */
  showPersonal: boolean;
}

export const ABROAD_PRESETS: Record<string, AbroadPreset> = {
  // Photo design that anyone can try for free, one page, personal details on.
  gulf: { design: 'modern', accent: '#0f766e', showPersonal: true },
};

export const abroadPreset = (id: string | null | undefined): AbroadPreset | null =>
  id && Object.prototype.hasOwnProperty.call(ABROAD_PRESETS, id) ? ABROAD_PRESETS[id] : null;
