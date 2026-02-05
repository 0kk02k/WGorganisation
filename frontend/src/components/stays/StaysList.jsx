import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { getRoomBadgeStyle } from "@/lib/color";

export const StaysList = ({
  stays,
  emptyLabel = "Keine Aufenthalte geplant.",
  testIdPrefix = "stays",
}) => {
  const { settings } = useSettings();
  const rooms = settings?.rooms || DEFAULT_ROOMS;

  if (!stays || stays.length === 0) {
    return (
      <Card className="border-dashed border-stone-300" data-testid={`${testIdPrefix}-empty`}>
        <CardContent className="py-8 text-center text-sm text-stone-600">
          {emptyLabel}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stays.map((stay) => {
        const roomColor = rooms.find((room) => room.id === stay.room)?.color;
        const openIn = stay.checklist_in?.filter((item) => !item.done).length;
        const openOut = stay.checklist_out?.filter((item) => !item.done).length;
        return (
          <Link
            to={`/aufenthalte/${stay.id}`}
            key={stay.id}
            className="group hover-lift"
            data-testid={`${testIdPrefix}-card-${stay.id}`}
          >
            <Card className="transition-colors group-hover:bg-white/5">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="space-y-2">
                  <p
                    className="text-sm font-semibold text-stone-900"
                    data-testid={`${testIdPrefix}-name-${stay.id}`}
                  >
                    {stay.occupant_name}
                  </p>
                  <p
                    className="text-xs text-stone-600"
                    data-testid={`${testIdPrefix}-dates-${stay.id}`}
                  >
                    {stay.start_date} – {stay.end_date}
                  </p>
                  <div className="flex gap-3 text-xs text-stone-600">
                    <span data-testid={`${testIdPrefix}-open-in-${stay.id}`}>
                      Check-in offen: {openIn}
                    </span>
                    <span data-testid={`${testIdPrefix}-open-out-${stay.id}`}>
                      Check-out offen: {openOut}
                    </span>
                  </div>
                </div>
                <Badge
                  style={getRoomBadgeStyle(roomColor)}
                  className="border border-transparent text-stone-900"
                  data-testid={`${testIdPrefix}-room-${stay.id}`}
                >
                  Zimmer {stay.room}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
