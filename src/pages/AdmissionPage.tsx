import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { FileText, CheckCircle, Phone, XCircle, ClipboardList, UserCheck, ArrowRight, AlertTriangle, Mail } from 'lucide-react';

export default function AdmissionPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const admissionSteps = [
    {
      step: 1,
      titleEn: 'Inquiry',
      titleMr: 'चौकशी',
      descEn: 'Contact the school office or visit in person to inquire about admission availability and process.',
      descMr: 'प्रवेश उपलब्धता आणि प्रक्रियेबद्दल चौकशी करण्यासाठी शाळा कार्यालयाशी संपर्क साधा किंवा प्रत्यक्ष भेट द्या.',
    },
    {
      step: 2,
      titleEn: 'Application',
      titleMr: 'अर्ज',
      descEn: 'Fill and submit the admission application form with all required details of the student and guardian.',
      descMr: 'विद्यार्थी आणि पालकांच्या सर्व आवश्यक तपशीलांसह प्रवेश अर्ज भरा आणि सबमिट करा.',
    },
    {
      step: 3,
      titleEn: 'Document Verification',
      titleMr: 'कागदपत्र पडताळणी',
      descEn: 'School administration verifies all submitted documents including caste certificate and academic records.',
      descMr: 'शाळा प्रशासन जात प्रमाणपत्र आणि शैक्षणिक नोंदींसह सर्व सबमिट केलेल्या कागदपत्रांची पडताळणी करते.',
    },
    {
      step: 4,
      titleEn: 'Admission',
      titleMr: 'प्रवेश',
      descEn: 'Upon successful verification, admission is confirmed and student is enrolled in the appropriate standard.',
      descMr: 'यशस्वी पडताळणीनंतर, प्रवेश पुष्टी केला जातो आणि विद्यार्थ्याची योग्य इयत्तेत नोंदणी केली जाते.',
    },
  ];

  const requiredDocuments = [
    { en: 'Caste Certificate (ST - Scheduled Tribe)', mr: 'जात प्रमाणपत्र (अनुसूचित जमाती)' },
    { en: 'Aadhaar Card (Student)', mr: 'आधार कार्ड (विद्यार्थी)' },
    { en: 'Transfer Certificate (TC)', mr: 'शाळा सोडल्याचा दाखला (TC)' },
    { en: 'Birth Certificate', mr: 'जन्म प्रमाणपत्र' },
    { en: 'Income Certificate', mr: 'उत्पन्नाचा दाखला' },
    { en: 'Passport Size Photographs (4 copies)', mr: 'पासपोर्ट आकाराचे फोटो (४ प्रती)' },
    { en: 'Previous Marksheet', mr: 'मागील गुणपत्रक' },
  ];

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
            className="absolute left-1/3 top-1/3 h-[350px] w-[350px] rounded-full opacity-15"
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
            {t('Enrollment', 'नावनोंदणी')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mb-5 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
            style={{ color: '#000000' }}
          >
            {t('Admission', 'प्रवेश')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm sm:text-base"
            style={{ color: 'var(--public-text-muted)' }}
          >
            {t(
              'Join our residential school for quality tribal education',
              'दर्जेदार आदिवासी शिक्षणासाठी आमच्या निवासी शाळेत सामील व्हा'
            )}
          </motion.p>
        </motion.div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #F7F7F5)' }}
        />
      </section>

      {/* ===== ADMISSION STATUS BANNER ===== */}
      <section className="px-4 sm:px-6 lg:px-8" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background: '#FCFCFB',
              border: '1px solid rgba(5, 150, 105, 0.04)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <XCircle className="h-5 w-5" style={{ color: '#059669' }} />
              <span
                className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ background: 'rgba(196, 40, 71, 0.2)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.04)' }}
              >
                {t('CLOSED', 'बंद')}
              </span>
            </div>
            <p className="text-base font-semibold text-black mb-1">
              {t('Admissions Currently Closed', 'सध्या प्रवेश बंद आहे')}
            </p>
            <p className="text-sm" style={{ color: 'var(--public-text-muted)' }}>
              {t(
                'Admissions for the current academic year are closed. Please check back for the next admission cycle or contact the school office for more information.',
                'चालू शैक्षणिक वर्षासाठी प्रवेश बंद आहेत. कृपया पुढील प्रवेश चक्रासाठी पुन्हा तपासा किंवा अधिक माहितीसाठी शाळा कार्यालयाशी संपर्क साधा.'
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== ADMISSION PROCESS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
              {t('Admission Process', 'प्रवेश प्रक्रिया')}
            </h2>
            <div className="mx-auto mb-4 h-0.5 w-16" style={{ background: '#059669' }} />
            <p className="text-sm" style={{ color: 'var(--public-text-muted)' }}>
              {t('Step-by-step guide to admission', 'प्रवेशासाठी टप्प्याटप्प्याने मार्गदर्शन')}
            </p>
          </motion.div>

          <div className="space-y-4">
            {admissionSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex gap-5 rounded-2xl p-6 sm:p-8"
                style={{
                  background: '#FCFCFB',
                  border: '1px solid #E7E7E4',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Step number */}
                <div
                  className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: '#000000', color: '#fff' }}
                >
                  {step.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-black mb-2 sm:text-lg">
                    {t(step.titleEn, step.titleMr)}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--public-text-secondary)', lineHeight: '1.7' }}>
                    {t(step.descEn, step.descMr)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REQUIRED DOCUMENTS ===== */}
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
                <FileText className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Required Documents', 'आवश्यक कागदपत्रे')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: '#059669' }} />

            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: '#FCFCFB',
                border: '1px solid #E7E7E4',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <ul className="space-y-4">
                {requiredDocuments.map((doc, i) => (
                  <motion.li
                    key={doc.en}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />
                    <span className="text-sm" style={{ color: 'var(--public-text-secondary)' }}>
                      {t(doc.en, doc.mr)}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== ELIGIBILITY ===== */}
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
                <UserCheck className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Eligibility', 'पात्रता')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: '#059669' }} />

            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: '#FCFCFB',
                border: '1px solid #E7E7E4',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <ul className="space-y-4">
                {[
                  { en: 'Tribal students (Scheduled Tribe category) are given priority', mr: 'आदिवासी विद्यार्थ्यांना (अनुसूचित जमाती वर्ग) प्राधान्य दिले जाते' },
                  { en: 'Students must be residents of Maharashtra state', mr: 'विद्यार्थी महाराष्ट्र राज्यातील रहिवासी असणे आवश्यक' },
                  { en: 'Valid Caste Certificate (ST) is mandatory', mr: 'वैध जात प्रमाणपत्र (अ.ज.) अनिवार्य आहे' },
                  { en: 'Age should be appropriate for the standard applied', mr: 'अर्ज केलेल्या इयत्तेसाठी वय योग्य असावे' },
                  { en: 'Preference given to students from remote tribal areas', mr: 'दुर्गम आदिवासी भागातील विद्यार्थ्यांना प्राधान्य' },
                ].map((item, i) => (
                  <motion.li
                    key={item.en}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />
                    <span className="text-sm" style={{ color: 'var(--public-text-secondary)' }}>
                      {t(item.en, item.mr)}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Important note */}
              <div className="mt-6 rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(230, 126, 34, 0.08)', border: '1px solid rgba(230, 126, 34, 0.2)' }}>
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--public-accent-ember)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--public-accent-ember)' }}>
                  {t(
                    'Admission is subject to availability of seats and verification of all documents. The school reserves the right to accept or reject applications based on eligibility criteria.',
                    'प्रवेश जागांच्या उपलब्धतेवर आणि सर्व कागदपत्रांच्या पडताळणीवर अवलंबून आहे. पात्रता निकषांच्या आधारे अर्ज स्वीकारण्याचा किंवा नाकारण्याचा अधिकार शाळेकडे राहील.'
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== APPLY ONLINE ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#F7F7F5' }}>
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center rounded-2xl p-8 sm:p-12"
            style={{
              background: '#FCFCFB',
              border: '1px solid #E7E7E4',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              className="mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
            >
              <ClipboardList className="h-6 w-6" style={{ color: '#059669' }} />
            </div>
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
              {t('Apply Online', 'ऑनलाइन अर्ज करा')}
            </h2>
            <p className="mb-8 text-sm" style={{ color: 'var(--public-text-muted)' }}>
              {t(
                'Register on our portal to submit your admission application online. You can track your application status after registration.',
                'ऑनलाइन प्रवेश अर्ज सबमिट करण्यासाठी आमच्या पोर्टलवर नोंदणी करा. नोंदणीनंतर तुम्ही तुमच्या अर्जाची स्थिती ट्रॅक करू शकता.'
              )}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 no-underline"
              style={{
                background: '#000000',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              }}
            >
              {t('Register & Apply', 'नोंदणी करा आणि अर्ज करा')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT FOR INQUIRIES ===== */}
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
                <Phone className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#000000' }}>
                {t('Contact for Inquiries', 'चौकशीसाठी संपर्क')}
              </h2>
            </div>
            <div className="mb-8 h-0.5 w-16" style={{ background: '#059669' }} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Phone,
                  titleEn: 'Principal',
                  titleMr: 'मुख्याध्यापक',
                  valueEn: '9423864391',
                  valueMr: '९४२३८६४३९१',
                  nameEn: 'Shri. Bansode Ajit L.',
                  nameMr: 'श्री. बनसोडे अजित ल.',
                },
                {
                  icon: Phone,
                  titleEn: 'Office / Clerk',
                  titleMr: 'कार्यालय / लिपिक',
                  valueEn: '7666971183',
                  valueMr: '७६६६९७११८३',
                  nameEn: 'Shri. Omkar Supe',
                  nameMr: 'श्री. ओमकार सुपे',
                },
                {
                  icon: Mail,
                  titleEn: 'Email',
                  titleMr: 'ईमेल',
                  valueEn: 'hmpathraj22@gmail.com',
                  valueMr: 'hmpathraj22@gmail.com',
                  nameEn: 'School Office',
                  nameMr: 'शाळा कार्यालय',
                },
              ].map((contact, i) => (
                <motion.div
                  key={contact.titleEn}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-xl p-5"
                  style={{
                    background: '#FCFCFB',
                    border: '1px solid #E7E7E4',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <contact.icon className="h-5 w-5 mb-3" style={{ color: '#059669' }} />
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--public-text-muted)' }}>
                    {t(contact.titleEn, contact.titleMr)}
                  </p>
                  <p className="text-base font-semibold text-black mb-1">{t(contact.valueEn, contact.valueMr)}</p>
                  <p className="text-xs" style={{ color: 'var(--public-text-secondary)' }}>
                    {t(contact.nameEn, contact.nameMr)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
