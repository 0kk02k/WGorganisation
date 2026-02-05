import { useEffect, useMemo, useState } from "react";
 
import { api } from "@/lib/api";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { getRoomBadgeStyle } from "@/lib/color";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Droplet } from "lucide-react";
import {
  format,
  parseISO,
  isWithinInterval,
  isAfter,
  differenceInMinutes,
} from "date-fns";
import { toast } from "sonner";

export default function Dashboard() {
  const { settings } = useSettings();
  const [stays, setStays] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({ name: "", content: "" });
  const [lastWatered, setLastWatered] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const [staysResponse, messagesResponse] = await Promise.all([
        api.get("/stays"),
        api.get("/messages"),
      ]);
      setStays(staysResponse.data);
      setMessages(messagesResponse.data);
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

  const handleSendMessage = async () => {
    if (!messageForm.name.trim() || !messageForm.content.trim()) {
      toast.error("Bitte Name und Nachricht ausfüllen.");
      return;
    }
    try {
      const response = await api.post("/messages", {
        name: messageForm.name.trim(),
        content: messageForm.content.trim(),
      });
      setMessages((prev) => [response.data, ...prev]);
      setMessageForm({ name: "", content: "" });
    } catch (error) {
      toast.error("Nachricht konnte nicht gesendet werden.");
    }
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <section className="grid gap-4 lg:grid-cols-3" data-testid="dashboard-bento-grid">
        <Card
          className="overflow-hidden lg:col-span-2 max-[755px]:hidden"
          data-testid="dashboard-hero-card"
        >
          <div className="p-4">
            <div className="relative overflow-hidden rounded-2xl" data-testid="dashboard-organization-image">
              <img
            src="https://customer-assets.emergentagent.com/job_be727098-640a-484b-81f2-277fe0fddb15/artifacts/mez14nh4_image.png"
                alt="Organisation Visual"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Card>
        <Card className="lg:col-span-1" data-testid="dashboard-plants-card">
          <CardContent className="space-y-4 pt-6">
            <div className="overflow-hidden rounded-2xl border border-stone-200">
              <img
                src="https://customer-assets.emergentagent.com/job_be727098-640a-484b-81f2-277fe0fddb15/artifacts/wjz1h4j6_image.png"
                alt="Neonpalme"
                className="h-56 w-full object-cover"
                data-testid="dashboard-plants-image"
              />
            </div>
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
                className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#B026FF]/20 text-[#B026FF]"
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
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
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
                  {rooms.find((room) => room.id === stay.room)?.name || `Zimmer ${stay.room}`}
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
                  className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
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
        <Card className="lg:col-span-3" data-testid="dashboard-chat-card">
          <CardHeader>
            <CardTitle data-testid="dashboard-chat-title">Haus-Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
              <div className="space-y-2">
                <label
                  className="text-xs text-white/60"
                  data-testid="chat-name-label"
                >
                  Dein Name
                </label>
                <Input
                  value={messageForm.name}
                  onChange={(event) =>
                    setMessageForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="z.B. Lea"
                  data-testid="chat-name-input"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-xs text-white/60"
                  data-testid="chat-message-label"
                >
                  Nachricht
                </label>
                <Textarea
                  rows={2}
                  value={messageForm.content}
                  onChange={(event) =>
                    setMessageForm((prev) => ({ ...prev, content: event.target.value }))
                  }
                  placeholder="Kurze Info für alle"
                  data-testid="chat-message-input"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSendMessage}
                  className="w-full rounded-full bg-[#CCFF00] text-black hover:bg-[#CCFF00]/80"
                  data-testid="chat-send-button"
                >
                  Senden
                </Button>
              </div>
            </div>
            <div className="space-y-3" data-testid="chat-messages-list">
              {messages.length === 0 ? (
                <p className="text-sm text-white/60" data-testid="chat-empty">
                  Noch keine Nachrichten. Starte den Chat.
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                    data-testid={`chat-message-${message.id}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {message.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {format(parseISO(message.created_at), "dd.MM HH:mm")}
                      </p>
                    </div>
                    <p className="text-sm text-white/70">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
