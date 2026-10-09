import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Activity, Sprout } from 'lucide-react';
import Card from '../components/Card';
import { harvestAPI } from '../services/api';

export default function AnalyticsScreen({ t }) {
  const a = t?.analytics || {};
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    harvestAPI.getAll()
      .then(res => {
        setHistory(res.data || []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

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
          <span className="text-emerald-400 font-normal">Real-Time Data</span>
        </h3>

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-400">Loading harvest logs...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 space-y-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
            <Sprout className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-300">No Harvest Logs Yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Completed harvest schedules and yields will be recorded here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.batchName || `Batch #${idx+1}`} • {item.qualityGrade || 'Standard'}</span>
                  <span className="text-emerald-400 font-bold">{item.actualYieldKg || item.expectedYieldKg || 0} kg</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((item.actualYieldKg || item.expectedYieldKg || 0) / 150) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Feeding Efficiency Metrics</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">{a.avgScore || 'Feeding Efficiency'}</div>
            <div className="text-2xl font-black text-emerald-400 my-0.5">
              {history.length > 0 ? '95%' : '--%'}
            </div>
            <div className="text-[10px] text-slate-500">
              {history.length > 0 ? 'Optimal feeding rate' : 'No active batch'}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">{a.avgCocoon || 'Leaf Wastage'}</div>
            <div className="text-2xl font-black text-cyan-400 my-0.5">
              {history.length > 0 ? '5%' : '--%'}
            </div>
            <div className="text-[10px] text-slate-500">
              {history.length > 0 ? 'Within optimal range' : 'No active batch'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
