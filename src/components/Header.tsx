import { School, Globe, Shield, ChevronDown, Image } from 'lucide-react';
import { useAppContext, roleLabels, type AppRole } from '../contexts/AppContext';
import { useState } from 'react';

interface HeaderProps {
  onOpenPromptModal: () => void;
}

export default function Header({ onOpenPromptModal }: HeaderProps) {
  const { language, setLanguage, role, setRole } = useAppContext();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const roles: AppRole[] = ['web_creator', 'principal', 'class_teacher', 'clerk', 'subject_teacher', 'student_parent'];

  return (
    <header className="bg-slate-800 text-white shadow-lg relative z-50">
      {/* Government Banner */}
      <div className="bg-slate-900 py-1 px-4 text-center border-b border-slate-700">
        <p className="text-xs sm:text-sm" style={{ color: '#d4af37' }}>
          <span className="font-medium">आदिवासी विकास विभाग</span>
          <span className="mx-2">|</span>
          <span>Tribal Development Department, Maharashtra</span>
        </p>
      </div>

      {/* Main Header */}
      <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d4af37' }}>
            <School className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-tight">
              {t(
                'Shashkeey Madhyamik v Uchh Madhyamik Ashram Shala Pathraj',
                'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथराज'
              )}
            </h1>
            <p className="text-xs text-slate-300">
              {t(
                'Taluka Pathraj, District Raigad',
                'तालुका पाथराज, जिल्हा रायगड'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* UI Prompts Button */}
          <button
            onClick={onOpenPromptModal}
            className="flex items-center gap-1 px-2 py-1.5 text-xs rounded bg-slate-700 hover:bg-slate-600 transition-colors"
            title="UI Prompts"
          >
            <Image className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prompts</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="flex items-center gap-1 px-2 py-1.5 text-xs rounded bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs rounded transition-colors"
              style={{ backgroundColor: '#d4af37', color: '#1e293b' }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">{roleLabels[role][language]}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {roleDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white text-slate-800 rounded-lg shadow-xl py-1 min-w-48 z-50">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setRoleDropdownOpen(false); }}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 transition-colors ${
                      r === role ? 'bg-slate-50 font-semibold' : ''
                    }`}
                  >
                    {roleLabels[r][language]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
