import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Globe, LogIn, Menu, X, School } from 'lucide-react';
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
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Fixed Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-900/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / School Name */}
          <Link to="/" className="flex items-center gap-3 text-white no-underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/30">
              <School className="h-4 w-4 text-amber-500" />
            </div>
            <span className="hidden font-devanagari text-sm font-semibold text-white sm:inline">
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
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/80 hover:text-amber-500 hover:bg-white/5'
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
              className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Globe className="h-3.5 w-3.5" />
              {language === 'en' ? 'मराठी' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden items-center gap-1.5 rounded-full border border-amber-600/50 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-500 transition-all hover:bg-amber-500/20 sm:flex"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t('Login', 'लॉगिन')}
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-white/80 hover:text-white lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 py-4 lg:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/80 hover:text-amber-500 hover:bg-white/5'
                    }`
                  }
                >
                  {language === 'en' ? link.labelEn : link.labelMr}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="mt-2 flex items-center gap-2 rounded-full border border-amber-600/50 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-500 sm:hidden"
              >
                <LogIn className="h-4 w-4" />
                {t('Login', 'लॉगिन')}
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* School Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/30">
                  <School className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-devanagari text-sm font-semibold text-white">आश्रमशाळा पाथरज</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Est. Government School</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {t(
                  'Government Secondary and Higher Secondary Ashram School, Pathraj. Under Tribal Development Department, Maharashtra.',
                  'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज. आदिवासी विकास विभाग, महाराष्ट्र शासन.'
                )}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">
                {t('Quick Links', 'झटपट लिंक')}
              </h4>
              <ul className="space-y-2">
                {navLinks.slice(1).map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-xs text-slate-400 transition-colors hover:text-amber-500 no-underline">
                      {language === 'en' ? link.labelEn : link.labelMr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">
                {t('Contact', 'संपर्क')}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>{t('Principal: 9423864391', 'मुख्याध्यापक: ९४२३८६४३९१')}</li>
                <li>{t('Office: 7666971183', 'कार्यालय: ७६६६९७११८३')}</li>
                <li className="text-amber-500">hmpathraj22@gmail.com</li>
              </ul>
            </div>

            {/* Address */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">
                {t('Address', 'पत्ता')}
              </h4>
              <p className="text-xs leading-relaxed text-slate-400">
                {t(
                  'Pathraj, Tal. Karjat, Dist. Raigad, Maharashtra 410201',
                  'पाथरज, ता. कर्जत, जि. रायगड, महाराष्ट्र ४१०२०१'
                )}
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center">
            <p className="text-[11px] text-slate-500">
              &copy; 2026 {t('Tribal Development Department, Government of Maharashtra', 'आदिवासी विकास विभाग, महाराष्ट्र शासन')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
