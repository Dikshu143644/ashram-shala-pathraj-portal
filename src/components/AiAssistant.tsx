import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, FileText, CheckSquare, Search, Home, Mic, MicOff, Volume2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  isError?: boolean;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

const quickActions = [
  { key: 'docs', labelEn: 'Document Readiness', labelMr: 'कागदपत्रे तयारी', icon: FileText },
  { key: 'eligibility', labelEn: 'Eligibility Check', labelMr: 'पात्रता तपासणी', icon: CheckSquare },
  { key: 'status', labelEn: 'Application Status', labelMr: 'अर्जाची स्थिती', icon: Search },
  { key: 'hostel', labelEn: 'Hostel Info', labelMr: 'वसतिगृह माहिती', icon: Home },
];

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  const win = window as unknown as Record<string, unknown>;
  return (win.SpeechRecognition || win.webkitSpeechRecognition) as (new () => SpeechRecognitionInstance) | null;
}

export default function AiAssistant() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: language === 'en'
      ? 'Hello! I am the Ashram Shala AI Assistant. How can I help you today? You can ask about admissions, documents, hostel, or any school-related queries.'
      : 'नमस्कार! मी आश्रमशाळा AI सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो? तुम्ही प्रवेश, कागदपत्रे, वसतिगृह किंवा कोणत्याही शाळा-संबंधित प्रश्नांबद्दल विचारू शकता.'
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasSpeechRecognition = typeof window !== 'undefined' && getSpeechRecognition() !== null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const startRecording = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = language === 'mr' ? 'mr-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [language]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const handleSpeak = useCallback(async (text: string, index: number) => {
    if (playingIndex === index) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingIndex(null);
      return;
    }

    try {
      setPlayingIndex(index);
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        setPlayingIndex(null);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingIndex(null);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setPlayingIndex(null);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
    } catch {
      setPlayingIndex(null);
    }
  }, [language, playingIndex]);

  const sendMessage = useCallback(async (messageText: string) => {
    setIsTyping(true);
    setLastFailedMessage(null);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, language }),
      });

      if (response.status === 429) {
        const rateLimitMsg = language === 'en'
          ? 'Too many requests, please try again in a minute.'
          : 'खूप विनंत्या आल्या आहेत, कृपया एका मिनिटानंतर पुन्हा प्रयत्न करा.';
        setMessages(prev => [...prev, { role: 'bot', text: rateLimitMsg }]);
      } else if (!response.ok) {
        const errorMsg = language === 'en'
          ? 'Sorry, something went wrong. Please try again.'
          : 'क्षमस्व, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.';
        setMessages(prev => [...prev, { role: 'bot', text: errorMsg, isError: true }]);
        setLastFailedMessage(messageText);
      } else {
        const data = await response.json();
        const replyText = data.response || (language === 'en'
          ? 'Sorry, I could not generate a response. Please try again.'
          : 'क्षमस्व, मी प्रतिसाद तयार करू शकलो नाही. कृपया पुन्हा प्रयत्न करा.');
        setMessages(prev => [...prev, { role: 'bot', text: replyText }]);
      }
    } catch {
      const errorMsg = language === 'en'
        ? 'Network error. Please check your connection and try again.'
        : 'नेटवर्क त्रुटी. कृपया तुमचे कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.';
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg, isError: true }]);
      setLastFailedMessage(messageText);
    }
    setIsTyping(false);
  }, [language]);

  const handleRetry = useCallback(() => {
    if (!lastFailedMessage) return;
    // Remove the last error message
    setMessages(prev => {
      const lastIdx = prev.length - 1;
      if (lastIdx >= 0 && prev[lastIdx].isError) {
        return prev.slice(0, lastIdx);
      }
      return prev;
    });
    sendMessage(lastFailedMessage);
  }, [lastFailedMessage, sendMessage]);

  const handleQuickAction = (key: string) => {
    const actionLabels: Record<string, Record<string, string>> = {
      docs: { en: 'What documents do I need for admission?', mr: 'प्रवेशासाठी कोणती कागदपत्रे आवश्यक आहेत?' },
      eligibility: { en: 'What are the eligibility criteria?', mr: 'पात्रता निकष काय आहेत?' },
      status: { en: 'How to check application status?', mr: 'अर्जाची स्थिती कशी तपासायची?' },
      hostel: { en: 'Tell me about hostel facilities', mr: 'वसतिगृह सुविधांबद्दल सांगा' },
    };

    const userMsg = actionLabels[key][language];
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    sendMessage(userMsg);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    sendMessage(userText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-4xl mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] mb-5">
        {t('AI Inquiry Assistant', 'AI चौकशी सहाय्यक')}
      </h2>

      {/* Quick Actions as gradient pill buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {quickActions.map((action) => (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            key={action.key}
            onClick={() => handleQuickAction(action.key)}
            disabled={isTyping}
            className="gradient-pill flex items-center gap-2 px-4 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <action.icon className="w-4 h-4 text-amber-600" />
            <span className="text-slate-700">{language === 'en' ? action.labelEn : action.labelMr}</span>
          </motion.button>
        ))}
      </div>

      {/* Chat Window - Glassmorphism */}
      <div className="glass-card-static overflow-hidden flex flex-col" style={{ height: '480px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.5), rgba(255, 255, 255, 0.3))' }}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}>
                  <Bot className="w-4 h-4 text-slate-900" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'user'
                    ? 'chat-bubble-user font-medium'
                    : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-bl-sm'
                      : 'chat-bubble-bot text-slate-800'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'bot' && msg.isError && idx === messages.length - 1 && lastFailedMessage && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleRetry}
                    className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {t('Retry', 'पुन्हा प्रयत्न करा')}
                  </motion.button>
                )}
                {msg.role === 'bot' && !msg.isError && idx > 0 && (
                  <button
                    onClick={() => handleSpeak(msg.text, idx)}
                    className={`self-start flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                      playingIndex === idx
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                    }`}
                    title={t('Read aloud', 'मोठ्याने वाचा')}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{playingIndex === idx ? t('Playing...', 'चालू आहे...') : t('Listen', 'ऐका')}</span>
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}>
                <Bot className="w-4 h-4 text-slate-900" />
              </div>
              <div className="chat-bubble-bot px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/30 p-4 flex items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)' }}>
          {hasSpeechRecognition && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full transition-all shadow-sm ${
                isRecording
                  ? 'text-white animate-voice-pulse'
                  : 'text-slate-600 hover:shadow-md'
              }`}
              style={isRecording
                ? { background: 'linear-gradient(135deg, #dc2626, #ef4444)' }
                : { background: 'rgba(241, 245, 249, 0.8)' }
              }
              title={isRecording ? t('Stop recording', 'रेकॉर्डिंग थांबवा') : t('Voice input', 'आवाज इनपुट')}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? t('Listening...', 'ऐकत आहे...') : t('Ask anything about admissions, school, hostel...', 'प्रवेश, शाळा, वसतिगृहाबद्दल काहीही विचारा...')}
            className="flex-1 px-4 py-3 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white/80"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-full text-white transition-all disabled:opacity-50 shadow-md"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
