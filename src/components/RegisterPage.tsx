import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Phone,
  School,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

type RegisterStage = 'verify' | 'password' | 'done';

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
  const [stage, setStage] = useState<RegisterStage>('verify');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);

  // Phone OTP state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  const [smsUnavailable, setSmsUnavailable] = useState(false);

  // Email OTP state
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailError, setEmailError] = useState('');

  const phoneTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (phoneTimerRef.current) clearInterval(phoneTimerRef.current);
      if (emailTimerRef.current) clearInterval(emailTimerRef.current);
    };
  }, []);

  // Redirect to portal after successful authentication
  useEffect(() => {
    if (isAuthenticated && stage === 'done') {
      const timer = setTimeout(() => navigate('/portal', { replace: true }), 2000);
      return () => clearTimeout(timer);
    }
    if (isAuthenticated && stage === 'verify') {
      navigate('/portal', { replace: true });
    }
  }, [isAuthenticated, navigate, stage]);

  const startPhoneTimer = useCallback(() => {
    setPhoneTimer(30);
    if (phoneTimerRef.current) clearInterval(phoneTimerRef.current);
    phoneTimerRef.current = setInterval(() => {
      setPhoneTimer((prev) => {
        if (prev <= 1) {
          if (phoneTimerRef.current) clearInterval(phoneTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startEmailTimer = useCallback(() => {
    setEmailTimer(30);
    if (emailTimerRef.current) clearInterval(emailTimerRef.current);
    emailTimerRef.current = setInterval(() => {
      setEmailTimer((prev) => {
        if (prev <= 1) {
          if (emailTimerRef.current) clearInterval(emailTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendPhoneOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setPhoneError(t('Enter a valid 10-digit mobile number.', 'वैध 10 अंकी मोबाईल नंबर प्रविष्ट करा.'));
      return;
    }
    setPhoneError('');
    setPhoneSending(true);
    try {
      const response = await fetch('/api/auth/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPhoneOtpSent(true);
        startPhoneTimer();
      } else if (data.smsUnavailable) {
        setSmsUnavailable(true);
        setPhoneError(t('SMS unavailable. Verify via email instead.', 'SMS उपलब्ध नाही. कृपया ईमेलद्वारे सत्यापित करा.'));
      } else {
        setPhoneError(data.error || t('Failed to send OTP.', 'OTP पाठवण्यात अयशस्वी.'));
      }
    } catch {
      setPhoneError(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setPhoneSending(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!/^\d{6}$/.test(phoneOtp)) {
      setPhoneError(t('Enter a valid 6-digit OTP.', 'वैध 6 अंकी OTP प्रविष्ट करा.'));
      return;
    }
    setPhoneError('');
    setPhoneVerifying(true);
    try {
      const response = await fetch('/api/auth/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber, otp: phoneOtp }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPhoneVerified(true);
        if (phoneTimerRef.current) clearInterval(phoneTimerRef.current);
      } else {
        setPhoneError(data.error || t('Invalid OTP.', 'अवैध OTP.'));
      }
    } catch {
      setPhoneError(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('Enter a valid email address.', 'वैध ईमेल पत्ता प्रविष्ट करा.'));
      return;
    }
    setEmailError('');
    setEmailSending(true);
    try {
      const response = await fetch('/api/auth/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEmailOtpSent(true);
        startEmailTimer();
      } else {
        setEmailError(data.error || t('Failed to send OTP.', 'OTP पाठवण्यात अयशस्वी.'));
      }
    } catch {
      setEmailError(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setEmailSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!/^\d{6}$/.test(emailOtp)) {
      setEmailError(t('Enter a valid 6-digit OTP.', 'वैध 6 अंकी OTP प्रविष्ट करा.'));
      return;
    }
    setEmailError('');
    setEmailVerifying(true);
    try {
      const response = await fetch('/api/auth/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEmailVerified(true);
        if (emailTimerRef.current) clearInterval(emailTimerRef.current);
      } else {
        setEmailError(data.error || t('Invalid OTP.', 'अवैध OTP.'));
      }
    } catch {
      setEmailError(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleProceedToPassword = () => {
    if (!fullName.trim()) {
      setError(t('Full name is required.', 'पूर्ण नाव आवश्यक आहे.'));
      return;
    }
    if (!emailVerified) {
      setError(t('Please verify your email address.', 'कृपया तुमचा ईमेल पत्ता सत्यापित करा.'));
      return;
    }
    setError('');
    setStage('password');
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (password.length < 8) {
        setError(t('Password must be at least 8 characters.', 'पासवर्ड किमान 8 अक्षरे असणे आवश्यक आहे.'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('Passwords do not match.', 'पासवर्ड जुळत नाहीत.'));
        return;
      }

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

  const canProceed = emailVerified;

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
        className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-3xl border border-white/10 p-7 sm:p-10"
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
        aria-labelledby="register-title"
      >
        <div className="relative mb-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <School className="h-6 w-6 text-white" />
          </motion.div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="register-title" className="font-devanagari text-center text-lg font-bold leading-[1.45] text-white">
            {stage === 'done' ? t('Registration complete!', 'नोंदणी पूर्ण!')
              : stage === 'password' ? t('Create Password', 'पासवर्ड तयार करा')
              : t('Parent Registration', 'पालक नोंदणी')}
          </h1>
          <p className="mt-1.5 text-center text-xs text-slate-300">
            {stage === 'done' ? t('You can now use the portal.', 'आता तुम्ही पोर्टल वापरू शकता.')
              : stage === 'password' ? t('Set a secure password for your account', 'तुमच्या खात्यासाठी सुरक्षित पासवर्ड सेट करा')
              : t('Verify your email to register (phone optional)', 'नोंदणीसाठी ईमेल सत्यापित करा (मोबाईल ऐच्छिक)')}
          </p>
        </div>

        {stage === 'verify' && (
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-xs font-medium text-slate-400">{t('Full Name', 'पूर्ण नाव')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('Enter full name', 'पूर्ण नाव प्रविष्ट करा')} className={inputClasses} />
              </div>
            </div>

            {/* Mobile Number with Send OTP */}
            <div>
              <label htmlFor="reg-mobile" className="mb-1.5 block text-xs font-medium text-slate-400">
                {t('Mobile Number', 'मोबाईल नंबर')}
                {phoneVerified && <span className="ml-2 inline-flex items-center gap-1 text-emerald-400"><Check className="h-3.5 w-3.5" /> {t('Verified', 'सत्यापित')}</span>}
              </label>
              {!phoneVerified && !smsUnavailable && (
                <p className="mb-1.5 text-[10px] text-amber-400/80">{t('SMS verification optional. Email verification required.', 'SMS सत्यापन ऐच्छिक. ईमेल सत्यापन आवश्यक.')}</p>
              )}
              {smsUnavailable && (
                <p className="mb-1.5 text-[10px] text-amber-400/80">{t('SMS unavailable. Verify via email instead.', 'SMS उपलब्ध नाही. कृपया ईमेलद्वारे सत्यापित करा.')}</p>
              )}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-0 top-0 flex h-12 items-center pl-3 pr-1">
                    <span className="flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold text-slate-300 select-none">
                      <span className="text-xs">🇮🇳</span>+91
                    </span>
                    <span className="ml-1.5 h-5 w-px bg-white/10" />
                  </div>
                  <input
                    id="reg-mobile"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    disabled={phoneVerified}
                    className="h-12 w-full rounded-[14px] border border-slate-400/15 bg-slate-800/50 pl-[5rem] pr-4 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  />
                </div>
                {!phoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={phoneSending || phoneTimer > 0 || mobileNumber.length !== 10}
                    className="h-12 whitespace-nowrap rounded-full px-4 text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {phoneSending ? '...' : phoneOtpSent ? t('Resend', 'पुन्हा') : t('Send OTP', 'OTP पाठवा')}
                  </button>
                )}
              </div>
              {phoneTimer > 0 && !phoneVerified && (
                <p className="mt-1 text-[11px] text-amber-400">{t(`Resend in ${phoneTimer}s`, `${phoneTimer}s मध्ये पुन्हा पाठवा`)}</p>
              )}
              {phoneOtpSent && !phoneVerified && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('Enter 6-digit OTP', '6 अंकी OTP प्रविष्ट करा')}
                    className="h-10 flex-1 rounded-[12px] border border-slate-400/15 bg-slate-800/50 px-3 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    disabled={phoneVerifying || phoneOtp.length !== 6}
                    className="h-10 rounded-full px-4 text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {phoneVerifying ? '...' : t('Verify', 'सत्यापित')}
                  </button>
                </div>
              )}
              {phoneError && <p className="mt-1 text-[11px] text-red-400">{phoneError}</p>}
            </div>

            {/* Email with Send OTP */}
            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-xs font-medium text-slate-400">
                {t('Email', 'ईमेल')}
                {emailVerified && <span className="ml-2 inline-flex items-center gap-1 text-emerald-400"><Check className="h-3.5 w-3.5" /> {t('Verified', 'सत्यापित')}</span>}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    disabled={emailVerified}
                    className={`${inputClasses} disabled:opacity-50`}
                  />
                </div>
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={emailSending || emailTimer > 0 || !email.includes('@')}
                    className="h-12 whitespace-nowrap rounded-full px-4 text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {emailSending ? '...' : emailOtpSent ? t('Resend', 'पुन्हा') : t('Send OTP', 'OTP पाठवा')}
                  </button>
                )}
              </div>
              {emailTimer > 0 && !emailVerified && (
                <p className="mt-1 text-[11px] text-amber-400">{t(`Resend in ${emailTimer}s`, `${emailTimer}s मध्ये पुन्हा पाठवा`)}</p>
              )}
              {emailOtpSent && !emailVerified && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('Enter 6-digit OTP', '6 अंकी OTP प्रविष्ट करा')}
                    className="h-10 flex-1 rounded-[12px] border border-slate-400/15 bg-slate-800/50 px-3 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={emailVerifying || emailOtp.length !== 6}
                    className="h-10 rounded-full px-4 text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {emailVerifying ? '...' : t('Verify', 'सत्यापित')}
                  </button>
                </div>
              )}
              {emailError && <p className="mt-1 text-[11px] text-red-400">{emailError}</p>}
            </div>

            {/* Relationship */}
            <div>
              <label htmlFor="reg-relationship" className="mb-1.5 block text-xs font-medium text-slate-400">{t('Relationship to Student', 'विद्यार्थ्याशी नाते')}</label>
              <div className="relative">
                <select id="reg-relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="h-12 w-full appearance-none rounded-[14px] border border-slate-400/15 bg-slate-800/50 px-4 pr-11 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
                  {relationshipOptions.map((opt) => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.labelEn : opt.labelMr}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300">{error}</motion.div>}

            {/* Signup button - disabled until both verified */}
            <button
              type="button"
              onClick={handleProceedToPassword}
              disabled={!canProceed || !fullName.trim()}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: canProceed ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(100, 116, 139, 0.4)',
                boxShadow: canProceed ? '0 4px 20px rgba(16, 185, 129, 0.3)' : 'none',
              }}
            >
              <UserPlus className="h-4 w-4" />{t('Continue to Signup', 'साइनअपसाठी पुढे जा')}
            </button>

            <div className="mt-3 text-center">
              <button type="button" onClick={handleBackToLogin} className="flex items-center justify-center gap-1.5 mx-auto rounded-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />{t('Back to login', 'लॉगिनवर परत जा')}
              </button>
            </div>
          </div>
        )}

        {stage === 'password' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="mb-4 rounded-[14px] border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <Check className="h-4 w-4" />
                <span>{phoneVerified ? t('Mobile & Email verified', 'मोबाईल आणि ईमेल सत्यापित') : t('Email verified', 'ईमेल सत्यापित')}</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                {phoneVerified && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />+91 {mobileNumber}</span>}
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{email}</span>
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-xs font-medium text-slate-400">{t('New Password', 'नवीन पासवर्ड')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('Min 8 characters', 'किमान 8 अक्षरे')} className="h-12 w-full rounded-[14px] border border-slate-400/15 bg-slate-800/50 pl-11 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-confirm" className="mb-1.5 block text-xs font-medium text-slate-400">{t('Confirm Password', 'पासवर्ड पुष्टी करा')}</label>
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
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><UserPlus className="h-4 w-4" />{t('Create Account', 'खाते तयार करा')}</>}
            </button>

            <button type="button" onClick={() => setStage('verify')} className="flex items-center justify-center gap-1.5 mx-auto rounded-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />{t('Back', 'मागे')}
            </button>
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

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{t('Your data is protected with encryption', 'तुमचा डेटा एन्क्रिप्शनने संरक्षित आहे')}</span>
        </div>
        <p className="font-devanagari mt-4 text-center text-[10px] text-slate-500">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
