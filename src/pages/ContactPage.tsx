import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, MessageCircle, User, Navigation2 } from 'lucide-react';

export default function ContactPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="relative min-h-screen">
      {/* Fixed cinematic background */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/contact-road.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
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
              className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-amber-500 sm:text-xs"
            >
              {t('Get in Touch', 'संपर्क साधा')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
            >
              {t('Contact Us', 'आमच्याशी संपर्क साधा')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-sm text-slate-300 sm:text-base"
            >
              {t(
                'Reach out to us for admissions, inquiries, or any other information',
                'प्रवेश, चौकशी किंवा इतर कोणत्याही माहितीसाठी आमच्याशी संपर्क साधा'
              )}
            </motion.p>
          </motion.div>
        </section>

        {/* School Address */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white/5">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('School Address', 'शाळेचा पत्ता')}
                </h2>
              </div>

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md sm:p-10">
                {/* Marathi Address */}
                <div className="mb-6">
                  <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">
                    {t('Address (Marathi)', 'पत्ता (मराठी)')}
                  </p>
                  <p className="font-devanagari text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                    शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज,<br />
                    ता.कर्जत, जि.रायगड,<br />
                    महाराष्ट्र 410201
                  </p>
                </div>

                {/* English Address */}
                <div className="border-t border-white/10 pt-6">
                  <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">
                    {t('Address (English)', 'पत्ता (इंग्रजी)')}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                    Government Secondary &amp; Higher Secondary Ashram School,<br />
                    Pathraj, Tal. Karjat, Dist. Raigad,<br />
                    Maharashtra 410201
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Details */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white/5">
                  <Phone className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Contact Details', 'संपर्क तपशील')}
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Principal */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="rounded-xl border border-white/[0.12] bg-white/5 p-6 backdrop-blur-sm sm:p-8"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/5">
                    <User className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
                    {t('Principal', 'मुख्याध्यापक')}
                  </p>
                  <a
                    href="tel:9423864391"
                    className="text-lg font-semibold text-amber-500 no-underline transition-colors hover:text-amber-400"
                  >
                    9423864391
                  </a>
                </motion.div>

                {/* Office/Clerk */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="rounded-xl border border-white/[0.12] bg-white/5 p-6 backdrop-blur-sm sm:p-8"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/5">
                    <Phone className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
                    {t('Office / Clerk', 'कार्यालय / लिपिक')}
                  </p>
                  <a
                    href="tel:7666971183"
                    className="text-lg font-semibold text-amber-500 no-underline transition-colors hover:text-amber-400"
                  >
                    7666971183
                  </a>
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="rounded-xl border border-white/[0.12] bg-white/5 p-6 backdrop-blur-sm sm:p-8"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/5">
                    <Mail className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
                    {t('Email', 'ईमेल')}
                  </p>
                  <a
                    href="mailto:hmpathraj22@gmail.com"
                    className="text-sm font-semibold text-amber-500 no-underline transition-colors hover:text-amber-400 sm:text-base"
                  >
                    hmpathraj22@gmail.com
                  </a>
                </motion.div>

                {/* WhatsApp */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="rounded-xl border border-white/[0.12] bg-white/5 p-6 backdrop-blur-sm sm:p-8"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
                    <MessageCircle className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
                    WhatsApp
                  </p>
                  <a
                    href="https://wa.me/919423864391"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:bg-amber-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t('Chat on WhatsApp', 'WhatsApp वर संपर्क करा')}
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Google Maps */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white/5">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Location', 'स्थान')}
                </h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-white/5 backdrop-blur-md">
                <iframe
                  title={t('School Location', 'शाळेचे स्थान')}
                  src="https://maps.google.com/maps?q=Government+Secondary+and+Higher+Secondary+Ashram+School+Pathraj+Karjat+Raigad+Maharashtra+410201&output=embed"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>

              {/* Navigate to School Button */}
              <div className="mt-6 text-center">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Government+Secondary+and+Higher+Secondary+Ashram+School,+Pathraj,+Karjat,+Raigad,+Maharashtra+410201"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white no-underline shadow-lg shadow-amber-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-500"
                >
                  <Navigation2 className="h-4 w-4" />
                  {t('Navigate to School', 'शाळेकडे नेव्हिगेट करा')}
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Direct inquiry options */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/[0.12] bg-slate-950/50 p-8 text-center backdrop-blur-md sm:p-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('Need help with an enquiry?', 'चौकशीसाठी मदत हवी आहे?')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              {t('Call the school office during working hours, send an email, or start a WhatsApp conversation. These channels are monitored by the school.', 'कामकाजाच्या वेळेत शाळा कार्यालयाला कॉल करा, ईमेल पाठवा किंवा WhatsApp संभाषण सुरू करा. या माध्यमांचे निरीक्षण शाळेकडून केले जाते.')}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href="tel:+917666971183" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-amber-500">
                <Phone className="h-4 w-4" aria-hidden="true" />{t('Call the office', 'कार्यालयाला कॉल करा')}
              </a>
              <a href="mailto:hmpathraj22@gmail.com?subject=School%20website%20enquiry" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-white/10">
                <Mail className="h-4 w-4" aria-hidden="true" />{t('Send an email', 'ईमेल पाठवा')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
