import { useLang } from '../lib/lang';

const sizeLabel = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

type Say = (s: { en: string; bn: string }) => string;

/** Button text by file kind: the plain ATS twin and the how-to guide are free bonus files. */
function labelOf(file: string, t: Say): string {
  if (file.endsWith('.zip')) return t({ en: 'Download all files (ZIP)', bn: 'সব ফাইল ডাউনলোড (ZIP)' });
  if (file.endsWith('.pdf')) return t({ en: 'Free bonus: how-to guide (PDF)', bn: 'ফ্রি বোনাস: কীভাবে ব্যবহার করবেন (PDF)' });
  if (file.startsWith('hwg-cv-ats-')) return t({ en: 'Free bonus: ATS version (Word)', bn: 'ফ্রি বোনাস: ATS ভার্সন (Word)' });
  return t({ en: 'Download Word file', bn: 'Word ফাইল ডাউনলোড' });
}

export function DownloadButtons({ downloads }: { downloads: { file: string; url: string; bytes: number }[] }) {
  const { t } = useLang();
  return (
    <ul className="space-y-3">
      {downloads.map((d) => (
        <li key={d.file}>
          <a href={d.url} className="btn btn-primary w-full justify-between sm:w-auto sm:min-w-80" download>
            <span>{labelOf(d.file, t)}</span>
            <span className="text-sm font-normal opacity-80">{sizeLabel(d.bytes)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
