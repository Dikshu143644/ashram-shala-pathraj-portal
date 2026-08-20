import { useAppContext } from '../contexts/AppContext';

export default function HostelPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'var(--public-bg-primary)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--public-accent-ember)]">
            {t('Residential', 'निवासी')}
          </p>
          <h1 className="public-section-title text-3xl font-bold sm:text-4xl">
            {t('Hostel Facilities', 'वसतिगृह सुविधा')}
          </h1>
        </div>

        <div className="space-y-8">
          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Hostel Overview', 'वसतिगृह विहंगावलोकन')}
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-[var(--public-text-secondary)]">
              {t(
                'Our school provides residential accommodation for all enrolled students. The hostel has a total capacity of 520 beds with separate wings for boys and girls, ensuring a safe and comfortable living environment.',
                'आमची शाळा सर्व नावनोंदणीकृत विद्यार्थ्यांना निवासी सुविधा पुरवते. वसतिगृहात मुलांसाठी आणि मुलींसाठी स्वतंत्र विभागांसह एकूण ५२० बेड क्षमता आहे, जे सुरक्षित आणि आरामदायक राहण्याचे वातावरण सुनिश्चित करते.'
              )}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--public-border)] p-4 text-center">
                <p className="text-2xl font-bold text-white">520</p>
                <p className="text-xs text-[var(--public-text-muted)]">{t('Total Beds', 'एकूण बेड')}</p>
              </div>
              <div className="rounded-lg border border-[var(--public-border)] p-4 text-center">
                <p className="text-lg font-bold text-white">{t('Boys Wing', 'मुलांचा विभाग')}</p>
                <p className="text-xs text-[var(--public-text-muted)]">{t('Separate section', 'स्वतंत्र विभाग')}</p>
              </div>
              <div className="rounded-lg border border-[var(--public-border)] p-4 text-center">
                <p className="text-lg font-bold text-white">{t('Girls Wing', 'मुलींचा विभाग')}</p>
                <p className="text-xs text-[var(--public-text-muted)]">{t('Separate section', 'स्वतंत्र विभाग')}</p>
              </div>
            </div>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Mess Timings', 'भोजन वेळ')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-[var(--public-border)] p-4">
                <span className="text-sm font-medium text-white">{t('Breakfast', 'नाश्ता')}</span>
                <span className="text-sm text-[var(--public-accent-ember)]">7:00 AM</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--public-border)] p-4">
                <span className="text-sm font-medium text-white">{t('Lunch', 'दुपारचे जेवण')}</span>
                <span className="text-sm text-[var(--public-accent-ember)]">12:30 PM</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--public-border)] p-4">
                <span className="text-sm font-medium text-white">{t('Dinner', 'रात्रीचे जेवण')}</span>
                <span className="text-sm text-[var(--public-accent-ember)]">7:30 PM</span>
              </div>
            </div>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Wardens', 'वॉर्डन')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--public-border)] p-4">
                <p className="text-xs uppercase tracking-wider text-[var(--public-text-muted)]">{t('Boys Hostel Warden', 'मुलांचे वसतिगृह प्रमुख')}</p>
                <p className="font-devanagari mt-2 text-sm font-semibold text-white">श्री.माने राजेंद्र परशराम</p>
              </div>
              <div className="rounded-lg border border-[var(--public-border)] p-4">
                <p className="text-xs uppercase tracking-wider text-[var(--public-text-muted)]">{t('Girls Hostel Warden', 'मुलींचे वसतिगृह प्रमुख')}</p>
                <p className="font-devanagari mt-2 text-sm font-semibold text-white">श्रीम.पखाले सविता पुंडलिक</p>
              </div>
            </div>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Daily Routine', 'दैनंदिन वेळापत्रक')}
            </h2>
            <div className="space-y-2 text-sm text-[var(--public-text-secondary)]">
              <div className="flex justify-between border-b border-[var(--public-border)] pb-2">
                <span>5:30 AM</span>
                <span>{t('Wake up', 'उठण्याची वेळ')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--public-border)] pb-2">
                <span>6:00 - 7:00 AM</span>
                <span>{t('Morning study', 'सकाळचा अभ्यास')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--public-border)] pb-2">
                <span>7:00 - 7:30 AM</span>
                <span>{t('Breakfast', 'नाश्ता')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--public-border)] pb-2">
                <span>8:00 AM - 3:30 PM</span>
                <span>{t('School hours', 'शाळेचे तास')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--public-border)] pb-2">
                <span>4:00 - 5:30 PM</span>
                <span>{t('Sports / Activities', 'खेळ / उपक्रम')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--public-border)] pb-2">
                <span>7:30 - 8:00 PM</span>
                <span>{t('Dinner', 'रात्रीचे जेवण')}</span>
              </div>
              <div className="flex justify-between">
                <span>8:30 - 10:00 PM</span>
                <span>{t('Evening study', 'संध्याकाळचा अभ्यास')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
