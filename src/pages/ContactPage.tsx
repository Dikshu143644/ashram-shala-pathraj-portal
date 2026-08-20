import { useAppContext } from '../contexts/AppContext';

export default function ContactPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'var(--public-bg-primary)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--public-accent-ember)]">
            {t('Get in Touch', 'संपर्क साधा')}
          </p>
          <h1 className="public-section-title text-3xl font-bold sm:text-4xl">
            {t('Contact Us', 'आमच्याशी संपर्क साधा')}
          </h1>
        </div>

        <div className="space-y-8">
          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('School Address', 'शाळेचा पत्ता')}
            </h2>
            <p className="font-devanagari text-sm leading-relaxed text-[var(--public-text-secondary)]">
              शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज,<br />
              ता.कर्जत, जि.रायगड,<br />
              महाराष्ट्र 410201
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="public-card p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--public-text-muted)]">
                {t('Principal (Acting)', 'मुख्याध्यापक (प्रभारी)')}
              </h3>
              <p className="font-devanagari text-sm font-medium text-white">श्री.बनसोडे अजित लालासाहेब</p>
              <a href="tel:9423864391" className="mt-2 inline-block text-sm text-[var(--public-accent-ember)] no-underline hover:underline">
                9423864391
              </a>
            </div>

            <div className="public-card p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--public-text-muted)]">
                {t('Office / Clerk', 'कार्यालय / लिपिक')}
              </h3>
              <p className="font-devanagari text-sm font-medium text-white">ओमकार सुपे</p>
              <a href="tel:7666971183" className="mt-2 inline-block text-sm text-[var(--public-accent-ember)] no-underline hover:underline">
                7666971183
              </a>
            </div>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Email', 'ईमेल')}
            </h2>
            <a href="mailto:hmpathraj22@gmail.com" className="text-sm text-[var(--public-accent-ember)] no-underline hover:underline">
              hmpathraj22@gmail.com
            </a>
          </div>

          {/* WhatsApp Button */}
          <div className="text-center">
            <a
              href="https://wa.me/919423864391"
              target="_blank"
              rel="noopener noreferrer"
              className="public-btn-primary inline-flex items-center gap-2 no-underline"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('WhatsApp Us', 'WhatsApp करा')}
            </a>
          </div>

          {/* Google Maps */}
          <div className="public-card overflow-hidden">
            <iframe
              title={t('School Location', 'शाळेचे स्थान')}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.5!2d73.3!3d18.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDU0JzAwLjAiTiA3M8KwMTgnMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
