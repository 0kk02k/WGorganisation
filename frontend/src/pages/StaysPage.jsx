import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { getRoomBadgeStyle } from "@/lib/color";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StayDialog } from "@/components/stays/StayDialog";
import { format, parseISO } from "date-fns";

export default function StaysPage() {
  const { settings } = useSettings();
  const [stays, setStays] = useState([]);
  const rooms = settings?.rooms || DEFAULT_ROOMS;

  useEffect(() => {
    const loadStays = async () => {
      const response = await api.get("/stays");
      setStays(response.data);
    };
    loadStays();
  }, []);

  return (
    <div className="space-y-6" data-testid="stays-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="stays-title">
            Aufenthalte
          </h1>
        </div>
        <StayDialog
          triggerLabel="Neue Belegung"
          triggerTestId="stays-new-button"
          onCreated={(stay) => setStays((prev) => [stay, ...prev])}
        />
      </div>

      <div className="grid gap-4" data-testid="stays-list">
        {stays.length === 0 ? (
          <Card className="border-dashed border-stone-300" data-testid="stays-empty">
            <CardContent className="py-8 text-center text-sm text-stone-600">
              Noch keine Aufenthalte angelegt.
            </CardContent>
          </Card>
        ) : (
          stays.map((stay) => {
            const roomColor = rooms.find((room) => room.id === stay.room)?.color;
            const openIn = stay.checklist_in?.filter((item) => !item.done).length;
            const openOut = stay.checklist_out?.filter((item) => !item.done).length;

            return (
              <Link
                to={`/aufenthalte/${stay.id}`}
                key={stay.id}
                className="group"
                data-testid={`stays-card-${stay.id}`}
              >
                <Card className="border-stone-200/80 transition-colors group-hover:bg-stone-50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle data-testid={`stays-name-${stay.id}`}>
                        {stay.occupant_name}
                      </CardTitle>
                      <p
                        className="text-sm text-stone-600"
                        data-testid={`stays-date-${stay.id}`}
                      >
                        {format(parseISO(stay.start_date), "dd.MM.")} –
                        {" "}
                        {format(parseISO(stay.end_date), "dd.MM.yyyy")}
                      </p>
                    </div>
                    <Badge
                      style={getRoomBadgeStyle(roomColor)}
                      className="border border-transparent text-stone-900"
                      data-testid={`stays-room-${stay.id}`}
                    >
                      Zimmer {stay.room}
                    </Badge>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm text-stone-600 md:grid-cols-2">
                    <div data-testid={`stays-checkin-${stay.id}`}>
                      Check-in offen: {openIn}
                    </div>
                    <div data-testid={`stays-checkout-${stay.id}`}>
                      Check-out offen: {openOut}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
