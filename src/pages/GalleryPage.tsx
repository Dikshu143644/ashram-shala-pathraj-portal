import { useAppContext } from '../contexts/AppContext';

export default function GalleryPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'var(--public-bg-primary)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--public-accent-ember)]">
            {t('Photos', 'फोटो')}
          </p>
          <h1 className="public-section-title text-3xl font-bold sm:text-4xl">
            {t('Photo Gallery', 'फोटो गॅलरी')}
          </h1>
        </div>

        <div className="public-card p-8 text-center">
          <p className="text-sm text-[var(--public-text-secondary)]">
            {t(
              'Photo gallery coming soon. School photos and event images will be displayed here.',
              'फोटो गॅलरी लवकरच येत आहे. शाळेचे फोटो आणि कार्यक्रमाचे चित्रे येथे प्रदर्शित केले जातील.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
