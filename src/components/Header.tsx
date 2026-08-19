import { Globe, LogOut, School, User } from 'lucide-react';
import { useAppContext, roleLabels } from '../contexts/AppContext';

export default function Header() {
  const { language, setLanguage, role, currentUser, logout } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <header className="relative z-50 h-[72px] border-b border-[#E7E7E4] bg-[#F7F7F5]/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black">
            <School className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-devanagari truncate text-sm font-semibold text-black sm:text-base">
              {t('Govt. Ashram School Pathraj', 'शासकीय आश्रमशाळा पाथरज')}
            </h1>
            <p className="hidden sm:block text-xs text-[#6B6B6B]">
              {t('Tal. Karjat, Dist. Raigad', 'ता. कर्जत, जि. रायगड')}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {currentUser && (
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-3 py-2 text-xs text-[#6B6B6B]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F2EF]">
                <User className="h-3 w-3 text-[#6B6B6B]" />
              </span>
              <span><strong className="font-medium text-black">{currentUser.username}</strong> <span className="mx-1 text-[#E7E7E4]">|</span> {roleLabels[role][language]}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="flex h-9 items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-white px-3 text-xs font-medium text-black hover:bg-[#F3F2EF]"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={logout}
            aria-label={t('Logout', 'लॉगआउट')}
            className="flex h-9 items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-white px-3 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('Logout', 'लॉगआउट')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
