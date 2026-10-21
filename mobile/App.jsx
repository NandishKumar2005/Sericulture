import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import HarvestSchedulerScreen from './screens/HarvestSchedulerScreen';
import LeafQualityScreen from './screens/LeafQualityScreen';
import FeedingOptimizerScreen from './screens/FeedingOptimizerScreen';
import ProductionPredictionScreen from './screens/ProductionPredictionScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import CopilotScreen from './screens/CopilotScreen';
import Header from './components/Header';
import NavBar from './components/NavBar';
import ProfileModal from './components/ProfileModal';
import NotificationDrawer from './components/NotificationDrawer';
import { MOBILE_TRANSLATIONS } from './constants/translations';
import { notificationsAPI } from './services/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [leafRefreshTrigger, setLeafRefreshTrigger] = useState(0);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update notification state
  const APP_VERSION = '1.0.0';
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  const t = MOBILE_TRANSLATIONS[lang] || MOBILE_TRANSLATIONS.en;

  // Restore stored session on startup
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Could not restore user session:', e);
    }
  }, []);

  // Check for app updates on startup
  useEffect(() => {
    fetch('https://reshme-ai-dashboard.vercel.app/version.json?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        if (data.latestVersion && data.latestVersion !== APP_VERSION) {
          setUpdateInfo(data);
          setShowUpdateBanner(true);
        } else if (data.forceUpdate) {
          setUpdateInfo(data);
          setShowUpdateBanner(true);
        }
      })
      .catch(() => {}); // silently ignore if offline
  }, []);

  // Fetch unread notifications count when user logged in
  useEffect(() => {    if (user) {
      notificationsAPI.getAll(user.location)
        .then(res => {
          const list = res.data || [];
          const unread = list.filter(n => !n.read).length;
          setUnreadCount(unread);
        })
        .catch(() => setUnreadCount(0));
    }
  }, [user, currentScreen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setCurrentScreen('auth');
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const screenTitles = {
    dashboard: lang === 'kn' ? 'ತೋಟದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Farm Dashboard',
    harvest: lang === 'kn' ? 'ಕೊಯ್ಲು ವೇಳಾಪಟ್ಟಿ' : 'Harvest Scheduler',
    leaf: lang === 'kn' ? 'ಎಲೆ ಗುಣಮಟ್ಟ ಸ್ಕ್ಯಾನರ್' : 'Leaf Quality Scanner',
    feeding: lang === 'kn' ? 'ಆಹಾರ ಪ್ರಮಾಣ ಆಪ್ಟಿಮೈಜರ್' : 'Feeding Optimizer',
    predict: lang === 'kn' ? 'ಗೂಡು/ರೇಷ್ಮೆ ಇಳುವರಿ' : 'Cocoon & Silk Yield',
    analytics: lang === 'kn' ? 'ತೋಟದ ವಿಶ್ಲೇಷಣೆ' : 'Farm Analytics',
    copilot: lang === 'kn' ? 'ರೇಷ್ಮೆ ಎಐ ಸಹಾಯಕ' : 'Reshme AI Copilot'
  };

  if (currentScreen === 'splash') {
    return (
      <GoogleOAuthProvider clientId="821368596969-ecg9q9cj692prkp1uutckppssf6l1ccs.apps.googleusercontent.com">
        <SplashScreen
          t={t}
          onFinish={() => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if ((user || storedUser) && storedToken) {
              setCurrentScreen('dashboard');
            } else {
              setCurrentScreen('auth');
            }
          }}
        />
      </GoogleOAuthProvider>
    );
  }

  if (currentScreen === 'auth') {
    return (
      <GoogleOAuthProvider clientId="821368596969-ecg9q9cj692prkp1uutckppssf6l1ccs.apps.googleusercontent.com">
        <AuthScreen
          t={t}
          lang={lang}
          setLang={setLang}
          onLoginSuccess={(userData) => {
            setUser(userData);
            setCurrentScreen('dashboard');
          }}
        />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className={`min-h-screen relative max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col font-sans transition-colors ${
      isDarkMode ? 'bg-slate-950 text-slate-100 border-x border-slate-800/80' : 'light-mode bg-slate-50 text-slate-900 border-x border-slate-200'
    }`}>
      
      {/* Dynamic Header with Day/Night Theme toggle */}
      <Header
        title={screenTitles[currentScreen] || (lang === 'kn' ? 'ರೇಷ್ಮೆ' : 'Reshme')}
        showBack={currentScreen !== 'dashboard'}
        onBack={() => setCurrentScreen('dashboard')}
        user={user}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
        t={t}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Screen Content */}
      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            user={user}
            onNavigate={(screen) => setCurrentScreen(screen)}
            t={t}
            lang={lang}
            onUserUpdate={handleUpdateUser}
            isDarkMode={isDarkMode}
            refreshTrigger={leafRefreshTrigger}
          />
        )}
        {currentScreen === 'harvest' && <HarvestSchedulerScreen t={t} isDarkMode={isDarkMode} />}
        {currentScreen === 'leaf' && (
          <LeafQualityScreen
            t={t}
            isDarkMode={isDarkMode}
            onScanComplete={() => setLeafRefreshTrigger(prev => prev + 1)}
          />
        )}
        {currentScreen === 'feeding' && <FeedingOptimizerScreen t={t} isDarkMode={isDarkMode} />}
        {currentScreen === 'predict' && <ProductionPredictionScreen t={t} isDarkMode={isDarkMode} />}
        {currentScreen === 'analytics' && (
          <AnalyticsScreen 
            t={t} 
            isDarkMode={isDarkMode} 
            onNavigate={(screen) => setCurrentScreen(screen)} 
          />
        )}
        {currentScreen === 'copilot' && <CopilotScreen user={user} summary={null} t={t} isDarkMode={isDarkMode} />}
      </main>

      {/* Bottom Navigation */}
      <NavBar
        activeTab={currentScreen}
        onTabChange={(tabId) => setCurrentScreen(tabId)}
        t={t}
        isDarkMode={isDarkMode}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
        t={t}
      />

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        location={user?.location || 'Karnataka, India'}
        onNavigate={(screen) => setCurrentScreen(screen)}
        lang={lang}
        t={t}
      />

      {/* Update Available Banner */}
      {showUpdateBanner && updateInfo && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
          <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3 max-w-md mx-auto">
            <span className="text-2xl shrink-0">🆕</span>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm">New Version Available — v{updateInfo.latestVersion}</div>
              {updateInfo.releaseNotes && (
                <div className="text-xs text-emerald-100 mt-0.5 truncate">{updateInfo.releaseNotes}</div>
              )}
              <div className="flex gap-2 mt-2">
                <a
                  href={updateInfo.downloadUrl}
                  className="bg-white text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-xl"
                >
                  Download Update
                </a>
                {!updateInfo.forceUpdate && (
                  <button
                    onClick={() => setShowUpdateBanner(false)}
                    className="text-emerald-100 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-400"
                  >
                    Later
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
