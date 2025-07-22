import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboared';
import RoomAllocation from './pages/RoomAllocation';
import ComplaintsPage from './pages/ComplaintsPage';
import MaintenancePage from './pages/MaintenancePage';
import VisitorPage from './pages/VisitorPage';
import NoticePage from './pages/NoticePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Accounts from './pages/Accounts';
import AIAnalysisPage from './pages/AIAnalysisPage';

const App = () => {
  const location = useLocation();
  // Define paths where Navbar should not be visible
  const hideNavbarRoutes = ['/', '/register'];

  return (
    <div className="flex-1 flex flex-col">
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room-allocation" element={<RoomAllocation />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/visitors" element={<VisitorPage />} />
        <Route path="/notices" element={<NoticePage />} />
        <Route path="/ai-analysis" element={<AIAnalysisPage />} />
      </Routes>
    </div>
  );
};

export default App;
