import React, { useState, useEffect } from 'react';
import { CloudSun, Thermometer, Droplets, Wind, RefreshCw, Edit3, Sliders, CheckCircle, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { weatherAPI } from '../services/api';

export default function WeatherWidget({ location = 'Kolar, Karnataka', onLocationChange, lang, t, isDarkMode = true }) {
  const [weatherMode, setWeatherMode] = useState('realtime'); // 'realtime' or 'manual'
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState(location);
  const [isSearching, setIsSearching] = useState(false);
  const [activeStateTab, setActiveStateTab] = useState('Karnataka');

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

  const [manualTemp, setManualTemp] = useState(27);
  const [manualHumidity, setManualHumidity] = useState(74);
  const [manualRainfall, setManualRainfall] = useState(0);
  const [manualCondition, setManualCondition] = useState('Clear / Rearing Shed Reading');
  const [manualSaved, setManualSaved] = useState(false);

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
      console.warn('Weather API notice:', err);
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
    <div className={`rounded-3xl p-4 shadow-xl relative overflow-hidden transition-colors border ${
      isDarkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-slate-800 text-white'
        : 'bg-white border-slate-200 text-slate-900 shadow-md'
    }`}>
      
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <CloudSun className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {weatherData.location}
              </span>
              <button
                onClick={() => setIsSearching(!isSearching)}
                title="Change sericulture region"
                className={`p-0.5 rounded-lg transition-colors flex items-center gap-1 px-1.5 py-0.5 ${
                  isDarkMode ? 'bg-slate-800/80 text-emerald-300' : 'bg-slate-100 text-emerald-700 hover:bg-slate-200'
                }`}
              >
                <Edit3 className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-semibold">Change</span>
              </button>
            </div>
            <p className={`text-[10px] truncate flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{weatherData.source}</span>
            </p>
          </div>
        </div>

        {/* Live vs Manual Mode Toggle */}
        <div className={`flex items-center border rounded-xl p-0.5 shrink-0 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setWeatherMode('realtime')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
              weatherMode === 'realtime'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
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
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Manual</span>
          </button>
        </div>
      </div>

      {/* Location & Region Search Drawer */}
      {isSearching && (
        <div className={`mb-3.5 p-3.5 rounded-2xl border space-y-3 animate-fadeIn ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <form onSubmit={handleLocationSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Search city/district (e.g. Malda, Anantapur, Jorhat, Ranchi, Srinagar)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className={`w-full border rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all"
            >
              Search
            </button>
          </form>

          {/* State Tabs */}
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span>Select Sericulture Belt:</span>
              <span className="text-emerald-500">{activeStateTab}</span>
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
                      : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Hub Badges */}
            <div className="grid grid-cols-2 gap-1.5 pt-2">
              {regionalHubsByState[activeStateTab]?.map((hub) => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => handleQuickHubSelect(hub.name, activeStateTab)}
                  className={`p-2 rounded-xl border text-left transition-all group flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900 hover:bg-slate-800 border-slate-800' : 'bg-white hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div>
                    <span className={`text-xs font-bold block group-hover:text-emerald-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{hub.name}</span>
                    <span className={`text-[9px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{hub.desc}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
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
            <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Temp</span>
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="mt-1">
                <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{weatherData.temperature}°</span>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>C</span>
              </div>
              <span className="text-[9px] text-emerald-600 font-bold mt-1">Opt: 24-28°C</span>
            </div>

            {/* Humidity */}
            <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Humidity</span>
                <Droplets className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              <div className="mt-1">
                <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{weatherData.humidity}%</span>
              </div>
              <span className="text-[9px] text-cyan-600 font-bold mt-1">Opt: 70-85%</span>
            </div>

            {/* Condition / Wind */}
            <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Condition</span>
                <Wind className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="mt-1">
                <span className={`text-xs font-bold block truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{weatherData.condition}</span>
              </div>
              <span className={`text-[9px] font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{weatherData.windSpeed} km/h wind</span>
            </div>
          </div>

          {/* Environmental Advice Banner */}
          <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
            isOptimal 
              ? isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isOptimal ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[11px] uppercase tracking-wider mb-0.5">
                {isOptimal ? 'Optimal Sericulture Climate' : 'Sericulture Weather Advisory'}
              </div>
              <p className={`text-xs leading-snug font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{weatherData.advice}</p>
            </div>
            
            <button
              onClick={() => fetchRealtimeWeather(location)}
              disabled={loading}
              title="Refresh Live Weather"
              className={`p-1 rounded-lg shrink-0 ${isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        /* Manual Input Form */
        <form onSubmit={handleSaveManualWeather} className={`space-y-3 p-3 rounded-2xl border ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600">
              Manual Thermo-Hygrometer Input
            </span>
            <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Enter shed meter readings</span>
          </div>

          {manualSaved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 p-2 rounded-xl text-xs flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Manual weather updated!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={manualTemp}
                onChange={(e) => setManualTemp(e.target.value)}
                className={`w-full border rounded-xl px-3 py-1.5 text-xs font-bold focus:border-emerald-500 focus:outline-none ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`text-[10px] font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Humidity (%)
              </label>
              <input
                type="number"
                step="1"
                value={manualHumidity}
                onChange={(e) => setManualHumidity(e.target.value)}
                className={`w-full border rounded-xl px-3 py-1.5 text-xs font-bold focus:border-emerald-500 focus:outline-none ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`text-[10px] font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Condition Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Sunny rearing shed"
              value={manualCondition}
              onChange={(e) => setManualCondition(e.target.value)}
              className={`w-full border rounded-xl px-3 py-1.5 text-xs font-bold focus:border-emerald-500 focus:outline-none ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
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
