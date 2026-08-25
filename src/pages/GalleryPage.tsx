import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { Camera, ImageOff, Loader } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  created_at: string;
}

export default function GalleryPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/gallery');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setImages(result.data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Fixed cinematic background */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
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
              className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-400 sm:text-xs"
            >
              {t('Photos', 'फोटो')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
            >
              {t('Photo Gallery', 'फोटो गॅलरी')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-sm text-slate-300 sm:text-base"
            >
              {t(
                'Capturing moments from our school life, events, and activities',
                'आमच्या शालेय जीवनातील, कार्यक्रमांतील आणि उपक्रमांतील क्षण'
              )}
            </motion.p>
          </motion.div>
        </section>

        {/* Gallery Content */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 p-16 backdrop-blur-md"
              >
                <Loader className="h-8 w-8 animate-spin text-emerald-400" />
                <p className="mt-4 text-sm text-slate-300">
                  {t('Loading photos...', 'फोटो लोड होत आहेत...')}
                </p>
              </motion.div>
            )}

            {/* Error State */}
            {!loading && error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-10 text-center backdrop-blur-md sm:p-16"
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-slate-900/40">
                  <ImageOff className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-white">
                  {t('Unable to load photos', 'फोटो लोड करता आले नाहीत')}
                </h3>
                <p className="mx-auto max-w-md text-sm text-slate-300">
                  {t(
                    'Please try again later. The gallery will be available shortly.',
                    'कृपया नंतर पुन्हा प्रयत्न करा. गॅलरी लवकरच उपलब्ध होईल.'
                  )}
                </p>
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && !error && images.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-10 text-center backdrop-blur-md sm:p-16"
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-slate-900/40">
                  <Camera className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-white">
                  {t('Gallery Coming Soon', 'गॅलरी लवकरच येत आहे')}
                </h3>
                <p className="mx-auto max-w-md text-sm text-slate-300">
                  {t(
                    'We are currently adding photos of our school events, activities, and campus. Please check back soon for updates!',
                    'आम्ही सध्या आमच्या शालेय कार्यक्रम, उपक्रम आणि परिसराचे फोटो जोडत आहोत. कृपया अपडेटसाठी लवकरच पुन्हा भेट द्या!'
                  )}
                </p>
              </motion.div>
            )}

            {/* Gallery Grid */}
            {!loading && !error && images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {images.map((image, i) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-sm"
                  >
                    <img
                      src={image.url}
                      alt={image.caption || t('School photo', 'शाळेचा फोटो')}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Caption overlay on hover */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="w-full p-4">
                        <p className="line-clamp-2 text-xs font-medium text-white sm:text-sm">
                          {image.caption || t('School photo', 'शाळेचा फोटो')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
