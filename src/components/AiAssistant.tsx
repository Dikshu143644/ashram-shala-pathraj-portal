import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, FileText, CheckSquare, Search, Home, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
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

const mockResponses: Record<string, Record<string, string>> = {
  docs: {
    en: 'For admission, please keep the following documents ready:\n\n1. Student Aadhaar Card\n2. Parent Aadhaar Card\n3. Caste Certificate (Tribal)\n4. School Leaving Certificate\n5. Birth Certificate\n6. Income Certificate\n7. 2 Passport Photos\n8. Bank Passbook Copy\n\nAll documents should be self-attested.',
    mr: 'प्रवेशासाठी कृपया खालील कागदपत्रे तयार ठेवा:\n\n1. विद्यार्थ्याचे आधार कार्ड\n2. पालकांचे आधार कार्ड\n3. जातीचा दाखला (आदिवासी)\n4. शाळा सोडल्याचा दाखला\n5. जन्म दाखला\n6. उत्पन्नाचा दाखला\n7. 2 पासपोर्ट फोटो\n8. बँक पासबुक प्रत\n\nसर्व कागदपत्रे स्वयंसाक्षांकित असावीत.',
  },
  eligibility: {
    en: 'Eligibility criteria for Ashram Shala admission:\n\n- Student must belong to Scheduled Tribe (ST) category\n- Age: 6-16 years for Std 1-10\n- Resident of Raigad district (preference)\n- Valid caste certificate from Tehsildar\n- Family income below Rs. 2.5 lakhs/year\n\nFor 11th-12th: Must have passed 10th from recognized board.',
    mr: 'आश्रमशाळा प्रवेश पात्रता:\n\n- विद्यार्थी अनुसूचित जमाती (ST) प्रवर्गातील असावा\n- वय: इ. 1 ली ते 10 वी साठी 6-16 वर्षे\n- रायगड जिल्ह्यातील रहिवासी (प्राधान्य)\n- तहसीलदारांचा वैध जातीचा दाखला\n- कुटुंबाचे उत्पन्न रु. 2.5 लाख/वर्ष पेक्षा कमी\n\n11वी-12वी साठी: मान्यताप्राप्त बोर्डातून 10वी उत्तीर्ण.',
  },
  status: {
    en: 'To check your application status:\n\n1. Go to Admission Portal tab\n2. Search by your Application ID (ASPS-2024-XXXXX)\n3. Or search by student name\n\nStatus stages:\n- Submitted: Application received\n- Verified: Documents checked\n- Approved: Admission confirmed\n- Enrolled: Student registered\n\nFor queries, contact school office: 02140-XXXXXX',
    mr: 'अर्जाची स्थिती तपासण्यासाठी:\n\n1. प्रवेश पोर्टल टॅबवर जा\n2. अर्ज क्रमांकाने शोधा (ASPS-2024-XXXXX)\n3. किंवा विद्यार्थ्याच्या नावाने शोधा\n\nस्थिती टप्पे:\n- सादर: अर्ज प्राप्त\n- सत्यापित: कागदपत्रे तपासली\n- मंजूर: प्रवेश निश्चित\n- नोंदणी: विद्यार्थी नोंदणीकृत\n\nशंका असल्यास शाळा कार्यालयाशी संपर्क: 02140-XXXXXX',
  },
  hostel: {
    en: 'Hostel Information:\n\n- Total capacity: 520 beds\n- Wings: Boys A, Boys B, Girls A, Girls B (130 beds each)\n- Free boarding & lodging for all tribal students\n- Meals: Breakfast (7 AM), Lunch (12:30 PM), Dinner (7:30 PM)\n- Biometric verification for meals\n- Night study hours: 8 PM - 10 PM\n- Rector supervision 24/7\n\nFacilities: Library, Sports ground, Medical room',
    mr: 'वसतिगृह माहिती:\n\n- एकूण क्षमता: 520 बेड\n- विंग: मुले A, मुले B, मुली A, मुली B (प्रत्येकी 130 बेड)\n- सर्व आदिवासी विद्यार्थ्यांसाठी मोफत निवास व भोजन\n- जेवण: नाश्ता (सकाळी 7), दुपार (12:30), रात्र (7:30)\n- जेवणासाठी बायोमेट्रिक सत्यापन\n- रात्री अभ्यास: रात्री 8 - 10\n- रेक्टर 24/7 देखरेख\n\nसुविधा: ग्रंथालय, क्रीडांगण, वैद्यकीय कक्ष',
  },
};

const generalResponses = {
  en: [
    'Thank you for your question. Let me help you with that information.',
    'I understand your concern. Here is what I can tell you about our school.',
    'That is a great question. Based on our records, here is the information.',
  ],
  mr: [
    'तुमच्या प्रश्नाबद्दल धन्यवाद. मी तुम्हाला त्या माहितीत मदत करतो.',
    'मला तुमची चिंता समजते. आमच्या शाळेबद्दल मी तुम्हाला सांगू शकतो.',
    'हा एक चांगला प्रश्न आहे. आमच्या नोंदींनुसार, ही माहिती आहे.',
  ],
};

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

  const handleQuickAction = (key: string) => {
    const actionLabels: Record<string, Record<string, string>> = {
      docs: { en: 'What documents do I need for admission?', mr: 'प्रवेशासाठी कोणती कागदपत्रे आवश्यक आहेत?' },
      eligibility: { en: 'What are the eligibility criteria?', mr: 'पात्रता निकष काय आहेत?' },
      status: { en: 'How to check application status?', mr: 'अर्जाची स्थिती कशी तपासायची?' },
      hostel: { en: 'Tell me about hostel facilities', mr: 'वसतिगृह सुविधांबद्दल सांगा' },
    };

    const userMsg = actionLabels[key][language];
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = mockResponses[key][language];
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, language }),
      });

      if (response.status === 429) {
        const rateLimitMsg = language === 'en'
          ? 'Too many requests, please try again in a minute.'
          : 'खूप विनंत्या आल्या आहेत, कृपया एका मिनिटानंतर पुन्हा प्रयत्न करा.';
        setMessages(prev => [...prev, { role: 'bot', text: rateLimitMsg }]);
      } else if (!response.ok) {
        const fallback = generalResponses[language][Math.floor(Math.random() * 3)];
        setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
      } else {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'bot', text: data.response || data.reply || generalResponses[language][Math.floor(Math.random() * 3)] }]);
      }
    } catch {
      const fallback = generalResponses[language][Math.floor(Math.random() * 3)];
      setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
    }
    setIsTyping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-4xl mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5">
        {t('AI Inquiry Assistant', 'AI चौकशी सहाय्यक')}
      </h2>

      {/* Quick Actions as pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {quickActions.map((action) => (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            key={action.key}
            onClick={() => handleQuickAction(action.key)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm"
          >
            <action.icon className="w-4 h-4 text-amber-600" />
            <span className="text-slate-700">{language === 'en' ? action.labelEn : action.labelMr}</span>
          </motion.button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: '480px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ background: 'linear-gradient(180deg, #f8fafc, #ffffff)' }}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}>
                  <Bot className="w-4 h-4 text-slate-900" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'user'
                    ? 'rounded-br-md text-slate-900'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md'
                }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #fef3c7, #fde68a)' } : {}}
                >
                  {msg.text}
                </div>
                {msg.role === 'bot' && idx > 0 && (
                  <button
                    onClick={() => handleSpeak(msg.text, idx)}
                    className={`self-start flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                      playingIndex === idx
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={t('Read aloud', 'मोठ्याने वाचा')}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{playingIndex === idx ? t('Playing...', 'चालू आहे...') : t('Listen', 'ऐका')}</span>
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}>
                <Bot className="w-4 h-4 text-slate-900" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
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
        <div className="border-t border-slate-200 p-4 flex items-center gap-3 bg-white">
          {hasSpeechRecognition && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-xl transition-all shadow-sm ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="flex-1 px-4 py-3 border-[1.5px] border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl text-white transition-all disabled:opacity-50 shadow-md"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
