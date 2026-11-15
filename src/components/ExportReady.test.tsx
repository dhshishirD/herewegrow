import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { findPlan } from '../../shared/plans';
import { taka } from '../lib/lang';
import { ExportReady } from './ExportReady';

const html = () => renderToString(<ExportReady onClose={() => {}} />);

describe('ExportReady sheet', () => {
  it('shows the Bangla title, the 7-day price from the plan, and both wallets', () => {
    const h = html();
    expect(h).toContain('আপনার CV তৈরি!');
    expect(h).toContain(taka(findPlan('pro-7')!.price, 'bn'));
    expect(h).toContain('বিকাশ');
    expect(h).toContain('নগদ');
  });
  it('carries the trust line and the pro-7 and WhatsApp links', () => {
    const h = html();
    expect(h).toContain('আমরা এজেন্ট নই; ভিসা বা চাকরি বিক্রি করি না');
    expect(h).toContain('/pro?plan=pro-7&amp;from=export');
    expect(h).toContain('https://wa.me/8801981505761');
  });
  it('never promises a job, visa or guarantee', () => {
    const h = html().replace('আমরা এজেন্ট নই; ভিসা বা চাকরি বিক্রি করি না', '');
    expect(h).not.toMatch(/job|visa|guarantee|চাকরি পাবেন|ভিসা পাবেন|গ্যারান্টি/i);
  });
});
