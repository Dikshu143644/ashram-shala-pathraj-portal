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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5">
        {t('Clerk Portal', 'लिपिक पोर्टल')}
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
            activeTab === 'staff' ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          {t('Staff Directory', 'कर्मचारी निर्देशिका')}
        </button>
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
            activeTab === 'dispatch' ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          {t('PO Dispatch', 'प्र.अ. पत्रव्यवहार')}
        </button>
      </div>

      {activeTab === 'staff' && <StaffDirectory t={t} language={language} />}
      {activeTab === 'dispatch' && <PODispatch t={t} />}
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
    const colors = ['#3b82f6', '#8b5cf6', '#059669', '#d4af37', '#ec4899', '#06b6d4', '#f97316', '#6366f1'];
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
            className="flex-1 px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'designation' | 'department')}
          className="px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 transition-all"
        >
          <option value="name">{t('Sort by Name', 'नावानुसार')}</option>
          <option value="designation">{t('Sort by Designation', 'पदानुसार')}</option>
          <option value="department">{t('Sort by Department', 'विभागानुसार')}</option>
        </select>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}
        >
          <Download className="w-4 h-4" />
          {t('Export', 'निर्यात')}
        </motion.button>
      </div>

      {/* Staff Cards Grid (for first 12) + Table for rest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {filteredStaff.slice(0, 6).map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: getAvatarColor(s.full_name) }}
              >
                {getInitials(s.full_name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{s.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{language === 'mr' ? s.designation_marathi : s.designation}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{s.department}</span>
              <span className="text-[10px] font-mono text-slate-400">{s.mobile_number}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table for all */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
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
                <tr key={s.id} className={`border-b border-slate-100 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 capitalize">
                      {s.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
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

  const nextStatus = () => {
    if (letterStatus === 'draft') setLetterStatus('sealed');
    else if (letterStatus === 'sealed') setLetterStatus('dispatched');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-600" />
          {t('PO Letter Generator', 'प्र.अ. पत्र निर्माता')}
        </h4>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('To', 'प्रति')}</label>
            <input
              type="text"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Subject', 'विषय')}</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              placeholder={t('Enter subject...', 'विषय प्रविष्ट करा...')}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Body', 'मजकूर')}</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 h-36 resize-none transition-all"
              placeholder={t('Enter letter body...', 'पत्राचा मजकूर प्रविष्ट करा...')}
            />
          </div>

          {/* Status Badge & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStatus}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm"
                style={{ background: letterStatus === 'draft' ? 'linear-gradient(135deg, #d4af37, #f59e0b)' : 'linear-gradient(135deg, #059669, #0d9488)' }}
              >
                {letterStatus === 'draft' ? t('Seal Letter', 'पत्र शिक्कामोर्तब करा') : t('Dispatch', 'पाठवा')}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h4 className="font-semibold text-slate-700 mb-4">{t('Letter Preview', 'पत्र पूर्वावलोकन')}</h4>
        <div className="border border-slate-200 rounded-xl p-5 min-h-72 bg-slate-50/50 text-sm relative">
          <div className="text-center border-b border-slate-300 pb-4 mb-4">
            <p className="text-xs text-slate-500">आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
            <p className="font-bold text-slate-800 mt-0.5">शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथराज</p>
            <p className="text-xs text-slate-500 mt-0.5">ता. सुधागड, जि. रायगड</p>
          </div>
          <p className="text-xs text-slate-500 mb-3">{t('Date:', 'दिनांक:')} {new Date().toLocaleDateString()}</p>
          <p className="mb-1.5"><strong className="text-slate-700">{t('To:', 'प्रति:')}</strong> {form.to || '...'}</p>
          <p className="mb-4"><strong className="text-slate-700">{t('Subject:', 'विषय:')}</strong> {form.subject || '...'}</p>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{form.body || t('(Letter body will appear here)', '(पत्राचा मजकूर येथे दिसेल)')}</p>

          {/* Gold Wax Seal */}
          {letterStatus === 'sealed' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mt-8 flex justify-end"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)', boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)' }}>
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          )}
          {letterStatus === 'dispatched' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 text-center"
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
