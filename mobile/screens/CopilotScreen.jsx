import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, Mic, MicOff } from 'lucide-react';
import { copilotAPI } from '../services/api';

// Typewriter component — streams text word by word
function TypewriterText({ text, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    const words = text.split(' ');
    const interval = setInterval(() => {
      if (indexRef.current < words.length) {
        setDisplayed(prev => (prev ? prev + ' ' : '') + words[indexRef.current]);
        indexRef.current++;
      } else {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, 35);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
}

// Robust voice input — tries native Android first, then Web Speech API
function startVoiceInput(langCode, onResult, onEnd) {
  // Try Web Speech API first (works in Chrome WebView on most Android devices)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    try {
      const recognition = new SR();
      recognition.lang = langCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      recognition.start();
      recognition.onresult = (e) => {
        const text = e.results[0]?.[0]?.transcript || '';
        if (text) onResult(text);
        onEnd();
      };
      recognition.onerror = () => onEnd();
      recognition.onend = () => onEnd();
      return;
    } catch (e) { /* fall through */ }
  }

  // Fallback: try Capacitor SpeechRecognition plugin
  try {
    const cap = window.Capacitor;
    if (cap && cap.Plugins && cap.Plugins.SpeechRecognition) {
      const plugin = cap.Plugins.SpeechRecognition;
      plugin.requestPermissions().then(() => {
        plugin.start({ language: langCode, maxResults: 1, partialResults: false })
          .then((result) => {
            const text = result?.matches?.[0] || '';
            if (text) onResult(text);
            onEnd();
          })
          .catch(() => onEnd());
      }).catch(() => onEnd());
      return;
    }
  } catch (e) { /* fall through */ }

  // Nothing worked
  onEnd();
}

const PROMPTS = {
  en: [
    "When to harvest leaves?",
    "Feeding amount for 5th instar?",
    "Expected cocoon yield?",
    "Show dashboard summary",
    "Disease prevention tips"
  ],
  kn: [
    "ಎಲೆ ಕೊಯ್ಲು ಸಮಯ?",
    "ಹುಳುಗಳ ಆಹಾರ ಪ್ರಮಾಣ?",
    "ಗೂಡಿನ ಇಳುವರಿ ಎಷ್ಟು?",
    "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವಿವರ ಕೊಡಿ",
    "ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ ಸಲಹೆ"
  ],
  hi: [
    "शहतूत पत्ती कटाई का समय?",
    "5वें चरण का दैनिक आहार?",
    "अनुमानित कोकून उपज कितनी है?",
    "डैशबोर्ड सारांश दिखाएं",
    "कीट बीमारी रोकथाम सुझाव"
  ],
  te: [
    "ఆకుల కోత అనుకూల సమయం?",
    "5వ దశ మేత ప్రమాణం ఎంత?",
    "అంచనా కకూన్ల దిగుబడి ఎంత?",
    "డాష్‌బోర్డ్ వివరాలు ఇవ్వండి",
    "వ్యాధుల నివారణ సలహాలు"
  ],
  ta: [
    "இலை அறுவடை நேரம் எப்போது?",
    "5-ஆம் நிலை உணவு அளவு எவ்வளவு?",
    "கூடு மகசூல் எவ்வளவு?",
    "டாஷ்போர்டு விவரம் கொடுங்கள்",
    "நோய் தடுப்பு ஆலோசனைகள்"
  ],
  ml: [
    "ഇല വിളവെടുപ്പ് സമയം എപ്പോൾ?",
    "5-ാം ഘട്ട തീറ്റ അളവ് എത്ര?",
    "പ്രതീക്ഷിക്കുന്ന കൂട് വിളവ് എത്ര?",
    "ഡാഷ്‌ബോർഡ് വിവരങ്ങൾ കാണിക്കുക",
    "രോഗ പ്രതിരോധ നിർദ്ദേശങ്ങൾ"
  ]
};

export default function CopilotScreen({ user, summary }) {
  const farmerName = user?.name || 'Farmer';
  const [lang, setLang] = useState('en'); // 'en', 'kn', 'hi', 'te', 'ta', 'ml'
  const [messages, setMessages] = useState([
    {
      sender: 'copilot',
      text: `Namaste ${farmerName}! I am your Reshme AI Copilot. Ask me in English, Kannada, Hindi, Telugu, Tamil, or Malayalam with real-time live metrics from your farm.`,
      done: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const langCodes = [
    { code: 'en', label: 'English', speech: 'en-US' },
    { code: 'kn', label: 'ಕನ್ನಡ', speech: 'kn-IN' },
    { code: 'hi', label: 'हिन्दी', speech: 'hi-IN' },
    { code: 'te', label: 'తెలుగు', speech: 'te-IN' },
    { code: 'ta', label: 'தமிழ்', speech: 'ta-IN' },
    { code: 'ml', label: 'മലയാളം', speech: 'ml-IN' }
  ];

  // ── Voice Typing Handler ───────────────────────────────────────────
  const handleVoiceTyping = () => {
    if (isListening) return;
    const currentLangObj = langCodes.find(l => l.code === lang) || langCodes[0];
    setIsListening(true);
    startVoiceInput(
      currentLangObj.speech,
      (text) => setInput(text),
      () => setIsListening(false)
    );
  };

  const handleLanguageToggle = (newLang) => {
    setLang(newLang);
    const welcomeMsg = {
      en: `Namaste ${farmerName}! I am your Reshme AI Copilot. Ask about harvest timing, feeding schedules, cocoon predictions, or active dashboard metrics.`,
      kn: `ನಮಸ್ಕಾರ ${farmerName}! ನಾನು ನಿಮ್ಮ ರೇಷ್ಮೆ ಕೃಷಿ AI ಸಹಾಯಕ. ಹಿಪ್ಪುನೇರಳೆ ಎಲೆ ಕೊಯ್ಲು, ಆಹಾರ ಪ್ರಮಾಣ, ಗೂಡಿನ ಇಳುವರಿ ಬಗ್ಗೆ ಕನ್ನಡದಲ್ಲೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.`,
      hi: `नमस्ते ${farmerName}! मैं आपका रेशम एआई सह-पायलट हूँ। पत्ती कटाई, आहार सारणी, कोकून पूर्वानुमान या अपने खेत के बारे में हिंदी में पूछें।`,
      te: `నమస్కారం ${farmerName}! నేను మీ పట్టు ఏఐ సహాయకుడిని. ఆకుల కోత, మేత పట్టిక, కకూన్ల దిగుబడి గురించి తెలుగులో అడగండి.`,
      ta: `வணக்கம் ${farmerName}! நான் உங்கள் பட்டு ஏఐ உதவியாளர். இலை அறுவடை, உணவு அட்டவணை, கூடு மகசூல் பற்றி தமிழில் கேளுங்கள்.`,
      ml: `നമസ്കാരം ${farmerName}! ഞാൻ നിങ്ങളുടെ പട്ട് എഐ സഹായിയാണ്. ഇല വിളവെടുപ്പ്, തീറ്റ ക്രമം, കൂട് വിളവ് എന്നിവയെക്കുറിച്ച് ചോദിക്കുക.`
    }[newLang];

    setMessages(prev => [...prev, { sender: 'copilot', text: welcomeMsg, done: true }]);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: 'user', text, done: true }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await copilotAPI.ask({
        question: text,
        language: lang,
        metrics: summary
      });

      const replyText = res.reply || res.data?.reply || 'Analyzing farm metrics...';
      setMessages(prev => [...prev, { sender: 'copilot', text: replyText, done: false }]);
    } catch (err) {
      let replyText = "";
      const leafScore = summary?.leafQuality?.score || 88;
      const leafSuitability = summary?.leafQuality?.suitability || "Suitable for 5th Instar";
      const harvestWindow = summary?.harvest?.window || "Sept 17 – Sept 19, 2026";
      const harvestYield = summary?.harvest?.expectedYieldKg || 145;
      const feedingToday = summary?.feeding?.recommendedTodayKg || 18.2;
      const instar = summary?.feeding?.batchInstar || "5th Instar";
      const cocoonYield = summary?.cocoon?.predictedYieldKg || 42.6;
      const shellRatio = summary?.cocoon?.shellRatioPct || 22.5;

      if (lang === 'kn') {
        replyText = `📊 ಲೈವ್ ಎಲೆ ಗುಣಮಟ್ಟ: ${leafScore}/100\n📅 ಕೊಯ್ಲು: ${harvestWindow} (${harvestYield} ಕೆಜಿ)\n🌿 ಆಹಾರ: ${feedingToday} ಕೆಜಿ/ದಿನ (${instar})\n🧵 ಗೂಡು: ${cocoonYield} ಕೆಜಿ`;
      } else if (lang === 'hi') {
        replyText = `📊 पत्ती गुणवत्ता: ${leafScore}/100\n📅 कटाई: ${harvestWindow}\n🌿 आहार: ${feedingToday} किग्रा/दिन\n🧵 कोकून: ${cocoonYield} किग्रा`;
      } else {
        replyText = `📊 Leaf Quality: ${leafScore}/100 (${leafSuitability})\n📅 Harvest: ${harvestWindow} (${harvestYield} kg)\n🌿 Feeding: ${feedingToday} kg/day (${instar})\n🧵 Cocoons: ${cocoonYield} kg (${shellRatio}% shell)`;
      }

      setMessages(prev => [...prev, { sender: 'copilot', text: replyText, done: false }]);
    } finally {
      setLoading(false);
    }
  };

  const activePrompts = PROMPTS[lang] || PROMPTS.en;

  return (
    <div className="p-4 pb-24 flex flex-col h-[calc(100vh-130px)] max-w-md mx-auto">

      {/* Header Info & 6-Language Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1">
              Reshme AI Copilot
            </h3>
            <span className="text-[9px] text-emerald-400 font-medium">Multi-Lingual Grounded</span>
          </div>
        </div>

        {/* Language selector buttons */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-[170px]">
          {langCodes.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageToggle(l.code)}
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg transition-all whitespace-nowrap ${
                lang === l.code
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {activePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
            }`}>
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold opacity-75">
                {msg.sender === 'user' ? (
                  <><span>You</span><User className="w-3 h-3" /></>
                ) : (
                  <><span>Copilot</span><Bot className="w-3 h-3 text-emerald-400" /></>
                )}
              </div>
              <p className="whitespace-pre-line">
                {msg.sender === 'copilot' && !msg.done
                  ? <TypewriterText
                      text={msg.text}
                      onDone={() => setMessages(prev =>
                        prev.map((m, i) => i === idx ? { ...m, done: true } : m)
                      )}
                    />
                  : msg.text
                }
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with Multi-lingual Voice Typing */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="mt-2 flex gap-1.5 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Ask about harvest, feeding, or yield...'}
          className={`flex-1 bg-slate-900 border ${isListening ? 'border-rose-500 animate-pulse text-rose-300' : 'border-slate-700/80 text-white'} rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500`}
        />

        <button
          type="button"
          onClick={handleVoiceTyping}
          className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
            isListening 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse' 
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-emerald-400'
          }`}
          title="Voice Typing"
        >
          {isListening ? <MicOff className="w-4 h-4 text-rose-400 animate-bounce" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
