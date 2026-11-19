import type { ReactNode } from 'react';
import type { Block, Faq, Source } from '../../../shared/seoPage';

/** Shared parts of the long SEO pages (Europass pages, higher study pages). The plain-HTML twins are in shared/seoPageHtml.ts. */

export const LINK = 'font-semibold text-leaf hover:underline';

/** Small Bangla helper line under an English heading or label. */
export const Bn = ({ children }: { children: string }) => <span lang="bn" className="mt-0.5 block text-[0.95rem] font-normal leading-snug tracking-normal text-muted">{children}</span>;

export function BlockBody({ b }: { b: Block }) {
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
      {b.source && <p className="mt-3 text-sm text-muted">Source: <a href={b.source.url} rel="noopener" target="_blank" className="text-leaf hover:underline">{b.source.title}</a>. Last checked {b.source.checked}.</p>}
    </>
  );
}

const SUMMARY = 'flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden';
const Plus = () => <span aria-hidden="true" className="shrink-0 text-2xl leading-none text-leaf transition-transform group-open:rotate-45">+</span>;

/** A section. Ids in `folded` become accordions; `skip` leaves one out (it is drawn elsewhere). `bn` adds a Bangla line under the heading. */
export function BlockView({ b, folded, skip, bn }: { b: Block; folded?: readonly string[]; skip?: string; bn?: string }) {
  if (b.id === skip) return null;
  if (folded?.includes(b.id)) {
    return (
      <details id={b.id} className="group max-w-3xl rounded-xl border border-line bg-white px-4 sm:px-5">
        <summary className={SUMMARY}><h2 className="text-xl sm:text-2xl">{b.h2}{bn && <Bn>{bn}</Bn>}</h2><Plus /></summary>
        <div className="pb-5"><BlockBody b={b} /></div>
      </details>
    );
  }
  return (
    <section id={b.id} className="max-w-3xl">
      <h2 className="text-2xl sm:text-3xl">{b.h2}{bn && <Bn>{bn}</Bn>}</h2>
      <BlockBody b={b} />
    </section>
  );
}

export function FaqView({ items, heading }: { items: Faq[]; heading: string }) {
  return (
    <details id="faq" open className="group max-w-3xl rounded-xl border border-line bg-white px-4 sm:px-5">
      <summary className={SUMMARY}><h2 className="text-xl sm:text-2xl">{heading}</h2><Plus /></summary>
      <div className="space-y-4 pb-5">{items.map((f) => <div key={f.q}><h3 className="text-base font-semibold">{f.q}</h3><p className="mt-1 text-base text-muted">{f.a}</p></div>)}</div>
    </details>
  );
}

/** Sources, dates, author and the page notes. `data-page-end` tells the sticky bar to step aside. */
export function Foot({ sources, updated, checked, author, lines, children }: { sources?: Source[]; updated: string; checked: string; author: { name: string; url: string }; lines: string[]; children?: ReactNode }) {
  return (
    <footer data-page-end className="max-w-3xl space-y-2 text-sm text-muted">
      {sources && (
        <section id="sources">
          <h2 className="text-2xl text-ink sm:text-3xl">Sources</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">{sources.map((s) => <li key={s.url}><a href={s.url} rel="noopener" target="_blank" className="text-leaf hover:underline">{s.title}</a></li>)}</ul>
        </section>
      )}
      {children}
      <p>Last updated {updated}. Last checked {checked}. By <a href={author.url} rel="author" className="text-leaf hover:underline">{author.name}</a>, CV consultant, Career Solutions.</p>
      {lines.map((l) => <p key={l}>{l}</p>)}
    </footer>
  );
}
