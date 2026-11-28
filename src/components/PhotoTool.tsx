// The photo and signature resizer tool itself. Everything runs in the browser (canvas); nothing is uploaded.
// Used by the hub page (src/pages/PhotoResizer.tsx) and the passport photo page (src/pages/PassportPhotoMaker.tsx).

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { num, useLang } from '../lib/lang';
import {
  HEIC_MESSAGE,
  PRESETS,
  classifyFile,
  fitWithin,
  KB_MAX_SIDE,
  mmLabel,
  unreachableMessage,
  type PresetDef,
  type PresetGroup,
} from '../../shared/photoPresets';

export type PresetId = string;

interface Spec {
  w: number;
  h: number;
  kb: number | null;
  keepRatio: boolean;
}

interface Result {
  url: string;
  bytes: number;
  name: string;
  w: number;
  h: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const GROUPS: { id: PresetGroup; title: { en: string; bn: string } }[] = [
  { id: 'job', title: { en: 'Job application forms', bn: 'চাকরির আবেদনের ফর্ম' } },
  { id: 'print', title: { en: 'Common print sizes (300 DPI)', bn: 'প্রচলিত প্রিন্ট সাইজ (৩০০ DPI)' } },
  { id: 'kb', title: { en: 'Make the file smaller (keeps the shape)', bn: 'ফাইল ছোট করুন (আকৃতি একই থাকে)' } },
];

export function PhotoTool({ preset, onPreset }: { preset: PresetId; onPreset: (id: PresetId) => void }) {
  const { t, lang } = useLang();
  const [custom, setCustom] = useState({ w: 300, h: 300, kb: 100 });
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [whiten, setWhiten] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const def: PresetDef | undefined = PRESETS.find((p) => p.id === preset);
  const base: Spec = def ? { w: def.w, h: def.h, kb: def.kb, keepRatio: !!def.keepRatio } : { ...custom, keepRatio: false };
  // A keep-shape preset follows the picture: scaled down to a working size, never cropped.
  const keepSize = base.keepRatio ? (img ? fitWithin(img.naturalWidth, img.naturalHeight, KB_MAX_SIDE) : fitWithin(4, 3, KB_MAX_SIDE)) : null;
  const spec: Spec = keepSize ? { ...base, w: keepSize.w, h: keepSize.h } : base;

  // Signatures usually need the white-background clean-up
  useEffect(() => {
    setWhiten(preset === 'signature');
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [preset]);

  const draw = useCallback(
    (canvas: HTMLCanvasElement, scale = 1) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const cw = Math.max(1, Math.round(spec.w * scale));
      const ch = Math.max(1, Math.round(spec.h * scale));
      canvas.width = cw;
      canvas.height = ch;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cw, ch);
      if (!img) return;
      const b = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const s = b * zoom;
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      const x = (cw - dw) / 2 + offset.x * cw;
      const y = (ch - dh) / 2 + offset.y * ch;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, dw, dh);
      if (whiten) {
        const data = ctx.getImageData(0, 0, cw, ch);
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
    const b = Math.max(spec.w / img.naturalWidth, spec.h / img.naturalHeight) * zoom;
    return {
      mx: Math.max(0, (img.naturalWidth * b - spec.w) / 2 / spec.w),
      my: Math.max(0, (img.naturalHeight * b - spec.h) / 2 / spec.h),
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
    const kind = classifyFile(file);
    if (kind === 'notImage') {
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
    image.onerror = () =>
      setError(kind === 'heic' ? t(HEIC_MESSAGE) : t({ en: 'This image could not be opened. Try a JPG or PNG.', bn: 'ছবিটি খোলা যায়নি। JPG বা PNG চেষ্টা করুন।' }));
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
    setError(null);
    const canvas = document.createElement('canvas');
    const toBlob = (q: number) => new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', q));
    const name = `${preset === 'signature' ? 'signature' : preset === 'passport' ? 'passport-photo' : 'photo'}-${spec.w}x${spec.h}.jpg`;
    const finish = (blob: Blob) => {
      if (result) URL.revokeObjectURL(result.url);
      setResult({ url: URL.createObjectURL(blob), bytes: blob.size, name, w: canvas.width, h: canvas.height });
    };

    // No file limit (print sizes): one high-quality file
    if (spec.kb === null) {
      draw(canvas);
      const b = await toBlob(0.92);
      if (b) finish(b);
      return;
    }

    const limit = spec.kb * 1024;
    // A keep-shape preset may also shrink the pixels step by step when the KB target needs it; fixed sizes never change.
    const scales = spec.keepRatio ? [1, 0.75, 0.5, 0.35, 0.25] : [1];
    let smallest: { bytes: number; w: number; h: number } | null = null;
    for (const scale of scales) {
      draw(canvas, scale);
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
        // Nothing fit: try the lowest quality to learn the smallest file reachable at this pixel size
        const floor = await toBlob(0.05);
        if (floor && (!smallest || floor.size < smallest.bytes)) smallest = { bytes: floor.size, w: canvas.width, h: canvas.height };
        continue;
      }
      finish(best);
      return;
    }
    if (smallest) setError(t(unreachableMessage(smallest.bytes, spec.kb, smallest.w, smallest.h)));
  };

  const presetButton = (id: PresetId, label: { en: string; bn: string }, sub: string) => (
    <button
      key={id}
      type="button"
      onClick={() => onPreset(id)}
      aria-pressed={preset === id}
      className={`rounded-xl border-2 px-4 py-3 text-left transition-colors ${preset === id ? 'border-leaf bg-leaf-soft' : 'border-line hover:border-leaf/50'}`}
    >
      <span className="block font-display font-semibold">{t(label)}</span>
      <span className="block text-sm text-muted">{sub}</span>
    </button>
  );

  const subOf = (p: PresetDef) => {
    if (p.group === 'kb') return t({ en: `Up to ${p.kb} KB, same shape`, bn: `${num(p.kb ?? 0, 'bn')} KB পর্যন্ত, একই আকৃতি` });
    const px = num(`${p.w}×${p.h} px`, lang);
    const mm = p.mm ? ` · ${num(mmLabel(p.mm), lang)}` : '';
    const kb = p.kb ? ` · ${num(p.kb, lang)} KB` : '';
    return `${px}${mm}${kb}`;
  };

  return (
    <section id="photo-tool" className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <div>
          <p className="label">{t({ en: '1. What are you making?', bn: '১. কী বানাবেন?' })}</p>
          <div className="space-y-4">
            {GROUPS.map((g) => (
              <div key={g.id}>
                <p className="mb-2 text-sm font-semibold text-muted">{t(g.title)}</p>
                <div className="grid grid-cols-2 gap-3">
                  {PRESETS.filter((p) => p.group === g.id).map((p) => presetButton(p.id, p.label, subOf(p)))}
                  {g.id === 'kb' && presetButton('custom', { en: 'Other size', bn: 'অন্য মাপ' }, t({ en: 'Set your own', bn: 'নিজে দিন' }))}
                </div>
              </div>
            ))}
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
                    max={2000}
                    value={custom[k]}
                    onChange={(e) => setCustom({ ...custom, [k]: clamp(Number(e.target.value) || 0, k === 'kb' ? 5 : 20, 2000) })}
                    className="field"
                  />
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm text-muted">
            {t({
              en: 'These are common sizes, not a rule of any portal. Always check the size in your own circular or form.',
              bn: 'এগুলো প্রচলিত মাপ, কোনো পোর্টালের নিয়ম নয়। নিজের বিজ্ঞপ্তি বা ফর্মে কোন মাপ চাওয়া হয়েছে তা সবসময় দেখে নিন।',
            })}
          </p>
        </div>

        <div>
          <label className="label" htmlFor="photo-file">{t({ en: '2. Choose your image', bn: '২. ছবি বেছে নিন' })}</label>
          <input id="photo-file" type="file" accept="image/*,.heic,.heif" onChange={(e) => onFile(e.target.files?.[0])}
            className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-leaf file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-leaf-dark" />
          <p className="mt-2 text-sm text-muted">
            {preset === 'signature'
              ? t({ en: 'Sign on white paper with a black or blue pen, then take a clear photo in good light.', bn: 'সাদা কাগজে কালো বা নীল কলমে স্বাক্ষর করে ভালো আলোয় পরিষ্কার ছবি তুলুন।' })
              : t({ en: 'Use a recent photo with a plain light background, facing the camera.', bn: 'হালকা একরঙা ব্যাকগ্রাউন্ডে ক্যামেরার দিকে তাকানো সাম্প্রতিক ছবি ব্যবহার করুন।' })}
          </p>
        </div>

        {img && (
          <div className="space-y-4">
            {!spec.keepRatio && (
              <div>
                <label className="label" htmlFor="zoom">{t({ en: '3. Zoom and drag to frame it', bn: '৩. জুম করে ও টেনে ঠিক জায়গায় আনুন' })}</label>
                <input id="zoom" type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[#0f6b4c]" />
              </div>
            )}
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
            {def?.mm ? ` (${num(mmLabel(def.mm), lang)})` : ''}
          </p>
          <div className="mx-auto" style={{ maxWidth: spec.w >= spec.h ? '100%' : `${(spec.w / spec.h) * 100}%` }}>
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={`block w-full touch-none bg-white ring-1 ring-line ${img && !spec.keepRatio ? 'cursor-grab active:cursor-grabbing' : ''}`}
              style={{ aspectRatio: `${spec.w} / ${spec.h}` }}
              aria-label={t({ en: 'Image preview. Drag to move the image.', bn: 'ছবির প্রিভিউ। সরাতে টেনে নিন।' })}
            />
          </div>
          {!img && <p className="mt-4 text-center text-muted">{t({ en: 'Your image will appear here.', bn: 'আপনার ছবি এখানে দেখাবে।' })}</p>}

          {result && (
            <div className="mt-6 rounded-xl bg-white p-5 ring-1 ring-line">
              <p className="font-display text-lg font-semibold text-leaf">
                {t({ en: 'Ready', bn: 'তৈরি' })}: {num(`${result.w}×${result.h}`, lang)} px, {num((result.bytes / 1024).toFixed(1), lang)} KB
              </p>
              {spec.kb !== null && (
                <p className="text-sm text-muted">
                  {t({ en: `Under the ${spec.kb} KB limit.`, bn: `${num(spec.kb, 'bn')} KB সীমার মধ্যে।` })}
                </p>
              )}
              <a href={result.url} download={result.name} className="btn btn-primary mt-4 w-full">
                {t({ en: 'Download JPG', bn: 'JPG ডাউনলোড করুন' })}
              </a>
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-muted">
          {t({
            en: 'Your picture stays in your browser. The file is made on your device and is not uploaded.',
            bn: 'আপনার ছবি আপনার ব্রাউজারেই থাকে। ফাইল আপনার ডিভাইসেই তৈরি হয়, আপলোড হয় না।',
          })}
        </p>
      </div>
    </section>
  );
}
