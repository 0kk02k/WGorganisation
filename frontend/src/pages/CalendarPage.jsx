import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { staysApi, eventsApi } from "@/lib/api";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomBadge } from "@/components/ui/RoomBadge";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Skeleton } from "@/components/ui/skeleton";
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
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp, calendarCellHover } from "@/lib/motion";

export default function CalendarPage() {
  const { settings } = useSettings();
  const location = useLocation();
  const [stays, setStays] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const rooms = settings?.rooms || DEFAULT_ROOMS;

  useEffect(() => {
    const loadData = async () => {
      setLoadError(null);
      try {
        const [staysData, eventsData] = await Promise.all([
          staysApi.list(),
          eventsApi.list(),
        ]);
        setStays(staysData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoadError(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [location.key]); // Reload data when navigating back to this page

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

  // Mobile Agenda: Tage des Monats mit mindestens einer Belegung oder einem Tipp
  const agendaDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    })
      .map((day) => ({
        day,
        stays: staysForDate(day),
        events: eventsForDate(day),
      }))
      .filter(({ stays: dayStays, events: dayEvents }) => dayStays.length > 0 || dayEvents.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, stays, events]);

  const selectedStays = staysForDate(selectedDate);
  const selectedEvents = eventsForDate(selectedDate);

  const upcomingOrCurrentStays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return stays
      .filter((stay) => {
        const end = parseISO(stay.end_date);
        return end >= today;
      })
      .sort((a, b) => parseISO(a.start_date) - parseISO(b.start_date));
  }, [stays]);

  return (
    <div className="min-h-screen relative" data-testid="calendar-page">
      <motion.div
        className="relative z-10 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-4">
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
        </motion.div>

        {/* Calendar Grid Card */}
        <motion.div variants={staggerItem}>
        <Card 
          className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          data-testid="calendar-grid-card"
        >
          <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 border-b-4 border-black flex flex-row items-center justify-between gap-4 p-4">
            <CardTitle 
              className="text-white text-2xl"
              style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
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
                aria-label="Vorheriger Monat"
              >
                <ChevronLeft className="!h-5 !w-5" />
              </Button>
              <Button
                className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 p-2"
                onClick={() =>
                  setCurrentMonth((prev) =>
                    startOfMonth(new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
                  )
                }
                data-testid="calendar-next-month"
                aria-label="Nächster Monat"
              >
                <ChevronRight className="!h-5 !w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-teal-400/10">
            {loadError ? (
              <ErrorCard
                title="Kalenderdaten konnten nicht geladen werden."
                onRetry={() => {
                  setLoading(true);
                  loadData();
                }}
                testId="calendar-error"
              />
            ) : loading ? (
              <div aria-hidden="true">
                <div className="hidden md:grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={`grid-${i}`} className="h-[72px] rounded-none bg-gray-200" />
                  ))}
                </div>
                <div className="md:hidden space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={`agenda-${i}`} className="h-16 rounded-none bg-gray-200" />
                  ))}
                </div>
              </div>
            ) : (
            <>
            {/* Weekday Headers (nur Grid-Layout ab Tablet) */}
            <div className="hidden md:grid grid-cols-7 gap-2 mb-2">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((label) => (
                <div
                  key={label}
                  className="text-center text-sm font-bold text-black border-4 border-black bg-yellow-400 py-2"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  data-testid={`calendar-weekday-${label}`}
                >
                  {label}
                </div>
              ))}
            </div>
            {/* Room Legend */}
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3"
              data-testid="calendar-room-legend"
            >
              <span
                className="text-sm font-bold text-gray-800"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Legende:
              </span>
              {rooms.map((room) => (
                <span key={room.id} className="flex items-center gap-2">
                  <span
                    className="h-3 w-6 border-2 border-black"
                    style={{ backgroundColor: room.color }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-sm text-gray-800"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {room.name}
                  </span>
                </span>
              ))}
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full bg-cyan-400 border-2 border-black"
                  aria-hidden="true"
                />
                <span
                  className="text-sm text-gray-800"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Veranstaltungstipp
                </span>
              </span>
            </div>
            {/* Calendar Days (Grid ab Tablet) */}
            <div className="hidden md:grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const inMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const dayStays = staysForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const activeRooms = rooms.filter((room) =>
                  dayStays.some((stay) => stay.room === room.id),
                );
                const hasEvents = eventsForDate(day).length > 0;

                return (
                  <motion.button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    aria-pressed={isSelected}
                    aria-current={isCurrentDay ? "date" : undefined}
                    aria-label={`${format(day, "EEEE, dd.MM.yyyy", { locale: de })}${
                      dayStays.length > 0
                        ? `, ${dayStays.length} Belegung${dayStays.length > 1 ? "en" : ""}`
                        : ", keine Belegung"
                    }${hasEvents ? ", Veranstaltungstipp" : ""}`}
                    className={`flex flex-col border-4 border-black p-1.5 text-left text-sm transition-all duration-150 min-h-[72px] hover:z-10 ${
                      isSelected
                        ? "bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    } ${!inMonth ? "opacity-40" : "opacity-100"}`}
                    data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                    {...calendarCellHover}
                  >
                    {/* Room indicators - Farbbalken im Textfluss, über der Tageszahl */}
                    <span className="flex w-full flex-col gap-[3px] min-h-[12px]" aria-hidden="true">
                      {activeRooms.map((room) => (
                        <span
                          key={room.id}
                          className="flex h-3 w-full items-center justify-center border-2 border-black text-[9px] font-bold leading-none text-gray-900"
                          style={{ backgroundColor: room.color }}
                          data-testid={`calendar-room-bar-${room.id}-${format(day, "yyyy-MM-dd")}`}
                        >
                          {(room.name || "?").trim().charAt(0).toUpperCase()}
                        </span>
                      ))}
                    </span>
                    <div className="mt-auto flex items-center justify-center gap-1 pt-1.5">
                      <span
                        className={`font-bold leading-tight ${
                          isSelected
                            ? isCurrentDay
                              ? "border-2 border-black bg-white px-1 text-black"
                              : "text-white"
                            : isCurrentDay
                              ? "border-2 border-black bg-yellow-400 px-1 text-black"
                              : "text-gray-800"
                        }`}
                        style={{
                          fontFamily: "'Nunito', sans-serif",
                          ...(isSelected && !isCurrentDay
                            ? { textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }
                            : {}),
                        }}
                        data-testid={`calendar-day-label-${format(day, "yyyy-MM-dd")}`}
                      >
                        {format(day, "d")}
                      </span>
                      {hasEvents && (
                        <span
                          className="h-3 w-3 rounded-full bg-cyan-400 border-2 border-black flex-shrink-0"
                          data-testid={`calendar-event-dot-${format(day, "yyyy-MM-dd")}`}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            {/* Mobile Agenda: nur Tage mit Inhalt, jede Zeile self-suffizient verlinkt */}
            <div className="md:hidden space-y-4" data-testid="calendar-mobile-agenda">
              {agendaDays.length === 0 ? (
                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  data-testid="calendar-agenda-empty"
                >
                  Keine Belegungen oder Veranstaltungstipps im{" "}
                  {format(currentMonth, "MMMM", { locale: de })}.
                </p>
              ) : (
                agendaDays.map(({ day, stays: dayStays, events: dayEvents }) => {
                  const isCurrentDay = isToday(day);
                  const activeRooms = rooms.filter((room) =>
                    dayStays.some((stay) => stay.room === room.id),
                  );
                  return (
                    <div
                      key={day.toISOString()}
                      className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      data-testid={`calendar-agenda-day-${format(day, "yyyy-MM-dd")}`}
                    >
                      <div
                        className={`flex items-center justify-between gap-2 border-b-4 border-black px-3 py-2 ${
                          isCurrentDay ? "bg-yellow-400" : "bg-gray-100"
                        }`}
                      >
                        <span
                          className="text-sm font-bold text-black"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                          {format(day, "EEEE, dd.MM.", { locale: de })}
                          {isCurrentDay ? " · Heute" : ""}
                        </span>
                        <span className="flex items-center gap-1" aria-hidden="true">
                          {activeRooms.map((room) => (
                            <span
                              key={room.id}
                              className="flex h-5 items-center border-2 border-black px-1 text-[10px] font-bold leading-none text-gray-900"
                              style={{ backgroundColor: room.color }}
                            >
                              {(room.name || "?").trim().charAt(0).toUpperCase()}
                            </span>
                          ))}
                          {dayEvents.length > 0 && (
                            <span className="h-3 w-3 rounded-full bg-cyan-400 border-2 border-black" />
                          )}
                        </span>
                      </div>
                      <div className="divide-y-2 divide-gray-200">
                        {dayStays.map((stay) => (
                          <Link
                            key={stay.id}
                            to={`/aufenthalte/${stay.id}`}
                            className="flex min-h-[44px] items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors duration-150"
                            data-testid={`calendar-agenda-stay-${stay.id}`}
                          >
                            <span>
                              <span
                                className="block text-base font-bold text-gray-800"
                                style={{ fontFamily: "'Nunito', sans-serif" }}
                              >
                                {stay.occupant_name}
                              </span>
                              <span className="block text-sm text-gray-500">
                                {format(parseISO(stay.start_date), "dd.MM.")}
                                {" – "}
                                {format(parseISO(stay.end_date), "dd.MM.yyyy")}
                              </span>
                            </span>
                            <RoomBadge roomId={stay.room} testId={`calendar-agenda-room-${stay.id}`} />
                          </Link>
                        ))}
                        {dayEvents.map((event) => (
                          <Link
                            key={event.id}
                            to="/berlin"
                            className="flex min-h-[44px] items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors duration-150"
                            data-testid={`calendar-agenda-event-${event.id}`}
                          >
                            <span
                              className="h-3 w-3 rounded-full bg-cyan-400 border-2 border-black flex-shrink-0"
                              aria-hidden="true"
                            />
                            <span>
                              <span
                                className="block text-base font-bold text-gray-800"
                                style={{ fontFamily: "'Nunito', sans-serif" }}
                              >
                                {event.title}
                              </span>
                              <span className="block text-sm text-gray-500">{event.location}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            </>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* Selected Date Card (nur Grid-Layout ab Tablet; mobil übernimmt die Agenda) */}
        <motion.div variants={staggerItem} className="hidden md:block">
        <Card 
          className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          data-testid="calendar-selected-card"
        >
          <CardHeader className="bg-white border-b-4 border-black p-4">
            <CardTitle
              className="text-gray-800 text-2xl"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="calendar-selected-title"
            >
              {format(selectedDate, "EEEE, dd.MM.yyyy", { locale: de })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 bg-amber-500/10">
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
                  className="flex items-center justify-between border-2 border-black p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                  data-testid={`calendar-stay-link-${stay.id}`}
                >
                  <div>
                    <p
                      className="text-lg font-bold text-gray-800"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                      data-testid={`calendar-stay-name-${stay.id}`}
                    >
                      {stay.occupant_name}
                    </p>
                    <p
                      className="text-sm text-gray-500"
                      data-testid={`calendar-stay-dates-${stay.id}`}
                    >
                      {format(parseISO(stay.start_date), "dd.MM.")} - {format(parseISO(stay.end_date), "dd.MM.yyyy")}
                    </p>
                  </div>
                  <RoomBadge
                    roomId={stay.room}
                    testId={`calendar-stay-room-${stay.id}`}
                  />
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
                    className="block border-2 border-black p-4 bg-gradient-to-r from-cyan-50 to-teal-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
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
        </motion.div>

        {/* Upcoming & Current Stays */}
        <motion.div variants={staggerItem} className="space-y-4" data-testid="calendar-stays-section">
          <div className="relative inline-block">
            <h2 
              className="text-3xl tracking-wide text-gray-800"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="calendar-stays-title"
            >
              Kommende Aufenthalte
            </h2>
            <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500 mt-2" />
          </div>
          <StaysList
            stays={upcomingOrCurrentStays}
            testIdPrefix="calendar-stays"
            emptyLabel="Keine kommenden Aufenthalte."
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
