import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Users, Building, Bed, Bot, MessageCircle, ArrowRight, Sparkles, MapPin } from 'lucide-react';

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

  const stats = [
    { value: String(schoolStats.totalStudents || '460'), labelEn: 'Students', labelMr: 'विद्यार्थी', icon: GraduationCap, tone: 'purple' as const },
    { value: String(schoolStats.totalStaff || '26'), labelEn: 'Staff', labelMr: 'कर्मचारी', icon: Users, tone: 'orange' as const },
    { value: String(schoolStats.totalStandards || '12'), labelEn: 'Standards', labelMr: 'इयत्ता', icon: Building, tone: 'purple' as const },
    { value: '520', labelEn: 'Hostel Beds', labelMr: 'वसतिगृह बेड', icon: Bed, tone: 'orange' as const },
  ];

  const services = [
    {
      icon: GraduationCap,
      titleEn: 'Admission', titleMr: 'प्रवेश',
      descEn: 'Online admission process for new students with easy form submission.',
      descMr: 'नवीन विद्यार्थ्यांसाठी सुलभ फॉर्म सबमिशनसह ऑनलाइन प्रवेश प्रक्रिया.',
      to: '/admission', tone: 'purple' as const,
    },
    {
      icon: Bot,
      titleEn: 'AI Assistant', titleMr: 'AI सहाय्यक',
      descEn: 'Get instant answers about school, admission, and more using our AI chatbot.',
      descMr: 'शाळा, प्रवेश आणि बरेच काही यांबद्दल तत्काळ उत्तरे मिळवा.',
      to: '/contact', tone: 'orange' as const,
    },
    {
      icon: Users,
      titleEn: 'Parent Portal', titleMr: 'पालक पोर्टल',
      descEn: "Track your child's attendance, progress, and school activities.",
      descMr: 'तुमच्या मुलाची उपस्थिती, प्रगती आणि शालेय उपक्रम पहा.',
      to: '/login', tone: 'purple' as const,
    },
    {
      icon: MessageCircle,
      titleEn: 'WhatsApp Bot', titleMr: 'WhatsApp बॉट',
      descEn: 'Get updates and notifications directly on WhatsApp.',
      descMr: 'WhatsApp वर थेट अपडेट आणि सूचना मिळवा.',
      to: '/contact', tone: 'orange' as const,
    },
  ];

  const toneClasses = (tone: 'purple' | 'orange') =>
    tone === 'purple'
      ? 'from-[#7C3AED]/12 to-[#7C3AED]/[0.03] border-[#7C3AED]/20 text-[#7C3AED]'
      : 'from-[#F97316]/12 to-[#F97316]/[0.03] border-[#F97316]/20 text-[#F97316]';

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-white/55 bg-white/60 px-6 py-16 text-center shadow-[0_24px_60px_rgba(80,60,160,0.12)] backdrop-blur-2xl sm:px-12 sm:py-24"
        >
          {/* inner soft light */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/60 to-transparent" />

          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-[#7C3AED]/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6D28D9] backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t('Tribal Development Department, Maharashtra', 'आदिवासी विकास विभाग, महाराष्ट्र')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative mx-auto mt-7 max-w-4xl font-devanagari text-3xl font-bold leading-tight text-[#1A1A2E] sm:text-4xl md:text-5xl lg:text-6xl"
          >
            शासकीय माध्यमिक व उच्च माध्यमिक
            <br />
            <span className="gradient-text-purple">आश्रमशाळा पाथरज</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="relative mx-auto mt-5 max-w-2xl text-base font-medium tracking-wide text-[#6B7280] sm:text-lg md:text-xl"
          >
            {t('Nurturing Tribal Youth Through Quality Education', 'दर्जेदार शिक्षणाद्वारे आदिवासी युवकांचे संगोपन')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="relative mt-3 inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] sm:text-sm"
          >
            <MapPin className="h-3.5 w-3.5" />
            {t('Pathraj, Tal. Karjat, Dist. Raigad, Maharashtra', 'पाथरज, ता. कर्जत, जि. रायगड, महाराष्ट्र')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="relative mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/admission"
              className="inline-flex items-center gap-2 rounded-[16px] bg-gradient-to-br from-[#F97316] to-[#EA580C] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(249,115,22,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105"
            >
              {t('Apply for Admission', 'प्रवेशासाठी अर्ज करा')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-[16px] border border-[#7C3AED]/18 bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#6D28D9] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              {t('Contact Us', 'संपर्क करा')}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS (bento) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.labelEn}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-[24px] border border-white/55 bg-white/60 p-6 text-center shadow-[0_8px_32px_rgba(80,60,160,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(80,60,160,0.16)]"
            >
              <div className={`mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${toneClasses(stat.tone)}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-3xl font-bold text-[#1A1A2E] sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-[#6B7280]">{t(stat.labelEn, stat.labelMr)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SERVICES (bento) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="mb-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
            {t('Digital Services', 'डिजिटल सेवा')}
          </p>
          <h2 className="font-display text-2xl font-bold text-[#1A1A2E] sm:text-3xl lg:text-4xl">
            {t('School Services', 'शाळा सेवा')}
          </h2>
          <p className="mt-3 text-sm text-[#6B7280]">
            {t('Access our digital services and portals', 'आमच्या डिजिटल सेवा आणि पोर्टल्स वापरा')}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((item, i) => (
            <motion.div
              key={item.titleEn}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={item.to}
                className="group block h-full rounded-[24px] border border-white/55 bg-white/60 p-6 shadow-[0_8px_32px_rgba(80,60,160,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED]/25 hover:shadow-[0_16px_48px_rgba(80,60,160,0.16)]"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${toneClasses(item.tone)}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 flex items-center gap-2 font-display text-base font-semibold text-[#1A1A2E]">
                  {t(item.titleEn, item.titleMr)}
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-[#7C3AED] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="text-sm leading-relaxed text-[#6B7280]">
                  {t(item.descEn, item.descMr)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
