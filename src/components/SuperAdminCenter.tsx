import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, Shield, Clock, User, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';

type AdminTab = 'events' | 'audit';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
        {t('Web Creator Control Center', 'वेब क्रिएटर नियंत्रण केंद्र')}
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
            activeTab === 'events' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {t('Event Approvals', 'कार्यक्रम मंजुरी')}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
            activeTab === 'audit' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          {t('Audit Logs', 'ऑडिट लॉग')}
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="space-y-3">
          {events.map((event) => (
            <motion.div
              key={event.id}
              layout
              className={`bg-white border rounded-xl p-4 shadow-sm ${
                event.status === 'approved' ? 'border-emerald-200 bg-emerald-50/30' :
                event.status === 'rejected' ? 'border-red-200 bg-red-50/30' :
                'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">
                    {language === 'mr' ? event.titleMr : event.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{event.date} - {event.description}</p>
                  {event.status !== 'pending' && (
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {event.status === 'approved' ? t('Approved', 'मंजूर') : t('Rejected', 'नाकारले')}
                    </span>
                  )}
                </div>
                {event.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {event.status === 'pending' && (
                <div className="mt-3 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={event.comment}
                    onChange={(e) => handleCommentChange(event.id, e.target.value)}
                    placeholder={t('Add comment...', 'टिप्पणी जोडा...')}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />{t('Timestamp', 'वेळ')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    <User className="w-3.5 h-3.5 inline mr-1" />{t('User', 'वापरकर्ता')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    <Activity className="w-3.5 h-3.5 inline mr-1" />{t('Action', 'कृती')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('IP Address', 'IP पत्ता')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Module', 'मॉड्यूल')}</th>
                </tr>
              </thead>
              <tbody>
                {auditEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{entry.timestamp}</td>
                    <td className="px-4 py-2.5 text-sm">{entry.user}</td>
                    <td className="px-4 py-2.5 text-sm">{entry.action}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{entry.ipAddress}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
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
    </motion.div>
  );
}
