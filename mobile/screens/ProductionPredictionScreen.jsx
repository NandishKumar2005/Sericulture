import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Sparkles, Award, ShieldCheck, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../components/Card';
import { productionAPI, batchesAPI, farmsAPI } from '../services/api';

export default function ProductionPredictionScreen({ t }) {
  const y = t?.yield || {};
  const [farms, setFarms]         = useState([]);
  const [batches, setBatches]     = useState([]);
  const [farmId, setFarmId]       = useState('');
  const [batchId, setBatchId]     = useState('');
  const [leafScore, setLeafScore] = useState('85');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    farmsAPI.getAll()
      .then(res => {
        const list = res.data || [];
        setFarms(list);
        if (list.length > 0) setFarmId(list[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!farmId) return;
    batchesAPI.getAll(farmId)
      .then(res => {
        const active = (res.data || []).filter(b => b.status === 'active');
        setBatches(active);
        if (active.length > 0) setBatchId(active[0]._id);
      })
      .catch(() => {});
  }, [farmId]);

  return (
    <div className="p-4 pb-24 space-y-5 max-w-md mx-auto">
      <div>
        <h2 className="text-base font-extrabold text-white tracking-tight">{y.title || 'Cocoon & Silk Yield Predictor'}</h2>
        <p className="text-xs text-indigo-400 font-medium">{y.sub || 'Two-Stage Production & Silk Recovery Forecasting'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Farm</label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={farmId}
            onChange={e => setFarmId(e.target.value)}
          >
            {farms.length === 0 && <option value="">No farms found</option>}
            {farms.map(f => <option key={f._id} value={f._id}>{f.farmName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Active Batch</label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={batchId}
            onChange={e => setBatchId(e.target.value)}
          >
            {batches.length === 0 && <option value="">No active batches</option>}
            {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
          </select>
        </div>
      </div>

      {/* Stage 1 Card */}
      <Card className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {y.stage1Title || 'Stage 1 • Cocoon Yield Forecast'}
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            94% Confidence
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-white tracking-tight">
            {y.cocoonYieldVal || '42.6 kg'} <span className="text-sm font-semibold text-indigo-300">predicted</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs text-center">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400">{y.cocoonWeight || 'Avg Weight'}</span>
            <div className="font-bold text-white mt-0.5">{y.cocoonWeightVal || '1.65 g'}</div>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400">{y.shellRatio || 'Shell Ratio'}</span>
            <div className="font-bold text-indigo-400 mt-0.5">{y.shellRatioVal || '22.5%'}</div>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400">{y.grade || 'Quality'}</span>
            <div className="font-bold text-emerald-400 mt-0.5">{y.gradeVal || 'Grade A'}</div>
          </div>
        </div>
      </Card>

      {/* Stage 2 Card */}
      <Card className="bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900 border-teal-500/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              {y.stage2Title || 'Stage 2 • Silk Recovery Forecast'}
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
            94% Confidence
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-white tracking-tight">
            {y.silkYieldVal || '8.7 kg'} <span className="text-sm font-semibold text-teal-300">predicted</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">{y.recoveryRate || 'Recovery Rate'}:</span>
            <div className="text-sm font-bold text-teal-300 mt-0.5">{y.recoveryVal || '14.8%'}</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">{y.filamentLength || 'Filament Length'}:</span>
            <div className="text-sm font-bold text-white mt-0.5">{y.filamentVal || '1,150 Meters'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
