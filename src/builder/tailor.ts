// Small helpers for "tailor this CV to a job ad" in the builder. The matching itself lives in lib/jobMatch.ts.

const splitSkills = (s: string) => s.split(/[,\n;]+/).map((x) => x.trim()).filter(Boolean);

/** Adds a word to the skills text unless it is already there (any letter case). Keeps the person's own separator style. */
export function addSkill(skills: string, term: string): string {
  const t = term.trim();
  if (!t) return skills;
  if (splitSkills(skills).some((x) => x.toLowerCase() === t.toLowerCase())) return skills;
  const base = skills.trimEnd();
  if (!base) return t;
  return base.includes('\n') && !base.includes(',') ? `${base}\n${t}` : `${base.replace(/[,;]$/, '')}, ${t}`;
}

/** A job title guess for naming the copy: the first usable line of the ad, trimmed. */
export function guessJobTitle(ad: string): string {
  const line = ad.split(/\n+/).map((l) => l.replace(/^[\s\-–•*#:]+/, '').trim()).find((l) => l.length >= 3) ?? '';
  return line.replace(/\s+/g, ' ').slice(0, 50).trim();
}

/** Name shown in the saved list, so the copy for a job is easy to find. */
export function copyTitle(job: string, name: string): string {
  const j = job.trim();
  return [j ? `For: ${j}` : 'Job copy', name.trim()].filter(Boolean).join(' · ').slice(0, 80);
}
