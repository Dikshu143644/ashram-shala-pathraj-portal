import { Globe, LogOut, School, User } from 'lucide-react';
import { motion } from 'motion/react';
import { roleLabels, useAppContext } from '../contexts/AppContext';

export default function Header() {
  const { language, setLanguage, role, currentUser, logout } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <header className="relative z-50 border-b border-[#E7E7E4] bg-white/80 backdrop-blur-xl">
      <div className="flex min-h-7 items-center justify-center border-b border-[#E7E7E4] bg-[#F3F2EF]/60 px-4 py-1 text-center">
        <p className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#6B6B6B]">
          <span className="font-devanagari font-semibold text-black">आदिवासी विकास विभाग, महाराष्ट्र शासन</span>
          <span className="text-[#E7E7E4]">/</span>
          <span>Tribal Development Department, Maharashtra</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="govt-seal hidden h-10 w-10 shrink-0 sm:flex">
            <School className="h-4.5 w-4.5 text-white!" />
          </div>
          <div className="min-w-0">
            <h1 className="font-devanagari truncate text-sm font-semibold leading-tight text-black sm:text-base">
              {t('Govt. Secondary & Higher Secondary Ashram School Pathraj', 'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज')}
            </h1>
            <p className="mt-0.5 hidden text-xs text-[#6B6B6B] sm:block">
              {t('Tal. Karjat, Dist. Raigad, Maharashtra 410201', 'ता. कर्जत, जि. रायगड, पिनकोड ४१०२०१')}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-[#F3F2EF] px-3 py-2 text-xs text-[#6B6B6B] md:flex">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
            <span>{t('Active', 'सक्रिय')}</span>
          </div>

          {currentUser && (
            <div className="hidden items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-3 py-2 text-xs text-[#6B6B6B] xl:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F2EF]"><User className="h-3.5 w-3.5 text-[#6B6B6B]" /></span>
              <span><strong className="font-medium text-black">{currentUser.username}</strong><span className="mx-1.5 text-[#E7E7E4]">/</span><span className="text-[#6B6B6B]">{roleLabels[role][language]}</span></span>
            </div>
          )}

          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')} className="flex min-h-9 items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-white px-3 text-xs font-medium text-black hover:bg-[#F3F2EF]">
            <Globe className="h-3.5 w-3.5" /><span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </motion.button>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} type="button" onClick={logout} aria-label={t('Logout', 'लॉगआउट')} className="flex min-h-9 items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-white px-3 text-xs font-medium text-[#6B6B6B] hover:border-red-200 hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('Logout', 'लॉगआउट')}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
