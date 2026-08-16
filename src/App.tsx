import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap, ClipboardList, Building2, MessageCircle,
  FileStack, Shield, Bot, Menu, X, School
} from 'lucide-react';
import { AppProvider, useAppContext, type AppRole } from './contexts/AppContext';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
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
  iconBg: string;
  iconColor: string;
}

const tabs: TabConfig[] = [
  { key: 'admission', labelEn: 'Admission', labelMr: 'प्रवेश', icon: GraduationCap, roles: ['web_creator', 'principal', 'class_teacher', 'clerk', 'student_parent'], iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
  { key: 'classTeacher', labelEn: 'Class Teacher', labelMr: 'वर्गशिक्षक', icon: ClipboardList, roles: ['web_creator', 'principal', 'class_teacher', 'subject_teacher'], iconBg: 'bg-blue-100', iconColor: 'text-blue-700' },
  { key: 'hostel', labelEn: 'Hostel', labelMr: 'वसतिगृह', icon: Building2, roles: ['web_creator', 'principal', 'class_teacher'], iconBg: 'bg-teal-100', iconColor: 'text-teal-700' },
  { key: 'whatsapp', labelEn: 'WhatsApp', labelMr: 'व्हॉट्सअॅप', icon: MessageCircle, roles: ['web_creator', 'principal', 'class_teacher'], iconBg: 'bg-green-100', iconColor: 'text-green-700' },
  { key: 'clerk', labelEn: 'Clerk', labelMr: 'लिपिक', icon: FileStack, roles: ['web_creator', 'principal', 'clerk'], iconBg: 'bg-purple-100', iconColor: 'text-purple-700' },
  { key: 'superAdmin', labelEn: 'Admin', labelMr: 'अॅडमिन', icon: Shield, roles: ['web_creator'], iconBg: 'bg-red-100', iconColor: 'text-red-700' },
  { key: 'aiAssistant', labelEn: 'AI Assistant', labelMr: 'AI सहाय्यक', icon: Bot, roles: ['web_creator', 'principal', 'class_teacher', 'clerk', 'subject_teacher', 'student_parent'], iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700' },
];

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <div className="govt-seal" style={{ width: '5rem', height: '5rem' }}>
          <School className="w-10 h-10 text-slate-900" />
        </div>
      </div>
      <div className="splash-text mt-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold font-devanagari" style={{ color: '#d4af37' }}>
          शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथराज
        </h1>
        <p className="text-slate-400 text-sm mt-2">Loading portal...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { language, role, isAuthenticated } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabKey>('admission');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const visibleTabs = tabs.filter(tab => tab.roles.includes(role));

  // If current tab is not visible for current role, switch to first available
  useEffect(() => {
    const currentVisible = tabs.filter(tab => tab.roles.includes(role));
    if (!currentVisible.find(t => t.key === activeTab) && currentVisible.length > 0) {
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

  // Show login page if not authenticated (before any other content)
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-app-gradient flex flex-col animate-fadeIn relative">
      {/* Decorative Gradient Orbs */}
      <div className="decorative-orb orb-gold floating-shape-1" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px' }} />
      <div className="decorative-orb orb-emerald floating-shape-2" style={{ width: '350px', height: '350px', bottom: '10%', left: '-80px' }} />
      <div className="decorative-orb orb-blue floating-shape-3" style={{ width: '300px', height: '300px', top: '40%', right: '5%' }} />

      {/* Dot Grid Overlay */}
      <div className="dot-grid-overlay" />

      {/* Floating decorative shapes */}
      <div className="floating-shape floating-shape-1" style={{ top: '20%', left: '5%', width: '60px', height: '60px', borderRadius: '30%', border: '1px solid rgba(212, 175, 55, 0.15)', background: 'rgba(212, 175, 55, 0.03)' }} />
      <div className="floating-shape floating-shape-2" style={{ top: '60%', right: '8%', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(5, 150, 105, 0.15)', background: 'rgba(5, 150, 105, 0.03)' }} />
      <div className="floating-shape floating-shape-3" style={{ bottom: '15%', left: '30%', width: '50px', height: '50px', borderRadius: '40%', border: '1px solid rgba(59, 130, 246, 0.12)', background: 'rgba(59, 130, 246, 0.02)' }} />

      <Header />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Desktop Sidebar - Glassmorphism */}
        <aside className="hidden lg:flex flex-col w-60 sidebar-glass shrink-0">
          {/* School Logo Area */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}>
                <School className="w-5 h-5 text-slate-900" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">Ashram Shala</p>
                <p className="text-[10px] text-slate-400 truncate">Pathraj, Raigad</p>
              </div>
            </div>
            {/* Decorative separator */}
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-[3px] ${
                  activeTab === tab.key
                    ? 'border-l-[#d4af37] bg-gradient-to-r from-amber-50/80 to-transparent text-slate-800 shadow-sm'
                    : 'border-l-transparent text-slate-500 hover:bg-white/40 hover:text-slate-700'
                }`}
              >
                <div className={`icon-pill ${
                  activeTab === tab.key ? tab.iconBg : 'bg-slate-100/60'
                }`}>
                  <tab.icon className={`w-4 h-4 shrink-0 ${
                    activeTab === tab.key ? tab.iconColor : 'text-slate-400'
                  }`} />
                </div>
                <span className="truncate">{language === 'en' ? tab.labelEn : tab.labelMr}</span>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/20">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              &copy; 2024 Tribal Development Dept.
              <br />
              Maharashtra State Government
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'tween', duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-0 bottom-0 w-72 sidebar-glass shadow-xl z-50 flex flex-col"
              >
                <div className="p-4 border-b border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}>
                      <School className="w-4 h-4 text-slate-900" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {language === 'en' ? 'Navigation' : 'नेव्हिगेशन'}
                    </span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/40 transition-colors">
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
                  {visibleTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-[3px] ${
                        activeTab === tab.key
                          ? 'border-l-[#d4af37] bg-gradient-to-r from-amber-50/80 to-transparent text-slate-800'
                          : 'border-l-transparent text-slate-500 hover:bg-white/40 hover:text-slate-700'
                      }`}
                    >
                      <div className={`icon-pill ${
                        activeTab === tab.key ? tab.iconBg : 'bg-slate-100/60'
                      }`}>
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? tab.iconColor : 'text-slate-400'}`} />
                      </div>
                      {language === 'en' ? tab.labelEn : tab.labelMr}
                    </button>
                  ))}
                </nav>
                <div className="p-3 border-t border-white/20">
                  <p className="text-[10px] text-slate-400 text-center">
                    &copy; 2024 Tribal Development Dept.
                  </p>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-4">
          {/* Mobile menu button */}
          <div className="lg:hidden p-2 border-b border-white/10 sticky top-0 z-10" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-white/50 transition-colors"
            >
              <Menu className="w-4 h-4" />
              {language === 'en' ? 'Menu' : 'मेनू'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
        <div className="flex overflow-x-auto scrollbar-hide">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center py-2 px-3 min-w-[4rem] shrink-0 transition-all duration-200 ${
                activeTab === tab.key ? 'text-slate-800' : 'text-slate-400'
              }`}
            >
              <tab.icon className="w-5 h-5" style={activeTab === tab.key ? { color: '#d4af37' } : {}} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap font-medium">
                {language === 'en' ? tab.labelEn : tab.labelMr}
              </span>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="mobileTabIndicator"
                  className="w-4 h-0.5 rounded-full mt-0.5"
                  style={{ backgroundColor: '#d4af37' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
