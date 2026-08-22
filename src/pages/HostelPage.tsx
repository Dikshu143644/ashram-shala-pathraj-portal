import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { Home, Users, Clock, UtensilsCrossed, UserCheck, Sun, Moon } from 'lucide-react';

export default function HostelPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const dailyRoutine = [
    { time: '5:30 AM', en: 'Wake up', mr: 'उठण्याची वेळ' },
    { time: '6:00 - 7:00 AM', en: 'Exercise / Yoga', mr: 'व्यायाम / योगा' },
    { time: '7:00 - 7:30 AM', en: 'Breakfast', mr: 'नाश्ता' },
    { time: '8:00 AM - 3:00 PM', en: 'School classes', mr: 'शाळेचे तास' },
    { time: '3:30 - 4:00 PM', en: 'Lunch / Rest', mr: 'जेवण / विश्रांती' },
    { time: '4:00 - 5:30 PM', en: 'Sports / Activities', mr: 'खेळ / उपक्रम' },
    { time: '5:30 - 7:00 PM', en: 'Study time', mr: 'अभ्यासाची वेळ' },
    { time: '7:00 - 7:30 PM', en: 'Dinner', mr: 'रात्रीचे जेवण' },
    { time: '8:00 - 9:30 PM', en: 'Self-study', mr: 'स्वयं-अभ्यास' },
    { time: '10:00 PM', en: 'Lights off', mr: 'दिवे बंद' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section
        className="relative flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center"
        style={{ background: '#F7F7F5' }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(5, 150, 105, 0.08) 0%, transparent 70%)' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-4xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] sm:text-xs"
            style={{ color: 'var(--public-accent-ember)' }}
          >
            {t('Residential Facility', 'निवासी सुविधा')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mb-5 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
            style={{ color: '#000000' }}
          >
            {t('Hostel Facilities', 'वसतिगृह सुविधा')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm sm:text-base"
            style={{ color: 'var(--public-text-muted)' }}
          >
            {t(
              'Government residential facility providing safe and nurturing accommodation for all students',
              'सर्व विद्यार्थ्यांसाठी सुरक्षित आणि पोषक निवास पुरवणारी शासकीय निवासी सुविधा'
            )}
          </motion.p>
        </motion.div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #F7F7F5)' }}
        />
      </section>

      {/* ===== HOSTEL OVERVIEW ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
              >
                <Home className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Hostel Overview', 'वसतिगृह विहंगावलोकन')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: '#059669' }} />

            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{
                background: '#FCFCFB',
                border: '1px solid #E7E7E4',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <p className="text-sm leading-relaxed sm:text-base mb-8" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'Our school provides a comprehensive government residential facility for all enrolled students. The hostel ensures a safe, secure, and comfortable living environment where students can focus on their academic and personal growth. With a total capacity of 520 beds, the facility is divided into separate wings for boys and girls, each managed by dedicated wardens.',
                  'आमची शाळा सर्व नावनोंदणीकृत विद्यार्थ्यांसाठी सर्वसमावेशक शासकीय निवासी सुविधा पुरवते. वसतिगृह सुरक्षित आणि आरामदायक राहण्याचे वातावरण सुनिश्चित करते जेथे विद्यार्थी त्यांच्या शैक्षणिक आणि वैयक्तिक विकासावर लक्ष केंद्रित करू शकतात. एकूण ५२० बेड क्षमतेसह, ही सुविधा मुलांसाठी आणि मुलींसाठी स्वतंत्र विभागांमध्ये विभागलेली आहे, प्रत्येक विभागाचे व्यवस्थापन समर्पित वॉर्डन करतात.'
                )}
              </p>

              {/* Capacity stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="rounded-xl p-5 text-center"
                  style={{ background: 'rgba(5, 150, 105, 0.04)', border: '1px solid #E7E7E4' }}
                >
                  <p className="text-3xl font-bold text-black">520</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--public-text-muted)' }}>{t('Total Beds', 'एकूण बेड')}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="rounded-xl p-5 text-center"
                  style={{ background: 'rgba(5, 150, 105, 0.04)', border: '1px solid #E7E7E4' }}
                >
                  <Users className="h-5 w-5 mx-auto mb-2" style={{ color: '#059669' }} />
                  <p className="text-sm font-semibold text-black">{t('Boys Wing', 'मुलांचा विभाग')}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--public-text-muted)' }}>{t('Separate facility', 'स्वतंत्र सुविधा')}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="rounded-xl p-5 text-center"
                  style={{ background: 'rgba(5, 150, 105, 0.04)', border: '1px solid #E7E7E4' }}
                >
                  <Users className="h-5 w-5 mx-auto mb-2" style={{ color: '#059669' }} />
                  <p className="text-sm font-semibold text-black">{t('Girls Wing', 'मुलींचा विभाग')}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--public-text-muted)' }}>{t('Separate facility', 'स्वतंत्र सुविधा')}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== MESS / DINING TIMINGS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#F7F7F5' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
              >
                <UtensilsCrossed className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Mess / Dining Timings', 'भोजन वेळ')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: '#059669' }} />

            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{
                background: '#FCFCFB',
                border: '1px solid #E7E7E4',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <p className="text-sm leading-relaxed sm:text-base mb-8" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'Nutritious meals are provided three times a day to all hostel students. The menu is planned to provide balanced nutrition essential for growing children.',
                  'वसतिगृहातील सर्व विद्यार्थ्यांना दिवसातून तीन वेळा पौष्टिक आहार दिला जातो. वाढत्या मुलांसाठी आवश्यक संतुलित पोषण देण्यासाठी मेनू तयार केला जातो.'
                )}
              </p>

              <div className="space-y-4">
                {[
                  { meal: t('Breakfast', 'नाश्ता'), time: t('7:00 AM', 'सकाळी ७:००'), mrTime: 'सकाळी ७:००', icon: Sun },
                  { meal: t('Lunch', 'दुपारचे जेवण'), time: t('12:30 PM', 'दुपारी १२:३०'), mrTime: 'दुपारी १२:३०', icon: Clock },
                  { meal: t('Dinner', 'रात्रीचे जेवण'), time: t('7:30 PM', 'रात्री ७:३०'), mrTime: 'रात्री ७:३०', icon: Moon },
                ].map((item, i) => (
                  <motion.div
                    key={item.meal}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="flex items-center justify-between rounded-xl p-5"
                    style={{ background: 'rgba(5, 150, 105, 0.03)', border: '1px solid rgba(5, 150, 105, 0.06)' }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: '#059669' }} />
                      <span className="text-sm font-medium text-black sm:text-base">{item.meal}</span>
                    </div>
                    <span className="text-sm font-semibold sm:text-base" style={{ color: '#059669' }}>
                      {language === 'mr' ? item.mrTime : item.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== WARDENS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
              >
                <UserCheck className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Hostel Wardens', 'वसतिगृह प्रमुख')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: '#059669' }} />

            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  background: '#FCFCFB',
                  border: '1px solid #E7E7E4',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full mb-4"
                  style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
                >
                  <Users className="h-5 w-5" style={{ color: '#059669' }} />
                </div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                  {t('Boys Hostel Warden', 'मुलांचे वसतिगृह प्रमुख')}
                </p>
                <p className="font-devanagari text-lg font-semibold text-black">
                  श्री.माने राजेंद्र परशराम
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  background: '#FCFCFB',
                  border: '1px solid #E7E7E4',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full mb-4"
                  style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
                >
                  <Users className="h-5 w-5" style={{ color: '#059669' }} />
                </div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                  {t('Girls Hostel Warden', 'मुलींचे वसतिगृह प्रमुख')}
                </p>
                <p className="font-devanagari text-lg font-semibold text-black">
                  श्रीम.पखाले सविता पुंडलिक
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== DAILY ROUTINE ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#F7F7F5' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
              >
                <Clock className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Daily Routine', 'दैनंदिन वेळापत्रक')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: '#059669' }} />

            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{
                background: '#FCFCFB',
                border: '1px solid #E7E7E4',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div className="space-y-0">
                {dailyRoutine.map((item, i) => (
                  <motion.div
                    key={item.time}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="flex items-center justify-between py-4"
                    style={{ borderBottom: i < dailyRoutine.length - 1 ? '1px solid #E7E7E4' : 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: '#059669' }}
                      />
                      <span className="text-xs font-mono font-medium sm:text-sm" style={{ color: '#059669', minWidth: '130px' }}>
                        {item.time}
                      </span>
                    </div>
                    <span className="text-sm text-right" style={{ color: 'var(--public-text-secondary)' }}>
                      {t(item.en, item.mr)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
