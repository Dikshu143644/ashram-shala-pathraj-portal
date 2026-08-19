import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bot,
  Building2,
  ClipboardList,
  FileStack,
  GraduationCap,
  Menu,
  MessageCircle,
  School,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { AppProvider, type AppRole, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ChangePasswordPage from './components/ChangePasswordPage';
import AdmissionPortal from './components/AdmissionPortal';
import ClassTeacherPortal from './components/ClassTeacherPortal';
import HostelPortal from './components/HostelPortal';
import WhatsAppHub from './components/WhatsAppHub';
import ClerkPortal from './components/ClerkPortal';
import SuperAdminCenter from './components/SuperAdminCenter';
import AiAssistant from './components/AiAssistant';

type TabKey = 'admission' | 'classTeacher' | 'hostel' | 'whatsapp' | 'clerk' | 'superAdmin' | 'aiAssistant';

interface TabConfig {
  key: TabKey;
  labelEn: string;
  labelMr: string;
  icon: typeof GraduationCap;
  roles: AppRole[];
}

const tabs: TabConfig[] = [
  { key: 'admission', labelEn: 'Admissions', labelMr: 'प्रवेश', icon: GraduationCap, roles: ['web_creator', 'principal', 'class_teacher', 'clerk', 'student_parent'] },
  { key: 'classTeacher', labelEn: 'Attendance', labelMr: 'उपस्थिती', icon: ClipboardList, roles: ['web_creator', 'principal', 'class_teacher', 'subject_teacher'] },
  { key: 'hostel', labelEn: 'Hostel', labelMr: 'वसतिगृह', icon: Building2, roles: ['web_creator', 'principal', 'class_teacher'] },
  { key: 'whatsapp', labelEn: 'Messages', labelMr: 'संदेश', icon: MessageCircle, roles: ['web_creator', 'principal', 'class_teacher'] },
  { key: 'clerk', labelEn: 'Staff & Letters', labelMr: 'कर्मचारी व पत्रे', icon: FileStack, roles: ['web_creator', 'principal', 'clerk'] },
  { key: 'superAdmin', labelEn: 'Administration', labelMr: 'प्रशासन', icon: Shield, roles: ['web_creator'] },
  { key: 'aiAssistant', labelEn: 'AI Assistant', labelMr: 'AI सहाय्यक', icon: Bot, roles: ['web_creator', 'principal', 'class_teacher', 'clerk', 'subject_teacher', 'student_parent'] },
];

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen overflow-hidden">
      <div className="decorative-orb orb-emerald h-80 w-80 -translate-x-32 -translate-y-32" />
      <div className="splash-logo relative">
        <div className="govt-seal h-24! w-24!">
          <School className="h-11 w-11 text-white!" aria-hidden="true" />
        </div>
        <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe088] text-[#574500] shadow-md">
          <Sparkles className="h-4 w-4" />
        </span>
      </div>
      <div className="splash-text mt-7 px-6 text-center">
        <p className="font-label text-xs text-[#006948]">PATHRAJ ASHRAM · EDUCATION PORTAL</p>
        <h1 className="font-devanagari mt-3 text-xl font-bold text-[#171d19] sm:text-2xl">
          शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
        </h1>
        <p className="mt-3 text-sm text-[#545f73]">Preparing your workspace…</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { language, role, isAuthenticated, isAuthChecking, mustChangePassword, isRegistering } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabKey>('admission');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const visibleTabs = tabs.filter((tab) => tab.roles.includes(role));

  useEffect(() => {
    const currentVisible = tabs.filter((tab) => tab.roles.includes(role));
    if (!currentVisible.find((tab) => tab.key === activeTab) && currentVisible.length > 0) {
      setActiveTab(currentVisible[0].key);
    }
  }, [role, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'admission': return <AdmissionPortal />;
      case 'classTeacher': return <ClassTeacherPortal />;
      case 'hostel': return <HostelPortal />;
      case 'whatsapp': return <WhatsAppHub />;
      case 'clerk': return <ClerkPortal />;
      case 'superAdmin': return <SuperAdminCenter />;
      case 'aiAssistant': return <AiAssistant />;
      default: return <AdmissionPortal />;
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5fbf5]" role="status" aria-label="Checking secure session">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#85f8c4] border-t-[#006948]" />
      </div>
    );
  }
  if (!isAuthenticated && isRegistering) return <RegisterPage />;
  if (!isAuthenticated) return <LoginPage />;
  if (mustChangePassword) return <ChangePasswordPage />;
  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  const navigation = (closeAfterSelection = false) => (
    <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4" aria-label="Portal navigation">
      {visibleTabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              setActiveTab(tab.key);
              if (closeAfterSelection) setSidebarOpen(false);
            }}
            className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition-all duration-300 ${
              active
                ? 'bg-[#00855d] text-white shadow-[0_8px_22px_rgba(0,105,72,0.2)]'
                : 'text-[#3d4a42] hover:translate-x-1 hover:bg-[#e4eae4]/70 hover:text-[#006948]'
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? 'bg-white/16' : 'bg-white/60 group-hover:bg-white'}`}>
              <tab.icon className="h-5 w-5" />
            </span>
            <span className="truncate">{language === 'en' ? tab.labelEn : tab.labelMr}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="bg-app-gradient relative flex h-screen h-[100dvh] flex-col">
      <div className="decorative-orb orb-emerald floating-shape-1 -right-24 -top-24 h-[420px] w-[420px]" />
      <div className="decorative-orb orb-gold floating-shape-2 -left-28 bottom-[8%] h-[360px] w-[360px]" />
      <div className="dot-grid-overlay" />
      <Header />

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <aside className="sidebar-glass hidden w-72 shrink-0 flex-col lg:flex">
          <div className="border-b border-[#bccac0]/30 px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="govt-seal h-12 w-12 shrink-0">
                <School className="h-6 w-6 text-white!" />
              </div>
              <div className="min-w-0">
                <p className="font-display truncate text-lg font-bold text-[#006948]">Pathraj Ashram</p>
                <p className="font-label mt-0.5 text-[10px] text-[#545f73]">EDUCATION PORTAL</p>
              </div>
            </div>
          </div>
          {navigation()}
          <div className="m-4 rounded-2xl border border-[#cba72f]/20 bg-[#ffe088]/25 p-4">
            <p className="font-label text-[10px] text-[#735c00]">TRIBAL WELFARE DEPARTMENT</p>
            <p className="mt-1 text-xs leading-relaxed text-[#3d4a42]">Serving Pathraj, Karjat · Raigad</p>
          </div>
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-[#171d19]/35 backdrop-blur-sm" />
              <motion.aside
                initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
                transition={{ type: 'tween', duration: 0.22 }}
                onClick={(event) => event.stopPropagation()}
                className="sidebar-glass absolute inset-y-0 left-0 z-10 flex w-72 flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-[#bccac0]/30 p-4">
                  <div className="flex items-center gap-3 text-[#006948]">
                    <School className="h-6 w-6" />
                    <span className="font-display font-bold">Pathraj Ashram</span>
                  </div>
                  <button type="button" aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="rounded-full p-2 text-[#3d4a42] hover:bg-[#e4eae4]">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {navigation(true)}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-5">
          <div className="sticky top-0 z-20 border-b border-white/60 bg-white/55 px-3 py-2 backdrop-blur-xl lg:hidden">
            <button type="button" onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#006948] hover:bg-[#e9efe9]">
              <Menu className="h-4 w-4" />
              {language === 'en' ? 'Menu' : 'मेनू'}
            </button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={activeTab} initial={false} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav
        className="fixed inset-x-3 z-40 rounded-[1.4rem] border border-white/75 bg-white/85 shadow-[0_12px_36px_rgba(0,54,36,0.16)] backdrop-blur-xl lg:hidden"
        style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        aria-label="Mobile portal navigation"
      >
        <div className="overflow-x-auto overscroll-x-contain rounded-[inherit] touch-pan-x">
          <div className="flex w-max min-w-full">
            {visibleTabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex min-w-[5.5rem] shrink-0 flex-col items-center px-2 py-2.5 text-[10px] font-semibold ${active ? 'text-[#006948]' : 'text-[#6d7a72]'}`}
                >
                  <span className={`mb-1 rounded-full px-3 py-1 ${active ? 'bg-[#85f8c4]/45' : ''}`}><tab.icon className="h-5 w-5" /></span>
                  <span className="whitespace-nowrap">{language === 'en' ? tab.labelEn : tab.labelMr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppContent /></AppProvider>;
}
