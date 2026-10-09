import React from 'react';
import { Home, Calendar, Camera, Utensils, TrendingUp, Bot, BarChart3 } from 'lucide-react';

export default function NavBar({ activeTab, onTabChange, t, isDarkMode = true }) {
  const nav = t?.nav || {};

  const tabs = [
    { id: 'dashboard', label: nav.home || 'Home', icon: Home },
    { id: 'harvest', label: nav.harvest || 'Harvest', icon: Calendar },
    { id: 'leaf', label: nav.leaf || 'Scan Leaf', icon: Camera },
    { id: 'feeding', label: nav.feeding || 'Feeding', icon: Utensils },
    { id: 'predict', label: nav.yield || 'Yield', icon: TrendingUp },
    { id: 'analytics', label: nav.analytics || 'Charts', icon: BarChart3 },
    { id: 'copilot', label: nav.copilot || 'Copilot', icon: Bot },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 backdrop-blur-lg px-2 py-2 transition-colors ${
      isDarkMode 
        ? 'bg-slate-950/95 border-t border-slate-800/80 text-white' 
        : 'bg-white/95 border-t border-slate-200 text-slate-900 shadow-xl'
    }`}>
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-1.5 py-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-500 font-extrabold scale-105'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${
                isActive 
                  ? 'bg-emerald-500/15 text-emerald-500 font-bold' 
                  : isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
