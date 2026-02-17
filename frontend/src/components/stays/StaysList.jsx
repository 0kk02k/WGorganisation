import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { RoomBadge } from "@/components/ui/RoomBadge";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { Calendar, CheckCircle2, Circle } from "lucide-react";
import { format, parseISO, isPast, isFuture, isWithinInterval } from "date-fns";
import { de } from "date-fns/locale";

export const StaysList = ({
  stays,
  emptyLabel = "Keine Aufenthalte geplant.",
  testIdPrefix = "stays",
}) => {
  const { settings } = useSettings();
  const rooms = settings?.rooms || DEFAULT_ROOMS;

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

  const getStayStatus = (stay) => {
    const today = new Date();
    const start = parseISO(stay.start_date);
    const end = parseISO(stay.end_date);
    
    if (isWithinInterval(today, { start, end })) {
      return { status: "active", label: "Gerade da", color: "from-emerald-400 to-teal-400" };
    } else if (isFuture(start)) {
      return { status: "upcoming", label: "Bald", color: "from-blue-400 to-indigo-400" };
    } else {
      return { status: "past", label: "Vergangen", color: "from-gray-300 to-gray-400" };
    }
  };

  const getRoomColor = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.color || '#facc15';
  };

  return (
    <div className="space-y-4">
      {stays.map((stay) => {
        const openIn = stay.checklist_in?.filter((item) => !item.done).length || 0;
        const openOut = stay.checklist_out?.filter((item) => !item.done).length || 0;
        const totalTasks = (stay.checklist_in?.length || 0) + (stay.checklist_out?.length || 0);
        const completedTasks = totalTasks - openIn - openOut;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const stayStatus = getStayStatus(stay);
        const roomColor = getRoomColor(stay.room);

        return (
          <Link
            to={`/aufenthalte/${stay.id}`}
            key={stay.id}
            className="group block"
            data-testid={`${testIdPrefix}-card-${stay.id}`}
          >
            <Card className="bg-white border-4 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
              {/* Color accent bar at top */}
              <div 
                className="h-2 w-full"
                style={{ backgroundColor: roomColor }}
              />
              
              <CardContent className="p-0">
                <div className="flex">
                  {/* Left side - Room color accent */}
                  <div 
                    className="w-3 min-h-[120px] border-r-4 border-black"
                    style={{ backgroundColor: roomColor }}
                  />
                  
                  {/* Main content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Name and dates */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3
                            className="text-xl font-bold text-gray-800"
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                            data-testid={`${testIdPrefix}-name-${stay.id}`}
                          >
                            {stay.occupant_name}
                          </h3>
                          
                          {/* Status badge */}
                          <span 
                            className={`px-2 py-0.5 text-xs font-bold text-white border-2 border-black bg-gradient-to-r ${stayStatus.color}`}
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                          >
                            {stayStatus.label}
                          </span>
                        </div>
                        
                        {/* Date range */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span data-testid={`${testIdPrefix}-dates-${stay.id}`}>
                            {format(parseISO(stay.start_date), "dd. MMM", { locale: de })} - {format(parseISO(stay.end_date), "dd. MMM yyyy", { locale: de })}
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-600">
                              {completedTasks}/{totalTasks} Aufgaben
                            </span>
                            <span className="font-bold text-gray-800">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="h-3 bg-gray-200 border-2 border-black overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Checklist status badges */}
                        <div className="flex gap-3 text-sm">
                          <span 
                            className={`flex items-center gap-1 px-2 py-1 border-2 border-black font-semibold ${openIn === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                            data-testid={`${testIdPrefix}-open-in-${stay.id}`}
                          >
                            {openIn === 0 ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                            Check-in: {openIn} offen
                          </span>
                          <span 
                            className={`flex items-center gap-1 px-2 py-1 border-2 border-black font-semibold ${openOut === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                            data-testid={`${testIdPrefix}-open-out-${stay.id}`}
                          >
                            {openOut === 0 ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                            Check-out: {openOut} offen
                          </span>
                        </div>
                      </div>
                      
                      {/* Right: Room badge */}
                      <div className="flex flex-col items-end justify-between h-full py-1">
                        <RoomBadge
                          roomId={stay.room}
                          size="large"
                          testId={`${testIdPrefix}-room-${stay.id}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
