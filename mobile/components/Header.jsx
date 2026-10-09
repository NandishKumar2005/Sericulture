import React, { useState } from 'react';
import { Bell, ArrowLeft, Leaf, Globe, ChevronDown, Sun, Moon } from 'lucide-react';

export default function Header({ 
  title, 
  showBack, 
  onBack, 
  user, 
  onLogout, 
  lang = 'en', 
  setLang, 
  t, 
  onOpenProfile, 
  onOpenNotifications,
  unreadCount = 0,
  isDarkMode = true,
  onToggleTheme
}) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const userName = user?.name || (
    lang === 'kn' ? 'ರೈತರ ಪ್ರೊಫೈಲ್' :
    lang === 'hi' ? 'किसान प्रोफाइल' :
    lang === 'te' ? 'రైతు ప్రొఫైల్' :
    lang === 'ta' ? 'விவசாயி சுயவிவரம்' :
    lang === 'ml' ? 'കർഷക പ്രൊഫൈൽ' : 'Farmer Profile'
  );

  const location = user?.location || 'Kolar, Karnataka';
  
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'FP';

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'kn', label: 'ಕನ್ನಡ', short: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिन्दी', short: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు', short: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்', short: 'தமிழ்' },
    { code: 'ml', label: 'മലയാളം', short: 'മലയാളം' },
  ];

  const currentLangObj = languages.find(l => l.code === lang) || languages[0];

  return (
    <header className={`sticky top-0 z-40 px-3.5 py-2.5 flex items-center justify-between shadow-md transition-colors ${
      isDarkMode 
        ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white' 
        : 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack ? (
          <button 
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              isDarkMode ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0 border border-emerald-400/30">
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
        )}

        <div className="overflow-hidden min-w-0 cursor-pointer" onClick={onOpenProfile}>
          <h1 className={`text-sm font-bold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {title || 'ReshmeAI'}
          </h1>
          <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="truncate">{userName}</span>
            <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={`truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{location}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Day / Night Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`p-1.5 rounded-xl transition-all active:scale-95 ${
              isDarkMode 
                ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-amber-500/20' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-600 border border-amber-300'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* 6-Language Multi-lingual Selector Dropdown */}
        {setLang && (
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold transition-all shadow-sm ${
                isDarkMode
                  ? 'bg-slate-900 border border-slate-700/80 text-emerald-400'
                  : 'bg-slate-100 border border-slate-300 text-emerald-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLangObj.short}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <div className={`absolute right-0 top-full mt-1.5 w-32 rounded-2xl p-1.5 shadow-2xl z-50 animate-fadeIn space-y-0.5 border ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      lang === l.code
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{l.label}</span>
                    {lang === l.code && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notification Bell Button */}
        <button 
          onClick={onOpenNotifications}
          title="Notifications"
          className={`p-1.5 rounded-xl relative transition-all active:scale-95 ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-extrabold flex items-center justify-center border border-slate-950 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenProfile}
          title="View Profile"
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md hover:ring-2 hover:ring-emerald-400/50 transition-all active:scale-95"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
