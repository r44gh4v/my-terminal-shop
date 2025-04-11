import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Navbar from './components/Navbar';

function AppContent() {
  const [showSplash, setShowSplash] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isDirectLoad = document.referrer === '' || document.referrer === window.location.origin;

    if (isDirectLoad && location.pathname === '/') {
      sessionStorage.removeItem('hasSeenSplash');
    }

    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

    if (location.pathname === '/' && (!hasSeenSplash || isDirectLoad)) {
      setShowSplash(true);
      sessionStorage.setItem('hasSeenSplash', 'true');
    }
  }, [location]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-[]">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className={`transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
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