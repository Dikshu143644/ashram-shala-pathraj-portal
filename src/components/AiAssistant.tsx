import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, FileText, CheckSquare, Search, Home, Mic, MicOff, Volume2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';
import { sanitizeChatMessage } from '../utils/sanitize';

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

    // Sanitize the message before sending to the API
    const sanitizedMessage = sanitizeChatMessage(messageText);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sanitizedMessage, language }),
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
      initial={false}
      className="portal-page max-w-5xl!"
    >
      {/* Header Bar */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E7E7E4]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-black">{t('AI Assistant', 'AI सहाय्यक')}</h2>
          <p className="text-xs text-[#6B6B6B]">{t('Online - Ready to assist', 'ऑनलाइन - मदतीसाठी सज्ज')}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        {quickActions.map((action) => (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            key={action.key}
            onClick={() => handleQuickAction(action.key)}
            disabled={isTyping}
            className="flex items-center gap-2.5 rounded-full border border-[#E7E7E4] bg-white px-5 py-3 text-sm font-medium shadow-sm transition-all hover:border-black/20 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <action.icon className="w-4 h-4 text-black" />
            <span className="text-black">{language === 'en' ? action.labelEn : action.labelMr}</span>
          </motion.button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="overflow-hidden rounded-2xl border border-[#E7E7E4] bg-white flex flex-col" style={{ height: '480px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F7F7F5]">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-2xl rounded-br-sm'
                    : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-bl-sm'
                      : 'bg-white border border-[#E7E7E4] text-black rounded-2xl rounded-bl-sm'
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
                        ? 'bg-black/10 text-black'
                        : 'text-[#6B6B6B] hover:text-black hover:bg-[#F3F2EF]'
                    }`}
                    title={t('Read aloud', 'मोठ्याने वाचा')}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{playingIndex === idx ? t('Playing...', 'चालू आहे...') : t('Listen', 'ऐका')}</span>
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E7E7E4] text-black">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#E7E7E4] rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#E7E7E4] p-4 flex items-center gap-3 bg-white">
          {hasSpeechRecognition && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-[#F3F2EF] text-[#6B6B6B] hover:bg-[#E7E7E4]'
              }`}
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
            className="flex-1 px-4 py-3 border border-[#E7E7E4] rounded-xl text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all bg-white"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
