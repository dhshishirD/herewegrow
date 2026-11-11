import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutProvider } from './components/Checkout';
import { CartProvider } from './lib/cart';
import { AuthProvider } from './lib/auth';
import { PageTracker } from './components/PageTracker';
import { LoginModal } from './components/LoginModal';
import { ContactPage, ContactWidget } from './components/ContactWidget';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LangProvider } from './lib/lang';
import { usePath } from './lib/router';
import { Home } from './pages/Home';
import { capturePromoParam } from './lib/promo';
import { NotFound } from './pages/Policies';

// Every page except the home page is its own file, fetched only when a visitor opens it. The home page
// then loads only what it shows (the builder, admin screens, tools and template pages stay out of it).
type Props = any; // each page takes its own props (or none); the route table passes the right ones
function page<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M & string) {
  return lazy(() => load().then((m) => ({ default: m[name] as ComponentType<Props> })));
}
const AccountPage = page(() => import('./pages/Account'), 'AccountPage');
const ServicesPage = page(() => import('./pages/CatalogPages'), 'ServicesPage');
const ToolsPage = page(() => import('./pages/CatalogPages'), 'ToolsPage');
const AboutPage = page(() => import('./pages/About'), 'AboutPage');
const CvChecker = page(() => import('./pages/CvChecker'), 'CvChecker');
const OrderPage = page(() => import('./pages/Order'), 'OrderPage');
const BlogPage = page(() => import('./pages/Blog'), 'BlogPage');
const BlogPostPage = page(() => import('./pages/Blog'), 'BlogPostPage');
const GuidePage = page(() => import('./pages/Guides'), 'GuidePage');
const GuidesPage = page(() => import('./pages/Guides'), 'GuidesPage');
const PaymentSuccess = page(() => import('./pages/PaymentResult'), 'PaymentSuccess');
const PaymentCancel = page(() => import('./pages/PaymentResult'), 'PaymentCancel');
const PhotoResizer = page(() => import('./pages/PhotoResizer'), 'PhotoResizer');
const ApplicationLetter = page(() => import('./pages/ApplicationLetter'), 'ApplicationLetter');
const JobMatch = page(() => import('./pages/JobMatch'), 'JobMatch');
const ScamShield = page(() => import('./pages/ScamShield'), 'ScamShield');
const ProPage = page(() => import('./pages/Pro'), 'ProPage');
const AdminDashboardPage = page(() => import('./pages/AdminDashboard'), 'AdminDashboardPage');
const AdminCareersPage = page(() => import('./pages/AdminCareers'), 'AdminCareersPage');
const AdminManualPage = page(() => import('./pages/AdminManual'), 'AdminManualPage');
const AdminPromosPage = page(() => import('./pages/AdminPromos'), 'AdminPromosPage');
const AdminTemplatesPage = page(() => import('./pages/AdminTemplates'), 'AdminTemplatesPage');
const AdminBlogPage = page(() => import('./pages/AdminBlog'), 'AdminBlogPage');
const TemplatesPage = page(() => import('./pages/Templates'), 'TemplatesPage');
const TemplateDetail = page(() => import('./pages/Templates'), 'TemplateDetail');
const PrivacyPage = page(() => import('./pages/Policies'), 'PrivacyPage');
const TermsPage = page(() => import('./pages/Policies'), 'TermsPage');

const BuilderPage = lazy(() => import('./pages/Builder').then((m) => ({ default: m.BuilderPage })));
const LazyBuilder = () => (
  <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}>
    <BuilderPage />
  </Suspense>
);

const Landing = lazy(() => import('./pages/ProfileLanding'));
const LinkedInPage = () => <Suspense fallback={<div className="lux-band min-h-[70vh]" />}><Landing kind="linkedin" /></Suspense>;
const Abroad = lazy(() => import('./pages/AbroadLanding'));
const GulfPage = () => <Suspense fallback={<div className="lux-band min-h-[70vh]" />}><Abroad kind="gulf" /></Suspense>;
const BdjobsPage = () => <Suspense fallback={<div className="lux-band min-h-[70vh]" />}><Landing kind="bdjobs" /></Suspense>;

const ROUTES: Record<string, ComponentType> = {
  '/': Home,
  '/services': ServicesPage,
  '/about': AboutPage,
  '/order': OrderPage,
  '/guides': GuidesPage,
  '/blog': BlogPage,
  '/templates': TemplatesPage,
  '/tools': ToolsPage,
  '/tools/cv-checker': CvChecker,
  '/builder': LazyBuilder,
  '/tools/photo-signature-resizer': PhotoResizer,
  '/tools/application-letter': ApplicationLetter,
  '/tools/job-match': JobMatch,
  '/tools/scam-shield': ScamShield,
  '/payment/success': PaymentSuccess,
  '/payment/cancel': PaymentCancel,
  '/account': AccountPage,
  '/pro': ProPage,
  '/admin': AdminDashboardPage,
  '/admin/careers': AdminCareersPage,
  '/admin/promos': AdminPromosPage,
  '/admin/templates': AdminTemplatesPage,
  '/admin/blog': AdminBlogPage,
  '/admin/manual': AdminManualPage,
  '/linkedin-profile-optimization': LinkedInPage,
  '/bdjobs-profile-optimization': BdjobsPage,
  '/cv-for-gulf-jobs': GulfPage,
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
  const post = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (post) return <BlogPostPage key={path} slug={post[1]} />;
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
          <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
            <Page />
          </Suspense>
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
