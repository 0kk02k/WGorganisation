import { createContext, useContext, useEffect, useState } from "react";
import { settingsApi } from "@/lib/appwrite";
import {
  DEFAULT_CHECKIN_TEMPLATE,
  DEFAULT_CHECKOUT_TEMPLATE,
  DEFAULT_ROOMS,
} from "@/lib/constants";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    rooms: DEFAULT_ROOMS,
    checkin_template: DEFAULT_CHECKIN_TEMPLATE,
    checkout_template: DEFAULT_CHECKOUT_TEMPLATE,
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.get();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (payload) => {
    // Merge mit bestehenden Settings, damit keine Felder verloren gehen
    const mergedPayload = {
      rooms: payload.rooms !== undefined ? payload.rooms : settings.rooms,
      checkin_template: payload.checkin_template !== undefined ? payload.checkin_template : settings.checkin_template,
      checkout_template: payload.checkout_template !== undefined ? payload.checkout_template : settings.checkout_template,
    };
    const data = await settingsApi.update(mergedPayload);
    setSettings(data);
    return data;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};
