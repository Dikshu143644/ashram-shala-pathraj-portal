import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Mail,
  School,
  ShieldCheck,
  User,
} from 'lucide-react';
import { type AppRole, type AuthUser, useAppContext } from '../contexts/AppContext';

type ForgotPasswordStage = 'enter-identifier' | 'enter-otp' | 'set-new-password' | 'done';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { language, setLanguage, isAuthenticated } = useAppContext();
  const [stage, setStage] = useState<ForgotPasswordStage>('enter-identifier');
  const [identifier, setIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  // Redirect to portal if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/portal', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (!identifier.trim()) {
        setError(t('Please enter your mobile number or email.', 'कृपया तुमचा मोबाईल नंबर किंवा ईमेल प्रविष्ट करा.'));
        return;
      }

      setIsLoading(true);
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('Could not send reset code.', 'रीसेट कोड पाठवता आला नाही.'));
        return;
      }

      if (data.maskedEmail) {
        setMaskedEmail(data.maskedEmail);
      }
      setStage('enter-otp');
    } catch {
      setError(t('Request failed. Please try again.', 'विनंती अयशस्वी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (!/^\d{6}$/.test(otpCode)) {
        setError(t('Enter the 6-digit code sent to your email.', 'तुमच्या ईमेलवर पाठवलेला 6 अंकी कोड प्रविष्ट करा.'));
        return;
      }
      setStage('set-new-password');
    } finally {
      inFlightRef.current = false;
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError('');

    try {
      if (newPassword.length < 8) {
        setError(t('Password must be at least 8 characters.', 'पासवर्ड किमान 8 अक्षरे असणे आवश्यक आहे.'));
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t('Passwords do not match.', 'पासवर्ड जुळत नाहीत.'));
        return;
      }

      setIsLoading(true);
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), otp: otpCode, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        // If OTP is invalid, go back to OTP entry stage
        if (response.status === 401) {
          setStage('enter-otp');
          setOtpCode('');
        }
        setError(data.error || t('Could not reset password.', 'पासवर्ड रीसेट करता आला नाही.'));
        return;
      }

      // If server returned user data, save session
      if (data.user && typeof data.user === 'object') {
        const userData = data.user as Record<string, unknown>;
        const user: AuthUser = {
          username: userData.username as string,
          role: userData.role as AppRole,
          nameEn: userData.nameEn as string,
          nameMr: userData.nameMr as string,
          mustChangePassword: userData.mustChangePassword === true,
        };
        sessionStorage.setItem('ashram_auth', JSON.stringify(user));
      }

      setStage('done');
      // Redirect to portal after a short delay
      setTimeout(() => {
        window.location.href = '/portal';
      }, 2000);
    } catch {
      setError(t('Request failed. Please try again.', 'विनंती अयशस्वी. कृपया पुन्हा प्रयत्न करा.'));
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

      {/* Top bar */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 sm:left-7 sm:top-6">
        <button type="button" onClick={() => navigate('/login')} className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#E7E7E4] bg-white px-4 text-xs font-medium text-black hover:bg-[#F3F2EF]">
          <ArrowLeft className="h-3.5 w-3.5" />{t('Back to Login', 'लॉगिनवर परत जा')}
        </button>
      </div>
      <motion.button initial={false} onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')} type="button" className="absolute right-4 top-4 z-20 flex min-h-10 items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-4 text-xs font-medium text-black hover:bg-[#F3F2EF] sm:right-7 sm:top-6">
        <Globe className="h-4 w-4" />{language === 'en' ? 'मराठी' : 'English'}
      </motion.button>

      <motion.section initial={false} className="glass-card-static relative z-10 w-full max-w-md overflow-hidden p-7 sm:p-10" aria-labelledby="forgot-title">
        <div className="relative mb-8 flex flex-col items-center">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} className="govt-seal mb-5 h-16 w-16">
            <School className="h-7 w-7 text-white!" />
          </motion.div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B6B6B]">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="forgot-title" className="font-devanagari text-center text-lg font-semibold leading-[1.45] text-black sm:text-xl">
            {stage === 'enter-identifier' ? t('Forgot Password', 'पासवर्ड विसरलात')
              : stage === 'enter-otp' ? t('Enter Reset Code', 'रीसेट कोड प्रविष्ट करा')
              : stage === 'set-new-password' ? t('Set New Password', 'नवीन पासवर्ड सेट करा')
              : t('Password Reset!', 'पासवर्ड रीसेट झाला!')}
          </h1>
          <p className="mt-2 text-center text-sm text-[#6B6B6B]">
            {stage === 'enter-identifier' ? t('Enter your mobile number or email to receive a reset code.', 'रीसेट कोड मिळवण्यासाठी तुमचा मोबाईल नंबर किंवा ईमेल प्रविष्ट करा.')
              : stage === 'enter-otp' ? t(`We sent a 6-digit code to ${maskedEmail || 'your email'}.`, `${maskedEmail || 'तुमच्या ईमेलवर'} 6 अंकी कोड पाठवला आहे.`)
              : stage === 'set-new-password' ? t('Create your new password.', 'तुमचा नवीन पासवर्ड तयार करा.')
              : t('Your password has been reset. Redirecting...', 'तुमचा पासवर्ड रीसेट झाला आहे. पुनर्निर्देशित करत आहे...')}
          </p>
        </div>

        {stage === 'enter-identifier' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="forgot-identifier" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Mobile Number or Email', 'मोबाईल नंबर किंवा ईमेल')}</label>
              <div className="relative"><User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="forgot-identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t('e.g. 9876543210 or email@example.com', 'उदा. 9876543210 किंवा email@example.com')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-4 text-sm text-black placeholder:text-[#A3A3A3]" autoFocus /></div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Sending...', 'पाठवत आहे...')}</> : <><Mail className="h-4 w-4" />{t('Send Reset Code', 'रीसेट कोड पाठवा')}</>}
            </button>

            <div className="mt-3 text-center">
              <button type="button" onClick={() => navigate('/login')} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
                <ArrowLeft className="h-3.5 w-3.5" />{t('Back to Login', 'लॉगिनवर परत जा')}
              </button>
            </div>
          </form>
        )}

        {stage === 'enter-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="forgot-otp" className="mb-2 block text-center text-xs font-medium text-[#6B6B6B]">{t('6-digit reset code', '6 अंकी रीसेट कोड')}</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A3A3A3]" />
                <input id="forgot-otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="h-14 w-full rounded-xl border border-[#E7E7E4] bg-white pl-12 pr-4 text-center font-mono text-2xl font-bold tracking-[0.35em] text-black placeholder:text-[#E7E7E4]" autoFocus />
              </div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={otpCode.length !== 6} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50">
              <ShieldCheck className="h-4 w-4" />{t('Verify Code', 'कोड सत्यापित करा')}
            </button>

            <div className="flex items-center justify-center">
              <button type="button" onClick={() => { setStage('enter-identifier'); setError(''); setOtpCode(''); }} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF] hover:text-black">
                <ArrowLeft className="h-3.5 w-3.5" />{t('Try different identifier', 'वेगळा मोबाईल/ईमेल वापरा')}
              </button>
            </div>
          </form>
        )}

        {stage === 'set-new-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="forgot-new-password" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('New Password', 'नवीन पासवर्ड')}</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="forgot-new-password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('Min 8 characters', 'किमान 8 अक्षरे')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-12 text-sm text-black placeholder:text-[#A3A3A3]" autoFocus /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#A3A3A3] hover:bg-[#F3F2EF]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>
            <div>
              <label htmlFor="forgot-confirm-password" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Confirm Password', 'पासवर्ड पुष्टी करा')}</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="forgot-confirm-password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('Re-enter password', 'पासवर्ड पुन्हा प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-4 text-sm text-black placeholder:text-[#A3A3A3]" /></div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Resetting...', 'रीसेट करत आहे...')}</> : <><Lock className="h-4 w-4" />{t('Reset Password', 'पासवर्ड रीसेट करा')}</>}
            </button>
          </form>
        )}

        {stage === 'done' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-sm text-[#6B6B6B]">{t('Your password has been reset successfully. Redirecting to portal...', 'तुमचा पासवर्ड यशस्वीरित्या रीसेट झाला आहे. पोर्टलवर पुनर्निर्देशित करत आहे...')}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#6B6B6B]"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" /><span>{t('Your data is protected with encryption', 'तुमचा डेटा एन्क्रिप्शनने संरक्षित आहे')}</span></div>
        <p className="font-devanagari mt-5 text-center text-[10px] text-[#A3A3A3]">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
