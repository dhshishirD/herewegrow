import { useLang } from '../lib/lang';

const sizeLabel = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export function DownloadButtons({ downloads }: { downloads: { file: string; url: string; bytes: number }[] }) {
  const { t } = useLang();
  return (
    <ul className="space-y-3">
      {downloads.map((d) => (
        <li key={d.file}>
          <a href={d.url} className="btn btn-primary w-full justify-between sm:w-auto sm:min-w-80" download>
            <span>{d.file.endsWith('.zip') ? t({ en: 'Download all files (ZIP)', bn: 'সব ফাইল ডাউনলোড (ZIP)' }) : t({ en: 'Download Word file', bn: 'Word ফাইল ডাউনলোড' })}</span>
            <span className="text-sm font-normal opacity-80">{sizeLabel(d.bytes)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
