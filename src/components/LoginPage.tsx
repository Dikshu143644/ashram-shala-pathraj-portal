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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8">
      {/* Cinematic background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)' }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />

      {/* Top bar with language toggle and back button */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 sm:left-7 sm:top-6">
        <button
          type="button"
          onClick={() => onBack ? onBack() : navigate('/')}
          className="flex min-h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-4 text-xs font-medium text-white backdrop-blur-md hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />{t('Back', 'मागे')}
        </button>
      </div>
      <motion.button
        initial={false}
        onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
        type="button"
        className="absolute right-4 top-4 z-20 flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-xs font-medium text-white backdrop-blur-md hover:bg-white/20 transition-colors sm:right-7 sm:top-6"
      >
        <Globe className="h-4 w-4" />{language === 'en' ? 'मराठी' : 'English'}
      </motion.button>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/10 p-7 sm:p-10"
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
        aria-labelledby="login-title"
      >
        <div className="relative mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #D97706, #B45309)' }}
          >
            <School className="h-7 w-7 text-white" />
          </motion.div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="login-title" className="font-devanagari text-center text-lg font-bold leading-[1.45] text-white sm:text-xl">
            शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
          </h1>
          <p className="mt-2 text-center text-sm text-slate-300">
            {t('Secure Education Portal', 'सुरक्षित शिक्षण पोर्टल')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-xs font-medium text-slate-400">{t('Mobile Number or Username', 'मोबाईल नंबर किंवा वापरकर्तानाव')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={t('Enter mobile number', 'मोबाईल नंबर प्रविष्ट करा')}
                className="h-12 w-full rounded-[14px] border border-slate-400/15 bg-slate-800/50 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-medium text-slate-400">{t('Password', 'पासवर्ड')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('Enter password', 'पासवर्ड प्रविष्ट करा')}
                className="h-12 w-full rounded-[14px] border border-slate-400/15 bg-slate-800/50 pl-11 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('Hide password', 'पासवर्ड लपवा') : t('Show password', 'पासवर्ड दाखवा')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #1E293B, #0F172A)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.4)',
            }}
          >
            {isLoading ? (
              <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</>
            ) : (
              <><LogIn className="h-4 w-4" />{t('Sign In', 'साइन इन करा')}</>
            )}
          </button>

          <div className="mt-3 flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />{t('Forgot Password?', 'पासवर्ड विसरलात?')}
            </button>
            {!fixedRole && (
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />{t('Register as Parent', 'पालक म्हणून नोंदणी करा')}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />{t('Back to Home', 'मुख्यपृष्ठावर परत जा')}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{t('Your session is protected with encryption', 'तुमचे सत्र एन्क्रिप्शनने संरक्षित आहे')}</span>
        </div>
        <p className="font-devanagari mt-5 text-center text-[10px] text-slate-500">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
