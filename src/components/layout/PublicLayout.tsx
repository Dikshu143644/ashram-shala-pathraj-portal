import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Globe, LogIn, Menu, School, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const navLinks = [
  { to: '/', labelEn: 'Home', labelMr: 'मुख्यपृष्ठ' },
  { to: '/about', labelEn: 'About', labelMr: 'माहिती' },
  { to: '/academics', labelEn: 'Academics', labelMr: 'शैक्षणिक' },
  { to: '/admission', labelEn: 'Admission', labelMr: 'प्रवेश' },
  { to: '/hostel', labelEn: 'Hostel', labelMr: 'वसतिगृह' },
  { to: '/gallery', labelEn: 'Gallery', labelMr: 'गॅलरी' },
  { to: '/contact', labelEn: 'Contact', labelMr: 'संपर्क' },
];

export default function PublicLayout() {
  const { language, setLanguage } = useAppContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-950">
      <a href="#main-content" className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg transition-transform focus:translate-y-0">
        {t('Skip to main content', 'मुख्य मजकुराकडे जा')}
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-white no-underline" aria-label={t('Ashram School Pathraj homepage', 'आश्रमशाळा पाथरज मुख्यपृष्ठ')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20">
              <School className="h-4 w-4 text-amber-400" aria-hidden="true" />
            </div>
            <span className="hidden font-devanagari text-sm font-semibold text-white sm:inline">आश्रमशाळा पाथरज</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={t('Main navigation', 'मुख्य नेव्हिगेशन')}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-amber-300'
                }`}
              >
                {language === 'en' ? link.labelEn : link.labelMr}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
              className="flex min-h-10 items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={language === 'en' ? 'मराठी भाषेत बदला' : 'Switch to English'}
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              {language === 'en' ? 'मराठी' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden min-h-10 items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 sm:flex"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              {t('Staff / Parent Login', 'कर्मचारी / पालक लॉगिन')}
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label={mobileMenuOpen ? t('Close menu', 'मेनू बंद करा') : t('Open menu', 'मेनू उघडा')}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-navigation" className="border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-xl lg:hidden" aria-label={t('Mobile navigation', 'मोबाईल नेव्हिगेशन')}>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => `rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-amber-300'
                  }`}
                >
                  {language === 'en' ? link.labelEn : link.labelMr}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-2 flex min-h-11 items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300 sm:hidden"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                {t('Staff / Parent Login', 'कर्मचारी / पालक लॉगिन')}
              </button>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" className="pt-16" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20">
                  <School className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-devanagari text-sm font-semibold text-white">आश्रमशाळा पाथरज</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">{t('Government residential school', 'शासकीय निवासी शाळा')}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {t(
                  'Government Secondary and Higher Secondary Ashram School, Pathraj. Under Tribal Development Department, Maharashtra.',
                  'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज. आदिवासी विकास विभाग, महाराष्ट्र शासन.'
                )}
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">{t('Quick Links', 'झटपट लिंक')}</h2>
              <ul className="space-y-2">
                {navLinks.slice(1).map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-xs text-slate-300 no-underline transition-colors hover:text-amber-300">
                      {language === 'en' ? link.labelEn : link.labelMr}
                    </Link>
                  </li>
                ))}
                <li><Link to="/privacy" className="text-xs text-slate-300 no-underline transition-colors hover:text-amber-300">{t('Privacy Notice', 'गोपनीयता सूचना')}</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">{t('Contact', 'संपर्क')}</h2>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><a href="tel:+919423864391" className="hover:text-amber-300">{t('Principal: 9423864391', 'मुख्याध्यापक: ९४२३८६४३९१')}</a></li>
                <li><a href="tel:+917666971183" className="hover:text-amber-300">{t('Office: 7666971183', 'कार्यालय: ७६६६९७११८३')}</a></li>
                <li><a href="mailto:hmpathraj22@gmail.com" className="break-all text-amber-300 hover:text-amber-200">hmpathraj22@gmail.com</a></li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">{t('Address', 'पत्ता')}</h2>
              <address className="text-xs not-italic leading-relaxed text-slate-300">
                {t('Pathraj, Tal. Karjat, Dist. Raigad, Maharashtra 410201', 'पाथरज, ता. कर्जत, जि. रायगड, महाराष्ट्र ४१०२०१')}
              </address>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center">
            <p className="text-[11px] text-slate-400">&copy; {currentYear} {t('Tribal Development Department, Government of Maharashtra', 'आदिवासी विकास विभाग, महाराष्ट्र शासन')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
