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

export default function LoginPage() {
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5fbf5] p-4 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_5%,rgba(133,248,196,.36),transparent_34rem),radial-gradient(circle_at_88%_90%,rgba(203,167,47,.12),transparent_30rem)]" />
      <div className="warli-pattern absolute inset-0 opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-[40%] opacity-25" aria-hidden="true">
        <div className="absolute inset-x-[-8%] bottom-[-48%] h-full rounded-[50%_50%_0_0] bg-[#68dba9]/40" />
        <div className="absolute inset-x-[-20%] bottom-[-64%] h-full rounded-[50%_50%_0_0] bg-[#006948]/28" />
      </div>

      <motion.button initial={false} onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')} type="button" className="glass absolute right-4 top-4 z-20 flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold text-[#006948] shadow-sm sm:right-7 sm:top-6">
        <Globe className="h-4 w-4" />{language === 'en' ? 'मराठी' : 'English'}
      </motion.button>

      <motion.section initial={false} className="glass-card-static relative z-10 w-full max-w-md overflow-hidden p-7 sm:p-10" aria-labelledby="login-title">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#85f8c4]/25 blur-3xl" />
        <div className="relative mb-8 flex flex-col items-center">
          <motion.div initial={{ scale: .85 }} animate={{ scale: 1 }} transition={{ delay: .15 }} className="govt-seal mb-5 h-20 w-20 border-4 border-white/75">
            {stage === 'otp' ? <MailCheck className="h-9 w-9 text-white!" /> : <School className="h-9 w-9 text-white!" />}
          </motion.div>
          <p className="font-label mb-2 text-[10px] text-[#006948]">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="login-title" className="font-devanagari text-center text-xl font-bold leading-[1.45] text-[#006948] sm:text-2xl">
            {stage === 'otp' ? t('Verify your email', 'तुमचा ईमेल सत्यापित करा') : 'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज'}
          </h1>
          <p className="mt-2 text-center text-sm text-[#545f73]">
            {stage === 'otp'
              ? t(`We sent a 6-digit code to ${maskedEmail || 'your registered email'}.`, `${maskedEmail || 'तुमच्या नोंदणीकृत ईमेलवर'} ६ अंकी कोड पाठवला आहे.`)
              : t('Secure Education Portal Login', 'सुरक्षित शिक्षण पोर्टल लॉगिन')}
          </p>
        </div>

        {stage === 'credentials' ? (
          <form onSubmit={handleCredentialSubmit} className="relative space-y-4">
            <div>
              <label htmlFor="login-role" className="font-label mb-2 block text-[10px] text-[#3d4a42]">{t('Portal role', 'पोर्टल भूमिका')}</label>
              <div className="relative">
                <select id="login-role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as AppRole)} className="h-14 w-full appearance-none rounded-2xl border border-[#6d7a72]/20 bg-white/58 px-4 pr-11 text-sm text-[#171d19]">
                  {roleOptions.map((option) => <option key={option.value} value={option.value}>{language === 'en' ? option.labelEn : option.labelMr}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7a72]" />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="font-label mb-2 block text-[10px] text-[#3d4a42]">{t('Username or ID', 'वापरकर्तानाव किंवा आयडी')}</label>
              <div className="relative"><User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006948]" /><input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t('Enter username', 'वापरकर्तानाव प्रविष्ट करा')} className="h-14 w-full rounded-2xl border border-[#6d7a72]/20 bg-white/58 pl-11 pr-4 text-sm" autoComplete="username" /></div>
            </div>

            <div>
              <label htmlFor="password" className="font-label mb-2 block text-[10px] text-[#3d4a42]">{t('Password', 'पासवर्ड')}</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006948]" /><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('Enter password', 'पासवर्ड प्रविष्ट करा')} className="h-14 w-full rounded-2xl border border-[#6d7a72]/20 bg-white/58 pl-11 pr-12 text-sm" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('Hide password', 'पासवर्ड लपवा') : t('Show password', 'पासवर्ड दाखवा')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#6d7a72] hover:bg-[#e9efe9] hover:text-[#006948]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-2xl border border-[#ba1a1a]/15 bg-[#ffdad6]/55 px-4 py-3 text-center text-xs text-[#93000a]">{error}</motion.div>}

            <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#006948] to-[#00855d] text-sm font-bold text-white shadow-[0_8px_22px_rgba(0,105,72,.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,105,72,.3)] disabled:cursor-not-allowed disabled:opacity-55">
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />{t('Please wait…', 'कृपया थांबा…')}</> : <><LogIn className="h-4 w-4" />{t('Continue securely', 'सुरक्षितपणे पुढे जा')}</>}
            </button>

            <div className="mt-3 text-center">
              <button type="button" onClick={() => setIsRegistering(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[#006948] hover:bg-[#85f8c4]/25">
                <UserPlus className="h-3.5 w-3.5" />{t('Register as Parent', 'पालक म्हणून नोंदणी करा')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="relative space-y-5">
            <div>
              <label htmlFor="otp-code" className="font-label mb-2 block text-center text-[10px] text-[#3d4a42]">{t('One-time verification code', 'एकवेळ पडताळणी कोड')}</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#006948]" />
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="h-16 w-full rounded-2xl border border-[#6d7a72]/20 bg-white/68 pl-12 pr-4 text-center font-mono text-2xl font-bold tracking-[.35em] text-[#006948]"
                  autoFocus
                />
              </div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-2xl border border-[#ba1a1a]/15 bg-[#ffdad6]/55 px-4 py-3 text-center text-xs text-[#93000a]">{error}</motion.div>}

            <button type="submit" disabled={isLoading || otpCode.length !== 6} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#006948] to-[#00855d] text-sm font-bold text-white shadow-[0_8px_22px_rgba(0,105,72,.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55">
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />{t('Please wait…', 'कृपया थांबा…')}</> : <><ShieldCheck className="h-4 w-4" />{t('Verify and sign in', 'पडताळा आणि साइन इन करा')}</>}
            </button>

            <div className="flex items-center justify-between gap-3 text-xs">
              <button type="button" onClick={returnToCredentials} className="flex items-center gap-1.5 rounded-full px-3 py-2 font-semibold text-[#545f73] hover:bg-[#e9efe9] hover:text-[#006948]">
                <ArrowLeft className="h-3.5 w-3.5" />{t('Change account', 'खाते बदला')}
              </button>
              <button type="button" onClick={handleResend} disabled={resendIn > 0 || isLoading} className="flex items-center gap-1.5 rounded-full px-3 py-2 font-semibold text-[#006948] hover:bg-[#85f8c4]/25 disabled:cursor-not-allowed disabled:text-[#6d7a72]">
                <RefreshCw className="h-3.5 w-3.5" />{resendIn > 0 ? t(`Resend in ${resendIn}s`, `${resendIn} सेकंदांनी पुन्हा पाठवा`) : t('Resend code', 'कोड पुन्हा पाठवा')}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#545f73]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#006948]" /><span>{t('Password and email verification protect your session', 'पासवर्ड आणि ईमेल पडताळणी तुमचे सत्र सुरक्षित ठेवतात')}</span></div>
        <p className="font-devanagari mt-5 text-center text-[10px] text-[#6d7a72]">© 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
