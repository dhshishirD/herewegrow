import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/noto-serif-bengali';
import '@fontsource-variable/inter';
import '@fontsource/hind-siliguri/400.css';
import '@fontsource/hind-siliguri/600.css';
import '@fontsource/hind-siliguri/700.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/700.css';
import '@fontsource/arimo/400.css';
import '@fontsource/arimo/700.css';
import '@fontsource/tinos/400.css';
import '@fontsource/tinos/700.css';
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/700.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
