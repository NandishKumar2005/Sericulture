import React from 'react';

export default function StatTile({ title, value, subtitle, badgeText, badgeColor = "emerald", icon: Icon, onClick, isDarkMode = true }) {
  const badgeColorMap = {
    emerald: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    cyan: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
    indigo: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30"
  };

  return (
    <div 
      onClick={onClick}
      className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between cursor-pointer border transition-all"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-emerald-500 ${
              isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>{title}</span>
        </div>
        {badgeText && (
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColorMap[badgeColor] || badgeColorMap.emerald}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <div className={`text-2xl font-black tracking-tight my-1 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>{value}</div>
        {subtitle && <p className={`text-xs font-medium ${
          isDarkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>{subtitle}</p>}
      </div>
    </div>
  );
}
