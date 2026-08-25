import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { Building, Users, BookOpen, Home, Award, MapPin, Shield } from 'lucide-react';

export default function AboutPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [schoolStats, setSchoolStats] = useState({ totalStudents: 0, totalStaff: 0 });

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
          src="/images/about-school.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10">
        {/* ===== HERO SECTION ===== */}
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
              className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-amber-500 sm:text-sm"
            >
              {t('About Us', 'आमच्याबद्दल')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
            >
              {t('About Our School', 'आमच्या शाळेबद्दल')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-sm text-slate-300 sm:text-base"
            >
              {t(
                'A government residential school dedicated to tribal education since its establishment',
                'स्थापनेपासून आदिवासी शिक्षणासाठी समर्पित शासकीय निवासी शाळा'
              )}
            </motion.p>
          </motion.div>
        </section>

        {/* ===== SCHOOL HISTORY & MISSION ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('School History & Mission', 'शाळेचा इतिहास आणि ध्येय')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md sm:p-10">
                <p className="mb-6 text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                  {t(
                    'Government Secondary and Higher Secondary Ashram School, Pathraj is a residential educational institution established under the Tribal Development Department, Government of Maharashtra. The school was founded with the core mission of bringing quality education to tribal students from remote and underserved areas of the region.',
                    'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा, पाथरज ही आदिवासी विकास विभाग, महाराष्ट्र शासन अंतर्गत स्थापित एक निवासी शैक्षणिक संस्था आहे. दुर्गम आणि वंचित भागातील आदिवासी विद्यार्थ्यांना दर्जेदार शिक्षण उपलब्ध करून देण्याच्या मूळ ध्येयाने ही शाळा स्थापन करण्यात आली.'
                  )}
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                  {t(
                    'Our mission is to provide holistic education that combines academic excellence with character development, cultural preservation, and skill building. We aim to nurture every tribal child into a confident, educated individual who can contribute meaningfully to society while remaining connected to their rich cultural heritage.',
                    'आमचे ध्येय शैक्षणिक उत्कृष्टता, चारित्र्य निर्माण, सांस्कृतिक जतन आणि कौशल्य विकास यांचा समावेश असलेले सर्वांगीण शिक्षण प्रदान करणे आहे. प्रत्येक आदिवासी मुलाला एक आत्मविश्वासू, सुशिक्षित व्यक्ती म्हणून घडवणे आणि त्यांच्या समृद्ध सांस्कृतिक वारशाशी जोडलेले राहून समाजात अर्थपूर्ण योगदान देणे हे आमचे उद्दिष्ट आहे.'
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== VISION & MISSION ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Award className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Vision & Mission', 'दृष्टी आणि ध्येय')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md">
                  <h3 className="mb-4 text-lg font-semibold text-amber-500">
                    {t('Our Vision', 'आमची दृष्टी')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300" style={{ lineHeight: '1.9' }}>
                    {t(
                      'To be a center of excellence in tribal education, creating empowered, educated youth who serve as role models for their communities and lead the way toward a progressive future.',
                      'आदिवासी शिक्षणातील उत्कृष्टतेचे केंद्र बनणे, सक्षम, सुशिक्षित तरुण निर्माण करणे जे त्यांच्या समुदायांसाठी आदर्श बनतात आणि प्रगतीशील भविष्याकडे मार्ग दाखवतात.'
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md">
                  <h3 className="mb-4 text-lg font-semibold text-amber-500">
                    {t('Our Mission', 'आमचे ध्येय')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300" style={{ lineHeight: '1.9' }}>
                    {t(
                      'To provide free, quality residential education to tribal students, nurturing their academic, physical, and cultural development in a safe and supportive environment.',
                      'आदिवासी विद्यार्थ्यांना मोफत, दर्जेदार निवासी शिक्षण प्रदान करणे, सुरक्षित आणि सहाय्यक वातावरणात त्यांच्या शैक्षणिक, शारीरिक आणि सांस्कृतिक विकासाचे संवर्धन करणे.'
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== ASHRAM SHALA SYSTEM ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Building className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('The Ashram Shala System', 'आश्रमशाळा प्रणाली')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md sm:p-10">
                <p className="mb-6 text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                  {t(
                    'Ashram Shalas are government residential schools specifically established for tribal students under the Tribal Development Department of Maharashtra. These institutions operate on the philosophy of providing a complete living and learning environment for children from Scheduled Tribe communities who reside in remote, hilly, and forested areas where access to regular schooling is limited.',
                    'आश्रमशाळा या महाराष्ट्राच्या आदिवासी विकास विभागांतर्गत आदिवासी विद्यार्थ्यांसाठी विशेषत: स्थापित केलेल्या शासकीय निवासी शाळा आहेत. नियमित शालेय शिक्षणाची उपलब्धता मर्यादित असलेल्या दुर्गम, डोंगराळ आणि जंगल भागात राहणाऱ्या अनुसूचित जमाती समुदायातील मुलांना संपूर्ण राहणीमान आणि शिक्षणाचे वातावरण प्रदान करण्याच्या तत्त्वज्ञानावर या संस्था कार्य करतात.'
                  )}
                </p>
                <p className="mb-6 text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                  {t(
                    'The system provides free education, free boarding and lodging, nutritious meals, uniforms, textbooks, and all essential supplies to students at no cost to their families. This removes the financial barriers that often prevent tribal children from accessing quality education.',
                    'ही प्रणाली विद्यार्थ्यांना त्यांच्या कुटुंबांवर कोणताही आर्थिक भार न टाकता मोफत शिक्षण, मोफत निवास, पौष्टिक आहार, गणवेश, पाठ्यपुस्तके आणि सर्व आवश्यक साहित्य पुरवते. यामुळे आदिवासी मुलांना दर्जेदार शिक्षण मिळवण्यात अडथळा आणणारे आर्थिक अडसर दूर होतात.'
                  )}
                </p>

                {/* Key features grid */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { iconEl: BookOpen, en: 'Free education from Std 1 to 12', mr: 'इयत्ता १ ते १२ पर्यंत मोफत शिक्षण' },
                    { iconEl: Home, en: 'Free residential accommodation', mr: 'मोफत निवासी सोय' },
                    { iconEl: Users, en: 'Nutritious meals three times daily', mr: 'दिवसातून तीन वेळा पौष्टिक आहार' },
                    { iconEl: Award, en: 'All books, uniforms, and supplies provided', mr: 'सर्व पुस्तके, गणवेश आणि साहित्य पुरवले' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.en}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <item.iconEl className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      <p className="text-sm text-slate-300">{t(item.en, item.mr)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== TRIBAL DEVELOPMENT DEPARTMENT ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Shield className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Tribal Development Department', 'आदिवासी विकास विभाग')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md sm:p-10">
                <p className="mb-6 text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                  {t(
                    'Our school operates under the Tribal Development Department (Adivasi Vikas Vibhag), Government of Maharashtra. This department is the nodal agency responsible for the comprehensive development of Scheduled Tribe communities across Maharashtra. It administers hundreds of Ashram Shalas and residential schools throughout the state.',
                    'आमची शाळा आदिवासी विकास विभाग (आदिवासी विकास विभाग), महाराष्ट्र शासन अंतर्गत कार्य करते. हा विभाग महाराष्ट्रभरातील अनुसूचित जमाती समुदायांच्या सर्वांगीण विकासासाठी जबाबदार नोडल एजन्सी आहे. ते राज्यभरात शेकडो आश्रमशाळा आणि निवासी शाळांचे प्रशासन करते.'
                  )}
                </p>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                  {t(
                    'The department focuses on educational upliftment, economic empowerment, and social welfare of tribal populations. Through Ashram Shalas, it ensures that every tribal child has access to quality education regardless of their geographical remoteness or economic condition.',
                    'हा विभाग आदिवासी लोकसंख्येच्या शैक्षणिक उन्नती, आर्थिक सक्षमीकरण आणि सामाजिक कल्याणावर लक्ष केंद्रित करतो. आश्रमशाळांच्या माध्यमातून, प्रत्येक आदिवासी मुलाला त्यांच्या भौगोलिक दुर्गमता किंवा आर्थिक स्थितीकडे दुर्लक्ष करून दर्जेदार शिक्षण मिळेल याची खात्री करतो.'
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== CAMPUS INFORMATION ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Campus Information', 'परिसर माहिती')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md sm:p-10">
                <p className="mb-6 text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                  {t(
                    'Our school campus is located in Pathraj village, Taluka Karjat, District Raigad, Maharashtra 410201. Set amidst the natural beauty of the Sahyadri foothills, the campus provides a peaceful and conducive environment for learning and all-round development of students.',
                    'आमचा शाळा परिसर पाथरज गाव, तालुका कर्जत, जिल्हा रायगड, महाराष्ट्र ४१०२०१ येथे स्थित आहे. सह्याद्रीच्या पायथ्याशी नैसर्गिक सौंदर्यात वसलेला हा परिसर विद्यार्थ्यांच्या शिक्षण आणि सर्वांगीण विकासासाठी शांत आणि अनुकूल वातावरण प्रदान करतो.'
                  )}
                </p>

                {/* Campus stats */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: t('Total Students', 'एकूण विद्यार्थी'), value: String(schoolStats.totalStudents || '460') },
                    { label: t('Permanent Staff', 'कायम कर्मचारी'), value: String(schoolStats.totalStaff || '26') },
                    { label: t('Standards Offered', 'उपलब्ध इयत्ता'), value: t('1st to 12th', '१ ली ते १२ वी') },
                    { label: t('Medium', 'माध्यम'), value: t('Marathi', 'मराठी') },
                    { label: t('District', 'जिल्हा'), value: t('Raigad', 'रायगड') },
                    { label: t('Taluka', 'तालुका'), value: t('Karjat', 'कर्जत') },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="rounded-xl border border-white/[0.12] bg-white/5 p-6 text-center backdrop-blur-sm"
                    >
                      <p className="text-lg font-bold text-white">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== RESIDENTIAL FACILITY ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Home className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Residential Facility', 'निवासी सुविधा')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md sm:p-10">
                <p className="mb-6 text-sm leading-relaxed text-slate-300 sm:text-base" style={{ lineHeight: '1.9' }}>
                  {t(
                    'Our school features a comprehensive residential facility with a total capacity of 520 beds. The hostel is divided into separate wings for boys and girls, ensuring a safe, secure, and comfortable living environment for all students. The residential facility is managed by dedicated wardens who oversee the well-being of students round the clock.',
                    'आमच्या शाळेत एकूण ५२० बेडची क्षमता असलेली सर्वसमावेशक निवासी सुविधा आहे. वसतिगृह मुलांसाठी आणि मुलींसाठी स्वतंत्र विभागांमध्ये विभागलेले आहे, सर्व विद्यार्थ्यांसाठी सुरक्षित आणि आरामदायक राहणीमान सुनिश्चित करते. निवासी सुविधेचे व्यवस्थापन समर्पित वॉर्डन करतात जे विद्यार्थ्यांच्या कल्याणावर चोवीस तास लक्ष ठेवतात.'
                  )}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="rounded-xl border border-white/[0.12] bg-white/5 p-5 text-center backdrop-blur-sm"
                  >
                    <p className="text-2xl font-bold text-white">520</p>
                    <p className="mt-1 text-xs text-slate-400">{t('Total Beds', 'एकूण बेड')}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rounded-xl border border-white/[0.12] bg-white/5 p-5 text-center backdrop-blur-sm"
                  >
                    <Users className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                    <p className="text-xs text-slate-400">{t('Boys Wing', 'मुलांचा विभाग')}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="rounded-xl border border-white/[0.12] bg-white/5 p-5 text-center backdrop-blur-sm"
                  >
                    <Users className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                    <p className="text-xs text-slate-400">{t('Girls Wing', 'मुलींचा विभाग')}</p>
                  </motion.div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-sm leading-relaxed text-slate-300" style={{ lineHeight: '1.9' }}>
                    {t(
                      'Students are provided with nutritious meals three times a day, clean drinking water, regular health check-ups, and recreational facilities. The hostel environment is designed to feel like a second home where students can focus on their studies and personal growth.',
                      'विद्यार्थ्यांना दिवसातून तीन वेळा पौष्टिक आहार, स्वच्छ पिण्याचे पाणी, नियमित आरोग्य तपासणी आणि मनोरंजन सुविधा पुरविल्या जातात. वसतिगृहाचे वातावरण दुसरे घर असल्यासारखे तयार केले आहे जेथे विद्यार्थी त्यांच्या अभ्यासावर आणि वैयक्तिक विकासावर लक्ष केंद्रित करू शकतात.'
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== PRINCIPAL INFO ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md sm:p-10">
                <h3 className="mb-2 text-lg font-semibold text-amber-500">
                  {t("Principal's Office", 'मुख्याध्यापक कार्यालय')}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-300" style={{ lineHeight: '1.9' }}>
                  {t(
                    'Our school is led by dedicated educators committed to the holistic development of every student. The principal oversees all academic and administrative functions, ensuring the highest standards of education and care.',
                    'आमची शाळा प्रत्येक विद्यार्थ्याच्या सर्वांगीण विकासासाठी वचनबद्ध समर्पित शिक्षकांद्वारे चालवली जाते. मुख्याध्यापक सर्व शैक्षणिक आणि प्रशासकीय कार्यांवर देखरेख करतात, शिक्षण आणि काळजीचे सर्वोच्च मानक सुनिश्चित करतात.'
                  )}
                </p>
                <div className="border-t border-white/10 pt-5">
                  <p className="text-base font-semibold text-white">
                    {t('Shri. Bansode Ajit Lalasaheb', 'श्री.बनसोडे अजित लालासाहेब')}
                  </p>
                  <p className="mt-1 text-xs font-medium tracking-wide text-amber-500">
                    {t('Acting Principal', 'प्रभारी मुख्याध्यापक')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
