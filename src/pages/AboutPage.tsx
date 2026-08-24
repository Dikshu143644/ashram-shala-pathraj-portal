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
            {t('About Us', 'आमच्याबद्दल')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mb-5 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
            style={{ color: '#000000' }}
          >
            {t('About Our School', 'आमच्या शाळेबद्दल')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm sm:text-base"
            style={{ color: 'var(--public-text-muted)' }}
          >
            {t(
              'A government residential school dedicated to tribal education since its establishment',
              'स्थापनेपासून आदिवासी शिक्षणासाठी समर्पित शासकीय निवासी शाळा'
            )}
          </motion.p>
        </motion.div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #F7F7F5)' }}
        />
      </section>

      {/* ===== SCHOOL HISTORY & MISSION ===== */}
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
                <BookOpen className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('School History & Mission', 'शाळेचा इतिहास आणि ध्येय')}
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
              <p className="text-sm leading-relaxed sm:text-base mb-6" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'Government Secondary and Higher Secondary Ashram School, Pathraj is a residential educational institution established under the Tribal Development Department, Government of Maharashtra. The school was founded with the core mission of bringing quality education to tribal students from remote and underserved areas of the region.',
                  'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा, पाथरज ही आदिवासी विकास विभाग, महाराष्ट्र शासन अंतर्गत स्थापित एक निवासी शैक्षणिक संस्था आहे. दुर्गम आणि वंचित भागातील आदिवासी विद्यार्थ्यांना दर्जेदार शिक्षण उपलब्ध करून देण्याच्या मूळ ध्येयाने ही शाळा स्थापन करण्यात आली.'
                )}
              </p>
              <p className="text-sm leading-relaxed sm:text-base" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'Our mission is to provide holistic education that combines academic excellence with character development, cultural preservation, and skill building. We aim to nurture every tribal child into a confident, educated individual who can contribute meaningfully to society while remaining connected to their rich cultural heritage.',
                  'आमचे ध्येय शैक्षणिक उत्कृष्टता, चारित्र्य निर्माण, सांस्कृतिक जतन आणि कौशल्य विकास यांचा समावेश असलेले सर्वांगीण शिक्षण प्रदान करणे आहे. प्रत्येक आदिवासी मुलाला एक आत्मविश्वासू, सुशिक्षित व्यक्ती म्हणून घडवणे आणि त्यांच्या समृद्ध सांस्कृतिक वारशाशी जोडलेले राहून समाजात अर्थपूर्ण योगदान देणे हे आमचे उद्दिष्ट आहे.'
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== ASHRAM SHALA SYSTEM ===== */}
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
                <Building className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('The Ashram Shala System', 'आश्रमशाळा प्रणाली')}
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
              <p className="text-sm leading-relaxed sm:text-base mb-6" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'Ashram Shalas are government residential schools specifically established for tribal students under the Tribal Development Department of Maharashtra. These institutions operate on the philosophy of providing a complete living and learning environment for children from Scheduled Tribe communities who reside in remote, hilly, and forested areas where access to regular schooling is limited.',
                  'आश्रमशाळा या महाराष्ट्राच्या आदिवासी विकास विभागांतर्गत आदिवासी विद्यार्थ्यांसाठी विशेषत: स्थापित केलेल्या शासकीय निवासी शाळा आहेत. नियमित शालेय शिक्षणाची उपलब्धता मर्यादित असलेल्या दुर्गम, डोंगराळ आणि जंगल भागात राहणाऱ्या अनुसूचित जमाती समुदायातील मुलांना संपूर्ण राहणीमान आणि शिक्षणाचे वातावरण प्रदान करण्याच्या तत्त्वज्ञानावर या संस्था कार्य करतात.'
                )}
              </p>
              <p className="text-sm leading-relaxed sm:text-base mb-6" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'The system provides free education, free boarding and lodging, nutritious meals, uniforms, textbooks, and all essential supplies to students at no cost to their families. This removes the financial barriers that often prevent tribal children from accessing quality education.',
                  'ही प्रणाली विद्यार्थ्यांना त्यांच्या कुटुंबांवर कोणताही आर्थिक भार न टाकता मोफत शिक्षण, मोफत निवास, पौष्टिक आहार, गणवेश, पाठ्यपुस्तके आणि सर्व आवश्यक साहित्य पुरवते. यामुळे आदिवासी मुलांना दर्जेदार शिक्षण मिळवण्यात अडथळा आणणारे आर्थिक अडसर दूर होतात.'
                )}
              </p>

              {/* Key features grid */}
              <div className="grid gap-4 sm:grid-cols-2 mt-8">
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
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{ background: 'rgba(5, 150, 105, 0.03)', border: '1px solid rgba(5, 150, 105, 0.06)' }}
                  >
                    <item.iconEl className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />
                    <p className="text-sm" style={{ color: 'var(--public-text-secondary)' }}>{t(item.en, item.mr)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== TRIBAL DEVELOPMENT DEPARTMENT ===== */}
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
                <Shield className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Tribal Development Department', 'आदिवासी विकास विभाग')}
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
              <p className="text-sm leading-relaxed sm:text-base mb-6" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'Our school operates under the Tribal Development Department (Adivasi Vikas Vibhag), Government of Maharashtra. This department is the nodal agency responsible for the comprehensive development of Scheduled Tribe communities across Maharashtra. It administers hundreds of Ashram Shalas and residential schools throughout the state.',
                  'आमची शाळा आदिवासी विकास विभाग (आदिवासी विकास विभाग), महाराष्ट्र शासन अंतर्गत कार्य करते. हा विभाग महाराष्ट्रभरातील अनुसूचित जमाती समुदायांच्या सर्वांगीण विकासासाठी जबाबदार नोडल एजन्सी आहे. ते राज्यभरात शेकडो आश्रमशाळा आणि निवासी शाळांचे प्रशासन करते.'
                )}
              </p>
              <p className="text-sm leading-relaxed sm:text-base" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
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
                <MapPin className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Campus Information', 'परिसर माहिती')}
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
              <p className="text-sm leading-relaxed sm:text-base mb-6" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'Our school campus is located in Pathraj village, Taluka Karjat, District Raigad, Maharashtra 410201. Set amidst the natural beauty of the Sahyadri foothills, the campus provides a peaceful and conducive environment for learning and all-round development of students.',
                  'आमचा शाळा परिसर पाथरज गाव, तालुका कर्जत, जिल्हा रायगड, महाराष्ट्र ४१०२०१ येथे स्थित आहे. सह्याद्रीच्या पायथ्याशी नैसर्गिक सौंदर्यात वसलेला हा परिसर विद्यार्थ्यांच्या शिक्षण आणि सर्वांगीण विकासासाठी शांत आणि अनुकूल वातावरण प्रदान करतो.'
                )}
              </p>

              {/* Campus stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
                {[
                  { label: t('Total Students', 'एकूण विद्यार्थी'), value: String(schoolStats.totalStudents || '460') },
                  { label: t('Permanent Staff', 'कायम कर्मचारी'), value: String(schoolStats.totalStaff || '25') },
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
                    className="rounded-xl p-4 text-center"
                    style={{ background: 'rgba(5, 150, 105, 0.03)', border: '1px solid rgba(5, 150, 105, 0.06)' }}
                  >
                    <p className="text-lg font-bold text-black">{item.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--public-text-muted)' }}>{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== RESIDENTIAL FACILITY ===== */}
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
                {t('Residential Facility', 'निवासी सुविधा')}
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
              <p className="text-sm leading-relaxed sm:text-base mb-6" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
                {t(
                  'Our school features a comprehensive residential facility with a total capacity of 520 beds. The hostel is divided into separate wings for boys and girls, ensuring a safe, secure, and comfortable living environment for all students. The residential facility is managed by dedicated wardens who oversee the well-being of students round the clock.',
                  'आमच्या शाळेत एकूण ५२० बेडची क्षमता असलेली सर्वसमावेशक निवासी सुविधा आहे. वसतिगृह मुलांसाठी आणि मुलींसाठी स्वतंत्र विभागांमध्ये विभागलेले आहे, सर्व विद्यार्थ्यांसाठी सुरक्षित आणि आरामदायक राहणीमान सुनिश्चित करते. निवासी सुविधेचे व्यवस्थापन समर्पित वॉर्डन करतात जे विद्यार्थ्यांच्या कल्याणावर चोवीस तास लक्ष ठेवतात.'
                )}
              </p>

              <div className="grid gap-4 sm:grid-cols-3 mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="rounded-xl p-5 text-center"
                  style={{ background: 'rgba(5, 150, 105, 0.04)', border: '1px solid #E7E7E4' }}
                >
                  <p className="text-2xl font-bold text-black">520</p>
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
                  <p className="text-xs" style={{ color: 'var(--public-text-muted)' }}>{t('Boys Wing', 'मुलांचा विभाग')}</p>
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
                  <p className="text-xs" style={{ color: 'var(--public-text-muted)' }}>{t('Girls Wing', 'मुलींचा विभाग')}</p>
                </motion.div>
              </div>

              <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E7E7E4' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.9' }}>
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
    </div>
  );
}
