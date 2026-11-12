import type { HistoryShape } from './history';
import type { BuilderState } from './model';

/**
 * What counts as "typing" for the CV: the shape stays the same (same entries in the same order, same sections,
 * design, colour, font, margins) and only the amount of text changes a little.
 * Removing, adding or moving an entry or section, a new photo, or a new design changes the shape, so it is its own undo step.
 */
export const builderHistoryShape: HistoryShape<BuilderState> = {
  shape: (s) => {
    const d = s.data;
    return [
      d.experience.map((x) => x.id).join(),
      d.education.map((x) => x.id).join(),
      d.training.map((x) => x.id).join(),
      d.references.map((x) => x.id).join(),
      d.custom.map((c) => `${c.id}:${c.items.map((i) => i.id).join()}`).join('|'),
      d.order.join(),
      d.hidden.join(),
      d.showPersonal ? 1 : 0,
      d.photo.length,
      s.design,
      s.accent,
      s.font ?? '',
      s.headings ?? '',
      s.margins ? `${s.margins.x},${s.margins.y}` : '',
    ].join(';');
  },
  // The photo is a big data URL; it is not text the person typed
  size: (s) => JSON.stringify({ ...s.data, photo: '' }).length,
};
