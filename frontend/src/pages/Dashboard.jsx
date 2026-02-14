import { useEffect, useMemo, useState } from "react";
 
import { staysApi, messagesApi } from "@/lib/appwrite";
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
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ChatMessage from "@/components/ChatMessage";

export default function Dashboard() {
  const { settings } = useSettings();
  const [stays, setStays] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({ name: "", content: "" });
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyForm, setReplyForm] = useState({ name: "", content: "" });
  const [lastWatered, setLastWatered] = useState(null);
  const [now, setNow] = useState(new Date());

  const loadStays = async () => {
    try {
      const data = await staysApi.list();
      setStays(data);
    } catch (error) {
      console.error("Failed to load stays:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await messagesApi.list();
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  useEffect(() => {
    Promise.all([loadStays(), loadMessages()]).catch(console.error);
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

  const today = useMemo(() => new Date(), []);
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
      const data = await messagesApi.create({
        name: messageForm.name.trim(),
        content: messageForm.content.trim(),
      });
      setMessages((prev) => [data, ...prev]);
      setMessageForm({ name: "", content: "" });
    } catch (error) {
      toast.error("Nachricht konnte nicht gesendet werden.");
    }
  };

  const startEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
    setReplyingToId(null);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessageId || !editingContent.trim()) {
      toast.error("Bitte eine Nachricht eingeben.");
      return;
    }
    try {
      const message = messages.find(m => m.id === editingMessageId);
      const data = await messagesApi.update(editingMessageId, {
        content: editingContent.trim(),
        replies: message?.replies || [],
      });
      setMessages((prev) =>
        prev.map((item) => (item.id === editingMessageId ? data : item)),
      );
      setEditingMessageId(null);
      setEditingContent("");
    } catch (error) {
      toast.error("Nachricht konnte nicht gespeichert werden.");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messagesApi.delete(messageId);
      setMessages((prev) => prev.filter((item) => item.id !== messageId));
      if (editingMessageId === messageId) {
        setEditingMessageId(null);
        setEditingContent("");
      }
      if (replyingToId === messageId) {
        setReplyingToId(null);
      }
    } catch (error) {
      toast.error("Nachricht konnte nicht gelöscht werden.");
    }
  };

  const startReply = (message) => {
    setReplyingToId(message.id);
    setReplyForm({ name: messageForm.name || "", content: "" });
    setEditingMessageId(null);
  };

  const handleReplySubmit = async (messageId) => {
    if (!replyForm.name.trim() || !replyForm.content.trim()) {
      toast.error("Bitte Name und Antwort ausfüllen.");
      return;
    }
    try {
      const message = messages.find(m => m.id === messageId);
      const newReply = {
        id: Date.now().toString(),
        name: replyForm.name.trim(),
        content: replyForm.content.trim(),
        created_at: new Date().toISOString(),
      };
      const replies = [...(message?.replies || []), newReply];
      const data = await messagesApi.update(messageId, {
        content: message?.content,
        replies: replies,
      });
      setMessages((prev) =>
        prev.map((item) => (item.id === messageId ? data : item)),
      );
      setReplyingToId(null);
      setReplyForm({ name: "", content: "" });
    } catch (error) {
      toast.error("Antwort konnte nicht gesendet werden.");
    }
  };

  const handleEditReply = async (messageId, replyId, newContent) => {
    try {
      const message = messages.find(m => m.id === messageId);
      const replies = (message?.replies || []).map((reply) =>
        reply.id === replyId ? { ...reply, content: newContent } : reply
      );
      const data = await messagesApi.update(messageId, {
        content: message?.content,
        replies: replies,
      });
      setMessages((prev) =>
        prev.map((item) => (item.id === messageId ? data : item)),
      );
    } catch (error) {
      toast.error("Antwort konnte nicht bearbeitet werden.");
    }
  };

  const handleDeleteReply = async (messageId, replyId) => {
    try {
      const message = messages.find(m => m.id === messageId);
      const replies = (message?.replies || []).filter(
        (reply) => reply.id !== replyId
      );
      const data = await messagesApi.update(messageId, {
        content: message?.content,
        replies: replies,
      });
      setMessages((prev) =>
        prev.map((item) => (item.id === messageId ? data : item)),
      );
    } catch (error) {
      toast.error("Antwort konnte nicht gelöscht werden.");
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#B026FF]/20 to-[#CCFF00]/20 h-48 flex items-center justify-center" data-testid="dashboard-organization-image">
              <span className="text-2xl font-bold text-white/40">BODDIN14</span>
            </div>
          </div>
        </Card>
        <Card className="lg:col-span-1" data-testid="dashboard-plants-card">
          <CardContent className="space-y-4 pt-6">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-green-900/30 to-[#B026FF]/20 h-56 flex items-center justify-center">
              <Droplet className="h-16 w-16 text-[#CCFF00]/40" />
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
                <Link
                  key={stay.id}
                  to={`/aufenthalte/${stay.id}`}
                  className="hover-lift flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                  data-testid={`dashboard-active-link-${stay.id}`}
                >
                  <div>
                    <p
                      className="text-sm font-semibold text-white"
                      data-testid={`dashboard-active-name-${stay.id}`}
                    >
                      {stay.occupant_name}
                    </p>
                    <p className="text-xs text-white/60" data-testid={`dashboard-active-dates-${stay.id}`}>
                      {format(parseISO(stay.start_date), "dd.MM.")} –{" "}
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
                </Link>
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
                <Link
                  key={stay.id}
                  to={`/aufenthalte/${stay.id}`}
                  className="hover-lift block rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                  data-testid={`dashboard-upcoming-link-${stay.id}`}
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
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3" data-testid="dashboard-chat-card">
          <CardHeader>
            <CardTitle data-testid="dashboard-chat-title">WG-Chat</CardTitle>
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
                <ChatMessage
                  key={message.id}
                  message={message}
                  isEditing={editingMessageId === message.id}
                  isReplying={replyingToId === message.id}
                  editingContent={editingContent}
                  setEditingContent={setEditingContent}
                  replyForm={replyForm}
                  setReplyForm={setReplyForm}
                  onEdit={() => startEditMessage(message)}
                  onDelete={() => handleDeleteMessage(message.id)}
                  onUpdate={handleUpdateMessage}
                  onCancelEdit={() => setEditingMessageId(null)}
                  onReply={() => startReply(message)}
                  onCancelReply={() => setReplyingToId(null)}
                  onReplySubmit={() => handleReplySubmit(message.id)}
                  onEditReply={handleEditReply}
                  onDeleteReply={handleDeleteReply}
                />
              ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
