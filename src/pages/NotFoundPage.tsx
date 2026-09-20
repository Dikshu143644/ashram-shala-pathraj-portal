import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

export default function NotFoundPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden px-4 py-24 text-center">
      <img src="/images/hero-mountains.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/80" />
      <div className="relative z-10 max-w-xl rounded-3xl border border-white/10 bg-slate-950/60 p-8 backdrop-blur-xl sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">404</p>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
          {t('Page not found', 'पृष्ठ सापडले नाही')}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
          {t(
            'The page may have moved, or the address may be incorrect. Use the navigation above or return to the homepage.',
            'हे पृष्ठ हलवले गेले असावे किंवा पत्ता चुकीचा असू शकतो. वरील नेव्हिगेशन वापरा किंवा मुख्यपृष्ठावर परत जा.'
          )}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-amber-500">
            <Home className="h-4 w-4" aria-hidden="true" />
            {t('Go to homepage', 'मुख्यपृष्ठावर जा')}
          </Link>
          <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('Go back', 'मागे जा')}
          </button>
        </div>
      </div>
    </section>
  );
}
