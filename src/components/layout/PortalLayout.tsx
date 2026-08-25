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
  Phone,
  School,
  Shield,
  X,
} from 'lucide-react';
import { type AppRole, useAppContext } from '../../contexts/AppContext';
import Header from '../Header';
import ChangePasswordPage from '../ChangePasswordPage';
import PhoneVerificationPopup from '../PhoneVerificationPopup';
import AdmissionPortal from '../AdmissionPortal';
import ClassTeacherPortal from '../ClassTeacherPortal';
import HostelPortal from '../HostelPortal';
import WhatsAppHub from '../WhatsAppHub';
import ClerkPortal from '../ClerkPortal';
import SuperAdminCenter from '../SuperAdminCenter';
import AiAssistant from '../AiAssistant';
import CallingAgent from '../CallingAgent';

type TabKey = 'admission' | 'classTeacher' | 'hostel' | 'whatsapp' | 'clerk' | 'superAdmin' | 'aiAssistant' | 'callingAgent';

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
  { key: 'callingAgent', labelEn: 'Voice Agent', labelMr: 'व्हॉइस एजंट', icon: Phone, roles: ['web_creator', 'principal'] },
];

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen overflow-hidden">
      <div className="splash-logo relative">
        <div className="govt-seal h-24! w-24!">
          <School className="h-11 w-11 text-white!" aria-hidden="true" />
        </div>
      </div>
      <div className="splash-text mt-7 px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#6B6B6B]">PATHRAJ ASHRAM - EDUCATION PORTAL</p>
        <h1 className="font-devanagari mt-3 text-xl font-bold text-black sm:text-2xl">
          शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
        </h1>
        <p className="mt-3 text-sm text-[#6B6B6B]">Preparing your workspace...</p>
      </div>
    </div>
  );
}

export default function PortalLayout() {
  const { language, role, mustChangePassword, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabKey>('admission');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneVerificationDismissed, setPhoneVerificationDismissed] = useState(false);
  const visibleTabs = tabs.filter((tab) => tab.roles.includes(role));

  useEffect(() => {
    const currentVisible = tabs.filter((tab) => tab.roles.includes(role));
    if (!currentVisible.find((tab) => tab.key === activeTab) && currentVisible.length > 0) {
      setActiveTab(currentVisible[0].key);
    }
  }, [role, activeTab]);

  // Show phone verification popup if phone is not verified
  useEffect(() => {
    if (currentUser && !currentUser.phoneVerified && !phoneVerificationDismissed && !mustChangePassword) {
      setShowPhoneVerification(true);
    }
  }, [currentUser, phoneVerificationDismissed, mustChangePassword]);

  const renderContent = () => {
    switch (activeTab) {
      case 'admission': return <AdmissionPortal />;
      case 'classTeacher': return <ClassTeacherPortal />;
      case 'hostel': return <HostelPortal />;
      case 'whatsapp': return <WhatsAppHub />;
      case 'clerk': return <ClerkPortal />;
      case 'superAdmin': return <SuperAdminCenter />;
      case 'aiAssistant': return <AiAssistant />;
      case 'callingAgent': return <CallingAgent />;
      default: return <AdmissionPortal />;
    }
  };

  if (mustChangePassword) return <ChangePasswordPage />;
  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  const handlePhoneVerified = () => {
    setShowPhoneVerification(false);
    setPhoneVerificationDismissed(true);
  };

  const navigation = (closeAfterSelection = false) => (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Portal navigation">
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
            className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-all ${
              active
                ? 'bg-black text-white'
                : 'text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black'
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? 'bg-white/15' : 'bg-[#F3F2EF] group-hover:bg-white'}`}>
              <tab.icon className="h-4.5 w-4.5" />
            </span>
            <span className="truncate">{language === 'en' ? tab.labelEn : tab.labelMr}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="bg-app-gradient relative flex h-screen h-[100dvh] flex-col">
      <Header />
      <PhoneVerificationPopup isOpen={showPhoneVerification} onVerified={handlePhoneVerified} />

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <aside className="sidebar-glass hidden w-72 shrink-0 flex-col lg:flex">
          <div className="border-b border-[#E7E7E4] px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="govt-seal h-11 w-11 shrink-0">
                <School className="h-5 w-5 text-white!" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black">Pathraj Ashram</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#6B6B6B]">EDUCATION PORTAL</p>
              </div>
            </div>
          </div>
          {navigation()}
          <div className="m-4 rounded-xl border border-[#E7E7E4] bg-[#F3F2EF] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#6B6B6B]">TRIBAL WELFARE DEPARTMENT</p>
            <p className="mt-1 text-xs leading-relaxed text-[#6B6B6B]">Serving Pathraj, Karjat - Raigad</p>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              <motion.aside
                initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
                transition={{ type: 'tween', duration: 0.22 }}
                onClick={(event) => event.stopPropagation()}
                className="sidebar-glass absolute inset-y-0 left-0 z-10 flex w-72 flex-col shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-[#E7E7E4] p-4">
                  <div className="flex items-center gap-3 text-black">
                    <School className="h-5 w-5" />
                    <span className="font-semibold">Pathraj Ashram</span>
                  </div>
                  <button type="button" aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="rounded-full p-2 text-[#6B6B6B] hover:bg-[#F3F2EF]">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {navigation(true)}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-5">
          <div className="sticky top-0 z-20 border-b border-[#E7E7E4] bg-white/80 px-3 py-2 backdrop-blur-xl lg:hidden">
            <button type="button" onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black hover:bg-[#F3F2EF]">
              <Menu className="h-4 w-4" />
              {language === 'en' ? 'Menu' : 'मेनू'}
            </button>
          </div>
          <div key={activeTab}>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-3 z-40 rounded-[1.4rem] border border-[#E7E7E4] bg-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:hidden"
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
                  className={`relative flex min-w-[5.5rem] shrink-0 flex-col items-center px-2 py-2.5 text-[10px] font-medium ${active ? 'text-black' : 'text-[#A3A3A3]'}`}
                >
                  <span className={`mb-1 rounded-full px-3 py-1 ${active ? 'bg-[#F3F2EF]' : ''}`}><tab.icon className="h-5 w-5" /></span>
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
