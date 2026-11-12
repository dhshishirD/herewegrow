// Prints a CV from a private, hidden frame that holds only the CV markup and our own stylesheets.
// Why: window.print() prints the whole page, including anything a browser extension (e.g. Apollo) injects into it,
// which is how stray logos ended up on clients' PDFs. A separate frame never contains those page overlays.

const FRAME_ID = 'hwg-print-frame';

/** Our own CSS (same-origin links and inline styles), copied so the CV looks exactly as on screen and in print. */
function ownStyles(): string {
  const out: string[] = [];
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => {
    if (el instanceof HTMLLinkElement) {
      try { if (new URL(el.href, location.href).origin !== location.origin) return; } catch { return; }
      out.push(`<link rel="stylesheet" href="${el.href.replace(/"/g, '&quot;')}">`);
    } else if (el.textContent) out.push(`<style>${el.textContent}</style>`);
  });
  return out.join('\n');
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** The document written into the frame. Exported for tests. */
export function printDocument(cvHtml: string, title: string, styles = ownStyles()): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>${styles}
<style>html,body{margin:0;background:#fff}#cv-print{display:block !important}</style></head><body><div id="cv-print">${cvHtml}</div></body></html>`;
}

/** Opens the print dialog for the given CV markup. Resolves true when the dialog was opened. */
export async function printCvIsolated(cvHtml: string, title: string): Promise<boolean> {
  document.getElementById(FRAME_ID)?.remove();
  const frame = document.createElement('iframe');
  frame.id = FRAME_ID;
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  // Real A4-sized box, parked off screen (display:none frames do not lay out, so they print blank)
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;visibility:hidden';
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  const doc = frame.contentDocument;
  if (!win || !doc) { frame.remove(); return false; }
  doc.open();
  doc.write(printDocument(cvHtml, title));
  doc.close();
  // Wait for the stylesheets and fonts, otherwise the first print has the wrong look
  await new Promise<void>((resolve) => {
    const done = () => resolve();
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    let left = links.length;
    if (!left) return done();
    links.forEach((l) => { l.addEventListener('load', () => { if (--left === 0) done(); }); l.addEventListener('error', () => { if (--left === 0) done(); }); });
    setTimeout(done, 4000);
  });
  try { await doc.fonts.ready; } catch { /* old browser */ }
  await Promise.all(Array.from(doc.images).map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = () => r(0); }))));
  const prev = document.title;
  document.title = title;
  win.addEventListener('afterprint', () => { document.title = prev; setTimeout(() => frame.remove(), 500); });
  win.focus();
  win.print();
  setTimeout(() => { document.title = prev; }, 1500);
  return true;
}
