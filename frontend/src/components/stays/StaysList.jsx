import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { RoomBadge } from "@/components/ui/RoomBadge";

export const StaysList = ({
  stays,
  emptyLabel = "Keine Aufenthalte geplant.",
  testIdPrefix = "stays",
}) => {
  if (!stays || stays.length === 0) {
    return (
      <Card 
        className="border-4 border-dashed border-gray-300 rounded-none bg-white"
        data-testid={`${testIdPrefix}-empty`}
      >
        <CardContent className="py-12 text-center">
          <p 
            className="text-gray-500 text-lg"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {emptyLabel}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stays.map((stay) => {
        const openIn = stay.checklist_in?.filter((item) => !item.done).length;
        const openOut = stay.checklist_out?.filter((item) => !item.done).length;
        return (
          <Link
            to={`/aufenthalte/${stay.id}`}
            key={stay.id}
            className="group block"
            data-testid={`${testIdPrefix}-card-${stay.id}`}
          >
            <Card className="bg-white border-4 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="space-y-2">
                  <p
                    className="text-lg font-bold text-gray-800"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    data-testid={`${testIdPrefix}-name-${stay.id}`}
                  >
                    {stay.occupant_name}
                  </p>
                  <p
                    className="text-sm text-gray-500"
                    data-testid={`${testIdPrefix}-dates-${stay.id}`}
                  >
                    {stay.start_date} - {stay.end_date}
                  </p>
                  <div className="flex gap-3 text-sm">
                    <span 
                      className="bg-teal-100 text-teal-800 px-2 py-1 border-2 border-black font-semibold"
                      data-testid={`${testIdPrefix}-open-in-${stay.id}`}
                    >
                      Check-in: {openIn} offen
                    </span>
                    <span 
                      className="bg-rose-100 text-rose-800 px-2 py-1 border-2 border-black font-semibold"
                      data-testid={`${testIdPrefix}-open-out-${stay.id}`}
                    >
                      Check-out: {openOut} offen
                    </span>
                  </div>
                </div>
                <RoomBadge
                  roomId={stay.room}
                  size="large"
                  testId={`${testIdPrefix}-room-${stay.id}`}
                />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
