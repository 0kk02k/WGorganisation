import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/layout/Layout";
import { SettingsProvider } from "@/context/SettingsContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/CalendarPage";
import StaysPage from "@/pages/StaysPage";
import StayDetail from "@/pages/StayDetail";
import ManualsPage from "@/pages/ManualsPage";
import ManualDetail from "@/pages/ManualDetail";
import SettingsPage from "@/pages/SettingsPage";
import BerlinPage from "@/pages/BerlinPage";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SettingsProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/kalender" element={<CalendarPage />} />
              <Route path="/aufenthalte" element={<StaysPage />} />
              <Route path="/aufenthalte/:id" element={<StayDetail />} />
              <Route path="/anleitungen" element={<ManualsPage />} />
              <Route path="/anleitungen/:id" element={<ManualDetail />} />
              <Route path="/einstellungen" element={<SettingsPage />} />
              <Route path="/berlin" element={<BerlinPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <Toaster richColors position="top-right" />
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
