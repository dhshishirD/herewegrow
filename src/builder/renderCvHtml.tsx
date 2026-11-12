// Turns a saved CV (BuilderState) into the markup that gets printed. Loaded on demand so the dashboard stays light.
import { renderToStaticMarkup } from 'react-dom/server';
import type { BuilderState } from './model';
import { ACCENTS, normalise } from './model';

export async function renderCvHtml(state: BuilderState, watermark: boolean): Promise<string> {
  const { CvDocument } = await import('./designs');
  const cv = (
    <CvDocument
      d={normalise(state.data)}
      design={state.design ?? 'classic'}
      accent={state.accent ?? ACCENTS[0]}
      headings="en"
      margins={state.margins}
      font={state.font}
    />
  );
  return renderToStaticMarkup(cv) + (watermark ? '<div class="cv-watermark">Made with HereWeGrow.pro</div>' : '');
}
