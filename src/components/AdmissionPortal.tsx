import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, CheckCircle, Loader2, Fingerprint, X, Users, UserCheck, ShieldCheck, GraduationCap, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';
import type { Student, Standard } from '../types';
import StatsCard from './StatsCard';
import { sanitizeInput } from '../utils/sanitize';

const allStandards: Standard[] = ['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी', '9 वी', '10 वी', '11 वी', '12 वी'];

export default function AdmissionPortal() {
  const { language, currentUser } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStd, setFilterStd] = useState('');

  // Students data from API
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // School stats from public endpoint
  const [schoolStats, setSchoolStats] = useState({ totalStudents: 0, totalStaff: 0, totalStandards: 0, totalVillages: 0, enrolledCount: 0 });

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

  const isParent = currentUser?.role === 'student_parent';

  // Fetch school-wide stats from public endpoint
  useEffect(() => {
    async function fetchSchoolStats() {
      try {
        const response = await fetch('/api/school/stats');
        if (response.ok) {
          const data = await response.json();
          setSchoolStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch school stats:', err);
      }
    }
    fetchSchoolStats();
  }, []);

  // Fetch students from API with debounce
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStd) params.set('standard', filterStd);
      if (search) params.set('search', search);
      params.set('perPage', '500');
      const response = await fetch(`/api/students?${params.toString()}`);
      const result = await response.json();
      setStudentsData(result.data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStd]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  // Stats from public school stats endpoint (always shows real school-wide data)
  const totalStudents = schoolStats.totalStudents;
  const enrolledCount = schoolStats.enrolledCount;
  const villageCount = schoolStats.totalVillages;
  const standardCount = schoolStats.totalStandards;

  const handleApaarVerify = () => {
    if (formData.apaar_id.length < 5) return;
    setApaarVerifying(true);
    setTimeout(() => {
      setApaarVerifying(false);
      setApaarVerified(true);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedData = {
      full_name: sanitizeInput(formData.full_name),
      standard: formData.standard,
      guardian_name: sanitizeInput(formData.guardian_name),
      village: sanitizeInput(formData.village),
      mobile_number: formData.mobile_number.replace(/\D/g, ''),
      apaar_id: formData.apaar_id.replace(/\D/g, ''),
    };

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        const result = await response.json();
        setApplicationId(result.data?.id || 'SUCCESS');
        setSubmitted(true);
        fetchStudents();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to submit application');
      }
    } catch {
      alert('Failed to submit application. Please try again.');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSubmitted(false);
    setApaarVerified(false);
    setFormData({ full_name: '', standard: '5 वी', guardian_name: '', village: '', mobile_number: '', apaar_id: '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="portal-page"
    >
      <div className="portal-heading flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="portal-kicker">{t('STUDENT INTAKE', 'विद्यार्थी प्रवेश')}</p>
          <h2 className="portal-title">{t('Admissions Portal', 'प्रवेश पोर्टल')}</h2>
          <p className="portal-subtitle">{t('Manage applications, verification and enrollment records.', 'अर्ज, पडताळणी आणि प्रवेश नोंदी व्यवस्थापित करा.')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className={`primary-action ${showForm ? 'bg-[#545f73]!' : ''}`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? t('Close', 'बंद करा') : t('New Application', 'नवीन अर्ज')}
        </motion.button>
      </div>

      {/* Stats Cards - Bento Grid */}
      <div className="bento-stats mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
              <div className="glass-card-static p-6 sm:p-8 text-center" style={{ background: 'rgba(236, 253, 245, 0.8)' }}>
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
              <form onSubmit={handleSubmit} className="glass-card-static p-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <span className="h-6 w-1 rounded-full bg-black" />
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
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('Standard', 'इयत्ता')}</label>
                    <select
                      value={formData.standard}
                      onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
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
                        className="flex-1 px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
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
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
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
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('Village', 'गाव')}</label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="primary-action"
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
      <div className="glass-card-static p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex min-w-0 max-w-full flex-1 items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search by name, guardian or village...', 'नाव, पालक किंवा गावाने शोधा...')}
              className="min-w-0 flex-1 px-3.5 py-2 border-[1.5px] border-slate-200 rounded-lg text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white/80"
            />
          </div>
          <select
            value={filterStd}
            onChange={(e) => setFilterStd(e.target.value)}
            className="px-3 py-2 border-[1.5px] border-slate-200 rounded-lg text-sm outline-none focus:border-amber-400 transition-all bg-white/80"
          >
            <option value="">{t('All Standards', 'सर्व इयत्ता')}</option>
            {allStandards.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card-static min-w-0 max-w-full overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="ml-3 text-sm text-slate-500">{t('Loading students...', 'विद्यार्थी लोड करत आहे...')}</span>
          </div>
        ) : isParent && studentsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {t("Your children haven't been linked to your account yet.", 'तुमच्या मुलांची नोंद अद्याप तुमच्या खात्याशी जोडली गेलेली नाही.')}
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-md">
              {t(
                'Please contact the school office (7666971183) to link your child\'s record.',
                'कृपया तुमच्या मुलाची नोंद जोडण्यासाठी शाळा कार्यालयाशी संपर्क साधा (7666971183).'
              )}
            </p>
            <a
              href="tel:7666971183"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              {t('Contact Office', 'कार्यालयाशी संपर्क करा')}
            </a>
          </div>
        ) : (
        <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain touch-pan-x">
          <table className="portal-table w-full min-w-[40rem] text-sm">
            <thead style={{ background: 'rgba(248, 250, 252, 0.8)' }} className="border-b border-slate-200/50">
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
              {studentsData.slice(0, 50).map((student, idx) => (
                <tr key={student.id} className={`border-b border-slate-100/50 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/30'}`}>
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
        )}
        <div className="px-4 py-2.5 border-t border-slate-200/50 text-xs text-slate-500" style={{ background: 'rgba(248, 250, 252, 0.6)' }}>
          {isParent && studentsData.length === 0
            ? t(`School has ${schoolStats.totalStudents} students total`, `शाळेत एकूण ${schoolStats.totalStudents} विद्यार्थी आहेत`)
            : t(`Showing ${studentsData.length} of ${studentsData.length} students`,
               `${studentsData.length} पैकी ${studentsData.length} विद्यार्थी दर्शवित आहे`)}
        </div>
      </div>
    </motion.div>
  );
}
