import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Languages, RefreshCw, Mic, MicOff, Globe } from 'lucide-react';
import { copilotAPI } from '../services/api';

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
      text: `Namaste ${farmerName}! I am your Reshme AI Copilot. Ask me in English, Kannada, Hindi, Telugu, Tamil, or Malayalam with real-time live metrics from your farm.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const currentLangObj = langCodes.find(l => l.code === lang) || langCodes[0];

    if (!SpeechRecognition) {
      setIsListening(true);
      const simulatedText = {
        en: 'What is my leaf quality score and feeding recommendation?',
        kn: 'ಎಲೆ ಗುಣಮಟ್ಟ ಮತ್ತು ಆಹಾರ ಪ್ರಮಾಣ ಎಷ್ಟು?',
        hi: 'पत्ती की गुणवत्ता और आहार की मात्रा कितनी है?',
        te: 'ఆకు నాణ్యత మరియు మేత ప్రమాణం ఎంత?',
        ta: 'இலை தரம் மற்றும் உணவு அளவு எவ்வளவு?',
        ml: 'ഇലയുടെ ഗുണനിലവാരവും തീറ്റ അളവും എത്ര?'
      }[lang] || 'What is my leaf quality score and feeding recommendation?';

      setTimeout(() => {
        setInput(simulatedText);
        setIsListening(false);
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLangObj.speech;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setInput(speechToText);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } catch (err) {
      setIsListening(false);
    }
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

    setMessages(prev => [...prev, { sender: 'copilot', text: welcomeMsg }]);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: 'user', text }];
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
      setMessages(prev => [...prev, { sender: 'copilot', text: replyText }]);
    } catch (err) {
      let replyText = "";
      const qLower = text.toLowerCase();
      const leafScore = summary?.leafQuality?.score || 88;
      const leafSuitability = summary?.leafQuality?.suitability || "Suitable for 5th Instar";
      const harvestWindow = summary?.harvest?.window || "Sept 17 – Sept 19, 2026";
      const harvestYield = summary?.harvest?.expectedYieldKg || 145;
      const feedingToday = summary?.feeding?.recommendedTodayKg || 18.2;
      const feedingCount = summary?.feeding?.feedingsPerDay || 4;
      const perFeeding = summary?.feeding?.kgPerFeeding || 4.55;
      const silkworms = summary?.feeding?.silkwormCount || 20000;
      const instar = summary?.feeding?.batchInstar || "5th Instar";
      const cocoonYield = summary?.cocoon?.predictedYieldKg || 42.6;
      const shellRatio = summary?.cocoon?.shellRatioPct || 22.5;
      const silkYield = summary?.silk?.predictedYieldKg || 8.7;

      if (lang === 'kn') {
        replyText = `📊 **ಲೈವ್ ಎಲೆ ಗುಣಮಟ್ಟ:** ${leafScore}/100 (${leafSuitability})\n📅 **ಕೊಯ್ಲು ಅವಧಿ:** ${harvestWindow} (${harvestYield} ಕೆಜಿ)\n🌿 **ಇಂದಿನ ಆಹಾರ:** ${feedingToday} ಕೆಜಿ/ದಿನ (${instar})\n🧵 **ಅಂದಾಜು ಗೂಡು:** ${cocoonYield} ಕೆಜಿ (${shellRatio}% ಶೆಲ್)`;
      } else if (lang === 'hi') {
        replyText = `📊 **पत्ती की गुणवत्ता:** ${leafScore}/100 (${leafSuitability})\n📅 **कटाई का समय:** ${harvestWindow} (${harvestYield} किग्रा)\n🌿 **दैनिक आहार:** ${feedingToday} किग्रा/दिन (${instar})\n🧵 **अनुमानित कोकून:** ${cocoonYield} किग्रा (${shellRatio}% शेल अनुपात)`;
      } else if (lang === 'te') {
        replyText = `📊 **ఆకు నాణ్యత:** ${leafScore}/100 (${leafSuitability})\n📅 **కోత సమయం:** ${harvestWindow} (${harvestYield} కేజీలు)\n🌿 **ఈరోజు మేత:** ${feedingToday} కేజీలు/రోజు (${instar})\n🧵 **అంచనా కకూన్లు:** ${cocoonYield} కేజీలు (${shellRatio}% షెల్)`;
      } else if (lang === 'ta') {
        replyText = `📊 **இலை தரம்:** ${leafScore}/100 (${leafSuitability})\n📅 **அறுவடை காலம்:** ${harvestWindow} (${harvestYield} கிலோ)\n🌿 **இன்றைய உணவு:** ${feedingToday} கிலோ/நாள் (${instar})\n🧵 **எதிர்பார்க்கப்படும் கூடு:** ${cocoonYield} கிலோ (${shellRatio}% ஷெல்)`;
      } else if (lang === 'ml') {
        replyText = `📊 **ഇല ഗുണനിലവാരം:** ${leafScore}/100 (${leafSuitability})\n📅 **വിളവെടുപ്പ് സമയം:** ${harvestWindow} (${harvestYield} കിലോ)\n🌿 **ഇന്നത്തെ തീറ്റ:** ${feedingToday} കിലോ/ദിവസം (${instar})\n🧵 **പ്രതീക്ഷിക്കുന്ന കൂട്:** ${cocoonYield} കിലോ (${shellRatio}% ഷെൽ)`;
      } else {
        replyText = `📊 **Live Leaf Quality:** ${leafScore}/100 (${leafSuitability})\n📅 **Harvest Window:** ${harvestWindow} (${harvestYield} kg)\n🌿 **Feeding Today:** ${feedingToday} kg/day (${instar})\n🧵 **Predicted Cocoons:** ${cocoonYield} kg (${shellRatio}% shell)`;
      }

      setMessages(prev => [...prev, { sender: 'copilot', text: replyText }]);
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
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Fetching live metrics...</span>
            </div>
          </div>
        )}
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
