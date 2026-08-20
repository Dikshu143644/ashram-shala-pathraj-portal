import { useAppContext } from '../contexts/AppContext';

export default function HomePage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-20 text-center" style={{ background: 'var(--public-gradient-hero)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full opacity-30" style={{ background: 'var(--public-glow-crimson)', filter: 'blur(80px)' }} />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full opacity-20" style={{ background: 'var(--public-glow-ember)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative z-10 max-w-4xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[var(--public-accent-ember)]">
            {t('Government of Maharashtra - Tribal Development Department', 'महाराष्ट्र शासन - आदिवासी विकास विभाग')}
          </p>
          <h1 className="font-devanagari mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
          </h1>
          <p className="mb-8 text-lg text-[var(--public-text-secondary)] sm:text-xl">
            {t('Government Tribal Residential School', 'शासकीय आदिवासी निवासी शाळा')}
          </p>

          {/* Stats */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { value: '459', labelEn: 'Students', labelMr: 'विद्यार्थी' },
              { value: '25', labelEn: 'Staff', labelMr: 'कर्मचारी' },
              { value: '12', labelEn: 'Standards', labelMr: 'इयत्ता' },
              { value: '520', labelEn: 'Hostel Beds', labelMr: 'वसतिगृह बेड' },
            ].map((stat) => (
              <div key={stat.labelEn} className="text-center">
                <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--public-text-muted)]">{t(stat.labelEn, stat.labelMr)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Brief Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'var(--public-bg-secondary)' }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="public-section-title mb-6 text-2xl font-bold sm:text-3xl">
            {t('About Ashram Shala', 'आश्रमशाळा बद्दल')}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--public-text-secondary)] sm:text-base">
            {t(
              'The Ashram Shala system is a residential schooling initiative by the Tribal Development Department, Government of Maharashtra, providing free education, boarding, and meals to tribal students from standards 1st to 12th. Our school at Pathraj, Karjat serves the tribal communities of Raigad district with quality education in Marathi medium.',
              'आश्रमशाळा प्रणाली ही आदिवासी विकास विभाग, महाराष्ट्र शासनाची एक निवासी शैक्षणिक योजना आहे, जी इयत्ता १ ली ते १२ वी पर्यंतच्या आदिवासी विद्यार्थ्यांना मोफत शिक्षण, निवास आणि भोजन पुरवते. पाथरज, कर्जत येथील आमची शाळा रायगड जिल्ह्यातील आदिवासी समुदायांना मराठी माध्यमात दर्जेदार शिक्षण देते.'
            )}
          </p>
        </div>
      </section>

      {/* Features / Highlights */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="public-section-title mb-10 text-center text-2xl font-bold sm:text-3xl">
            {t('School Highlights', 'शाळेची वैशिष्ट्ये')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { titleEn: 'Free Education', titleMr: 'मोफत शिक्षण', descEn: 'Complete free education from Std 1 to 12 for tribal students.', descMr: 'आदिवासी विद्यार्थ्यांसाठी इयत्ता १ ते १२ पर्यंत संपूर्ण मोफत शिक्षण.' },
              { titleEn: 'Residential Facility', titleMr: 'निवासी सुविधा', descEn: '520 bed hostel with separate wings for boys and girls.', descMr: 'मुलांसाठी आणि मुलींसाठी स्वतंत्र विभागांसह ५२० बेडचे वसतिगृह.' },
              { titleEn: 'Nutritious Meals', titleMr: 'पौष्टिक आहार', descEn: 'Three balanced meals daily - breakfast, lunch, and dinner.', descMr: 'दररोज तीन संतुलित जेवण - नाश्ता, दुपारचे जेवण आणि रात्रीचे जेवण.' },
              { titleEn: 'Experienced Staff', titleMr: 'अनुभवी कर्मचारी', descEn: '25 dedicated staff members including teachers and support staff.', descMr: 'शिक्षक आणि सहायक कर्मचाऱ्यांसह २५ समर्पित कर्मचारी.' },
              { titleEn: 'Arts Stream (11-12)', titleMr: 'कला शाखा (११-१२)', descEn: 'Higher secondary education in Arts stream. Science may be added soon.', descMr: 'कला शाखेत उच्च माध्यमिक शिक्षण. विज्ञान शाखा लवकरच सुरू होऊ शकते.' },
              { titleEn: 'Government Backed', titleMr: 'शासकीय पाठबळ', descEn: 'Fully funded by Tribal Development Department, Maharashtra.', descMr: 'आदिवासी विकास विभाग, महाराष्ट्र शासनाद्वारे पूर्णपणे अनुदानित.' },
            ].map((item) => (
              <div key={item.titleEn} className="public-card p-6">
                <h3 className="mb-2 text-base font-semibold text-white">{t(item.titleEn, item.titleMr)}</h3>
                <p className="text-sm leading-relaxed text-[var(--public-text-muted)]">{t(item.descEn, item.descMr)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principal Message */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'var(--public-bg-secondary)' }}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="public-section-title mb-6 text-2xl font-bold sm:text-3xl">
            {t("Principal's Message", 'मुख्याध्यापकांचा संदेश')}
          </h2>
          <div className="public-card p-8">
            <p className="mb-4 text-sm italic leading-relaxed text-[var(--public-text-secondary)]">
              {t(
                '"Our mission is to provide quality education to tribal students and empower them to build a better future. Every student deserves the opportunity to learn and grow, regardless of their background."',
                '"आदिवासी विद्यार्थ्यांना दर्जेदार शिक्षण देणे आणि त्यांना उज्ज्वल भविष्य घडविण्यासाठी सक्षम करणे हे आमचे ध्येय आहे. प्रत्येक विद्यार्थ्याला त्यांच्या पार्श्वभूमीची पर्वा न करता शिकण्याची आणि वाढण्याची संधी मिळायला हवी."'
              )}
            </p>
            <p className="font-devanagari text-sm font-semibold text-white">
              {t('Shri. Bansode Ajit Lalasaheb', 'श्री.बनसोडे अजित लालासाहेब')}
            </p>
            <p className="text-xs text-[var(--public-text-muted)]">
              {t('Acting Principal', 'प्रभारी मुख्याध्यापक')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
