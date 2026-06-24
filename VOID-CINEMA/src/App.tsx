import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import UniverseCanvas from './components/canvas/UniverseCanvas';
import HomeLayout from './components/pages/HomeLayout';
import MovieDetailsPage from './components/pages/MovieDetailsPage';
import TheatreSelectionPage from './components/pages/TheatreSelectionPage';
import SeatSelectionPage from './components/pages/SeatSelectionPage';
import PaymentPage from './components/pages/PaymentPage';
import MyTicketsPage from './components/pages/MyTicketsPage';
import TicketViewPage from './components/pages/TicketViewPage';
import AuthPage from './components/pages/AuthPage';
import ProtectedRoute from './components/pages/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ToastProvider>
      <div className="w-full min-h-screen bg-black text-white selection:bg-neon-purple selection:text-white relative">
        {/* 3D Background Layer (Persistent across routes) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <UniverseCanvas />
        </div>

        <Routes>
          <Route path="/" element={<HomeLayout />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
          <Route path="/theatres/:movieId" element={<ProtectedRoute><TheatreSelectionPage /></ProtectedRoute>} />
          <Route path="/booking/:movieId" element={<ProtectedRoute><SeatSelectionPage /></ProtectedRoute>} />
          <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
          <Route path="/ticket/:bookingId" element={<ProtectedRoute><TicketViewPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;
