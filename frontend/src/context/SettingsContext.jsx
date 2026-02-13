import { createContext, useContext, useEffect, useState } from "react";
import { settingsApi } from "@/lib/appwrite";
import {
  DEFAULT_CHECKIN_TEMPLATE,
  DEFAULT_CHECKOUT_TEMPLATE,
  DEFAULT_ROOMS,
} from "@/lib/constants";

const SettingsContext = createContext(null);

const limitRooms = (rooms) => (Array.isArray(rooms) ? rooms.slice(0, 2) : rooms);

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
      setSettings({ ...data, rooms: limitRooms(data.rooms) });
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
    const cleanedPayload = { ...payload };
    if (payload.rooms) {
      cleanedPayload.rooms = limitRooms(payload.rooms);
    }
    const data = await settingsApi.update(cleanedPayload);
    setSettings({ ...data, rooms: limitRooms(data.rooms) });
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
