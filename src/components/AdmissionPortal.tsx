import { useState } from 'react';
import { Search, Plus, CheckCircle, Loader2, Fingerprint, X, Users, UserCheck, ShieldCheck, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { students } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';
import type { Student, Standard } from '../types';
import StatsCard from './StatsCard';

const allStandards: Standard[] = ['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी', '9 वी', '10 वी', '11 वी', '12 वी'];

export default function AdmissionPortal() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStd, setFilterStd] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    standard: '5 वी' as string,
    guardian_name: '',
    village: '',
    mobile_number: '',
    apaar_id: '',
  });
  const [apaarVerifying, setApaarVerifying] = useState(false);
  const [apaarVerified, setApaarVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  // Stats
  const totalStudents = students.length;
  const enrolledCount = students.filter(s => s.status === 'Enrolled').length;
  const villageCount = new Set(students.map(s => s.village)).size;
  const standardCount = new Set(students.map(s => s.standard)).size;

  const handleApaarVerify = () => {
    if (formData.apaar_id.length < 5) return;
    setApaarVerifying(true);
    setTimeout(() => {
      setApaarVerifying(false);
      setApaarVerified(true);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `ASPS-2025-${Math.floor(10000 + Math.random() * 90000)}`;
    setApplicationId(id);
    setSubmitted(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setSubmitted(false);
    setApaarVerified(false);
    setFormData({ full_name: '', standard: '5 वी', guardian_name: '', village: '', mobile_number: '', apaar_id: '' });
  };

  const filteredStudents = students.filter((s: Student) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.guardian_name.toLowerCase().includes(search.toLowerCase()) ||
      s.village.toLowerCase().includes(search.toLowerCase());
    const matchStd = filterStd ? s.standard === filterStd : true;
    return matchSearch && matchStd;
  });

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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md"
          style={{
            background: showForm ? '#64748b' : 'linear-gradient(135deg, #d4af37, #f59e0b)',
            color: showForm ? '#fff' : '#1e293b',
          }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? t('Close', 'बंद करा') : t('New Application', 'नवीन अर्ज')}
        </motion.button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatsCard
          icon={Users}
          label="Total Students"
          labelMr="एकूण विद्यार्थी"
          value={totalStudents}
          variant="navy"
          language={language}
          trend={{ direction: 'up', percentage: 12 }}
        />
        <StatsCard
          icon={GraduationCap}
          label="Enrolled"
          labelMr="नोंदणीकृत"
          value={enrolledCount}
          variant="emerald"
          language={language}
        />
        <StatsCard
          icon={ShieldCheck}
          label="Standards"
          labelMr="इयत्ता"
          value={standardCount}
          variant="gold"
          language={language}
        />
        <StatsCard
          icon={UserCheck}
          label="Villages"
          labelMr="गावे"
          value={villageCount}
          variant="emerald"
          language={language}
        />
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-bold text-emerald-800 mb-1">
                  {t('Application Submitted!', 'अर्ज सादर केला!')}
                </h3>
                <p className="text-emerald-700 text-lg font-mono font-bold">{applicationId}</p>
                <button onClick={resetForm} className="mt-6 px-5 py-2 bg-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors">
                  {t('Close', 'बंद करा')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full" style={{ backgroundColor: '#d4af37' }} />
                  {t('New Admission Application', 'नवीन प्रवेश अर्ज')}
                </h3>
                <p className="text-xs text-slate-400 mb-5 ml-3">{t('Fill in all required fields', 'सर्व आवश्यक फील्ड भरा')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('Full Name', 'पूर्ण नाव')}</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('Standard', 'इयत्ता')}</label>
                    <select
                      value={formData.standard}
                      onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    >
                      {allStandards.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('APAAR ID', 'अपार आयडी')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.apaar_id}
                        onChange={(e) => { setFormData({ ...formData, apaar_id: e.target.value.replace(/\D/g, '') }); setApaarVerified(false); }}
                        className="flex-1 px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                        placeholder="APAAR ID"
                      />
                      <button
                        type="button"
                        onClick={handleApaarVerify}
                        disabled={formData.apaar_id.length < 5 || apaarVerifying || apaarVerified}
                        className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                          apaarVerified ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50'
                        }`}
                      >
                        {apaarVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> :
                         apaarVerified ? <CheckCircle className="w-4 h-4" /> :
                         <Fingerprint className="w-4 h-4" />}
                        {apaarVerified ? t('Verified', 'सत्यापित') : t('Verify', 'सत्यापन')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('Mobile Number', 'मोबाईल नंबर')}</label>
                    <input
                      type="text"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('Guardian Name', 'पालकाचे नाव')}</label>
                    <input
                      type="text"
                      value={formData.guardian_name}
                      onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('Village', 'गाव')}</label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-all shadow-md"
                    style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                  >
                    {t('Submit Application', 'अर्ज सादर करा')}
                  </motion.button>
                </div>
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
              placeholder={t('Search by name, guardian or village...', 'नाव, पालक किंवा गावाने शोधा...')}
              className="flex-1 px-3.5 py-2 border-[1.5px] border-slate-200 rounded-lg text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <select
            value={filterStd}
            onChange={(e) => setFilterStd(e.target.value)}
            className="px-3 py-2 border-[1.5px] border-slate-200 rounded-lg text-sm outline-none focus:border-amber-400 transition-all"
          >
            <option value="">{t('All Standards', 'सर्व इयत्ता')}</option>
            {allStandards.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Sr No', 'अ.क्र.')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Name', 'नाव')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Std', 'इ.')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Guardian', 'पालक')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Village', 'गाव')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Status', 'स्थिती')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.slice(0, 50).map((student, idx) => (
                <tr key={student.id} className={`border-b border-slate-100 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{student.sr_no}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{student.full_name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{student.standard}</td>
                  <td className="px-4 py-2.5 text-slate-600">{student.guardian_name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{student.village}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t('Enrolled', 'नोंदणीकृत')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          {t(`Showing ${Math.min(50, filteredStudents.length)} of ${filteredStudents.length} students`,
             `${filteredStudents.length} पैकी ${Math.min(50, filteredStudents.length)} विद्यार्थी दर्शवित आहे`)}
        </div>
      </div>
    </motion.div>
  );
}
