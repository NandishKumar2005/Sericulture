import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Sprout, TrendingUp, Sparkles, Utensils, Calendar, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import { harvestAPI, leafAPI, farmsAPI, batchesAPI, feedingAPI, productionAPI } from '../services/api';

export default function AnalyticsScreen({ t, onNavigate }) {
  const a = t?.analytics || {};
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [history, setHistory] = useState([]);
  const [scans, setScans] = useState([]);
  const [feedingRecords, setFeedingRecords] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    farmsAPI.getAll()
      .then(res => {
        const list = res.data || [];
        if (isMounted) setFarms(list);
        
        const farmId = list.length > 0 ? list[0]._id : '';
        if (isMounted && farmId) setSelectedFarmId(farmId);

        if (farmId) {
          fetchFarmAnalytics(farmId, isMounted);
        } else {
          if (isMounted) setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const fetchFarmAnalytics = (farmId, isMounted = true) => {
    setLoading(true);
    
    // Fetch real harvest, leaf scans, batches, and records for selected farm
    Promise.all([
      harvestAPI.getAll(farmId).catch(() => ({ data: [] })),
      leafAPI.getHistory(farmId).catch(() => ({ data: [] })),
      batchesAPI.getAll(farmId).catch(() => ({ data: [] }))
    ]).then(([hRes, lRes, bRes]) => {
      if (!isMounted) return;

      const harvestLogs = hRes.data || hRes || [];
      const leafScans = lRes.data || lRes || [];
      const batchList = bRes.data || bRes || [];

      setHistory(Array.isArray(harvestLogs) ? harvestLogs : []);
      setScans(Array.isArray(leafScans) ? leafScans : []);

      const active = batchList.find(b => b.status === 'active') || batchList[0];
      if (active) {
        setActiveBatch(active);

        // Fetch real feeding records and production predictions for active batch
        Promise.all([
          feedingAPI.getByBatch(active._id).catch(() => ({ data: [] })),
          productionAPI.getByBatch(active._id).catch(() => ({ data: [] }))
        ]).then(([fRes, pRes]) => {
          if (isMounted) {
            setFeedingRecords(fRes.data || fRes || []);
            setPredictions(pRes.data || pRes || []);
          }
        }).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        if (isMounted) setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
  };

  const handleFarmChange = (e) => {
    const id = e.target.value;
    setSelectedFarmId(id);
    if (id) fetchFarmAnalytics(id, true);
  };

  // Real data calculations
  const totalScansCount = scans.length;
  const avgLeafScore = totalScansCount > 0 
    ? Math.round(scans.reduce((acc, s) => acc + (s.qualityScore || s.score || 0), 0) / totalScansCount)
    : null;

  const realShellRatio = predictions.length > 0
    ? (predictions.reduce((sum, p) => sum + (p.shell_ratio_pct || p.prediction?.shell_ratio_pct || 21.5), 0) / predictions.length).toFixed(1)
    : (activeBatch ? (21.5 + (avgLeafScore ? (avgLeafScore - 80) * 0.1 : 0)).toFixed(1) : null);

  // Feeding intake efficiency & wastage calculations
  const hasFeedingLogs = feedingRecords.length > 0;
  const realIntakeEfficiency = hasFeedingLogs
    ? (feedingRecords.reduce((acc, r) => acc + (r.feedingEfficiency || (100 - (r.actualWastage || 4.2))), 0) / feedingRecords.length).toFixed(1)
    : (activeBatch ? '95.8' : null);

  const realWastagePct = hasFeedingLogs
    ? (feedingRecords.reduce((acc, r) => acc + (r.actualWastage || r.estimatedWastage || 4.2), 0) / feedingRecords.length).toFixed(1)
    : (activeBatch ? '4.2' : null);

  return (
    <div className="p-4 pb-24 space-y-5 max-w-md mx-auto animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{a.title || 'Farm Analytics & Charts'}</h2>
          <p className="text-xs text-emerald-400 font-medium">{a.sub || 'Historical harvest & feeding efficiency reports'}</p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      {/* Farm Selector */}
      {farms.length > 0 && (
        <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 pl-2">Farm Plot:</span>
          <select
            value={selectedFarmId}
            onChange={handleFarmChange}
            className="bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 min-w-0 flex-1 truncate"
          >
            {farms.map(f => (
              <option key={f._id} value={f._id}>{f.farmName} ({f.location || 'Plot'})</option>
            ))}
          </select>
        </div>
      )}

      {/* Real KPI Highlights Bar */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 font-semibold block">{a.avgScore || 'Avg Leaf Score'}</span>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {avgLeafScore !== null ? `${avgLeafScore}/100` : '--'}
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            {totalScansCount > 0 ? 'From CV Scans' : 'No Scans Yet'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 font-semibold block">Total Scans</span>
          <div className="text-xl font-black text-cyan-400 mt-1">{totalScansCount}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">Scanned Images</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 font-semibold block">{a.avgCocoon || 'Shell Ratio'}</span>
          <div className="text-xl font-black text-indigo-400 mt-1">
            {realShellRatio !== null ? `${realShellRatio}%` : '--'}
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            {predictions.length > 0 ? 'Yield Prediction' : activeBatch ? 'Batch Estimate' : 'No Data'}
          </span>
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
            {history.length > 0 ? `${history.length} Harvest Records` : 'Live Metrics'}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading real harvest history…</span>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3 pt-1">
            {history.map((item, idx) => {
              const yieldVal = item.actualYieldKg || item.expected_leaf_yield_kg || item.expectedYieldKg || item.quantity || item.val || 0;
              const maxVal = Math.max(200, ...history.map(h => h.actualYieldKg || h.expected_leaf_yield_kg || h.quantity || 100));
              const pct = Math.min(100, Math.max(15, Math.round((yieldVal / maxVal) * 100)));
              const dateStr = item.harvestDate || item.createdAt ? new Date(item.harvestDate || item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : `Record #${idx+1}`;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.batchName || item.mulberry_variety || item.label || `Harvest ${dateStr}`}</span>
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
        ) : (
          <div className="py-6 text-center text-slate-400 space-y-3 border border-dashed border-slate-800 rounded-2xl p-4">
            <Calendar className="w-8 h-8 mx-auto text-slate-600" />
            <h4 className="text-xs font-bold text-white">No Harvest Logs Found</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
              Run a harvest calculation in the Harvest Scheduler to build your real harvest yield charts.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('harvest')}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Go to Harvest Scheduler
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Feeding Efficiency & Wastage Index */}
      <Card className="p-5 space-y-4 bg-slate-900 border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-cyan-400" />
            Feeding Efficiency & Wastage Index
          </h3>
          {hasFeedingLogs && (
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              {feedingRecords.length} Feeding Logs
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold">Intake Efficiency</span>
            <div className="text-2xl font-black text-emerald-400">
              {realIntakeEfficiency !== null ? `${realIntakeEfficiency}%` : '--'}
            </div>
            <p className="text-[10px] text-slate-400">
              {hasFeedingLogs ? 'Real Logged Digestion Rate' : activeBatch ? 'Estimated Rearing Rate' : 'No Feeding Logs'}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold">Leaf Wastage</span>
            <div className="text-2xl font-black text-cyan-400">
              {realWastagePct !== null ? `${realWastagePct}%` : '--'}
            </div>
            <p className="text-[10px] text-slate-400">
              {hasFeedingLogs ? 'Real Logged Wastage' : activeBatch ? 'Target Wastage < 5%' : 'No Feeding Logs'}
            </p>
          </div>
        </div>

        {!hasFeedingLogs && onNavigate && (
          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate('feeding')}
              className="text-xs font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Log today's feeding in Feeding Optimizer</span>
              <span>→</span>
            </button>
          </div>
        )}
      </Card>

    </div>
  );
}
