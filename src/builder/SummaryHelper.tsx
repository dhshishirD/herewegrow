import { useState } from 'react';
import { emptySummaryInput, summaryReady, writeSummaries, type SummaryInput, type SummaryKind } from './summaryWriter';
import type { CvData } from './model';
import { track } from '../lib/track';

type T = (s: { en: string; bn: string }) => string;

const KINDS: { id: SummaryKind; label: { en: string; bn: string } }[] = [
  { id: 'fresher', label: { en: 'Fresher', bn: 'ফ্রেশার' } },
  { id: 'experienced', label: { en: 'Experienced', bn: 'অভিজ্ঞ' } },
  { id: 'switcher', label: { en: 'Changing field', bn: 'ক্ষেত্র বদলাচ্ছি' } },
];

/** "Help me write it": a few facts in, three plain summaries out. Nothing is invented. */
export function SummaryHelper({ d, t, onUse }: { d: CvData; t: T; onUse: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SummaryInput>(() => ({
    ...emptySummaryInput(d.experience.length ? 'experienced' : 'fresher'),
    target: d.headline,
    degree: d.education[0]?.degree ?? '',
    major: d.education[0]?.major ?? '',
    skills: d.skills,
  }));
  const [options, setOptions] = useState<string[]>([]);
  const set = (patch: Partial<SummaryInput>) => setForm((f) => ({ ...f, ...patch }));
  const ready = summaryReady(form);

  const input = (id: keyof SummaryInput, label: string, placeholder: string) => (
    <label className="block">
      <span className="label text-sm">{label}</span>
      <input className="field" value={form[id]} placeholder={placeholder} onChange={(e) => set({ [id]: e.target.value })} />
    </label>
  );

  if (!open) {
    return (
      <button type="button" className="btn btn-quiet bg-white" onClick={() => { setOpen(true); track('summary_helper_open'); }}>
        {t({ en: 'Help me write it', bn: 'লিখতে সাহায্য করুন' })}
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-leaf/40 bg-leaf-soft/40 p-4">
      <p className="font-display font-semibold">{t({ en: 'Answer a few questions and pick a summary', bn: 'কয়েকটি প্রশ্নের উত্তর দিন, একটি সামারি বেছে নিন' })}</p>
      <div role="group" aria-label={t({ en: 'About you', bn: 'আপনার সম্পর্কে' })} className="inline-flex flex-wrap rounded-lg bg-mist p-1">
        {KINDS.map((k) => (
          <button key={k.id} type="button" aria-pressed={form.kind === k.id} onClick={() => set({ kind: k.id })}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${form.kind === k.id ? 'bg-white text-leaf shadow-sm' : 'text-muted'}`}>{t(k.label)}</button>
        ))}
      </div>
      {input('target', t({ en: 'Job you want *', bn: 'যে চাকরি চান *' }), 'Marketing Executive')}
      {form.kind === 'fresher' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {input('degree', t({ en: 'Degree', bn: 'ডিগ্রি' }), 'BBA')}
          {input('major', t({ en: 'Subject', bn: 'বিষয়' }), 'Marketing')}
        </div>
      )}
      {form.kind !== 'fresher' && input('years', t({ en: 'Years of experience', bn: 'অভিজ্ঞতার বছর' }), '3')}
      {form.kind === 'switcher' && input('fromField', t({ en: 'Field you come from', bn: 'আগের ক্ষেত্র' }), 'teaching')}
      {input('skills', t({ en: 'Your top skills, separated by commas *', bn: 'প্রধান দক্ষতা, কমা দিয়ে *' }), 'Facebook ads, Excel, copywriting')}
      {input('achievement', t({ en: 'One real result (optional)', bn: 'একটি সত্যিকারের অর্জন (ঐচ্ছিক)' }), 'ran a campaign that reached 5,000 people')}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => { setOptions(writeSummaries(form)); track('summary_helper_write', { kind: form.kind }); }}>
          {t({ en: 'Write it', bn: 'লিখে দিন' })}
        </button>
        <button type="button" className="btn btn-quiet bg-white" onClick={() => setOpen(false)}>{t({ en: 'Close', bn: 'বন্ধ করুন' })}</button>
      </div>
      {options.length > 0 && (
        <ul className="space-y-3">
          {options.map((o) => (
            <li key={o} className="rounded-lg bg-white p-3 ring-1 ring-line">
              <p>{o}</p>
              <button type="button" className="mt-2 text-sm font-semibold text-leaf underline" onClick={() => { onUse(o); setOpen(false); track('summary_helper_use'); }}>
                {t({ en: 'Use this', bn: 'এটি ব্যবহার করুন' })}
              </button>
            </li>
          ))}
          <li className="text-sm text-muted">{t({ en: 'These use only what you typed. Edit freely afterwards.', bn: 'এগুলো শুধু আপনার দেওয়া তথ্য থেকে লেখা। পরে ইচ্ছেমতো বদলান।' })}</li>
        </ul>
      )}
    </div>
  );
}
