// Page-side client for the background-removal worker (src/lib/cvPhotoWorker.ts). The worker file, Transformers.js and the model
// are only fetched when `removeBackground` is first called, i.e. when the visitor presses the process button.

import { classifyMatteError, type MatteErrorCode } from '../../shared/cvPhoto';
import type { WorkerIn, WorkerOut } from './cvPhotoWorker';

export interface MatteProgress { phase: 'download' | 'prepare' | 'cutout'; loaded?: number; total?: number }
export interface MatteResult { width: number; height: number; alpha: Uint8ClampedArray; device: 'webgpu' | 'wasm'; modelBytes: number | null }

export class MatteError extends Error {
  code: MatteErrorCode;
  constructor(code: MatteErrorCode, detail: string) {
    super(detail);
    this.code = code;
  }
}

let worker: Worker | null = null;

export function matteSupported(): boolean {
  return typeof WebAssembly !== 'undefined' && typeof Worker !== 'undefined';
}

/** Cuts the person out of `image` (RGBA pixels, already scaled down). Resolves with the matte, one byte per pixel. */
export function removeBackground(image: ImageData, onProgress: (p: MatteProgress) => void): Promise<MatteResult> {
  if (!matteSupported()) return Promise.reject(new MatteError('unsupported', 'no WebAssembly or Worker'));
  if (!worker) worker = new Worker(new URL('./cvPhotoWorker.ts', import.meta.url), { type: 'module' });
  const w = worker;
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      w.removeEventListener('message', onMsg);
      w.removeEventListener('error', onErr);
    };
    const onMsg = (e: MessageEvent<WorkerOut>) => {
      const m = e.data;
      if (m.type === 'progress') onProgress({ phase: m.phase, loaded: m.loaded, total: m.total });
      else if (m.type === 'done') {
        cleanup();
        resolve({ width: m.width, height: m.height, alpha: new Uint8ClampedArray(m.alpha), device: m.device, modelBytes: m.modelBytes });
      } else {
        cleanup();
        reject(new MatteError(classifyMatteError(m.message), m.message));
      }
    };
    const onErr = (e: ErrorEvent) => {
      cleanup();
      // A worker that failed to start is not reused
      w.terminate();
      if (worker === w) worker = null;
      reject(new MatteError(classifyMatteError(e.message || 'worker failed to load'), e.message || 'worker failed to load'));
    };
    w.addEventListener('message', onMsg);
    w.addEventListener('error', onErr);
    const buf = image.data.buffer.slice(0) as ArrayBuffer;
    const msg: WorkerIn = { type: 'run', width: image.width, height: image.height, data: buf };
    w.postMessage(msg, [buf]);
  });
}

/** Stops the worker and frees its memory (called when the page is left). */
export function disposeMatteWorker() {
  worker?.terminate();
  worker = null;
}
