import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { FileText, CheckCircle, Phone, ClipboardList, UserCheck, ArrowRight, AlertTriangle, Mail, Send } from 'lucide-react';

export default function AdmissionPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [applicantName, setApplicantName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [standardApplying, setStandardApplying] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const handleApplicationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!applicantName.trim()) { setFormError(t('Student name is required.', 'विद्यार्थ्याचे नाव आवश्यक आहे.')); return; }
    if (!parentName.trim()) { setFormError(t('Parent/Guardian name is required.', 'पालक/पालकाचे नाव आवश्यक आहे.')); return; }
    if (!/^[6-9]\d{9}$/.test(parentMobile)) { setFormError(t('Enter a valid 10-digit mobile number.', 'वैध 10 अंकी मोबाईल नंबर प्रविष्ट करा.')); return; }
    if (!standardApplying) { setFormError(t('Select the standard you are applying for.', 'अर्ज करत असलेली इयत्ता निवडा.')); return; }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    setFormLoading(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          applicant_name: applicantName.trim(),
          parent_name: parentName.trim(),
          parent_mobile: parentMobile.trim(),
          parent_email: parentEmail.trim() || undefined,
          standard_applying: Number.parseInt(standardApplying, 10),
        }),
      });
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() as { data?: { id?: string }; error?: string } : {};
      if (response.ok && data.data?.id) {
        setFormSuccess(t(
          `Application submitted successfully! Your reference is ${data.data.id.slice(0, 8)}. The school will contact you soon.`,
          `अर्ज यशस्वीरित्या सबमिट झाला! तुमचा संदर्भ क्रमांक ${data.data.id.slice(0, 8)} आहे. शाळा लवकरच संपर्क साधेल.`
        ));
        setApplicantName('');
        setParentName('');
        setParentMobile('');
        setParentEmail('');
        setStandardApplying('');
      } else {
        setFormError(data.error || t('Could not submit the application. Please call the school office if this continues.', 'अर्ज सबमिट करता आला नाही. समस्या कायम राहिल्यास शाळा कार्यालयाशी संपर्क साधा.'));
      }
    } catch (error) {
      setFormError(error instanceof DOMException && error.name === 'AbortError'
        ? t('The request timed out. Please try again.', 'विनंतीची वेळ संपली. कृपया पुन्हा प्रयत्न करा.')
        : t('Request failed. Check your connection and try again.', 'विनंती अयशस्वी. तुमचे कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.'));
    } finally {
      window.clearTimeout(timeout);
      setFormLoading(false);
    }
  };

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
    <div className="relative min-h-screen">
      {/* ===== FIXED BACKGROUND ===== */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/admission-writing.jpg"
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
              {t('Enrollment', 'नावनोंदणी')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
            >
              {t('Admission', 'प्रवेश')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base text-slate-300 sm:text-lg"
            >
              {t(
                'Join our residential school for quality tribal education',
                'दर्जेदार आदिवासी शिक्षणासाठी आमच्या निवासी शाळेत सामील व्हा'
              )}
            </motion.p>
          </motion.div>
        </section>

        {/* ===== ADMISSION STATUS BANNER ===== */}
        <section className="px-4 sm:px-6 lg:px-8 pb-10">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 text-center backdrop-blur-md"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-amber-500" />
                <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
                  {t('ENQUIRIES OPEN', 'चौकशी सुरू')}
                </span>
              </div>
              <p className="text-base font-semibold text-white mb-1">
                {t('Admission enquiries are being accepted', 'प्रवेश चौकशी स्वीकारली जात आहे')}
              </p>
              <p className="text-sm text-slate-300">
                {t(
                  'Submit an enquiry below. Admission is confirmed only after seat availability and document verification.',
                  'खाली चौकशी सबमिट करा. जागांची उपलब्धता आणि कागदपत्र पडताळणीनंतरच प्रवेश निश्चित केला जातो.'
                )}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===== ADMISSION PROCESS ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                {t('Admission Process', 'प्रवेश प्रक्रिया')}
              </h2>
              <div className="mx-auto mb-4 h-0.5 w-16 bg-amber-500" />
              <p className="text-sm text-slate-300">
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
                  className="relative flex gap-5 rounded-2xl border border-white/[0.12] bg-white/5 p-6 backdrop-blur-md sm:p-8"
                >
                  {/* Step number */}
                  <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold bg-amber-600 text-white">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-2 sm:text-lg">
                      {t(step.titleEn, step.titleMr)}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300" style={{ lineHeight: '1.7' }}>
                      {t(step.descEn, step.descMr)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== REQUIRED DOCUMENTS ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-amber-500/10">
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Required Documents', 'आवश्यक कागदपत्रे')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md">
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
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                      <span className="text-sm text-slate-300">
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
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-amber-500/10">
                  <UserCheck className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Eligibility', 'पात्रता')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

              <div className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md">
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
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                      <span className="text-sm text-slate-300">
                        {t(item.en, item.mr)}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Important note */}
                <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400" />
                  <p className="text-xs leading-relaxed text-amber-300">
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

        {/* ===== APPLY ONLINE - APPLICATION FORM ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl border border-white/[0.12] bg-white/5 p-8 backdrop-blur-md sm:p-12"
            >
              <div className="text-center mb-8">
                <div className="mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center border border-white/10 bg-amber-500/10">
                  <ClipboardList className="h-6 w-6 text-amber-500" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                  {t('Apply Online', 'ऑनलाइन अर्ज करा')}
                </h2>
                <p className="text-sm text-slate-300">
                  {t(
                    'Fill the form below to submit your admission application',
                    'प्रवेश अर्ज सबमिट करण्यासाठी खालील फॉर्म भरा'
                  )}
                </p>
              </div>

              {formSuccess ? (
                <div role="status" aria-live="polite" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
                  <CheckCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-amber-400">{formSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setFormSuccess('')}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                  >
                    {t('Submit Another', 'आणखी एक सबमिट करा')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="admission-student-name" className="mb-2 block text-xs uppercase tracking-wider text-slate-300">
                      {t('Student Name *', 'विद्यार्थ्याचे नाव *')}
                    </label>
                    <input
                      id="admission-student-name"
                      name="studentName"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={160}
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder={t('Enter student full name', 'विद्यार्थ्याचे पूर्ण नाव प्रविष्ट करा')}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="admission-parent-name" className="mb-2 block text-xs uppercase tracking-wider text-slate-300">
                      {t('Parent/Guardian Name *', 'पालक/पालकाचे नाव *')}
                    </label>
                    <input
                      id="admission-parent-name"
                      name="parentName"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={160}
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder={t('Enter parent or guardian name', 'पालक किंवा पालकाचे नाव प्रविष्ट करा')}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="admission-mobile" className="mb-2 block text-xs uppercase tracking-wider text-slate-300">
                        {t('Mobile Number *', 'मोबाईल नंबर *')}
                      </label>
                      <input
                        id="admission-mobile"
                        name="mobile"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        required
                        pattern="[6-9][0-9]{9}"
                        value={parentMobile}
                        onChange={(e) => setParentMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="admission-email" className="mb-2 block text-xs uppercase tracking-wider text-slate-300">
                        {t('Email (optional)', 'ईमेल (पर्यायी)')}
                      </label>
                      <input
                        id="admission-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={320}
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="admission-standard" className="mb-2 block text-xs uppercase tracking-wider text-slate-300">
                      {t('Standard Applying For *', 'अर्ज करत असलेली इयत्ता *')}
                    </label>
                    <select
                      id="admission-standard"
                      name="standard"
                      required
                      value={standardApplying}
                      onChange={(e) => setStandardApplying(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="" className="bg-slate-950 text-white">{t('Select Standard', 'इयत्ता निवडा')}</option>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map((standard) => (
                        <option key={standard} value={standard} className="bg-slate-950 text-white">{t(`Standard ${standard}`, `इयत्ता ${standard}`)}</option>
                      ))}
                    </select>
                  </div>

                  <p className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs leading-relaxed text-slate-300">
                    {t('By submitting, you consent to the school using these details to respond to this admission enquiry. ', 'सबमिट करून, तुम्ही या प्रवेश चौकशीला प्रतिसाद देण्यासाठी शाळेला हे तपशील वापरण्याची संमती देता. ')}
                    <Link to="/privacy" className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200">
                      {t('Read the privacy notice.', 'गोपनीयता सूचना वाचा.')}
                    </Link>
                  </p>

                  {formError && (
                    <div role="alert" aria-live="assertive" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-200">
                      {formError}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {formLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                      {formLoading ? t('Submitting…', 'सबमिट करत आहे…') : t('Submit Admission Enquiry', 'प्रवेश चौकशी सबमिट करा')}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-medium text-amber-300 no-underline transition-colors hover:text-amber-200"
                >
                  {t('Have a parent account? Sign in', 'पालक खाते आहे? साइन इन करा')}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== CONTACT FOR INQUIRIES ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-amber-500/10">
                  <Phone className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {t('Contact for Inquiries', 'चौकशीसाठी संपर्क')}
                </h2>
              </div>
              <div className="mb-8 h-0.5 w-16 bg-amber-500" />

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
                    className="rounded-xl border border-white/[0.12] bg-white/5 p-5 backdrop-blur-sm"
                  >
                    <contact.icon className="h-5 w-5 mb-3 text-amber-500" />
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      {t(contact.titleEn, contact.titleMr)}
                    </p>
                    <p className="text-base font-semibold text-white mb-1">{t(contact.valueEn, contact.valueMr)}</p>
                    <p className="text-xs text-slate-300">
                      {t(contact.nameEn, contact.nameMr)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
