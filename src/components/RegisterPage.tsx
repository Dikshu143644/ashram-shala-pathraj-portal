import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  School,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

type RegisterStage = 'form' | 'otp' | 'set-password' | 'done';

const relationshipOptions = [
  { value: 'Father', labelEn: 'Father', labelMr: 'वडील' },
  { value: 'Mother', labelEn: 'Mother', labelMr: 'आई' },
  { value: 'Guardian', labelEn: 'Guardian', labelMr: 'पालक' },
  { value: 'Other', labelEn: 'Other', labelMr: 'इतर' },
];

interface RegisterPageProps {
  onBackToHome?: () => void;
}

export default function RegisterPage({ onBackToHome }: RegisterPageProps) {
  const { language, setLanguage, register, sendOtp, verifyOtp, setPassword, setIsRegistering } = useAppContext();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [stage, setStage] = useState<RegisterStage>('form');
  const [challengeToken, setChallengeToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (!fullName.trim()) { setError(t('Full name is required.', 'पूर्ण नाव आवश्यक आहे.')); return; }
      if (!/^[6-9]\d{9}$/.test(mobileNumber)) { setError(t('Enter a valid 10-digit mobile number.', 'वैध 10 अंकी मोबाईल नंबर प्रविष्ट करा.')); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(t('Enter a valid email address.', 'वैध ईमेल पत्ता प्रविष्ट करा.')); return; }

      setIsLoading(true);
      const result = await register({ fullName: fullName.trim(), mobileNumber, email, relationship });
      if (!result.success) {
        setError(result.error || t('Registration failed.', 'नोंदणी अयशस्वी.'));
        return;
      }

      if (result.challengeToken) {
        setChallengeToken(result.challengeToken);
        setMaskedEmail(result.maskedEmail || '');
        setStage('otp');

        const sendResult = await sendOtp(result.challengeToken);
        if (sendResult.success) {
          setMaskedEmail(sendResult.maskedEmail || result.maskedEmail || '');
          setResendIn(sendResult.resendAfterSeconds || 60);
        } else {
          setResendIn(sendResult.retryAfter || 0);
          setError(sendResult.error || t('Could not send verification email.', 'पडताळणी ईमेल पाठवता आला नाही.'));
        }
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
        setError(t('Enter the 6-digit code from your email.', 'तुमच्या ईमेलमधील 6 अंकी कोड प्रविष्ट करा.'));
        return;
      }
      setIsLoading(true);
      const result = await verifyOtp(challengeToken, otpCode);
      if (result.success) {
        setStage('set-password');
      } else {
        setError(result.error || t('Invalid code.', 'अवैध कोड.'));
      }
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (newPassword.length < 8) { setError(t('Password must be at least 8 characters.', 'पासवर्ड किमान 8 अक्षरे असणे आवश्यक आहे.')); return; }
      if (newPassword !== confirmPassword) { setError(t('Passwords do not match.', 'पासवर्ड जुळत नाहीत.')); return; }

      setIsLoading(true);
      const result = await setPassword(newPassword, confirmPassword);
      if (result.success) {
        setStage('done');
      } else {
        setError(result.error || t('Could not set password.', 'पासवर्ड सेट करता आला नाही.'));
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
        setError(result.error || t('Could not resend code.', 'कोड पुन्हा पाठवता आला नाही.'));
      }
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsRegistering(false);
    if (onBackToHome) onBackToHome();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#F7F7F5] p-4 sm:p-8">
      {/* Language toggle */}
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
        className="absolute right-4 top-4 z-20 flex h-9 items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-white px-3 text-xs font-medium text-black hover:bg-[#F3F2EF] sm:right-7 sm:top-6"
      >
        {language === 'en' ? 'मराठी' : 'English'}
      </button>

      <motion.section initial={false} className="relative z-10 w-full max-w-md rounded-3xl border border-[#E7E7E4] bg-[#FCFCFB] p-7 sm:p-10 shadow-sm" aria-labelledby="register-title">
        <div className="relative mb-8 flex flex-col items-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <School className="h-7 w-7 text-white" />
          </div>
          <h1 id="register-title" className="font-devanagari text-center text-xl font-semibold text-black sm:text-2xl">
            {stage === 'otp' ? t('Verify your email', 'तुमचा ईमेल सत्यापित करा')
              : stage === 'set-password' ? t('Set your password', 'तुमचा पासवर्ड सेट करा')
              : stage === 'done' ? t('Registration complete!', 'नोंदणी पूर्ण!')
              : t('Parent Registration', 'पालक नोंदणी')}
          </h1>
          <p className="mt-2 text-center text-sm text-[#6B6B6B]">
            {stage === 'otp' ? t(`We sent a 6-digit code to ${maskedEmail || 'your email'}.`, `${maskedEmail || 'तुमच्या ईमेलवर'} 6 अंकी कोड पाठवला आहे.`)
              : stage === 'set-password' ? t('Create a strong password for your account.', 'तुमच्या खात्यासाठी एक मजबूत पासवर्ड तयार करा.')
              : stage === 'done' ? t('You can now use the portal.', 'आता तुम्ही पोर्टल वापरू शकता.')
              : t('Register to access your child\'s information', 'तुमच्या मुलाची माहिती पाहण्यासाठी नोंदणी करा')}
          </p>
        </div>

        {stage === 'form' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Full Name', 'पूर्ण नाव')}</label>
              <div className="relative"><User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" /><input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('Enter full name', 'पूर्ण नाव प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-10 pr-4 text-sm text-black placeholder:text-[#6B6B6B]" /></div>
            </div>
            <div>
              <label htmlFor="reg-mobile" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Mobile Number', 'मोबाईल नंबर')}</label>
              <div className="relative"><Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" /><input id="reg-mobile" type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-10 pr-4 text-sm text-black placeholder:text-[#6B6B6B]" /></div>
            </div>
            <div>
              <label htmlFor="reg-email" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Email', 'ईमेल')}</label>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" /><input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@example.com" className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-10 pr-4 text-sm text-black placeholder:text-[#6B6B6B]" /></div>
            </div>
            <div>
              <label htmlFor="reg-relationship" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Relationship to Student', 'विद्यार्थ्याशी नाते')}</label>
              <div className="relative">
                <select id="reg-relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-[#E7E7E4] bg-white px-4 pr-10 text-sm text-black">
                  {relationshipOptions.map((opt) => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.labelEn : opt.labelMr}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
              </div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><UserPlus className="h-4 w-4" />{t('Register', 'नोंदणी करा')}</>}
            </button>

            <div className="mt-4 flex flex-col items-center gap-2">
              <button type="button" onClick={() => setIsRegistering(false)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
                <ArrowLeft className="h-3.5 w-3.5" />{t('Back to login', 'लॉगिनवर परत जा')}
              </button>
              {onBackToHome && (
                <button type="button" onClick={handleBackToLogin} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
                  <ArrowLeft className="h-3.5 w-3.5" />{t('Back to Home', 'मुख्यपृष्ठावर परत जा')}
                </button>
              )}
            </div>
          </form>
        )}

        {stage === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label htmlFor="reg-otp" className="mb-2 block text-center text-xs font-medium text-[#6B6B6B]">{t('One-time verification code', 'एकवेळ पडताळणी कोड')}</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B6B6B]" />
                <input id="reg-otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="h-14 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-4 text-center font-mono text-2xl font-bold tracking-[.35em] text-black" autoFocus />
              </div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={isLoading || otpCode.length !== 6} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><ShieldCheck className="h-4 w-4" />{t('Verify', 'सत्यापित करा')}</>}
            </button>

            <div className="flex items-center justify-center">
              <button type="button" onClick={handleResend} disabled={resendIn > 0 || isLoading} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-black hover:bg-[#F3F2EF] disabled:cursor-not-allowed disabled:text-[#6B6B6B]">
                <RefreshCw className="h-3.5 w-3.5" />{resendIn > 0 ? t(`Resend in ${resendIn}s`, `${resendIn} सेकंदांनी पुन्हा पाठवा`) : t('Resend code', 'कोड पुन्हा पाठवा')}
              </button>
            </div>
          </form>
        )}

        {stage === 'set-password' && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label htmlFor="reg-password" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('New Password', 'नवीन पासवर्ड')}</label>
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" /><input id="reg-password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('Min 8 characters', 'किमान 8 अक्षरे')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-10 pr-12 text-sm text-black placeholder:text-[#6B6B6B]" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#6B6B6B] hover:bg-[#F3F2EF]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>
            <div>
              <label htmlFor="reg-confirm" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Confirm Password', 'पासवर्ड पुष्टी करा')}</label>
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" /><input id="reg-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('Re-enter password', 'पासवर्ड पुन्हा प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-10 pr-4 text-sm text-black placeholder:text-[#6B6B6B]" /></div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><Lock className="h-4 w-4" />{t('Set Password', 'पासवर्ड सेट करा')}</>}
            </button>
          </form>
        )}

        {stage === 'done' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F2EF]">
              <ShieldCheck className="h-8 w-8 text-black" />
            </div>
            <p className="text-sm text-[#6B6B6B]">{t('Your account is ready. You will be redirected shortly.', 'तुमचे खाते तयार आहे. तुम्हाला लवकरच पुनर्निर्देशित केले जाईल.')}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#6B6B6B]">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{t('Your data is protected with encryption', 'तुमचा डेटा एन्क्रिप्शनने संरक्षित आहे')}</span>
        </div>
        <p className="font-devanagari mt-4 text-center text-[10px] text-[#6B6B6B]">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
