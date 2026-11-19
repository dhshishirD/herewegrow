import { useEffect } from 'react';
import { PageHead } from '../components/PageHead';
import {
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

function BlockView({ b }: { b: Block }) {
  return (
    <section id={b.id} className="max-w-3xl">
      <h2 className="text-2xl sm:text-3xl">{b.h2}</h2>
      {b.p?.map((x) => <p key={x} className="mt-3">{x}</p>)}
      {b.ul && <ul className="mt-3 list-disc space-y-1.5 pl-5">{b.ul.map((x) => <li key={x}>{x}</li>)}</ul>}
      {b.ol && <ol className="mt-3 list-decimal space-y-1.5 pl-5">{b.ol.map((x) => <li key={x}>{x}</li>)}</ol>}
      {b.table && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-line">{b.table.head.map((h) => <th key={h} scope="col" className="py-2 pr-4">{h}</th>)}</tr></thead>
            <tbody>{b.table.rows.map((r) => <tr key={r[0]} className="border-b border-line align-top">{r.map((c, i) => (i === 0 ? <th key={c} scope="row" className="py-2 pr-4 font-semibold">{c}</th> : <td key={c} className="py-2 pr-4">{c}</td>))}</tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function FaqView({ items }: { items: Faq[] }) {
  return (
    <section id="faq" className="max-w-3xl">
      <h2 className="text-2xl sm:text-3xl">Questions about the Europass-style CV</h2>
      <div className="mt-3 space-y-4">{items.map((f) => <div key={f.q}><h3 className="font-semibold">{f.q}</h3><p className="text-muted">{f.a}</p></div>)}</div>
    </section>
  );
}

function Foot({ sources }: { sources?: boolean }) {
  return (
    <footer className="max-w-3xl space-y-2 text-sm text-muted">
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

function useSeo(path: keyof typeof EUROPASS_SEO) {
  const s = EUROPASS_SEO[path];
  useEffect(() => setPageMeta(s.title, s.description, path), [s, path]);
  return s;
}

export function EuropassPillarPage() {
  const s = useSeo(EUROPASS_PILLAR_PATH);
  const lead = europassHubTemplates()[0];
  return (
    <>
      <PageHead crumbs={crumbsFor(EUROPASS_PILLAR_PATH)} title={s.h1} intro={<p className="font-medium text-ink">{PILLAR_ANSWER}</p>} />
      <div className="wrap space-y-12 py-10">
        <div className="max-w-3xl space-y-4">
          {PILLAR_INTRO.map((x) => <p key={x}>{x}</p>)}
          <p className="flex flex-wrap gap-3">
            <BuildButton where="hero" />
            <Link href={EUROPASS_WORD_PATH} className="btn border border-line hover:border-leaf">Word template</Link>
          </p>
          {lead && <figure className="max-w-xs"><Preview t={lead} eager full /><figcaption className="mt-2 text-sm text-muted">Europass-style layout preview. Sample data (invented).</figcaption></figure>}
        </div>
        {PILLAR_BLOCKS.map((b) => <BlockView key={b.id} b={b} />)}
        <p className="max-w-3xl">
          <BuildButton where="after_how" />{' '}
          <Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href={EUROPASS_HUB_PATH} className={A}>All Europass-style templates</Link> · <Link href={EUROPASS_WORD_PATH} className={A}>Word template</Link> · <Link href="/services" className={A}>CV writing service</Link> · <Link href="/pro" className={A}>Pro</Link>
        </p>
        <FaqView items={PILLAR_FAQ} />
        <Foot sources />
      </div>
    </>
  );
}

export function EuropassHubPage() {
  const s = useSeo(EUROPASS_HUB_PATH);
  const tpls = europassHubTemplates();
  return (
    <>
      <PageHead crumbs={crumbsFor(EUROPASS_HUB_PATH)} title={s.h1} intro={<p>{HUB_INTRO}</p>} />
      <div className="wrap space-y-12 py-10">
        <p className="flex flex-wrap gap-3">
          <BuildButton where="hub" />
          <Link href={EUROPASS_PILLAR_PATH} className="btn border border-line hover:border-leaf">Europass CV guide</Link>
          <Link href={EUROPASS_WORD_PATH} className="btn border border-line hover:border-leaf">Word template details</Link>
        </p>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}

export function EuropassWordPage() {
  const s = useSeo(EUROPASS_WORD_PATH);
  const tpls = europassHubTemplates().slice(0, 5);
  return (
    <>
      <PageHead crumbs={crumbsFor(EUROPASS_WORD_PATH)} title={s.h1} intro={<p className="font-medium text-ink">{WORD_ANSWER}</p>} />
      <div className="wrap space-y-12 py-10">
        <p className="flex flex-wrap gap-3">
          <BuildButton where="word" />
          <Link href={EUROPASS_PILLAR_PATH} className="btn border border-line hover:border-leaf">Europass CV guide</Link>
          <Link href={EUROPASS_HUB_PATH} className="btn border border-line hover:border-leaf">All Europass-style templates</Link>
        </p>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tpls.map((t, i) => (
            <li key={t.id} className="space-y-2">
              <Link href={t.path}><Preview t={t} eager={i === 0} full /></Link>
              <p><Link href={t.path} className={A}>{t.name}</Link></p>
            </li>
          ))}
        </ul>
        {WORD_BLOCKS.map((b) => <BlockView key={b.id} b={b} />)}
        <FaqView items={WORD_FAQ} />
        <p className="max-w-3xl"><Link href="/templates" className={A}>All CV templates</Link> · <Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href="/pro" className={A}>Pro</Link></p>
        <Foot />
      </div>
    </>
  );
}
