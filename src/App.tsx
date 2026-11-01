import type { JSX } from 'react';
import { CheckoutProvider } from './components/Checkout';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LangProvider } from './lib/lang';
import { usePath } from './lib/router';
import { ServicesPage, ToolsPage } from './pages/CatalogPages';
import { CvChecker } from './pages/CvChecker';
import { Home } from './pages/Home';
import { PaymentCancel, PaymentSuccess } from './pages/PaymentResult';
import { PhotoResizer } from './pages/PhotoResizer';
import { NotFound, PrivacyPage, TermsPage } from './pages/Policies';
import { TemplateDetail, TemplatesPage } from './pages/Templates';

const ROUTES: Record<string, () => JSX.Element> = {
  '/': Home,
  '/services': ServicesPage,
  '/templates': TemplatesPage,
  '/tools': ToolsPage,
  '/tools/cv-checker': CvChecker,
  '/tools/photo-signature-resizer': PhotoResizer,
  '/payment/success': PaymentSuccess,
  '/payment/cancel': PaymentCancel,
  '/privacy': PrivacyPage,
  '/terms': TermsPage,
};

function Page() {
  const path = usePath();
  const tpl = path.match(/^\/templates\/([a-z0-9-]+)$/);
  if (tpl) return <TemplateDetail key={path} id={tpl[1]} />;
  const Component = ROUTES[path] ?? NotFound;
  return <Component key={path} />;
}

export default function App() {
  return (
    <LangProvider>
      <CheckoutProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Header />
        <main id="main">
          <Page />
        </main>
        <Footer />
      </CheckoutProvider>
    </LangProvider>
  );
}
