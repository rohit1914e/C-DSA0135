import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// Actually, since I'm using GSAP, I don't need Framer Motion.
import UniverseCanvas from './components/canvas/UniverseCanvas';
import Layout from './components/ui/Layout';
import Explore from './pages/Explore';
import Favorites from './pages/Favorites';
import MyTickets from './pages/MyTickets';
import History from './pages/History';
import Profile from './pages/Profile';

function AppRoutes() {
  const location = useLocation();
  // We will use GSAP for page transitions, so we just render routes normally
  // We can manage GSAP transitions in the page components via useEffect
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Explore />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/tickets" element={<MyTickets />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <UniverseCanvas />
      </div>

      {/* UI Foreground */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Layout>
          <div className="pointer-events-auto h-full">
            <AppRoutes />
          </div>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
