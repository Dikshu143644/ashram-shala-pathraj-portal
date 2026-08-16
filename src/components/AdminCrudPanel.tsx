import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';
import type { Student, Standard } from '../types';

const allStandards: Standard[] = ['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी', '9 वी', '10 वी', '11 वी', '12 वी'];

const ITEMS_PER_PAGE = 20;

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface StudentFormData {
  full_name: string;
  standard: string;
  date_of_birth: string;
  blood_group: string;
  mobile_number: string;
  guardian_name: string;
  village: string;
  apaar_id: string;
}

const emptyForm: StudentFormData = {
  full_name: '',
  standard: '5 वी',
  date_of_birth: '',
  blood_group: '',
  mobile_number: '',
  guardian_name: '',
  village: '',
  apaar_id: '',
};

export default function AdminCrudPanel() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStd, setFilterStd] = useState('');
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStd) params.set('standard', filterStd);
      if (search) params.set('search', search);
      const response = await fetch(`/api/students?${params.toString()}`);
      const result = await response.json();
      setStudents(result.data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      showToast(t('Failed to load students', 'विद्यार्थी लोड करण्यात अयशस्वी'), 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterStd, showToast, t]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filterStd]);

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const paginatedStudents = students.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      standard: student.standard,
      date_of_birth: student.date_of_birth || '',
      blood_group: student.blood_group || '',
      mobile_number: student.mobile_number || '',
      guardian_name: student.guardian_name || '',
      village: student.village || '',
      apaar_id: student.apaar_id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast(
          editingStudent
            ? t('Student updated successfully', 'विद्यार्थी यशस्वीरित्या अपडेट केला')
            : t('Student added successfully', 'विद्यार्थी यशस्वीरित्या जोडला'),
          'success'
        );
        setShowModal(false);
        fetchStudents();
      } else {
        const err = await response.json();
        showToast(err.error || t('Operation failed', 'ऑपरेशन अयशस्वी'), 'error');
      }
    } catch {
      showToast(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/students/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast(t('Student deleted successfully', 'विद्यार्थी यशस्वीरित्या हटवला'), 'success');
        setDeleteTarget(null);
        fetchStudents();
      } else {
        const err = await response.json();
        showToast(err.error || t('Delete failed', 'हटवणे अयशस्वी'), 'error');
      }
    } catch {
      showToast(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative">
      {/* Toast messages */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-800">
          {t('Student Management', 'विद्यार्थी व्यवस्थापन')}
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md text-white"
          style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
        >
          <Plus className="w-4 h-4" />
          {t('Add Student', 'विद्यार्थी जोडा')}
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="glass-card-static p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search by name, guardian or village...', 'नाव, पालक किंवा गावाने शोधा...')}
              className="flex-1 px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
            />
          </div>
          <select
            value={filterStd}
            onChange={(e) => setFilterStd(e.target.value)}
            className="px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
          >
            <option value="">{t('All Standards', 'सर्व इयत्ता')}</option>
            {allStandards.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card-static overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="ml-3 text-sm text-slate-500">{t('Loading students...', 'विद्यार्थी लोड करत आहे...')}</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: 'rgba(248, 250, 252, 0.8)' }} className="border-b border-slate-200/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Sr No', 'अ.क्र.')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Name', 'नाव')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Standard', 'इयत्ता')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Guardian', 'पालक')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Village', 'गाव')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Actions', 'कृती')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                        {t('No students found', 'कोणतेही विद्यार्थी सापडले नाहीत')}
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student, idx) => (
                      <tr key={student.id} className={`border-b border-slate-100/50 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/30'}`}>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{student.sr_no}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{student.full_name}</td>
                        <td className="px-4 py-2.5 text-slate-600">{student.standard}</td>
                        <td className="px-4 py-2.5 text-slate-600">{student.guardian_name}</td>
                        <td className="px-4 py-2.5 text-slate-600">{student.village}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title={t('Edit', 'संपादन')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(student)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title={t('Delete', 'हटवा')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/50" style={{ background: 'rgba(248, 250, 252, 0.6)' }}>
                <span className="text-xs text-slate-500">
                  {t(
                    `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, students.length)} of ${students.length}`,
                    `${students.length} पैकी ${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, students.length)} दर्शवित`
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-xs font-medium text-slate-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingStudent
                    ? t('Edit Student', 'विद्यार्थी संपादन')
                    : t('Add Student', 'विद्यार्थी जोडा')}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {t('Full Name', 'पूर्ण नाव')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {t('Standard', 'इयत्ता')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.standard}
                      onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                      required
                    >
                      {allStandards.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {t('Date of Birth', 'जन्मतारीख')}
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {t('Blood Group', 'रक्तगट')}
                    </label>
                    <input
                      type="text"
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {t('Mobile Number', 'मोबाईल नंबर')}
                    </label>
                    <input
                      type="text"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {t('Guardian Name', 'पालकाचे नाव')}
                    </label>
                    <input
                      type="text"
                      value={formData.guardian_name}
                      onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {t('Village', 'गाव')}
                    </label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {t('APAAR ID', 'अपार आयडी')}
                    </label>
                    <input
                      type="text"
                      value={formData.apaar_id}
                      onChange={(e) => setFormData({ ...formData, apaar_id: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {t('Cancel', 'रद्द करा')}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-md disabled:opacity-60 flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingStudent
                      ? t('Update', 'अपडेट करा')
                      : t('Add Student', 'विद्यार्थी जोडा')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {t('Confirm Delete', 'हटवण्याची पुष्टी करा')}
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                {t(
                  `Are you sure you want to delete ${deleteTarget.full_name}?`,
                  `तुम्हाला खात्री आहे की तुम्ही ${deleteTarget.full_name} हटवू इच्छिता?`
                )}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {t('Cancel', 'रद्द करा')}
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-medium bg-red-600 hover:bg-red-700 shadow-md disabled:opacity-60 flex items-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('Delete', 'हटवा')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
