import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  LogIn,
  MailCheck,
  RefreshCw,
  School,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { type AppRole, useAppContext } from '../contexts/AppContext';

const roleOptions: { value: AppRole; labelEn: string; labelMr: string }[] = [
  { value: 'web_creator', labelEn: 'Super Admin', labelMr: 'सुपर अॅडमिन' },
  { value: 'principal', labelEn: 'Principal', labelMr: 'मुख्याध्यापक' },
  { value: 'class_teacher', labelEn: 'Class Teacher', labelMr: 'वर्गशिक्षक' },
  { value: 'clerk', labelEn: 'Clerk', labelMr: 'लिपिक' },
  { value: 'subject_teacher', labelEn: 'Subject Teacher', labelMr: 'विषय शिक्षक' },
  { value: 'student_parent', labelEn: 'Student/Parent', labelMr: 'विद्यार्थी/पालक' },
];

type LoginStage = 'credentials' | 'otp';

interface LoginPageProps {
  onBack?: () => void;
}

export default function LoginPage({ onBack }: LoginPageProps) {
  const { language, setLanguage, beginLogin, sendOtp, verifyOtp, setIsRegistering } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('web_creator');
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<LoginStage>('credentials');
  const [challengeToken, setChallengeToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const handleCredentialSubmit = async (event: React.FormEvent) => {
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
      if (!loginResult.success || !loginResult.challengeToken) {
        setError(loginResult.error || t('Invalid username or password', 'अवैध वापरकर्तानाव किंवा पासवर्ड'));
        return;
      }

      setChallengeToken(loginResult.challengeToken);
      setMaskedEmail(loginResult.maskedEmail || '');
      setOtpCode('');
      setStage('otp');

      const sendResult = await sendOtp(loginResult.challengeToken);
      if (sendResult.success) {
        setMaskedEmail(sendResult.maskedEmail || loginResult.maskedEmail || '');
        setResendIn(sendResult.resendAfterSeconds || 60);
      } else {
        setResendIn(sendResult.retryAfter || 0);
        setError(sendResult.error || t('Could not send the verification email.', 'पडताळणी ईमेल पाठवता आला नाही.'));
      }
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (!/^\d{6}$/.test(otpCode)) {
        setError(t('Enter the 6-digit code from your email.', 'तुमच्या ईमेलमधील ६ अंकी कोड प्रविष्ट करा.'));
        return;
      }

      setIsLoading(true);
      const result = await verifyOtp(challengeToken, otpCode);
      if (!result.success) {
        if (result.retryAfter) setResendIn(result.retryAfter);
        setError(result.error || t('Verification code is invalid or expired.', 'पडताळणी कोड अवैध आहे किंवा कालबाह्य झाला आहे.'));
      }
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!challengeToken || resendIn > 0 || inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');
    setIsLoading(true);

    try {
      const result = await sendOtp(challengeToken);
      if (result.success) {
        setMaskedEmail(result.maskedEmail || maskedEmail);
        setResendIn(result.resendAfterSeconds || 60);
      } else {
        setResendIn(result.retryAfter || 0);
        setError(result.error || t('Could not resend the code.', 'कोड पुन्हा पाठवता आला नाही.'));
      }
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const returnToCredentials = () => {
    if (inFlightRef.current) return;
    setStage('credentials');
    setChallengeToken('');
    setOtpCode('');
    setResendIn(0);
    setPassword('');
    setError('');
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F7F5] p-4 sm:p-8">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute left-[-10%] top-[15%] h-[400px] w-[400px] rounded-full bg-[#059669]/[0.03] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[-5%] h-[300px] w-[300px] rounded-full bg-black/[0.02] blur-[80px]" />

      {/* Top bar with language toggle and back button */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 sm:left-7 sm:top-6">
        {onBack && (
          <button type="button" onClick={onBack} className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-white px-4 text-xs font-medium text-black hover:bg-[#F3F2EF]">
            <ArrowLeft className="h-3.5 w-3.5" />{t('Back', 'मागे')}
          </button>
        )}
      </div>
      <motion.button initial={false} onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')} type="button" className="absolute right-4 top-4 z-20 flex min-h-10 items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-4 text-xs font-medium text-black hover:bg-[#F3F2EF] sm:right-7 sm:top-6">
        <Globe className="h-4 w-4" />{language === 'en' ? 'मराठी' : 'English'}
      </motion.button>

      <motion.section initial={false} className="glass-card-static relative z-10 w-full max-w-md overflow-hidden p-7 sm:p-10" aria-labelledby="login-title">
        <div className="relative mb-8 flex flex-col items-center">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} className="govt-seal mb-5 h-16 w-16">
            {stage === 'otp' ? <MailCheck className="h-7 w-7 text-white!" /> : <School className="h-7 w-7 text-white!" />}
          </motion.div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B6B6B]">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="login-title" className="font-devanagari text-center text-lg font-semibold leading-[1.45] text-black sm:text-xl">
            {stage === 'otp' ? t('Verify your email', 'तुमचा ईमेल सत्यापित करा') : 'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज'}
          </h1>
          <p className="mt-2 text-center text-sm text-[#6B6B6B]">
            {stage === 'otp'
              ? t(`We sent a 6-digit code to ${maskedEmail || 'your registered email'}.`, `${maskedEmail || 'तुमच्या नोंदणीकृत ईमेलवर'} ६ अंकी कोड पाठवला आहे.`)
              : t('Secure Education Portal Login', 'सुरक्षित शिक्षण पोर्टल लॉगिन')}
          </p>
        </div>

        {stage === 'credentials' ? (
          <form onSubmit={handleCredentialSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-role" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Portal role', 'पोर्टल भूमिका')}</label>
              <div className="relative">
                <select id="login-role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as AppRole)} className="h-12 w-full appearance-none rounded-xl border border-[#E7E7E4] bg-white px-4 pr-11 text-sm text-black">
                  {roleOptions.map((option) => <option key={option.value} value={option.value}>{language === 'en' ? option.labelEn : option.labelMr}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Username or ID', 'वापरकर्तानाव किंवा आयडी')}</label>
              <div className="relative"><User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t('Enter username', 'वापरकर्तानाव प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-4 text-sm text-black placeholder:text-[#A3A3A3]" autoComplete="username" /></div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Password', 'पासवर्ड')}</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('Enter password', 'पासवर्ड प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-12 text-sm text-black placeholder:text-[#A3A3A3]" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('Hide password', 'पासवर्ड लपवा') : t('Show password', 'पासवर्ड दाखवा')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#A3A3A3] hover:bg-[#F3F2EF] hover:text-black">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><LogIn className="h-4 w-4" />{t('Continue securely', 'सुरक्षितपणे पुढे जा')}</>}
            </button>

            <div className="mt-3 text-center">
              <button type="button" onClick={() => setIsRegistering(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
                <UserPlus className="h-3.5 w-3.5" />{t('Register as Parent', 'पालक म्हणून नोंदणी करा')}
              </button>
              {onBack && (
                <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
                  <ArrowLeft className="h-3.5 w-3.5" />{t('Back to Home', 'मुख्यपृष्ठावर परत जा')}
                </button>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label htmlFor="otp-code" className="mb-2 block text-center text-xs font-medium text-[#6B6B6B]">{t('One-time verification code', 'एकवेळ पडताळणी कोड')}</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A3A3A3]" />
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="h-14 w-full rounded-xl border border-[#E7E7E4] bg-white pl-12 pr-4 text-center font-mono text-2xl font-bold tracking-[0.35em] text-black placeholder:text-[#E7E7E4]"
                  autoFocus
                />
              </div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={isLoading || otpCode.length !== 6} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><ShieldCheck className="h-4 w-4" />{t('Verify and sign in', 'पडताळा आणि साइन इन करा')}</>}
            </button>

            <div className="flex items-center justify-between gap-3 text-xs">
              <button type="button" onClick={returnToCredentials} className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
                <ArrowLeft className="h-3.5 w-3.5" />{t('Change account', 'खाते बदला')}
              </button>
              <button type="button" onClick={handleResend} disabled={resendIn > 0 || isLoading} className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-black hover:bg-[#F3F2EF] disabled:cursor-not-allowed disabled:text-[#A3A3A3]">
                <RefreshCw className="h-3.5 w-3.5" />{resendIn > 0 ? t(`Resend in ${resendIn}s`, `${resendIn} सेकंदांनी पुन्हा पाठवा`) : t('Resend code', 'कोड पुन्हा पाठवा')}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#6B6B6B]"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" /><span>{t('Password and email verification protect your session', 'पासवर्ड आणि ईमेल पडताळणी तुमचे सत्र सुरक्षित ठेवतात')}</span></div>
        <p className="font-devanagari mt-5 text-center text-[10px] text-[#A3A3A3]">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
