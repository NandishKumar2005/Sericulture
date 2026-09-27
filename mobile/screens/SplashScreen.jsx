import React, { useEffect } from 'react';
import { Leaf, Sparkles, ShieldCheck } from 'lucide-react';

export default function SplashScreen({ onFinish, t }) {
  const s = t?.splash || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/30 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Leaf className="w-12 h-12 text-emerald-400 transform -rotate-12" />
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-emerald-500 p-1.5 rounded-full text-slate-950 shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Reshme<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">AI</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xs font-medium">
          {s.sub || "AI-Powered Precision Decision Support for Silkworm Farmers"}
        </p>

        <div className="mt-10 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Initializing Reshme AI...
        </div>
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-1.5 z-10">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        v1.0.0 • Reshme AI Sericulture System
      </div>
    </div>
  );
}
