import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Globe, Lock, School, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export default function ChangePasswordPage() {
  const { language, setLanguage, changePassword, mustChangePassword, logout, skipPasswordChange } = useAppContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const handleSubmit = async (event: React.FormEvent) => {
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
      if (!mustChangePassword && !currentPassword) {
        setError(t('Current password is required.', 'सध्याचा पासवर्ड आवश्यक आहे.'));
        return;
      }

      setIsLoading(true);
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || t('Unable to change password.', 'पासवर्ड बदलता आला नाही.'));
      }
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F7F5] p-4 sm:p-8">
      <div className="pointer-events-none absolute left-[-10%] top-[15%] h-[400px] w-[400px] rounded-full bg-[#059669]/[0.03] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[-5%] h-[300px] w-[300px] rounded-full bg-black/[0.02] blur-[80px]" />

      <motion.button initial={false} onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')} type="button" className="absolute right-4 top-4 z-20 flex min-h-10 items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-4 text-xs font-medium text-black hover:bg-[#F3F2EF] sm:right-7 sm:top-6">
        <Globe className="h-4 w-4" />{language === 'en' ? 'मराठी' : 'English'}
      </motion.button>

      <motion.section initial={false} className="glass-card-static relative z-10 w-full max-w-md overflow-hidden p-7 sm:p-10" aria-labelledby="change-pw-title">
        <div className="relative mb-8 flex flex-col items-center">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} className="govt-seal mb-5 h-16 w-16">
            <School className="h-7 w-7 text-white!" />
          </motion.div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B6B6B]">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="change-pw-title" className="font-devanagari text-center text-lg font-semibold leading-[1.45] text-black sm:text-xl">
            {success ? t('Password Changed!', 'पासवर्ड बदलला!') : t('Change Password', 'पासवर्ड बदला')}
          </h1>
          <p className="mt-2 text-center text-sm text-[#6B6B6B]">
            {success
              ? t('Your password has been updated successfully.', 'तुमचा पासवर्ड यशस्वीरित्या अपडेट केला गेला आहे.')
              : mustChangePassword
                ? t('You must change your password before continuing.', 'पुढे जाण्यापूर्वी तुम्हाला तुमचा पासवर्ड बदलणे आवश्यक आहे.')
                : t('Enter your current and new password.', 'तुमचा सध्याचा आणि नवीन पासवर्ड प्रविष्ट करा.')}
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-sm text-[#6B6B6B]">{t('Redirecting to portal...', 'पोर्टलवर पुनर्निर्देशित करत आहे...')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-4">
            {!mustChangePassword && (
              <div>
                <label htmlFor="current-password" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Current Password', 'सध्याचा पासवर्ड')}</label>
                <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="current-password" type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t('Enter current password', 'सध्याचा पासवर्ड प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-12 text-sm text-black placeholder:text-[#A3A3A3]" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#A3A3A3] hover:bg-[#F3F2EF]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('New Password', 'नवीन पासवर्ड')}</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="new-password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('Min 8 characters', 'किमान 8 अक्षरे')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-12 text-sm text-black placeholder:text-[#A3A3A3]" autoComplete="new-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#A3A3A3] hover:bg-[#F3F2EF]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>
            <div>
              <label htmlFor="confirm-new-password" className="mb-2 block text-xs font-medium text-[#6B6B6B]">{t('Confirm New Password', 'नवीन पासवर्ड पुष्टी करा')}</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" /><input id="confirm-new-password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('Re-enter new password', 'नवीन पासवर्ड पुन्हा प्रविष्ट करा')} className="h-12 w-full rounded-xl border border-[#E7E7E4] bg-white pl-11 pr-4 text-sm text-black placeholder:text-[#A3A3A3]" autoComplete="new-password" /></div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">{error}</motion.div>}

            <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><Lock className="h-4 w-4" />{t('Change Password', 'पासवर्ड बदला')}</>}
            </button>

            {mustChangePassword && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <button type="button" onClick={skipPasswordChange} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                  {t('Skip for now', 'आत्ता वगळा')}
                </button>
                <button type="button" onClick={logout} className="text-xs font-medium text-[#6B6B6B] hover:text-black">
                  {t('Sign out instead', 'त्याऐवजी साइन आउट करा')}
                </button>
              </div>
            )}
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#6B6B6B]"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" /><span>{t('Your password is hashed and stored securely', 'तुमचा पासवर्ड हॅश करून सुरक्षितपणे संग्रहित केला जातो')}</span></div>
        <p className="font-devanagari mt-5 text-center text-[10px] text-[#A3A3A3]">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
