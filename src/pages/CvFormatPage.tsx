import { useEffect } from 'react';
import { PageHead } from '../components/PageHead';
import { BlockView, FaqView, Foot, LINK } from '../components/seo/Blocks';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import {
  CV_FORMAT_ANSWER, CV_FORMAT_AUTHOR, CV_FORMAT_CHECKED, CV_FORMAT_FAQ, CV_FORMAT_FAQ_HEADING, CV_FORMAT_GALLERY_HEADING, CV_FORMAT_GALLERY_LINKS, CV_FORMAT_GALLERY_NOTE, CV_FORMAT_LINKS, CV_FORMAT_LINKS_HEADING, CV_FORMAT_NOTE, CV_FORMAT_PATH, CV_FORMAT_SEO, CV_FORMAT_SOURCES, CV_FORMAT_TOC_HEADING, CV_FORMAT_UPDATED, CV_FORMAT_WRITE_LINK,
  cvFormatGallery, cvFormatSections, cvFormatToc, type SampleCv,
} from '../../shared/cvFormatPage';

function SampleCvView({ c }: { c: SampleCv }) {
  return (
    <section id={c.id} className="max-w-3xl">
      <h2 className="text-2xl sm:text-3xl">{c.h2}</h2>
      <p className="mt-3 text-base leading-relaxed">{c.intro}</p>
      <div className="mt-3 rounded-xl border border-line bg-white p-4 text-base sm:p-6">
        <p className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-muted">{c.label}</p>
        <h3 className="mt-4 text-xl font-bold">{c.name}</h3>
        <p className="text-muted">{c.contact}</p>
        {c.sections.map((sec) => (
          <div key={sec.h} className="mt-4">
            <h4 className="border-b border-line pb-1 text-sm font-bold uppercase tracking-wide text-ink">{sec.h}</h4>
            {sec.entries.map((e, i) => (
              <div key={i} className="mt-2">
                {e.head && <p className="font-semibold">{e.head}</p>}
                {e.lines?.map((l) => <p key={l}>{l}</p>)}
                {e.bullets && <ul className="mt-1 list-disc space-y-1 pl-5">{e.bullets.map((x) => <li key={x}>{x}</li>)}</ul>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <div className="mt-5">
      <h3 className="text-xl font-semibold">{CV_FORMAT_GALLERY_HEADING}</h3>
      <p className="mt-1 text-base text-muted">{CV_FORMAT_GALLERY_NOTE}</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cvFormatGallery().map((g) => (
          <li key={g.id}>
            <Link href={g.href} className="block rounded-lg border border-line bg-white p-1.5 hover:border-leaf">
              <img src={g.img} alt={g.alt} width={420} height={544} loading="lazy" decoding="async" className="aspect-[420/544] w-full rounded object-cover object-top" />
              <span className="mt-1.5 block text-sm font-semibold leading-snug">{g.label}</span>
              <span className="block text-xs text-muted">{g.kind}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-base">{CV_FORMAT_GALLERY_LINKS.map((l) => <Link key={l.href} href={l.href} className={LINK}>{l.text}</Link>)}</p>
    </div>
  );
}

/** /cv-format-bd. Same copy as the prerendered HTML (shared/cvFormatHtml.ts). */
export function CvFormatPage() {
  useEffect(() => setPageMeta(CV_FORMAT_SEO.title, CV_FORMAT_SEO.description, CV_FORMAT_PATH), []);
  return (
    <>
      <PageHead crumbs={[]} title={CV_FORMAT_SEO.h1} intro={<p className="text-base font-medium text-ink sm:text-lg">{CV_FORMAT_ANSWER}</p>} />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <div className="max-w-3xl space-y-10">
          <nav id="toc" aria-label={CV_FORMAT_TOC_HEADING} className="rounded-xl border border-line bg-white p-4 sm:p-5">
            <p className="font-semibold">{CV_FORMAT_TOC_HEADING}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">{cvFormatToc().map((t) => <li key={t.id}><a href={`#${t.id}`} className={LINK}>{t.text}</a></li>)}</ol>
          </nav>
          <p className="text-base">{CV_FORMAT_WRITE_LINK.lead} <Link href={CV_FORMAT_WRITE_LINK.href} className={LINK}>{CV_FORMAT_WRITE_LINK.text}</Link></p>
          {cvFormatSections().map((x) => (x.kind === 'sample' ? <SampleCvView key={x.s.id} c={x.s} /> : x.gallery ? (
            <div key={x.b.id}><BlockView b={x.b} /><div className="max-w-3xl"><Gallery /></div></div>
          ) : <BlockView key={x.b.id} b={x.b} />))}
          <FaqView items={CV_FORMAT_FAQ} heading={CV_FORMAT_FAQ_HEADING} />
          <section id="more">
            <h2 className="text-2xl sm:text-3xl">{CV_FORMAT_LINKS_HEADING}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              {CV_FORMAT_LINKS.map((l) => <li key={l.href}><Link href={l.href} className={LINK}>{l.text}</Link></li>)}
            </ul>
          </section>
        </div>
        <Foot sources={CV_FORMAT_SOURCES} updated={CV_FORMAT_UPDATED} checked={CV_FORMAT_CHECKED} author={CV_FORMAT_AUTHOR} lines={[CV_FORMAT_NOTE]} />
      </div>
    </>
  );
}
