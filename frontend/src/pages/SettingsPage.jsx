import { useEffect, useState } from "react";
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
  const rooms = settings?.rooms || DEFAULT_ROOMS;
  const [editingRooms, setEditingRooms] = useState(false);
  const [roomDraft, setRoomDraft] = useState(rooms);
  const [editingCheckin, setEditingCheckin] = useState(false);
  const [editingCheckout, setEditingCheckout] = useState(false);
  const [checkinDraft, setCheckinDraft] = useState(
    (settings?.checkin_template || DEFAULT_CHECKIN_TEMPLATE).join("\n"),
  );
  const [checkoutDraft, setCheckoutDraft] = useState(
    (settings?.checkout_template || DEFAULT_CHECKOUT_TEMPLATE).join("\n"),
  );

  useEffect(() => {
    if (!loading && settings) {
      setRoomDraft(rooms);
      setCheckinDraft(
        (settings?.checkin_template || DEFAULT_CHECKIN_TEMPLATE).join("\n"),
      );
      setCheckoutDraft(
        (settings?.checkout_template || DEFAULT_CHECKOUT_TEMPLATE).join("\n"),
      );
    }
  }, [loading, settings]);

  const parseLines = (value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const handleSaveRooms = async () => {
    try {
      await updateSettings({ rooms: roomDraft });
      toast.success("Zimmer aktualisiert.");
      setEditingRooms(false);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    }
  };

  const handleSaveCheckin = async () => {
    try {
      await updateSettings({ checkin_template: parseLines(checkinDraft) });
      toast.success("Check-in Vorlage gespeichert.");
      setEditingCheckin(false);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    }
  };

  const handleSaveCheckout = async () => {
    try {
      await updateSettings({ checkout_template: parseLines(checkoutDraft) });
      toast.success("Check-out Vorlage gespeichert.");
      setEditingCheckout(false);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    }
  };

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="settings-title">
          Einstellungen & Vorlagen
        </h1>
      </div>

      <Card className="border-stone-200/80" data-testid="settings-rooms-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle data-testid="settings-rooms-title">Zimmer</CardTitle>
          {!editingRooms ? (
            <Button
              variant="outline"
              onClick={() => setEditingRooms(true)}
              data-testid="settings-rooms-edit-button"
            >
              Bearbeiten
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRoomDraft(rooms);
                  setEditingRooms(false);
                }}
                data-testid="settings-rooms-cancel-button"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveRooms}
                data-testid="settings-rooms-save-button"
              >
                Speichern
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {roomDraft.map((room, index) => (
            <div
              key={room.id}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
              data-testid={`settings-room-${room.id}`}
            >
              {editingRooms ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label
                      className="text-xs font-medium text-stone-600"
                      data-testid={`settings-room-name-label-${room.id}`}
                    >
                      Name
                    </label>
                    <Input
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
                      className="text-xs font-medium text-stone-600"
                      data-testid={`settings-room-color-label-${room.id}`}
                    >
                      Farbcode
                    </label>
                    <Input
                      type="color"
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
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm font-semibold text-stone-900"
                      data-testid={`settings-room-name-${room.id}`}
                    >
                      {room.name}
                    </p>
                    <p className="text-xs text-stone-600" data-testid={`settings-room-info-${room.id}`}>
                      Farbcode {room.color}
                    </p>
                  </div>
                  <span
                    className="h-8 w-8 rounded-full border"
                    style={{ backgroundColor: room.color }}
                    data-testid={`settings-room-color-${room.id}`}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-stone-200/80" data-testid="settings-checkin-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle data-testid="settings-checkin-title">Check-in Vorlage</CardTitle>
            {!editingCheckin ? (
              <Button
                variant="outline"
                onClick={() => setEditingCheckin(true)}
                data-testid="settings-checkin-edit-button"
              >
                Bearbeiten
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCheckinDraft(
                      (settings?.checkin_template || DEFAULT_CHECKIN_TEMPLATE).join(
                        "\n",
                      ),
                    );
                    setEditingCheckin(false);
                  }}
                  data-testid="settings-checkin-cancel-button"
                >
                  Abbrechen
                </Button>
                <Button onClick={handleSaveCheckin} data-testid="settings-checkin-save-button">
                  Speichern
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {editingCheckin ? (
              <Textarea
                rows={6}
                value={checkinDraft}
                onChange={(event) => setCheckinDraft(event.target.value)}
                data-testid="settings-checkin-textarea"
              />
            ) : (
              <ul className="space-y-2 text-sm text-stone-700">
                {(settings?.checkin_template || DEFAULT_CHECKIN_TEMPLATE).map(
                  (item, index) => (
                    <li
                      key={`checkin-${index}`}
                      className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                      data-testid={`settings-checkin-item-${index}`}
                    >
                      {item}
                    </li>
                  ),
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-stone-200/80" data-testid="settings-checkout-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle data-testid="settings-checkout-title">
              Check-out Vorlage
            </CardTitle>
            {!editingCheckout ? (
              <Button
                variant="outline"
                onClick={() => setEditingCheckout(true)}
                data-testid="settings-checkout-edit-button"
              >
                Bearbeiten
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCheckoutDraft(
                      (settings?.checkout_template || DEFAULT_CHECKOUT_TEMPLATE).join(
                        "\n",
                      ),
                    );
                    setEditingCheckout(false);
                  }}
                  data-testid="settings-checkout-cancel-button"
                >
                  Abbrechen
                </Button>
                <Button onClick={handleSaveCheckout} data-testid="settings-checkout-save-button">
                  Speichern
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {editingCheckout ? (
              <Textarea
                rows={6}
                value={checkoutDraft}
                onChange={(event) => setCheckoutDraft(event.target.value)}
                data-testid="settings-checkout-textarea"
              />
            ) : (
              <ul className="space-y-2 text-sm text-stone-700">
                {(settings?.checkout_template || DEFAULT_CHECKOUT_TEMPLATE).map(
                  (item, index) => (
                    <li
                      key={`checkout-${index}`}
                      className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                      data-testid={`settings-checkout-item-${index}`}
                    >
                      {item}
                    </li>
                  ),
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
