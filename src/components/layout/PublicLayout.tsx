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
    <div className="min-h-screen" style={{ background: '#F7F7F5', color: '#000' }}>
      {/* Fixed Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E7E7E4] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / School Name */}
          <Link to="/" className="flex items-center gap-3 text-black no-underline">
            <div className="govt-seal h-9 w-9">
              <School className="h-4 w-4 text-white!" />
            </div>
            <span className="hidden font-devanagari text-sm font-semibold sm:inline">
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
                      ? 'bg-[#F3F2EF] text-black'
                      : 'text-[#6B6B6B] hover:text-black hover:bg-[#F3F2EF]'
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
              className="flex items-center gap-1.5 rounded-full border border-[#E7E7E4] px-3 py-1.5 text-xs font-medium text-[#6B6B6B] transition-colors hover:border-[#D4D4D1] hover:text-black"
            >
              <Globe className="h-3.5 w-3.5" />
              {language === 'en' ? 'मराठी' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#1a1a1a] sm:flex"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t('Login', 'लॉगिन')}
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-[#6B6B6B] hover:text-black lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-[#E7E7E4] bg-white px-4 py-4 lg:hidden" aria-label="Mobile navigation">
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
                        ? 'bg-[#F3F2EF] text-black'
                        : 'text-[#6B6B6B] hover:text-black hover:bg-[#F3F2EF]'
                    }`
                  }
                >
                  {language === 'en' ? link.labelEn : link.labelMr}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="mt-2 flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white sm:hidden"
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
      <footer className="border-t border-[#E7E7E4] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* School Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="govt-seal h-10 w-10">
                  <School className="h-5 w-5 text-white!" />
                </div>
                <div>
                  <p className="font-devanagari text-sm font-semibold text-black">आश्रमशाळा पाथरज</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#A3A3A3]">Est. Government School</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#6B6B6B]">
                {t(
                  'Government Secondary and Higher Secondary Ashram School, Pathraj. Under Tribal Development Department, Maharashtra.',
                  'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज. आदिवासी विकास विभाग, महाराष्ट्र शासन.'
                )}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                {t('Quick Links', 'झटपट लिंक')}
              </h4>
              <ul className="space-y-2">
                {navLinks.slice(1).map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-xs text-[#6B6B6B] transition-colors hover:text-black no-underline">
                      {language === 'en' ? link.labelEn : link.labelMr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                {t('Contact', 'संपर्क')}
              </h4>
              <ul className="space-y-2 text-xs text-[#6B6B6B]">
                <li>{t('Principal: 9423864391', 'मुख्याध्यापक: ९४२३८६४३९१')}</li>
                <li>{t('Office: 7666971183', 'कार्यालय: ७६६६९७११८३')}</li>
                <li>hmpathraj22@gmail.com</li>
              </ul>
            </div>

            {/* Address */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                {t('Address', 'पत्ता')}
              </h4>
              <p className="text-xs leading-relaxed text-[#6B6B6B]">
                {t(
                  'Pathraj, Tal. Karjat, Dist. Raigad, Maharashtra 410201',
                  'पाथरज, ता. कर्जत, जि. रायगड, महाराष्ट्र ४१०२०१'
                )}
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-[#E7E7E4] pt-6 text-center">
            <p className="text-[11px] text-[#A3A3A3]">
              &copy; 2026 {t('Tribal Development Department, Government of Maharashtra', 'आदिवासी विकास विभाग, महाराष्ट्र शासन')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
