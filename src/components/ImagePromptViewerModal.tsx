import { useState } from 'react';
import { X, Copy, Check, Camera, Users, UserCircle, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImagePromptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'campus' | 'activities' | 'staff' | 'events';

interface PromptCard {
  title: string;
  description: string;
  dimensions: string;
  style: string;
}

const promptsByCategory: Record<Category, PromptCard[]> = {
  campus: [
    {
      title: 'School Main Building',
      description: 'Government residential school main building with Maharashtrian architecture, two-story concrete structure painted in cream and maroon, set against Western Ghats backdrop, Raigad district. Tribal motifs on the entrance gate. Indian flag and Maharashtra state flag on the roof.',
      dimensions: '1920x1080',
      style: 'Photorealistic, golden hour lighting, wide angle',
    },
    {
      title: 'Hostel Wing Exterior',
      description: 'Four-wing hostel building complex for tribal boarding school, clean corridors with potted plants, students walking in uniform (white shirt, navy blue pants/skirt), Konkan region greenery surrounding.',
      dimensions: '1600x900',
      style: 'Documentary photography style, natural daylight',
    },
    {
      title: 'School Playground',
      description: 'Large open playground with cricket pitch, volleyball court, and kho-kho ground. Tribal students in sports uniforms playing. Surrounding Sahyadri hills visible in background. Maharashtra village setting.',
      dimensions: '1920x1080',
      style: 'Action shot, bright afternoon, wide angle',
    },
    {
      title: 'Mess Hall Interior',
      description: 'Clean dining hall with rows of stainless steel tables and benches. 200+ capacity. Students eating traditional Maharashtrian meal (rice, dal, bhaji). Kitchen visible in background. Hygiene posters on walls.',
      dimensions: '1600x900',
      style: 'Interior photography, warm fluorescent lighting',
    },
  ],
  activities: [
    {
      title: 'Classroom Teaching',
      description: 'Bright classroom with tribal students (mixed gender, ages 8-16) in white uniforms, teacher writing Marathi text on green chalkboard. Educational charts on walls. Natural light from windows. Government school aesthetics.',
      dimensions: '1600x900',
      style: 'Candid photography, natural light, medium shot',
    },
    {
      title: 'Science Lab Experiment',
      description: 'Students conducting chemistry experiment in school laboratory. Wearing safety goggles. Simple lab equipment. Teacher supervising. Excited expressions. Tribal students from Raigad district.',
      dimensions: '1600x900',
      style: 'Documentary style, focused lighting, close-up details',
    },
    {
      title: 'Cultural Programme',
      description: 'Tribal students performing Warli-inspired folk dance on stage during school annual function. Traditional tribal costumes. Decorative backdrop with tribal art patterns. Audience of parents and teachers.',
      dimensions: '1920x1080',
      style: 'Event photography, stage lighting, wide to medium shot',
    },
  ],
  staff: [
    {
      title: 'Principal Portrait',
      description: 'Middle-aged Indian male principal in formal attire (light shirt, dark trousers) sitting at office desk. Certificates and awards on wall behind. Government school office setting. Warm, approachable expression.',
      dimensions: '800x1000',
      style: 'Professional portrait, office lighting, medium close-up',
    },
    {
      title: 'Teaching Staff Group',
      description: 'Group photo of 22 teachers (mixed gender) in formal Indian attire standing in front of school building. Principal in center. Diverse age group. Formal but warm expressions. Maharashtra government school.',
      dimensions: '1920x800',
      style: 'Group portrait, outdoor natural light, wide shot',
    },
    {
      title: 'Class Teacher at Work',
      description: 'Female teacher in saree checking student notebooks at her desk. Tribal students around her asking questions. Warm classroom environment. Notice board with Marathi text visible.',
      dimensions: '1600x900',
      style: 'Candid photography, warm indoor lighting',
    },
  ],
  events: [
    {
      title: 'Republic Day Banner',
      description: 'Republic Day celebration banner design with Indian tricolor, Ashoka Chakra, school name in Devanagari and English. Tribal art border motifs. Gold and navy color scheme. "26 January" prominently displayed.',
      dimensions: '1200x400',
      style: 'Graphic design, clean modern layout, patriotic colors',
    },
    {
      title: 'Annual Sports Day Poster',
      description: 'Sports day event poster with dynamic athlete silhouettes, tribal art patterns as borders. School name, date, chief guest info. Colors: navy blue, gold, emerald green. Track and field imagery.',
      dimensions: '1080x1350',
      style: 'Modern poster design, bold typography, energetic',
    },
    {
      title: 'Parent-Teacher Meeting Notice',
      description: 'Formal notice design for PTM with school letterhead, bilingual text (Marathi and English). Government seal. Warm tone. Date, time, venue details. Traditional border design with tribal elements.',
      dimensions: '800x1100',
      style: 'Formal document design, clean typography',
    },
    {
      title: 'Tribal Culture Day Celebration',
      description: 'Vibrant banner celebrating tribal heritage. Warli art patterns, traditional tribal instruments, dancing figures. Rich earth tones with gold accents. Bilingual title. Maharashtra tribal community representation.',
      dimensions: '1920x600',
      style: 'Cultural graphic design, warm earth tones, folk art inspired',
    },
  ],
};

const categoryConfig: Record<Category, { label: string; icon: typeof Camera }> = {
  campus: { label: 'Campus Photos', icon: Camera },
  activities: { label: 'Student Activities', icon: Users },
  staff: { label: 'Staff Portraits', icon: UserCircle },
  events: { label: 'Event Banners', icon: Flag },
};

export default function ImagePromptViewerModal({ isOpen, onClose }: ImagePromptViewerModalProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('campus');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">UI Image Prompt Library</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-2 overflow-x-auto">
              {(Object.keys(categoryConfig) as Category[]).map((cat) => {
                const config = categoryConfig[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeCategory === cat ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <config.icon className="w-3.5 h-3.5" />
                    {config.label}
                  </button>
                );
              })}
            </div>

            {/* Prompt Cards */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {promptsByCategory[activeCategory].map((prompt, idx) => {
                const cardId = `${activeCategory}-${idx}`;
                return (
                  <div key={cardId} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">{prompt.title}</h4>
                        <p className="text-sm text-slate-600 mb-2">{prompt.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{prompt.dimensions}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{prompt.style}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(prompt.description, cardId)}
                        className={`p-2 rounded-lg transition-colors shrink-0 ${
                          copiedId === cardId ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Copy prompt"
                      >
                        {copiedId === cardId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
