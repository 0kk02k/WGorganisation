import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
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
      const response = await api.get("/settings");
        setSettings({ ...response.data, rooms: limitRooms(response.data.rooms) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (payload) => {
    const cleanedPayload = {
      ...payload,
      rooms: payload.rooms ? limitRooms(payload.rooms) : undefined,
    };
    const response = await api.put("/settings", cleanedPayload);
    setSettings({ ...response.data, rooms: limitRooms(response.data.rooms) });
    return response.data;
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
