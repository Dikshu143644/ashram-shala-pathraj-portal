import { useState } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { motion } from 'motion/react';
import { whatsAppLogs } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';

type HubTab = 'logs' | 'chatbot';

const statusColors: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  read: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-700',
};

const typeColors: Record<string, string> = {
  attendance: 'bg-purple-100 text-purple-700',
  fee_reminder: 'bg-amber-100 text-amber-700',
  event: 'bg-blue-100 text-blue-700',
  emergency: 'bg-red-100 text-red-700',
  general: 'bg-slate-100 text-slate-700',
};

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const initialConversation: ChatMessage[] = [
  { role: 'bot', text: 'नमस्कार! मी आश्रमशाळा पाथरज AI सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकतो?' },
  { role: 'user', text: 'दिवाळीची सुट्टी कधी आहे?' },
  { role: 'bot', text: 'दिवाळी सुट्टी: १ नोव्हेंबर ते ५ नोव्हेंबर. विद्यार्थ्यांना ३१ ऑक्टोबर संध्याकाळी सोडण्यात येईल. बस सेवा उपलब्ध असेल.' },
  { role: 'user', text: 'आजचे जेवणाचे मेनू सांगा' },
  { role: 'bot', text: 'आजचे मेनू:\n🍳 नाश्ता: पोहे, चहा, केळे\n🍛 दुपार: वरण-भात, भाजी, चपाती, पापड\n🍲 रात्र: खिचडी, दही, लोणचे\nपोषण मानकांनुसार तयार केलेले.' },
];

const botResponses = [
  'धन्यवाद! तुमची विचारणा नोंदवली आहे. कृपया 24-48 तासांत उत्तराची अपेक्षा करा.',
  'परीक्षेचे वेळापत्रक लवकरच व्हॉट्सअॅपवर पाठवले जाईल. कृपया प्रतीक्षा करा.',
  'आदिवासी शिष्यवृत्ती अर्ज ऑनलाइन भरता येतात. कार्यालयात संपर्क साधा.',
  'शाळेच्या वेळा: सकाळी 8:00 ते दुपारी 4:00. शनिवारी अर्धा दिवस.',
  'वसतिगृहात विद्यार्थ्यांचे आरोग्य तपासणी दर आठवड्याला केली जाते.',
];

export default function WhatsAppHub() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [activeTab, setActiveTab] = useState<HubTab>('logs');
  const [messages, setMessages] = useState<ChatMessage[]>(initialConversation);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = botResponses[Math.floor(Math.random() * botResponses.length)];
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={false}
      className="portal-page"
    >
      <div className="portal-heading">
        <p className="portal-kicker">{t('COMMUNICATION TRACKING', 'संवाद नोंद')}</p>
        <h2 className="portal-title">{t('WhatsApp Hub', 'व्हॉट्सअॅप केंद्र')}</h2>
        <p className="portal-subtitle">{t('Review family notifications and simulate common support conversations.', 'पालक सूचना पहा आणि सामान्य सहाय्य संभाषणांची चाचणी करा.')}</p>
      </div>

      {/* Tabs */}
      <div className="segmented-control">
        <button
          onClick={() => setActiveTab('logs')}
          aria-pressed={activeTab === 'logs'}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-semibold ${activeTab === 'logs' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <MessageSquare className="w-4 h-4" />
          {t('Dispatch Logs', 'पाठवलेल्या सूचना')}
        </button>
        <button
          onClick={() => setActiveTab('chatbot')}
          aria-pressed={activeTab === 'chatbot'}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-semibold ${activeTab === 'chatbot' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <Bot className="w-4 h-4" />
          {t('AI Chatbot', 'AI चॅटबॉट')}
        </button>
      </div>

      {activeTab === 'logs' && (
        <div className="glass-card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="portal-table w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Date', 'तारीख')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Recipient', 'प्राप्तकर्ता')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Type', 'प्रकार')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Message', 'संदेश')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t('Status', 'स्थिती')}</th>
                </tr>
              </thead>
              <tbody>
                {whatsAppLogs.slice(0, 30).map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(log.sent_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-sm">{log.recipient_name}</p>
                      <p className="text-xs text-slate-400">{log.recipient_number}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[log.message_type]}`}>
                        {log.message_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 max-w-48 truncate">{log.message_preview}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[log.status]}`}>
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
        <div className="glass-card-static flex h-[540px] flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot text-[#171d19]'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="bg-slate-100 rounded-xl px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div className="border-t border-slate-200 p-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('Type your message...', 'तुमचा संदेश टाइप करा...')}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#00855d] to-[#006948] text-white shadow-[0_8px_18px_rgba(0,105,72,.22)] transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
