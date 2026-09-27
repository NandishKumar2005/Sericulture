import React, { useState, useEffect } from 'react';
import { CloudSun, Thermometer, Droplets, Wind, RefreshCw, MapPin, Edit3, Sliders, CheckCircle, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { weatherAPI } from '../services/api';

export default function WeatherWidget({ location = 'Kolar, Karnataka', onLocationChange, lang, t }) {
  const [weatherMode, setWeatherMode] = useState('realtime'); // 'realtime' or 'manual'
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState(location);
  const [isSearching, setIsSearching] = useState(false);
  const [activeStateTab, setActiveStateTab] = useState('Karnataka');

  // Weather data state
  const [weatherData, setWeatherData] = useState({
    location: location || 'Kolar, Karnataka',
    temperature: 27,
    humidity: 74,
    rainfall: 10,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    source: 'Open-Meteo Live API',
    advice: 'Climate is optimal for 4th & 5th Instar silkworms (24°C - 28°C, 70-85% humidity).'
  });

  // Manual input fields
  const [manualTemp, setManualTemp] = useState(27);
  const [manualHumidity, setManualHumidity] = useState(74);
  const [manualRainfall, setManualRainfall] = useState(0);
  const [manualCondition, setManualCondition] = useState('Clear / Rearing Shed Reading');
  const [manualSaved, setManualSaved] = useState(false);

  // Categorized Major Sericulture Hubs across India by State
  const regionalHubsByState = {
    'Karnataka': [
      { name: 'Kolar', desc: 'Mulberry Hub' },
      { name: 'Ramanagara', desc: 'Cocoon Market' },
      { name: 'Chikkaballapur', desc: 'Mulberry Farms' },
      { name: 'Mysore', desc: 'Silk Reeling' },
      { name: 'Mandya', desc: 'Mulberry Belts' }
    ],
    'Andhra Pradesh': [
      { name: 'Anantapur', desc: 'AP Cocoon Hub' },
      { name: 'Hindupur', desc: 'Cocoon Trade' },
      { name: 'Chittoor', desc: 'Mulberry Farms' },
      { name: 'Kadapa', desc: 'Sericulture' }
    ],
    'Tamil Nadu': [
      { name: 'Dharmapuri', desc: 'Top Silk District' },
      { name: 'Salem', desc: 'Silk Weaving' },
      { name: 'Krishnagiri', desc: 'Mulberry Belts' },
      { name: 'Erode', desc: 'Sericulture' }
    ],
    'West Bengal': [
      { name: 'Malda', desc: 'Silk Capital of WB' },
      { name: 'Murshidabad', desc: 'Nistari & Reeling' },
      { name: 'Birbhum', desc: 'Mulberry Farms' },
      { name: 'Bankura', desc: 'Mulberry & Tasar' }
    ],
    'Assam': [
      { name: 'Jorhat', desc: 'Muga & Eri Hub (CMERTI)' },
      { name: 'Kamrup', desc: 'Sualkuchi Silk' },
      { name: 'Lakhimpur', desc: 'Muga Host Trees' },
      { name: 'Sivasagar', desc: 'Muga Rearing' }
    ],
    'Jharkhand': [
      { name: 'Ranchi', desc: 'Tasar Research (CTRI)' },
      { name: 'Dumka', desc: 'Tropical Tasar' },
      { name: 'West Singhbhum', desc: 'Asan/Arjun Forest' },
      { name: 'Chaibasa', desc: 'Tasar Cocoons' }
    ],
    'Jammu & Kashmir': [
      { name: 'Anantnag', desc: 'Bivoltine Mulberry' },
      { name: 'Baramulla', desc: 'Temperate Silk' },
      { name: 'Srinagar', desc: 'Silk Factory Hub' },
      { name: 'Jammu', desc: 'Sub-tropical Silk' }
    ]
  };

  // Fetch real-time weather whenever location prop changes
  const fetchRealtimeWeather = async (targetLoc) => {
    const queryLoc = targetLoc || location || 'Kolar';
    setLoading(true);
    try {
      const res = await weatherAPI.getRealtime(queryLoc);
      if (res.success && res.data) {
        const d = res.data;
        setWeatherData({
          location: d.location || queryLoc,
          temperature: d.temperature_celsius ?? 27,
          humidity: d.humidity_pct ?? 74,
          rainfall: d.rainfall_mm ?? 0,
          windSpeed: d.wind_speed_kmh ?? 12,
          condition: d.condition || 'Partly Cloudy',
          source: d.source || 'Live Weather API',
          advice: d.sericulture_advice || 'Optimal conditions for Mulberry growth & silkworm rearing.'
        });
        setManualTemp(d.temperature_celsius ?? 27);
        setManualHumidity(d.humidity_pct ?? 74);
        setManualRainfall(d.rainfall_mm ?? 0);
      }
    } catch (err) {
      console.warn('Weather API error, using regional defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (weatherMode === 'realtime') {
      fetchRealtimeWeather(location);
    }
  }, [location, weatherMode]);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setIsSearching(false);
      if (onLocationChange) onLocationChange(searchLocation.trim());
      fetchRealtimeWeather(searchLocation.trim());
    }
  };

  const handleQuickHubSelect = (hubName, stateName) => {
    const fullLoc = `${hubName}, ${stateName}`;
    setSearchLocation(fullLoc);
    setIsSearching(false);
    if (onLocationChange) onLocationChange(fullLoc);
    fetchRealtimeWeather(fullLoc);
  };

  const handleSaveManualWeather = (e) => {
    e.preventDefault();
    setWeatherData({
      location: `${weatherData.location} (Manual)`,
      temperature: Number(manualTemp),
      humidity: Number(manualHumidity),
      rainfall: Number(manualRainfall),
      windSpeed: 0,
      condition: manualCondition,
      source: 'Farmer Manual Reading',
      advice: generateManualAdvice(Number(manualTemp), Number(manualHumidity))
    });
    setManualSaved(true);
    setTimeout(() => setManualSaved(false), 3000);
  };

  function generateManualAdvice(temp, hum) {
    if (temp > 28) return 'Warning: Rearing house temperature is high (>28°C). Increase ventilation and sprinkle water.';
    if (hum < 70) return 'Warning: Humidity is low (<70%). Hang wet gunny bags inside rearing shed.';
    return 'Manual readings confirm optimal environmental conditions for silkworm rearing.';
  }

  const isOptimal = weatherData.temperature >= 24 && weatherData.temperature <= 28 && weatherData.humidity >= 70 && weatherData.humidity <= 85;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-4 shadow-xl relative overflow-hidden">
      
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CloudSun className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight truncate">
                {weatherData.location}
              </span>
              <button
                onClick={() => setIsSearching(!isSearching)}
                title="Change sericulture region"
                className="text-slate-400 hover:text-emerald-400 p-0.5 rounded-lg transition-colors flex items-center gap-1 bg-slate-800/80 px-1.5 py-0.5"
              >
                <Edit3 className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-semibold text-emerald-300">Change</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{weatherData.source}</span>
            </p>
          </div>
        </div>

        {/* Live vs Manual Mode Toggle */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 shrink-0">
          <button
            onClick={() => setWeatherMode('realtime')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
              weatherMode === 'realtime'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudSun className="w-3 h-3" />
            <span>Live Weather</span>
          </button>
          <button
            onClick={() => setWeatherMode('manual')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
              weatherMode === 'manual'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Manual</span>
          </button>
        </div>
      </div>

      {/* Location & Region Search Drawer */}
      {isSearching && (
        <div className="mb-3.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
          <form onSubmit={handleLocationSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search city/district (e.g. Malda, Anantapur, Jorhat, Ranchi, Srinagar)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all"
            >
              Search
            </button>
          </form>

          {/* State Tabs for Indian Sericulture Belts */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Select Sericulture Belt (7 States):</span>
              <span className="text-emerald-400">{activeStateTab}</span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
              {Object.keys(regionalHubsByState).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setActiveStateTab(st)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                    activeStateTab === st
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Hub Badges for Selected State */}
            <div className="grid grid-cols-2 gap-1.5 pt-2">
              {regionalHubsByState[activeStateTab]?.map((hub) => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => handleQuickHubSelect(hub.name, activeStateTab)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all group flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 block">{hub.name}</span>
                    <span className="text-[9px] text-slate-400 block">{hub.desc}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Weather View */}
      {weatherMode === 'realtime' ? (
        <div className="space-y-3">
          {/* Main Weather Numbers Grid */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* Temperature */}
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase">Temp</span>
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1">
                <span className="text-xl font-black text-white">{weatherData.temperature}°</span>
                <span className="text-xs text-slate-400">C</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-medium mt-1">Opt: 24-28°C</span>
            </div>

            {/* Humidity */}
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase">Humidity</span>
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="mt-1">
                <span className="text-xl font-black text-white">{weatherData.humidity}%</span>
              </div>
              <span className="text-[9px] text-cyan-400 font-medium mt-1">Opt: 70-85%</span>
            </div>

            {/* Condition / Wind */}
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase">Condition</span>
                <Wind className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="mt-1">
                <span className="text-xs font-bold text-white block truncate">{weatherData.condition}</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium mt-1">{weatherData.windSpeed} km/h wind</span>
            </div>
          </div>

          {/* Sericulture Environmental Advice Banner */}
          <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
            isOptimal 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {isOptimal ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[11px] uppercase tracking-wider mb-0.5">
                {isOptimal ? 'Optimal Sericulture Climate' : 'Sericulture Weather Advisory'}
              </div>
              <p className="text-xs text-slate-300 leading-snug">{weatherData.advice}</p>
            </div>
            
            <button
              onClick={() => fetchRealtimeWeather(location)}
              disabled={loading}
              title="Refresh Live Weather"
              className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        /* Manual Input Form */
        <form onSubmit={handleSaveManualWeather} className="space-y-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">
              Manual Thermo-Hygrometer Input
            </span>
            <span className="text-[10px] text-slate-500">Enter shed meter readings</span>
          </div>

          {manualSaved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-xl text-xs flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Manual weather updated!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={manualTemp}
                onChange={(e) => setManualTemp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                Humidity (%)
              </label>
              <input
                type="number"
                step="1"
                value={manualHumidity}
                onChange={(e) => setManualHumidity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Condition Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Sunny rearing shed"
              value={manualCondition}
              onChange={(e) => setManualCondition(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Apply Manual Readings</span>
          </button>
        </form>
      )}

    </div>
  );
}
