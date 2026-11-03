import { Bell, FileText, Image, KeyRound, Mail, MessageSquareText, PenLine, PhoneCall, PiggyBank, RefreshCw, ScanSearch, Sparkles, Target, type LucideIcon } from 'lucide-react';
import type { Bilingual } from '../../shared/catalog';
import { useLang } from '../lib/lang';

/** Picks an icon from the English wording, so catalog data needs no icon field. */
export function iconFor(text: string): LucideIcon {
  const s = text.toLowerCase();
  if (/save|৳/.test(s)) return PiggyBank;
  if (/change|round/.test(s)) return RefreshCw;
  if (/call/.test(s)) return PhoneCall;
  if (/cover letter|letter/.test(s)) return Mail;
  if (/ats|check|keyword|gap/.test(s)) return ScanSearch;
  if (/skill|target/.test(s)) return Target;
  if (/alert/.test(s)) return Bell;
  if (/banner|photo/.test(s)) return Image;
  if (/feedback/.test(s)) return MessageSquareText;
  if (/rewrit|written|headline|summary|objective/.test(s)) return PenLine;
  if (/word|pdf|cv|biodata|sop|file/.test(s)) return FileText;
  if (/password|account/.test(s)) return KeyRound;
  return Sparkles;
}

/** "What you get" list: icon chip, then the line. Used on every service listing. */
export function FeatureList({ items, tone = 'light', className = '' }: { items: Bilingual[]; tone?: 'light' | 'dark'; className?: string }) {
  const { t } = useLang();
  const dark = tone === 'dark';
  return (
    <ul className={`grid gap-3 ${className}`}>
      {items.map((line) => {
        const Icon = iconFor(line.en);
        return (
          <li key={line.en} className="flex items-start gap-3">
            <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${dark ? 'bg-white/10 text-saffron ring-1 ring-white/15' : 'bg-leaf-soft text-leaf ring-1 ring-leaf/10'}`}>
              <Icon size={16} strokeWidth={2.2} />
            </span>
            <span className={`pt-1 leading-snug ${dark ? 'text-white/90' : 'text-ink'}`}>{t(line)}</span>
          </li>
        );
      })}
    </ul>
  );
}
