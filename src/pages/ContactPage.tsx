import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, MessageCircle, Send, User } from 'lucide-react';

export default function ContactPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section
        className="relative flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center"
        style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d14 50%, #111118 100%)' }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(139, 26, 43, 0.4) 0%, transparent 70%)' }}
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
            {t('Get in Touch', 'संपर्क साधा')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mb-5 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
            style={{ color: '#f5f5f5' }}
          >
            {t('Contact Us', 'आमच्याशी संपर्क साधा')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm sm:text-base"
            style={{ color: 'var(--public-text-muted)' }}
          >
            {t(
              'Reach out to us for admissions, inquiries, or any other information',
              'प्रवेश, चौकशी किंवा इतर कोणत्याही माहितीसाठी आमच्याशी संपर्क साधा'
            )}
          </motion.p>
        </motion.div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0d0d14)' }}
        />
      </section>

      {/* ===== SCHOOL ADDRESS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0d0d14' }}>
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
                style={{ background: 'rgba(139, 26, 43, 0.12)', border: '1px solid rgba(139, 26, 43, 0.25)' }}
              >
                <MapPin className="h-5 w-5" style={{ color: '#c42847' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#f5f5f5' }}>
                {t('School Address', 'शाळेचा पत्ता')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: 'linear-gradient(90deg, #a91d3a, transparent)' }} />

            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{
                background: 'linear-gradient(145deg, #111118 0%, #151520 100%)',
                border: '1px solid rgba(139, 26, 43, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Marathi Address */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--public-text-muted)' }}>
                  {t('Address (Marathi)', 'पत्ता (मराठी)')}
                </p>
                <p className="font-devanagari text-sm leading-relaxed sm:text-base" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                  शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज,<br />
                  ता.कर्जत, जि.रायगड,<br />
                  महाराष्ट्र 410201
                </p>
              </div>

              {/* English Address */}
              <div className="pt-6" style={{ borderTop: '1px solid rgba(139, 26, 43, 0.1)' }}>
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--public-text-muted)' }}>
                  {t('Address (English)', 'पत्ता (इंग्रजी)')}
                </p>
                <p className="text-sm leading-relaxed sm:text-base" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                  Government Secondary &amp; Higher Secondary Ashram School,<br />
                  Pathraj, Tal. Karjat, Dist. Raigad,<br />
                  Maharashtra 410201
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT DETAILS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0a0a0f' }}>
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
                style={{ background: 'rgba(139, 26, 43, 0.12)', border: '1px solid rgba(139, 26, 43, 0.25)' }}
              >
                <Phone className="h-5 w-5" style={{ color: '#c42847' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#f5f5f5' }}>
                {t('Contact Details', 'संपर्क तपशील')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: 'linear-gradient(90deg, #a91d3a, transparent)' }} />

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Principal */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  background: 'linear-gradient(145deg, #111118 0%, #151520 100%)',
                  border: '1px solid rgba(139, 26, 43, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full mb-4"
                  style={{ background: 'rgba(139, 26, 43, 0.12)', border: '1px solid rgba(139, 26, 43, 0.25)' }}
                >
                  <User className="h-4 w-4" style={{ color: '#c42847' }} />
                </div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                  {t('Principal', 'मुख्याध्यापक')}
                </p>
                <a
                  href="tel:9423864391"
                  className="text-lg font-semibold no-underline transition-colors hover:opacity-80"
                  style={{ color: '#c42847' }}
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
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  background: 'linear-gradient(145deg, #111118 0%, #151520 100%)',
                  border: '1px solid rgba(139, 26, 43, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full mb-4"
                  style={{ background: 'rgba(139, 26, 43, 0.12)', border: '1px solid rgba(139, 26, 43, 0.25)' }}
                >
                  <Phone className="h-4 w-4" style={{ color: '#c42847' }} />
                </div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                  {t('Office / Clerk', 'कार्यालय / लिपिक')}
                </p>
                <a
                  href="tel:7666971183"
                  className="text-lg font-semibold no-underline transition-colors hover:opacity-80"
                  style={{ color: '#c42847' }}
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
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  background: 'linear-gradient(145deg, #111118 0%, #151520 100%)',
                  border: '1px solid rgba(139, 26, 43, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full mb-4"
                  style={{ background: 'rgba(139, 26, 43, 0.12)', border: '1px solid rgba(139, 26, 43, 0.25)' }}
                >
                  <Mail className="h-4 w-4" style={{ color: '#c42847' }} />
                </div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                  {t('Email', 'ईमेल')}
                </p>
                <a
                  href="mailto:hmpathraj22@gmail.com"
                  className="text-sm font-semibold no-underline transition-colors hover:opacity-80 sm:text-base"
                  style={{ color: '#c42847' }}
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
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  background: 'linear-gradient(145deg, #111118 0%, #151520 100%)',
                  border: '1px solid rgba(139, 26, 43, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full mb-4"
                  style={{ background: 'rgba(37, 211, 102, 0.12)', border: '1px solid rgba(37, 211, 102, 0.25)' }}
                >
                  <MessageCircle className="h-4 w-4" style={{ color: '#25D366' }} />
                </div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                  WhatsApp
                </p>
                <a
                  href="https://wa.me/919423864391"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('Chat on WhatsApp', 'WhatsApp वर संपर्क करा')}
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== GOOGLE MAPS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0d0d14' }}>
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
                style={{ background: 'rgba(139, 26, 43, 0.12)', border: '1px solid rgba(139, 26, 43, 0.25)' }}
              >
                <MapPin className="h-5 w-5" style={{ color: '#c42847' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#f5f5f5' }}>
                {t('Location', 'स्थान')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: 'linear-gradient(90deg, #a91d3a, transparent)' }} />

            <div
              className="overflow-hidden rounded-2xl"
              style={{
                border: '1px solid rgba(139, 26, 43, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <iframe
                title={t('School Location', 'शाळेचे स्थान')}
                src="https://maps.google.com/maps?q=Pathraj+Karjat+Raigad+Maharashtra+410201&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT FORM (Coming Soon) ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0a0a0f' }}>
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
                style={{ background: 'rgba(139, 26, 43, 0.12)', border: '1px solid rgba(139, 26, 43, 0.25)' }}
              >
                <Send className="h-5 w-5" style={{ color: '#c42847' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#f5f5f5' }}>
                {t('Send a Message', 'संदेश पाठवा')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: 'linear-gradient(90deg, #a91d3a, transparent)' }} />

            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{
                background: 'linear-gradient(145deg, #111118 0%, #151520 100%)',
                border: '1px solid rgba(139, 26, 43, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Simple visual contact form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                    {t('Your Name', 'आपले नाव')}
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder={t('Enter your name', 'आपले नाव प्रविष्ट करा')}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-40"
                    style={{
                      background: 'rgba(139, 26, 43, 0.06)',
                      border: '1px solid rgba(139, 26, 43, 0.15)',
                      color: 'var(--public-text-secondary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                    {t('Mobile Number', 'मोबाईल नंबर')}
                  </label>
                  <input
                    type="tel"
                    disabled
                    placeholder={t('Enter your mobile number', 'आपला मोबाईल नंबर प्रविष्ट करा')}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-40"
                    style={{
                      background: 'rgba(139, 26, 43, 0.06)',
                      border: '1px solid rgba(139, 26, 43, 0.15)',
                      color: 'var(--public-text-secondary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--public-text-muted)' }}>
                    {t('Message', 'संदेश')}
                  </label>
                  <textarea
                    disabled
                    rows={4}
                    placeholder={t('Write your message here', 'आपला संदेश येथे लिहा')}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none placeholder:opacity-40"
                    style={{
                      background: 'rgba(139, 26, 43, 0.06)',
                      border: '1px solid rgba(139, 26, 43, 0.15)',
                      color: 'var(--public-text-secondary)',
                    }}
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white opacity-60 cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #8b1a2b, #a91d3a)' }}
                  >
                    <Send className="h-4 w-4" />
                    {t('Coming Soon', 'लवकरच उपलब्ध')}
                  </button>
                  <p className="mt-3 text-xs" style={{ color: 'var(--public-text-muted)' }}>
                    {t(
                      'Contact form will be available soon. Meanwhile, please reach us via phone or WhatsApp.',
                      'संपर्क फॉर्म लवकरच उपलब्ध होईल. तोपर्यंत कृपया फोन किंवा WhatsApp द्वारे संपर्क साधा.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
