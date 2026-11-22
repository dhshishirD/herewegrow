import { useEffect } from 'react';
import { PageHead } from '../components/PageHead';
import { BlockView, FaqView, Foot, LINK } from '../components/seo/Blocks';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { LETTERS_UPDATED, LETTER_AUTHOR, findLetter } from '../../shared/letterPages';

/** /cover-letter, /application-letter-bangla, /resignation-letter-bangla. Same copy as the prerendered HTML (shared/letterHtml.ts). */
export function LetterPage({ path }: { path: string }) {
  const l = findLetter(path);
  useEffect(() => {
    if (l) setPageMeta(l.title, l.description, l.path);
  }, [l]);
  if (!l) return null;
  return (
    <>
      <PageHead crumbs={[]} title={l.h1} intro={<p className="text-base font-medium text-ink sm:text-lg">{l.answer}</p>} />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <div className="max-w-3xl space-y-10">
          {l.blocks.map((b) => <BlockView key={b.id} b={b} />)}
          <FaqView items={l.faq} heading={l.faqHeading} />
          <section id="more">
            <h2 className="text-2xl sm:text-3xl">{l.linksHeading}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              {l.links.map((k) => <li key={k.href}><Link href={k.href} className={LINK}>{k.text}</Link></li>)}
            </ul>
          </section>
        </div>
        <Foot updated={LETTERS_UPDATED} checked={LETTERS_UPDATED} author={LETTER_AUTHOR} lines={[l.note]} />
      </div>
    </>
  );
}
