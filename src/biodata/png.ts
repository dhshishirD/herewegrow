// Turns biodata page markup into PNG images (one per page) in the browser, for WhatsApp sharing.
// Method: the page is wrapped in an SVG foreignObject and drawn on a canvas. Web fonts do not load inside
// an SVG image, so text uses the system fonts named in the layout (Georgia, Arial).

const W = 794;
const H = 1123;

/** Pages (elements with class bio-page) found in markup, serialised as XHTML so an SVG can carry them. */
export function pageMarkups(html: string): string[] {
  const box = document.createElement('div');
  box.innerHTML = html;
  const ser = new XMLSerializer();
  return Array.from(box.querySelectorAll<HTMLElement>('.bio-page')).map((p) => ser.serializeToString(p));
}

function toImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('Could not draw the page'));
    im.src = src;
  });
}

export async function pageToPng(xhtml: string, scale = 2): Promise<Blob> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="100%" height="100%">${xhtml}</foreignObject></svg>`;
  const im = await toImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  const c = document.createElement('canvas');
  c.width = W * scale;
  c.height = H * scale;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(im, 0, 0, c.width, c.height);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png'));
}

export function saveBlob(b: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
