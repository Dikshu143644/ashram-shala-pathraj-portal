import { useState, useEffect } from 'react';
import { Phone, Send, Clock, Users, CheckCircle, AlertCircle, Loader2, Volume2, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';

interface NotificationRecord {
  id: string;
  message: string;
  targetGroup: string;
  standard?: string;
  status: string;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  createdBy: string;
  voiceScript?: string;
}

interface HistoryResponse {
  notifications: NotificationRecord[];
  inquiries: Array<{
    id: string;
    callerNumber: string;
    inquiry: string;
    aiResponse: string;
    timestamp: string;
    language: string;
  }>;
}

type TargetGroup = 'all_parents' | 'specific_standard';

const allStandards = ['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी', '9 वी', '10 वी', '11 वी', '12 वी'];

export default function CallingAgent() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);

  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState<TargetGroup>('all_parents');
  const [standard, setStandard] = useState('5 वी');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; text: string; script?: string } | null>(null);
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/voice/history');
      if (response.ok) {
        const data: HistoryResponse = await response.json();
        setHistory(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch voice history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/voice/notify-parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          targetGroup,
          standard: targetGroup === 'specific_standard' ? standard : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult({
          success: true,
          text: `${t('Notification queued for', 'सूचना पाठवली')} ${data.notification?.totalRecipients || 0} ${t('parents', 'पालकांना')}`,
          script: data.notification?.voiceScript,
        });
        setMessage('');
        // Refresh history
        setTimeout(fetchHistory, 1000);
      } else {
        setLastResult({ success: false, text: data.error || t('Failed to send', 'पाठवणे अयशस्वी') });
      }
    } catch {
      setLastResult({ success: false, text: t('Network error. Please try again.', 'नेटवर्क त्रुटी. पुन्हा प्रयत्न करा.') });
    } finally {
      setSending(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle className="h-3 w-3" />{t('Delivered', 'वितरित')}</span>;
      case 'queued':
        return <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F2EF] px-2 py-0.5 text-xs font-medium text-[#6B6B6B]"><Clock className="h-3 w-3" />{t('Queued', 'रांगेत')}</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"><AlertCircle className="h-3 w-3" />{t('Failed', 'अयशस्वी')}</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F2EF] px-2 py-0.5 text-xs font-medium text-[#6B6B6B]"><Loader2 className="h-3 w-3 animate-spin" />{t('Processing', 'प्रक्रिया')}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="portal-page"
    >
      <div className="portal-heading">
        <p className="portal-kicker">{t('AI VOICE AGENT', 'AI व्हॉइस एजंट')}</p>
        <h2 className="portal-title">{t('Voice Notifications', 'व्हॉइस सूचना')}</h2>
        <p className="portal-subtitle">{t('Send AI-powered voice notifications to all parents at once.', 'AI-सक्षम व्हॉइस सूचना सर्व पालकांना एकाच वेळी पाठवा.')}</p>
      </div>

      {/* Compose Notification */}
      <form onSubmit={handleSend} className="glass-card-static p-5 sm:p-6 mb-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-black mb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F2EF]">
            <PhoneCall className="h-4 w-4" />
          </span>
          {t('Compose Voice Message', 'व्हॉइस संदेश तयार करा')}
        </h3>

        <div className="space-y-4">
          {/* Target Group */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#6B6B6B]">{t('Send To', 'कोणाला पाठवा')}</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTargetGroup('all_parents')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  targetGroup === 'all_parents'
                    ? 'bg-black text-white'
                    : 'border border-[#E7E7E4] bg-white text-[#6B6B6B] hover:bg-[#F3F2EF]'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {t('All Parents', 'सर्व पालक')}
              </button>
              <button
                type="button"
                onClick={() => setTargetGroup('specific_standard')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  targetGroup === 'specific_standard'
                    ? 'bg-black text-white'
                    : 'border border-[#E7E7E4] bg-white text-[#6B6B6B] hover:bg-[#F3F2EF]'
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                {t('By Standard', 'इयत्तेनुसार')}
              </button>
            </div>
          </div>

          {/* Standard selector (conditional) */}
          <AnimatePresence>
            {targetGroup === 'specific_standard' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="mb-1.5 block text-xs font-medium text-[#6B6B6B]">{t('Select Standard', 'इयत्ता निवडा')}</label>
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  className="w-full rounded-xl border border-[#E7E7E4] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5"
                >
                  {allStandards.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#6B6B6B]">{t('Message', 'संदेश')}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t(
                'E.g., PTM scheduled for Saturday 10 AM. Please attend without fail.',
                'उदा., शनिवारी सकाळी १० वाजता PTM आहे. कृपया अवश्य या.'
              )}
              className="min-h-[100px] w-full resize-none rounded-xl border border-[#E7E7E4] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-[#A3A3A3]">{message.length}/500</p>
          </div>

          {/* Info box */}
          <div className="rounded-xl border border-[#E7E7E4] bg-[#F3F2EF] p-3">
            <div className="flex items-start gap-2">
              <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6B6B6B]" />
              <p className="text-xs leading-relaxed text-[#6B6B6B]">
                {t(
                  'The AI will convert your message into a natural Marathi voice script and deliver it to parents. Calls are logged for records.',
                  'AI तुमचा संदेश नैसर्गिक मराठी व्हॉइस स्क्रिप्टमध्ये रूपांतरित करेल आणि पालकांना वितरित करेल. कॉल नोंदी ठेवल्या जातात.'
                )}
              </p>
            </div>
          </div>

          {/* Send button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!message.trim() || sending}
              className="primary-action disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? t('Sending...', 'पाठवत आहे...') : t('Send Voice Notification', 'व्हॉइस सूचना पाठवा')}
            </motion.button>
          </div>
        </div>
      </form>

      {/* Result feedback */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 rounded-xl border p-4 ${
              lastResult.success
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-sm font-medium ${lastResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                {lastResult.text}
              </p>
            </div>
            {lastResult.script && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3">
                <p className="mb-1 text-xs font-medium text-[#6B6B6B]">{t('AI Voice Script:', 'AI व्हॉइस स्क्रिप्ट:')}</p>
                <p className="text-sm text-black">{lastResult.script}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification History */}
      <div className="glass-card-static overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E7E7E4] px-5 py-3" style={{ background: 'rgba(243, 242, 239, 0.6)' }}>
          <h4 className="text-sm font-semibold text-black">{t('Recent Notifications', 'अलीकडील सूचना')}</h4>
          <button
            onClick={fetchHistory}
            className="rounded-full px-3 py-1 text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F2EF]"
          >
            {t('Refresh', 'रिफ्रेश')}
          </button>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B6B6B]" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Phone className="mb-3 h-10 w-10 text-[#E7E7E4]" />
            <p className="text-sm text-[#6B6B6B]">{t('No notifications sent yet.', 'अद्याप कोणतीही सूचना पाठवलेली नाही.')}</p>
            <p className="mt-1 text-xs text-[#A3A3A3]">{t('Compose a message above to get started.', 'सुरू करण्यासाठी वरील संदेश तयार करा.')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E7E7E4]">
            {history.map((notification) => (
              <div key={notification.id} className="px-5 py-4 transition-colors hover:bg-[#F3F2EF]/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-black">{notification.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {statusBadge(notification.status)}
                      <span className="text-xs text-[#A3A3A3]">
                        {notification.totalRecipients} {t('recipients', 'प्राप्तकर्ते')}
                      </span>
                      <span className="text-xs text-[#A3A3A3]">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
