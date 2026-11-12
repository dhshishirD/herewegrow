// Undo and redo for the CV builder.
// One history for the whole CV (text, entries, sections, design, colour, font, margins), kept in memory for this visit.
// Typing is grouped: letters typed in one go are one step, so Undo takes back a burst of typing, not one letter.
// Anything bigger than typing (removing an entry or a section, clearing, importing, changing the design) is always its own step.

import { useCallback, useState } from 'react';

/** How many steps can be undone. */
export const HISTORY_LIMIT = 100;
/** Typing within this many milliseconds of the last keystroke joins the same step. */
export const COALESCE_MS = 700;
/** A single change that adds or removes more text than this is a step of its own (a pasted block, a deleted paragraph). */
export const BIG_CHANGE_CHARS = 40;

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  /** When the present state was last changed (ms), for grouping typing. */
  at: number;
  /** Whether the last change was plain typing, so the next keystroke may join it. */
  typing: boolean;
}

export interface HistoryShape<T> {
  /** Changes whenever the structure changes (entries, sections, order, design, colour, photo…), but not while typing. */
  shape: (t: T) => string;
  /** The amount of text, used to tell typing from a big paste or delete. */
  size: (t: T) => number;
}

export const initHistory = <T>(present: T): History<T> => ({ past: [], present, future: [], at: 0, typing: false });

/** Records a new state. Returns the same object when nothing changed. */
export function applyChange<T>(h: History<T>, next: T, now: number, s: HistoryShape<T>, limit = HISTORY_LIMIT): History<T> {
  if (Object.is(next, h.present)) return h;
  const typed = s.shape(next) === s.shape(h.present) && Math.abs(s.size(next) - s.size(h.present)) <= BIG_CHANGE_CHARS;
  // Join the previous step only when both are typing, close together in time, and nothing is waiting to be redone
  if (typed && h.typing && h.future.length === 0 && h.past.length > 0 && now - h.at < COALESCE_MS) return { ...h, present: next, at: now };
  return { past: [...h.past, h.present].slice(-limit), present: next, future: [], at: now, typing: typed };
}

export function undoHistory<T>(h: History<T>): History<T> {
  if (!h.past.length) return h;
  return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], at: 0, typing: false };
}

export function redoHistory<T>(h: History<T>): History<T> {
  if (!h.future.length) return h;
  return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: h.future[0], future: h.future.slice(1), at: 0, typing: false };
}

export interface HistoryControls<T> {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Replaces the state and forgets the history (opening a different CV, loading a client). */
  reset: (next: T) => void;
}

/** Like useState, plus undo and redo. setState takes a value or an updater, as usual. */
export function useHistoryState<T>(initial: () => T, s: HistoryShape<T>): [T, (v: T | ((cur: T) => T)) => void, HistoryControls<T>] {
  const [h, setH] = useState<History<T>>(() => initHistory(initial()));
  const setState = useCallback((v: T | ((cur: T) => T)) => {
    const now = Date.now();
    setH((cur) => applyChange(cur, typeof v === 'function' ? (v as (c: T) => T)(cur.present) : v, now, s));
    // `s` is a module-level constant at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const undo = useCallback(() => setH(undoHistory), []);
  const redo = useCallback(() => setH(redoHistory), []);
  const reset = useCallback((next: T) => setH(initHistory(next)), []);
  return [h.present, setState, { undo, redo, canUndo: h.past.length > 0, canRedo: h.future.length > 0, reset }];
}
