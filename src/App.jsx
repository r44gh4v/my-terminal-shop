import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Account from './pages/Account';
import Navbar from './components/Navbar';
import { ShopProvider, useShop } from './context/ShopContext';

function AppContent() {
  const { needsToken } = useShop();
  const [showSplash, setShowSplash] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const DEV_SHOW_SPLASH = true;

  useEffect(() => {
    if (needsToken && location.pathname !== '/account') {
      navigate('/account');
    }
  }, [needsToken, location, navigate]);

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
              className=" opacity-60 fixed top-0 left-0 w-full h-full object-cover z-40 pointer-events-none"
            />
            <div className="m-5">
              <Navbar />
              <Routes>
                <Route path="/" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/account" element={<Account />} />
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