// The professional CV photo maker tool. Everything runs in the browser: the photo is read here, a shrunk copy goes to a
// Web Worker that runs the background-removal model (src/lib/cvPhotoWorker.ts), and the cut-out is placed on a colour
// with canvas maths from shared/cvPhoto.ts. Nothing is uploaded. The model and library load only when the button is pressed.

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { MatteError, disposeMatteWorker, matteSupported, removeBackground, type MatteProgress } from '../lib/cvPhotoMatte';
import { HEIC_MESSAGE, classifyFile, fitWithin } from '../../shared/photoPresets';
import {
  BACKGROUNDS, FRAMES, MATTE_ERRORS, MODEL_MAX_SIDE, WORK_MAX_SIDE, CENTERED,
  alphaBounds, alphaFromRgba, autoFrame, autoLevels, compositeFrame, cropRect, cvPhotoFileName, estimateBackground, featherAlpha, foregroundColours, foregroundRadiusFor,
  featherRadiusFor, findFrame, formatBytes, outputSize, panView, parseHex, refineAlpha, zoomView,
  type BgId, type Bounds, type Enhance, type FrameId, type Levels, type View,
} from '../../shared/cvPhoto';

interface Matte {
  w: number;
  h: number;
  /** The matte drawn as grey, so a canvas can stretch it smoothly over any crop. */
  canvas: HTMLCanvasElement;
  bgEstimate: ReturnType<typeof estimateBackground>;
  levels: Levels | null;
  /** The person's bounding box in working-copy pixels. */
  bounds: Bounds | null;
  device: 'webgpu' | 'wasm';
  modelBytes: number | null;
}

interface Exported { url: string; bytes: number; w: number; h: number; name: string }

const PREVIEW_W = 480;
const newCanvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

interface Look {
  frameId: FrameId;
  view: View;
  bgId: BgId;
  customHex: string;
  brightness: number;
  contrast: number;
  auto: boolean;
}

/** Draws the finished picture (person on colour, or transparent) for the given look at size outW x outH. */
function renderResult(work: HTMLCanvasElement, matte: Matte, look: Look, outW: number, outH: number, transparent: boolean): HTMLCanvasElement {
  const frame = findFrame(look.frameId);
  const r = cropRect(work.width, work.height, frame.ratio, look.view);
  const out = newCanvas(outW, outH);
  const ctx = out.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(work, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height);
  const px = ctx.getImageData(0, 0, out.width, out.height);

  // The same part of the matte, stretched smoothly to the output size
  const mc = newCanvas(out.width, out.height);
  const mctx = mc.getContext('2d', { willReadFrequently: true })!;
  mctx.imageSmoothingQuality = 'high';
  const fx = matte.w / work.width;
  const fy = matte.h / work.height;
  mctx.drawImage(matte.canvas, r.x * fx, r.y * fy, r.w * fx, r.h * fy, 0, 0, out.width, out.height);
  const raw = alphaFromRgba(mctx.getImageData(0, 0, out.width, out.height).data);
  const refined = featherAlpha(refineAlpha(raw), out.width, out.height, featherRadiusFor(out.width, out.height));

  const enhance: Enhance = { brightness: look.brightness, contrast: look.contrast, levels: look.auto ? matte.levels : null };
  const bgHex = look.bgId === 'custom' ? look.customHex : BACKGROUNDS.find((b) => b.id === look.bgId)!.hex;
  const fg = foregroundColours(px.data, raw, out.width, out.height, foregroundRadiusFor(out.width, out.height));
  compositeFrame(px.data, raw, refined, { fg, bg: transparent ? null : parseHex(bgHex) ?? { r: 255, g: 255, b: 255 }, bgEstimate: matte.bgEstimate, strength: 0.85, enhance });
  ctx.putImageData(px, 0, 0);
  return out;
}

export function CvPhotoTool() {
  const { t, lang } = useLang();
  const [work, setWork] = useState<HTMLCanvasElement | null>(null);
  const [matte, setMatte] = useState<Matte | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<MatteProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [look, setLook] = useState<Look>({ frameId: '4x5', view: CENTERED, bgId: 'white', customHex: '#cfe8d8', brightness: 0, contrast: 0, auto: true });
  const [split, setSplit] = useState(50);
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg');
  const [quality, setQuality] = useState(92);
  const [transparent, setTransparent] = useState(false);
  const [exported, setExported] = useState<Exported | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; view: View } | null>(null);
  const exportUrl = useRef<string | null>(null);
  const frame = findFrame(look.frameId);
  const setL = (p: Partial<Look>) => setLook((l) => ({ ...l, ...p }));

  useEffect(() => () => {
    disposeMatteWorker();
    if (exportUrl.current) URL.revokeObjectURL(exportUrl.current);
  }, []);

  // ---------- Choosing a photo ----------

  const onFile = async (file?: File) => {
    setError(null);
    if (!file) return;
    const kind = classifyFile(file);
    if (kind === 'notImage') {
      setError(t({ en: 'Choose a photo file (JPG, PNG or WebP).', bn: 'একটি ছবি ফাইল বেছে নিন (JPG, PNG বা WebP)।' }));
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const size = fitWithin(image.naturalWidth, image.naturalHeight, WORK_MAX_SIDE);
      const c = newCanvas(size.w, size.h);
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, 0, 0, c.width, c.height);
      setWork(c);
      setMatte(null);
      setExported(null);
      setDownloaded(false);
      setLook((l) => ({ ...l, view: CENTERED, brightness: 0, contrast: 0, auto: true, bgId: 'white' }));
    } catch {
      setError(kind === 'heic' ? t(HEIC_MESSAGE) : t({ en: 'This image could not be opened. Try a JPG or PNG.', bn: 'ছবিটি খোলা যায়নি। JPG বা PNG চেষ্টা করুন।' }));
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  // ---------- Removing the background ----------

  const process = async () => {
    if (!work || busy) return;
    setError(null);
    if (!matteSupported()) {
      setError(t(MATTE_ERRORS.unsupported));
      return;
    }
    setBusy(true);
    setProgress({ phase: 'download' });
    try {
      // A smaller copy goes to the model. The matte is stretched over the full-size picture afterwards.
      const small = fitWithin(work.width, work.height, MODEL_MAX_SIDE);
      const sc = newCanvas(small.w, small.h);
      const sctx = sc.getContext('2d', { willReadFrequently: true })!;
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(work, 0, 0, sc.width, sc.height);
      const input = sctx.getImageData(0, 0, sc.width, sc.height);
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const res = await removeBackground(input, setProgress);

      const mCanvas = newCanvas(res.width, res.height);
      const mctx = mCanvas.getContext('2d', { willReadFrequently: true })!;
      const grey = mctx.createImageData(res.width, res.height);
      for (let i = 0; i < res.alpha.length; i++) grey.data.set([res.alpha[i], res.alpha[i], res.alpha[i], 255], i * 4);
      mctx.putImageData(grey, 0, 0);

      // Numbers for "best settings", taken at the model-copy size
      const mc = newCanvas(small.w, small.h);
      const mcx = mc.getContext('2d', { willReadFrequently: true })!;
      mcx.imageSmoothingQuality = 'high';
      mcx.drawImage(mCanvas, 0, 0, mc.width, mc.height);
      const alphaSmall = alphaFromRgba(mcx.getImageData(0, 0, mc.width, mc.height).data);
      const b = alphaBounds(res.alpha, res.width, res.height);
      const m: Matte = {
        w: res.width,
        h: res.height,
        canvas: mCanvas,
        bgEstimate: estimateBackground(input.data, alphaSmall),
        levels: autoLevels(input.data, alphaSmall),
        bounds: b ? { x0: (b.x0 * work.width) / res.width, x1: (b.x1 * work.width) / res.width, y0: (b.y0 * work.height) / res.height, y1: (b.y1 * work.height) / res.height } : null,
        device: res.device,
        modelBytes: res.modelBytes,
      };
      setMatte(m);
      setSplit(50);
      setDownloaded(false);
      setLook((l) => ({ ...l, bgId: 'white', brightness: 0, contrast: 0, auto: true, view: m.bounds ? autoFrame(m.bounds, work.width, work.height, findFrame(l.frameId).ratio) : CENTERED }));
      if (!b) setError(t({ en: 'We could not find a person in this photo, so the framing was left in the middle. Try a clearer photo of yourself.', bn: 'এই ছবিতে কোনো মানুষ খুঁজে পাওয়া যায়নি, তাই ফ্রেমিং মাঝখানে রাখা হয়েছে। নিজের একটি পরিষ্কার ছবি দিয়ে চেষ্টা করুন।' }));
    } catch (e) {
      setError(t(MATTE_ERRORS[e instanceof MatteError ? e.code : 'other']));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  // ---------- Best settings, shape change ----------

  const bestSettings = () => {
    if (!work || !matte) return;
    setLook((l) => ({ ...l, bgId: 'white', brightness: 0, contrast: 0, auto: true, view: matte.bounds ? autoFrame(matte.bounds, work.width, work.height, findFrame(l.frameId).ratio) : CENTERED }));
  };

  const pickFrame = (id: FrameId) => {
    if (!work) return setL({ frameId: id });
    const ratio = findFrame(id).ratio;
    setLook((l) => ({ ...l, frameId: id, view: matte?.bounds ? autoFrame(matte.bounds, work.width, work.height, ratio) : CENTERED }));
  };

  // ---------- Preview ----------

  const previewH = Math.round(PREVIEW_W / frame.ratio);
  const checker = useMemo(() => {
    const c = newCanvas(16, 16);
    const x = c.getContext('2d')!;
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#d9dde2';
    x.fillRect(0, 0, 8, 8);
    x.fillRect(8, 8, 8, 8);
    return c;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !work) return;
    const id = requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = PREVIEW_W;
      canvas.height = previewH;
      const r = cropRect(work.width, work.height, frame.ratio, look.view);
      // "Before": the plain photo in the same frame
      const drawBefore = () => {
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(work, r.x, r.y, r.w, r.h, 0, 0, PREVIEW_W, previewH);
      };
      if (!matte) {
        drawBefore();
        return;
      }
      const asTransparent = format === 'png' && transparent;
      const after = renderResult(work, matte, look, PREVIEW_W, previewH, asTransparent);
      if (asTransparent) {
        ctx.fillStyle = ctx.createPattern(checker, 'repeat') ?? '#fff';
        ctx.fillRect(0, 0, PREVIEW_W, previewH);
      }
      ctx.drawImage(after, 0, 0);
      const sx = Math.round((split / 100) * PREVIEW_W);
      if (sx > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, sx, previewH);
        ctx.clip();
        drawBefore();
        ctx.restore();
      }
      if (split > 0 && split < 100) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx - 1, 0, 2, previewH);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx - 1.5, 0, 3, previewH);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [work, matte, look, split, frame.ratio, previewH, format, transparent, checker]);

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!work || !matte) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, view: look.view };
  };
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current || !work) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const d = drag.current;
    setL({ view: panView(work.width, work.height, frame.ratio, d.view, (e.clientX - d.x) / rect.width, (e.clientY - d.y) / rect.height) });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  // ---------- Export (rebuilt shortly after any change, so the size on screen is the real size) ----------

  useEffect(() => {
    if (!work || !matte) {
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const r = cropRect(work.width, work.height, frame.ratio, look.view);
      const size = outputSize(frame, r.w, r.h);
      const isPng = format === 'png';
      const out = renderResult(work, matte, look, size.w, size.h, isPng && transparent);
      const blob = await new Promise<Blob | null>((res) => out.toBlob(res, isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : quality / 100));
      if (cancelled || !blob) return;
      if (exportUrl.current) URL.revokeObjectURL(exportUrl.current);
      exportUrl.current = URL.createObjectURL(blob);
      setExported({ url: exportUrl.current, bytes: blob.size, w: size.w, h: size.h, name: cvPhotoFileName(format, isPng && transparent) });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [work, matte, look, format, quality, transparent, frame]);

  const progressText = useCallback(
    (p: MatteProgress) => {
      if (p.phase === 'cutout') return t({ en: 'Cutting you out of the background… a few seconds.', bn: 'ব্যাকগ্রাউন্ড থেকে আপনাকে আলাদা করা হচ্ছে… কয়েক সেকেন্ড।' });
      if (p.total && p.loaded !== undefined) {
        const pct = Math.round((p.loaded / p.total) * 100);
        const mb = (n: number) => (n / (1024 * 1024)).toFixed(1);
        return t({
          en: `Downloading the model, first time only: ${mb(p.loaded)} of ${mb(p.total)} MB (${pct}%)`,
          bn: `মডেল নামছে, শুধু প্রথমবার: ${num(mb(p.total), 'bn')} MB-এর মধ্যে ${num(mb(p.loaded), 'bn')} MB (${num(pct, 'bn')}%)`,
        });
      }
      return t({ en: 'Getting the background remover ready. The first time, some files download.', bn: 'ব্যাকগ্রাউন্ড রিমুভার প্রস্তুত হচ্ছে। প্রথমবার কিছু ফাইল নামে।' });
    },
    [t],
  );

  const pct = progress?.total && progress.loaded !== undefined ? Math.round((progress.loaded / progress.total) * 100) : null;
  const swatchHex = (id: BgId) => (id === 'custom' ? look.customHex : BACKGROUNDS.find((b) => b.id === id)!.hex);
  const D = (n: number | string) => num(n, lang);

  return (
    <section id="cv-photo-tool" className="wrap grid gap-8 py-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:py-10">
      {/* Preview */}
      <div className="lg:order-2">
        <div className="rounded-2xl bg-mist p-4 sm:p-6">
          {work ? (
            <>
              <div className="mx-auto w-full" style={{ maxWidth: 420 }}>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={PREVIEW_W}
                    height={previewH}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    className={`block w-full bg-white ring-1 ring-line ${matte ? 'cursor-grab touch-none active:cursor-grabbing' : ''} ${busy ? 'opacity-40' : ''}`}
                    style={{ aspectRatio: `${frame.ratio}` }}
                    aria-label={t({ en: 'Photo preview. Drag to move the photo.', bn: 'ছবির প্রিভিউ। সরাতে টেনে নিন।' })}
                  />
                  {busy && progress && (
                    <div className="absolute inset-0 grid place-items-center p-4">
                      <div role="status" aria-live="polite" className="w-full max-w-xs rounded-xl bg-white/95 p-4 text-center shadow ring-1 ring-line">
                        <p className="text-sm font-semibold">{progressText(progress)}</p>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                          <div className={`h-full rounded-full bg-leaf transition-all ${pct === null ? 'w-1/3 animate-pulse' : ''}`} style={pct === null ? undefined : { width: `${pct}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-muted">{t({ en: 'Your photo stays on your device.', bn: 'আপনার ছবি আপনার ডিভাইসেই থাকে।' })}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {matte && (
                <div className="mx-auto mt-4 max-w-md">
                  <label htmlFor="cvp-split" className="flex items-center justify-between text-sm font-semibold">
                    <span>{t({ en: 'Before', bn: 'আগে' })}</span>
                    <span className="text-muted">{t({ en: 'Slide to compare', bn: 'স্লাইড করে তুলনা করুন' })}</span>
                    <span>{t({ en: 'After', bn: 'পরে' })}</span>
                  </label>
                  <input id="cvp-split" type="range" min={0} max={100} value={split} onChange={(e) => setSplit(Number(e.target.value))} className="mt-1 h-8 w-full accent-[#0f6b4c]" />
                  <p className="mt-1 text-center text-sm text-muted">{t({ en: 'Drag the picture to move it.', bn: 'ছবি টেনে সরাতে পারবেন।' })}</p>
                </div>
              )}
            </>
          ) : (
            <div className="grid min-h-64 place-items-center text-center text-muted">
              <p>{t({ en: 'Your photo will appear here.', bn: 'আপনার ছবি এখানে দেখাবে।' })}</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">
          {t({
            en: 'Your photo is not uploaded. It is processed in your browser. Only the model files download to your device.',
            bn: 'আপনার ছবি আপলোড হয় না। ব্রাউজারেই প্রসেস হয়। শুধু মডেলের ফাইল আপনার ডিভাইসে নামে।',
          })}
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-7 lg:order-1">
        <div>
          <label className="label text-base" htmlFor="cvp-file">{t({ en: '1. Choose your photo', bn: '১. আপনার ছবি বেছে নিন' })}</label>
          <input
            id="cvp-file"
            type="file"
            accept="image/*,.heic,.heif"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="block w-full text-base file:mr-4 file:rounded-xl file:border-0 file:bg-leaf file:px-5 file:py-3 file:text-base file:font-semibold file:text-white hover:file:bg-leaf-dark"
          />
          <p className="mt-2 text-sm text-muted">{t({ en: 'JPG, PNG or WebP. Face the camera in good light.', bn: 'JPG, PNG বা WebP। ভালো আলোয় ক্যামেরার দিকে তাকানো ছবি নিন।' })}</p>
        </div>

        {work && !matte && (
          <div>
            <button type="button" onClick={process} disabled={busy} className="btn btn-primary w-full py-4 text-lg">
              {busy ? t({ en: 'Working…', bn: 'কাজ চলছে…' }) : t({ en: '2. Make my CV photo', bn: '২. আমার সিভি ছবি বানান' })}
            </button>
            <p className="mt-3 rounded-xl bg-white p-4 text-sm text-muted ring-1 ring-line">
              {t({
                en: 'On first use, the background-removal model (a few tens of MB) and its engine files download once and your browser keeps them. The exact size shows while it downloads. Your photo itself never leaves your device. Use Wi-Fi if your data pack is small.',
                bn: 'প্রথমবার ব্যবহারে ব্যাকগ্রাউন্ড সরানোর মডেল (কয়েক দশ MB) ও তার ইঞ্জিনের ফাইল একবার নামে, ব্রাউজার সেগুলো রেখে দেয়। নামার সময় সঠিক সাইজ দেখানো হয়। আপনার ছবি নিজে কখনও ডিভাইস ছাড়ে না। ডেটা প্যাকেজ ছোট হলে Wi-Fi ব্যবহার করুন।',
              })}
            </p>
          </div>
        )}

        {error && <p role="alert" className="rounded-xl bg-alert/10 px-4 py-3 text-alert">{error}</p>}

        {matte && work && (
          <>
            <div className="rounded-2xl bg-leaf-soft p-4">
              <button type="button" onClick={bestSettings} className="btn btn-primary w-full py-3.5 text-base">
                {t({ en: 'Best settings (one tap)', bn: 'সেরা সেটিং (এক ট্যাপে)' })}
              </button>
              <p className="mt-2 text-sm text-muted">
                {t({ en: 'White background, head and shoulders framed, light evened out. Change anything below if you like.', bn: 'সাদা ব্যাকগ্রাউন্ড, মাথা-কাঁধ ফ্রেমে, আলো সমান। ইচ্ছে হলে নিচে যা খুশি বদলান।' })}
              </p>
            </div>

            <div>
              <p className="label text-base">{t({ en: 'Background colour', bn: 'ব্যাকগ্রাউন্ডের রং' })}</p>
              <div className="grid grid-cols-4 gap-2" role="group" aria-label={t({ en: 'Background colour', bn: 'ব্যাকগ্রাউন্ডের রং' })}>
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={look.bgId === b.id}
                    onClick={() => setL({ bgId: b.id })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 text-sm font-semibold ${look.bgId === b.id ? 'border-leaf bg-leaf-soft' : 'border-line'}`}
                  >
                    <span className="h-10 w-10 rounded-full ring-1 ring-black/20" style={{ background: swatchHex(b.id) }} />
                    <span className="leading-tight">{t(b.label)}</span>
                  </button>
                ))}
              </div>
              {look.bgId === 'custom' && (
                <div className="mt-3 flex items-center gap-3">
                  <input aria-label={t({ en: 'Pick a colour', bn: 'রং বেছে নিন' })} type="color" value={look.customHex} onChange={(e) => setL({ customHex: e.target.value })} className="h-12 w-20 cursor-pointer rounded-lg border border-line" />
                  <span className="text-sm text-muted">{look.customHex.toUpperCase()}</span>
                </div>
              )}
              <p className="mt-2 text-sm text-muted">{t({ en: 'White or a light neutral colour is the safe choice.', bn: 'সাদা বা হালকা নিরপেক্ষ রং নিরাপদ পছন্দ।' })}</p>
            </div>

            <div>
              <p className="label text-base">{t({ en: 'Shape', bn: 'আকার' })}</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label={t({ en: 'Shape', bn: 'আকার' })}>
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={look.frameId === f.id}
                    onClick={() => pickFrame(f.id)}
                    className={`rounded-xl border-2 px-2 py-3 text-center ${look.frameId === f.id ? 'border-leaf bg-leaf-soft' : 'border-line'}`}
                  >
                    <span className="block font-display font-semibold">{t(f.label)}</span>
                    <span className="block text-xs text-muted">{t(f.sub)}</span>
                  </button>
                ))}
              </div>
              <label className="label mt-4" htmlFor="cvp-zoom">{t({ en: 'Zoom (then drag the picture)', bn: 'জুম (তারপর ছবি টেনে সরান)' })}</label>
              <input id="cvp-zoom" type="range" min={1} max={4} step={0.01} value={look.view.zoom} onChange={(e) => work && setL({ view: zoomView(work.width, work.height, frame.ratio, look.view, Number(e.target.value)) })} className="h-8 w-full accent-[#0f6b4c]" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="label mb-0 text-base">{t({ en: 'Light', bn: 'আলো' })}</p>
                <button
                  type="button"
                  aria-pressed={look.auto}
                  onClick={() => setL({ auto: !look.auto })}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold ${look.auto ? 'border-leaf bg-leaf-soft' : 'border-line'}`}
                >
                  {t({ en: 'Auto', bn: 'অটো' })}{look.auto ? ' ✓' : ''}
                </button>
              </div>
              <label className="label mt-3" htmlFor="cvp-bright">{t({ en: 'Brightness', bn: 'উজ্জ্বলতা' })}: {D(look.brightness)}</label>
              <input id="cvp-bright" type="range" min={-40} max={40} step={1} value={look.brightness} onChange={(e) => setL({ brightness: Number(e.target.value) })} className="h-8 w-full accent-[#0f6b4c]" />
              <label className="label mt-2" htmlFor="cvp-contrast">{t({ en: 'Contrast', bn: 'কনট্রাস্ট' })}: {D(look.contrast)}</label>
              <input id="cvp-contrast" type="range" min={-40} max={40} step={1} value={look.contrast} onChange={(e) => setL({ contrast: Number(e.target.value) })} className="h-8 w-full accent-[#0f6b4c]" />
              <p className="mt-1 text-sm text-muted">{t({ en: 'Light only. Nothing here changes your face or skin.', bn: 'শুধু আলো। এখানে কিছুই আপনার মুখ বা ত্বক বদলায় না।' })}</p>
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
              <p className="label text-base">{t({ en: 'Download', bn: 'ডাউনলোড' })}</p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label={t({ en: 'File type', bn: 'ফাইলের ধরন' })}>
                {(['jpg', 'png'] as const).map((f) => (
                  <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)} className={`rounded-xl border-2 px-3 py-3 font-semibold ${format === f ? 'border-leaf bg-leaf-soft' : 'border-line'}`}>
                    {f === 'jpg' ? t({ en: 'JPG (everyday use)', bn: 'JPG (সাধারণ)' }) : t({ en: 'PNG (sharper, bigger)', bn: 'PNG (আরও স্পষ্ট, বড়)' })}
                  </button>
                ))}
              </div>
              {format === 'jpg' ? (
                <div className="mt-3">
                  <label className="label" htmlFor="cvp-q">{t({ en: 'JPG quality', bn: 'JPG কোয়ালিটি' })}: {D(quality)}%</label>
                  <input id="cvp-q" type="range" min={60} max={100} step={1} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="h-8 w-full accent-[#0f6b4c]" />
                </div>
              ) : (
                <label className="mt-3 flex items-center gap-3">
                  <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="h-6 w-6 accent-[#0f6b4c]" />
                  <span>{t({ en: 'Transparent background (no colour)', bn: 'স্বচ্ছ ব্যাকগ্রাউন্ড (কোনো রং নয়)' })}</span>
                </label>
              )}
              {exported ? (
                <>
                  <p className="mt-4 font-display text-lg font-semibold text-leaf">
                    {D(`${exported.w}×${exported.h}`)} px, {D(formatBytes(exported.bytes))}
                  </p>
                  <a href={exported.url} download={exported.name} onClick={() => setDownloaded(true)} className="btn btn-primary mt-3 w-full py-4 text-lg">
                    {t({ en: `Download ${exported.name}`, bn: `${exported.name} ডাউনলোড করুন` })}
                  </a>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted">{t({ en: 'Preparing the file…', bn: 'ফাইল তৈরি হচ্ছে…' })}</p>
              )}
              <p className="mt-3 text-sm text-muted">
                {t({ en: 'Need an exact KB or pixel size for a form? ', bn: 'ফর্মে নির্দিষ্ট KB বা পিক্সেল লাগলে ' })}
                <Link href="/tools/photo-signature-resizer" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'Use the photo and signature resizer.', bn: 'ছবি ও স্বাক্ষর রিসাইজার ব্যবহার করুন।' })}</Link>
              </p>
            </div>

            {matte.modelBytes && (
              <p className="text-sm text-muted">
                {t({
                  en: `Model size: ${formatBytes(matte.modelBytes)}. Your browser keeps it, so it will not download again.`,
                  bn: `মডেলের সাইজ: ${D(formatBytes(matte.modelBytes))}। ব্রাউজার এটি রেখে দেয়, তাই আবার নামবে না।`,
                })}
              </p>
            )}

            {downloaded && (
              <div role="status" className="rounded-2xl bg-gold-soft p-5">
                <p className="font-display text-lg font-semibold">{t({ en: 'Your photo is ready. Next step?', bn: 'আপনার ছবি তৈরি। এরপর কী?' })}</p>
                <ul className="mt-2 space-y-2">
                  <li>
                    <Link href="/builder" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'Put it in a CV with the free CV builder', bn: 'ফ্রি সিভি বিল্ডারে সিভি বানিয়ে ছবিটি যোগ করুন' })}</Link>
                  </li>
                  <li>
                    <Link href="/cv-format-bd" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'Read the CV format guide for Bangladesh', bn: 'বাংলাদেশে সিভি ফরম্যাটের গাইড পড়ুন' })}</Link>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
