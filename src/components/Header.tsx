import { Globe, LogOut, School, User, Wifi } from 'lucide-react';
import { motion } from 'motion/react';
import { roleLabels, useAppContext } from '../contexts/AppContext';

export default function Header() {
  const { language, setLanguage, role, currentUser, logout } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <header className="relative z-50 border-b border-white/70 bg-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_4px_22px_rgba(0,54,36,.05)] backdrop-blur-xl">
      <div className="flex min-h-7 items-center justify-center border-b border-[#bccac0]/25 bg-[#eff5ef]/55 px-4 py-1 text-center">
        <p className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#545f73]">
          <span className="font-devanagari font-semibold text-[#006948]">आदिवासी विकास विभाग, महाराष्ट्र शासन</span>
          <span className="text-[#bccac0]">•</span>
          <span>Tribal Development Department, Maharashtra</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="govt-seal hidden h-11 w-11 shrink-0 sm:flex">
            <School className="h-5 w-5 text-white!" />
          </div>
          <div className="min-w-0">
            <h1 className="font-devanagari truncate text-sm font-bold leading-tight text-[#006948] sm:text-lg">
              {t('Govt. Secondary & Higher Secondary Ashram School Pathraj', 'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज')}
            </h1>
            <p className="mt-0.5 hidden text-xs text-[#545f73] sm:block">
              {t('Tal. Karjat, Dist. Raigad, Maharashtra 410201', 'ता. कर्जत, जि. रायगड, पिनकोड ४१०२०१')}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-[#00855d]/15 bg-[#85f8c4]/20 px-3 py-2 text-xs text-[#006948] md:flex">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#68dba9] opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#00855d]" /></span>
            <Wifi className="h-3.5 w-3.5" />
            <span>{t('System Active', 'सिस्टम सक्रिय')}</span>
          </div>

          {currentUser && (
            <div className="hidden items-center gap-2 rounded-full border border-[#bccac0]/30 bg-white/55 px-3 py-2 text-xs text-[#3d4a42] xl:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d5e0f8]/70 text-[#545f73]"><User className="h-3.5 w-3.5" /></span>
              <span><strong className="font-semibold text-[#171d19]">{currentUser.username}</strong><span className="mx-1.5 text-[#bccac0]">•</span><span className="text-[#006948]">{roleLabels[role][language]}</span></span>
            </div>
          )}

          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')} className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#bccac0]/45 bg-white/55 px-3 text-xs font-semibold text-[#006948] hover:bg-white">
            <Globe className="h-3.5 w-3.5" /><span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </motion.button>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} type="button" onClick={logout} aria-label={t('Logout', 'लॉगआउट')} className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#ba1a1a]/15 bg-[#ffdad6]/45 px-3 text-xs font-semibold text-[#93000a] hover:bg-[#ffdad6]">
            <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('Logout', 'लॉगआउट')}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
