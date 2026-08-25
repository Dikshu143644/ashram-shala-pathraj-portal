import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Users, Building, Bed, Bot, MessageCircle, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [schoolStats, setSchoolStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalStandards: 0,
    totalVillages: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/school/stats');
        if (response.ok) {
          const data = await response.json();
          setSchoolStats(data);
        }
      } catch {
        // Fall back to defaults silently
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* ===== FIXED BACKGROUND ===== */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10">
        {/* ===== HERO SECTION ===== */}
        <section className="flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-5xl"
          >
            {/* Department kicker */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-emerald-400 sm:text-sm"
            >
              {t('Tribal Development Department, Maharashtra', 'आदिवासी विकास विभाग, महाराष्ट्र')}
            </motion.p>

            {/* School name in Devanagari */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mb-6 font-devanagari text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
            >
              शासकीय माध्यमिक व उच्च माध्यमिक
              <br />
              आश्रमशाळा पाथरज
            </motion.h1>

            {/* English tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mb-4 text-base font-light tracking-wide text-slate-300 sm:text-lg md:text-xl"
            >
              {t('Nurturing Tribal Youth Through Quality Education', 'दर्जेदार शिक्षणाद्वारे आदिवासी युवकांचे संगोपन')}
            </motion.p>

            {/* Location */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mb-10 text-xs text-slate-400 sm:text-sm"
            >
              {t('Pathraj, Tal. Karjat, Dist. Raigad, Maharashtra', 'पाथरज, ता. कर्जत, जि. रायगड, महाराष्ट्र')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
              >
                {t('Admissions', 'प्रवेश')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
              >
                {t('Contact Us', 'संपर्क करा')}
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ===== STATS STRIP ===== */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                { value: String(schoolStats.totalStudents || '460'), labelEn: 'Students', labelMr: 'विद्यार्थी', icon: GraduationCap },
                { value: String(schoolStats.totalStaff || '26'), labelEn: 'Staff', labelMr: 'कर्मचारी', icon: Users },
                { value: String(schoolStats.totalStandards || '12'), labelEn: 'Standards', labelMr: 'इयत्ता', icon: Building },
                { value: '520', labelEn: 'Hostel Beds', labelMr: 'वसतिगृह बेड', icon: Bed },
              ].map((stat, i) => (
                <motion.div
                  key={stat.labelEn}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-xl border border-white/10 bg-slate-900/40 p-6 text-center backdrop-blur-sm"
                >
                  <stat.icon className="mx-auto mb-3 h-6 w-6 text-emerald-400" />
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t(stat.labelEn, stat.labelMr)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== FEATURE CARDS ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                {t('School Services', 'शाळा सेवा')}
              </h2>
              <div className="mx-auto mb-4 h-0.5 w-16 bg-emerald-400" />
              <p className="text-sm text-slate-300">
                {t('Access our digital services and portals', 'आमच्या डिजिटल सेवा आणि पोर्टल्स वापरा')}
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: GraduationCap,
                  titleEn: 'Admission',
                  titleMr: 'प्रवेश',
                  descEn: 'Online admission process for new students with easy form submission.',
                  descMr: 'नवीन विद्यार्थ्यांसाठी सुलभ फॉर्म सबमिशनसह ऑनलाइन प्रवेश प्रक्रिया.',
                  to: '/admission',
                },
                {
                  icon: Bot,
                  titleEn: 'AI Assistant',
                  titleMr: 'AI सहाय्यक',
                  descEn: 'Get instant answers about school, admission, and more using our AI chatbot.',
                  descMr: 'शाळा, प्रवेश आणि बरेच काही यांबद्दल तत्काळ उत्तरे मिळवा.',
                  to: '/contact',
                },
                {
                  icon: Users,
                  titleEn: 'Parent Portal',
                  titleMr: 'पालक पोर्टल',
                  descEn: 'Track your child\'s attendance, progress, and school activities.',
                  descMr: 'तुमच्या मुलाची उपस्थिती, प्रगती आणि शालेय उपक्रम पहा.',
                  to: '/login',
                },
                {
                  icon: MessageCircle,
                  titleEn: 'WhatsApp Bot',
                  titleMr: 'WhatsApp बॉट',
                  descEn: 'Get updates and notifications directly on WhatsApp.',
                  descMr: 'WhatsApp वर थेट अपडेट आणि सूचना मिळवा.',
                  to: '/contact',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.titleEn}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link
                    to={item.to}
                    className="group block h-full rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900/60"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <item.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-white">
                      {t(item.titleEn, item.titleMr)}
                      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {t(item.descEn, item.descMr)}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
