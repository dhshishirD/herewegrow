// Client for the Builder's AI assistant (server: server/ai). Pro only.

export type AiAction = 'rewrite-bullet' | 'write-summary' | 'improve-english' | 'tailor-to-job' | 'ats-score';
export interface AiResult {
  text?: string;
  items?: string[];
  keywords?: string[];
}
export type AiError = 'login' | 'pro' | 'quota' | 'bad' | 'ai' | 'config' | 'network';

export async function runAi(
  action: AiAction,
  body: Record<string, unknown>,
  lang: string,
): Promise<{ ok: true; result: AiResult; left: number } | { ok: false; error: AiError }> {
  try {
    const r = await fetch(`/api/ai/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, lang }) });
    const d = (await r.json().catch(() => ({}))) as { ok?: boolean; result?: AiResult; left?: number; error?: AiError };
    if (d.ok && d.result) return { ok: true, result: d.result, left: d.left ?? 0 };
    return { ok: false, error: d.error ?? 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export const AI_ERRORS: Record<AiError, { en: string; bn: string }> = {
  login: { en: 'Please log in to use AI.', bn: 'এআই ব্যবহার করতে লগইন করুন।' },
  pro: { en: 'AI writing help is part of Pro.', bn: 'এআই লেখার সাহায্য প্রো-এর অংশ।' },
  quota: { en: 'You have used today’s AI actions. They reset at midnight.', bn: 'আজকের এআই কাজ শেষ। মধ্যরাতে আবার পাবেন।' },
  bad: { en: 'Write a little more first, then try again.', bn: 'আগে আরেকটু লিখুন, তারপর আবার চেষ্টা করুন।' },
  ai: { en: 'The AI could not answer. Try again; this one was not counted.', bn: 'এআই উত্তর দিতে পারেনি। আবার চেষ্টা করুন; এটি গণনায় ধরা হয়নি।' },
  config: { en: 'AI is not available right now.', bn: 'এআই এখন চালু নেই।' },
  network: { en: 'Could not reach the server. Check your internet.', bn: 'সার্ভারে যাওয়া যায়নি। ইন্টারনেট দেখুন।' },
};
