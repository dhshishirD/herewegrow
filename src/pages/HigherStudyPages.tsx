import { useEffect } from 'react';
import { PageHead } from '../components/PageHead';
import { BlockView, FaqView, Foot, LINK } from '../components/seo/Blocks';
import { BuildButton, ChoiceCards } from '../components/seo/Choices';
import { OwnPreview, TemplateImage } from '../components/seo/Previews';
import { HelperQuiz, HowStrip } from '../components/seo/Quiz';
import { StickyBar } from '../components/seo/StickyBar';
import {
  ACADEMIC_BUILDER_HREF, ACADEMIC_PATH, ACADEMIC_PREVIEW, BN_KEYWORD, CHOICES_HEADING, HOW_HEADING, HOW_LABELS, HOW_STEP_ID, HS_AUTHOR, HS_CHECKED, HS_CONTENT, HS_NOTE, HS_PRICES,
  HS_PRIVACY, HS_UPDATED, HS_WHATSAPP_HREF, HUB_PATH, HUB_PICKS, HUB_PICKS_HEADING, HUB_PREVIEWS, HUB_TOOLS, HUB_TOOLS_HEADING, SCHOLARSHIP_BN_LINE, SCHOLARSHIP_BUILDER_HREF,
  SCHOLARSHIP_PATH, SCHOLARSHIP_PREVIEW, SCHOLARSHIP_QUIZ, SCHOLARSHIP_QUIZ_HEADING, SCHOLARSHIP_QUIZ_INTRO, WORD_SECTION, higherStudyChoices, higherStudyTemplates,
  scholarshipQuizResult, templateAlt, type HsPath,
} from '../../shared/higherStudyPages';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';

const A = LINK;
const KIND = 'higher_study';
const HUB_CRUMB = { href: HUB_PATH, label: { en: 'Higher study CV', bn: 'উচ্চশিক্ষার সিভি' } };

function useSeo(path: HsPath) {
  const s = HS_CONTENT[path].seo;
  useEffect(() => setPageMeta(s.title, s.description, path), [s, path]);
  return s;
}

const Cards = ({ page, where }: { page: HsPath; where: string }) => (
  <ChoiceCards choices={higherStudyChoices(page)} heading={CHOICES_HEADING} kind={KIND} where={where} whatsappHref={HS_WHATSAPP_HREF} />
);

const Foot_ = ({ path }: { path: HsPath }) => (
  <Foot sources={HS_CONTENT[path].sources} updated={HS_UPDATED} checked={HS_CHECKED} author={HS_AUTHOR} lines={[HS_PRIVACY, HS_NOTE]} />
);

const Sticky = ({ page }: { page: HsPath }) => (
  <StickyBar heroId="hero-choices" primary={{ href: higherStudyChoices(page)[0].href }} secondary={{ label: 'Word templates', href: `#${WORD_SECTION.id}` }} kind={KIND} />
);

function WordTemplates({ bn }: { bn: string }) {
  const tpls = higherStudyTemplates();
  return (
    <section id={WORD_SECTION.id} className="max-w-5xl scroll-mt-24">
      <h2 className="text-2xl sm:text-3xl">{WORD_SECTION.h2}<span lang="bn" className="mt-0.5 block text-[0.95rem] font-normal leading-snug text-muted">{WORD_SECTION.bn}</span></h2>
      <p className="mt-3 max-w-3xl text-base">{WORD_SECTION.intro}</p>
      <ul className="mt-5 grid gap-6 sm:grid-cols-3">
        {tpls.map((t) => (
          <li key={t.id} className="space-y-3">
            <Link href={t.path}><TemplateImage src={t.thumb} w={t.w} h={t.h} alt={templateAlt(t, bn)} /></Link>
            <div>
              <h3 className="font-semibold"><Link href={t.path} className="hover:text-leaf">{t.name}</Link></h3>
              <p className="text-sm text-muted">{t.note} Word template {HS_PRICES.single}.</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GuidePage({ path, builderHref, preview, crumbs }: { path: typeof ACADEMIC_PATH | typeof SCHOLARSHIP_PATH; builderHref: string; preview: typeof ACADEMIC_PREVIEW; crumbs: Parameters<typeof PageHead>[0]['crumbs'] }) {
  const s = useSeo(path);
  const c = HS_CONTENT[path];
  const how = c.blocks.find((b) => b.id === HOW_STEP_ID)!;
  const scholarship = path === SCHOLARSHIP_PATH;
  const otherPath = scholarship ? ACADEMIC_PATH : SCHOLARSHIP_PATH;
  return (
    <>
      <PageHead
        crumbs={crumbs}
        title={s.h1}
        intro={<>
          {scholarship && <p lang="bn" className="mb-2 text-xl font-semibold text-ink">{SCHOLARSHIP_BN_LINE}</p>}
          <p className="text-base font-medium text-ink sm:text-lg">{c.answer}</p>
          <p className="mt-4 flex flex-wrap gap-2">
            <BuildButton href={builderHref} kind={KIND} where="hero_top" label="Build free now" />
            <a href="#choose-path" className="btn btn-quiet min-h-[48px] bg-white">Other options</a>
          </p>
        </>}
      />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="max-w-3xl space-y-6">
            <div id="hero-choices"><Cards page={path} where="hero" /></div>
            {c.intro.map((x) => <p key={x} className="text-base leading-relaxed">{x}</p>)}
          </div>
          <OwnPreview p={preview} eager />
        </div>
        <HowStrip b={how} heading={HOW_HEADING} labels={HOW_LABELS} />
        {scholarship && <HelperQuiz id="which-format" heading={SCHOLARSHIP_QUIZ_HEADING} intro={SCHOLARSHIP_QUIZ_INTRO} questions={SCHOLARSHIP_QUIZ} resolve={scholarshipQuizResult} />}
        <WordTemplates bn={BN_KEYWORD[path]} />
        {c.blocks.map((b) => <BlockView key={b.id} b={b} folded={c.folded} skip={HOW_STEP_ID} />)}
        <section className="max-w-3xl space-y-3">
          <BuildButton href={builderHref} kind={KIND} where="after_content" />
          <p className="leading-loose">
            <Link href={HUB_PATH} className={A}>Higher study CV: which one do I need?</Link> · <Link href={otherPath} className={A}>{scholarship ? 'Academic CV format' : 'Scholarship CV format'}</Link> · <Link href="/tools/cv-checker" className={A}>Free CV checker</Link> · <Link href="/services" className={A}>Academic CV and SOP services</Link> · <Link href="/templates" className={A}>All CV templates</Link> · <Link href="/pro" className={A}>Pro</Link>
          </p>
        </section>
        <FaqView items={c.faq} heading={c.faqHeading} />
        <Foot_ path={path} />
      </div>
      <Sticky page={path} />
    </>
  );
}

export const AcademicCvPage = () => <GuidePage path={ACADEMIC_PATH} builderHref={ACADEMIC_BUILDER_HREF} preview={ACADEMIC_PREVIEW} crumbs={[HUB_CRUMB]} />;
export const ScholarshipCvPage = () => <GuidePage path={SCHOLARSHIP_PATH} builderHref={SCHOLARSHIP_BUILDER_HREF} preview={SCHOLARSHIP_PREVIEW} crumbs={[HUB_CRUMB]} />;

export function HigherStudyHubPage() {
  const s = useSeo(HUB_PATH);
  const c = HS_CONTENT[HUB_PATH];
  return (
    <>
      <PageHead crumbs={[]} title={s.h1} intro={<>
        <p className="text-base font-medium text-ink sm:text-lg">{c.answer}</p>
        <p className="mt-4 flex flex-wrap gap-2">
          <BuildButton href={SCHOLARSHIP_BUILDER_HREF} kind={KIND} where="hero_top" label="Build free now" />
          <a href="#choose-path" className="btn btn-quiet min-h-[48px] bg-white">Other options</a>
        </p>
      </>} />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_28rem]">
          <div className="max-w-3xl space-y-6">
            <div id="hero-choices"><Cards page={HUB_PATH} where="hero" /></div>
            {c.intro.map((x) => <p key={x} className="text-base leading-relaxed">{x}</p>)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {HUB_PREVIEWS.map((p, i) => (
              <Link key={p.src} href={i === 0 ? SCHOLARSHIP_PATH : ACADEMIC_PATH} className="block"><OwnPreview p={p} thumb eager={i === 0} /></Link>
            ))}
          </div>
        </div>
        <section id="which-cv" className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">{HUB_PICKS_HEADING}</h2>
          <ul className="mt-4 space-y-3">
            {HUB_PICKS.map((p) => (
              <li key={p.situation} className="rounded-xl border border-line bg-white p-4">
                <p className="text-base">{p.situation}</p>
                <p className="mt-1"><Link href={p.href} className={`${A} inline-flex min-h-[44px] items-center`}>{p.label}</Link></p>
                <p className="text-base text-muted">{p.note}</p>
              </li>
            ))}
          </ul>
        </section>
        <section id="tools" className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">{HUB_TOOLS_HEADING}</h2>
          <ul className="mt-4 space-y-3">
            {HUB_TOOLS.map((t) => (
              <li key={t.label}><Link href={t.href} className={`${A} inline-flex min-h-[44px] items-center`}>{t.label}</Link><p className="text-base text-muted">{t.note}</p></li>
            ))}
          </ul>
        </section>
        <WordTemplates bn={BN_KEYWORD[HUB_PATH]} />
        {c.blocks.map((b) => <BlockView key={b.id} b={b} folded={c.folded} />)}
        <FaqView items={c.faq} heading={c.faqHeading} />
        <p className="max-w-3xl leading-loose"><Link href={SCHOLARSHIP_PATH} className={A}>Scholarship CV</Link> · <Link href={ACADEMIC_PATH} className={A}>Academic CV</Link> · <Link href="/templates" className={A}>All CV templates</Link> · <Link href="/pro" className={A}>Pro</Link></p>
        <Foot_ path={HUB_PATH} />
      </div>
      <Sticky page={HUB_PATH} />
    </>
  );
}
