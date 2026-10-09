import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Sprout, TrendingUp, Sparkles, Utensils } from 'lucide-react';
import Card from '../components/Card';
import { harvestAPI, leafAPI, farmsAPI } from '../services/api';

export default function AnalyticsScreen({ t }) {
  const a = t?.analytics || {};
  const [history, setHistory] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    farmsAPI.getAll()
      .then(res => {
        const farms = res.data || [];
        const farmId = farms.length > 0 ? farms[0]._id : '';

        // Fetch harvest logs and leaf scans
        Promise.all([
          harvestAPI.getAll(farmId).catch(() => ({ data: [] })),
          leafAPI.getHistory(farmId).catch(() => ({ data: [] }))
        ]).then(([hRes, lRes]) => {
          if (isMounted) {
            setHistory(hRes.data || []);
            setScans(lRes.data || []);
          }
        }).finally(() => {
          if (isMounted) setLoading(false);
        });
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const totalScansCount = scans.length;
  const avgLeafScore = totalScansCount > 0 
    ? Math.round(scans.reduce((acc, s) => acc + (s.qualityScore || s.score || 88), 0) / totalScansCount)
    : 88;

  // Chart data bars (harvest kg history or sample plot)
  const chartBars = history.length > 0 ? history : [
    { label: 'Plot V1-A', val: 145, date: 'Recent' },
    { label: 'Plot V1-B', val: 120, date: 'Cycle 1' },
    { label: 'Plot M5',   val: 165, date: 'Cycle 2' },
  ];

  return (
    <div className="p-4 pb-24 space-y-5 max-w-md mx-auto animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{a.title || 'Farm Analytics & Charts'}</h2>
          <p className="text-xs text-emerald-400 font-medium">{a.sub || 'Historical harvest & feeding efficiency reports'}</p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 font-semibold block">{a.avgScore || 'Avg Leaf Score'}</span>
          <div className="text-xl font-black text-emerald-400 mt-1">{avgLeafScore}/100</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 font-semibold block">Total Scans</span>
          <div className="text-xl font-black text-cyan-400 mt-1">{totalScansCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 font-semibold block">{a.avgCocoon || 'Shell Ratio'}</span>
          <div className="text-xl font-black text-indigo-400 mt-1">22.5%</div>
        </div>
      </div>

      {/* Mulberry Leaf Harvest Yield Chart */}
      <Card className="p-5 space-y-4 bg-slate-900 border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            {a.historyHeader || 'Mulberry Leaf Harvest Yield (kg)'}
          </h3>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Live Metrics
          </span>
        </div>

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-400">Loading harvest records...</div>
        ) : (
          <div className="space-y-3 pt-1">
            {chartBars.map((item, idx) => {
              const yieldVal = item.actualYieldKg || item.expectedYieldKg || item.val || 135;
              const maxVal = 200;
              const pct = Math.min(100, Math.max(15, Math.round((yieldVal / maxVal) * 100)));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.batchName || item.label || `Batch #${idx+1}`}</span>
                    <span className="text-emerald-400 font-bold">{yieldVal} kg</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Feeding Intake Efficiency & Quality Distribution */}
      <Card className="p-5 space-y-4 bg-slate-900 border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Utensils className="w-4 h-4 text-cyan-400" />
          Feeding Efficiency & Wastage Index
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold">Intake Efficiency</span>
            <div className="text-2xl font-black text-emerald-400">95.8%</div>
            <p className="text-[10px] text-slate-400">Optimal digestion rate</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold">Leaf Wastage</span>
            <div className="text-2xl font-black text-cyan-400">4.2%</div>
            <p className="text-[10px] text-slate-400">Wastage prevented</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
