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
import { MOBILE_TRANSLATIONS } from './constants/translations';
import { notificationsAPI } from './services/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Fetch unread notifications count when user logged in
  useEffect(() => {
    if (user) {
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
          />
        )}
        {currentScreen === 'harvest' && <HarvestSchedulerScreen t={t} isDarkMode={isDarkMode} />}
        {currentScreen === 'leaf' && <LeafQualityScreen t={t} isDarkMode={isDarkMode} />}
        {currentScreen === 'feeding' && <FeedingOptimizerScreen t={t} isDarkMode={isDarkMode} />}
        {currentScreen === 'predict' && <ProductionPredictionScreen t={t} isDarkMode={isDarkMode} />}
        {currentScreen === 'analytics' && <AnalyticsScreen t={t} isDarkMode={isDarkMode} />}
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

    </div>
  );
}
