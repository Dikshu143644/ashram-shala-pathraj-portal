import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, Shield, Clock, User, Activity, Server, Database, Wifi, GraduationCap, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';
import AdminCrudPanel from './AdminCrudPanel';

type AdminTab = 'events' | 'audit' | 'students' | 'accounts';

interface PendingEvent {
  id: string;
  title: string;
  titleMr: string;
  date: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  module: string;
}

const initialEvents: PendingEvent[] = [
  { id: '1', title: 'Republic Day Celebration', titleMr: 'प्रजासत्ताक दिन सोहळा', date: '2025-01-26', description: 'Flag hoisting, march past, cultural programme', status: 'pending', comment: '' },
  { id: '2', title: 'Annual Sports Day', titleMr: 'वार्षिक क्रीडा दिन', date: '2025-02-15', description: 'Athletic events, team sports, prize distribution', status: 'pending', comment: '' },
  { id: '3', title: 'Parent-Teacher Meeting', titleMr: 'पालक-शिक्षक बैठक', date: '2025-01-20', description: 'Quarterly progress report discussion', status: 'pending', comment: '' },
  { id: '4', title: 'Science Exhibition', titleMr: 'विज्ञान प्रदर्शन', date: '2025-03-05', description: 'Student projects display and judging', status: 'pending', comment: '' },
  { id: '5', title: 'Tribal Culture Day', titleMr: 'आदिवासी संस्कृती दिन', date: '2025-02-20', description: 'Celebration of tribal heritage and customs', status: 'pending', comment: '' },
  { id: '6', title: 'Tree Plantation Drive', titleMr: 'वृक्षारोपण मोहीम', date: '2025-07-15', description: 'Environmental awareness and planting 100 saplings', status: 'pending', comment: '' },
  { id: '7', title: 'Independence Day', titleMr: 'स्वातंत्र्य दिन', date: '2025-08-15', description: 'Patriotic programme and flag hoisting ceremony', status: 'pending', comment: '' },
];

const auditEntries: AuditEntry[] = [
  { id: '1', timestamp: '2025-01-15 09:23:15', user: 'Admin (Web Creator)', action: 'Login successful', ipAddress: '192.168.1.100', module: 'Auth' },
  { id: '2', timestamp: '2025-01-15 09:25:30', user: 'Admin (Web Creator)', action: 'Viewed student records', ipAddress: '192.168.1.100', module: 'Students' },
  { id: '3', timestamp: '2025-01-15 09:30:00', user: 'Principal', action: 'Approved admission #ASP-2024-0342', ipAddress: '192.168.1.101', module: 'Admission' },
  { id: '4', timestamp: '2025-01-15 10:15:22', user: 'Class Teacher (5th)', action: 'Marked attendance', ipAddress: '192.168.1.55', module: 'Attendance' },
  { id: '5', timestamp: '2025-01-15 10:45:00', user: 'Clerk 1', action: 'Generated scholarship report', ipAddress: '192.168.1.102', module: 'Reports' },
  { id: '6', timestamp: '2025-01-15 11:00:12', user: 'Hostel Rector', action: 'Updated bed allotment', ipAddress: '192.168.1.60', module: 'Hostel' },
  { id: '7', timestamp: '2025-01-15 11:30:45', user: 'Admin (Web Creator)', action: 'Modified role permissions', ipAddress: '192.168.1.100', module: 'Auth' },
  { id: '8', timestamp: '2025-01-15 12:00:00', user: 'Mess Staff', action: 'Verified lunch attendance', ipAddress: '192.168.1.70', module: 'Mess' },
  { id: '9', timestamp: '2025-01-14 08:45:30', user: 'Principal', action: 'Login successful', ipAddress: '192.168.1.101', module: 'Auth' },
  { id: '10', timestamp: '2025-01-14 09:10:00', user: 'Class Teacher (8th)', action: 'Submitted exam results', ipAddress: '192.168.1.56', module: 'Exams' },
  { id: '11', timestamp: '2025-01-14 09:45:15', user: 'Admin (Web Creator)', action: 'Exported WhatsApp logs', ipAddress: '192.168.1.100', module: 'WhatsApp' },
  { id: '12', timestamp: '2025-01-14 10:20:00', user: 'Clerk 2', action: 'Updated student document', ipAddress: '192.168.1.103', module: 'Documents' },
  { id: '13', timestamp: '2025-01-14 11:00:30', user: 'Principal', action: 'Approved leave request', ipAddress: '192.168.1.101', module: 'Leave' },
  { id: '14', timestamp: '2025-01-14 14:30:00', user: 'Class Teacher (10th)', action: 'Sent parent notifications', ipAddress: '192.168.1.57', module: 'WhatsApp' },
  { id: '15', timestamp: '2025-01-14 15:00:45', user: 'Admin (Web Creator)', action: 'Backup database initiated', ipAddress: '192.168.1.100', module: 'System' },
  { id: '16', timestamp: '2025-01-13 08:00:00', user: 'Security', action: 'System startup', ipAddress: '192.168.1.1', module: 'System' },
  { id: '17', timestamp: '2025-01-13 09:00:15', user: 'Admin (Web Creator)', action: 'Login from new device', ipAddress: '192.168.2.50', module: 'Auth' },
  { id: '18', timestamp: '2025-01-13 10:30:00', user: 'Class Teacher (3rd)', action: 'Marked attendance', ipAddress: '192.168.1.54', module: 'Attendance' },
  { id: '19', timestamp: '2025-01-13 13:00:22', user: 'Hostel Rector', action: 'Sick bay entry added', ipAddress: '192.168.1.60', module: 'Health' },
  { id: '20', timestamp: '2025-01-13 14:45:00', user: 'Clerk 1', action: 'PO letter dispatched', ipAddress: '192.168.1.102', module: 'Dispatch' },
  { id: '21', timestamp: '2025-01-13 16:00:00', user: 'Principal', action: 'Event approval - Sports Day', ipAddress: '192.168.1.101', module: 'Events' },
  { id: '22', timestamp: '2025-01-12 09:30:00', user: 'Admin (Web Creator)', action: 'Updated system config', ipAddress: '192.168.1.100', module: 'System' },
];

const moduleColors: Record<string, string> = {
  Auth: 'bg-red-50 text-red-700 border-red-200',
  Students: 'bg-blue-50 text-blue-700 border-blue-200',
  Admission: 'bg-amber-50 text-amber-700 border-amber-200',
  Attendance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Reports: 'bg-purple-50 text-purple-700 border-purple-200',
  Hostel: 'bg-teal-50 text-teal-700 border-teal-200',
  Mess: 'bg-orange-50 text-orange-700 border-orange-200',
  Exams: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  WhatsApp: 'bg-green-50 text-green-700 border-green-200',
  Documents: 'bg-slate-100 text-slate-700 border-slate-200',
  Leave: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  System: 'bg-gray-100 text-gray-700 border-gray-200',
  Dispatch: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Events: 'bg-pink-50 text-pink-700 border-pink-200',
  Health: 'bg-rose-50 text-rose-700 border-rose-200',
};

const staffRoleOptions = [
  { value: 'principal', labelEn: 'Principal', labelMr: 'मुख्याध्यापक' },
  { value: 'class_teacher', labelEn: 'Class Teacher', labelMr: 'वर्गशिक्षक' },
  { value: 'clerk', labelEn: 'Clerk', labelMr: 'लिपिक' },
  { value: 'subject_teacher', labelEn: 'Subject Teacher', labelMr: 'विषय शिक्षक' },
  { value: 'web_creator', labelEn: 'Super Admin', labelMr: 'सुपर अॅडमिन' },
];

function CreateStaffAccountPanel({ language, t }: { language: string; t: (en: string, mr: string) => string }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState('class_teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) { setError(t('Full name is required.', 'पूर्ण नाव आवश्यक आहे.')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(t('A valid email is required.', 'वैध ईमेल आवश्यक आहे.')); return; }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email, mobileNumber: mobileNumber || undefined, role, nameEn: fullName.trim(), nameMr: fullName.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(t(`Account created! Username: ${data.user?.username}. Temporary password sent to email.`, `खाते तयार! वापरकर्तानाव: ${data.user?.username}. तात्पुरता पासवर्ड ईमेलवर पाठवला.`));
        setFullName('');
        setEmail('');
        setMobileNumber('');
      } else {
        setError(data.error || t('Could not create account.', 'खाते तयार करता आले नाही.'));
      }
    } catch {
      setError(t('Request failed. Please try again.', 'विनंती अयशस्वी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card-static p-6 max-w-lg">
      <h3 className="text-lg font-semibold text-[#006948] mb-4">{t('Create Staff Account', 'कर्मचारी खाते तयार करा')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Full Name', 'पूर्ण नाव')}</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('Enter full name', 'पूर्ण नाव प्रविष्ट करा')} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Email', 'ईमेल')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Mobile Number (optional)', 'मोबाईल नंबर (पर्यायी)')}</label>
          <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Role', 'भूमिका')}</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10 outline-none">
            {staffRoleOptions.map((opt) => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.labelEn : opt.labelMr}</option>)}
          </select>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</div>}

        <button type="submit" disabled={isLoading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006948] text-sm font-semibold text-white hover:bg-[#00855d] disabled:opacity-55">
          {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : <UserPlus className="h-4 w-4" />}
          {t('Create Account', 'खाते तयार करा')}
        </button>
      </form>
    </div>
  );
}

export default function SuperAdminCenter() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [activeTab, setActiveTab] = useState<AdminTab>('events');
  const [events, setEvents] = useState<PendingEvent[]>(initialEvents);

  const handleApprove = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' as const } : e));
  };

  const handleReject = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' as const } : e));
  };

  const handleCommentChange = (id: string, comment: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, comment } : e));
  };

  return (
    <motion.div
      initial={false}
      className="portal-page"
    >
      <div className="portal-heading">
        <p className="portal-kicker">{t('SYSTEM HEALTH & AUDIT', 'प्रणाली आरोग्य व ऑडिट')}</p>
        <h2 className="portal-title">{t('Security Dashboard', 'सुरक्षा डॅशबोर्ड')}</h2>
        <p className="portal-subtitle">{t('Review operational health, approvals and administrative records.', 'प्रणाली आरोग्य, मंजुरी आणि प्रशासकीय नोंदींचा आढावा घ्या.')}</p>
      </div>

      {/* System Health - Glass Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card-static p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('Server', 'सर्व्हर')}</p>
            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('Healthy', 'सक्रिय')}
            </p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card-static p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('Database', 'डेटाबेस')}</p>
            <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {t('Connected', 'कनेक्टेड')}
            </p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card-static p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('Network', 'नेटवर्क')}</p>
            <p className="text-sm font-semibold text-amber-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {t('Stable', 'स्थिर')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Tabs - Glass */}
      <div className="segmented-control">
        <button
          onClick={() => setActiveTab('events')}
          aria-pressed={activeTab === 'events'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'events' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <CheckCircle className="w-4 h-4" />
          {t('Event Approvals', 'कार्यक्रम मंजुरी')}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          aria-pressed={activeTab === 'audit'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'audit' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <Shield className="w-4 h-4" />
          {t('Audit Logs', 'ऑडिट लॉग')}
        </button>
        <button
          onClick={() => setActiveTab('students')}
          aria-pressed={activeTab === 'students'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'students' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <GraduationCap className="w-4 h-4" />
          {t('Student Management', 'विद्यार्थी व्यवस्थापन')}
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          aria-pressed={activeTab === 'accounts'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'accounts' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <UserPlus className="w-4 h-4" />
          {t('Create Account', 'खाते तयार करा')}
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="space-y-3">
          {events.map((event) => (
            <motion.div
              key={event.id}
              layout
              whileHover={{ scale: 1.01 }}
              className={`glass-card-static p-5 transition-all ${
                event.status === 'approved' ? 'border-emerald-200' :
                event.status === 'rejected' ? 'border-red-200' :
                ''
              }`}
              style={
                event.status === 'approved' ? { background: 'rgba(236, 253, 245, 0.7)' } :
                event.status === 'rejected' ? { background: 'rgba(254, 242, 242, 0.7)' } :
                {}
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {/* Timeline dot */}
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      event.status === 'approved' ? 'bg-emerald-500' :
                      event.status === 'rejected' ? 'bg-red-500' :
                      'bg-amber-400'
                    }`} />
                    <h4 className="font-semibold text-slate-800">
                      {language === 'mr' ? event.titleMr : event.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-6">
                    <span className="font-medium">{event.date}</span> - {event.description}
                  </p>
                  {event.status !== 'pending' && (
                    <span className={`inline-block mt-2 ml-6 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {event.status === 'approved' ? t('Approved', 'मंजूर') : t('Rejected', 'नाकारले')}
                    </span>
                  )}
                </div>
                {event.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(event.id)}
                      className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(event.id)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
              {event.status === 'pending' && (
                <div className="mt-3 ml-6 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={event.comment}
                    onChange={(e) => handleCommentChange(event.id, e.target.value)}
                    placeholder={t('Add comment...', 'टिप्पणी जोडा...')}
                    className="flex-1 px-3.5 py-2 border-[1.5px] border-slate-200 rounded-xl text-xs outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white/80"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="glass-card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="portal-table w-full text-sm">
              <thead style={{ background: 'rgba(248, 250, 252, 0.8)' }} className="border-b border-slate-200/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <Clock className="w-3 h-3 inline mr-1 relative -top-px" />{t('Timestamp', 'वेळ')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <User className="w-3 h-3 inline mr-1 relative -top-px" />{t('User', 'वापरकर्ता')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <Activity className="w-3 h-3 inline mr-1 relative -top-px" />{t('Action', 'कृती')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('IP Address', 'IP पत्ता')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Module', 'मॉड्यूल')}</th>
                </tr>
              </thead>
              <tbody>
                {auditEntries.map((entry, idx) => (
                  <tr key={entry.id} className={`border-b border-slate-100/50 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/30'}`}>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{entry.timestamp}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{entry.user}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{entry.action}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{entry.ipAddress}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${moduleColors[entry.module] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {entry.module}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <AdminCrudPanel />
      )}

      {activeTab === 'accounts' && (
        <CreateStaffAccountPanel language={language} t={t} />
      )}
    </motion.div>
  );
}
