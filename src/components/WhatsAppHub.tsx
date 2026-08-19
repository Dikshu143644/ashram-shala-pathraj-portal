import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { whatsAppLogs } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';

type HubTab = 'logs' | 'chatbot';

const statusColors: Record<string, string> = {
  sent: 'bg-[#F3F2EF] text-[#6B6B6B]',
  delivered: 'bg-emerald-50 text-emerald-700',
  read: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-50 text-red-700',
};

const typeColors: Record<string, string> = {
  attendance: 'bg-[#F3F2EF] text-[#000000]',
  fee_reminder: 'bg-[#F3F2EF] text-[#6B6B6B]',
  event: 'bg-[#F3F2EF] text-[#000000]',
  emergency: 'bg-red-50 text-red-700',
  general: 'bg-[#F3F2EF] text-[#6B6B6B]',
};

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const BOT_NAME = 'आश्रमशाळा पाथरज सहाय्यक';

export default function WhatsAppHub() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [activeTab, setActiveTab] = useState<HubTab>('logs');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'नमस्कार! 🙏 मी आश्रमशाळा पाथरज सहाय्यक आहे. तुमचा फोन नंबर पडताळणीनंतर मी तुम्हाला मदत करू शकतो.' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleVerify = async () => {
    if (!phoneNumber.trim()) {
      setVerifyError(t('Please enter your phone number.', 'कृपया तुमचा फोन नंबर टाका.'));
      return;
    }

    setVerifyLoading(true);
    setVerifyError('');

    try {
      const response = await fetch('/api/whatsapp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setIsVerified(true);
        setMessages([
          {
            role: 'bot',
            text: `नमस्कार! 🙏 मी ${BOT_NAME} आहे.\n\nमी तुम्हाला खालील बाबतीत मदत करू शकतो:\n• 📋 उपस्थिती माहिती\n• 📝 परीक्षा वेळापत्रक\n• 👨‍👩‍👧 पालक-शिक्षक भेट (PTM)\n• 🏠 वसतिगृह/भोजन माहिती\n• 📅 सुट्ट्या\n• 🏥 आरोग्य अपडेट्स\n• ℹ️ सामान्य शाळा माहिती\n\nआणखी काही मदत हवी असल्यास विचारा 🙏`,
          },
        ]);
      } else {
        setVerifyError(data.error || t('Verification failed.', 'पडताळणी अयशस्वी.'));
      }
    } catch {
      setVerifyError(t('Network error. Please try again.', 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/whatsapp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (response.ok && data.response) {
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            text: data.error || 'क्षमस्व, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा. आणखी काही मदत हवी असल्यास विचारा 🙏',
          },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: 'नेटवर्क त्रुटी. कृपया तुमचे इंटरनेट कनेक्शन तपासा. आणखी काही मदत हवी असल्यास विचारा 🙏',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div initial={false} className="portal-page">
      <div className="portal-heading">
        <p className="portal-kicker">{t('COMMUNICATION TRACKING', 'संवाद नोंद')}</p>
        <h2 className="portal-title">{t('WhatsApp Hub', 'व्हॉट्सअॅप केंद्र')}</h2>
        <p className="portal-subtitle">
          {t(
            'AI-powered school assistant and family notification tracking.',
            'AI-आधारित शाळा सहाय्यक आणि पालक सूचना नोंदी.',
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="segmented-control">
        <button
          onClick={() => setActiveTab('logs')}
          aria-pressed={activeTab === 'logs'}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-semibold ${activeTab === 'logs' ? 'segmented-active' : 'text-[#6B6B6B]'}`}
        >
          <MessageSquare className="w-4 h-4" />
          {t('Dispatch Logs', 'पाठवलेल्या सूचना')}
        </button>
        <button
          onClick={() => setActiveTab('chatbot')}
          aria-pressed={activeTab === 'chatbot'}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-semibold ${activeTab === 'chatbot' ? 'segmented-active' : 'text-[#6B6B6B]'}`}
        >
          <Bot className="w-4 h-4" />
          {t('AI Assistant', 'AI सहाय्यक')}
        </button>
      </div>

      {activeTab === 'logs' && (
        <div className="glass-card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="portal-table w-full text-sm">
              <thead className="bg-[#F3F2EF] border-b border-[#E7E7E4]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[#000000]">{t('Date', 'तारीख')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#000000]">{t('Recipient', 'प्राप्तकर्ता')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#000000]">{t('Type', 'प्रकार')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#000000]">{t('Message', 'संदेश')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#000000]">{t('Status', 'स्थिती')}</th>
                </tr>
              </thead>
              <tbody>
                {whatsAppLogs.slice(0, 30).map((log) => (
                  <tr key={log.id} className="border-b border-[#E7E7E4] hover:bg-[#F7F7F5]">
                    <td className="px-4 py-2.5 text-xs text-[#6B6B6B]">
                      {new Date(log.sent_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-sm text-[#000000]">{log.recipient_name}</p>
                      <p className="text-xs text-[#6B6B6B]">{log.recipient_number}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[log.message_type]}`}
                      >
                        {log.message_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#6B6B6B] max-w-48 truncate">
                      {log.message_preview}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[log.status]}`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'chatbot' && (
        <div className="rounded-2xl border border-[#E7E7E4] bg-[#FCFCFB] flex h-[560px] flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-[#E7E7E4] bg-[#F7F7F5] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#000000] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#000000]">{BOT_NAME}</p>
              <p className="text-xs text-[#6B6B6B]">
                {isVerified
                  ? t('Online - Ready to help', 'ऑनलाइन - मदतीसाठी तयार')
                  : t('Verify phone to start', 'सुरू करण्यासाठी फोन पडताळा')}
              </p>
            </div>
            {isVerified && (
              <div className="ml-auto flex items-center gap-1 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{t('Verified', 'पडताळलेले')}</span>
              </div>
            )}
          </div>

          {!isVerified ? (
            /* Phone Verification Step */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-sm space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-[#F3F2EF] flex items-center justify-center mx-auto">
                    <Phone className="w-7 h-7 text-[#000000]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#000000]">
                    {t('Phone Verification', 'फोन पडताळणी')}
                  </h3>
                  <p className="text-sm text-[#6B6B6B]">
                    {t(
                      'Enter your registered mobile number to access the AI assistant.',
                      'AI सहाय्यकाशी संवाद साधण्यासाठी तुमचा नोंदणीकृत मोबाईल नंबर टाका.',
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setVerifyError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder={t('Enter mobile number', 'मोबाईल नंबर टाका')}
                    className="w-full px-4 py-3 border border-[#E7E7E4] rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#000000]/10 focus:border-[#000000] transition-all"
                  />

                  {verifyError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{verifyError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={verifyLoading || !phoneNumber.trim()}
                    className="w-full py-3 rounded-xl bg-[#000000] text-white text-sm font-semibold transition-all hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyLoading
                      ? t('Verifying...', 'पडताळत आहे...')
                      : t('Verify & Start Chat', 'पडताळा आणि चॅट सुरू करा')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-[#000000] flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#000000] text-white'
                          : 'bg-[#F3F2EF] text-[#000000] border border-[#E7E7E4]'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-[#F3F2EF] border border-[#E7E7E4] flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-[#6B6B6B]" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 items-center">
                    <div className="w-7 h-7 rounded-full bg-[#000000] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[#F3F2EF] border border-[#E7E7E4] rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <span
                          className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[#E7E7E4] bg-[#F7F7F5] p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('Type your message...', 'तुमचा संदेश टाइप करा...')}
                  disabled={isTyping}
                  className="flex-1 px-4 py-2.5 border border-[#E7E7E4] rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#000000]/10 focus:border-[#000000] transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#000000] text-white shadow-[0_4px_12px_rgba(0,0,0,.12)] transition-all hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
