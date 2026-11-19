import { useEffect, useState } from 'react';
import { Link } from '../../lib/router';
import { track } from '../../lib/track';

/** Mobile-only action bar after the hero. Sits right of the bottom-left "Message us" button and hides at the page end so the footer stays clear. */
export function StickyBar({ heroId, primary, secondary, kind }: { heroId: string; primary: { label?: string; href: string }; secondary: { label: string; href: string }; kind: string }) {
  const [pastHero, setPast] = useState(false);
  const [atEnd, setEnd] = useState(false);
  useEffect(() => {
    const hero = document.getElementById(heroId);
    const end = document.querySelector('[data-page-end]');
    const check = () => {
      setPast(!!hero && hero.getBoundingClientRect().bottom < 0);
      setEnd(!!end && end.getBoundingClientRect().top < window.innerHeight);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [heroId]);
  if (!pastHero || atEnd) return null;
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-line bg-white/95 py-2 pl-[8.75rem] pr-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
      <Link href={primary.href} onClick={() => track('abroad_cta_click', { kind, where: 'sticky' })} className="btn btn-primary min-h-[44px] flex-1 !px-2 text-base">{primary.label ?? 'Build free'}</Link>
      {secondary.href.startsWith('#')
        ? <a href={secondary.href} className="btn btn-quiet min-h-[44px] flex-1 whitespace-nowrap !px-2 bg-white text-[0.95rem]">{secondary.label}</a>
        : <Link href={secondary.href} className="btn btn-quiet min-h-[44px] flex-1 whitespace-nowrap !px-2 bg-white text-[0.95rem]">{secondary.label}</Link>}
    </div>
  );
}
