import { useState } from 'react';
import { Monitor, Smartphone, Calendar, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { students } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';
import type { Standard } from '../types';

type AttendanceStatus = 'present' | 'absent' | 'late';

export default function ClassTeacherPortal() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [selectedStd, setSelectedStd] = useState<Standard>('5th');
  const [isDesktop, setIsDesktop] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [alerts, setAlerts] = useState<string[]>([]);

  const classStudents = students.filter(s => s.standard === selectedStd);
  const allStandards: Standard[] = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

  const presentCount = Object.values(attendance).filter(a => a === 'present').length;
  const absentCount = Object.values(attendance).filter(a => a === 'absent').length;
  const lateCount = Object.values(attendance).filter(a => a === 'late').length;
  const totalMarked = presentCount + absentCount + lateCount;
  const percentage = classStudents.length > 0 ? Math.round((presentCount + lateCount) / classStudents.length * 100) : 0;

  const markAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    if (status === 'absent') {
      const student = classStudents.find(s => s.id === studentId);
      if (student) {
        const alertMsg = `${t('WhatsApp alert sent to', 'व्हॉट्सअॅप सूचना पाठवली')}: ${student.parent_name} - ${student.full_name} ${t('is absent today', 'आज अनुपस्थित आहे')}`;
        setAlerts(prev => [alertMsg, ...prev.slice(0, 4)]);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
        {t('Class Teacher Portal', 'वर्गशिक्षक पोर्टल')}
      </h2>

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('Standard', 'इयत्ता')}</label>
            <select
              value={selectedStd}
              onChange={(e) => { setSelectedStd(e.target.value as Standard); setAttendance({}); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
            >
              {allStandards.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('Date', 'तारीख')}</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('Device Mode', 'डिव्हाइस मोड')}</label>
            <button
              onClick={() => setIsDesktop(!isDesktop)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isDesktop ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isDesktop ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              {isDesktop ? t('Whitelisted Desktop - Full Access', 'व्हाइटलिस्टेड डेस्कटॉप - पूर्ण प्रवेश') :
                          t('Mobile Read-Only', 'मोबाईल - फक्त वाचन')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{classStudents.length}</p>
          <p className="text-xs text-slate-500">{t('Total', 'एकूण')}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
          <p className="text-xs text-emerald-600">{t('Present', 'उपस्थित')}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{absentCount}</p>
          <p className="text-xs text-red-600">{t('Absent', 'अनुपस्थित')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{percentage}%</p>
          <p className="text-xs text-blue-600">{t('Attendance', 'उपस्थिती')}</p>
          <div className="mt-1 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>

      {/* WhatsApp Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 space-y-1"
          >
            {alerts.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-green-700"
              >
                <Bell className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {alert}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            {t(`Students - Standard ${selectedStd}`, `विद्यार्थी - इयत्ता ${selectedStd}`)}
          </span>
          <span className="text-xs text-slate-500">{totalMarked}/{classStudents.length} {t('marked', 'नोंदवले')}</span>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">{t('Name', 'नाव')}</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">{t('Gender', 'लिंग')}</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">{t('Attendance', 'उपस्थिती')}</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, idx) => {
                const status = attendance[student.id];
                return (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2 text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm">{student.full_name}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{student.gender}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => !isDesktop ? null : markAttendance(student.id, 'present')}
                          disabled={!isDesktop}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            status === 'present' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-100'
                          } ${!isDesktop ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => !isDesktop ? null : markAttendance(student.id, 'absent')}
                          disabled={!isDesktop}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            status === 'absent' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-red-100'
                          } ${!isDesktop ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => !isDesktop ? null : markAttendance(student.id, 'late')}
                          disabled={!isDesktop}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            status === 'late' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-amber-100'
                          } ${!isDesktop ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          L
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
