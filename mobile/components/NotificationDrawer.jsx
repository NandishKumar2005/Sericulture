import React, { useState } from 'react';
import { X, Bell, Calendar, CloudSun, Utensils, ShieldAlert, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  location = 'Kolar, Karnataka',
  onNavigate,
  lang = 'en',
  t
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('all');

  const notificationsByLang = {
    en: [
      {
        id: 1,
        category: 'harvest',
        title: 'Harvest Alert: Spinning Stage Active',
        message: 'This is the time to harvest! Batch Sep-A has reached 5th Instar Day 7. Prepare Chandrike mounting frames now for maximum cocoon silk quality.',
        time: '10 mins ago',
        unread: true,
        actionScreen: 'harvest',
        actionText: 'View Harvest Schedule'
      },
      {
        id: 2,
        category: 'feeding',
        title: 'Afternoon Feeding Reminder',
        message: 'Afternoon feeding session due at 04:00 PM. Administer 4.55 kg of fresh V1 Mulberry leaves for 20,000 silkworms.',
        time: '1 hour ago',
        unread: true,
        actionScreen: 'feeding',
        actionText: 'Log Feed'
      },
      {
        id: 3,
        category: 'weather',
        title: 'Weather Advisory: Humidity Drop',
        message: `Current humidity in ${location} is 72%. Maintain 75%-80% RH inside the rearing shed by placing wet jute gunny bags on floor.`,
        time: '3 hours ago',
        unread: false,
        actionScreen: 'dashboard',
        actionText: 'Check Climate'
      },
      {
        id: 4,
        category: 'leaf',
        title: 'Mulberry Leaf Quality Scan Available',
        message: 'Scanned leaf sample batch #89 received score 88/100 (Good Grade). Ideal for 5th Instar larvae.',
        time: 'Yesterday',
        unread: false,
        actionScreen: 'leaf',
        actionText: 'Open Leaf Scanner'
      }
    ],
    kn: [
      {
        id: 1,
        category: 'harvest',
        title: 'ಕೊಯ್ಲು ಮುನ್ನೆಚ್ಚರಿಕೆ: ಚಂದ್ರಿಕೆ ಹರಡುವ ಸಮಯ!',
        message: 'ಇದು ಗೂಡು ಕೊಯ್ಲು ಮಾಡುವ ಅಥವಾ ಚಂದ್ರಿಕೆಗಳ ಮೇಲೆ ಹುಳುಗಳನ್ನು ಹರಡುವ ಸರಿಯಾದ ಸಮಯ! ಬ್ಯಾಚ್ Sep-A 5ನೇ ಹಂತಕ್ಕೆ ತಲುಪಿದೆ.',
        time: '10 ನಿಮಿಷಗಳ ಹಿಂದೆ',
        unread: true,
        actionScreen: 'harvest',
        actionText: 'ಕೊಯ್ಲು ವೇಳಾಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ'
      },
      {
        id: 2,
        category: 'feeding',
        title: 'ಮಧ್ಯಾಹ್ನದ ಆಹಾರದ ಜ್ಞಾಪನೆ',
        message: 'ಮಧ್ಯಾಹ್ನ 04:00 ರ ಆಹಾರ ಸಮಯ ಬಂದಿದೆ. 20,000 ಹುಳುಗಳಿಗೆ 4.55 ಕೆಜಿ ತಾಜಾ V1 ಹಿಪ್ಪುನೇರಳೆ ಎಲೆಗಳನ್ನು ನೀಡಿ.',
        time: '1 ಗಂಟೆಯ ಹಿಂದೆ',
        unread: true,
        actionScreen: 'feeding',
        actionText: 'ಆಹಾರ ವಿವರ ದಾಖಲಿಸಿ'
      },
      {
        id: 3,
        category: 'weather',
        title: 'ಹವಾಮಾನ ಮುನ್ನೆಚ್ಚರಿಕೆ: ಆದ್ರತೆ ಇಳಿಕೆ',
        message: `${location} ನ ಪ್ರಸ್ತುತ ಆದ್ರತೆ 72% ಇದೆ. ಸಾಕಣೆ ಮನೆಯಲ್ಲಿ ತೇವಾಂಶ ಕಾಯ್ದುಕೊಳ್ಳಲು ಒದ್ದೆ ಗೋಣಿ ಚೀಲಗಳನ್ನು ನೆಲದ ಮೇಲೆ ಹಾಸಿ.`,
        time: '3 ಗಂಟೆಗಳ ಹಿಂದೆ',
        unread: false,
        actionScreen: 'dashboard',
        actionText: 'ಹವಾಮಾನ ವೀಕ್ಷಿಸಿ'
      },
      {
        id: 4,
        category: 'leaf',
        title: 'ಎಲೆ ಗುಣಮಟ್ಟದ ಸ್ಕ್ಯಾನ್ ವರದಿ',
        message: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಎಲೆಗಳ ಮಾದರಿಯು 88/100 (ಉತ್ತಮ ದರ್ಜೆ) ಸ್ಕೋರ್ ಪಡೆದಿದೆ. 5ನೇ ಹಂತದ ಹುಳುಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ.',
        time: 'ನಿನ್ನೆ',
        unread: false,
        actionScreen: 'leaf',
        actionText: 'ಎಲೆ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ'
      }
    ],
    hi: [
      {
        id: 1,
        category: 'harvest',
        title: 'कटाई चेतावनी: चंद्रिके पर कीट रखने का सही समय!',
        message: 'यह कोकून कटाई और चंद्रिके (Cocoon Mounts) पर रेशम कीट रखने का सही समय है! बैच Sep-A 5वें चरण के अंतिम दिन पर है।',
        time: '10 मिनट पहले',
        unread: true,
        actionScreen: 'harvest',
        actionText: 'कटाई अनुसूची देखें'
      },
      {
        id: 2,
        category: 'feeding',
        title: 'अपराह्न आहार अनुस्मारक',
        message: 'अपराह्न 04:00 बजे का आहार समय हो गया है। 20,000 रेशम कीटों के लिए 4.55 किग्रा ताजी शहतूत पत्तियां दें।',
        time: '1 घंटे पहले',
        unread: true,
        actionScreen: 'feeding',
        actionText: 'आहार दर्ज करें'
      },
      {
        id: 3,
        category: 'weather',
        title: 'मौसम चेतावनी: आर्द्रता में गिरावट',
        message: `${location} में वर्तमान आर्द्रता 72% है। कीट पालन गृह में आर्द्रता 75%-80% बनाए रखने के लिए गीले टाट के बोरे बिछाएं।`,
        time: '3 घंटे पहले',
        unread: false,
        actionScreen: 'dashboard',
        actionText: 'मौसम देखें'
      },
      {
        id: 4,
        category: 'leaf',
        title: 'शहतूत पत्ती स्कैन रिपोर्ट',
        message: 'स्कैन की गई पत्तियों को 88/100 (उत्कृष्ट श्रेणी) स्कोर मिला है। 5वें चरण के कीटों के लिए पूरी तरह उपयुक्त।',
        time: 'कल',
        unread: false,
        actionScreen: 'leaf',
        actionText: 'स्कैनर खोलें'
      }
    ],
    te: [
      {
        id: 1,
        category: 'harvest',
        title: 'కోత హెచ్చరిక: చంద్రికలపై పురుగులు ఉంచే సమయం!',
        message: 'ఇది పట్టు కకూన్లు కోసే లేదా చంద్రికలపై పురుగులను చల్లే సరైన సమయం! బ్యాచ్ Sep-A 5వ దశ ముగింపుకు చేరింది.',
        time: '10 నిమిషాల క్రితం',
        unread: true,
        actionScreen: 'harvest',
        actionText: 'కోత షెడ్యూల్ చూడండి'
      },
      {
        id: 2,
        category: 'feeding',
        title: 'సాయంత్రపు మేత రిమైండర్',
        message: 'సాయంత్రం 04:00 గంటల మేత సమయం అయింది. 20,000 పురుగులకు 4.55 కేజీల తాజా మల్బరీ ఆకులను అందించండి.',
        time: '1 గంట క్రితం',
        unread: true,
        actionScreen: 'feeding',
        actionText: 'మేత నమోదు చేయండి'
      },
      {
        id: 3,
        category: 'weather',
        title: 'వాతావరణ హెచ్చరిక: తేమ తగ్గింపు',
        message: `${location} లో ప్రస్తుతం తేమ 72% ఉంది. పురుగుల షెడ్డులో తేమను కాపాడుకోవడానికి తడి గోనె సంచులను పరవండి.`,
        time: '3 గంటల క్రితం',
        unread: false,
        actionScreen: 'dashboard',
        actionText: 'వాతావరణం చూడండి'
      },
      {
        id: 4,
        category: 'leaf',
        title: 'ఆకు నాణ్యత స్కాన్ నివేదిక',
        message: 'స్కాన్ చేసిన ఆకులకు 88/100 (ఉత్తమ గ్రేడ్) స్కోరు వచ్చింది. 5వ దశ పురుగులకు అనుకూలం.',
        time: 'నిన్న',
        unread: false,
        actionScreen: 'leaf',
        actionText: 'స్కాన్ తెరవండి'
      }
    ],
    ta: [
      {
        id: 1,
        category: 'harvest',
        title: 'அறுவடை எச்சரிக்கை: கூடுகள் அறுவடை செய்ய சரியான நேரம்!',
        message: 'இது கூடுகளை அறுவடை செய்ய அல்லது சந்திரிகைகளில் புழுக்களை வைக்க சரியான நேரம்! பேட்ச் Sep-A 5-ஆம் நிலையை அடைந்துள்ளது.',
        time: '10 நிமிடங்களுக்கு முன்',
        unread: true,
        actionScreen: 'harvest',
        actionText: 'அறுவடை அட்டவணையை காண்க'
      },
      {
        id: 2,
        category: 'feeding',
        title: 'மாலை உணவு நினைவூட்டல்',
        message: 'மாலை 04:00 மணி உணவு நேரம் வந்துவிட்டது. 20,000 பட்டுப்புழுக்களுக்கு 4.55 கிலோ புதிய மல்பெரி இலைகளை வழங்கவும்.',
        time: '1 மணி நேரத்திற்கு முன்',
        unread: true,
        actionScreen: 'feeding',
        actionText: 'உணவு பதிவு செய்க'
      },
      {
        id: 3,
        category: 'weather',
        title: 'வானிலை எச்சரிக்கை: ஈரப்பதம் குறைவு',
        message: `${location} இல் தற்போதைய ஈரப்பதம் 72% ஆகும். புழு வளர்ப்பு அறையில் ஈரப்பதத்தை பராமரிக்க ஈர சாக்குகளை விரிக்கவும்.`,
        time: '3 மணி நேரத்திற்கு முன்',
        unread: false,
        actionScreen: 'dashboard',
        actionText: 'வானிலை பார்க்க'
      },
      {
        id: 4,
        category: 'leaf',
        title: 'இலை தர ஸ்கேன் அறிக்கை',
        message: 'ஸ்கேன் செய்யப்பட்ட இலைகளுக்கு 88/100 (நல்ல தரம்) மதிப்பெண் கிடைத்துள்ளது. 5-ஆம் நிலை புழுக்களுக்கு ஏற்றது.',
        time: 'நேற்று',
        unread: false,
        actionScreen: 'leaf',
        actionText: 'ஸ்கேனரை திறக்கவும்'
      }
    ],
    ml: [
      {
        id: 1,
        category: 'harvest',
        title: 'വിളവെടുപ്പ് മുന്നറിയിപ്പ്: കൂട് വിളവെടുക്കാൻ സമയമായി!',
        message: 'ഇത് കൂട് വിളവെടുക്കാനും ചന്ദ്രികകളിൽ പുഴുക്കളെ മാറ്റാനുമുള്ള ശരിയായ സമയമാണ്! ബാച്ച് Sep-A 5-ാം ഘട്ടത്തിലെത്തി.',
        time: '10 മിനിറ്റ് മുമ്പ്',
        unread: true,
        actionScreen: 'harvest',
        actionText: 'വിളവെടുപ്പ് ഷെഡ്യൂൾ കാണുക'
      },
      {
        id: 2,
        category: 'feeding',
        title: 'വൈകുന്നേരത്തെ തീറ്റ ഓർമ്മപ്പെടുത്തൽ',
        message: 'വൈകുന്നേരം 04:00 മണിയുടെ തീറ്റ സമയമായി. 20,000 പുഴുക്കൾക്ക് 4.55 കിലോ പുതിയ മൾബറി ഇല നൽകുക.',
        time: '1 മണിക്കൂർ മുമ്പ്',
        unread: true,
        actionScreen: 'feeding',
        actionText: 'തീറ്റ രേഖപ്പെടുത്തുക'
      },
      {
        id: 3,
        category: 'weather',
        title: 'കാലാവസ്ഥ മുന്നറിയിപ്പ്: ഈർപ്പം കുറഞ്ഞു',
        message: `${location} ൽ നിലവിലെ ഈർപ്പം 72% ആണ്. വളർത്തൽ മുറിയിൽ ഈർപ്പം നിലനിർത്താൻ നനഞ്ഞ ചാക്കുകൾ വിരിക്കുക.`,
        time: '3 മണിക്കൂർ മുമ്പ്',
        unread: false,
        actionScreen: 'dashboard',
        actionText: 'കാലാവസ്ഥ പരിശോധിക്കുക'
      },
      {
        id: 4,
        category: 'leaf',
        title: 'ഇല ഗുണനിലവാര റിപ്പോർട്ട്',
        message: 'സ്കാൻ ചെയ്ത ഇലകൾക്ക് 88/100 (നല്ല തരം) സ്കോർ ലഭിച്ചു. 5-ാം ഘട്ട പുഴുക്കൾക്ക് അനുയോജ്യം.',
        time: 'ഇന്നലെ',
        unread: false,
        actionScreen: 'leaf',
        actionText: 'സ്കാനർ തുറക്കുക'
      }
    ]
  };

  const list = notificationsByLang[lang] || notificationsByLang.en;

  const filtered = activeTab === 'all'
    ? list
    : list.filter(n => n.category === activeTab);

  const getIcon = (cat) => {
    switch(cat) {
      case 'harvest': return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'feeding': return <Utensils className="w-4 h-4 text-cyan-400" />;
      case 'weather': return <CloudSun className="w-4 h-4 text-sky-400" />;
      default: return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const drawerTitle = {
    en: 'Notification Center',
    kn: 'ಸೂಚನೆಗಳ ಕೇಂದ್ರ',
    hi: 'सूचना केंद्र',
    te: 'నోటిఫికేషన్ సెంటర్',
    ta: 'அறிவிப்பு மையம்',
    ml: 'അറിയിപ്പ് കേന്ദ്രം'
  }[lang] || 'Notification Center';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-fadeIn">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-sm h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{drawerTitle}</h3>
              <p className="text-[10px] text-emerald-400 font-semibold">{list.filter(n => n.unread).length} Unread Alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-2 border-b border-slate-800 bg-slate-900/90 flex gap-1 overflow-x-auto scrollbar-none">
          {['all', 'harvest', 'feeding', 'weather', 'leaf'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === cat
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all ${
                item.unread
                  ? 'bg-slate-950 border-amber-500/40 shadow-md'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                    {getIcon(item.category)}
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                </div>
                <span className="text-[9px] text-slate-500 whitespace-nowrap">{item.time}</span>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.message}</p>

              {item.actionScreen && (
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate(item.actionScreen);
                  }}
                  className="mt-2.5 w-full bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-[11px] font-bold py-1.5 px-3 rounded-xl border border-slate-700 flex items-center justify-between transition-all"
                >
                  <span>{item.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
