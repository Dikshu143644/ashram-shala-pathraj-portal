import { School, Globe, Shield, ChevronDown, Image, Wifi } from 'lucide-react';
import { useAppContext, roleLabels, type AppRole } from '../contexts/AppContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenPromptModal: () => void;
}

export default function Header({ onOpenPromptModal }: HeaderProps) {
  const { language, setLanguage, role, setRole } = useAppContext();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const roles: AppRole[] = ['web_creator', 'principal', 'class_teacher', 'clerk', 'subject_teacher', 'student_parent'];

  const roleIcons: Record<AppRole, string> = {
    web_creator: '#d4af37',
    principal: '#059669',
    class_teacher: '#3b82f6',
    clerk: '#8b5cf6',
    subject_teacher: '#06b6d4',
    student_parent: '#f97316',
  };

  return (
    <header className="relative z-50 header-gradient text-white shadow-lg gold-border-bottom">
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
          {/* Government Emblem / Ashoka Pillar placeholder */}
          <div className="govt-seal animate-pulse-gold">
            <School className="w-6 h-6 text-slate-900" />
          </div>

          <div>
            <h1 className="text-sm sm:text-lg font-bold leading-tight font-devanagari" style={{ color: '#d4af37' }}>
              {t(
                'Shashkeey Madhyamik v Uchh Madhyamik Ashram Shala Pathraj',
                'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथराज'
              )}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {t(
                'Tal. Sudhagad, Dist. Raigad, Maharashtra 402205',
                'ता. सुधागड, जि. रायगड, महाराष्ट्र ४०२२०५'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* System Active Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs" style={{ background: 'rgba(5, 150, 105, 0.15)' }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300">{t('System Active', 'सिस्टम सक्रिय')}</span>
          </div>

          {/* UI Prompts Button */}
          <button
            onClick={onOpenPromptModal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            title="UI Prompts"
          >
            <Image className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prompts</span>
          </button>

          {/* Language Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </motion.button>

          {/* Role Switcher */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all duration-200 shadow-md"
              style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)', color: '#1e293b' }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{roleLabels[role][language]}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
              {roleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 bg-white text-slate-800 rounded-xl shadow-xl py-2 min-w-52 z-50 border border-slate-100 overflow-hidden"
                >
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setRoleDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        r === role ? 'bg-amber-50 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: roleIcons[r] }}
                      />
                      {roleLabels[r][language]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
