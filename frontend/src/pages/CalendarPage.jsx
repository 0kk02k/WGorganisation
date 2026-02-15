import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { staysApi, eventsApi } from "@/lib/appwrite";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StayDialog } from "@/components/stays/StayDialog";
import { StaysList } from "@/components/stays/StaysList";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
  isToday,
} from "date-fns";
import { de } from "date-fns/locale";

export default function CalendarPage() {
  const { settings } = useSettings();
  const [stays, setStays] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const rooms = settings?.rooms || DEFAULT_ROOMS;
  
  const room1 = rooms[0];
  const room2 = rooms[1];
  const room1Id = room1?.id || "A";
  const room2Id = room2?.id || "B";
  
  const getRoomLabel = (roomId) =>
    rooms.find((room) => room.id === roomId)?.name || `Zimmer ${roomId}`;
    
  const getRoomById = (roomId) =>
    rooms.find((room) => room.id === roomId);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [staysData, eventsData] = await Promise.all([
          staysApi.list(),
          eventsApi.list(),
        ]);
        setStays(staysData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const staysForDate = (date) =>
    stays.filter((stay) =>
      isWithinInterval(date, {
        start: parseISO(stay.start_date),
        end: parseISO(stay.end_date),
      }),
    );

  const eventsForDate = (date) =>
    events.filter((event) => isSameDay(parseISO(event.date), date));

  const selectedStays = staysForDate(selectedDate);
  const selectedEvents = eventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-white relative" data-testid="calendar-page">
      {/* Dot-Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative inline-block">
            <h1 
              className="text-4xl tracking-wide text-gray-800"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="calendar-title"
            >
              Zimmerbelegung
            </h1>
            <div className="h-2 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 mt-2" />
          </div>
          <StayDialog
            triggerLabel="Neue Belegung"
            triggerTestId="calendar-new-stay-button"
            onCreated={(stay) => setStays((prev) => [stay, ...prev])}
          />
        </div>

        {/* Calendar Grid Card */}
        <Card 
          className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          data-testid="calendar-grid-card"
        >
          <CardHeader className="bg-gradient-to-r from-teal-400 to-emerald-400 border-b-4 border-black flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4">
            <CardTitle 
              className="text-white text-2xl"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="calendar-month-title"
            >
              {format(currentMonth, "MMMM yyyy", { locale: de })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 p-2"
                onClick={() =>
                  setCurrentMonth((prev) =>
                    startOfMonth(new Date(prev.getFullYear(), prev.getMonth() - 1, 1)),
                  )
                }
                data-testid="calendar-prev-month"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 p-2"
                onClick={() =>
                  setCurrentMonth((prev) =>
                    startOfMonth(new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
                  )
                }
                data-testid="calendar-next-month"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((label) => (
                <div 
                  key={label} 
                  className="text-center text-sm font-bold text-gray-800 border-4 border-black bg-yellow-400 py-2"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  data-testid={`calendar-weekday-${label}`}
                >
                  {label}
                </div>
              ))}
            </div>
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const inMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const dayStays = staysForDate(day);
                const hasRoom1 = dayStays.some((stay) => stay.room === room1Id);
                const hasRoom2 = dayStays.some((stay) => stay.room === room2Id);
                const hasEvents = eventsForDate(day).length > 0;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`relative border-4 border-black p-2 text-left text-sm transition-all duration-150 min-h-[60px] ${
                      isSameDay(day, selectedDate)
                        ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1"
                    } ${!inMonth ? "opacity-40" : "opacity-100"} ${
                      isCurrentDay && !isSameDay(day, selectedDate)
                        ? "ring-4 ring-yellow-400"
                        : ""
                    }`}
                    data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                  >
                    {/* Room indicators */}
                    {hasRoom1 && (
                      <span
                        className="absolute left-1 right-1 top-1 h-2 border-2 border-black"
                        style={{ backgroundColor: room1?.color || '#facc15' }}
                        data-testid={`calendar-room-top-bar-${format(day, "yyyy-MM-dd")}`}
                      />
                    )}
                    {hasRoom2 && (
                      <span
                        className="absolute left-1 right-1 bottom-1 h-2 border-2 border-black"
                        style={{ backgroundColor: room2?.color || '#0ea5e9' }}
                        data-testid={`calendar-room-bottom-bar-${format(day, "yyyy-MM-dd")}`}
                      />
                    )}
                    <div className="flex items-center justify-center mt-2">
                      <span 
                        className="font-bold"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        data-testid={`calendar-day-label-${format(day, "yyyy-MM-dd")}`}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    {hasEvents && (
                      <span
                        className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-cyan-400 border-2 border-black"
                        data-testid={`calendar-event-dot-${format(day, "yyyy-MM-dd")}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Card */}
        <Card 
          className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          data-testid="calendar-selected-card"
        >
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 border-b-4 border-black p-4">
            <CardTitle 
              className="text-white text-2xl"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="calendar-selected-title"
            >
              {format(selectedDate, "EEEE, dd.MM.yyyy", { locale: de })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {selectedStays.length === 0 ? (
              <p 
                className="text-sm text-gray-500"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                data-testid="calendar-no-stays"
              >
                Keine Belegung an diesem Tag.
              </p>
            ) : (
              selectedStays.map((stay) => (
                <Link
                  key={stay.id}
                  to={`/aufenthalte/${stay.id}`}
                  className="block border-4 border-black p-4 bg-gradient-to-r from-amber-50 to-orange-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                  data-testid={`calendar-stay-link-${stay.id}`}
                >
                  <p
                    className="text-lg font-bold text-gray-800"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    data-testid={`calendar-stay-name-${stay.id}`}
                  >
                    {stay.occupant_name}
                  </p>
                  <p
                    className="text-sm text-gray-500"
                    data-testid={`calendar-stay-room-${stay.id}`}
                  >
                    {getRoomLabel(stay.room)}
                  </p>
                </Link>
              ))
            )}
            {selectedEvents.length > 0 && (
              <div className="space-y-2" data-testid="calendar-day-events">
                <p 
                  className="text-sm font-bold text-gray-800"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  data-testid="calendar-day-events-label"
                >
                  Veranstaltungstipps
                </p>
                {selectedEvents.map((event) => (
                  <Link
                    key={event.id}
                    to="/berlin"
                    className="block border-4 border-black p-4 bg-gradient-to-r from-cyan-50 to-teal-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                    data-testid={`calendar-event-link-${event.id}`}
                  >
                    <p 
                      className="text-lg font-bold text-gray-800"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stays List Section */}
        <div className="space-y-4" data-testid="calendar-stays-section">
          <div className="relative inline-block">
            <h2 
              className="text-3xl tracking-wide text-gray-800"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="calendar-stays-title"
            >
              Aufenthalte
            </h2>
            <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500 mt-2" />
          </div>
          <StaysList
            stays={stays}
            testIdPrefix="calendar-stays"
            emptyLabel="Keine Aufenthalte geplant."
          />
        </div>
      </div>
    </div>
  );
}
