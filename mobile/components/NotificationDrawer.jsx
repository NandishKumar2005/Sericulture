import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, CloudSun, Utensils, ShieldAlert, CheckCircle2, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import { notificationsAPI } from '../services/api';

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  location = 'Karnataka, India',
  onNavigate,
  lang = 'en',
  t
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await notificationsAPI.getAll(location);
        const list = res.data || res || [];
        if (isMounted) setNotifications(list);
      } catch (err) {
        console.warn('Could not fetch notifications:', err.message);
        if (isMounted) setNotifications([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();
    return () => { isMounted = false; };
  }, [isOpen, location]);

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter(n => (n.type || n.category) === activeTab);

  const getIcon = (cat) => {
    switch(cat) {
      case 'harvest_reminder':
      case 'harvest': return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'feeding_reminder':
      case 'feeding': return <Utensils className="w-4 h-4 text-cyan-400" />;
      case 'prediction_alert':
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

  const emptyText = {
    en: 'No New Notifications',
    kn: 'ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ',
    hi: 'कोई नई सूचना नहीं',
    te: 'కొత్త నోటిఫికేషన్‌లు లేవు',
    ta: 'புதிய அறிவிப்புகள் இல்லை',
    ml: 'പുതിയ അറിയിപ്പുകളൊന്നുമില്ല'
  }[lang] || 'No New Notifications';

  const emptySubtext = {
    en: 'Real-time alerts for harvest, feeding, and weather will appear here once active batches are running.',
    kn: 'ಸಕ್ರಿಯ ಬೆಳೆ ಬ್ಯಾಚ್‌ಗಳನ್ನು ಪ್ರಾರಂಭಿಸಿದ ನಂತರ ಕೊಯ್ಲು, ಆಹಾರ ಮತ್ತು ಹವಾಮಾನದ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
    hi: 'सक्रिय बैच शुरू होने के बाद कटाई, आहार और मौसम संबंधी अलर्ट यहाँ दिखाई देंगे।',
    te: 'యాక్టివ్ బ్యాచ్‌లు ప్రారంభమైన తర్వాత కోత, మేత మరియు వాతావరణ అలర్టులు ఇక్కడ కనిపిస్తాయి.',
    ta: 'செயலில் உள்ள பேட்ச்கள் தொடங்கப்பட்ட பின் அறுவடை, உணவு மற்றும் வானிலை அறிவிப்புகள் இங்கு தோன்றும்.',
    ml: 'ആക്ടീവ് ബാച്ചുകൾ ആരംഭിച്ച ശേഷം വിളവെടുപ്പ്, തീറ്റ, കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ ഇവിടെ കാണപ്പെടും.'
  }[lang] || 'Real-time alerts will appear here as you run your farm operations.';

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
              <p className="text-[10px] text-emerald-400 font-semibold">{notifications.filter(n => !n.read).length} Unread Alerts</p>
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
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === cat
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notifications List or Loading / Empty state */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {loading ? (
            <div className="p-8 text-center text-slate-400 space-y-2 flex flex-col items-center justify-center h-48">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs font-semibold">Loading real-time alerts...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center h-64 border border-dashed border-slate-800 rounded-2xl my-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-white">{emptyText}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">{emptySubtext}</p>
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                className={`p-3 rounded-2xl border transition-all ${
                  !item.read
                    ? 'bg-slate-950 border-amber-500/40 shadow-md'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                      {getIcon(item.type || item.category)}
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                  </div>
                  <span className="text-[9px] text-slate-500 whitespace-nowrap">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.message}</p>

                {item.action && (
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate(item.action);
                    }}
                    className="mt-2.5 w-full bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-[11px] font-bold py-1.5 px-3 rounded-xl border border-slate-700 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
