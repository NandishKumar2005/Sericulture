import React, { useState } from 'react';
import { Layers, X, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { batchesAPI } from '../services/api';

export default function BatchSetupModal({ isOpen, onClose, farmId, onBatchCreated }) {
  const [formData, setFormData] = useState({
    batchName: 'Batch 2026-C',
    startDate: new Date().toISOString().split('T')[0],
    silkwormCount: '20000',
    currentInstar: '5th instar',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmId) {
      setError('No active farm selected. Please add or select a farm first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await batchesAPI.create({
        farmId,
        batchName: formData.batchName,
        startDate: formData.startDate,
        silkwormCount: Number(formData.silkwormCount),
        currentInstar: formData.currentInstar,
      });

      if (res.success && onBatchCreated) {
        onBatchCreated(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create silkworm batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400">
          <Layers className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Create Silkworm Batch</h3>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Batch Name</label>
            <input
              type="text" required
              value={formData.batchName}
              placeholder="e.g. Batch Sep-B"
              onChange={e => setFormData({ ...formData, batchName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Silkworm Count</label>
              <input
                type="number" required
                value={formData.silkwormCount}
                onChange={e => setFormData({ ...formData, silkwormCount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Current Instar</label>
              <select
                value={formData.currentInstar}
                onChange={e => setFormData({ ...formData, currentInstar: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="1st instar">1st instar</option>
                <option value="2nd instar">2nd instar</option>
                <option value="3rd instar">3rd instar</option>
                <option value="4th instar">4th instar</option>
                <option value="5th instar">5th instar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Rearing Start Date</label>
            <input
              type="date" required
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
