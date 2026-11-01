import { useLang } from '../lib/lang';

/**
 * The hero image: a CV page with an expert's margin notes beside it.
 * Drawn in HTML so the notes switch language with the page.
 */
function Line({ w, strong }: { w: string; strong?: boolean }) {
  return <div className={`h-[7px] rounded-full ${strong ? 'bg-ink/70' : 'bg-ink/12'}`} style={{ width: w }} />;
}

export function ReviewedCv() {
  const { t } = useLang();

  return (
    <figure className="relative mx-auto w-full max-w-[30rem] select-none" aria-label={t({ en: 'A CV with an expert’s notes', bn: 'বিশেষজ্ঞের নোটসহ একটি সিভি' })}>
      {/* The page */}
      <div className="relative ml-auto w-[70%] rounded-[3px] bg-white p-6 shadow-[0_1px_0_#dbe3dd,0_24px_48px_-24px_rgb(21_36_29/0.35)] ring-1 ring-line">
        <div className="h-3 w-32 rounded bg-ink" />
        <div className="mt-2 h-2 w-44 rounded bg-ink/25" />

        <div className="mt-6 h-2.5 w-20 rounded bg-leaf" />
        <div className="mt-3 space-y-2">
          <Line w="100%" /><Line w="92%" /><Line w="64%" />
        </div>

        <div className="mt-6 h-2.5 w-24 rounded bg-leaf" />
        <div className="mt-3 space-y-2">
          <Line w="58%" strong />
          <div className="relative">
            <Line w="96%" />
            {/* the line the reviewer marked */}
            <span className="absolute -inset-x-1 -inset-y-1 rounded border-2 border-gold/80" />
          </div>
          <Line w="88%" /><Line w="71%" />
        </div>

        <div className="mt-6 h-2.5 w-16 rounded bg-leaf" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['32%', '22%', '28%', '18%', '26%'].map((w, i) => (
            <span key={i} className="h-4 rounded-full bg-leaf-soft" style={{ width: w }} />
          ))}
        </div>

        <div className="mt-6 h-2.5 w-20 rounded bg-leaf" />
        <div className="mt-3 space-y-2">
          <Line w="66%" strong /><Line w="80%" />
        </div>
      </div>

      {/* Margin notes */}
      <figcaption className="pointer-events-none">
        <p className="pen-note absolute left-0 top-[34%] w-[27%] text-[0.85rem] sm:text-[0.95rem]">
          {t({ en: 'Add a number: “cut costs by 18%”', bn: 'সংখ্যা দিন: “খরচ ১৮% কমিয়েছি”' })}
          <svg aria-hidden="true" viewBox="0 0 80 24" className="mt-1 h-5 w-16 text-gold"><path d="M2 6 C 30 4, 55 8, 74 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M66 18 l9 1 -4 -8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </p>
        <p className="pen-note absolute left-0 top-[66%] w-[27%] text-[0.85rem] sm:text-[0.95rem]">
          {t({ en: 'Skills match the circular', bn: 'স্কিল বিজ্ঞপ্তির সাথে মিলেছে' })} ✓
        </p>
      </figcaption>

      {/* Score stamp */}
      <div className="absolute -top-4 right-[-0.5rem] sm:right-[-1.25rem] rotate-[-6deg] rounded-xl border-[2.5px] border-leaf bg-white px-3.5 py-2 text-center shadow-sm">
        <p className="font-display text-[0.8rem] font-semibold leading-none text-leaf">ATS</p>
        <p className="font-display text-3xl font-bold leading-none text-leaf">86</p>
      </div>
    </figure>
  );
}
