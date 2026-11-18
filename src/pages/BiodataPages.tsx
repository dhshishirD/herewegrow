import { useEffect } from 'react';
import { PageHead } from '../components/PageHead';
import { BIODATA_FAQ, BIODATA_HUB, BIODATA_HUB_BN, BIODATA_HUB_PATH, BIODATA_MAKER_PATH, BIODATA_STYLES, biodataPreview, biodataStyleBySlug, biodataStylePath } from '../../shared/biodataStyles';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { NotFound } from './Policies';

const GROUPS = ['Dignified', 'Modern', 'Personality', 'Significant'] as const;
const GROUP_NOTE: Record<(typeof GROUPS)[number], string> = {
  Dignified: 'Formal and traditional.',
  Modern: 'Clean and easy to read on a phone.',
  Personality: 'Warmer, tells a little more about you.',
  Significant: 'Bold colour for a polished first impression.',
};
const crumbs = [{ href: '/templates', label: { en: 'Templates', bn: 'টেমপ্লেট' } }];

function Preview({ slug, name, eager }: { slug: string; name: string; eager?: boolean }) {
  return <img src={biodataPreview(slug)} width={600} height={849} alt={`${name} marriage biodata format, page 1 (sample)`} loading={eager ? 'eager' : 'lazy'} {...(eager ? { fetchPriority: 'high' as const } : {})} className="h-auto w-full rounded-lg border border-line bg-white" />;
}

export function BiodataHubPage() {
  useEffect(() => setPageMeta(BIODATA_HUB.title, BIODATA_HUB.description, BIODATA_HUB_PATH), []);
  return (
    <>
      <PageHead crumbs={crumbs} title={BIODATA_HUB.h1} intro={
        <>
          <p>A marriage biodata is the first page a family reads about you. It should be clear, respectful and easy to share on WhatsApp. Pick one of 10 designs below, choose a colour and fill in your details. It takes about 5 minutes on your phone, and you download a PDF.</p>
          <p className="mt-3 text-base">{BIODATA_HUB_BN[0]} {BIODATA_HUB_BN[1]}</p>
        </>
      } />
      <div className="wrap space-y-12 py-10">
        <p><Link href={BIODATA_MAKER_PATH} className="btn btn-primary">Open the biodata maker</Link></p>
        {GROUPS.map((g, gi) => (
          <section key={g} aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} className="text-2xl">{g} designs</h2>
            <p className="mt-1 text-muted">{GROUP_NOTE[g]}</p>
            <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {BIODATA_STYLES.filter((s) => s.group === g).map((s, i) => (
                <li key={s.id} className="space-y-3">
                  <Link href={biodataStylePath(s.slug)}><Preview slug={s.slug} name={s.name} eager={gi === 0 && i === 0} /></Link>
                  <div>
                    <h3 className="font-semibold"><Link href={biodataStylePath(s.slug)} className="hover:text-leaf">{s.name} marriage biodata</Link></h3>
                    <p className="text-sm text-muted">{s.note} {s.free ? 'Free.' : 'Clean pack.'}</p>
                    <Link href={`${BIODATA_MAKER_PATH}?style=${s.slug}`} className="text-sm font-semibold text-leaf hover:underline">Use this design</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section>
          <h2 className="text-2xl">What to include in a marriage biodata</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Name, age, height and a clear photo (optional).</li>
            <li>Education and work.</li>
            <li>Family: parents, brothers and sisters.</li>
            <li>Religion and marital status.</li>
            <li>A few lines about you, and what you look for in a partner.</li>
            <li>One guardian contact.</li>
          </ul>
          <h2 className="mt-8 text-2xl">What to leave out</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Income, unless you choose to show it.</li>
            <li>Caste or community lines, and horoscope details.</li>
            <li>A private address or anything you would not tell a stranger.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl">Free and Clean pack</h2>
          <table className="mt-3 w-full max-w-2xl text-left text-sm">
            <thead><tr className="border-b border-line"><th className="py-2 pr-4"> </th><th className="py-2 pr-4">Free</th><th className="py-2">Clean pack (৳49) or Pro</th></tr></thead>
            <tbody>
              <tr className="border-b border-line"><td className="py-2 pr-4 font-semibold">Designs</td><td className="pr-4">Classic Serif, Minimal Clean</td><td>All 10</td></tr>
              <tr className="border-b border-line"><td className="py-2 pr-4 font-semibold">Colours</td><td className="pr-4">Navy, Emerald, Charcoal</td><td>All 10</td></tr>
              <tr className="border-b border-line"><td className="py-2 pr-4 font-semibold">Pages</td><td className="pr-4">Up to 2</td><td>Up to 3</td></tr>
              <tr className="border-b border-line"><td className="py-2 pr-4 font-semibold">Small herewegrow.pro line</td><td className="pr-4">Yes</td><td>No</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">Word and PNG download</td><td className="pr-4">No</td><td>Yes</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h2 className="text-2xl">Prefer a Word file?</h2>
          <p className="mt-2 max-w-2xl">We also have editable Word marriage biodata templates from ৳29. <Link href="/templates" className="font-semibold text-leaf hover:underline">See the Word templates</Link>.</p>
        </section>
        <section>
          <h2 className="text-2xl">Questions about marriage biodata</h2>
          <div className="mt-3 max-w-3xl space-y-4">
            {BIODATA_FAQ.map((f) => (<div key={f.q}><h3 className="font-semibold">{f.q}</h3><p className="text-muted">{f.a}</p></div>))}
          </div>
        </section>
        <p className="text-sm text-muted">By Daloyar Hassan Shishir, CV and career consulting, Career Solutions. Last updated 18 November 2026. Your details are filled in your browser and not sent to a server.</p>
      </div>
    </>
  );
}

export function BiodataStylePage({ slug }: { slug: string }) {
  const s = biodataStyleBySlug(slug);
  useEffect(() => { if (s) setPageMeta(s.seo.title, s.seo.description, biodataStylePath(s.slug)); }, [s]);
  if (!s) return <NotFound />;
  const siblings = BIODATA_STYLES.filter((x) => x.id !== s.id && x.group === s.group).concat(BIODATA_STYLES.filter((x) => x.group !== s.group)).slice(0, 2);
  return (
    <>
      <PageHead crumbs={[...crumbs, { href: BIODATA_HUB_PATH, label: { en: 'Marriage biodata', bn: 'বিয়ের বায়োডাটা' } }]} title={s.seo.h1} intro={s.note} />
      <div className="wrap grid gap-10 py-10 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Preview slug={s.slug} name={s.name} eager />
        <div className="space-y-5">
          <p className="max-w-2xl text-lg">{s.blurb}</p>
          <p><strong>Best for:</strong> {s.bestFor}</p>
          <p><strong>{s.free ? 'Free design.' : 'Clean pack design.'}</strong> {s.free ? 'Download a PDF free in Navy, Emerald or Charcoal.' : 'Preview it free; downloading needs the Clean pack (৳49) or any Pro pass. Any of the 10 colours.'} The sample shows made-up details, not a real person.</p>
          <p><Link href={`${BIODATA_MAKER_PATH}?style=${s.slug}`} className="btn btn-primary">Use this design</Link></p>
          <p>See all 10 designs in <Link href={BIODATA_HUB_PATH} className="font-semibold text-leaf hover:underline">biodata formats for marriage</Link>, or open the <Link href={BIODATA_MAKER_PATH} className="font-semibold text-leaf hover:underline">biodata maker</Link>. Prefer a Word file? See the <Link href="/templates" className="font-semibold text-leaf hover:underline">Word marriage templates</Link>.</p>
          <div>
            <h2 className="text-xl">Two more designs</h2>
            <ul className="mt-2 list-disc pl-5">{siblings.map((x) => (<li key={x.id}><Link href={biodataStylePath(x.slug)} className="text-leaf hover:underline">{x.name} marriage biodata</Link></li>))}</ul>
          </div>
        </div>
      </div>
    </>
  );
}
