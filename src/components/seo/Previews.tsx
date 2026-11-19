/** A preview image of our own builder layout (sample data). `eager` marks the one image that is the page's largest above the fold. */
export interface OwnPreviewData { src: string; w: number; h: number; thumb: string; tw: number; th: number; alt: string; caption: string }

export function OwnPreview({ p, eager, thumb }: { p: OwnPreviewData; eager?: boolean; thumb?: boolean }) {
  return (
    <figure className="mx-auto w-full max-w-[16rem] sm:max-w-xs">
      <img
        src={thumb ? p.thumb : p.src} width={thumb ? p.tw : p.w} height={thumb ? p.th : p.h} alt={p.alt}
        loading={eager ? 'eager' : 'lazy'} {...(eager ? { fetchPriority: 'high' as const } : {})}
        className="h-auto w-full rounded-lg border border-line bg-white shadow-sm"
      />
      <figcaption className="mt-2 text-center text-sm text-muted">{p.caption}</figcaption>
    </figure>
  );
}

export function TemplateImage({ src, w, h, alt, eager }: { src: string; w: number; h: number; alt: string; eager?: boolean }) {
  return (
    <img
      src={src} width={w} height={h} alt={alt}
      loading={eager ? 'eager' : 'lazy'} {...(eager ? { fetchPriority: 'high' as const } : {})}
      className="h-auto w-full rounded-lg border border-line bg-white"
    />
  );
}
