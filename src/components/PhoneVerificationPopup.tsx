import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Phone, ShieldCheck, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface PhoneVerificationPopupProps {
  isOpen: boolean;
  onVerified: () => void;
}

export default function PhoneVerificationPopup({ isOpen, onVerified }: PhoneVerificationPopupProps) {
  const { language } = useAppContext();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    setTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError(t('Enter a valid 10-digit mobile number.', 'वैध 10 अंकी मोबाईल नंबर प्रविष्ट करा.'));
      return;
    }
    setError('');
    setSending(true);
    try {
      const response = await fetch('/api/auth/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOtpSent(true);
        startTimer();
      } else {
        setError(data.error || t('Failed to send OTP.', 'OTP पाठवण्यात अयशस्वी.'));
      }
    } catch {
      setError(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError(t('Enter a valid 6-digit OTP.', 'वैध 6 अंकी OTP प्रविष्ट करा.'));
      return;
    }
    setError('');
    setVerifying(true);
    try {
      // First verify with SMS OTP service
      const smsResponse = await fetch('/api/auth/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber, otp }),
      });
      const smsData = await smsResponse.json();
      if (!smsResponse.ok || !smsData.success) {
        setError(smsData.error || t('Invalid OTP.', 'अवैध OTP.'));
        setVerifying(false);
        return;
      }

      // Then update user's phone_verified status
      const verifyResponse = await fetch('/api/auth/verify-phone-after-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber, otp }),
      });
      const verifyData = await verifyResponse.json();
      if (verifyResponse.ok && verifyData.success) {
        setVerified(true);
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => onVerified(), 1500);
      } else {
        setError(verifyData.error || t('Verification failed.', 'सत्यापन अयशस्वी.'));
      }
    } catch {
      setError(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[400px] rounded-3xl border border-white/10 p-7"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(24px) saturate(1.4)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                <Phone className="h-6 w-6 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {verified ? t('Phone Verified!', 'फोन सत्यापित!') : t('Verify Your Mobile Number', 'तुमचा मोबाईल नंबर सत्यापित करा')}
              </h2>
              <p className="mt-1.5 text-xs text-slate-300">
                {verified
                  ? t('Your mobile number has been verified successfully.', 'तुमचा मोबाईल नंबर यशस्वीरित्या सत्यापित झाला आहे.')
                  : t('Please verify your mobile number to continue using the portal.', 'पोर्टल वापरणे सुरू ठेवण्यासाठी कृपया तुमचा मोबाईल नंबर सत्यापित करा.')}
              </p>
            </div>

            {verified ? (
              <div className="flex flex-col items-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile input */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">{t('Mobile Number', 'मोबाईल नंबर')}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-0 top-0 flex h-12 items-center pl-3 pr-1">
                        <span className="flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold text-slate-300 select-none">
                          <span className="text-xs">🇮🇳</span>+91
                        </span>
                        <span className="ml-1.5 h-5 w-px bg-white/10" />
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        disabled={otpSent}
                        className="h-12 w-full rounded-[14px] border border-slate-400/15 bg-slate-800/50 pl-[5rem] pr-4 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sending || timer > 0 || mobileNumber.length !== 10}
                      className="h-12 whitespace-nowrap rounded-full px-4 text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      {sending ? '...' : otpSent ? t('Resend', 'पुन्हा') : t('Send OTP', 'OTP पाठवा')}
                    </button>
                  </div>
                  {timer > 0 && (
                    <p className="mt-1 text-[11px] text-amber-400">{t(`Resend in ${timer}s`, `${timer}s मध्ये पुन्हा पाठवा`)}</p>
                  )}
                </div>

                {/* OTP input */}
                {otpSent && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">{t('Enter OTP', 'OTP प्रविष्ट करा')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder={t('6-digit OTP', '6 अंकी OTP')}
                        className="h-12 flex-1 rounded-[14px] border border-slate-400/15 bg-slate-800/50 px-4 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifying || otp.length !== 6}
                        className="h-12 rounded-full px-5 text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        {verifying ? '...' : t('Verify', 'सत्यापित करा')}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300">
                    {error}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
