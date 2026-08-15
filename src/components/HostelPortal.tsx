import { useState } from 'react';
import { BedDouble, Utensils, Stethoscope, Fingerprint, Send, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { hostelBeds, hostelRooms, students, messRecords } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';
import type { HostelWing } from '../types';

type HostelTab = 'rooms' | 'mess' | 'sickbay';

const wingColors: Record<HostelWing, { occupied: string; empty: string; label: string }> = {
  'Boys A': { occupied: 'bg-blue-500', empty: 'bg-blue-100', label: 'Blue' },
  'Boys B': { occupied: 'bg-teal-500', empty: 'bg-teal-100', label: 'Teal' },
  'Girls A': { occupied: 'bg-pink-500', empty: 'bg-pink-100', label: 'Pink' },
  'Girls B': { occupied: 'bg-purple-500', empty: 'bg-purple-100', label: 'Purple' },
};

export default function HostelPortal() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [activeTab, setActiveTab] = useState<HostelTab>('rooms');

  const tabs: { key: HostelTab; label: string; icon: typeof BedDouble }[] = [
    { key: 'rooms', label: t('Room Allotment', 'खोली वाटप'), icon: BedDouble },
    { key: 'mess', label: t('Mess Counter', 'भोजनालय काउंटर'), icon: Utensils },
    { key: 'sickbay', label: t('Sick Bay', 'आरोग्य कक्ष'), icon: Stethoscope },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5">
        {t('Hostel, Mess & Sick Bay', 'वसतिगृह, भोजनालय व आरोग्य कक्ष')}
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.key ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'rooms' && <RoomAllotment language={language} t={t} />}
      {activeTab === 'mess' && <MessCounter language={language} t={t} />}
      {activeTab === 'sickbay' && <SickBay language={language} t={t} />}
    </motion.div>
  );
}

function RoomAllotment({ t }: { language: string; t: (en: string, mr: string) => string }) {
  const [selectedWing, setSelectedWing] = useState<HostelWing>('Boys A');
  const [selectedBedStudent, setSelectedBedStudent] = useState<string | null>(null);

  const wings: HostelWing[] = ['Boys A', 'Boys B', 'Girls A', 'Girls B'];
  const wingBeds = hostelBeds.filter(b => {
    const room = hostelRooms.find(r => r.id === b.room_id);
    return room?.wing === selectedWing;
  });

  const occupiedCount = wingBeds.filter(b => b.status === 'occupied').length;
  const vacantCount = wingBeds.filter(b => b.status === 'vacant').length;
  const maintCount = wingBeds.filter(b => b.status === 'maintenance').length;

  const selectedStudent = selectedBedStudent
    ? students.find(s => s.id === selectedBedStudent)
    : null;

  const colors = wingColors[selectedWing];

  return (
    <div>
      {/* Wing Selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {wings.map(w => {
          const wc = wingColors[w];
          return (
            <button
              key={w}
              onClick={() => { setSelectedWing(w); setSelectedBedStudent(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedWing === w
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              style={selectedWing === w ? { backgroundColor: wc.occupied.includes('blue') ? '#3b82f6' : wc.occupied.includes('teal') ? '#14b8a6' : wc.occupied.includes('pink') ? '#ec4899' : '#8b5cf6', borderColor: 'transparent' } : {}}
            >
              {w}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-2xl font-bold text-emerald-700">{occupiedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t('Occupied', 'व्यापलेले')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm border-l-4 border-l-slate-400">
          <p className="text-2xl font-bold text-slate-600">{vacantCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t('Vacant', 'रिक्त')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm border-l-4 border-l-red-500">
          <p className="text-2xl font-bold text-red-600">{maintCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t('Maintenance', 'देखभाल')}</p>
        </div>
      </div>

      {/* Bed Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {wingBeds.slice(0, 120).map((bed) => (
            <button
              key={bed.id}
              onClick={() => bed.student_id ? setSelectedBedStudent(bed.student_id) : null}
              title={`Bed ${bed.bed_number} - ${bed.status}`}
              className={`w-6 h-6 rounded-md transition-all hover:scale-125 hover:shadow-md ${
                bed.status === 'occupied' ? `${colors.occupied} cursor-pointer` :
                bed.status === 'maintenance' ? 'bg-red-300' : `${colors.empty}`
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-5 mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5"><span className={`w-3.5 h-3.5 rounded-md ${colors.occupied}`} />{t('Occupied', 'व्यापलेले')}</span>
          <span className="flex items-center gap-1.5"><span className={`w-3.5 h-3.5 rounded-md ${colors.empty}`} />{t('Vacant', 'रिक्त')}</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-red-300" />{t('Maintenance', 'देखभाल')}</span>
        </div>
      </div>

      {/* Student Detail */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm"
        >
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <BedDouble className="w-4 h-4" />
            {t('Student Details', 'विद्यार्थी माहिती')}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><span className="text-blue-600 font-medium">{t('Name:', 'नाव:')}</span> {selectedStudent.full_name}</p>
            <p><span className="text-blue-600 font-medium">{t('Standard:', 'इयत्ता:')}</span> {selectedStudent.standard}</p>
            <p><span className="text-blue-600 font-medium">{t('Guardian:', 'पालक:')}</span> {selectedStudent.guardian_name}</p>
            <p><span className="text-blue-600 font-medium">{t('Village:', 'गाव:')}</span> {selectedStudent.village}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MessCounter({ t }: { language: string; t: (en: string, mr: string) => string }) {
  const [verifiedCounts, setVerifiedCounts] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [verifying, setVerifying] = useState<string | null>(null);
  const [lastVerified, setLastVerified] = useState<string | null>(null);

  const totalStudents = students.length;

  const todayRecords = messRecords.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const breakfastCount = todayRecords.filter(r => r.meal_type === 'breakfast' && r.verified).length + verifiedCounts.breakfast;
  const lunchCount = todayRecords.filter(r => r.meal_type === 'lunch' && r.verified).length + verifiedCounts.lunch;
  const dinnerCount = todayRecords.filter(r => r.meal_type === 'dinner' && r.verified).length + verifiedCounts.dinner;

  const handleVerify = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    setVerifying(meal);
    setLastVerified(null);
    setTimeout(() => {
      setVerifiedCounts(prev => ({ ...prev, [meal]: prev[meal] + 1 }));
      setVerifying(null);
      setLastVerified(meal);
      setTimeout(() => setLastVerified(null), 2000);
    }, 1500);
  };

  const meals = [
    { key: 'breakfast' as const, label: t('Breakfast', 'नाश्ता'), time: '7:00 AM', count: breakfastCount, emoji: '🍳' },
    { key: 'lunch' as const, label: t('Lunch', 'दुपारचे जेवण'), time: '12:30 PM', count: lunchCount, emoji: '🍛' },
    { key: 'dinner' as const, label: t('Dinner', 'रात्रीचे जेवण'), time: '7:30 PM', count: dinnerCount, emoji: '🍲' },
  ];

  return (
    <div className="space-y-4">
      {/* Meal summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {meals.map(meal => (
          <div key={meal.key} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
            <span className="text-2xl">{meal.emoji}</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{meal.count}</p>
            <p className="text-[10px] text-slate-500">{meal.label}</p>
          </div>
        ))}
      </div>

      {meals.map((meal) => (
        <div key={meal.key} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{meal.emoji}</span>
              <div>
                <h4 className="font-semibold text-slate-800">{meal.label}</h4>
                <p className="text-xs text-slate-400">{meal.time}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleVerify(meal.key)}
              disabled={verifying !== null}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                verifying === meal.key ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                lastVerified === meal.key ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'text-white'
              }`}
              style={verifying !== meal.key && lastVerified !== meal.key ? { background: 'linear-gradient(135deg, #1e293b, #334155)' } : {}}
            >
              {verifying === meal.key ? (
                <Fingerprint className="w-4 h-4 animate-pulse" />
              ) : lastVerified === meal.key ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Fingerprint className="w-4 h-4" />
              )}
              {verifying === meal.key ? t('Verifying...', 'सत्यापित करत आहे...') :
               lastVerified === meal.key ? t('Verified!', 'सत्यापित!') :
               t('Verify Student', 'विद्यार्थी सत्यापित करा')}
            </motion.button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #059669, #14b8a6)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (meal.count / totalStudents) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-mono font-medium text-slate-700 min-w-[5rem] text-right">{meal.count}/{totalStudents}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SickBay({ t }: { language: string; t: (en: string, mr: string) => string }) {
  const [entries, setEntries] = useState<Array<{ name: string; complaint: string; medication: string; severity: string; time: string }>>([
    { name: 'राहुल वाघमारे', complaint: 'Fever & headache', medication: 'Paracetamol 500mg', severity: 'moderate', time: '09:30 AM' },
    { name: 'प्रिया भोईर', complaint: 'Stomach pain', medication: 'Antacid syrup', severity: 'mild', time: '11:00 AM' },
    { name: 'सूरज पाटील', complaint: 'Injury during sports', medication: 'Dressing & bandage', severity: 'moderate', time: '02:15 PM' },
  ]);
  const [form, setForm] = useState({ name: '', complaint: '', medication: '', severity: 'mild' });
  const [notifyParent, setNotifyParent] = useState(true);
  const [nameQuery, setNameQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(nameQuery.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.complaint) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setEntries(prev => [{ ...form, time }, ...prev]);
    setForm({ name: '', complaint: '', medication: '', severity: 'mild' });
    setNameQuery('');
  };

  const severityColors: Record<string, string> = {
    mild: 'bg-green-50 text-green-700 border-green-200',
    moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    severe: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-5">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          {t('New Sick Bay Entry', 'नवीन आरोग्य नोंद')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Student Name', 'विद्यार्थ्याचे नाव')}</label>
            <input
              type="text"
              value={nameQuery}
              onChange={(e) => { setNameQuery(e.target.value); setForm({ ...form, name: e.target.value }); setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              placeholder={t('Type to search...', 'शोधण्यासाठी टाइप करा...')}
            />
            {showSuggestions && nameQuery && filteredStudents.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 bg-white border border-slate-200 rounded-xl mt-1 shadow-lg max-h-32 overflow-y-auto">
                {filteredStudents.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setNameQuery(s.full_name); setForm({ ...form, name: s.full_name }); setShowSuggestions(false); }}
                    className="block w-full text-left px-3.5 py-2 text-sm hover:bg-amber-50 transition-colors"
                  >
                    {s.full_name} <span className="text-slate-400">({s.standard})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Complaint', 'तक्रार')}</label>
            <input
              type="text"
              value={form.complaint}
              onChange={(e) => setForm({ ...form, complaint: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Medication', 'औषधोपचार')}</label>
            <input
              type="text"
              value={form.medication}
              onChange={(e) => setForm({ ...form, medication: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t('Severity', 'तीव्रता')}</label>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            >
              <option value="mild">{t('Mild', 'सौम्य')}</option>
              <option value="moderate">{t('Moderate', 'मध्यम')}</option>
              <option value="severe">{t('Severe', 'तीव्र')}</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyParent}
              onChange={(e) => setNotifyParent(e.target.checked)}
              className="rounded"
            />
            <Send className="w-3.5 h-3.5 text-green-600" />
            {t('Notify parent via WhatsApp', 'व्हॉट्सअॅपद्वारे पालकांना सूचित करा')}
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
          >
            {t('Add Entry', 'नोंद करा')}
          </motion.button>
        </div>
      </form>

      {/* Recent Entries */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700">{t('Recent Entries', 'अलीकडील नोंदी')}</h4>
        </div>
        <div className="divide-y divide-slate-100">
          {entries.map((entry, idx) => (
            <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-800">{entry.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{entry.complaint} - {entry.medication}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${severityColors[entry.severity]}`}>
                  {entry.severity}
                </span>
                <p className="text-xs text-slate-400 font-mono">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
