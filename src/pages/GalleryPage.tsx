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
            {t('Photos', 'फोटो')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mb-5 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
            style={{ color: '#000000' }}
          >
            {t('Photo Gallery', 'फोटो गॅलरी')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm sm:text-base"
            style={{ color: 'var(--public-text-muted)' }}
          >
            {t(
              'Capturing moments from our school life, events, and activities',
              'आमच्या शालेय जीवनातील, कार्यक्रमांतील आणि उपक्रमांतील क्षण'
            )}
          </motion.p>
        </motion.div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #F7F7F5)' }}
        />
      </section>

      {/* ===== GALLERY CONTENT ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-6xl">
          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader className="h-8 w-8 animate-spin mb-4" style={{ color: '#059669' }} />
              <p className="text-sm" style={{ color: 'var(--public-text-muted)' }}>
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
              className="rounded-2xl p-10 sm:p-16 text-center"
              style={{
                background: '#FCFCFB',
                border: '1px solid #E7E7E4',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-6"
                style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
              >
                <ImageOff className="h-7 w-7" style={{ color: '#059669' }} />
              </div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#000000' }}>
                {t('Unable to load photos', 'फोटो लोड करता आले नाहीत')}
              </h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--public-text-muted)' }}>
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
              className="rounded-2xl p-10 sm:p-16 text-center"
              style={{
                background: '#FCFCFB',
                border: '1px solid #E7E7E4',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-6"
                style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid #E7E7E4' }}
              >
                <Camera className="h-7 w-7" style={{ color: '#059669' }} />
              </div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#000000' }}>
                {t('Gallery Coming Soon', 'गॅलरी लवकरच येत आहे')}
              </h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--public-text-muted)' }}>
                {t(
                  'We are currently adding photos of our school events, activities, and campus. Please check back soon for updates!',
                  'आम्ही सध्या आमच्या शालेय कार्यक्रम, उपक्रम आणि परिसराचे फोटो जोडत आहोत. कृपया अपडेटसाठी लवकरच पुन्हा भेट द्या!'
                )}
              </p>
            </motion.div>
          )}

          {/* Gallery Grid */}
          {!loading && !error && images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {images.map((image, i) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative overflow-hidden rounded-2xl aspect-square"
                  style={{
                    border: '1px solid #E7E7E4',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.caption || t('School photo', 'शाळेचा फोटो')}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Caption overlay on hover */}
                  <div
                    className="absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%)' }}
                  >
                    <div className="p-4 w-full">
                      <p className="text-xs sm:text-sm font-medium text-white line-clamp-2">
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
  );
}
