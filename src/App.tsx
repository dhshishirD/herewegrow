import { lazy, Suspense, useEffect, type JSX } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutProvider } from './components/Checkout';
import { CartProvider } from './lib/cart';
import { AuthProvider } from './lib/auth';
import { PageTracker } from './components/PageTracker';
import { LoginModal } from './components/LoginModal';
import { AccountPage } from './pages/Account';
import { ContactPage, ContactWidget } from './components/ContactWidget';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LangProvider } from './lib/lang';
import { usePath } from './lib/router';
import { ServicesPage, ToolsPage } from './pages/CatalogPages';
import { AboutPage } from './pages/About';
import { CvChecker } from './pages/CvChecker';
import { OrderPage } from './pages/Order';
import { GuidePage, GuidesPage } from './pages/Guides';
import { Home } from './pages/Home';
import { PaymentCancel, PaymentSuccess } from './pages/PaymentResult';
import { PhotoResizer } from './pages/PhotoResizer';
import { ProPage } from './pages/Pro';
import { AdminDashboardPage } from './pages/AdminDashboard';
import { AdminCareersPage } from './pages/AdminCareers';
import { AdminPromosPage } from './pages/AdminPromos';
import { capturePromoParam } from './lib/promo';
import { NotFound, PrivacyPage, TermsPage } from './pages/Policies';
import { TemplateDetail, TemplatesPage } from './pages/Templates';

const BuilderPage = lazy(() => import('./pages/Builder').then((m) => ({ default: m.BuilderPage })));
const LazyBuilder = () => (
  <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}>
    <BuilderPage />
  </Suspense>
);

const Landing = lazy(() => import('./pages/ProfileLanding'));
const LinkedInPage = () => <Suspense fallback={<div className="lux-band min-h-[70vh]" />}><Landing kind="linkedin" /></Suspense>;
const BdjobsPage = () => <Suspense fallback={<div className="lux-band min-h-[70vh]" />}><Landing kind="bdjobs" /></Suspense>;

const ROUTES: Record<string, () => JSX.Element> = {
  '/': Home,
  '/services': ServicesPage,
  '/about': AboutPage,
  '/order': OrderPage,
  '/guides': GuidesPage,
  '/templates': TemplatesPage,
  '/tools': ToolsPage,
  '/tools/cv-checker': CvChecker,
  '/builder': LazyBuilder,
  '/tools/photo-signature-resizer': PhotoResizer,
  '/payment/success': PaymentSuccess,
  '/payment/cancel': PaymentCancel,
  '/account': AccountPage,
  '/pro': ProPage,
  '/admin': AdminDashboardPage,
  '/admin/careers': AdminCareersPage,
  '/admin/promos': AdminPromosPage,
  '/linkedin-profile-optimization': LinkedInPage,
  '/bdjobs-profile-optimization': BdjobsPage,
  '/contact': ContactPage,
  '/privacy': PrivacyPage,
  '/terms': TermsPage,
};

function Page() {
  const path = usePath();
  const tpl = path.match(/^\/templates\/([a-z0-9-]+)$/);
  if (tpl) return <TemplateDetail key={path} id={tpl[1]} />;
  const guide = path.match(/^\/guides\/([a-z0-9-]+)$/);
  if (guide) return <GuidePage key={path} slug={guide[1]} />;
  const Component = ROUTES[path] ?? NotFound;
  return <Component key={path} />;
}

export default function App() {
  useEffect(capturePromoParam, []);
  return (
    <LangProvider>
      <AuthProvider>
      <PageTracker />
      <CartProvider>
      <CheckoutProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Header />
        <main id="main" className="pb-20">
          <Page />
        </main>
        <Footer />
        <CartDrawer />
        <LoginModal />
        <ContactWidget />
      </CheckoutProvider>
      </CartProvider>
      </AuthProvider>
    </LangProvider>
  );
}
