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
    <div className="relative min-h-screen">
      {/* ===== FIXED BACKGROUND ===== */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/hostel-building.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10">
        {/* ===== HERO SECTION ===== */}
        <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-amber-500 sm:text-sm"
            >
              {t('Residential Facility', 'निवासी सुविधा')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
            >
              {t('Hostel Facilities', 'वसतिगृह सुविधा')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base text-slate-300 sm:text-lg"
            >
              {t(
                'Government residential facility providing safe and nurturing accommodation for all students',
                'सर्व विद्यार्थ्यांसाठी सुरक्षित आणि पोषक निवास पुरवणारी शासकीय निवासी सुविधा'
              )}
            </motion.p>
          </motion.div>
        </section>

        {/* ===== HOSTEL OVERVIEW ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-amber-500/10">
                  <Home className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Hostel Overview', 'वसतिगृह विहंगावलोकन')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md">
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base mb-8" style={{ lineHeight: '1.9' }}>
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
                    className="rounded-xl border border-white/[0.12] bg-white/5 p-5 text-center backdrop-blur-sm"
                  >
                    <p className="text-3xl font-bold text-white">520</p>
                    <p className="text-xs mt-1 text-slate-400">{t('Total Beds', 'एकूण बेड')}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rounded-xl border border-white/[0.12] bg-white/5 p-5 text-center backdrop-blur-sm"
                  >
                    <Users className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                    <p className="text-sm font-semibold text-white">{t('Boys Wing', 'मुलांचा विभाग')}</p>
                    <p className="text-xs mt-1 text-slate-400">{t('Separate facility', 'स्वतंत्र सुविधा')}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="rounded-xl border border-white/[0.12] bg-white/5 p-5 text-center backdrop-blur-sm"
                  >
                    <Users className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                    <p className="text-sm font-semibold text-white">{t('Girls Wing', 'मुलींचा विभाग')}</p>
                    <p className="text-xs mt-1 text-slate-400">{t('Separate facility', 'स्वतंत्र सुविधा')}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== MESS / DINING TIMINGS ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-amber-500/10">
                  <UtensilsCrossed className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Mess / Dining Timings', 'भोजन वेळ')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md">
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base mb-8" style={{ lineHeight: '1.9' }}>
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
                      className="flex items-center justify-between rounded-xl border border-white/[0.12] bg-white/5 p-5 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 flex-shrink-0 text-amber-500" />
                        <span className="text-sm font-medium text-white sm:text-base">{item.meal}</span>
                      </div>
                      <span className="text-sm font-semibold text-amber-500 sm:text-base">
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
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-amber-500/10">
                  <UserCheck className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Hostel Wardens', 'वसतिगृह प्रमुख')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="grid gap-6 sm:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] bg-amber-500/10 mb-4">
                    <Users className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                    {t('Boys Hostel Warden', 'मुलांचे वसतिगृह प्रमुख')}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    श्री.माने राजेंद्र परशराम
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] bg-amber-500/10 mb-4">
                    <Users className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                    {t('Girls Hostel Warden', 'मुलींचे वसतिगृह प्रमुख')}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    श्रीम.पखाले सविता पुंडलिक
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== DAILY ROUTINE ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Daily Routine', 'दैनंदिन वेळापत्रक')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md">
                <div className="space-y-0">
                  {dailyRoutine.map((item, i) => (
                    <motion.div
                      key={item.time}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="flex items-center justify-between py-4"
                      style={{ borderBottom: i < dailyRoutine.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full flex-shrink-0 bg-amber-500" />
                        <span className="text-xs font-mono font-medium text-amber-500 sm:text-sm" style={{ minWidth: '130px' }}>
                          {item.time}
                        </span>
                      </div>
                      <span className="text-sm text-right text-slate-300">
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
    </div>
  );
}
