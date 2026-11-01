import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { num, useLang } from '../lib/lang';
import { setPageMeta } from '../lib/seo';

type PresetId = 'photo' | 'signature' | 'custom';

interface Spec {
  w: number;
  h: number;
  kb: number;
}

const PRESETS: Record<Exclude<PresetId, 'custom'>, Spec> = {
  photo: { w: 300, h: 300, kb: 100 },
  signature: { w: 300, h: 80, kb: 60 },
};

interface Result {
  url: string;
  bytes: number;
  name: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function PhotoResizer() {
  const { t, lang } = useLang();
  const [preset, setPreset] = useState<PresetId>('photo');
  const [custom, setCustom] = useState<Spec>({ w: 300, h: 300, kb: 100 });
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [whiten, setWhiten] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const spec: Spec = preset === 'custom' ? custom : PRESETS[preset];

  useEffect(() => {
    const title = t({ en: 'Photo and signature resizer for govt job forms', bn: 'সরকারি চাকরির ফর্মের জন্য ছবি ও স্বাক্ষর রিসাইজার' });
    const desc = t({
      en: 'Free tool: resize your photo to 300×300 under 100 KB and signature to 300×80 under 60 KB for Teletalk government job applications.',
      bn: 'ফ্রি টুল: টেলিটক সরকারি চাকরির আবেদনের জন্য ছবি ৩০০×৩০০ (১০০ KB-এর কম) ও স্বাক্ষর ৩০০×৮০ (৬০ KB-এর কম) করুন।',
    });
    setPageMeta(title, desc, '/tools/photo-signature-resizer');
  }, [t]);

  // Signatures usually need the white-background clean-up
  useEffect(() => {
    setWhiten(preset === 'signature');
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [preset]);

  const draw = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = spec.w;
      canvas.height = spec.h;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, spec.w, spec.h);
      if (!img) return;
      const base = Math.max(spec.w / img.naturalWidth, spec.h / img.naturalHeight);
      const s = base * zoom;
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      const x = (spec.w - dw) / 2 + offset.x * spec.w;
      const y = (spec.h - dh) / 2 + offset.y * spec.h;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, dw, dh);
      if (whiten) {
        const data = ctx.getImageData(0, 0, spec.w, spec.h);
        const p = data.data;
        for (let i = 0; i < p.length; i += 4) {
          const lum = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
          if (lum > 165) {
            p[i] = p[i + 1] = p[i + 2] = 255;
          } else {
            // deepen the ink a little so the signature stays crisp
            p[i] *= 0.7;
            p[i + 1] *= 0.7;
            p[i + 2] *= 0.7;
          }
        }
        ctx.putImageData(data, 0, 0);
      }
    },
    [img, spec.w, spec.h, zoom, offset, whiten],
  );

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current);
    setResult((r) => {
      if (r) URL.revokeObjectURL(r.url);
      return null;
    });
  }, [draw]);

  const limits = () => {
    if (!img) return { mx: 0, my: 0 };
    const base = Math.max(spec.w / img.naturalWidth, spec.h / img.naturalHeight) * zoom;
    return {
      mx: Math.max(0, (img.naturalWidth * base - spec.w) / 2 / spec.w),
      my: Math.max(0, (img.naturalHeight * base - spec.h) / 2 / spec.h),
    };
  };

  useEffect(() => {
    const { mx, my } = limits();
    setOffset((o) => ({ x: clamp(o.x, -mx, mx), y: clamp(o.y, -my, my) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, img, spec.w, spec.h]);

  const onFile = (file?: File) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t({ en: 'Choose a photo file (JPG or PNG).', bn: 'একটি ছবি ফাইল বেছে নিন (JPG বা PNG)।' }));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    image.onerror = () => setError(t({ en: 'This image could not be opened. Try a JPG or PNG.', bn: 'ছবিটি খোলা যায়নি। JPG বা PNG চেষ্টা করুন।' }));
    image.src = url;
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!img) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const { mx, my } = limits();
    setOffset({
      x: clamp(drag.current.ox + (e.clientX - drag.current.x) / rect.width, -mx, mx),
      y: clamp(drag.current.oy + (e.clientY - drag.current.y) / rect.height, -my, my),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const exportJpeg = async () => {
    const canvas = document.createElement('canvas');
    draw(canvas);
    const limit = spec.kb * 1024;
    const toBlob = (q: number) => new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', q));

    // Highest quality that fits under the limit (binary search)
    let lo = 0.2;
    let hi = 0.95;
    let best: Blob | null = null;
    const first = await toBlob(hi);
    if (first && first.size <= limit) best = first;
    else {
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        const b = await toBlob(mid);
        if (b && b.size <= limit) {
          best = b;
          lo = mid;
        } else hi = mid;
      }
    }
    if (!best) {
      setError(t({ en: 'Could not get under the size limit. Try a larger KB limit.', bn: 'নির্ধারিত সাইজের নিচে আনা যায়নি। KB সীমা একটু বাড়িয়ে চেষ্টা করুন।' }));
      return;
    }
    if (result) URL.revokeObjectURL(result.url);
    setResult({ url: URL.createObjectURL(best), bytes: best.size, name: `${preset === 'signature' ? 'signature' : 'photo'}-${spec.w}x${spec.h}.jpg` });
  };

  const presetButton = (id: PresetId, label: { en: string; bn: string }, sub: string) => (
    <button
      type="button"
      onClick={() => setPreset(id)}
      aria-pressed={preset === id}
      className={`rounded-xl border-2 px-4 py-3 text-left transition-colors ${preset === id ? 'border-leaf bg-leaf-soft' : 'border-line hover:border-leaf/50'}`}
    >
      <span className="block font-display font-semibold">{t(label)}</span>
      <span className="block text-sm text-muted">{sub}</span>
    </button>
  );

  return (
    <>
      <div className="bg-mist">
        <div className="wrap py-12">
          <h1 className="text-4xl font-bold sm:text-5xl">{t({ en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' })}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            {t({
              en: 'Most government job forms on Teletalk ask for a colour photo of 300×300 pixels under 100 KB and a signature of 300×80 pixels under 60 KB. This tool makes both, free. Your photo never leaves your device.',
              bn: 'টেলিটকের বেশিরভাগ সরকারি চাকরির ফর্মে ৩০০×৩০০ পিক্সেলের রঙিন ছবি (১০০ KB-এর কম) ও ৩০০×৮০ পিক্সেলের স্বাক্ষর (৬০ KB-এর কম) চাওয়া হয়। এই টুল দুটোই বিনামূল্যে বানায়। আপনার ছবি আপনার ডিভাইসের বাইরে যায় না।',
            })}
          </p>
        </div>
      </div>

      <section className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div>
            <p className="label">{t({ en: '1. What are you making?', bn: '১. কী বানাবেন?' })}</p>
            <div className="grid grid-cols-3 gap-3">
              {presetButton('photo', { en: 'Photo', bn: 'ছবি' }, num('300×300 · 100 KB', lang))}
              {presetButton('signature', { en: 'Signature', bn: 'স্বাক্ষর' }, num('300×80 · 60 KB', lang))}
              {presetButton('custom', { en: 'Other size', bn: 'অন্য মাপ' }, t({ en: 'Set your own', bn: 'নিজে দিন' }))}
            </div>
            {preset === 'custom' && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {(['w', 'h', 'kb'] as const).map((k) => (
                  <div key={k}>
                    <label className="label text-sm" htmlFor={`spec-${k}`}>
                      {k === 'w' ? t({ en: 'Width (px)', bn: 'প্রস্থ (px)' }) : k === 'h' ? t({ en: 'Height (px)', bn: 'উচ্চতা (px)' }) : t({ en: 'Max size (KB)', bn: 'সর্বোচ্চ (KB)' })}
                    </label>
                    <input
                      id={`spec-${k}`}
                      type="number"
                      min={k === 'kb' ? 5 : 20}
                      max={k === 'kb' ? 2000 : 2000}
                      value={custom[k]}
                      onChange={(e) => setCustom({ ...custom, [k]: clamp(Number(e.target.value) || 0, k === 'kb' ? 5 : 20, 2000) })}
                      className="field"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label" htmlFor="photo-file">{t({ en: '2. Choose your image', bn: '২. ছবি বেছে নিন' })}</label>
            <input id="photo-file" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])}
              className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-leaf file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-leaf-dark" />
            <p className="mt-2 text-sm text-muted">
              {preset === 'signature'
                ? t({ en: 'Sign on white paper with a black or blue pen, then take a clear photo in good light.', bn: 'সাদা কাগজে কালো বা নীল কলমে স্বাক্ষর করে ভালো আলোয় পরিষ্কার ছবি তুলুন।' })
                : t({ en: 'Use a recent photo with a plain light background, facing the camera.', bn: 'হালকা একরঙা ব্যাকগ্রাউন্ডে ক্যামেরার দিকে তাকানো সাম্প্রতিক ছবি ব্যবহার করুন।' })}
            </p>
          </div>

          {img && (
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="zoom">{t({ en: '3. Zoom and drag to frame it', bn: '৩. জুম করে ও টেনে ঠিক জায়গায় আনুন' })}</label>
                <input id="zoom" type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[#0f6b4c]" />
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={whiten} onChange={(e) => setWhiten(e.target.checked)} className="h-5 w-5 accent-[#0f6b4c]" />
                <span>{t({ en: 'Clean the background to pure white', bn: 'ব্যাকগ্রাউন্ড পরিষ্কার সাদা করুন' })}</span>
              </label>
              <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={exportJpeg}>
                {t({ en: 'Make my file', bn: 'ফাইল তৈরি করুন' })}
              </button>
            </div>
          )}

          {error && <p role="alert" className="rounded-lg bg-alert/10 px-4 py-3 text-alert">{error}</p>}
        </div>

        <div>
          <div className="rounded-2xl bg-mist p-5 sm:p-8">
            <p className="mb-3 text-sm text-muted">
              {t({ en: 'Preview at the final size', bn: 'চূড়ান্ত মাপে প্রিভিউ' })}: {num(`${spec.w}×${spec.h}`, lang)} px
            </p>
            <div className="mx-auto" style={{ maxWidth: spec.w >= spec.h ? '100%' : `${(spec.w / spec.h) * 100}%` }}>
              <canvas
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className={`block w-full touch-none bg-white ring-1 ring-line ${img ? 'cursor-grab active:cursor-grabbing' : ''}`}
                style={{ aspectRatio: `${spec.w} / ${spec.h}` }}
                aria-label={t({ en: 'Image preview. Drag to move the image.', bn: 'ছবির প্রিভিউ। সরাতে টেনে নিন।' })}
              />
            </div>
            {!img && <p className="mt-4 text-center text-muted">{t({ en: 'Your image will appear here.', bn: 'আপনার ছবি এখানে দেখাবে।' })}</p>}

            {result && (
              <div className="mt-6 rounded-xl bg-white p-5 ring-1 ring-line">
                <p className="font-display text-lg font-semibold text-leaf">
                  {t({ en: 'Ready', bn: 'তৈরি' })}: {num(`${spec.w}×${spec.h}`, lang)} px, {num((result.bytes / 1024).toFixed(1), lang)} KB
                </p>
                <p className="text-sm text-muted">
                  {t({ en: `Under the ${spec.kb} KB limit.`, bn: `${num(spec.kb, 'bn')} KB সীমার মধ্যে।` })}
                </p>
                <a href={result.url} download={result.name} className="btn btn-primary mt-4 w-full">
                  {t({ en: 'Download JPG', bn: 'JPG ডাউনলোড করুন' })}
                </a>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-muted">
            {t({
              en: 'Always check the size your circular asks for. A few forms use different limits; use “Other size” for those.',
              bn: 'বিজ্ঞপ্তিতে কোন মাপ চাওয়া হয়েছে তা অবশ্যই দেখে নিন। কিছু ফর্মে ভিন্ন সীমা থাকে; সেক্ষেত্রে “অন্য মাপ” ব্যবহার করুন।',
            })}
          </p>
        </div>
      </section>
    </>
  );
}
