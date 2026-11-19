import { useEffect } from 'react';
import { PageHead } from '../components/PageHead';
import { BlockView, FaqView, Foot, LINK } from '../components/seo/Blocks';
import { BuildButton, ChoiceCards } from '../components/seo/Choices';
import { OwnPreview, TemplateImage } from '../components/seo/Previews';
import { HelperQuiz, HowStrip } from '../components/seo/Quiz';
import { StickyBar } from '../components/seo/StickyBar';
import {
  CHOICES_HEADING, EUROPASS_PREVIEW, EUROPASS_WHATSAPP_HREF, HOW_HEADING, HOW_LABELS, PILLAR_FOLDED, QUIZ, QUIZ_HEADING, QUIZ_INTRO, WORD_FOLDED, europassChoices, quizResult,
  EUROPASS_AUTHOR, EUROPASS_BUILDER_HREF, EUROPASS_CHECKED, EUROPASS_HUB_PATH, EUROPASS_PILLAR_PATH, EUROPASS_PRICES, EUROPASS_PRIVACY,
  EUROPASS_SEO, EUROPASS_SOURCES, EUROPASS_UNOFFICIAL, EUROPASS_UPDATED, EUROPASS_WORD_PATH, HUB_CHOOSE, HUB_FAQ, HUB_INTRO,
  PILLAR_ANSWER, PILLAR_BLOCKS, PILLAR_FAQ, PILLAR_INTRO, WORD_ANSWER, WORD_BLOCKS, WORD_FAQ, europassHubTemplates, imageAlt,
  type HubTemplate,
} from '../../shared/europassPages';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';

const A = LINK;
const KIND = 'europass';
const FAQ_HEADING = 'Questions about the Europass-style CV';
const crumbsFor = (path: string) =>
  path === EUROPASS_PILLAR_PATH ? []
  : path === EUROPASS_HUB_PATH ? [{ href: '/templates', label: { en: 'Templates', bn: 'টেমপ্লেট' } }]
  : [{ href: EUROPASS_PILLAR_PATH, label: { en: 'Europass CV', bn: 'ইউরোপাস সিভি' } }];

const Foot_ = ({ sources }: { sources?: boolean }) => (
  <Foot sources={sources ? EUROPASS_SOURCES : undefined} updated={EUROPASS_UPDATED} checked={EUROPASS_CHECKED} author={EUROPASS_AUTHOR} lines={[EUROPASS_PRIVACY, EUROPASS_UNOFFICIAL]} />
);

const Cards = ({ wordHref, where }: { wordHref: string; where: string }) => (
  <ChoiceCards choices={europassChoices(wordHref)} heading={CHOICES_HEADING} kind={KIND} where={where} whatsappHref={EUROPASS_WHATSAPP_HREF} />
);

function Preview({ t, eager, full }: { t: HubTemplate; eager?: boolean; full?: boolean }) {
  return <TemplateImage src={full ? t.full : t.thumb} w={full ? t.fullW : t.w} h={full ? t.fullH : t.h} alt={imageAlt(t)} eager={eager} />;
}

const Sticky = ({ secondary }: { secondary: { label: string; href: string } }) => (
  <StickyBar heroId="hero-choices" primary={{ href: EUROPASS_BUILDER_HREF }} secondary={secondary} kind={KIND} />
);

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
            <div id="hero-choices"><Cards wordHref={EUROPASS_WORD_PATH} where="hero" /></div>
            {PILLAR_INTRO.map((x) => <p key={x} className="text-base leading-relaxed">{x}</p>)}
          </div>
          <OwnPreview p={EUROPASS_PREVIEW} eager />
        </div>
        <HowStrip b={how} heading={HOW_HEADING} labels={HOW_LABELS} />
        <HelperQuiz id="do-i-need" heading={QUIZ_HEADING} intro={QUIZ_INTRO} questions={QUIZ} resolve={quizResult} />
        {PILLAR_BLOCKS.map((b) => <BlockView key={b.id} b={b} folded={PILLAR_FOLDED} skip="how" />)}
        <section className="max-w-3xl space-y-3">
          <BuildButton href={EUROPASS_BUILDER_HREF} kind={KIND} where="after_how" />
          <p className="leading-loose"><Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href={EUROPASS_HUB_PATH} className={A}>All Europass-style templates</Link> · <Link href={EUROPASS_WORD_PATH} className={A}>Word template</Link> · <Link href="/services" className={A}>CV writing service</Link> · <Link href="/pro" className={A}>Pro</Link></p>
        </section>
        <FaqView items={PILLAR_FAQ} heading={FAQ_HEADING} />
        <Foot_ sources />
      </div>
      <Sticky secondary={{ label: 'Word template', href: EUROPASS_WORD_PATH }} />
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
        <div id="hero-choices" className="max-w-3xl"><Cards wordHref="#templates" where="hub" /></div>
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
        <FaqView items={HUB_FAQ} heading={FAQ_HEADING} />
        <p className="max-w-3xl"><Link href="/templates" className={A}>All CV templates</Link> · <Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href="/pro" className={A}>Pro</Link></p>
        <Foot_ />
      </div>
      <Sticky secondary={{ label: 'Templates', href: '#templates' }} />
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
        <div id="hero-choices" className="max-w-3xl"><Cards wordHref="#templates" where="word" /></div>
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
        <FaqView items={WORD_FAQ} heading={FAQ_HEADING} />
        <p className="max-w-3xl"><Link href="/templates" className={A}>All CV templates</Link> · <Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href="/pro" className={A}>Pro</Link></p>
        <Foot_ />
      </div>
      <Sticky secondary={{ label: 'Templates', href: '#templates' }} />
    </>
  );
}
