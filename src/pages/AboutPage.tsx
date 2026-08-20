import { useAppContext } from '../contexts/AppContext';

export default function AboutPage() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'var(--public-bg-primary)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--public-accent-ember)]">
            {t('About Us', 'आमच्याबद्दल')}
          </p>
          <h1 className="public-section-title text-3xl font-bold sm:text-4xl">
            {t('About Our School', 'आमच्या शाळेबद्दल')}
          </h1>
        </div>

        <div className="space-y-8">
          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('School History & Mission', 'शाळेचा इतिहास आणि ध्येय')}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--public-text-secondary)]">
              {t(
                'Government Secondary and Higher Secondary Ashram School Pathraj is a residential school established under the Tribal Development Department, Government of Maharashtra. The school provides free education, accommodation, food, and essential facilities to tribal students from standards 1st to 12th.',
                'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज ही आदिवासी विकास विभाग, महाराष्ट्र शासन अंतर्गत स्थापित निवासी शाळा आहे. शाळा इयत्ता १ ली ते १२ वी पर्यंतच्या आदिवासी विद्यार्थ्यांना मोफत शिक्षण, निवास, भोजन आणि आवश्यक सुविधा पुरवते.'
              )}
            </p>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('The Ashram Shala System', 'आश्रमशाळा प्रणाली')}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--public-text-secondary)]">
              {t(
                'The Ashram Shala (residential school) system is designed to bring education to tribal communities living in remote and hilly areas. These schools provide a holistic environment where students live on campus and receive not just academic education but also vocational training, cultural activities, and life skills development.',
                'आश्रमशाळा (निवासी शाळा) प्रणाली ही दुर्गम आणि डोंगराळ भागात राहणाऱ्या आदिवासी समुदायांपर्यंत शिक्षण पोहोचविण्यासाठी तयार केलेली आहे. या शाळांमध्ये विद्यार्थ्यांना शैक्षणिक शिक्षणाबरोबरच व्यावसायिक प्रशिक्षण, सांस्कृतिक उपक्रम आणि जीवन कौशल्य विकास देखील मिळतो.'
              )}
            </p>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Tribal Development Department', 'आदिवासी विकास विभाग')}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--public-text-secondary)]">
              {t(
                'Our school operates under the Tribal Development Department, Government of Maharashtra. The department is dedicated to the educational, economic, and social upliftment of tribal communities across the state through various welfare schemes and educational institutions.',
                'आमची शाळा आदिवासी विकास विभाग, महाराष्ट्र शासन अंतर्गत कार्य करते. हा विभाग विविध कल्याणकारी योजना आणि शैक्षणिक संस्थांच्या माध्यमातून राज्यभरातील आदिवासी समुदायांच्या शैक्षणिक, आर्थिक आणि सामाजिक उन्नतीसाठी समर्पित आहे.'
              )}
            </p>
          </div>

          <div className="public-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t('Campus Information', 'परिसर माहिती')}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--public-text-secondary)]">
              {t(
                'Located in Pathraj village, Taluka Karjat, District Raigad, our campus includes classrooms, hostel buildings for boys and girls, a dining hall, playground, and staff quarters. The school serves 459 students with 25 permanent staff members.',
                'पाथरज गाव, तालुका कर्जत, जिल्हा रायगड येथे स्थित आमच्या परिसरात वर्गखोल्या, मुला-मुलींसाठी वसतिगृह इमारती, भोजनालय, खेळाचे मैदान आणि कर्मचारी निवास आहेत. शाळा २५ कायम कर्मचाऱ्यांसह ४५९ विद्यार्थ्यांना सेवा देते.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
