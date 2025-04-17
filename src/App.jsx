import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Navbar from './components/Navbar';

function AppContent() {
  const [showSplash, setShowSplash] = useState(false);
  const location = useLocation();
  const DEV_SHOW_SPLASH = false; // toggle splash screen during development

  useEffect(() => {
    if (!DEV_SHOW_SPLASH) return;
    if (location.pathname !== '/') return;
    const navEntries = performance.getEntriesByType('navigation');
    const navType = navEntries[0]?.type;

    if (navType === 'reload' || (navType === 'navigate' && document.referrer === '')) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-[]">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className={``}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </div>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;