import { motion } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export default function LandingPage({ onNavigateLogin, onNavigateRegister }: LandingPageProps) {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Fixed Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#E7E7E4] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black">
              <span className="material-symbols-outlined text-white text-[18px]">school</span>
            </div>
            <span className="font-devanagari text-sm font-semibold text-black sm:text-base">
              आश्रमशाळा पाथरज
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="rounded-full border border-[#E7E7E4] bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:border-black/20 hover:bg-[#F3F2EF]"
            >
              {t('Login', 'लॉगिन')}
            </button>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1a1a1a]"
            >
              {t('Register', 'नोंदणी')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-[72px]">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-[#059669]/[0.04] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[5%] right-[-5%] h-[400px] w-[400px] rounded-full bg-black/[0.02] blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.15em] text-[#6B6B6B] sm:text-sm">
              {t('Government of Maharashtra - Tribal Development Department', 'महाराष्ट्र शासन - आदिवासी विकास विभाग')}
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-devanagari text-[clamp(2.5rem,8vw,5.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-black"
          >
            शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-8 max-w-xl text-lg text-[#6B6B6B] sm:text-xl"
          >
            {t('Nurturing Tribal Youth Since 1985', 'आदिवासी युवकांचे संगोपन - १९८५ पासून')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={onNavigateRegister}
              className="flex h-12 items-center gap-2 rounded-full bg-black px-7 text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              {t('Apply Now', 'आत्ता अर्ज करा')}
            </button>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="flex h-12 items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-7 text-sm font-medium text-black transition-all hover:border-black/20 hover:bg-[#F3F2EF]"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              {t('Portal Login', 'पोर्टल लॉगिन')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-[#E7E7E4] bg-white py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-5 sm:gap-12">
          {[
            { value: '459', label: t('Students', 'विद्यार्थी') },
            { value: '38', label: t('Staff', 'कर्मचारी') },
            { value: '12', label: t('Standards', 'इयत्ता') },
            { value: '520', label: t('Hostel Beds', 'वसतिगृह बेड') },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2 text-center">
              <span className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">{stat.value}</span>
              <span className="text-sm text-[#6B6B6B]">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-5 py-[clamp(80px,12vw,160px)]">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-[#6B6B6B]">
              {t('DIGITAL INFRASTRUCTURE', 'डिजिटल पायाभूत सुविधा')}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              {t('Everything in one place', 'सर्व काही एकाच ठिकाणी')}
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: 'how_to_reg',
                title: t('Admission Portal', 'प्रवेश पोर्टल'),
                description: t(
                  'Digital applications, document verification, and enrollment tracking',
                  'डिजिटल अर्ज, दस्तऐवज पडताळणी आणि प्रवेश ट्रॅकिंग'
                ),
              },
              {
                icon: 'smart_toy',
                title: t('AI Assistant', 'AI सहाय्यक'),
                description: t(
                  'Intelligent help for admissions, attendance, and school queries',
                  'प्रवेश, हजेरी आणि शालेय प्रश्नांसाठी बुद्धिमान मदत'
                ),
              },
              {
                icon: 'chat',
                title: t('WhatsApp Bot', 'व्हॉट्सअँप बॉट'),
                description: t(
                  'Automated parent notifications and real-time updates via WhatsApp',
                  'व्हॉट्सअँपद्वारे स्वयंचलित पालक सूचना'
                ),
              },
              {
                icon: 'family_restroom',
                title: t('Parent Portal', 'पालक पोर्टल'),
                description: t(
                  'Track attendance, grades, and hostel status from anywhere',
                  'कुठूनही हजेरी, गुण आणि वसतिगृह स्थिती पहा'
                ),
              },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group rounded-3xl border border-[#E7E7E4] bg-[#FCFCFB] p-6 transition-all hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F2EF] text-black transition-colors group-hover:bg-black group-hover:text-white">
                  <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-black">{card.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B6B6B]">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="border-t border-[#E7E7E4] bg-white px-5 py-[clamp(80px,12vw,140px)]">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-[#6B6B6B]">
              {t('ABOUT THE SCHOOL', 'शाळेबद्दल')}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              {t('Empowering Tribal Communities Through Education', 'शिक्षणाद्वारे आदिवासी समुदायांचे सक्षमीकरण')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6B6B6B] sm:text-lg">
              {t(
                'Located in Pathraj, Taluka Karjat, District Raigad, our government residential school provides quality education and holistic development for tribal students from 5th to 12th standard, with complete hostel facilities and a dedicated teaching staff.',
                'रायगड जिल्ह्यातील कर्जत तालुक्यातील पाथरज येथे स्थित, आमची शासकीय निवासी शाळा ५वी ते १२वी इयत्तेपर्यंत आदिवासी विद्यार्थ्यांना दर्जेदार शिक्षण आणि सर्वांगीण विकास प्रदान करते.'
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust / Government Strip */}
      <section className="overflow-hidden border-y border-[#E7E7E4] bg-[#F3F2EF] py-6">
        <div className="animate-marquee flex w-max items-center gap-12">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-12">
              <div className="flex items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-5 py-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#6B6B6B]">assured_workload</span>
                <span className="whitespace-nowrap text-sm font-medium text-black">
                  {t('Tribal Development Department', 'आदिवासी विकास विभाग')}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-5 py-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#6B6B6B]">account_balance</span>
                <span className="whitespace-nowrap text-sm font-medium text-black">
                  {t('Government of Maharashtra', 'महाराष्ट्र शासन')}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-5 py-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#6B6B6B]">school</span>
                <span className="whitespace-nowrap text-sm font-medium text-black">
                  {t('Secondary & Higher Secondary', 'माध्यमिक व उच्च माध्यमिक')}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#E7E7E4] bg-white px-5 py-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#6B6B6B]">diversity_3</span>
                <span className="whitespace-nowrap text-sm font-medium text-black">
                  {t('Residential Ashram School', 'निवासी आश्रमशाळा')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7E7E4] bg-white px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                <span className="material-symbols-outlined text-white text-[16px]">school</span>
              </div>
              <span className="font-devanagari text-sm font-semibold">आश्रमशाळा पाथरज</span>
            </div>
            <p className="text-sm leading-relaxed text-[#6B6B6B]">
              {t(
                'Tal. Karjat, Dist. Raigad, Maharashtra 410201',
                'ता. कर्जत, जि. रायगड, महाराष्ट्र ४१०२०१'
              )}
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.1em] text-[#6B6B6B]">
              {t('About', 'माहिती')}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#6B6B6B]">
              <li><span className="cursor-pointer hover:text-black">{t('About School', 'शाळेबद्दल')}</span></li>
              <li><span className="cursor-pointer hover:text-black">{t('Academics', 'शैक्षणिक')}</span></li>
              <li><span className="cursor-pointer hover:text-black">{t('Gallery', 'गॅलरी')}</span></li>
              <li><span className="cursor-pointer hover:text-black">{t('Contact', 'संपर्क')}</span></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.1em] text-[#6B6B6B]">
              {t('Services', 'सेवा')}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#6B6B6B]">
              <li><span className="cursor-pointer hover:text-black">{t('Admission', 'प्रवेश')}</span></li>
              <li><span className="cursor-pointer hover:text-black">{t('Hostel', 'वसतिगृह')}</span></li>
              <li><span className="cursor-pointer hover:text-black">{t('WhatsApp Bot', 'व्हॉट्सअँप बॉट')}</span></li>
              <li><span className="cursor-pointer hover:text-black">{t('Parent Portal', 'पालक पोर्टल')}</span></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.1em] text-[#6B6B6B]">
              {t('Connect', 'संपर्क')}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#6B6B6B]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>ashramshala.pathraj@tribal.gov.in</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>+91 2148 222 456</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl border-t border-[#E7E7E4] pt-6">
          <p className="text-center text-xs text-[#A3A3A3]">
            &copy; 2026 {t('Tribal Development Department, Government of Maharashtra', 'आदिवासी विकास विभाग, महाराष्ट्र शासन')}
          </p>
        </div>
      </footer>
    </div>
  );
}
