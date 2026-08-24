import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  School,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

type RegisterStage = 'form' | 'done';

const relationshipOptions = [
  { value: 'Father', labelEn: 'Father', labelMr: 'वडील' },
  { value: 'Mother', labelEn: 'Mother', labelMr: 'आई' },
  { value: 'Guardian', labelEn: 'Guardian', labelMr: 'पालक' },
  { value: 'Other', labelEn: 'Other', labelMr: 'इतर' },
];

interface RegisterPageProps {
  onBack?: () => void;
}

export default function RegisterPage({ onBack }: RegisterPageProps) {
  const navigate = useNavigate();
  const { language, setLanguage, register, setIsRegistering, isAuthenticated } = useAppContext();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<RegisterStage>('form');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  // Redirect to portal after successful authentication
  useEffect(() => {
    if (isAuthenticated && stage === 'done') {
      const timer = setTimeout(() => navigate('/portal', { replace: true }), 2000);
      return () => clearTimeout(timer);
    }
    if (isAuthenticated && stage === 'form') {
      navigate('/portal', { replace: true });
    }
  }, [isAuthenticated, navigate, stage]);

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (!fullName.trim()) { setError(t('Full name is required.', 'पूर्ण नाव आवश्यक आहे.')); return; }
      if (!/^[6-9]\d{9}$/.test(mobileNumber)) { setError(t('Enter a valid 10-digit mobile number.', 'वैध 10 अंकी मोबाईल नंबर प्रविष्ट करा.')); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(t('Enter a valid email address.', 'वैध ईमेल पत्ता प्रविष्ट करा.')); return; }
      if (password.length < 8) { setError(t('Password must be at least 8 characters.', 'पासवर्ड किमान 8 अक्षरे असणे आवश्यक आहे.')); return; }
      if (password !== confirmPassword) { setError(t('Passwords do not match.', 'पासवर्ड जुळत नाहीत.')); return; }

      setIsLoading(true);
      const result = await register({ fullName: fullName.trim(), mobileNumber, email, relationship, password });
      if (!result.success) {
        setError(result.error || t('Registration failed.', 'नोंदणी अयशस्वी.'));
        return;
      }

      setStage('done');
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsRegistering(false);
    if (onBack) {
      onBack();
    } else {
      navigate('/login');
    }
  };

  const inputClasses = "h-12 w-full rounded-[14px] border border-slate-400/15 bg-slate-800/50 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8">
      {/* Cinematic background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)' }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />

      {/* Top bar */}
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
        aria-labelledby="register-title"
      >
        <div className="relative mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <School className="h-7 w-7 text-white" />
          </motion.div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="register-title" className="font-devanagari text-center text-lg font-bold leading-[1.45] text-white sm:text-xl">
            {stage === 'done' ? t('Registration complete!', 'नोंदणी पूर्ण!')
              : t('Parent Registration', 'पालक नोंदणी')}
          </h1>
          <p className="mt-2 text-center text-sm text-slate-300">
            {stage === 'done' ? t('You can now use the portal.', 'आता तुम्ही पोर्टल वापरू शकता.')
              : t('Register to access your child\'s information', 'तुमच्या मुलाची माहिती पाहण्यासाठी नोंदणी करा')}
          </p>
        </div>

        {stage === 'form' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="mb-2 block text-xs font-medium text-slate-400">{t('Full Name', 'पूर्ण नाव')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('Enter full name', 'पूर्ण नाव प्रविष्ट करा')} className={inputClasses} />
              </div>
            </div>
            <div>
              <label htmlFor="reg-mobile" className="mb-2 block text-xs font-medium text-slate-400">{t('Mobile Number', 'मोबाईल नंबर')}</label>
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 flex h-12 items-center pl-3 pr-2">
                  <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-300 select-none">
                    <span className="text-sm">🇮🇳</span> +91
                  </span>
                  <span className="ml-2 h-5 w-px bg-white/10" />
                </div>
                <input id="reg-mobile" type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="h-12 w-full rounded-[14px] border border-slate-400/15 bg-slate-800/50 pl-[5.5rem] pr-4 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
              </div>
            </div>
            <div>
              <label htmlFor="reg-email" className="mb-2 block text-xs font-medium text-slate-400">{t('Email', 'ईमेल')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@example.com" className={inputClasses} />
              </div>
            </div>
            <div>
              <label htmlFor="reg-relationship" className="mb-2 block text-xs font-medium text-slate-400">{t('Relationship to Student', 'विद्यार्थ्याशी नाते')}</label>
              <div className="relative">
                <select id="reg-relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="h-12 w-full appearance-none rounded-[14px] border border-slate-400/15 bg-slate-800/50 px-4 pr-11 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
                  {relationshipOptions.map((opt) => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.labelEn : opt.labelMr}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label htmlFor="reg-password" className="mb-2 block text-xs font-medium text-slate-400">{t('Password', 'पासवर्ड')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('Min 8 characters', 'किमान 8 अक्षरे')} className="h-12 w-full rounded-[14px] border border-slate-400/15 bg-slate-800/50 pl-11 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-confirm" className="mb-2 block text-xs font-medium text-slate-400">{t('Confirm Password', 'पासवर्ड पुष्टी करा')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="reg-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('Re-enter password', 'पासवर्ड पुन्हा प्रविष्ट करा')} className={inputClasses} />
              </div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300">{error}</motion.div>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              }}
            >
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><UserPlus className="h-4 w-4" />{t('Register', 'नोंदणी करा')}</>}
            </button>

            <div className="mt-4 text-center">
              <button type="button" onClick={handleBackToLogin} className="flex items-center justify-center gap-1.5 mx-auto rounded-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />{t('Back to login', 'लॉगिनवर परत जा')}
              </button>
              <button type="button" onClick={() => navigate('/')} className="flex items-center justify-center gap-1.5 mx-auto rounded-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />{t('Back to Home', 'मुख्यपृष्ठावर परत जा')}
              </button>
            </div>
          </form>
        )}

        {stage === 'done' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-300">{t('Your account is ready. Redirecting to portal...', 'तुमचे खाते तयार आहे. पोर्टलवर पुनर्निर्देशित करत आहे...')}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{t('Your data is protected with encryption', 'तुमचा डेटा एन्क्रिप्शनने संरक्षित आहे')}</span>
        </div>
        <p className="font-devanagari mt-5 text-center text-[10px] text-slate-500">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
