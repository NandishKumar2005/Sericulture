import React, { useState } from 'react';
import { X, User, MapPin, Phone, Mail, ShieldCheck, Globe, Save, LogOut, Check } from 'lucide-react';
import Card from './Card';
import { authAPI } from '../services/api';

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateUser, 
  onLogout,
  lang = 'en',
  setLang,
  t
}) {
  if (!isOpen) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Ramesh Kumar',
    phone: user?.phone || '+91 98450 12345',
    email: user?.email || 'ramesh.farmer@reshme.ai',
    location: user?.location || 'Kolar, Karnataka',
    farmName: user?.farmName || 'Green Silk Orchards',
    acreage: user?.acreage || '3.5 Acres',
    mulberryVariety: user?.mulberryVariety || 'V1 Viswa High Yield',
    silkwormBreed: user?.silkwormBreed || 'FC1 x FC2 Bivoltine Hybrid'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authAPI.updateProfile(formData);
      if (res.data?.user) {
        onUpdateUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        const updatedLocal = { ...user, ...formData };
        onUpdateUser(updatedLocal);
        localStorage.setItem('user', JSON.stringify(updatedLocal));
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1000);
    } catch (err) {
      const updatedLocal = { ...user, ...formData };
      onUpdateUser(updatedLocal);
      localStorage.setItem('user', JSON.stringify(updatedLocal));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  const getLabel = (key, fallback) => {
    const labels = {
      en: { title: "Farmer Profile", edit: "Edit Profile", save: "Save Profile", cancel: "Cancel", logout: "Sign Out", langSec: "App Language Preference" },
      kn: { title: "ರೈತರ ಪ್ರೊಫೈಲ್", edit: "ತಿದ್ದುಪಡಿ ಮಾಡಿ", save: "ಉಳಿಸಿ", cancel: "ರದ್ದುಮಾಡಿ", logout: "ನಿರ್ಗಮಿಸಿ", langSec: "ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ" },
      hi: { title: "किसान प्रोफाइल", edit: "संपादित करें", save: "सहेजें", cancel: "रद्द करें", logout: "साइन आउट", langSec: "ऐप भाषा चुनें" },
      te: { title: "రైతు ప్రొఫైల్", edit: "సవరించు", save: "సేవ్ చేయి", cancel: "రద్దు చేయి", logout: "సైన్ అవుట్", langSec: "యాప్ భాష ఎంచుకోండి" },
      ta: { title: "விவசாயி சுயவிவரம்", edit: "திருத்து", save: "சேமி", cancel: "ரத்து செய்", logout: "வெளியேறு", langSec: "செயலி மொழி" },
      ml: { title: "കർഷക പ്രൊഫൈൽ", edit: "തിരുത്തുക", save: "സേവ് ചെയ്യുക", cancel: "റദ്ദാക്കുക", logout: "സൈൻ ഔട്ട്", langSec: "ആപ്പ് ഭാഷ തിരെഞ്ഞെടുക്കുക" }
    };
    return labels[lang]?.[key] || fallback;
  };

  const initials = formData.name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'FP';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{getLabel('title', 'Farmer Profile')}</h3>
              <p className="text-[10px] text-slate-400">ReshmeAI Certified Farmer ID #8492</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {/* Top Hero Card */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-emerald-400/50 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-base font-extrabold text-white truncate">{formData.name}</h4>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{formData.location}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{formData.farmName} • {formData.acreage}</p>
            </div>
          </div>

          {/* Language Selector Bar (6 Languages) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                {getLabel('langSec', 'App Language Preference')}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">{lang}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang && setLang(l.code)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    lang === l.code
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Form or Display List */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Location / District</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Farm Name</label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={e => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mulberry Variety</label>
                  <input
                    type="text"
                    value={formData.mulberryVariety}
                    onChange={e => setFormData({ ...formData, mulberryVariety: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Silkworm Breed</label>
                  <input
                    type="text"
                    value={formData.silkwormBreed}
                    onChange={e => setFormData({ ...formData, silkwormBreed: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{saveSuccess ? 'Saved!' : getLabel('save', 'Save Profile')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  {getLabel('cancel', 'Cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-400">Account Details</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    {getLabel('edit', 'Edit Profile')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Phone</span>
                    <span className="text-slate-200 font-medium">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Email</span>
                    <span className="text-slate-200 font-medium truncate block">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Mulberry Variety</span>
                    <span className="text-slate-200 font-medium">{formData.mulberryVariety}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Silkworm Breed</span>
                    <span className="text-slate-200 font-medium">{formData.silkwormBreed}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{getLabel('logout', 'Sign Out of Account')}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
