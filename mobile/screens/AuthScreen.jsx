import React, { useState, useEffect } from 'react';
import { User, Phone, Lock, MapPin, ArrowRight, ShieldCheck, AlertCircle, Loader2, Globe, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Card from '../components/Card';
import { authAPI } from '../services/api';
import { googleSignIn, isNativeAndroid } from '../hooks/useGoogleAuth';

export default function AuthScreen({ onLoginSuccess, t, lang, setLang }) {
  const a = t?.auth || {};
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', location: '' });
  const [googleVerified, setGoogleVerified] = useState(null); // { email, idToken }
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNative, setIsNative] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'ml', label: 'മലയാളം' },
  ];

  useEffect(() => {
    setIsNative(isNativeAndroid());
  }, []);

  const toggleMode = (registerState) => {
    setIsRegister(registerState);
    setErrorMessage('');
    setGoogleVerified(null);
    setFormData({ name: '', phone: '', password: '', location: '' });
  };

  // Decode JWT payload from Google credential (browser flow)
  const decodeGoogleToken = (credential) => {
    try {
      return JSON.parse(atob(credential.split('.')[1]));
    } catch {
      return null;
    }
  };

  // ── Native Android Google Sign-In ──────────────────────────────────
  const handleNativeGoogleSignIn = async (mode) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await googleSignIn();
      // New flow returns { token, user } directly from backend
      const token       = result?.token;
      const userProfile = result?.user;

      if (mode === 'verify') {
        if (!userProfile?.email) throw new Error('Could not extract email from Google account.');
        setGoogleVerified({ email: userProfile.email, idToken: token });
      } else {
        if (!token || !userProfile) throw new Error('Google sign-in failed. Please try again.');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userProfile));
        onLoginSuccess(userProfile);
      }
    } catch (err) {
      if (err.message === 'USE_BROWSER_FLOW') return;
      setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Browser Google Verify (register) ──────────────────────────────
  const handleBrowserGoogleVerify = (credentialResponse) => {
    const payload = decodeGoogleToken(credentialResponse.credential);
    if (!payload?.email_verified || !payload?.email) {
      setErrorMessage('Google account email could not be verified. Please try again.');
      return;
    }
    setGoogleVerified({ email: payload.email, idToken: credentialResponse.credential });
    setErrorMessage('');
  };

  // ── Browser Google Login ───────────────────────────────────────────
  const handleBrowserGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await authAPI.googleLogin(credentialResponse.credential);
      const token = res.token || res.data?.token;
      const userProfile = res.user || res.data?.user;
      if (!token || !userProfile) throw new Error('Google sign-in failed. Please try again.');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userProfile));
      onLoginSuccess(userProfile);
    } catch (err) {
      setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google sign-in was cancelled or failed. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      if (isRegister) {
        if (!formData.name.trim()) throw new Error('Full Name is required');
        if (!formData.phone.trim()) throw new Error('Mobile Number is required');
        if (!formData.password) throw new Error('Password is required');
        if (!googleVerified) throw new Error('Please verify your Google account to complete registration.');
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone.trim())) throw new Error('Please enter a valid 10-digit mobile number');

        const res = await authAPI.register({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: googleVerified.email,
          password: formData.password,
          location: formData.location.trim() || 'Karnataka, India'
        });
        const token = res.token || res.data?.token;
        const userProfile = res.user || res.data?.user;
        if (!token || !userProfile) throw new Error('Registration failed. Please try again.');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userProfile));
        onLoginSuccess(userProfile);
      } else {
        const identifier = formData.phone.trim();
        if (!identifier || !formData.password) throw new Error('Please enter mobile number/email and password');
        const isEmail = identifier.includes('@');
        const res = await authAPI.login(
          isEmail ? identifier : undefined,
          formData.password,
          isEmail ? undefined : identifier
        );
        const token = res.token || res.data?.token;
        const userProfile = res.user || res.data?.user;
        if (!token || !userProfile) throw new Error('Authentication failed. Please try again.');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userProfile));
        onLoginSuccess(userProfile);
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed.';
      const isUnregistered = msg.toLowerCase().includes('not found') ||
                             msg.toLowerCase().includes('invalid credentials') ||
                             msg.toLowerCase().includes('not registered');
      const isGoogleOnly = msg.toLowerCase().includes('google button') ||
                           msg.toLowerCase().includes('created with google');
      if (isGoogleOnly) {
        setErrorMessage('This account was registered via Google. Please use the "Sign in with Google" button.');
      } else if (!isRegister && isUnregistered) {
        setErrorMessage(lang === 'kn'
          ? 'ಖಾತೆ ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ ಅಥವಾ ತಪ್ಪು ವಿವರಗಳು. ದಯವಿಟ್ಟು ಹೊಸ ಖಾತೆ ತೆರೆಯಿರಿ.'
          : 'Account not found or incorrect password. Please check your details or create a new account.');
        setIsRegister(true);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google Button — always use browser/web flow ───────────────────
  const GoogleButton = ({ mode }) => (
    <div className="flex justify-center w-full">
      <GoogleLogin
        onSuccess={mode === 'verify' ? handleBrowserGoogleVerify : handleBrowserGoogleLogin}
        onError={handleGoogleError}
        theme="filled_black"
        shape="rectangular"
        size="large"
        text={mode === 'verify' ? 'continue_with' : 'signin_with'}
        logo_alignment="left"
        width="280"
        useOneTap={false}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col justify-center max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-10 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {setLang && (
        <div className="mb-6 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Language / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:</span>
          </div>
          <div className="flex items-center justify-center flex-wrap gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 w-full">
            {languages.map((l) => (
              <button key={l.code} type="button" onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  lang === l.code ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>{l.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          {a.badge || 'ReshmeAI Farmer Portal'}
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {isRegister ? (a.tabRegister || 'Register Farm') : (a.title || 'Welcome Back Farmer')}
        </h2>
        <p className="text-xs text-slate-400 mt-1">{a.sub || 'Sign in to access harvest & prediction tools'}</p>
      </div>

      <Card className="p-6">
        {errorMessage && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Full Name / ಪೂರ್ಣ ಹೆಸರು</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Phone Number / ದೂರವಾಣಿ ಸಂಖ್ಯೆ</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="tel" required value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              {/* Google Account Verification */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Google Account Verification</label>
                {googleVerified ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-400">Verified</p>
                      <p className="text-[11px] text-slate-300">{googleVerified.email}</p>
                    </div>
                    <button type="button" onClick={() => setGoogleVerified(null)}
                      className="text-[10px] text-slate-400 hover:text-white underline">Change</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <GoogleButton mode="verify" />
                    <p className="text-[10px] text-slate-500 text-center">Click above to verify your Google account email</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">{a.passwordLabel || 'Password'}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="password" required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">{a.locationLabel || 'Location / District'}</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Village / District (e.g. Mandya, Karnataka)"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
            </>
          )}

          {!isRegister && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Mobile Number or Email ID</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" required value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter mobile number or email ID"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">{a.passwordLabel || 'Password'}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="password" required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading || (isRegister && !googleVerified)}
            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <><span>{isRegister ? (a.tabRegister || 'Register Farm') : (a.btnSubmit || 'Sign In to Farm')}</span><ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-slate-800">
          {!isRegister && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-3">Or continue with</p>
              <GoogleButton mode="login" />
            </div>
          )}
          <p className="text-xs text-slate-400">
            {isRegister ? 'Already registered?' : 'New sericulture farmer?'}
            <button type="button" onClick={() => toggleMode(!isRegister)}
              className="text-emerald-400 font-bold ml-1 hover:underline cursor-pointer">
              {isRegister ? (a.tabSignIn || 'Sign In') : (a.tabRegister || 'Create Account')}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
