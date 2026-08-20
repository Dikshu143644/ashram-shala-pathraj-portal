import { useAppContext } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Users, Building, Bed, Monitor, Dumbbell, Music, BookOpen, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section
        className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-24 text-center"
        style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d14 40%, #111118 100%)' }}
      >
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(139, 26, 43, 0.4) 0%, transparent 70%)' }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(196, 40, 71, 0.3) 0%, transparent 70%)' }}
          />
          <div
            className="absolute left-1/6 top-1/6 h-[200px] w-[200px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(230, 126, 34, 0.3) 0%, transparent 70%)' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-5xl"
        >
          {/* Department kicker */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 text-[11px] font-medium uppercase tracking-[0.25em] sm:text-xs"
            style={{ color: 'var(--public-accent-ember)' }}
          >
            {t('Tribal Development Department, Maharashtra', 'आदिवासी विकास विभाग, महाराष्ट्र')}
          </motion.p>

          {/* School name in Devanagari */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mb-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            style={{ color: '#f5f5f5' }}
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
            className="mb-4 text-base font-light tracking-wide sm:text-lg md:text-xl"
            style={{ color: 'var(--public-text-secondary)' }}
          >
            Government Tribal Residential School
          </motion.p>

          {/* Location */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mb-10 text-xs sm:text-sm"
            style={{ color: 'var(--public-text-muted)' }}
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
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #8b1a2b 0%, #a91d3a 50%, #c42847 100%)',
                boxShadow: '0 4px 20px rgba(139, 26, 43, 0.4)',
              }}
            >
              {t('Admissions', 'प्रवेश')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: 'rgba(139, 26, 43, 0.5)',
                color: 'var(--public-text-primary)',
                background: 'rgba(139, 26, 43, 0.08)',
              }}
            >
              {t('Contact Us', 'संपर्क करा')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0d0d14)' }}
        />
      </section>

      {/* ===== STATS STRIP ===== */}
      <section
        className="relative py-14 px-4"
        style={{ background: '#0d0d14', borderTop: '1px solid rgba(139, 26, 43, 0.15)', borderBottom: '1px solid rgba(139, 26, 43, 0.15)' }}
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {[
              { value: '459', labelEn: 'Students', labelMr: 'विद्यार्थी', icon: GraduationCap },
              { value: '25', labelEn: 'Staff', labelMr: 'कर्मचारी', icon: Users },
              { value: '12', labelEn: 'Standards', labelMr: 'इयत्ता', icon: Building },
              { value: '520', labelEn: 'Hostel Beds', labelMr: 'वसतिगृह बेड', icon: Bed },
            ].map((stat, i) => (
              <motion.div
                key={stat.labelEn}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <stat.icon className="mb-3 h-6 w-6" style={{ color: '#a91d3a' }} />
                <p className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-xs tracking-wide uppercase" style={{ color: 'var(--public-text-muted)' }}>
                  {t(stat.labelEn, stat.labelMr)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0a0a0f' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl lg:text-4xl" style={{ color: '#f5f5f5' }}>
              {t('About Ashram Shala', 'आश्रमशाळा बद्दल')}
            </h2>
            <div className="mx-auto mb-8 h-0.5 w-16" style={{ background: 'linear-gradient(90deg, transparent, #a91d3a, transparent)' }} />
            <p className="text-sm leading-relaxed sm:text-base lg:text-lg" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.8' }}>
              {t(
                'The Ashram Shala system is a residential schooling initiative by the Tribal Development Department, Government of Maharashtra. These schools provide free education, boarding, lodging, and nutritious meals to students from tribal communities. Our school at Pathraj, Tal. Karjat, Dist. Raigad has been serving tribal students with quality education in Marathi medium from Standard 1st to 12th, with Higher Secondary (11th-12th) in the Arts stream.',
                'आश्रमशाळा प्रणाली ही आदिवासी विकास विभाग, महाराष्ट्र शासनाची एक निवासी शैक्षणिक उपक्रम आहे. या शाळा आदिवासी समुदायातील विद्यार्थ्यांना मोफत शिक्षण, निवास, राहणे आणि पौष्टिक आहार प्रदान करतात. पाथरज, ता. कर्जत, जि. रायगड येथील आमची शाळा इयत्ता १ ली ते १२ वी पर्यंत मराठी माध्यमात दर्जेदार शिक्षण देत आदिवासी विद्यार्थ्यांची सेवा करत आहे, उच्च माध्यमिक (११ वी-१२ वी) कला शाखेत उपलब्ध आहे.'
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== PRINCIPAL'S MESSAGE ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0d0d14' }}>
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ color: '#f5f5f5' }}>
              {t("Principal's Message", 'मुख्याध्यापकांचा संदेश')}
            </h2>
            <div className="mx-auto mb-10 h-0.5 w-16" style={{ background: 'linear-gradient(90deg, transparent, #a91d3a, transparent)' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative rounded-2xl p-8 sm:p-10"
            style={{
              background: 'linear-gradient(145deg, #111118 0%, #151520 100%)',
              border: '1px solid rgba(139, 26, 43, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Quote mark */}
            <div
              className="absolute top-4 left-6 text-5xl font-serif opacity-20 select-none"
              style={{ color: '#a91d3a' }}
            >
              &ldquo;
            </div>

            <p className="relative mb-6 text-sm italic leading-relaxed sm:text-base" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
              {t(
                'Our mission is to provide quality education to tribal students and empower them to build a better future. Every child who enters our school carries the dreams of their family and community. We are committed to nurturing their potential through dedicated teaching, a supportive residential environment, and holistic development programs. Together, we are building a generation of educated, confident tribal youth.',
                'आदिवासी विद्यार्थ्यांना दर्जेदार शिक्षण देणे आणि त्यांना उज्ज्वल भविष्य घडविण्यासाठी सक्षम करणे हे आमचे ध्येय आहे. आमच्या शाळेत प्रवेश करणारे प्रत्येक मूल त्यांच्या कुटुंबाची आणि समुदायाची स्वप्ने घेऊन येते. समर्पित अध्यापन, सहाय्यक निवासी वातावरण आणि सर्वांगीण विकास कार्यक्रमांद्वारे त्यांच्या क्षमतांचे संवर्धन करण्यासाठी आम्ही वचनबद्ध आहोत. एकत्रितपणे, आम्ही शिक्षित, आत्मविश्वासू आदिवासी तरुणांची पिढी घडवत आहोत.'
              )}
            </p>

            <div className="border-t pt-5" style={{ borderColor: 'rgba(139, 26, 43, 0.2)' }}>
              <p className="text-base font-semibold text-white">
                {t('Shri. Bansode Ajit Lalasaheb', 'श्री.बनसोडे अजित लालासाहेब')}
              </p>
              <p className="mt-1 text-xs tracking-wide" style={{ color: '#a91d3a' }}>
                {t('Acting Principal', 'प्रभारी मुख्याध्यापक')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SCHOOL HIGHLIGHTS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0a0a0f' }}>
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl lg:text-4xl" style={{ color: '#f5f5f5' }}>
              {t('School Highlights', 'शाळेची वैशिष्ट्ये')}
            </h2>
            <div className="mx-auto mb-4 h-0.5 w-16" style={{ background: 'linear-gradient(90deg, transparent, #a91d3a, transparent)' }} />
            <p className="text-sm" style={{ color: 'var(--public-text-muted)' }}>
              {t('Facilities and programs that make our school special', 'सुविधा आणि कार्यक्रम जे आमची शाळा विशेष बनवतात')}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Monitor,
                titleEn: 'Digital Education',
                titleMr: 'डिजिटल शिक्षण',
                descEn: 'Smart classrooms with digital learning tools for interactive and modern education.',
                descMr: 'परस्परसंवादी आणि आधुनिक शिक्षणासाठी डिजिटल शिक्षण साधनांसह स्मार्ट वर्गखोल्या.',
              },
              {
                icon: Bed,
                titleEn: 'Hostel Facility',
                titleMr: 'वसतिगृह सुविधा',
                descEn: '520-bed residential facility with separate wings for boys and girls, providing safe and comfortable living.',
                descMr: 'मुलांसाठी आणि मुलींसाठी स्वतंत्र विभागांसह ५२० बेडची निवासी सुविधा, सुरक्षित आणि आरामदायक राहणीमान.',
              },
              {
                icon: Dumbbell,
                titleEn: 'Sports & Fitness',
                titleMr: 'क्रीडा व तंदुरुस्ती',
                descEn: 'Sports grounds and fitness activities to ensure physical development alongside academics.',
                descMr: 'शैक्षणिक विकासासोबत शारीरिक विकास सुनिश्चित करण्यासाठी क्रीडांगणे आणि तंदुरुस्ती उपक्रम.',
              },
              {
                icon: Music,
                titleEn: 'Cultural Activities',
                titleMr: 'सांस्कृतिक उपक्रम',
                descEn: 'Regular cultural programs celebrating tribal heritage, festivals, and artistic expression.',
                descMr: 'आदिवासी वारसा, सण आणि कलात्मक अभिव्यक्तीचा उत्सव साजरा करणारे नियमित सांस्कृतिक कार्यक्रम.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.titleEn}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(145deg, #111118 0%, #15151f 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Icon */}
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(139, 26, 43, 0.12)', border: '1px solid rgba(139, 26, 43, 0.2)' }}
                >
                  <item.icon className="h-5 w-5" style={{ color: '#c42847' }} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  {t(item.titleEn, item.titleMr)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--public-text-muted)', lineHeight: '1.7' }}>
                  {t(item.descEn, item.descMr)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUICK LINKS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0d0d14' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ color: '#f5f5f5' }}>
              {t('Quick Links', 'जलद दुवे')}
            </h2>
            <div className="mx-auto h-0.5 w-16" style={{ background: 'linear-gradient(90deg, transparent, #a91d3a, transparent)' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            {[
              { to: '/admission', titleEn: 'Admissions', titleMr: 'प्रवेश', descEn: 'Learn about the admission process and eligibility', descMr: 'प्रवेश प्रक्रिया आणि पात्रता जाणून घ्या', icon: BookOpen },
              { to: '/contact', titleEn: 'Contact', titleMr: 'संपर्क', descEn: 'Get in touch with the school administration', descMr: 'शाळा प्रशासनाशी संपर्क साधा', icon: Users },
              { to: '/academics', titleEn: 'Academics', titleMr: 'शैक्षणिक', descEn: 'Explore our curriculum and academic programs', descMr: 'आमचा अभ्यासक्रम आणि शैक्षणिक कार्यक्रम शोधा', icon: GraduationCap },
            ].map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i + 0.3, duration: 0.5 }}
              >
                <Link
                  to={link.to}
                  className="group block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(145deg, #111118 0%, #15151f 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <link.icon className="mb-3 h-5 w-5" style={{ color: '#a91d3a' }} />
                  <h3 className="mb-1 text-sm font-semibold text-white flex items-center gap-2">
                    {t(link.titleEn, link.titleMr)}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: '#a91d3a' }} />
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--public-text-muted)' }}>
                    {t(link.descEn, link.descMr)}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
