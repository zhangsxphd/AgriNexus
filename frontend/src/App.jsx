import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import FieldMonitoringPage from './pages/FieldMonitoringPage';
import AlertsPage from './pages/AlertsPage';
import AnalysisPage from './pages/AnalysisPage';
import ExperimentManagementPage from './pages/ExperimentManagementPage';
import TopicAnalysisPage from './pages/TopicAnalysisPage';
import DevicesGatewayPage from './pages/DevicesGatewayPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="monitoring" element={<FieldMonitoringPage />} />
          <Route path="experiments" element={<ExperimentManagementPage />} />
          <Route path="experiments/ratoon-water-window" element={<TopicAnalysisPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="devices" element={<DevicesGatewayPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="greenhouses" element={<Navigate to="/monitoring" replace />} />
          <Route path="research" element={<Navigate to="/experiments" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
