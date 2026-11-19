import { useState } from 'react';
import type { Block, QuizAnswers, QuizQuestion, QuizResult } from '../../../shared/seoPage';
import { Link } from '../../lib/router';
import { Bn } from './Blocks';

/** Three-step strip ("How it works"): the steps come from the block's ordered list, the short labels from `labels`. */
export function HowStrip({ b, heading, labels }: { b: Block; heading: { bn: string }; labels: readonly string[] }) {
  return (
    <section id={b.id} className="max-w-3xl">
      <h2 className="text-2xl sm:text-3xl">{b.h2}<Bn>{heading.bn}</Bn></h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {(b.ol ?? []).map((step, i) => (
          <li key={step} className="rounded-xl border border-line bg-white p-4">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf font-display text-lg font-bold text-white">{i + 1}</span>
            <p className="mt-2 text-lg font-semibold">{labels[i]}</p>
            <p className="mt-1 text-base text-muted">{step}</p>
          </li>
        ))}
      </ol>
      {b.p?.map((x) => <p key={x} className="mt-3 text-base">{x}</p>)}
    </section>
  );
}

const NUMBER_WORD: Record<number, string> = { 1: 'the question', 2: 'both', 3: 'all three' };

/** A short helper quiz ("Do I need...?"). `resolve` is a pure function in the page's data file, so the rule is tested without a browser. */
export function HelperQuiz({ id, heading, intro, questions, resolve }: {
  id: string; heading: { en: string; bn: string }; intro: string; questions: QuizQuestion[]; resolve: (a: QuizAnswers) => QuizResult | null;
}) {
  const [a, setA] = useState<QuizAnswers>({});
  const r = resolve(a);
  return (
    <section id={id} className="max-w-3xl rounded-2xl border border-line bg-white p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl">{heading.en}<Bn>{heading.bn}</Bn></h2>
      <p className="mt-2 text-base text-muted">{intro}</p>
      <div className="mt-4 space-y-5">
        {questions.map((q, i) => (
          <fieldset key={q.id}>
            <legend className="text-base font-semibold">{i + 1}. {q.q}<Bn>{q.bn}</Bn></legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <label key={o.id} className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-4 text-base ${a[q.id] === o.id ? 'border-leaf bg-leaf/10 font-semibold' : 'border-line'}`}>
                  <input type="radio" name={`${id}-${q.id}`} value={o.id} checked={a[q.id] === o.id} onChange={() => setA({ ...a, [q.id]: o.id })} className="h-4 w-4 accent-[var(--color-leaf)]" />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div aria-live="polite" className="mt-5">
        {r ? (
          <div className="rounded-xl border-2 border-leaf bg-mist p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Our suggestion</p>
            <h3 className="mt-1 text-xl font-semibold">{r.title}<Bn>{r.bn}</Bn></h3>
            <p className="mt-2 text-base">{r.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {r.actions.map((x) => <Link key={x.href} href={x.href} className={`btn min-h-[48px] text-base ${x.primary ? 'btn-primary' : 'btn-quiet'}`}>{x.label}</Link>)}
            </div>
            <button type="button" onClick={() => setA({})} className="mt-3 min-h-[44px] text-base font-semibold text-leaf underline">Start again</button>
          </div>
        ) : <p className="text-base text-muted">Answer {NUMBER_WORD[questions.length] ?? 'all'} to see what to do.</p>}
      </div>
      <p className="mt-3 text-sm text-muted">This is a guide, not a promise. A CV does not decide a job, a place or a scholarship.</p>
    </section>
  );
}
