import { Component, Suspense, lazy, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import PublicLayout from './components/layout/PublicLayout';

const PortalLayout = lazy(() => import('./components/layout/PortalLayout'));
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AcademicsPage = lazy(() => import('./pages/AcademicsPage'));
const AdmissionPage = lazy(() => import('./pages/AdmissionPage'));
const HostelPage = lazy(() => import('./pages/HostelPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const RegisterPage = lazy(() => import('./components/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage'));

const SITE_NAME = 'Government Ashram School, Pathraj';
const SITE_URL = 'https://ashram-shala-pathraj.onrender.com';

const pageMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SITE_NAME} | Tribal Residential School`,
    description: 'Official website of Government Secondary and Higher Secondary Ashram School, Pathraj, Raigad, Maharashtra.',
  },
  '/about': {
    title: `About | ${SITE_NAME}`,
    description: 'Learn about Ashram School Pathraj, its mission, history, campus, and commitment to tribal education.',
  },
  '/academics': {
    title: `Academics | ${SITE_NAME}`,
    description: 'Explore standards, subjects, teaching staff, and academic programmes at Ashram School Pathraj.',
  },
  '/admission': {
    title: `Admissions | ${SITE_NAME}`,
    description: 'View admission eligibility, required documents, the application process, and submit an admission enquiry.',
  },
  '/hostel': {
    title: `Hostel Facilities | ${SITE_NAME}`,
    description: 'Discover residential facilities, meals, supervision, and the daily routine at Ashram School Pathraj.',
  },
  '/gallery': {
    title: `Photo Gallery | ${SITE_NAME}`,
    description: 'See school life, campus activities, events, and student achievements at Ashram School Pathraj.',
  },
  '/contact': {
    title: `Contact | ${SITE_NAME}`,
    description: 'Contact Government Ashram School Pathraj by phone, email, WhatsApp, or get directions to the campus.',
  },
  '/privacy': {
    title: `Privacy Notice | ${SITE_NAME}`,
    description: 'Read how Ashram School Pathraj collects, uses, protects, and retains information submitted through this website.',
  },
  '/login': {
    title: `Staff and Parent Login | ${SITE_NAME}`,
    description: 'Secure sign-in for authorised parents and school staff.',
  },
  '/register': {
    title: `Parent Registration | ${SITE_NAME}`,
    description: 'Create a verified parent account for Ashram School Pathraj.',
  },
  '/forgot-password': {
    title: `Password Recovery | ${SITE_NAME}`,
    description: 'Recover access to your Ashram School Pathraj account.',
  },
};

function RouteEffects() {
  const { pathname } = useLocation();
  const { language } = useAppContext();
  const initialRoute = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (initialRoute.current) {
      initialRoute.current = false;
      return;
    }

    const focusTimer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>('#main-content, main h1');
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(focusTimer);
  }, [pathname]);

  useEffect(() => {
    const metadata = pageMetadata[pathname] ?? {
      title: `Page Not Found | ${SITE_NAME}`,
      description: 'The requested page could not be found on the Ashram School Pathraj website.',
    };
    document.title = metadata.title;
    document.documentElement.lang = language === 'mr' ? 'mr' : 'en';

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute('content', metadata.description);
    const indexableRoutes = ['/', '/about', '/academics', '/admission', '/hostel', '/gallery', '/contact', '/privacy'];
    document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.setAttribute(
      'content',
      indexableRoutes.includes(pathname) ? 'index, follow' : 'noindex, nofollow',
    );
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.setAttribute('href', `${SITE_URL}${pathname === '/' ? '' : pathname}`);
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', metadata.description);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', `${SITE_URL}${pathname === '/' ? '' : pathname}`);
  }, [language, pathname]);

  return null;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white" role="status" aria-live="polite">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-amber-500" aria-hidden="true" />
      <span className="sr-only">Loading page</span>
    </div>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application rendering failed', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-white">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-3 text-sm text-slate-300">Please reload the page. If the problem continues, contact the school office.</p>
            <button type="button" onClick={() => window.location.assign('/')} className="mt-6 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white">
              Return to homepage
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthChecking } = useAppContext();

  if (isAuthChecking) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <RouteEffects />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/admission" element={<AdmissionPage />} />
            <Route path="/hostel" element={<HostelPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/clerk/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/principal/login" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route
            path="/portal/*"
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MotionConfig reducedMotion="user">
          <AppErrorBoundary>
            <AppRoutes />
          </AppErrorBoundary>
        </MotionConfig>
      </AppProvider>
    </BrowserRouter>
  );
}
