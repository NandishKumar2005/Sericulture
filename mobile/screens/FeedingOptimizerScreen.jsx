import React, { useState, useEffect } from 'react';
import {
  Utensils, Clock, CheckCircle2, RefreshCw,
  AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import Card from '../components/Card';
import { feedingAPI, batchesAPI, farmsAPI } from '../services/api';

const SCHEDULE_TIMES = {
  3: ['06:00 AM', '12:00 PM', '07:00 PM'],
  4: ['06:00 AM', '11:00 AM', '04:00 PM', '09:00 PM'],
};

export default function FeedingOptimizerScreen({ t }) {
  const f = t?.feeding || {};
  const [farms, setFarms]         = useState([]);
  const [batches, setBatches]     = useState([]);
  const [farmId, setFarmId]       = useState('');
  const [batchId, setBatchId]     = useState('');
  const [leafScore, setLeafScore] = useState('80');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // Actual feed log
  const [actualKg, setActualKg]   = useState('');
  const [logged, setLogged]       = useState(false);

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

  useEffect(() => {
    if (batchId) runOptimise();
  }, [batchId]);

  const runOptimise = async () => {
    if (!batchId) { setError('Please select a batch first.'); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    setLogged(false);
    try {
      const res = await feedingAPI.optimise(batchId, Number(leafScore));
      setResult(res);
      setActualKg(String(res.data.daily_quantity_kg));
    } catch (err) {
      setError(err.message || 'Could not get recommendation.');
    } finally {
      setLoading(false);
    }
  };

  const times = f.slots ? f.slots.map(s => `${s.time} - ${s.name}`) : SCHEDULE_TIMES[4];

  return (
    <div className="p-4 pb-24 space-y-5 max-w-md mx-auto">
      <div>
        <h2 className="text-base font-extrabold text-white tracking-tight">{f.title || 'Dynamic Feeding Optimizer'}</h2>
        <p className="text-xs text-cyan-400 font-medium">{f.sub || 'Instar Rearing Schedule & Wastage Prevention'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Farm</label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            value={farmId}
            onChange={e => setFarmId(e.target.value)}
          >
            {farms.length === 0 && <option value="">No farms</option>}
            {farms.map(farm => <option key={farm._id} value={farm._id}>{farm.farmName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Batch</label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            value={batchId}
            onChange={e => setBatchId(e.target.value)}
          >
            {batches.length === 0 && <option value="">No active batches</option>}
            {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
          </select>
        </div>
      </div>

      {/* Recommendation Card */}
      <Card className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border-cyan-500/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {f.instarLabel || '5th Instar Rearing'}
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            20,000 Silkworms
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-white tracking-tight">
            18.2 kg <span className="text-sm font-semibold text-slate-400 ml-2">today</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {f.wastageVal || '95% Feeding Intake Efficiency (< 5% Wastage)'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Feedings / Day:</span>
            <div className="text-base font-bold text-white">4 sessions</div>
          </div>
          <div>
            <span className="text-slate-400">Qty / Feeding:</span>
            <div className="text-base font-bold text-cyan-400">4.55 kg</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
