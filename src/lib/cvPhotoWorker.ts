/// <reference lib="webworker" />
// Runs the background-removal model off the main thread, so the page stays responsive while it works.
// The model (Xenova/modnet, Apache-2.0) and the Transformers.js library are loaded here, only when the visitor presses the button.
// The photo arrives as pixels from the page and the matte goes back as pixels. Nothing is sent anywhere; the only network
// traffic is downloading the model file and the ONNX runtime files (then cached by the browser).

import { pipeline, env, RawImage } from '@huggingface/transformers';

export const MODEL_ID = 'Xenova/modnet';

export type WorkerIn = { type: 'run'; width: number; height: number; data: ArrayBuffer };
export type WorkerOut =
  | { type: 'progress'; phase: 'download' | 'prepare' | 'cutout'; loaded?: number; total?: number }
  | { type: 'done'; width: number; height: number; alpha: ArrayBuffer; device: 'webgpu' | 'wasm'; modelBytes: number | null }
  | { type: 'error'; message: string };

const post = (m: WorkerOut, transfer: Transferable[] = []) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m, transfer);

env.allowLocalModels = false;

type Segmenter = (img: unknown) => Promise<{ data: Uint8ClampedArray; width: number; height: number; channels: number }>;
let ready: Promise<{ seg: Segmenter; device: 'webgpu' | 'wasm' }> | null = null;
let modelBytes: number | null = null;

async function hasWebGpu(): Promise<boolean> {
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    return !!gpu && !!(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

function load() {
  if (ready) return ready;
  const progress_callback = (p: { status?: string; file?: string; loaded?: number; total?: number }) => {
    if (p.status === 'progress' && p.file?.endsWith('.onnx') && p.total) {
      modelBytes = p.total;
      post({ type: 'progress', phase: 'download', loaded: p.loaded, total: p.total });
    }
  };
  ready = (async () => {
    if (typeof WebAssembly === 'undefined') throw new Error('WebAssembly is not supported');
    const make = (device: 'webgpu' | 'wasm') =>
      pipeline('background-removal', MODEL_ID, { device, dtype: 'fp32', progress_callback } as never) as unknown as Promise<Segmenter>;
    if (await hasWebGpu()) {
      try {
        return { seg: await make('webgpu'), device: 'webgpu' as const };
      } catch {
        // The graphics path failed (common on some phones): use the plain WebAssembly path
      }
    }
    return { seg: await make('wasm'), device: 'wasm' as const };
  })();
  // A failed load must not be remembered, so the next press tries again
  ready.catch(() => { ready = null; });
  return ready;
}

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  if (e.data.type !== 'run') return;
  try {
    post({ type: 'progress', phase: 'download' });
    const { seg, device } = await load();
    post({ type: 'progress', phase: 'cutout' });
    const image = new RawImage(new Uint8ClampedArray(e.data.data), e.data.width, e.data.height, 4).rgb();
    const out = await seg(image);
    // The pipeline returns the picture with the matte as its 4th channel: keep only that channel
    const n = out.width * out.height;
    const alpha = new Uint8ClampedArray(n);
    for (let i = 0; i < n; i++) alpha[i] = out.data[i * out.channels + (out.channels - 1)];
    post({ type: 'done', width: out.width, height: out.height, alpha: alpha.buffer, device, modelBytes }, [alpha.buffer]);
  } catch (err) {
    post({ type: 'error', message: String((err as Error)?.message ?? err) });
  }
};
