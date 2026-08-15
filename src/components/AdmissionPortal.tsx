import { useState } from 'react';
import { Search, Plus, CheckCircle, Loader2, Fingerprint, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { students } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';
import type { Student, StudentStatus } from '../types';

const statusSteps: StudentStatus[] = ['Submitted', 'Verified', 'Approved', 'Enrolled'];
const statusColors: Record<StudentStatus, string> = {
  Submitted: 'bg-blue-100 text-blue-700',
  Verified: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Enrolled: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-700',
};

const casteOptions = ['Katkari', 'Thakar', 'Mahadev Koli', 'Gond', 'Other ST'];

export default function AdmissionPortal() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStd, setFilterStd] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    standard: '1st',
    stream: 'Arts' as 'Arts' | 'Science',
    caste_category: 'Katkari',
    aadhaar: '',
    mobile_number: '',
    parent_name: '',
  });
  const [aadhaarVerifying, setAadhaarVerifying] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const handleAadhaarVerify = () => {
    if (formData.aadhaar.length !== 12) return;
    setAadhaarVerifying(true);
    setTimeout(() => {
      setAadhaarVerifying(false);
      setAadhaarVerified(true);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `ASPS-2024-${Math.floor(10000 + Math.random() * 90000)}`;
    setApplicationId(id);
    setSubmitted(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setSubmitted(false);
    setAadhaarVerified(false);
    setFormData({ full_name: '', standard: '1st', stream: 'Arts', caste_category: 'Katkari', aadhaar: '', mobile_number: '', parent_name: '' });
  };

  const filteredStudents = students.filter((s: Student) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.application_no.toLowerCase().includes(search.toLowerCase());
    const matchStd = filterStd ? s.standard === filterStd : true;
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    return matchSearch && matchStd && matchStatus;
  });

  const needsStream = formData.standard === '11th' || formData.standard === '12th';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
          {t('Admission Portal', 'प्रवेश पोर्टल')}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
          style={{ backgroundColor: showForm ? '#64748b' : '#d4af37' }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? t('Close', 'बंद करा') : t('New Application', 'नवीन अर्ज')}
        </button>
      </div>

      {/* Application Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-800 mb-1">
                  {t('Application Submitted!', 'अर्ज सादर केला!')}
                </h3>
                <p className="text-emerald-700 text-lg font-mono">{applicationId}</p>
                {/* Status Tracker */}
                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                  {statusSteps.map((step, idx) => (
                    <div key={step} className="flex items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="text-xs text-slate-600">{step}</span>
                      {idx < statusSteps.length - 1 && <div className="w-6 h-0.5 bg-slate-300" />}
                    </div>
                  ))}
                </div>
                <button onClick={resetForm} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg text-sm hover:bg-slate-300">
                  {t('Close', 'बंद करा')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">
                  {t('New Admission Application', 'नवीन प्रवेश अर्ज')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('Full Name', 'पूर्ण नाव')}</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('Standard', 'इयत्ता')}</label>
                    <select
                      value={formData.standard}
                      onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                    >
                      {['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {needsStream && (
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">{t('Stream', 'शाखा')}</label>
                      <select
                        value={formData.stream}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value as 'Arts' | 'Science' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                      >
                        <option value="Arts">{t('Arts', 'कला')}</option>
                        <option value="Science">{t('Science', 'विज्ञान')}</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('Caste Category', 'जात प्रवर्ग')}</label>
                    <select
                      value={formData.caste_category}
                      onChange={(e) => setFormData({ ...formData, caste_category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                    >
                      {casteOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('Aadhaar Number', 'आधार क्रमांक')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.aadhaar}
                        onChange={(e) => { setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }); setAadhaarVerified(false); }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                        maxLength={12}
                        placeholder="XXXX XXXX XXXX"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleAadhaarVerify}
                        disabled={formData.aadhaar.length !== 12 || aadhaarVerifying || aadhaarVerified}
                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${
                          aadhaarVerified ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50'
                        }`}
                      >
                        {aadhaarVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> :
                         aadhaarVerified ? <CheckCircle className="w-4 h-4" /> :
                         <Fingerprint className="w-4 h-4" />}
                        {aadhaarVerified ? t('Verified (Demo)', 'सत्यापित (डेमो)') : t('Verify (Demo)', 'सत्यापन (डेमो)')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('Mobile Number', 'मोबाईल नंबर')}</label>
                    <input
                      type="text"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('Parent Name', 'पालकाचे नाव')}</label>
                    <input
                      type="text"
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 px-6 py-2.5 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#059669' }}
                >
                  {t('Submit Application', 'अर्ज सादर करा')}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search by name or application no...', 'नाव किंवा अर्ज क्रमांकाने शोधा...')}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <select
            value={filterStd}
            onChange={(e) => setFilterStd(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
          >
            <option value="">{t('All Standards', 'सर्व इयत्ता')}</option>
            {['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
          >
            <option value="">{t('All Status', 'सर्व स्थिती')}</option>
            {statusSteps.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Application No', 'अर्ज क्र.')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Name', 'नाव')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Std', 'इ.')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Category', 'प्रवर्ग')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Aadhaar', 'आधार')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Status', 'स्थिती')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.slice(0, 50).map((student) => (
                <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs">{student.application_no}</td>
                  <td className="px-4 py-2.5">{student.full_name}</td>
                  <td className="px-4 py-2.5">{student.standard}</td>
                  <td className="px-4 py-2.5">{student.caste_category}</td>
                  <td className="px-4 py-2.5">
                    {student.aadhaar_verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> {t('Verified', 'सत्यापित')}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">{t('Pending', 'प्रलंबित')}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[student.status]}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          {t(`Showing ${Math.min(50, filteredStudents.length)} of ${filteredStudents.length} applications`,
             `${filteredStudents.length} पैकी ${Math.min(50, filteredStudents.length)} अर्ज दर्शवित आहे`)}
        </div>
      </div>
    </motion.div>
  );
}
