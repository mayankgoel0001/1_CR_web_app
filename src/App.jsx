import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PortfolioPage from './pages/Portfolio/PortfolioPage';
import GoalsPage from './pages/Goals/GoalsPage';
import ScenarioAnalysisPage from './pages/ScenarioAnalysis/ScenarioAnalysisPage';
import CalculatorsPage from './pages/Calculators/CalculatorsPage';
import InsurancePage from './pages/Insurance/InsurancePage';
import ReportsPage from './pages/Reports/ReportsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/scenario-analysis" element={<ScenarioAnalysisPage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/insurance" element={<InsurancePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
