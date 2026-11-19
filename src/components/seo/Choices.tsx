import type { Choice } from '../../../shared/seoPage';
import { Link } from '../../lib/router';
import { track } from '../../lib/track';
import { Bn } from './Blocks';

/**
 * The three big choices under "What do you want to do?": build free, get a Word template, ask an expert.
 * `kind` is the tracking family (europass, higher_study); `where` is the page area.
 */
export function ChoiceCards({ choices, heading, kind, where, whatsappHref }: { choices: Choice[]; heading: { en: string; bn: string }; kind: string; where: string; whatsappHref: string }) {
  const [build, word, expert] = choices;
  const card = 'flex flex-col rounded-2xl border bg-white p-4 sm:p-5';
  const hit = 'btn mt-4 w-full min-h-[48px] text-base';
  return (
    <section id="choose-path" aria-labelledby="choose-h" className="space-y-3">
      <h2 id="choose-h" className="text-2xl sm:text-3xl">{heading.en}<Bn>{heading.bn}</Bn></h2>
      <ul className="grid gap-3 lg:grid-cols-1">
        <li className={`${card} border-leaf ring-2 ring-leaf/30`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">Best for most people</p>
          <h3 className="mt-1 text-xl font-semibold">{build.title}<Bn>{build.bn}</Bn></h3>
          <p className="mt-2 text-base text-muted">{build.micro}</p>
          <Link href={build.href} onClick={() => track('abroad_cta_click', { kind, where: `${where}_card_build` })} className={`${hit} btn-primary`}>{build.cta}</Link>
          {build.alt && <Link href={build.alt.href} onClick={() => track('abroad_cta_click', { kind, where: `${where}_card_build_alt` })} className="mt-2 inline-flex min-h-[44px] items-center text-base font-semibold text-leaf hover:underline">{build.alt.label}</Link>}
        </li>
        <li className={`${card} border-line`}>
          <h3 className="text-xl font-semibold">{word.title}<Bn>{word.bn}</Bn></h3>
          <p className="mt-2 text-base text-muted">{word.micro}</p>
          {word.href.startsWith('#')
            ? <a href={word.href} className={`${hit} btn-quiet`}>{word.cta}</a>
            : <Link href={word.href} onClick={() => track('abroad_cta_click', { kind, where: `${where}_card_word` })} className={`${hit} btn-quiet`}>{word.cta}</Link>}
        </li>
        <li className={`${card} border-line`}>
          <h3 className="text-xl font-semibold">{expert.title}<Bn>{expert.bn}</Bn></h3>
          <p className="mt-2 text-base text-muted">{expert.micro}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href={expert.href} onClick={() => track('abroad_cta_click', { kind, where: `${where}_card_expert` })} className="btn btn-quiet min-h-[48px] text-base">{expert.cta}</Link>
            <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: `${kind}_${where}` })} className="btn btn-quiet min-h-[48px] text-base">Ask on WhatsApp</a>
          </div>
        </li>
      </ul>
    </section>
  );
}

export function BuildButton({ href, kind, where, label = 'Build free' }: { href: string; kind: string; where: string; label?: string }) {
  return <Link href={href} onClick={() => track('abroad_cta_click', { kind, where })} className="btn btn-primary">{label}</Link>;
}
