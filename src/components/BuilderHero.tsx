import { useLang } from '../lib/lang';

// Hero animation for the CV builder: a form fills in, a CV builds itself beside it, the design changes,
// then "PDF ready". Pure CSS (see "Builder hero" in index.css): no images, no video, no script,
// so it adds a few hundred bytes and never slows the page. Without motion it shows the finished state.

const STEPS = [
  { en: 'Fill the form', bn: 'ফর্ম ফিলআপ' },
  { en: 'Pick a design', bn: 'ডিজাইন পছন্দ' },
  { en: 'Download CV', bn: 'সিভি ডাউনলোড' },
];

export function BuilderHero() {
  const { t } = useLang();
  return (
    <figure
      className="bh mx-auto w-full max-w-[30rem]"
      aria-label={t({ en: 'A CV builds itself as the form is filled in', bn: 'ফর্ম পূরণ করার সাথে সাথে সিভি তৈরি হচ্ছে' })}
    >
      <ol className="bh-steps flex gap-2 text-[0.8rem] font-semibold sm:text-sm" aria-hidden="true">
        {STEPS.map((s, i) => (
          <li key={s.en} className={`bh-step bh-step-${i + 1} flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-center`}>
            <span className="bh-num grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem]">{i + 1}</span>
            {t(s)}
          </li>
        ))}
      </ol>

      <div className="bh-stage relative mt-3 grid grid-cols-[0.8fr_1fr] gap-3 rounded-2xl bg-white p-3 shadow-[0_30px_60px_-24px_rgb(11_31_63/0.35)] ring-1 ring-line sm:gap-4 sm:p-4" aria-hidden="true">
        {/* Form: three fields fill in one after another */}
        <div className="flex flex-col gap-3 rounded-xl bg-leaf-soft/60 p-3">
          {['Name', 'Job title', 'Skills'].map((label, i) => (
            <div key={label}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">{label}</p>
              <div className="mt-1 h-6 overflow-hidden rounded-md bg-white ring-1 ring-line">
                <div className={`bh-fill bh-fill-${i + 1} h-full origin-left bg-leaf/25`} />
              </div>
            </div>
          ))}
          <div className="bh-design mt-auto flex items-center gap-1.5">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">Design</span>
            <span className="bh-dot bh-dot-1 h-3.5 w-3.5 rounded-full" />
            <span className="bh-dot bh-dot-2 h-3.5 w-3.5 rounded-full" />
            <span className="bh-dot bh-dot-3 h-3.5 w-3.5 rounded-full" />
          </div>
        </div>

        {/* The CV: sidebar and lines appear as each field is filled; the sidebar changes colour at the design step */}
        <div className="bh-cv relative aspect-[1/1.3] overflow-hidden rounded-md bg-white shadow-md ring-1 ring-line">
          <div className="bh-side absolute inset-y-0 left-0 w-[32%]" />
          <div className="absolute inset-y-0 left-[32%] right-0 p-[7%]">
            <div className="bh-l1 h-[7%] w-3/4 rounded-sm bg-ink/80" />
            <div className="bh-l2 mt-[4%] h-[4%] w-1/2 rounded-sm bg-leaf/70" />
            <div className="bh-l3 mt-[9%] space-y-[5%]">
              <div className="h-[3%] min-h-[3px] w-full rounded-sm bg-muted/35" />
              <div className="h-[3%] min-h-[3px] w-5/6 rounded-sm bg-muted/35" />
              <div className="h-[3%] min-h-[3px] w-4/6 rounded-sm bg-muted/35" />
            </div>
            <div className="bh-l4 mt-[9%] space-y-[5%]">
              <div className="h-[3%] min-h-[3px] w-full rounded-sm bg-muted/35" />
              <div className="h-[3%] min-h-[3px] w-3/4 rounded-sm bg-muted/35" />
            </div>
          </div>
          <div className="bh-side-lines absolute left-[4%] top-[10%] w-[24%] space-y-[10%]">
            <div className="h-[2.5%] min-h-[3px] rounded-sm bg-white/70" />
            <div className="h-[2.5%] min-h-[3px] w-4/5 rounded-sm bg-white/70" />
            <div className="h-[2.5%] min-h-[3px] w-3/5 rounded-sm bg-white/70" />
          </div>
        </div>

        <div className="bh-ready absolute -bottom-3 right-4 flex items-center gap-2 rounded-lg border-[3px] border-saffron bg-paper px-3.5 py-1.5 shadow-md">
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-gold" aria-hidden="true"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="font-display text-sm font-bold text-gold">{t({ en: 'CV ready · PDF', bn: 'সিভি রেডি · PDF' })}</span>
        </div>
      </div>
    </figure>
  );
}
