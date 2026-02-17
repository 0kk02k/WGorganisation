import { useEffect, useState, useRef } from "react";
import {
  DEFAULT_CHECKIN_TEMPLATE,
  DEFAULT_CHECKOUT_TEMPLATE,
  DEFAULT_ROOMS,
} from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/context/SettingsContext";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings();
  const [editingRooms, setEditingRooms] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState(false);
  const [editingCheckout, setEditingCheckout] = useState(false);
  const [roomDraft, setRoomDraft] = useState(DEFAULT_ROOMS);
  const [checkinDraft, setCheckinDraft] = useState(DEFAULT_CHECKIN_TEMPLATE.join("\n"));
  const [checkoutDraft, setCheckoutDraft] = useState(DEFAULT_CHECKOUT_TEMPLATE.join("\n"));
  const initialized = useRef(false);

  // Nur einmal initialisieren, wenn loading fertig ist
  useEffect(() => {
    if (!loading && !initialized.current) {
      initialized.current = true;
      setRoomDraft(settings?.rooms || DEFAULT_ROOMS);
      setCheckinDraft((settings?.checkin_template || DEFAULT_CHECKIN_TEMPLATE).join("\n"));
      setCheckoutDraft((settings?.checkout_template || DEFAULT_CHECKOUT_TEMPLATE).join("\n"));
    }
  }, [loading, settings]);

  // Aktuelle Werte aus settings oder Drafts verwenden
  const hasValidRooms = settings?.rooms && Array.isArray(settings.rooms) && settings.rooms.length > 0;
  const hasValidCheckin = settings?.checkin_template && Array.isArray(settings.checkin_template) && settings.checkin_template.length > 0;
  const hasValidCheckout = settings?.checkout_template && Array.isArray(settings.checkout_template) && settings.checkout_template.length > 0;

  const displayRooms = (editingRooms ? (roomDraft.length > 0 ? roomDraft : (hasValidRooms ? settings.rooms : DEFAULT_ROOMS)) : (hasValidRooms ? settings.rooms : DEFAULT_ROOMS));
  const displayCheckin = editingCheckin ? checkinDraft : (hasValidCheckin ? settings.checkin_template.join('\n') : DEFAULT_CHECKIN_TEMPLATE.join('\n'));
  const displayCheckout = editingCheckout ? checkoutDraft : (hasValidCheckout ? settings.checkout_template.join('\n') : DEFAULT_CHECKOUT_TEMPLATE.join('\n'));

  const parseLines = (value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const handleSaveRooms = async () => {
    try {
      const data = await updateSettings({ rooms: roomDraft });
      setRoomDraft(data.rooms || DEFAULT_ROOMS);
      toast.success("Zimmer aktualisiert.");
      setEditingRooms(false);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    }
  };

  const handleSaveCheckin = async () => {
    try {
      const data = await updateSettings({ checkin_template: parseLines(checkinDraft) });
      setCheckinDraft((data.checkin_template || DEFAULT_CHECKIN_TEMPLATE).join("\n"));
      toast.success("Check-in Vorlage gespeichert.");
      setEditingCheckin(false);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    }
  };

  const handleSaveCheckout = async () => {
    try {
      const data = await updateSettings({ checkout_template: parseLines(checkoutDraft) });
      setCheckoutDraft((data.checkout_template || DEFAULT_CHECKOUT_TEMPLATE).join("\n"));
      toast.success("Check-out Vorlage gespeichert.");
      setEditingCheckout(false);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    }
  };

  return (
    <div className="min-h-screen relative" data-testid="settings-page">
      <div className="relative z-10 space-y-8 p-6">
        {/* Header mit Pop-Art Unterstrich */}
        <div className="relative inline-block">
          <h1 
            className="text-4xl tracking-wide text-gray-800"
            style={{ fontFamily: "'Bangers', cursive" }}
            data-testid="settings-title"
          >
            Einstellungen & Vorlagen
          </h1>
          <div className="h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-teal-400 mt-2" />
        </div>

        {/* Zimmer-Karte */}
        <Card 
          className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          data-testid="settings-rooms-card"
        >
          <CardHeader 
            className="bg-gradient-to-r from-pink-500 to-orange-500 border-b-4 border-black flex flex-row items-center justify-between p-4"
          >
            <CardTitle 
              className="text-white text-2xl"
              style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
              data-testid="settings-rooms-title"
            >
              Zimmer
            </CardTitle>
            {!editingRooms ? (
              <Button
                className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                onClick={() => {
                  setRoomDraft(settings?.rooms || DEFAULT_ROOMS);
                  setEditingRooms(true);
                }}
                data-testid="settings-rooms-edit-button"
              >
                Bearbeiten
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  onClick={() => {
                    setRoomDraft(settings?.rooms || DEFAULT_ROOMS);
                    setEditingRooms(false);
                  }}
                  data-testid="settings-rooms-cancel-button"
                >
                  Abbrechen
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                  onClick={handleSaveRooms}
                  data-testid="settings-rooms-save-button"
                >
                  Speichern
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6 bg-pink-500/10 grid gap-4 md:grid-cols-2">
            {(editingRooms ? roomDraft : displayRooms).map((room, index) => (
              <div
                key={room.id}
                className="bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 relative"
                data-testid={`settings-room-${room.id}`}
              >
                {/* Dekoratives Element */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400 -mr-2 -mt-2 rotate-45 border-2 border-black" />
                
                {editingRooms ? (
                  <div className="space-y-3 relative z-10">
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold text-gray-800"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        data-testid={`settings-room-name-label-${room.id}`}
                      >
                        Name
                      </label>
                      <Input
                        className="bg-white border-4 border-black rounded-none focus:ring-4 focus:ring-yellow-400 focus:ring-offset-0 text-gray-800"
                        value={room.name}
                        onChange={(event) => {
                          const next = [...roomDraft];
                          next[index] = { ...next[index], name: event.target.value };
                          setRoomDraft(next);
                        }}
                        data-testid={`settings-room-name-input-${room.id}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold text-gray-800"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        data-testid={`settings-room-color-label-${room.id}`}
                      >
                        Farbcode
                      </label>
                      <Input
                        type="color"
                        className="w-full h-12 bg-white border-4 border-black rounded-none cursor-pointer"
                        value={room.color}
                        onChange={(event) => {
                          const next = [...roomDraft];
                          next[index] = { ...next[index], color: event.target.value };
                          setRoomDraft(next);
                        }}
                        data-testid={`settings-room-color-input-${room.id}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p
                        className="text-lg font-bold text-gray-800"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        data-testid={`settings-room-name-${room.id}`}
                      >
                        {room.name}
                      </p>
                      <p 
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        data-testid={`settings-room-info-${room.id}`}
                      >
                        Farbcode {room.color}
                      </p>
                    </div>
                    <span
                      className="h-12 w-12 rounded-full border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      style={{ backgroundColor: room.color }}
                      data-testid={`settings-room-color-${room.id}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Check-in und Check-out Karten */}
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          {/* Check-in Vorlage */}
          <Card 
            className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            data-testid="settings-checkin-card"
          >
            <CardHeader 
              className="bg-gradient-to-r from-teal-400 to-emerald-400 border-b-4 border-black flex flex-row items-center justify-between p-4"
            >
              <CardTitle 
                className="text-white text-2xl"
                style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                data-testid="settings-checkin-title"
              >
                Check-in Vorlage
              </CardTitle>
              {!editingCheckin ? (
                <Button
                  className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                  onClick={() => {
                    setCheckinDraft((settings?.checkin_template || DEFAULT_CHECKIN_TEMPLATE).join("\n"));
                    setEditingCheckin(true);
                  }}
                  data-testid="settings-checkin-edit-button"
                >
                  Bearbeiten
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onClick={() => {
                      setCheckinDraft((settings?.checkin_template || DEFAULT_CHECKIN_TEMPLATE).join("\n"));
                      setEditingCheckin(false);
                    }}
                    data-testid="settings-checkin-cancel-button"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                    onClick={handleSaveCheckin}
                    data-testid="settings-checkin-save-button"
                  >
                    Speichern
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 bg-teal-400/10">
               {editingCheckin ? (
                <Textarea
                  className="bg-white border-4 border-black rounded-none focus:ring-4 focus:ring-teal-400 focus:ring-offset-0 text-gray-800 min-h-[150px]"
                  rows={6}
                  value={checkinDraft}
                  onChange={(event) => setCheckinDraft(event.target.value)}
                  data-testid="settings-checkin-textarea"
                />
              ) : (
                <ul className="space-y-2">
                  {displayCheckin.split('\n').filter(Boolean).map((item, index) => (
                    <li
                      key={`checkin-${index}`}
                      className="bg-gradient-to-r from-teal-50 to-emerald-50 border-l-8 border-teal-400 p-4 hover:from-teal-100 hover:to-emerald-100 transition-colors relative"
                      data-testid={`settings-checkin-item-${index}`}
                    >
                      {/* Nummerierter Kreis */}
                      <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 text-white font-bold rounded-full flex items-center justify-center border-2 border-black text-sm">
                        {index + 1}
                      </span>
                      <span 
                        className="text-gray-800 ml-4"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Check-out Vorlage */}
          <Card 
            className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            data-testid="settings-checkout-card"
          >
            <CardHeader 
              className="bg-gradient-to-r from-rose-400 to-pink-400 border-b-4 border-black flex flex-row items-center justify-between p-4"
            >
              <CardTitle 
                className="text-white text-2xl"
                style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                data-testid="settings-checkout-title"
              >
                Check-out Vorlage
              </CardTitle>
              {!editingCheckout ? (
                <Button
                  className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                  onClick={() => {
                    setCheckoutDraft((settings?.checkout_template || DEFAULT_CHECKOUT_TEMPLATE).join("\n"));
                    setEditingCheckout(true);
                  }}
                  data-testid="settings-checkout-edit-button"
                >
                  Bearbeiten
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onClick={() => {
                      setCheckoutDraft((settings?.checkout_template || DEFAULT_CHECKOUT_TEMPLATE).join("\n"));
                      setEditingCheckout(false);
                    }}
                    data-testid="settings-checkout-cancel-button"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                    onClick={handleSaveCheckout}
                    data-testid="settings-checkout-save-button"
                  >
                    Speichern
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 bg-rose-400/10">
               {editingCheckout ? (
                <Textarea
                  className="bg-white border-4 border-black rounded-none focus:ring-4 focus:ring-rose-400 focus:ring-offset-0 text-gray-800 min-h-[150px]"
                  rows={6}
                  value={checkoutDraft}
                  onChange={(event) => setCheckoutDraft(event.target.value)}
                  data-testid="settings-checkout-textarea"
                />
              ) : (
                <ul className="space-y-2">
                  {displayCheckout.split('\n').filter(Boolean).map((item, index) => (
                    <li
                      key={`checkout-${index}`}
                      className="bg-gradient-to-r from-rose-50 to-pink-50 border-l-8 border-rose-400 p-4 hover:from-rose-100 hover:to-pink-100 transition-colors relative"
                      data-testid={`settings-checkout-item-${index}`}
                    >
                      {/* Nummerierter Kreis */}
                      <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-pink-500 text-white font-bold rounded-full flex items-center justify-center border-2 border-black text-sm">
                        {index + 1}
                      </span>
                      <span 
                        className="text-gray-800 ml-4"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
