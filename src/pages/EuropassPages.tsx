import { useEffect, useRef, useState } from 'react';
import { PageHead } from '../components/PageHead';
import {
  CHOICES_HEADING, EUROPASS_PREVIEW, EUROPASS_WHATSAPP_HREF, HOW_HEADING, HOW_LABELS, PILLAR_FOLDED, QUIZ, QUIZ_HEADING, QUIZ_INTRO, WORD_FOLDED, europassChoices, quizResult,
  type QuizAnswers,
  EUROPASS_AUTHOR, EUROPASS_BUILDER_HREF, EUROPASS_CHECKED, EUROPASS_HUB_PATH, EUROPASS_PILLAR_PATH, EUROPASS_PRICES, EUROPASS_PRIVACY,
  EUROPASS_SEO, EUROPASS_SOURCES, EUROPASS_UNOFFICIAL, EUROPASS_UPDATED, EUROPASS_WORD_PATH, HUB_CHOOSE, HUB_FAQ, HUB_INTRO,
  PILLAR_ANSWER, PILLAR_BLOCKS, PILLAR_FAQ, PILLAR_INTRO, WORD_ANSWER, WORD_BLOCKS, WORD_FAQ, europassHubTemplates, imageAlt,
  type Block, type Faq, type HubTemplate,
} from '../../shared/europassPages';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';

const A = 'font-semibold text-leaf hover:underline';
const crumbsFor = (path: string) =>
  path === EUROPASS_PILLAR_PATH ? []
  : path === EUROPASS_HUB_PATH ? [{ href: '/templates', label: { en: 'Templates', bn: 'টেমপ্লেট' } }]
  : [{ href: EUROPASS_PILLAR_PATH, label: { en: 'Europass CV', bn: 'ইউরোপাস সিভি' } }];

function BlockBody({ b }: { b: Block }) {
  return (
    <>
      {b.p?.map((x) => <p key={x} className="mt-3 text-base leading-relaxed">{x}</p>)}
      {b.ul && <ul className="mt-3 list-disc space-y-1.5 pl-5">{b.ul.map((x) => <li key={x}>{x}</li>)}</ul>}
      {b.ol && <ol className="mt-3 list-decimal space-y-1.5 pl-5">{b.ol.map((x) => <li key={x}>{x}</li>)}</ol>}
      {b.table && (
        <>
        <p className="mt-3 text-sm text-muted sm:hidden">Swipe the table sideways to see every column.</p>
        <div className="mt-2 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[32rem] text-left text-base">
            <thead><tr className="border-b border-line">{b.table.head.map((h) => <th key={h} scope="col" className="px-3 py-2">{h}</th>)}</tr></thead>
            <tbody>{b.table.rows.map((r) => <tr key={r[0]} className="border-b border-line align-top">{r.map((c, i) => (i === 0 ? <th key={c} scope="row" className="px-3 py-2 font-semibold">{c}</th> : <td key={c} className="px-3 py-2">{c}</td>))}</tr>)}</tbody>
          </table>
        </div>
        </>
      )}
    </>
  );
}

const SUMMARY = 'flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden';
const Plus = () => <span aria-hidden="true" className="shrink-0 text-2xl leading-none text-leaf transition-transform group-open:rotate-45">+</span>;

function BlockView({ b, folded, skip }: { b: Block; folded?: readonly string[]; skip?: string }) {
  if (b.id === skip) return null;
  if (folded?.includes(b.id)) {
    return (
      <details id={b.id} className="group max-w-3xl rounded-xl border border-line bg-white px-4 sm:px-5">
        <summary className={SUMMARY}><h2 className="text-xl sm:text-2xl">{b.h2}</h2><Plus /></summary>
        <div className="pb-5"><BlockBody b={b} /></div>
      </details>
    );
  }
  return (
    <section id={b.id} className="max-w-3xl">
      <h2 className="text-2xl sm:text-3xl">{b.h2}</h2>
      <BlockBody b={b} />
    </section>
  );
}

function FaqView({ items }: { items: Faq[] }) {
  return (
    <details id="faq" open className="group max-w-3xl rounded-xl border border-line bg-white px-4 sm:px-5">
      <summary className={SUMMARY}><h2 className="text-xl sm:text-2xl">Questions about the Europass-style CV</h2><Plus /></summary>
      <div className="space-y-4 pb-5">{items.map((f) => <div key={f.q}><h3 className="text-base font-semibold">{f.q}</h3><p className="mt-1 text-base text-muted">{f.a}</p></div>)}</div>
    </details>
  );
}

function Foot({ sources }: { sources?: boolean }) {
  return (
    <footer data-page-end className="max-w-3xl space-y-2 text-sm text-muted">
      {sources && (
        <section id="sources">
          <h2 className="text-2xl text-ink sm:text-3xl">Sources</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">{EUROPASS_SOURCES.map((s) => <li key={s.url}><a href={s.url} rel="noopener" target="_blank" className="text-leaf hover:underline">{s.title}</a></li>)}</ul>
        </section>
      )}
      <p>Last updated {EUROPASS_UPDATED}. Last checked {EUROPASS_CHECKED}. By <a href={EUROPASS_AUTHOR.url} rel="author" className="text-leaf hover:underline">{EUROPASS_AUTHOR.name}</a>, CV consultant, Career Solutions.</p>
      <p>{EUROPASS_PRIVACY}</p>
      <p>{EUROPASS_UNOFFICIAL}</p>
    </footer>
  );
}

function BuildButton({ where }: { where: string }) {
  return <Link href={EUROPASS_BUILDER_HREF} onClick={() => track('abroad_cta_click', { kind: 'europass', where })} className="btn btn-primary">Build free</Link>;
}

function Preview({ t, eager, full }: { t: HubTemplate; eager?: boolean; full?: boolean }) {
  return (
    <img
      src={full ? t.full : t.thumb} width={full ? t.fullW : t.w} height={full ? t.fullH : t.h} alt={imageAlt(t)}
      loading={eager ? 'eager' : 'lazy'} {...(eager ? { fetchPriority: 'high' as const } : {})}
      className="h-auto w-full rounded-lg border border-line bg-white"
    />
  );
}

function OwnPreview({ eager, thumb }: { eager?: boolean; thumb?: boolean }) {
  const P = EUROPASS_PREVIEW;
  return (
    <figure className="mx-auto w-full max-w-[16rem] sm:max-w-xs">
      <img
        src={thumb ? P.thumb : P.src} width={thumb ? P.tw : P.w} height={thumb ? P.th : P.h} alt={P.alt}
        loading={eager ? 'eager' : 'lazy'} {...(eager ? { fetchPriority: 'high' as const } : {})}
        className="h-auto w-full rounded-lg border border-line bg-white shadow-sm"
      />
      <figcaption className="mt-2 text-center text-sm text-muted">{P.caption}</figcaption>
    </figure>
  );
}

const Bn = ({ children }: { children: string }) => <span lang="bn" className="mt-0.5 block text-[0.95rem] font-normal leading-snug tracking-normal text-muted">{children}</span>;

function ChoiceCards({ wordHref, where }: { wordHref: string; where: string }) {
  const [build, word, expert] = europassChoices(wordHref);
  const card = 'flex flex-col rounded-2xl border bg-white p-4 sm:p-5';
  const hit = 'btn mt-4 w-full min-h-[48px] text-base';
  return (
    <section id="choose-path" aria-labelledby="choose-h" className="space-y-3">
      <h2 id="choose-h" className="text-2xl sm:text-3xl">{CHOICES_HEADING.en}<Bn>{CHOICES_HEADING.bn}</Bn></h2>
      <ul className="grid gap-3 lg:grid-cols-1">
        <li className={`${card} border-leaf ring-2 ring-leaf/30`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">Best for most people</p>
          <h3 className="mt-1 text-xl font-semibold">{build.title}<Bn>{build.bn}</Bn></h3>
          <p className="mt-2 text-base text-muted">{build.micro}</p>
          <Link href={build.href} onClick={() => track('abroad_cta_click', { kind: 'europass', where: `${where}_card_build` })} className={`${hit} btn-primary`}>{build.cta}</Link>
        </li>
        <li className={`${card} border-line`}>
          <h3 className="text-xl font-semibold">{word.title}<Bn>{word.bn}</Bn></h3>
          <p className="mt-2 text-base text-muted">{word.micro}</p>
          {word.href.startsWith('#')
            ? <a href={word.href} className={`${hit} btn-quiet`}>{word.cta}</a>
            : <Link href={word.href} onClick={() => track('abroad_cta_click', { kind: 'europass', where: `${where}_card_word` })} className={`${hit} btn-quiet`}>{word.cta}</Link>}
        </li>
        <li className={`${card} border-line`}>
          <h3 className="text-xl font-semibold">{expert.title}<Bn>{expert.bn}</Bn></h3>
          <p className="mt-2 text-base text-muted">{expert.micro}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href={expert.href} onClick={() => track('abroad_cta_click', { kind: 'europass', where: `${where}_card_expert` })} className="btn btn-quiet min-h-[48px] text-base">{expert.cta}</Link>
            <a href={EUROPASS_WHATSAPP_HREF} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: `europass_${where}` })} className="btn btn-quiet min-h-[48px] text-base">Ask on WhatsApp</a>
          </div>
        </li>
      </ul>
    </section>
  );
}

function HowStrip({ b }: { b: Block }) {
  return (
    <section id={b.id} className="max-w-3xl">
      <h2 className="text-2xl sm:text-3xl">{b.h2}<Bn>{HOW_HEADING.bn}</Bn></h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {(b.ol ?? []).map((step, i) => (
          <li key={step} className="rounded-xl border border-line bg-white p-4">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf font-display text-lg font-bold text-white">{i + 1}</span>
            <p className="mt-2 text-lg font-semibold">{HOW_LABELS[i]}</p>
            <p className="mt-1 text-base text-muted">{step}</p>
          </li>
        ))}
      </ol>
      {b.p?.map((x) => <p key={x} className="mt-3 text-base">{x}</p>)}
    </section>
  );
}

function Quiz() {
  const [a, setA] = useState<QuizAnswers>({});
  const r = quizResult(a);
  return (
    <section id="do-i-need" className="max-w-3xl rounded-2xl border border-line bg-white p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl">{QUIZ_HEADING.en}<Bn>{QUIZ_HEADING.bn}</Bn></h2>
      <p className="mt-2 text-base text-muted">{QUIZ_INTRO}</p>
      <div className="mt-4 space-y-5">
        {QUIZ.map((q, i) => (
          <fieldset key={q.id}>
            <legend className="text-base font-semibold">{i + 1}. {q.q}<Bn>{q.bn}</Bn></legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <label key={o.id} className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-4 text-base ${a[q.id] === o.id ? 'border-leaf bg-leaf/10 font-semibold' : 'border-line'}`}>
                  <input type="radio" name={`q-${q.id}`} value={o.id} checked={a[q.id] === o.id} onChange={() => setA({ ...a, [q.id]: o.id })} className="h-4 w-4 accent-[var(--color-leaf)]" />
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
        ) : <p className="text-base text-muted">Answer all three to see what to do.</p>}
      </div>
      <p className="mt-3 text-sm text-muted">This is a guide, not a promise. A CV does not decide a job, a place or a scholarship.</p>
    </section>
  );
}

/** Mobile-only action bar after the hero. Sits right of the bottom-left "Message us" button and hides at the page end so the footer stays clear. */
function StickyBar({ heroId, secondary }: { heroId: string; secondary: { label: string; href: string } }) {
  const [pastHero, setPast] = useState(false);
  const [atEnd, setEnd] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = document.getElementById(heroId);
    const end = document.querySelector('[data-page-end]');
    const check = () => {
      setPast(!!hero && hero.getBoundingClientRect().bottom < 0);
      setEnd(!!end && end.getBoundingClientRect().top < window.innerHeight);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [heroId]);
  if (!pastHero || atEnd) return null;
  return (
    <div ref={ref} className="no-print fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-line bg-white/95 py-2 pl-[8.75rem] pr-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
      <Link href={EUROPASS_BUILDER_HREF} onClick={() => track('abroad_cta_click', { kind: 'europass', where: 'sticky' })} className="btn btn-primary min-h-[44px] flex-1 !px-2 text-base">Build free</Link>
      {secondary.href.startsWith('#')
        ? <a href={secondary.href} className="btn btn-quiet min-h-[44px] flex-1 whitespace-nowrap !px-2 bg-white text-[0.95rem]">{secondary.label}</a>
        : <Link href={secondary.href} className="btn btn-quiet min-h-[44px] flex-1 whitespace-nowrap !px-2 bg-white text-[0.95rem]">{secondary.label}</Link>}
    </div>
  );
}

function useSeo(path: keyof typeof EUROPASS_SEO) {
  const s = EUROPASS_SEO[path];
  useEffect(() => setPageMeta(s.title, s.description, path), [s, path]);
  return s;
}

export function EuropassPillarPage() {
  const s = useSeo(EUROPASS_PILLAR_PATH);
  const how = PILLAR_BLOCKS.find((b) => b.id === 'how')!;
  return (
    <>
      <PageHead crumbs={crumbsFor(EUROPASS_PILLAR_PATH)} title={s.h1} intro={<><p className="text-base font-medium text-ink sm:text-lg">{PILLAR_ANSWER}</p><p className="mt-4 flex flex-wrap gap-2"><Link href={EUROPASS_BUILDER_HREF} onClick={() => track('abroad_cta_click', { kind: 'europass', where: 'hero_top' })} className="btn btn-primary min-h-[48px]">Build free now</Link><a href="#choose-path" className="btn btn-quiet min-h-[48px] bg-white">Other options</a></p></>} />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="max-w-3xl space-y-6">
            <div id="hero-choices"><ChoiceCards wordHref={EUROPASS_WORD_PATH} where="hero" /></div>
            {PILLAR_INTRO.map((x) => <p key={x} className="text-base leading-relaxed">{x}</p>)}
          </div>
          <OwnPreview eager />
        </div>
        <HowStrip b={how} />
        <Quiz />
        {PILLAR_BLOCKS.map((b) => <BlockView key={b.id} b={b} folded={PILLAR_FOLDED} skip="how" />)}
        <section className="max-w-3xl space-y-3">
          <BuildButton where="after_how" />
          <p className="leading-loose"><Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href={EUROPASS_HUB_PATH} className={A}>All Europass-style templates</Link> · <Link href={EUROPASS_WORD_PATH} className={A}>Word template</Link> · <Link href="/services" className={A}>CV writing service</Link> · <Link href="/pro" className={A}>Pro</Link></p>
        </section>
        <FaqView items={PILLAR_FAQ} />
        <Foot sources />
      </div>
      <StickyBar heroId="hero-choices" secondary={{ label: 'Word template', href: EUROPASS_WORD_PATH }} />
    </>
  );
}

export function EuropassHubPage() {
  const s = useSeo(EUROPASS_HUB_PATH);
  const tpls = europassHubTemplates();
  return (
    <>
      <PageHead crumbs={crumbsFor(EUROPASS_HUB_PATH)} title={s.h1} intro={<p>{HUB_INTRO}</p>} />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <div id="hero-choices" className="max-w-3xl"><ChoiceCards wordHref="#templates" where="hub" /></div>
        <p className="flex flex-wrap gap-3">
          <Link href={EUROPASS_PILLAR_PATH} className="btn btn-quiet min-h-[44px]">Europass CV guide</Link>
          <Link href={EUROPASS_WORD_PATH} className="btn btn-quiet min-h-[44px]">Word template details</Link>
        </p>
        <ul id="templates" className="grid scroll-mt-24 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tpls.map((t, i) => (
            <li key={t.id} className="space-y-3">
              <Link href={t.path}><Preview t={t} eager={i === 0} /></Link>
              <div>
                <h3 className="font-semibold"><Link href={t.path} className="hover:text-leaf">{t.name}</Link></h3>
                <p className="text-sm text-muted">{t.pages} {t.pages === 1 ? 'page' : 'pages'}, {t.color.toLowerCase()}. Word template {EUROPASS_PRICES.single}.</p>
              </div>
            </li>
          ))}
        </ul>
        <section id="choose" className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">How to choose a Europass-style template</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">{HUB_CHOOSE.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
        <FaqView items={HUB_FAQ} />
        <p className="max-w-3xl"><Link href="/templates" className={A}>All CV templates</Link> · <Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href="/pro" className={A}>Pro</Link></p>
        <Foot />
      </div>
      <StickyBar heroId="hero-choices" secondary={{ label: 'Templates', href: '#templates' }} />
    </>
  );
}

export function EuropassWordPage() {
  const s = useSeo(EUROPASS_WORD_PATH);
  const tpls = europassHubTemplates().slice(0, 5);
  return (
    <>
      <PageHead crumbs={crumbsFor(EUROPASS_WORD_PATH)} title={s.h1} intro={<p className="font-medium text-ink">{WORD_ANSWER}</p>} />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <div id="hero-choices" className="max-w-3xl"><ChoiceCards wordHref="#templates" where="word" /></div>
        <p className="flex flex-wrap gap-3">
          <Link href={EUROPASS_PILLAR_PATH} className="btn btn-quiet min-h-[44px]">Europass CV guide</Link>
          <Link href={EUROPASS_HUB_PATH} className="btn btn-quiet min-h-[44px]">All Europass-style templates</Link>
        </p>
        <ul id="templates" className="grid scroll-mt-24 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tpls.map((t, i) => (
            <li key={t.id} className="space-y-2">
              <Link href={t.path}><Preview t={t} eager={i === 0} full /></Link>
              <p><Link href={t.path} className={A}>{t.name}</Link></p>
            </li>
          ))}
        </ul>
        {WORD_BLOCKS.map((b) => <BlockView key={b.id} b={b} folded={WORD_FOLDED} />)}
        <FaqView items={WORD_FAQ} />
        <p className="max-w-3xl"><Link href="/templates" className={A}>All CV templates</Link> · <Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href="/pro" className={A}>Pro</Link></p>
        <Foot />
      </div>
      <StickyBar heroId="hero-choices" secondary={{ label: 'Templates', href: '#templates' }} />
    </>
  );
}
