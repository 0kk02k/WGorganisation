import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { staysApi, eventsApi } from "@/lib/appwrite";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { getRoomDotStyle } from "@/lib/color";
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
  const roomA = rooms.find((room) => room.id === "A");
  const roomB = rooms.find((room) => room.id === "B");
  const topRoom =
    rooms.find((room) => room.name?.toLowerCase().includes("claas")) ||
    roomB ||
    roomA;
  const bottomRoom =
    rooms.find((room) => room.name?.toLowerCase().includes("okko")) ||
    roomA ||
    roomB;
  const topRoomId = topRoom?.id || "A";
  const bottomRoomId = bottomRoom?.id || "B";
  const getRoomLabel = (roomId) =>
    rooms.find((room) => room.id === roomId)?.name || `Zimmer ${roomId}`;

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
    <div className="space-y-6" data-testid="calendar-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="calendar-title">
            Zimmerbelegung
          </h1>
        </div>
        <StayDialog
          triggerLabel="Neue Belegung"
          triggerTestId="calendar-new-stay-button"
          onCreated={(stay) => setStays((prev) => [stay, ...prev])}
        />
      </div>

      <Card className="border-stone-200/80" data-testid="calendar-grid-card">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle data-testid="calendar-month-title">
            {format(currentMonth, "MMMM yyyy", { locale: de })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentMonth((prev) =>
                  startOfMonth(new Date(prev.getFullYear(), prev.getMonth() - 1, 1)),
                )
              }
              data-testid="calendar-prev-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentMonth((prev) =>
                  startOfMonth(new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
                )
              }
              data-testid="calendar-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-xs text-stone-500">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((label) => (
              <div key={label} className="px-2" data-testid={`calendar-weekday-${label}`}>
                {label}
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const inMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const dayStays = staysForDate(day);
              const hasTopRoom = dayStays.some((stay) => stay.room === topRoomId);
              const hasBottomRoom = dayStays.some(
                (stay) => stay.room === bottomRoomId,
              );
              const hasEvents = eventsForDate(day).length > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`relative hover-lift rounded-2xl border border-stone-200 px-2 py-3 text-left text-sm transition-colors ${
                    isSameDay(day, selectedDate)
                      ? "bg-[#B026FF] text-white"
                      : "bg-white/5 hover:bg-white/10"
                  } ${!inMonth ? "opacity-40" : "opacity-100"} ${
                    isCurrentDay
                      ? "ring-1 ring-[#B026FF]/50 shadow-[0_0_22px_rgba(176,38,255,0.35)]"
                      : ""
                  }`}
                  data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                >
                  {hasTopRoom && (
                    <span
                      className="absolute left-2 right-2 top-1 h-1 rounded-full"
                      style={
                        topRoom?.color ? getRoomDotStyle(topRoom?.color) : undefined
                      }
                      data-testid={`calendar-room-top-bar-${format(day, "yyyy-MM-dd")}`}
                    />
                  )}
                  {hasBottomRoom && (
                    <span
                      className="absolute left-2 right-2 bottom-1 h-1 rounded-full"
                      style={
                        bottomRoom?.color
                          ? getRoomDotStyle(bottomRoom?.color)
                          : undefined
                      }
                      data-testid={`calendar-room-bottom-bar-${format(day, "yyyy-MM-dd")}`}
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span data-testid={`calendar-day-label-${format(day, "yyyy-MM-dd")}`}>
                      {format(day, "d")}
                    </span>
                  </div>
                  {hasEvents && (
                    <span
                      className="mt-2 inline-block h-1.5 w-3 rounded-full bg-[#B026FF]"
                      data-testid={`calendar-event-dot-${format(day, "yyyy-MM-dd")}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200/80" data-testid="calendar-selected-card">
        <CardHeader>
          <CardTitle data-testid="calendar-selected-title">
            {format(selectedDate, "EEEE, dd.MM.yyyy", { locale: de })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedStays.length === 0 ? (
            <p className="text-sm text-stone-600" data-testid="calendar-no-stays">
              Keine Belegung an diesem Tag.
            </p>
          ) : (
            selectedStays.map((stay) => (
              <Link
                key={stay.id}
                to={`/aufenthalte/${stay.id}`}
                className="hover-lift block rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                data-testid={`calendar-stay-link-${stay.id}`}
              >
                <p
                  className="text-sm font-semibold text-stone-900"
                  data-testid={`calendar-stay-name-${stay.id}`}
                >
                  {stay.occupant_name}
                </p>
                <p
                  className="text-xs text-stone-600"
                  data-testid={`calendar-stay-room-${stay.id}`}
                >
                  {getRoomLabel(stay.room)}
                </p>
              </Link>
            ))
          )}
          {selectedEvents.length > 0 && (
            <div className="space-y-2" data-testid="calendar-day-events">
              <p className="text-xs text-white/60" data-testid="calendar-day-events-label">
                Veranstaltungstipps
              </p>
              {selectedEvents.map((event) => (
                <Link
                  key={event.id}
                  to="/berlin"
                  className="hover-lift block rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  data-testid={`calendar-event-link-${event.id}`}
                >
                  <p className="text-sm font-semibold text-stone-900">{event.title}</p>
                  <p className="text-xs text-stone-600">{event.location}</p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    <div className="space-y-4" data-testid="calendar-stays-section">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" data-testid="calendar-stays-title">
          Aufenthalte
        </h2>
      </div>
      <StaysList
        stays={stays}
        testIdPrefix="calendar-stays"
        emptyLabel="Keine Aufenthalte geplant."
      />
    </div>
  </div>
  );
}
