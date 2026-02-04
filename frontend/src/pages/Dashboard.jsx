import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { HERO_IMAGE, ROOMS } from "@/lib/constants";
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
  const [stays, setStays] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [lastWatered, setLastWatered] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const [staysResponse, manualsResponse] = await Promise.all([
        api.get("/stays"),
        api.get("/manuals"),
      ]);
      setStays(staysResponse.data);
      setManuals(manualsResponse.data);
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

  const roomOverview = ROOMS.map((room) => {
    const activeStay = activeStays.find((stay) => stay.room === room.id);
    return { room, activeStay };
  });

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
    <div className="space-y-8" data-testid="dashboard-page">
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card
          className="overflow-hidden border-stone-200/80 bg-white/70"
          data-testid="dashboard-hero-card"
        >
          <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <Badge
                className="w-fit rounded-full bg-emerald-900/10 text-emerald-900"
                data-testid="dashboard-hero-badge"
              >
                Organisation
              </Badge>
              <div className="space-y-3">
                <h1
                  className="font-[Manrope] text-3xl font-bold tracking-tight text-stone-900"
                  data-testid="dashboard-title"
                >
                  Check-in & Alltag im Griff
                </h1>
                <p className="text-stone-600" data-testid="dashboard-subtitle">
                  Verwalte Belegungen, Checklisten und Gerätewissen in einer
                  gemeinsamen Übersicht.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full">
                  <Link to="/kalender" data-testid="dashboard-calendar-link">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Kalender öffnen
                  </Link>
                </Button>
                <Button variant="outline" asChild className="rounded-full">
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
        <Card
          className="border-stone-200/80 bg-white/80"
          data-testid="dashboard-plants-card"
        >
          <CardHeader>
            <CardTitle data-testid="dashboard-plants-title">
              Pflanzen gegossen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div>
                <p
                  className="text-sm font-semibold text-stone-900"
                  data-testid="dashboard-plants-status"
                >
                  Letzte Bewässerung
                </p>
                <p
                  className="text-xs text-stone-600"
                  data-testid="dashboard-plants-timer"
                >
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
              className="w-full rounded-full bg-emerald-900 text-emerald-50 hover:bg-emerald-800"
              data-testid="dashboard-plants-reset"
            >
              Jetzt gegossen
            </Button>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p
                className="text-sm font-semibold text-stone-900"
                data-testid="dashboard-manual-count-label"
              >
                Bedienungsanleitungen
              </p>
              <p
                className="text-xs text-stone-600"
                data-testid="dashboard-manual-count"
              >
                {manuals.length} Geräte dokumentiert
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <Card className="border-stone-200/80" data-testid="dashboard-active-stays">
          <CardHeader>
            <CardTitle data-testid="dashboard-active-title">
              Aktive Aufenthalte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeStays.length === 0 ? (
              <p className="text-sm text-stone-600" data-testid="dashboard-no-active">
                Keine aktiven Aufenthalte.
              </p>
            ) : (
              activeStays.map((stay) => (
                <div
                  key={stay.id}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  data-testid={`dashboard-active-stay-${stay.id}`}
                >
                  <div>
                    <p
                      className="text-sm font-semibold text-stone-900"
                      data-testid={`dashboard-active-name-${stay.id}`}
                    >
                      {stay.occupant_name}
                    </p>
                    <p
                      className="text-xs text-stone-600"
                      data-testid={`dashboard-active-dates-${stay.id}`}
                    >
                      {format(parseISO(stay.start_date), "dd.MM.")} –
                      {" "}
                      {format(parseISO(stay.end_date), "dd.MM.yyyy")}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      ROOMS.find((room) => room.id === stay.room)?.badge ||
                      "bg-stone-100 text-stone-900"
                    }`}
                    data-testid={`dashboard-active-room-${stay.id}`}
                  >
                    Zimmer {stay.room}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="border-stone-200/80" data-testid="dashboard-upcoming-card">
          <CardHeader>
            <CardTitle data-testid="dashboard-upcoming-title">
              Nächste Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingStays.length === 0 ? (
              <p className="text-sm text-stone-600" data-testid="dashboard-no-upcoming">
                Keine geplanten Check-ins.
              </p>
            ) : (
              upcomingStays.map((stay) => (
                <div
                  key={stay.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  data-testid={`dashboard-upcoming-${stay.id}`}
                >
                  <p
                    className="text-sm font-semibold text-stone-900"
                    data-testid={`dashboard-upcoming-name-${stay.id}`}
                  >
                    {stay.occupant_name}
                  </p>
                  <p
                    className="text-xs text-stone-600"
                    data-testid={`dashboard-upcoming-date-${stay.id}`}
                  >
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
