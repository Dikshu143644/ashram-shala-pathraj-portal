import { useState } from 'react';
import { Search, Users, FileText, Stamp, Send, ArrowRight } from 'lucide-react';
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
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
        {t('Clerk Portal', 'लिपिक पोर्टल')}
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
            activeTab === 'staff' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          {t('Staff Directory', 'कर्मचारी निर्देशिका')}
        </button>
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
            activeTab === 'dispatch' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
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

  return (
    <div>
      {/* Search & Sort */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search staff...', 'कर्मचारी शोधा...')}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'designation' | 'department')}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
        >
          <option value="name">{t('Sort by Name', 'नावानुसार')}</option>
          <option value="designation">{t('Sort by Designation', 'पदानुसार')}</option>
          <option value="department">{t('Sort by Department', 'विभागानुसार')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Name', 'नाव')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Designation', 'पद')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Department', 'विभाग')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Mobile', 'मोबाईल')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Role', 'भूमिका')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{s.full_name}</td>
                  <td className="px-4 py-2.5 text-xs">{language === 'mr' ? s.designation_marathi : s.designation}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{s.department}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{s.mobile_number}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                      {s.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
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

  const statusConfig: Record<LetterStatus, { label: string; color: string; icon: typeof Stamp }> = {
    draft: { label: t('Draft', 'मसुदा'), color: 'bg-slate-100 text-slate-700 border-slate-300', icon: FileText },
    sealed: { label: t('Sealed', 'शिक्कामोर्तब'), color: 'bg-amber-50 text-amber-800 border-amber-300', icon: Stamp },
    dispatched: { label: t('Dispatched', 'पाठवले'), color: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: Send },
  };

  const nextStatus = () => {
    if (letterStatus === 'draft') setLetterStatus('sealed');
    else if (letterStatus === 'sealed') setLetterStatus('dispatched');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t('PO Letter Generator', 'प्र.अ. पत्र निर्माता')}
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('To', 'प्रति')}</label>
            <input
              type="text"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('Subject', 'विषय')}</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
              placeholder={t('Enter subject...', 'विषय प्रविष्ट करा...')}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('Body', 'मजकूर')}</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400 h-32 resize-none"
              placeholder={t('Enter letter body...', 'पत्राचा मजकूर प्रविष्ट करा...')}
            />
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between pt-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${statusConfig[letterStatus].color}`}>
              {letterStatus === 'sealed' && <Stamp className="w-4 h-4" style={{ color: '#d4af37' }} />}
              {statusConfig[letterStatus].label}
            </div>
            {letterStatus !== 'dispatched' && (
              <button
                onClick={nextStatus}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: letterStatus === 'draft' ? '#d4af37' : '#059669' }}
              >
                {letterStatus === 'draft' ? t('Seal Letter', 'पत्र शिक्कामोर्तब करा') : t('Dispatch', 'पाठवा')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h4 className="font-semibold text-slate-700 mb-3">{t('Letter Preview', 'पत्र पूर्वावलोकन')}</h4>
        <div className="border border-slate-200 rounded-lg p-4 min-h-64 bg-slate-50 text-sm">
          <div className="text-center border-b border-slate-300 pb-3 mb-3">
            <p className="text-xs text-slate-500">आदिवासी विकास विभाग, महाराष्ट्र शासन</p>
            <p className="font-bold text-slate-800">शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथराज</p>
            <p className="text-xs text-slate-500">ता. पाथराज, जि. रायगड</p>
          </div>
          <p className="text-xs text-slate-500 mb-2">{t('Date:', 'दिनांक:')} {new Date().toLocaleDateString()}</p>
          <p className="mb-1"><strong>{t('To:', 'प्रति:')}</strong> {form.to || '...'}</p>
          <p className="mb-3"><strong>{t('Subject:', 'विषय:')}</strong> {form.subject || '...'}</p>
          <p className="text-slate-700 whitespace-pre-wrap">{form.body || t('(Letter body will appear here)', '(पत्राचा मजकूर येथे दिसेल)')}</p>
          {letterStatus === 'sealed' && (
            <div className="mt-6 flex justify-end">
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: '#d4af37' }}>
                <Stamp className="w-8 h-8" style={{ color: '#d4af37' }} />
              </div>
            </div>
          )}
          {letterStatus === 'dispatched' && (
            <div className="mt-6 text-center">
              <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                {t('Dispatched', 'पाठवले')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
