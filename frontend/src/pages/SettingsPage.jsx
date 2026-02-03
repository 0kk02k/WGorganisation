import { CHECKIN_TEMPLATE, CHECKOUT_TEMPLATE, ROOMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1
          className="font-[Manrope] text-3xl font-bold tracking-tight"
          data-testid="settings-title"
        >
          Einstellungen & Vorlagen
        </h1>
        <p className="text-sm text-stone-600" data-testid="settings-subtitle">
          Überblick zu Zimmern und Standard-Checklisten.
        </p>
      </div>

      <Card className="border-stone-200/80" data-testid="settings-rooms-card">
        <CardHeader>
          <CardTitle data-testid="settings-rooms-title">Zimmer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {ROOMS.map((room) => (
            <div
              key={room.id}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
              data-testid={`settings-room-${room.id}`}
            >
              <p className="text-sm font-semibold text-stone-900" data-testid={`settings-room-name-${room.id}`}>
                {room.name}
              </p>
              <p className="text-xs text-stone-600" data-testid={`settings-room-info-${room.id}`}>
                Farbcode für Belegung und Kalender.
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-stone-200/80" data-testid="settings-checkin-card">
          <CardHeader>
            <CardTitle data-testid="settings-checkin-title">Check-in Vorlage</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-stone-700">
              {CHECKIN_TEMPLATE.map((item, index) => (
                <li
                  key={`checkin-${index}`}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  data-testid={`settings-checkin-item-${index}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80" data-testid="settings-checkout-card">
          <CardHeader>
            <CardTitle data-testid="settings-checkout-title">
              Check-out Vorlage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-stone-700">
              {CHECKOUT_TEMPLATE.map((item, index) => (
                <li
                  key={`checkout-${index}`}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  data-testid={`settings-checkout-item-${index}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
