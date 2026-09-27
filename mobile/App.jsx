import React, { useState, useEffect } from 'react';
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
import { MOCK_DATA } from './constants/mockData';
import { MOBILE_TRANSLATIONS } from './constants/translations';
import { Bell, Calendar, X, ChevronRight } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en'); // 'en' or 'kn'

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Popup Toast Notification (e.g. Harvest Time popup alert)
  const [toastNotification, setToastNotification] = useState({
    show: false,
    title: 'Harvest Alert: Spinning Phase',
    message: 'This is the time to harvest! Batch Sep-A reached 5th Instar Day 7.',
    actionScreen: 'harvest'
  });

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

  // Show a popup harvest alert after login/splash when entering dashboard
  useEffect(() => {
    if (currentScreen === 'dashboard') {
      const timer = setTimeout(() => {
        setToastNotification({
          show: true,
          title: lang === 'kn' ? 'ಕೊಯ್ಲು ಮುನ್ನೆಚ್ಚರಿಕೆ: ಗೂಡು ಕೊಯ್ಲಿನ ಸಮಯ!' : 'Harvest Alert: Spinning Phase',
          message: lang === 'kn'
            ? 'ಇದು ಗೂಡು ಕೊಯ್ಲು ಮಾಡುವ ಅಥವಾ ಚಂದ್ರಿಕೆಗಳ ಮೇಲೆ ಹುಳುಗಳನ್ನು ಹರಡುವ ಸರಿಯಾದ ಸಮಯ!'
            : 'This is the time to harvest! Batch Sep-A has reached 5th Instar Spinning Stage.',
          actionScreen: 'harvest'
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, lang]);

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
      <SplashScreen
        t={t}
        onFinish={() => {
          if (user && localStorage.getItem('token')) {
            setCurrentScreen('dashboard');
          } else {
            setCurrentScreen('auth');
          }
        }}
      />
    );
  }

  if (currentScreen === 'auth') {
    return (
      <AuthScreen
        t={t}
        lang={lang}
        setLang={setLang}
        onLoginSuccess={(userData) => {
          setUser(userData);
          setCurrentScreen('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative max-w-md mx-auto shadow-2xl border-x border-slate-800/80 overflow-hidden flex flex-col font-sans">
      
      {/* Dynamic Header with working Profile & Notification handlers */}
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
        unreadCount={2}
      />

      {/* Floating Sericulture Notification Toast Popup */}
      {toastNotification.show && (
        <div className="mx-4 mt-3 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl shadow-xl flex items-start justify-between gap-3 animate-slideDown z-30">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Calendar className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">{toastNotification.title}</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-md uppercase">NOW</span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5 leading-snug">{toastNotification.message}</p>
              
              <button
                onClick={() => {
                  setToastNotification({ ...toastNotification, show: false });
                  if (toastNotification.actionScreen) {
                    setCurrentScreen(toastNotification.actionScreen);
                  }
                }}
                className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-500/30"
              >
                <span>{lang === 'kn' ? 'ಕೊಯ್ಲು ವೇಳಾಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ' : 'View Harvest Schedule'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setToastNotification({ ...toastNotification, show: false })}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            user={user}
            onNavigate={(screen) => setCurrentScreen(screen)}
            t={t}
            lang={lang}
            onUserUpdate={handleUpdateUser}
          />
        )}
        {currentScreen === 'harvest' && <HarvestSchedulerScreen t={t} />}
        {currentScreen === 'leaf' && <LeafQualityScreen t={t} />}
        {currentScreen === 'feeding' && <FeedingOptimizerScreen t={t} />}
        {currentScreen === 'predict' && <ProductionPredictionScreen t={t} />}
        {currentScreen === 'analytics' && <AnalyticsScreen t={t} />}
        {currentScreen === 'copilot' && <CopilotScreen user={user} summary={MOCK_DATA.summary} />}
      </main>

      {/* Bottom Navigation */}
      <NavBar
        activeTab={currentScreen}
        onTabChange={(tabId) => setCurrentScreen(tabId)}
        t={t}
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
        location={user?.location || 'Kolar, Karnataka'}
        onNavigate={(screen) => setCurrentScreen(screen)}
        lang={lang}
        t={t}
      />

    </div>
  );
}
