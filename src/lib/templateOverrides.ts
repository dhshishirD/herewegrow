// Loads the admin's template decisions once per visit. Failure means "no overrides": the site shows the shipped list.
import { useEffect, useMemo, useState } from 'react';
import { applyOverrides, type OverrideMap } from '../../shared/templateOverrides';
import { TEMPLATES, type Template } from '../../shared/templates';

let cache: OverrideMap | null = null;
let pending: Promise<OverrideMap> | null = null;

function load(): Promise<OverrideMap> {
  pending ??= fetch('/api/template-overrides')
    .then((r) => (r.ok ? r.json() : { overrides: {} }))
    .then((d: { overrides?: OverrideMap }) => (cache = d.overrides ?? {}))
    .catch(() => (cache = {}));
  return pending;
}

/** The overrides (empty until loaded) and whether the answer has arrived. */
export function useTemplateOverrides(): { map: OverrideMap; ready: boolean } {
  const [map, setMap] = useState<OverrideMap>(cache ?? {});
  const [ready, setReady] = useState(cache !== null);
  useEffect(() => {
    let live = true;
    void load().then((m) => {
      if (live) {
        setMap(m);
        setReady(true);
      }
    });
    return () => {
      live = false;
    };
  }, []);
  return { map, ready };
}

/** The template list with the admin's decisions applied (hidden removed, featured first, titles fixed). */
export function useTemplateList(): { list: Template[]; map: OverrideMap; ready: boolean } {
  const { map, ready } = useTemplateOverrides();
  const list = useMemo(() => applyOverrides(TEMPLATES, map), [map]);
  return { list, map, ready };
}
