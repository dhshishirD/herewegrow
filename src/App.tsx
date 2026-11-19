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
import { BlogPage, BlogPostPage } from './pages/Blog';
import { GuidePage, GuidesPage } from './pages/Guides';
import { Home } from './pages/Home';
import { PaymentCancel, PaymentSuccess } from './pages/PaymentResult';
import { PhotoResizer } from './pages/PhotoResizer';
import { ApplicationLetter } from './pages/ApplicationLetter';
import { JobMatch } from './pages/JobMatch';
import { ScamShield } from './pages/ScamShield';
import { ProPage } from './pages/Pro';
import { AdminDashboardPage } from './pages/AdminDashboard';
import { AdminCareersPage } from './pages/AdminCareers';
import { AdminManualPage } from './pages/AdminManual';
import { AdminCustomersPage } from './pages/AdminCustomers';
import { AdminPromosPage } from './pages/AdminPromos';
import { AdminTemplatesPage } from './pages/AdminTemplates';
import { AdminBlogPage } from './pages/AdminBlog';
import { capturePromoParam } from './lib/promo';
import { NotFound, PrivacyPage, TermsPage } from './pages/Policies';
import { TemplateDetail, TemplatesPage } from './pages/Templates';

const BuilderPage = lazy(() => import('./pages/Builder').then((m) => ({ default: m.BuilderPage })));
const LazyBuilder = () => (
  <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}>
    <BuilderPage />
  </Suspense>
);

const BiodataPageLazy = lazy(() => import('./pages/Biodata').then((m) => ({ default: m.BiodataPage })));
const LazyBiodata = () => (
  <Suspense fallback={null}>
    <BiodataPageLazy />
  </Suspense>
);
const BiodataHub = lazy(() => import('./pages/BiodataPages').then((m) => ({ default: m.BiodataHubPage })));
const BiodataStyle = lazy(() => import('./pages/BiodataPages').then((m) => ({ default: m.BiodataStylePage })));
const EuropassPillar = lazy(() => import('./pages/EuropassPages').then((m) => ({ default: m.EuropassPillarPage })));
const EuropassHub = lazy(() => import('./pages/EuropassPages').then((m) => ({ default: m.EuropassHubPage })));
const EuropassWord = lazy(() => import('./pages/EuropassPages').then((m) => ({ default: m.EuropassWordPage })));
const lazyHs = (name: 'AcademicCvPage' | 'ScholarshipCvPage' | 'HigherStudyHubPage') => lazy(() => import('./pages/HigherStudyPages').then((m) => ({ default: m[name] })));
const AcademicCv = lazyHs('AcademicCvPage');
const ScholarshipCv = lazyHs('ScholarshipCvPage');
const HigherStudyHub = lazyHs('HigherStudyHubPage');
const AcademicCvRoute = () => <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><AcademicCv /></Suspense>;
const ScholarshipCvRoute = () => <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><ScholarshipCv /></Suspense>;
const HigherStudyRoute = () => <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><HigherStudyHub /></Suspense>;
const EuropassPillarRoute = () => <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><EuropassPillar /></Suspense>;
const EuropassWordRoute = () => <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><EuropassWord /></Suspense>;
const PartnerRoute = lazy(() => import('./pages/Partner').then((m) => ({ default: m.PartnerRoute })));
const PartnerIntake = lazy(() => import('./pages/PartnerIntake').then((m) => ({ default: m.PartnerIntake })));
const AdminPartnersLazy = lazy(() => import('./pages/AdminPartners').then((m) => ({ default: m.AdminPartnersPage })));
const AdminPartnersPage = () => <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><AdminPartnersLazy /></Suspense>;
const Landing = lazy(() => import('./pages/ProfileLanding'));
const LinkedInPage = () => <Suspense fallback={<div className="lux-band min-h-[70vh]" />}><Landing kind="linkedin" /></Suspense>;
const Abroad = lazy(() => import('./pages/AbroadLanding'));
const GulfPage = () => <Suspense fallback={<div className="lux-band min-h-[70vh]" />}><Abroad kind="gulf" /></Suspense>;
const BdjobsPage = () => <Suspense fallback={<div className="lux-band min-h-[70vh]" />}><Landing kind="bdjobs" /></Suspense>;

const ROUTES: Record<string, () => JSX.Element> = {
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
  '/biodata': LazyBiodata,
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
  '/admin/customers': AdminCustomersPage,
  '/admin/manual': AdminManualPage,
  '/admin/partners': AdminPartnersPage,
  '/linkedin-profile-optimization': LinkedInPage,
  '/bdjobs-profile-optimization': BdjobsPage,
  '/cv-for-gulf-jobs': GulfPage,
  '/europass-cv': EuropassPillarRoute,
  '/europass-cv-template-word': EuropassWordRoute,
  '/academic-cv': AcademicCvRoute,
  '/scholarship-cv': ScholarshipCvRoute,
  '/higher-study': HigherStudyRoute,
  '/contact': ContactPage,
  '/privacy': PrivacyPage,
  '/terms': TermsPage,
};

function Page() {
  const path = usePath();
  if (path === '/partner' || path.startsWith('/partner/')) return <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><PartnerRoute path={path} /></Suspense>;
  const intake = path.match(/^\/p\/([a-z0-9]{6,16})$/);
  if (intake) return <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><PartnerIntake key={path} code={intake[1]} /></Suspense>;
  if (path === '/templates/category/europass-cv') return <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><EuropassHub /></Suspense>;
  if (path === '/templates/category/marriage-biodata') return <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><BiodataHub /></Suspense>;
  const bio = path.match(/^\/templates\/biodata-([a-z0-9-]+)$/);
  if (bio) return <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}><BiodataStyle key={path} slug={bio[1]} /></Suspense>;
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
  const path = usePath();
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
        <main id="main" className={path.startsWith('/builder') ? '' : 'pb-20'}>
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
