import { useAppContext } from '../contexts/AppContext';

export default function AcademicsPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'var(--public-bg-primary)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--public-accent-ember)]">
            {t('Education', 'शिक्षण')}
          </p>
          <h1 className="public-section-title text-3xl font-bold sm:text-4xl">
            {t('Academics', 'शैक्षणिक')}
          </h1>
        </div>

        <div className="space-y-8">
          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Standards & Medium', 'इयत्ता आणि माध्यम')}
            </h2>
            <ul className="space-y-2 text-sm text-[var(--public-text-secondary)]">
              <li>{t('Standards: 1st to 12th', 'इयत्ता: १ ली ते १२ वी')}</li>
              <li>{t('Medium of Instruction: Marathi', 'शिक्षणाचे माध्यम: मराठी')}</li>
              <li>{t('11th-12th: Arts Stream only', '११ वी-१२ वी: केवळ कला शाखा')}</li>
              <li className="text-[var(--public-accent-ember)]">{t('Science stream may be added in future', 'भविष्यात विज्ञान शाखा सुरू होऊ शकते')}</li>
            </ul>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Subjects Offered', 'उपलब्ध विषय')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--public-accent-ember)]">{t('Primary (1-4)', 'प्राथमिक (१-४)')}</h3>
                <ul className="space-y-1 text-sm text-[var(--public-text-secondary)]">
                  <li>{t('Marathi', 'मराठी')}</li>
                  <li>{t('Mathematics', 'गणित')}</li>
                  <li>{t('English', 'इंग्रजी')}</li>
                  <li>{t('Environmental Studies', 'परिसर अभ्यास')}</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--public-accent-ember)]">{t('Secondary (5-10)', 'माध्यमिक (५-१०)')}</h3>
                <ul className="space-y-1 text-sm text-[var(--public-text-secondary)]">
                  <li>{t('Marathi', 'मराठी')}</li>
                  <li>{t('Hindi', 'हिंदी')}</li>
                  <li>{t('English', 'इंग्रजी')}</li>
                  <li>{t('Mathematics', 'गणित')}</li>
                  <li>{t('Science', 'विज्ञान')}</li>
                  <li>{t('Social Studies', 'सामाजिक शास्त्र')}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Teaching Staff', 'शिक्षक वर्ग')}
            </h2>
            <p className="text-sm text-[var(--public-text-secondary)]">
              {t(
                'Our school has 25 dedicated staff members providing quality education across all standards. Staff details are available in the portal for registered users.',
                'आमच्या शाळेत सर्व इयत्तांमध्ये दर्जेदार शिक्षण देणारे २५ समर्पित कर्मचारी आहेत. नोंदणीकृत वापरकर्त्यांसाठी कर्मचारी तपशील पोर्टलमध्ये उपलब्ध आहेत.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
