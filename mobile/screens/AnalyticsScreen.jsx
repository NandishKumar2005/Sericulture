import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Activity } from 'lucide-react';
import Card from '../components/Card';
import { MOCK_DATA } from '../constants/mockData';

export default function AnalyticsScreen({ t }) {
  const a = t?.analytics || {};
  const { harvestHistory } = MOCK_DATA;

  return (
    <div className="p-4 pb-24 space-y-5 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{a.title || 'Farm Performance Analytics'}</h2>
          <p className="text-xs text-slate-400">{a.sub || 'Historical harvest & feeding efficiency tracking'}</p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      <Card className="p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
          <span>{a.historyHeader || 'Mulberry Leaf Harvest History (kg)'}</span>
          <span className="text-emerald-400 font-normal">Last 3 Batches</span>
        </h3>

        <div className="space-y-3">
          {harvestHistory.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{item.date} • {item.grade}</span>
                <span className="text-emerald-400 font-bold">{item.yieldKg} kg</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.yieldKg / 150) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Feeding Efficiency Metrics</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">{a.avgScore || 'Feeding Efficiency'}</div>
            <div className="text-2xl font-black text-emerald-400 my-0.5">95%</div>
            <div className="text-[10px] text-slate-500">+2% vs previous batch</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">{a.avgCocoon || 'Leaf Wastage'}</div>
            <div className="text-2xl font-black text-cyan-400 my-0.5">5%</div>
            <div className="text-[10px] text-slate-500">Within optimal range</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
