import { useState } from 'react';
import { Monitor, Smartphone, Calendar, Bell, Users, UserCheck, UserX, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { students } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';
import type { Standard } from '../types';
import StatsCard from './StatsCard';

type AttendanceStatus = 'present' | 'absent' | 'late';

export default function ClassTeacherPortal() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [selectedStd, setSelectedStd] = useState<Standard>('5 वी');
  const [isDesktop, setIsDesktop] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [alerts, setAlerts] = useState<string[]>([]);

  const classStudents = students.filter(s => s.standard === selectedStd);
  const allStandards: Standard[] = ['1 ली','2 री','3 री','4 थी','5 वी','6 वी','7 वी','8 वी','9 वी','10 वी','11 वी','12 वी'];

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
        const alertMsg = `${t('WhatsApp alert sent to', 'व्हॉट्सअॅप सूचना पाठवली')}: ${student.guardian_name} - ${student.full_name} ${t('is absent today', 'आज अनुपस्थित आहे')}`;
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
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a]">
          {t('Class Teacher Portal', 'वर्गशिक्षक पोर्टल')}
        </h2>
        {/* Device Mode Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
          isDesktop ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {isDesktop ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          {isDesktop ? t('FULL_EDIT', 'पूर्ण संपादन') : t('READ_ONLY', 'फक्त वाचन')}
        </div>
      </div>

      {/* Controls - Glassmorphism */}
      <div className="glass-card-static p-4 mb-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Standard', 'इयत्ता')}</label>
            <select
              value={selectedStd}
              onChange={(e) => { setSelectedStd(e.target.value as Standard); setAttendance({}); }}
              className="px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white/80"
            >
              {allStandards.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Date', 'तारीख')}</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white/80"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Device Mode', 'डिव्हाइस मोड')}</label>
            <button
              onClick={() => setIsDesktop(!isDesktop)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isDesktop ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isDesktop ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              {isDesktop ? t('Whitelisted Desktop', 'व्हाइटलिस्टेड डेस्कटॉप') :
                          t('Mobile Read-Only', 'मोबाईल - फक्त वाचन')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary - Gradient Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatsCard
          icon={Users}
          label="Total Students"
          labelMr="एकूण विद्यार्थी"
          value={classStudents.length}
          variant="navy"
          language={language}
        />
        <StatsCard
          icon={UserCheck}
          label="Present"
          labelMr="उपस्थित"
          value={presentCount}
          variant="emerald"
          language={language}
        />
        <StatsCard
          icon={UserX}
          label="Absent"
          labelMr="अनुपस्थित"
          value={absentCount}
          variant="danger"
          language={language}
        />
        <StatsCard
          icon={Percent}
          label="Attendance %"
          labelMr="उपस्थिती %"
          value={`${percentage}%`}
          variant="gold"
          language={language}
        />
      </div>

      {/* WhatsApp Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 space-y-1.5"
          >
            {alerts.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card-static px-4 py-2.5 flex items-center gap-2 text-xs text-green-700" style={{ background: 'rgba(236, 253, 245, 0.8)', borderRadius: '0.75rem' }}
              >
                <Bell className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {alert}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Grid - Glassmorphism */}
      <div className="glass-card-static overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200/50 flex items-center justify-between" style={{ background: 'rgba(248, 250, 252, 0.6)' }}>
          <span className="text-sm font-semibold text-slate-700">
            {t(`Students - Standard ${selectedStd}`, `विद्यार्थी - इयत्ता ${selectedStd}`)}
          </span>
          <span className="text-xs text-slate-500 font-medium bg-white/60 px-2.5 py-1 rounded-full">
            {totalMarked}/{classStudents.length} {t('marked', 'नोंदवले')}
          </span>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ background: 'rgba(248, 250, 252, 0.9)', backdropFilter: 'blur(8px)' }}>
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">{t('Name', 'नाव')}</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">{t('Village', 'गाव')}</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase">{t('Attendance', 'उपस्थिती')}</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, idx) => {
                const status = attendance[student.id];
                return (
                  <tr key={student.id} className={`border-b border-slate-100/50 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/30'}`}>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{student.full_name}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{student.village}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => !isDesktop ? null : markAttendance(student.id, 'present')}
                          disabled={!isDesktop}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            status === 'present' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'
                          } ${!isDesktop ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          style={status === 'present' ? { boxShadow: '0 0 12px rgba(5, 150, 105, 0.4)' } : {}}
                        >
                          P
                        </button>
                        <button
                          onClick={() => !isDesktop ? null : markAttendance(student.id, 'absent')}
                          disabled={!isDesktop}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            status === 'absent' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-700'
                          } ${!isDesktop ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          style={status === 'absent' ? { boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)' } : {}}
                        >
                          A
                        </button>
                        <button
                          onClick={() => !isDesktop ? null : markAttendance(student.id, 'late')}
                          disabled={!isDesktop}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            status === 'late' ? 'bg-amber-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-700'
                          } ${!isDesktop ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          style={status === 'late' ? { boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)' } : {}}
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
