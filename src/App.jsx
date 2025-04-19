import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Navbar from './components/Navbar';
import { ShopProvider } from './context/ShopContext';

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
    <div className="min-h-screen">
      {showSplash
        ? (
          <SplashScreen onComplete={handleSplashComplete} />
        )

        : (
          <div>
            <img
              src="https://i.postimg.cc/tJhBVh4d/scanlines.png"
              alt="scanlines"
              className="fixed top-0 left-0 w-full h-full object-cover opacity-40 z-40 pointer-events-none"
            />
            <div className="m-5">
              <Navbar />
              <Routes>
                <Route path="/" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
              </Routes>

            </div>
          </div>
        )
      }
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <AppContent />
      </ShopProvider>
    </BrowserRouter>
  );
}

export default App;