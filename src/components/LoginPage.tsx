import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  Lock,
  LogIn,
  School,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { type AppRole, useAppContext } from '../contexts/AppContext';

interface LoginPageProps {
  onBack?: () => void;
  fixedRole?: AppRole;
}

export default function LoginPage({ onBack, fixedRole }: LoginPageProps) {
  const navigate = useNavigate();
  const { language, setLanguage, beginLogin, isAuthenticated } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  // Redirect to portal after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/portal', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (!username.trim() || !password.trim()) {
        setError(t('Please enter username and password', 'कृपया वापरकर्तानाव आणि पासवर्ड प्रविष्ट करा'));
        return;
      }

      setIsLoading(true);
      const loginResult = await beginLogin(username.trim(), password);
      if (!loginResult.success) {
        setError(loginResult.error || t('Invalid username or password', 'अवैध वापरकर्तानाव किंवा पासवर्ड'));
      }
      // If successful, the useEffect above will redirect to /portal
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F7F5] p-4 sm:p-8">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute left-[-10%] top-[15%] h-[400px] w-[400px] rounded-full bg-[#059669]/[0.03] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[-5%] h-[300px] w-[300px] rounded-full bg-black/[0.02] blur-[80px]" />

      {/* Top bar with language toggle and back button */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 sm:left-7 sm:top-6">
        <button type="button" onClick={() => onBack ? onBack() : navigate('/')} className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-white px-4 text-xs font-medium text-black hover:bg-[#F3F2EF]">
          <ArrowLeft className="h-3.5 w-3.5" />{t('Back', 'मागे')}
        </button>
      </div>
      <motion.button initial={false} onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')} type="button" className="absolute right-4 top-4 z-20 flex min-h-10 items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-4 text-xs font-medium text-black hover:bg-[#F3F2EF] sm:right-7 sm:top-6">
        <Globe className="h-4 w-4" />{language === 'en' ? 'मराठी' : 'English'}
      </motion.button>

      <motion.section initial={false} className="glass-card-static relative z-10 w-full max-w-md overflow-hidden p-7 sm:p-10" aria-labelledby="login-title">
        <div className="relative mb-8 flex flex-col items-center">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} className="govt-seal mb-5 h-16 w-16">
            <School className="h-7 w-7 text-white!" />
          </motion.div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B6B6B]">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="login-title" className="font-devanagari text-center text-lg font-semibold leading-[1.45] text-black sm:text-xl">
            शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
          </h1>
          <p className="mt-2 text-center text-sm text-[#6B6B6B]">
            {t('Secure Education Portal Login', 'सुरक्षित शिक्षण पोर्टल लॉगिन')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Mobile Number or Username', 'मोबाईल नंबर किंवा वापरकर्तानाव')}</label>
            <div className="relative"><User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t('Enter mobile number', 'मोबाईल नंबर प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-4 text-sm text-black placeholder:text-[#A3A3A3]" autoComplete="username" /></div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Password', 'पासवर्ड')}</label>
            <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('Enter password', 'पासवर्ड प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-12 text-sm text-black placeholder:text-[#A3A3A3]" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('Hide password', 'पासवर्ड लपवा') : t('Show password', 'पासवर्ड दाखवा')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#A3A3A3] hover:bg-[#F3F2EF] hover:text-black">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          </div>

          {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

          <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><LogIn className="h-4 w-4" />{t('Sign In', 'साइन इन करा')}</>}
          </button>

          <div className="mt-3 flex flex-col items-center gap-1">
            <button type="button" onClick={() => navigate('/forgot-password')} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#059669] hover:bg-emerald-50 hover:text-emerald-700">
              <Lock className="h-3.5 w-3.5" />{t('Forgot Password?', 'पासवर्ड विसरलात?')}
            </button>
            {!fixedRole && (
            <button type="button" onClick={() => navigate('/register')} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
              <UserPlus className="h-3.5 w-3.5" />{t('Register as Parent', 'पालक म्हणून नोंदणी करा')}
            </button>
            )}
            <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
              <ArrowLeft className="h-3.5 w-3.5" />{t('Back to Home', 'मुख्यपृष्ठावर परत जा')}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#6B6B6B]"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" /><span>{t('Your session is protected with encryption', 'तुमचे सत्र एन्क्रिप्शनने संरक्षित आहे')}</span></div>
        <p className="font-devanagari mt-5 text-center text-[10px] text-[#A3A3A3]">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
