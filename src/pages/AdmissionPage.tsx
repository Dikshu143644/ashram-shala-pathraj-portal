import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

export default function AdmissionPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'var(--public-bg-primary)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--public-accent-ember)]">
            {t('Enrollment', 'नावनोंदणी')}
          </p>
          <h1 className="public-section-title text-3xl font-bold sm:text-4xl">
            {t('Admission', 'प्रवेश')}
          </h1>
        </div>

        {/* Admission Status Banner */}
        <div className="mb-8 rounded-xl border border-red-900/30 bg-red-950/30 p-4 text-center">
          <p className="text-sm font-semibold text-red-400">
            {t('Admission Status: CLOSED', 'प्रवेश स्थिती: बंद')}
          </p>
          <p className="mt-1 text-xs text-[var(--public-text-muted)]">
            {t('Admissions for the current academic year are closed. Check back for the next cycle.', 'चालू शैक्षणिक वर्षासाठी प्रवेश बंद आहेत. पुढील प्रवेश चक्रासाठी पुन्हा तपासा.')}
          </p>
        </div>

        <div className="space-y-8">
          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Admission Process', 'प्रवेश प्रक्रिया')}
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--public-text-secondary)]">
              <li>{t('Fill the admission application form', 'प्रवेश अर्ज भरा')}</li>
              <li>{t('Submit required documents', 'आवश्यक कागदपत्रे सबमिट करा')}</li>
              <li>{t('Verification by school administration', 'शाळा प्रशासनाद्वारे पडताळणी')}</li>
              <li>{t('Admission confirmation and enrollment', 'प्रवेश पुष्टी आणि नावनोंदणी')}</li>
            </ol>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Required Documents', 'आवश्यक कागदपत्रे')}
            </h2>
            <ul className="space-y-2 text-sm text-[var(--public-text-secondary)]">
              <li>{t('Caste certificate (Tribal)', 'जात प्रमाणपत्र (आदिवासी)')}</li>
              <li>{t('Aadhar card of student', 'विद्यार्थ्याचे आधार कार्ड')}</li>
              <li>{t('Birth certificate', 'जन्म प्रमाणपत्र')}</li>
              <li>{t('Transfer certificate (if applicable)', 'शाळा सोडल्याचा दाखला (लागू असल्यास)')}</li>
              <li>{t('Passport size photographs (4)', 'पासपोर्ट आकाराचे फोटो (४)')}</li>
              <li>{t('Parent/Guardian Aadhar card', 'पालक/पालकांचे आधार कार्ड')}</li>
              <li>{t('Income certificate', 'उत्पन्नाचा दाखला')}</li>
            </ul>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Eligibility', 'पात्रता')}
            </h2>
            <ul className="space-y-2 text-sm text-[var(--public-text-secondary)]">
              <li>{t('Priority given to students from Scheduled Tribes', 'अनुसूचित जमातीच्या विद्यार्थ्यांना प्राधान्य')}</li>
              <li>{t('Age appropriate for the standard applied', 'अर्ज केलेल्या इयत्तेसाठी वय योग्य')}</li>
              <li>{t('Residents of Maharashtra state', 'महाराष्ट्र राज्यातील रहिवासी')}</li>
            </ul>
          </div>

          <div className="public-card p-6 text-center sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Apply Online', 'ऑनलाइन अर्ज करा')}
            </h2>
            <p className="mb-4 text-sm text-[var(--public-text-secondary)]">
              {t('Register or login to submit your admission application online.', 'ऑनलाइन प्रवेश अर्ज सबमिट करण्यासाठी नोंदणी करा किंवा लॉगिन करा.')}
            </p>
            <Link to="/register" className="public-btn-primary inline-flex items-center gap-2 no-underline">
              {t('Register Now', 'आता नोंदणी करा')}
            </Link>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Contact for Inquiries', 'चौकशीसाठी संपर्क')}
            </h2>
            <ul className="space-y-2 text-sm text-[var(--public-text-secondary)]">
              <li>{t('Principal: 9423864391', 'मुख्याध्यापक: ९४२३८६४३९१')}</li>
              <li>{t('Office/Clerk: 7666971183', 'कार्यालय/लिपिक: ७६६६९७११८३')}</li>
              <li>{t('Email: hmpathraj22@gmail.com', 'ईमेल: hmpathraj22@gmail.com')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
