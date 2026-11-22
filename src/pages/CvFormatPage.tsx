import { useEffect } from 'react';
import { PageHead } from '../components/PageHead';
import { BlockView, FaqView, Foot, LINK } from '../components/seo/Blocks';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import {
  CV_FORMAT_ANSWER, CV_FORMAT_AUTHOR, CV_FORMAT_BLOCKS, CV_FORMAT_FAQ, CV_FORMAT_FAQ_HEADING, CV_FORMAT_LINKS, CV_FORMAT_LINKS_HEADING, CV_FORMAT_NOTE, CV_FORMAT_PATH, CV_FORMAT_SEO, CV_FORMAT_UPDATED,
} from '../../shared/cvFormatPage';

/** /cv-format-bd. Same copy as the prerendered HTML (shared/cvFormatHtml.ts). */
export function CvFormatPage() {
  useEffect(() => setPageMeta(CV_FORMAT_SEO.title, CV_FORMAT_SEO.description, CV_FORMAT_PATH), []);
  return (
    <>
      <PageHead crumbs={[]} title={CV_FORMAT_SEO.h1} intro={<p className="text-base font-medium text-ink sm:text-lg">{CV_FORMAT_ANSWER}</p>} />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <div className="max-w-3xl space-y-10">
          {CV_FORMAT_BLOCKS.map((b) => <BlockView key={b.id} b={b} />)}
          <FaqView items={CV_FORMAT_FAQ} heading={CV_FORMAT_FAQ_HEADING} />
          <section id="more">
            <h2 className="text-2xl sm:text-3xl">{CV_FORMAT_LINKS_HEADING}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              {CV_FORMAT_LINKS.map((l) => <li key={l.href}><Link href={l.href} className={LINK}>{l.text}</Link></li>)}
            </ul>
          </section>
        </div>
        <Foot updated={CV_FORMAT_UPDATED} checked={CV_FORMAT_UPDATED} author={CV_FORMAT_AUTHOR} lines={[CV_FORMAT_NOTE]} />
      </div>
    </>
  );
}
