import { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { Camera, ImageOff, Loader, RefreshCw } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  created_at: string;
}

export default function GalleryPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(() => new Set());

  const fetchImages = useCallback(async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/gallery', { signal: controller.signal });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Gallery response was unavailable');
      }
      const result = await response.json() as { data?: GalleryImage[] };
      setImages(Array.isArray(result.data) ? result.data : []);
      setBrokenImages(new Set());
    } catch {
      setError(true);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchImages();
  }, [fetchImages]);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <img src="/images/gallery-nature.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      <div className="relative z-10">
        <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="max-w-4xl">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-amber-400 sm:text-xs">
              {t('Photos', 'फोटो')}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              {t('Photo Gallery', 'फोटो गॅलरी')}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="text-sm text-slate-200 sm:text-base">
              {t('Capturing moments from our school life, events, and activities', 'आमच्या शालेय जीवनातील, कार्यक्रमांतील आणि उपक्रमांतील क्षण')}
            </motion.p>
          </motion.div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8" aria-busy={loading}>
          <div className="mx-auto max-w-6xl">
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status" aria-live="polite" className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-slate-950/50 p-16 backdrop-blur-md">
                <Loader className="h-8 w-8 animate-spin text-amber-400" aria-hidden="true" />
                <p className="mt-4 text-sm text-slate-200">{t('Loading photos…', 'फोटो लोड होत आहेत…')}</p>
              </motion.div>
            )}

            {!loading && error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-2xl border border-white/15 bg-slate-950/50 p-10 text-center backdrop-blur-md sm:p-16">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
                  <ImageOff className="h-7 w-7 text-amber-400" aria-hidden="true" />
                </div>
                <h2 className="mb-3 text-lg font-semibold text-white">{t('Unable to load photos', 'फोटो लोड करता आले नाहीत')}</h2>
                <p className="mx-auto max-w-md text-sm text-slate-200">{t('Check your connection and try again. You can still use the rest of the website.', 'तुमचे कनेक्शन तपासा आणि पुन्हा प्रयत्न करा. वेबसाइटचा उर्वरित भाग वापरता येईल.')}</p>
                <button type="button" onClick={() => void fetchImages()} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-500">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />{t('Try again', 'पुन्हा प्रयत्न करा')}
                </button>
              </motion.div>
            )}

            {!loading && !error && images.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/15 bg-slate-950/50 p-10 text-center backdrop-blur-md sm:p-16">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
                  <Camera className="h-7 w-7 text-amber-400" aria-hidden="true" />
                </div>
                <h2 className="mb-3 text-lg font-semibold text-white">{t('No published photos yet', 'अद्याप प्रकाशित फोटो नाहीत')}</h2>
                <p className="mx-auto max-w-md text-sm text-slate-200">{t('Approved school photos will appear here after they are published.', 'मंजूर शाळेचे फोटो प्रकाशित झाल्यानंतर येथे दिसतील.')}</p>
              </motion.div>
            )}

            {!loading && !error && images.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => {
                  const caption = image.caption || t('School photo', 'शाळेचा फोटो');
                  const isBroken = brokenImages.has(image.id);
                  return (
                    <motion.figure key={image.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06, duration: 0.45 }} className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/70 backdrop-blur-sm">
                      <div className="aspect-[4/3] overflow-hidden bg-slate-900">
                        {isBroken ? (
                          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-slate-300" role="img" aria-label={t('Photo unavailable', 'फोटो उपलब्ध नाही')}>
                            <ImageOff className="h-8 w-8 text-amber-400" aria-hidden="true" />
                            <span className="text-xs">{t('Photo unavailable', 'फोटो उपलब्ध नाही')}</span>
                          </div>
                        ) : (
                          <img
                            src={image.url}
                            alt={caption}
                            loading="lazy"
                            decoding="async"
                            onError={() => setBrokenImages((current) => new Set(current).add(image.id))}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        )}
                      </div>
                      <figcaption className="p-4 text-sm font-medium leading-relaxed text-white">{caption}</figcaption>
                    </motion.figure>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
