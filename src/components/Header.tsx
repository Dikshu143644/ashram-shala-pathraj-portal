import { School, Globe, Wifi, LogOut, User } from 'lucide-react';
import { useAppContext, roleLabels } from '../contexts/AppContext';
import { motion } from 'motion/react';

export default function Header() {
  const { language, setLanguage, role, currentUser, logout } = useAppContext();

  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <header className="relative z-50 gold-border-bottom" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
      {/* Government Banner */}
      <div className="py-1.5 px-4 text-center" style={{ background: 'rgba(0,0,0,0.25)' }}>
        <p className="text-xs sm:text-sm flex items-center justify-center gap-2">
          <span className="font-medium font-devanagari" style={{ color: '#d4af37' }}>
            आदिवासी विकास विभाग, महाराष्ट्र शासन
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Tribal Development Department, Maharashtra</span>
        </p>
      </div>

      {/* Main Header */}
      <div className="px-4 py-3 sm:py-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Gold circular badge */}
          <div className="govt-seal animate-pulse-gold">
            <School className="w-6 h-6 text-slate-900" />
          </div>

          <div>
            <h1 className="text-sm sm:text-lg font-bold leading-tight font-devanagari" style={{ color: '#d4af37' }}>
              {t(
                'Govt. Secondary & Higher Secondary Ashram School Pathraj',
                'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज'
              )}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {t(
                'Tal. Karjat, Dist. Raigad, Maharashtra 410201',
                'ता. कर्जत, जि. रायगड, पिनकोड ४१०२०१'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* System Active Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs" style={{ background: 'rgba(5, 150, 105, 0.15)', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300">{t('System Active', 'सिस्टम सक्रिय')}</span>
          </div>

          {/* Welcome User Info */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-200" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {t(`Welcome, ${currentUser.username}`, `स्वागत, ${currentUser.username}`)}
                <span className="text-slate-400 mx-1">|</span>
                <span style={{ color: '#d4af37' }}>{roleLabels[role][language]}</span>
              </span>
            </div>
          )}

          {/* Language Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 text-white"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </motion.button>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 text-white hover:bg-red-500/20 hover:border-red-500/30"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline text-red-300">{t('Logout', 'लॉगआउट')}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
