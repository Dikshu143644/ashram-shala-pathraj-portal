import { useState } from 'react';
import { Search, Users, FileText, Stamp, Send, ArrowRight, Download, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { staff } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';

type ClerkTab = 'staff' | 'dispatch';
type LetterStatus = 'draft' | 'sealed' | 'dispatched';

export default function ClerkPortal() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [activeTab, setActiveTab] = useState<ClerkTab>('staff');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="portal-page relative"
    >
      {/* Subtle background image */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/staff-office.jpg)', opacity: 0.05 }}
        aria-hidden="true"
      />
      <div className="relative z-10">
      <div className="portal-heading">
        <p className="portal-kicker">{t('OFFICE OPERATIONS', 'कार्यालयीन कामकाज')}</p>
        <h2 className="portal-title">{t('Staff & Dispatch', 'कर्मचारी व पत्रव्यवहार')}</h2>
        <p className="portal-subtitle">{t('Find staff and prepare official correspondence.', 'कर्मचारी शोधा आणि अधिकृत पत्रव्यवहार तयार करा.')}</p>
      </div>

      {/* Tabs - Glassmorphism */}
      <div className="segmented-control">
        <button
          onClick={() => setActiveTab('staff')}
          aria-pressed={activeTab === 'staff'}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold ${activeTab === 'staff' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <Users className="w-4 h-4" />
          {t('Staff Directory', 'कर्मचारी निर्देशिका')}
        </button>
        <button
          onClick={() => setActiveTab('dispatch')}
          aria-pressed={activeTab === 'dispatch'}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold ${activeTab === 'dispatch' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <FileText className="w-4 h-4" />
          {t('PO Dispatch', 'प्र.अ. पत्रव्यवहार')}
        </button>
      </div>

      {activeTab === 'staff' && <StaffDirectory t={t} language={language} />}
      {activeTab === 'dispatch' && <PODispatch t={t} />}
      </div>
    </motion.div>
  );
}

function StaffDirectory({ t, language }: { t: (en: string, mr: string) => string; language: string }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'designation' | 'department'>('name');

  const filteredStaff = staff
    .filter(s => {
      const q = search.toLowerCase();
      return s.full_name.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'designation') return a.designation.localeCompare(b.designation);
      return a.department.localeCompare(b.department);
    });

  // Generate avatar initials and color
  const getAvatarColor = (name: string) => {
    const colors = ['#3b82f6', '#8b5cf6', '#D97706', '#d4af37', '#ec4899', '#06b6d4', '#f97316', '#6366f1'];
    const idx = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colors.length;
    return colors[idx];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
  };

  return (
    <div>
      {/* Search & Sort */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search staff...', 'कर्मचारी शोधा...')}
            className="flex-1 px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white/80"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'designation' | 'department')}
          className="px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 transition-all bg-white/80"
        >
          <option value="name">{t('Sort by Name', 'नावानुसार')}</option>
          <option value="designation">{t('Sort by Designation', 'पदानुसार')}</option>
          <option value="department">{t('Sort by Department', 'विभागानुसार')}</option>
        </select>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-action"
        >
          <Download className="w-4 h-4" />
          {t('Export', 'निर्यात')}
        </motion.button>
      </div>

      {/* Staff Cards Grid - Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {filteredStaff.slice(0, 6).map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="glass-card-static p-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md"
                style={{ backgroundColor: getAvatarColor(s.full_name) }}
              >
                {getInitials(s.full_name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{s.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{language === 'mr' ? s.designation_marathi : s.designation}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100/50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{s.department}</span>
              <span className="text-[10px] font-mono text-slate-400">{s.mobile_number}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table - Glass */}
      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="portal-table w-full text-sm">
            <thead style={{ background: 'rgba(248, 250, 252, 0.8)' }} className="border-b border-slate-200/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Name', 'नाव')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Designation', 'पद')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Department', 'विभाग')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Mobile', 'मोबाईल')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Role', 'भूमिका')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((s, idx) => (
                <tr key={s.id} className={`border-b border-slate-100/50 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/30'}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: getAvatarColor(s.full_name) }}
                      >
                        {getInitials(s.full_name)}
                      </div>
                      <span className="font-medium text-slate-800">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{language === 'mr' ? s.designation_marathi : s.designation}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{s.department}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{s.mobile_number}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100/80 text-slate-600 capitalize">
                      {s.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-200/50 text-xs text-slate-500" style={{ background: 'rgba(248, 250, 252, 0.6)' }}>
          {t(`${filteredStaff.length} staff members`, `${filteredStaff.length} कर्मचारी`)}
        </div>
      </div>
    </div>
  );
}

function PODispatch({ t }: { t: (en: string, mr: string) => string }) {
  const [letterStatus, setLetterStatus] = useState<LetterStatus>('draft');
  const [form, setForm] = useState({
    to: 'Project Officer, ITDP Raigad',
    subject: '',
    body: '',
  });

  const todayDate = new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const nextStatus = () => {
    if (letterStatus === 'draft') setLetterStatus('sealed');
    else if (letterStatus === 'sealed') setLetterStatus('dispatched');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Form - Glass Card */}
      <div className="glass-card-static p-5">
        <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-600" />
          {t('PO Letter Generator', 'प्र.अ. पत्र निर्माता')}
        </h4>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Date', 'दिनांक')}</label>
            <input
              type="text"
              value={todayDate}
              readOnly
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-600 cursor-default"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('To', 'प्रति')}</label>
            <input
              type="text"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white/80"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Subject', 'विषय')}</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white/80"
              placeholder={t('Enter subject...', 'विषय प्रविष्ट करा...')}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Body', 'मजकूर')}</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 h-36 resize-none transition-all bg-white/80"
              placeholder={t('Enter letter body...', 'पत्राचा मजकूर प्रविष्ट करा...')}
            />
          </div>

          {/* Status Badge & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium ${
              letterStatus === 'draft' ? 'bg-slate-50 text-slate-700 border-slate-200' :
              letterStatus === 'sealed' ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {letterStatus === 'sealed' && <Stamp className="w-4 h-4" style={{ color: '#d4af37' }} />}
              {letterStatus === 'dispatched' && <CheckCircle className="w-4 h-4" />}
              {letterStatus === 'draft' ? t('Draft', 'मसुदा') :
               letterStatus === 'sealed' ? t('Sealed', 'शिक्कामोर्तब') :
               t('Dispatched', 'पाठवले')}
            </div>
            {letterStatus !== 'dispatched' && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={nextStatus}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all"
                style={{
                  background: letterStatus === 'draft'
                    ? 'linear-gradient(135deg, #d4af37, #b8960c)'
                    : 'linear-gradient(135deg, #1E293B, #0F172A)',
                  boxShadow: letterStatus === 'draft'
                    ? '0 4px 16px rgba(212, 175, 55, 0.35)'
                    : '0 4px 16px rgba(5, 150, 105, 0.35)',
                }}
              >
                {letterStatus === 'draft' ? <><Stamp className="w-4 h-4" /> {t('Seal Letter', 'पत्र शिक्कामोर्तब करा')}</> : <><Send className="w-4 h-4" /> {t('Dispatch', 'पाठवा')}</>}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Preview - Realistic Printed Paper Look */}
      <div className="flex flex-col">
        <h4 className="font-semibold text-slate-700 mb-3">{t('Letter Preview', 'पत्र पूर्वावलोकन')}</h4>
        <div
          className="relative flex-1 rounded-sm border border-slate-300/80 p-8 sm:p-10 min-h-[28rem]"
          style={{
            background: '#fefdfb',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06), inset 0 0 60px rgba(245,240,230,0.3)',
            fontFamily: "'Noto Serif Devanagari', 'Noto Serif', Georgia, serif",
          }}
        >
          {/* Letterhead */}
          <div className="text-center border-b-2 border-slate-700 pb-4 mb-5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-sans">Tribal Development Department, Govt. of Maharashtra</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-sans">आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
            <h3 className="font-bold text-slate-900 text-base mt-2 tracking-wide" style={{ fontFamily: "'Noto Serif Devanagari', serif" }}>
              शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
            </h3>
            <p className="text-xs text-slate-600 mt-1">ता. कर्जत, जि. रायगड, पिन - 410201</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Phone: 7666971183 | Email: ashramshala.pathraj@gov.in</p>
          </div>

          {/* Date & Reference */}
          <div className="flex items-center justify-between mb-4 text-xs text-slate-600">
            <span>{t('Ref No:', 'संदर्भ क्र:')} ___/2024-25</span>
            <span>{t('Date:', 'दिनांक:')} {todayDate}</span>
          </div>

          {/* Letter Content */}
          <div className="text-sm leading-[1.8] text-slate-800">
            <p className="mb-2"><strong>{t('To:', 'प्रति:')}</strong> {form.to || '...'}</p>
            <p className="mb-4"><strong>{t('Subject:', 'विषय:')}</strong> <span className="underline decoration-slate-400">{form.subject || '...'}</span></p>
            <p className="mb-1">{t('Respected Sir/Madam,', 'महोदय,')}</p>
            <p className="whitespace-pre-wrap mt-2 min-h-[5rem]">{form.body || t('(Letter body will appear here)', '(पत्राचा मजकूर येथे दिसेल)')}</p>
          </div>

          {/* Signature block */}
          <div className="mt-8 text-right text-xs text-slate-600">
            <p>{t('Yours faithfully,', 'आपला विश्वासू,')}</p>
            <p className="mt-6 font-semibold text-slate-800">{t('Principal', 'मुख्याध्यापक')}</p>
            <p className="text-[10px] text-slate-500">{t('Govt. Ashram School, Pathraj', 'शा. आश्रमशाळा, पाथरज')}</p>
          </div>

          {/* Gold Wax Seal */}
          {letterStatus === 'sealed' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="absolute bottom-6 right-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#cba72f] to-[#e9c349] shadow-[0_8px_20px_rgba(203,167,47,.28)]">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          )}
          {letterStatus === 'dispatched' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase shadow-sm">
                <Send className="w-3.5 h-3.5" />
                {t('Dispatched', 'पाठवले')}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
