import React from 'react';

export default function StatTile({ title, value, subtitle, badgeText, badgeColor = "emerald", icon: Icon, onClick }) {
  const badgeColorMap = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
  };

  return (
    <div 
      onClick={onClick}
      className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between cursor-pointer border border-slate-800"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        </div>
        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColorMap[badgeColor] || badgeColorMap.emerald}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <div className="text-2xl font-extrabold text-white tracking-tight my-1">{value}</div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}
