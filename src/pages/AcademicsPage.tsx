import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Users, Palette, FlaskConical, Globe, Calculator, Languages, Lightbulb } from 'lucide-react';

export default function AcademicsPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const standardLevels = [
    {
      titleEn: 'Primary (Std 1-4)',
      titleMr: 'प्राथमिक (इयत्ता १-४)',
      icon: BookOpen,
      subjects: [
        { en: 'Marathi', mr: 'मराठी' },
        { en: 'Hindi', mr: 'हिंदी' },
        { en: 'English', mr: 'इंग्रजी' },
        { en: 'Ganit (Mathematics)', mr: 'गणित' },
        { en: 'Parisarabhyas (EVS)', mr: 'परिसर अभ्यास' },
      ],
    },
    {
      titleEn: 'Upper Primary (Std 5-7)',
      titleMr: 'उच्च प्राथमिक (इयत्ता ५-७)',
      icon: Calculator,
      subjects: [
        { en: 'Marathi', mr: 'मराठी' },
        { en: 'Hindi', mr: 'हिंदी' },
        { en: 'English', mr: 'इंग्रजी' },
        { en: 'Ganit (Mathematics)', mr: 'गणित' },
        { en: 'Vigyan (Science)', mr: 'विज्ञान' },
        { en: 'Samajshashtra (Social Studies)', mr: 'समाजशास्त्र' },
        { en: 'Kala (Art)', mr: 'कला' },
      ],
    },
    {
      titleEn: 'Secondary (Std 8-10)',
      titleMr: 'माध्यमिक (इयत्ता ८-१०)',
      icon: FlaskConical,
      subjects: [
        { en: 'Marathi', mr: 'मराठी' },
        { en: 'Hindi', mr: 'हिंदी' },
        { en: 'English', mr: 'इंग्रजी' },
        { en: 'Ganit (Mathematics)', mr: 'गणित' },
        { en: 'Vigyan (Science)', mr: 'विज्ञान' },
        { en: 'Samajshashtra (Social Studies)', mr: 'समाजशास्त्र' },
        { en: 'Sanskrit (Optional)', mr: 'संस्कृत (ऐच्छिक)' },
      ],
    },
    {
      titleEn: 'Higher Secondary (Std 11-12 Arts)',
      titleMr: 'उच्च माध्यमिक (इयत्ता ११-१२ कला)',
      icon: Globe,
      subjects: [
        { en: 'Marathi', mr: 'मराठी' },
        { en: 'Hindi', mr: 'हिंदी' },
        { en: 'English', mr: 'इंग्रजी' },
        { en: 'History', mr: 'इतिहास' },
        { en: 'Geography', mr: 'भूगोल' },
        { en: 'Political Science', mr: 'राज्यशास्त्र' },
        { en: 'Economics', mr: 'अर्थशास्त्र' },
      ],
    },
  ];

  const staffDirectory = [
    { name: t('Shri. Bansode Ajit L.', 'श्री. बनसोडे अजित ल.'), role: t('Acting Principal', 'प्रभारी मुख्याध्यापक'), subject: t('Administration', 'प्रशासन') },
    { name: t('Shri. Mane Rajendra P.', 'श्री. माने राजेंद्र प.'), role: t('Teacher', 'शिक्षक'), subject: t('Marathi', 'मराठी') },
    { name: t('Smt. Pakhale Savita P.', 'श्रीम. पखाले सविता पु.'), role: t('Teacher', 'शिक्षिका'), subject: t('Hindi', 'हिंदी') },
    { name: t('Shri. Patil Suresh K.', 'श्री. पाटील सुरेश कि.'), role: t('Teacher', 'शिक्षक'), subject: t('Mathematics', 'गणित') },
    { name: t('Smt. Jadhav Sunita R.', 'श्रीम. जाधव सुनिता र.'), role: t('Teacher', 'शिक्षिका'), subject: t('Science', 'विज्ञान') },
    { name: t('Shri. Bhoir Ganesh M.', 'श्री. भोईर गणेश म.'), role: t('Teacher', 'शिक्षक'), subject: t('Social Studies', 'समाजशास्त्र') },
    { name: t('Smt. Thakur Anita D.', 'श्रीम. ठाकूर अनिता दि.'), role: t('Teacher', 'शिक्षिका'), subject: t('English', 'इंग्रजी') },
    { name: t('Shri. Waghere Dipak S.', 'श्री. वाघेरे दीपक स.'), role: t('Teacher', 'शिक्षक'), subject: t('History / Pol. Science', 'इतिहास / राज्यशास्त्र') },
  ];

  return (
    <div className="relative min-h-screen">
      {/* ===== FIXED BACKGROUND ===== */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/academics-books.jpg"
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
              {t('Education', 'शिक्षण')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
            >
              {t('Academics', 'शैक्षणिक')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base text-slate-300 sm:text-lg"
            >
              {t(
                'Comprehensive Marathi-medium education from Standard 1st to 12th',
                'इयत्ता १ ली ते १२ वी पर्यंत सर्वसमावेशक मराठी माध्यमातील शिक्षण'
              )}
            </motion.p>
          </motion.div>
        </section>

        {/* ===== QUICK INFO CARDS ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                {t('Standards & Medium', 'इयत्ता आणि माध्यम')}
              </h2>
              <div className="mx-auto mb-6 h-0.5 w-16 bg-amber-500" />
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {[
                { icon: GraduationCap, labelEn: 'Standards 1st to 12th', labelMr: 'इयत्ता १ ली ते १२ वी' },
                { icon: Languages, labelEn: 'Marathi Medium', labelMr: 'मराठी माध्यम' },
                { icon: Palette, labelEn: 'Arts Stream (11-12)', labelMr: 'कला शाखा (११-१२)' },
                { icon: Lightbulb, labelEn: 'Science stream coming soon', labelMr: 'विज्ञान शाखा लवकरच' },
              ].map((item, i) => (
                <motion.div
                  key={item.labelEn}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-xl border border-white/[0.12] bg-white/5 p-6 text-center backdrop-blur-sm"
                >
                  <item.icon className="mx-auto h-6 w-6 mb-3 text-amber-500" />
                  <p className="text-sm font-medium text-white">{t(item.labelEn, item.labelMr)}</p>
                </motion.div>
              ))}
            </div>

            {/* Arts stream note */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-amber-500/20 bg-amber-900/20 p-4 text-center backdrop-blur-sm"
            >
              <p className="text-sm text-amber-500">
                <Lightbulb className="h-4 w-4 inline-block mr-2 -mt-0.5" />
                {t(
                  'Currently only Arts stream is available for 11th-12th. Science stream may be added in the future based on government approval.',
                  'सध्या ११ वी-१२ वी साठी फक्त कला शाखा उपलब्ध आहे. शासनाच्या मान्यतेनुसार भविष्यात विज्ञान शाखा सुरू होऊ शकते.'
                )}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===== SUBJECTS BY STANDARD ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                {t('Subjects by Standard', 'इयत्तेनुसार विषय')}
              </h2>
              <div className="mx-auto mb-4 h-0.5 w-16 bg-amber-500" />
              <p className="text-sm text-slate-300">
                {t('Curriculum details for each academic level', 'प्रत्येक शैक्षणिक स्तरासाठी अभ्यासक्रम तपशील')}
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2">
              {standardLevels.map((level, i) => (
                <motion.div
                  key={level.titleEn}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md"
                >
                  {/* Level header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-amber-500/10">
                      <level.icon className="h-4 w-4 text-amber-500" />
                    </div>
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {t(level.titleEn, level.titleMr)}
                    </h3>
                  </div>

                  {/* Subjects list */}
                  <ul className="space-y-2.5">
                    {level.subjects.map((subject) => (
                      <li key={subject.en} className="flex items-center gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full flex-shrink-0 bg-amber-500" />
                        <span className="text-sm text-slate-300">
                          {t(subject.en, subject.mr)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== STAFF DIRECTORY ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                {t('Teaching Staff', 'शिक्षक वर्ग')}
              </h2>
              <div className="mx-auto mb-4 h-0.5 w-16 bg-amber-500" />
              <p className="text-sm text-slate-300">
                {t('Our dedicated educators shaping the future', 'भविष्य घडवणारे आमचे समर्पित शिक्षक')}
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {staffDirectory.map((staff, i) => (
                <motion.div
                  key={staff.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="rounded-xl border border-white/[0.12] bg-white/5 p-6 text-center backdrop-blur-sm"
                >
                  {/* Avatar placeholder */}
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full flex items-center justify-center border border-white/[0.12] bg-amber-500/10">
                    <Users className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{staff.name}</p>
                  <p className="text-xs text-amber-500 mb-1">{staff.role}</p>
                  <p className="text-xs text-slate-400">{staff.subject}</p>
                </motion.div>
              ))}
            </div>

            {/* Total staff note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 text-center text-sm text-slate-400"
            >
              {t(
                'Total permanent staff: 25 members including teaching and non-teaching staff',
                'एकूण कायम कर्मचारी: शैक्षणिक आणि अशैक्षणिक कर्मचाऱ्यांसह २५ सदस्य'
              )}
            </motion.p>
          </div>
        </section>
      </div>
    </div>
  );
}
