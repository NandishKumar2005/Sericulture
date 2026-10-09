import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Utensils, TrendingUp, Bot, Sparkles, ChevronRight, Sprout, Plus, BarChart3 } from 'lucide-react';
import Card from '../components/Card';
import StatTile from '../components/StatTile';
import FarmSetupModal from '../components/FarmSetupModal';
import BatchSetupModal from '../components/BatchSetupModal';
import WeatherWidget from '../components/WeatherWidget';
import { farmsAPI, batchesAPI, leafAPI } from '../services/api';

export default function DashboardScreen({ user, onNavigate, t, lang, onUserUpdate, isDarkMode = true }) {
  const d = t?.dashboard || {};

  const [farms, setFarms] = useState([]);
  const [activeFarm, setActiveFarm] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  const [latestLeafScan, setLatestLeafScan] = useState(null);
  const [totalScansCount, setTotalScansCount] = useState(0);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(user?.location || 'Karnataka, India');

  useEffect(() => {
    if (user?.location) {
      setCurrentLocation(user.location);
    }
  }, [user]);

  // Fetch real farms, batches, and leaf scans for user
  useEffect(() => {
    let isMounted = true;
    farmsAPI.getAll()
      .then(res => {
        const list = res.data || [];
        if (isMounted) setFarms(list);
        if (list.length > 0) {
          const farm = list[0];
          if (isMounted) setActiveFarm(farm);

          batchesAPI.getAll(farm._id)
            .then(bRes => {
              const active = (bRes.data || []).find(b => b.status === 'active') || bRes.data?.[0];
              if (active && isMounted) setActiveBatch(active);
            })
            .catch(() => {});

          leafAPI.getHistory(farm._id)
            .then(lRes => {
              const scans = lRes.data || [];
              if (isMounted) {
                setTotalScansCount(scans.length);
                if (scans.length > 0) setLatestLeafScan(scans[0]);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const handleFarmCreated = (newFarm) => {
    setFarms(prev => [newFarm, ...prev]);
    setActiveFarm(newFarm);
  };

  const handleBatchCreated = (newBatch) => {
    setActiveBatch(newBatch);
  };

  const handleLocationChange = (newLoc) => {
    setCurrentLocation(newLoc);
    if (user && onUserUpdate) {
      onUserUpdate({ ...user, location: newLoc });
    }
  };

  // Dynamic metrics with non-empty defaults
  const leafScoreVal = latestLeafScan ? (latestLeafScan.qualityScore || latestLeafScan.score || 91) : 91;
  const leafScoreText = `${leafScoreVal}/100`;
  const leafSubtitleText = totalScansCount > 0 
    ? `${totalScansCount} ${totalScansCount === 1 ? 'Scan' : 'Scans'} Recorded` 
    : 'Grade A Lush Green';
  const leafCategoryBadge = latestLeafScan ? (latestLeafScan.qualityCategory || latestLeafScan.category || 'Excellent') : 'Grade A';

  const silkwormCount = activeBatch?.silkwormCount || 20000;
  const instarName = activeBatch?.currentInstar || '5th Instar';

  const instarMultipliers = {
    '1st Instar': 0.000015,
    '2nd Instar': 0.00004,
    '3rd Instar': 0.00018,
    '4th Instar': 0.00052,
    '5th Instar': 0.00091
  };
  const multiplier = instarMultipliers[instarName] || 0.00091;
  const recommendedTodayKg = (silkwormCount * multiplier).toFixed(1);

  const predictedCocoonKg = (silkwormCount * 0.00213).toFixed(1);
  const predictedSilkKg = (predictedCocoonKg * 0.204).toFixed(1);

  return (
    <div className="p-4 pb-24 space-y-5 max-w-md mx-auto animate-fadeIn">

      {/* Farm & Batch Selector / Creator Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Farm:</span>
          <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {activeFarm ? activeFarm.farmName : (user?.farmName || 'Green Field Farm')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsFarmModalOpen(true)}
            className={`flex items-center gap-1 border text-emerald-500 text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              isDarkMode ? 'bg-slate-900 hover:bg-slate-800 border-slate-700' : 'bg-white hover:bg-slate-100 border-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Farm
          </button>
          <button
            onClick={() => {
              if (!activeFarm) {
                setIsFarmModalOpen(true);
              } else {
                setIsBatchModalOpen(true);
              }
            }}
            className={`flex items-center gap-1 border text-cyan-500 text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              isDarkMode ? 'bg-slate-900 hover:bg-slate-800 border-slate-700' : 'bg-white hover:bg-slate-100 border-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Batch
          </button>
        </div>
      </div>

      {/* Real-Time Live & Manual Weather Widget */}
      <WeatherWidget
        location={currentLocation}
        onLocationChange={handleLocationChange}
        lang={lang}
        t={t}
        isDarkMode={isDarkMode}
      />

      {/* Active Silkworm Batch Status Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Batch</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {instarName}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {activeBatch ? activeBatch.batchName : 'V1 Silkworm Batch #1'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {`${silkwormCount.toLocaleString()} Silkworms • Active Cycle`}
            </p>
          </div>
          <button 
            onClick={() => onNavigate('feeding')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
          >
            <span>{d.cardFeeding?.btn || 'Log Feed'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>

      {/* Primary KPI Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            AI Decision Highlights
          </h3>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>View Charts</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Leaf Quality Tile */}
          <StatTile
            title={d.cardLeaf?.title || "Leaf Quality"}
            value={leafScoreText}
            subtitle={leafSubtitleText}
            badgeText={leafCategoryBadge}
            badgeColor="emerald"
            icon={Camera}
            onClick={() => onNavigate('leaf')}
          />

          {/* Harvest Scheduler Tile */}
          <StatTile
            title={d.cardHarvest?.title || "Harvest"}
            value="Oct 14 – Oct 16"
            subtitle={`Peak Moisture Window`}
            badgeText="Optimal"
            badgeColor="amber"
            icon={Calendar}
            onClick={() => onNavigate('harvest')}
          />

          {/* Feeding Optimizer Tile */}
          <StatTile
            title={d.cardFeeding?.title || "Feeding"}
            value={`${recommendedTodayKg} kg today`}
            subtitle={feedingSubtitle}
            badgeText="Optimized"
            badgeColor="cyan"
            icon={Utensils}
            onClick={() => onNavigate('feeding')}
          />

          {/* Cocoon Forecast Tile */}
          <StatTile
            title={d.cardYield?.title || "Cocoon Forecast"}
            value={`${predictedCocoonKg} kg`}
            subtitle="Shell ratio ~22.5%"
            badgeText="Predicted"
            badgeColor="indigo"
            icon={TrendingUp}
            onClick={() => onNavigate('predict')}
          />
        </div>

        {/* Silk Yield Banner */}
        <Card onClick={() => onNavigate('predict')} hoverable className="bg-slate-900 border-indigo-500/30 flex items-center justify-between p-4 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Silk Yield Prediction</div>
              <div className="text-lg font-bold text-white">
                {`${predictedSilkKg} kg predicted`}
                <span className="text-xs font-normal text-indigo-400 ml-1">
                  (20.4% recovery)
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </Card>
      </div>

      {/* AI Copilot Action Card */}
      <Card className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/40 p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mt-0.5">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{d.cardCopilot?.title || "Ask Reshme Copilot"}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{d.cardCopilot?.desc || "Get real-time advice on leaf harvesting, silkworm diseases, and daily feeding routines."}</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('copilot')}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/50 shrink-0 cursor-pointer"
          >
            {d.cardCopilot?.btn || "Ask Copilot"}
          </button>
        </div>
      </Card>

      {/* Modals */}
      <FarmSetupModal
        isOpen={isFarmModalOpen}
        onClose={() => setIsFarmModalOpen(false)}
        onFarmCreated={handleFarmCreated}
      />
      <BatchSetupModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        farmId={activeFarm ? activeFarm._id : null}
        onBatchCreated={handleBatchCreated}
      />
    </div>
  );
}
