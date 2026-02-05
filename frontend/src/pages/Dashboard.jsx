import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { HERO_IMAGE, DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { getRoomBadgeStyle } from "@/lib/color";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ClipboardList, Droplet } from "lucide-react";
import {
  format,
  parseISO,
  isWithinInterval,
  isAfter,
  differenceInMinutes,
} from "date-fns";

export default function Dashboard() {
  const { settings } = useSettings();
  const [stays, setStays] = useState([]);
  const [lastWatered, setLastWatered] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const staysResponse = await api.get("/stays");
      setStays(staysResponse.data);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("plantsWateredAt");
    if (stored) {
      setLastWatered(new Date(stored));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const rooms = settings?.rooms || DEFAULT_ROOMS;

  const activeStays = useMemo(
    () =>
      stays.filter((stay) =>
        isWithinInterval(today, {
          start: parseISO(stay.start_date),
          end: parseISO(stay.end_date),
        }),
      ),
    [stays, today],
  );

  const upcomingStays = useMemo(
    () =>
      stays
        .filter((stay) => isAfter(parseISO(stay.start_date), today))
        .sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
        )
        .slice(0, 3),
    [stays, today],
  );

  const getWateredLabel = () => {
    if (!lastWatered) return "Noch nicht erfasst";
    const minutes = differenceInMinutes(now, lastWatered);
    if (minutes < 1) return "Gerade eben";
    if (minutes < 60) return `vor ${minutes} Min.`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    const days = Math.floor(hours / 24);
    return `vor ${days} Tagen`;
  };

  const handleResetWatered = () => {
    const next = new Date();
    setLastWatered(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("plantsWateredAt", next.toISOString());
    }
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <section className="grid gap-4 lg:grid-cols-3" data-testid="dashboard-bento-grid">
        <Card
          className="overflow-hidden lg:col-span-2"
          data-testid="dashboard-hero-card"
        >
          <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <Badge
                className="w-fit rounded-full bg-[#CCFF00]/15 text-[#CCFF00]"
                data-testid="dashboard-hero-badge"
              >
                Organisation
              </Badge>
              <div className="space-y-3">
                <h1
                  className="text-3xl font-semibold tracking-tight text-white"
                  data-testid="dashboard-title"
                >
                  Check-in & Alltag im Griff
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full shadow-[0_0_20px_rgba(204,255,0,0.35)]"
                >
                  <Link to="/kalender" data-testid="dashboard-calendar-link">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Kalender öffnen
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-white/10 text-white/80 hover:text-white"
                >
                  <Link to="/aufenthalte" data-testid="dashboard-stays-link">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Aufenthalte
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl" data-testid="dashboard-hero-image">
              <img
                src={HERO_IMAGE}
                alt="Wohnung"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Card>
        <Card className="lg:col-span-1" data-testid="dashboard-plants-card">
          <CardHeader>
            <CardTitle data-testid="dashboard-plants-title">Pflanzen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div>
                <p
                  className="text-sm font-semibold text-white"
                  data-testid="dashboard-plants-status"
                >
                  Letzte Bewässerung
                </p>
                <p className="text-xs text-white/60" data-testid="dashboard-plants-timer">
                  {getWateredLabel()}
                </p>
              </div>
              <span
                className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/10 text-emerald-900"
                data-testid="dashboard-plants-icon"
              >
                <Droplet className="h-5 w-5" />
              </span>
            </div>
              <Button
              onClick={handleResetWatered}
              className="w-full rounded-full bg-[#CCFF00] text-black hover:bg-[#CCFF00]/80"
              data-testid="dashboard-plants-reset"
            >
              Jetzt gegossen
            </Button>
            <div
              className="overflow-hidden rounded-2xl border border-stone-200"
              data-testid="dashboard-plants-image"
            >
              <img
                src="https://images.unsplash.com/photo-1767244047794-94dc52f7b7db?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwzfHxsdXNoJTIwanVuZ2xlJTIwcGxhbnRzJTIwaW5kb29yfGVufDB8fHx8MTc3MDIxOTUyOHww&ixlib=rb-4.1.0&q=85"
                alt="Dschungelpflanzen"
                className="h-32 w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2" data-testid="dashboard-active-stays">
          <CardHeader>
            <CardTitle data-testid="dashboard-active-title">
              Aktive Aufenthalte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeStays.length === 0 ? (
              <p className="text-sm text-white/60" data-testid="dashboard-no-active">
                Keine aktiven Aufenthalte.
              </p>
            ) : (
              activeStays.map((stay) => (
                <div
                  key={stay.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  data-testid={`dashboard-active-stay-${stay.id}`}
                >
                  <div>
                    <p
                      className="text-sm font-semibold text-white"
                      data-testid={`dashboard-active-name-${stay.id}`}
                    >
                      {stay.occupant_name}
                    </p>
                    <p className="text-xs text-white/60" data-testid={`dashboard-active-dates-${stay.id}`}>
                      {format(parseISO(stay.start_date), "dd.MM.")} –
                      {" "}
                      {format(parseISO(stay.end_date), "dd.MM.yyyy")}
                    </p>
                  </div>
                  <Badge
                    style={getRoomBadgeStyle(
                      rooms.find((room) => room.id === stay.room)?.color,
                    )}
                    className="border border-transparent text-stone-900"
                    data-testid={`dashboard-active-room-${stay.id}`}
                  >
                    Zimmer {stay.room}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-1" data-testid="dashboard-upcoming-card">
          <CardHeader>
            <CardTitle data-testid="dashboard-upcoming-title">
              Nächste Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingStays.length === 0 ? (
              <p className="text-sm text-white/60" data-testid="dashboard-no-upcoming">
                Keine geplanten Check-ins.
              </p>
            ) : (
              upcomingStays.map((stay) => (
                <div
                  key={stay.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  data-testid={`dashboard-upcoming-${stay.id}`}
                >
                  <p
                    className="text-sm font-semibold text-white"
                    data-testid={`dashboard-upcoming-name-${stay.id}`}
                  >
                    {stay.occupant_name}
                  </p>
                  <p className="text-xs text-white/60" data-testid={`dashboard-upcoming-date-${stay.id}`}>
                    {format(parseISO(stay.start_date), "dd.MM.yyyy")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
