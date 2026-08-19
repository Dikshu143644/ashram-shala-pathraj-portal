import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Globe, Lock, School, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export default function ChangePasswordPage() {
  const { language, setLanguage, changePassword, mustChangePassword, logout } = useAppContext();
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

      <motion.section initial={false} className="glass-card-static relative z-10 w-full max-w-md overflow-hidden p-7 sm:p-10" aria-labelledby="change-pw-title">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#85f8c4]/25 blur-3xl" />
        <div className="relative mb-8 flex flex-col items-center">
          <motion.div initial={{ scale: .85 }} animate={{ scale: 1 }} transition={{ delay: .15 }} className="govt-seal mb-5 h-20 w-20 border-4 border-white/75">
            <School className="h-9 w-9 text-white!" />
          </motion.div>
          <p className="font-label mb-2 text-[10px] text-[#006948]">GOVERNMENT OF MAHARASHTRA</p>
          <h1 id="change-pw-title" className="font-devanagari text-center text-xl font-bold leading-[1.45] text-[#006948] sm:text-2xl">
            {success ? t('Password Changed!', 'पासवर्ड बदलला!') : t('Change Password', 'पासवर्ड बदला')}
          </h1>
          <p className="mt-2 text-center text-sm text-[#545f73]">
            {success
              ? t('Your password has been updated successfully.', 'तुमचा पासवर्ड यशस्वीरित्या अपडेट केला गेला आहे.')
              : mustChangePassword
                ? t('You must change your password before continuing.', 'पुढे जाण्यापूर्वी तुम्हाला तुमचा पासवर्ड बदलणे आवश्यक आहे.')
                : t('Enter your current and new password.', 'तुमचा सध्याचा आणि नवीन पासवर्ड प्रविष्ट करा.')}
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#85f8c4]/30">
              <ShieldCheck className="h-8 w-8 text-[#006948]" />
            </div>
            <p className="text-sm text-[#545f73]">{t('Redirecting to portal...', 'पोर्टलवर पुनर्निर्देशित करत आहे...')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-4">
            {!mustChangePassword && (
              <div>
                <label htmlFor="current-password" className="font-label mb-2 block text-[10px] text-[#3d4a42]">{t('Current Password', 'सध्याचा पासवर्ड')}</label>
                <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006948]" /><input id="current-password" type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t('Enter current password', 'सध्याचा पासवर्ड प्रविष्ट करा')} className="h-14 w-full rounded-2xl border border-[#6d7a72]/20 bg-white/58 pl-11 pr-12 text-sm" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#6d7a72] hover:bg-[#e9efe9]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="font-label mb-2 block text-[10px] text-[#3d4a42]">{t('New Password', 'नवीन पासवर्ड')}</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006948]" /><input id="new-password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('Min 8 characters', 'किमान 8 अक्षरे')} className="h-14 w-full rounded-2xl border border-[#6d7a72]/20 bg-white/58 pl-11 pr-12 text-sm" autoComplete="new-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#6d7a72] hover:bg-[#e9efe9]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>
            <div>
              <label htmlFor="confirm-new-password" className="font-label mb-2 block text-[10px] text-[#3d4a42]">{t('Confirm New Password', 'नवीन पासवर्ड पुष्टी करा')}</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006948]" /><input id="confirm-new-password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('Re-enter new password', 'नवीन पासवर्ड पुन्हा प्रविष्ट करा')} className="h-14 w-full rounded-2xl border border-[#6d7a72]/20 bg-white/58 pl-11 pr-4 text-sm" autoComplete="new-password" /></div>
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-2xl border border-[#ba1a1a]/15 bg-[#ffdad6]/55 px-4 py-3 text-center text-xs text-[#93000a]">{error}</motion.div>}

            <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#006948] to-[#00855d] text-sm font-bold text-white shadow-[0_8px_22px_rgba(0,105,72,.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55">
              {isLoading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />{t('Please wait...', 'कृपया थांबा...')}</> : <><Lock className="h-4 w-4" />{t('Change Password', 'पासवर्ड बदला')}</>}
            </button>

            {mustChangePassword && (
              <div className="mt-3 text-center">
                <button type="button" onClick={logout} className="text-xs font-semibold text-[#545f73] hover:text-[#006948]">
                  {t('Sign out instead', 'त्याऐवजी साइन आउट करा')}
                </button>
              </div>
            )}
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#545f73]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#006948]" /><span>{t('Your password is hashed and stored securely', 'तुमचा पासवर्ड हॅश करून सुरक्षितपणे संग्रहित केला जातो')}</span></div>
        <p className="font-devanagari mt-5 text-center text-[10px] text-[#6d7a72]">&copy; 2026 आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
      </motion.section>
    </main>
  );
}
