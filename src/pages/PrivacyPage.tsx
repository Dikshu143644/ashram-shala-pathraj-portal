import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export default function PrivacyPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const sections = [
    {
      titleEn: 'Information we collect',
      titleMr: 'आम्ही गोळा करत असलेली माहिती',
      bodyEn: 'The admission enquiry form collects the student name, parent or guardian name, mobile number, optional email address, and the standard requested.',
      bodyMr: 'प्रवेश चौकशी फॉर्ममध्ये विद्यार्थ्याचे नाव, पालकाचे नाव, मोबाईल नंबर, पर्यायी ईमेल पत्ता आणि इच्छित इयत्ता गोळा केली जाते.',
    },
    {
      titleEn: 'How information is used',
      titleMr: 'माहितीचा वापर',
      bodyEn: 'Information is used only to review the admission enquiry, contact the parent or guardian, verify eligibility, and administer the admission process.',
      bodyMr: 'माहितीचा वापर फक्त प्रवेश चौकशीचे पुनरावलोकन, पालकांशी संपर्क, पात्रता पडताळणी आणि प्रवेश प्रक्रिया व्यवस्थापनासाठी केला जातो.',
    },
    {
      titleEn: 'Storage and access',
      titleMr: 'साठवण आणि प्रवेश',
      bodyEn: 'Access is limited to authorised school staff. Records should be retained only as long as required for admissions and applicable government record-keeping obligations.',
      bodyMr: 'प्रवेश केवळ अधिकृत शाळा कर्मचाऱ्यांपुरता मर्यादित आहे. नोंदी प्रवेश प्रक्रिया आणि लागू शासकीय नोंद-देखभाल आवश्यकतांपुरत्याच ठेवल्या जातात.',
    },
    {
      titleEn: 'Your choices',
      titleMr: 'तुमचे पर्याय',
      bodyEn: 'Submitting the online form is optional. You may instead contact or visit the school office. To correct or remove an enquiry, contact the school using the details below.',
      bodyMr: 'ऑनलाइन फॉर्म सबमिट करणे ऐच्छिक आहे. तुम्ही शाळा कार्यालयाशी संपर्क साधू शकता किंवा भेट देऊ शकता. चौकशी दुरुस्त किंवा हटवण्यासाठी खालील तपशीलांवर संपर्क साधा.',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <img src="/images/about-school.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/85" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <header className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10">
            <ShieldCheck className="h-7 w-7 text-amber-400" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">{t('Data protection', 'डेटा संरक्षण')}</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl">{t('Website Privacy Notice', 'वेबसाइट गोपनीयता सूचना')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
            {t('This notice explains how information submitted through the public school website is handled.', 'सार्वजनिक शाळा वेबसाइटद्वारे सबमिट केलेली माहिती कशी हाताळली जाते हे या सूचनेत स्पष्ट केले आहे.')}
          </p>
        </header>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.titleEn} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
              <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
                <LockKeyhole className="h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
                {t(section.titleEn, section.titleMr)}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{t(section.bodyEn, section.bodyMr)}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">{t('Privacy contact', 'गोपनीयता संपर्क')}</h2>
          <p className="mt-2 text-sm text-slate-300">{t('For privacy questions or record requests, contact the school office:', 'गोपनीयता प्रश्न किंवा नोंद विनंत्यांसाठी शाळा कार्यालयाशी संपर्क साधा:')}</p>
          <a href="mailto:hmpathraj22@gmail.com" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200">
            <Mail className="h-4 w-4" aria-hidden="true" />hmpathraj22@gmail.com
          </a>
          <p className="mt-5 text-xs text-slate-400">{t('Last updated: 20 September 2026', 'शेवटचे अद्यतन: २० सप्टेंबर २०२६')}</p>
        </section>
      </div>
    </div>
  );
}
