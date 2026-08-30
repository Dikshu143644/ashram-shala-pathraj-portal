import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Globe, LogIn, Menu, X, School, Mail } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-app-gradient">
      {/* ===== AMBIENT ORB ENVIRONMENT ===== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="decorative-orb orb-purple" style={{ width: 520, height: 520, top: -140, left: -120 }} />
        <div className="decorative-orb orb-orange" style={{ width: 440, height: 440, top: 120, right: -140 }} />
        <div className="decorative-orb orb-purple" style={{ width: 480, height: 480, bottom: -180, left: '35%' }} />
        <div className="dot-grid-overlay" />
      </div>

      {/* ===== FLOATING GLASS NAVIGATION ===== */}
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
        <div
          className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[20px] border px-4 transition-all duration-300 sm:px-6 ${
            scrolled
              ? 'border-white/60 bg-white/70 shadow-[0_8px_32px_rgba(80,60,160,0.12)] backdrop-blur-2xl'
              : 'border-white/50 bg-white/55 shadow-[0_4px_20px_rgba(80,60,160,0.06)] backdrop-blur-xl'
          }`}
        >
          {/* Logo / School Name */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="govt-seal h-9 w-9 shrink-0">
              <School className="h-4 w-4 text-white" />
            </span>
            <span className="hidden font-devanagari text-sm font-semibold text-[#1A1A2E] sm:inline">
              आश्रमशाळा पाथरज
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#7C3AED]/10 text-[#6D28D9] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'
                      : 'text-[#6B7280] hover:bg-[#7C3AED]/[0.06] hover:text-[#1A1A2E]'
                  }`
                }
              >
                {language === 'en' ? link.labelEn : link.labelMr}
              </NavLink>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
              className="flex items-center gap-1.5 rounded-full border border-[#7C3AED]/16 bg-[#7C3AED]/[0.06] px-3 py-1.5 text-xs font-semibold text-[#6D28D9] transition-all hover:bg-[#7C3AED]/12"
            >
              <Globe className="h-3.5 w-3.5" />
              {language === 'en' ? 'मराठी' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden items-center gap-1.5 rounded-[14px] bg-gradient-to-br from-[#F97316] to-[#EA580C] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(249,115,22,0.28)] transition-all hover:-translate-y-0.5 hover:brightness-105 sm:flex"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t('Login', 'लॉगिन')}
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#7C3AED]/[0.06] hover:text-[#1A1A2E] lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav
            className="mx-auto mt-2 max-w-7xl rounded-[20px] border border-white/60 bg-white/80 p-3 shadow-[0_16px_48px_rgba(80,60,160,0.14)] backdrop-blur-2xl lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#7C3AED]/10 text-[#6D28D9]'
                        : 'text-[#6B7280] hover:bg-[#7C3AED]/[0.06] hover:text-[#1A1A2E]'
                    }`
                  }
                >
                  {language === 'en' ? link.labelEn : link.labelMr}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="mt-2 flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-[#F97316] to-[#EA580C] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(249,115,22,0.28)] sm:hidden"
              >
                <LogIn className="h-4 w-4" />
                {t('Login', 'लॉगिन')}
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="public-main relative z-10 pt-24">
        <Outlet />
      </main>

      {/* ===== GLASS FOOTER ===== */}
      <footer className="relative z-10 px-3 pb-4 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[24px] border border-white/55 bg-white/60 px-6 py-12 shadow-[0_8px_32px_rgba(80,60,160,0.08)] backdrop-blur-2xl sm:px-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* School Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <span className="govt-seal h-10 w-10">
                  <School className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="font-devanagari text-sm font-semibold text-[#1A1A2E]">आश्रमशाळा पाथरज</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">Govt. Ashram School</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#6B7280]">
                {t(
                  'Government Secondary and Higher Secondary Ashram School, Pathraj. Under Tribal Development Department, Maharashtra.',
                  'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज. आदिवासी विकास विभाग, महाराष्ट्र शासन.'
                )}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-[#1A1A2E]">
                {t('Quick Links', 'झटपट लिंक')}
              </h4>
              <ul className="space-y-2">
                {navLinks.slice(1).map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-xs text-[#6B7280] no-underline transition-colors hover:text-[#7C3AED]">
                      {language === 'en' ? link.labelEn : link.labelMr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-[#1A1A2E]">
                {t('Contact', 'संपर्क')}
              </h4>
              <ul className="space-y-2 text-xs text-[#6B7280]">
                <li>{t('Principal: 9423864391', 'मुख्याध्यापक: ९४२३८६४३९१')}</li>
                <li>{t('Office: 7666971183', 'कार्यालय: ७६६६९७११८३')}</li>
                <li className="flex items-center gap-1.5 font-medium text-[#7C3AED]">
                  <Mail className="h-3 w-3" /> hmpathraj22@gmail.com
                </li>
              </ul>
            </div>

            {/* Address */}
            <div>
              <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-[#1A1A2E]">
                {t('Address', 'पत्ता')}
              </h4>
              <p className="text-xs leading-relaxed text-[#6B7280]">
                {t(
                  'Pathraj, Tal. Karjat, Dist. Raigad, Maharashtra 410201',
                  'पाथरज, ता. कर्जत, जि. रायगड, महाराष्ट्र ४१०२०१'
                )}
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-[#7C3AED]/10 pt-6 text-center">
            <p className="text-[11px] text-[#9CA3AF]">
              &copy; 2026 {t('Tribal Development Department, Government of Maharashtra', 'आदिवासी विकास विभाग, महाराष्ट्र शासन')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
