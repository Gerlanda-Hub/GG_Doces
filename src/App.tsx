import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ChatBot from './components/ChatBot';
import CookieConsent from './components/CookieConsent';
import OfflineBanner from './components/OfflineBanner';
import OrderNotifier from './components/OrderNotifier';
import { initNativeApp } from './utils/nativeApp';
import { isNative } from './utils/nativeFeatures';
import Home from './pages/Home';
import OrderForm from './pages/OrderForm';
import TrackOrder from './pages/TrackOrder';
import Contact from './pages/Contact';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Settings from './pages/Settings';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  // Inside the native app: hide the website footer + top navbar, and show a
  // mobile-style bottom navigation bar for a true "app" feel.
  const native = isNative();
  return (
    <>
      {!native && <Navbar />}
      <div className={native ? 'pb-20' : ''}>
        {children}
      </div>
      {!native && <Footer />}
      <WhatsAppButton />
      <ChatBot />
      {native && <BottomNav />}
    </>
  );
}

import { useNavigate } from 'react-router-dom';

function GlobalAdminShortcut() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

export default function App() {
  useEffect(() => {
    initNativeApp();
  }, []);

  return (
    <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <GlobalAdminShortcut />
        <OfflineBanner />
        <OrderNotifier />
        <CookieConsent />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/sobre" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/definicoes" element={<PublicLayout><Settings /></PublicLayout>} />
          <Route path="/politica-privacidade" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />

          <Route path="/encomendar" element={<PublicLayout><OrderForm /></PublicLayout>} />
          <Route path="/consultar" element={<PublicLayout><TrackOrder /></PublicLayout>} />
          <Route path="/contato" element={<PublicLayout><Contact /></PublicLayout>} />

          {/* Client routes */}
          <Route path="/cliente" element={<ClientLogin />} />
          <Route path="/cliente/painel" element={<ClientDashboard />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/painel" element={<AdminDashboard />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
