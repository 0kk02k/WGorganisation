import { useEffect, useMemo, useState, useRef } from "react";
import { staysApi, messagesApi } from "@/lib/appwrite";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomBadge } from "@/components/ui/RoomBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Droplet, ChevronDown, Search, Maximize2, Minimize2 } from "lucide-react";
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

const INITIAL_VISIBLE_COUNT = 7;
const EXPANDED_VISIBLE_COUNT = 15;

export default function Dashboard() {
  const { settings, updateSettings } = useSettings();
  const [stays, setStays] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({ name: "", content: "" });
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyForm, setReplyForm] = useState({ name: "", content: "" });
  const [now, setNow] = useState(new Date());
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [chatExpanded, setChatExpanded] = useState(false);
  const chatContainerRef = useRef(null);

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
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, showAllMessages]);

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

  const getWateredTime = () => {
    const lastWatered = settings?.plantsWateredAt;
    if (!lastWatered) return { days: 0, hours: 0, minutes: 0, hasData: false };
    const lastWateredDate = new Date(lastWatered);
    const totalMinutes = differenceInMinutes(now, lastWateredDate);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
    return { days, hours, minutes, hasData: true };
  };

  const wateredTime = getWateredTime();

  const handleResetWatered = async () => {
    try {
      const now = new Date();
      const result = await updateSettings({ plantsWateredAt: now.toISOString() });
      console.log("Settings updated:", result);
      setNow(now); // Update the now state to immediately show the counter
      toast.success("Gießzeit gespeichert.");
    } catch (error) {
      console.error("Failed to save watered time:", error);
      toast.error("Speichern fehlgeschlagen.");
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
    <div className="min-h-screen relative" data-testid="dashboard-page">
      <div className="relative z-10 space-y-6" data-testid="dashboard-bento-grid">
        {/* Header */}
        <div className="relative inline-block">
          <h1 
            className="text-4xl tracking-wide text-gray-800"
            style={{ fontFamily: "'Bangers', cursive" }}
          >
            Übersicht
          </h1>
          <div className="h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-teal-400 mt-2" />
        </div>

        {/* Top Row: Stays + Plants */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Active Stays + Upcoming Check-ins stacked */}
          <div className="flex flex-col gap-6">
            {/* Active Stays */}
            <Card 
              className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
              data-testid="dashboard-active-stays"
            >
              <CardHeader className="bg-gradient-to-r from-pink-500 to-orange-500 border-b-4 border-black p-4">
                <CardTitle 
                  className="text-white text-2xl"
                  style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                  data-testid="dashboard-active-title"
                >
                  Aktuelle Aufenthalte
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 bg-pink-500/10">
                {activeStays.length === 0 ? (
                  <p 
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    data-testid="dashboard-no-active"
                  >
                    Keine aktiven Aufenthalte.
                  </p>
                ) : (
                  activeStays.map((stay) => (
                    <Link
                      key={stay.id}
                      to={`/aufenthalte/${stay.id}`}
                      className="flex items-center justify-between border-4 border-black p-4 bg-gradient-to-r from-amber-50 to-orange-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                      data-testid={`dashboard-active-link-${stay.id}`}
                    >
                      <div>
                        <p
                          className="text-lg font-bold text-gray-800"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                          data-testid={`dashboard-active-name-${stay.id}`}
                        >
                          {stay.occupant_name}
                        </p>
                        <p 
                          className="text-sm text-gray-500"
                          data-testid={`dashboard-active-dates-${stay.id}`}
                        >
                          {format(parseISO(stay.start_date), "dd.MM.")} -{" "}
                          {format(parseISO(stay.end_date), "dd.MM.yyyy")}
                        </p>
                      </div>
                      <RoomBadge
                        roomId={stay.room}
                        testId={`dashboard-active-room-${stay.id}`}
                      />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Check-ins */}
            <Card 
              className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
              data-testid="dashboard-upcoming-card"
            >
              <CardHeader className="bg-gradient-to-r from-teal-400 to-cyan-400 border-b-4 border-black p-4">
                <CardTitle 
                  className="text-white text-2xl"
                  style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                  data-testid="dashboard-upcoming-title"
                >
                  Nachste Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 bg-teal-400/10">
                {upcomingStays.length === 0 ? (
                  <p 
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    data-testid="dashboard-no-upcoming"
                  >
                    Keine geplanten Check-ins.
                  </p>
                ) : (
                  upcomingStays.map((stay) => (
                    <Link
                      key={stay.id}
                      to={`/aufenthalte/${stay.id}`}
                      className="flex items-center justify-between border-4 border-black p-4 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                      data-testid={`dashboard-upcoming-link-${stay.id}`}
                    >
                      <div>
                        <p
                          className="text-lg font-bold text-gray-800"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                          data-testid={`dashboard-upcoming-name-${stay.id}`}
                        >
                          {stay.occupant_name}
                        </p>
                        <p 
                          className="text-sm text-gray-500"
                          data-testid={`dashboard-upcoming-date-${stay.id}`}
                        >
                          {format(parseISO(stay.start_date), "dd.MM.yyyy")}
                        </p>
                      </div>
                      <RoomBadge
                        roomId={stay.room}
                        testId={`dashboard-upcoming-room-${stay.id}`}
                      />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Plants Card - Same height as left column */}
          <Card 
            className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
            data-testid="dashboard-plants-card"
          >
            <CardHeader className="bg-gradient-to-r from-emerald-400 to-teal-400 border-b-4 border-black p-4">
              <CardTitle 
                className="text-white text-2xl"
                style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
              >
                Pflanzen
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col flex-1 bg-emerald-400/10">
              {/* Plant image */}
              <div className="h-40 border-4 border-black mb-4 overflow-hidden">
                <img 
                  src="/plant.png" 
                  alt="Pflanzen gießen" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Graphical Counter - directly under image */}
              {wateredTime.hasData ? (
                <div className="mb-4">
                  {/* Digital Counter Display - stretched */}
                  <div className="flex justify-center items-center gap-1">
                    {/* Days */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-20 h-14 bg-black flex items-center justify-center border-4 border-black"
                        style={{ boxShadow: "4px 4px 0px 0px rgba(16, 185, 129, 1)" }}
                      >
                        <span 
                          className="text-3xl font-bold text-emerald-400"
                          style={{ fontFamily: "'Bangers', cursive" }}
                        >
                          {String(wateredTime.days).padStart(2, '0')}
                        </span>
                      </div>
                      <span 
                        className="text-xs font-bold text-gray-600 mt-1"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        TAGE
                      </span>
                    </div>
                    
                    {/* Separator */}
                    <span 
                      className="text-2xl font-bold text-black animate-pulse"
                      style={{ fontFamily: "'Bangers', cursive" }}
                    >
                      :
                    </span>
                    
                    {/* Hours */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-20 h-14 bg-black flex items-center justify-center border-4 border-black"
                        style={{ boxShadow: "4px 4px 0px 0px rgba(16, 185, 129, 1)" }}
                      >
                        <span 
                          className="text-3xl font-bold text-teal-400"
                          style={{ fontFamily: "'Bangers', cursive" }}
                        >
                          {String(wateredTime.hours).padStart(2, '0')}
                        </span>
                      </div>
                      <span 
                        className="text-xs font-bold text-gray-600 mt-1"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        STUNDEN
                      </span>
                    </div>
                    
                    {/* Separator */}
                    <span 
                      className="text-2xl font-bold text-black animate-pulse"
                      style={{ fontFamily: "'Bangers', cursive" }}
                    >
                      :
                    </span>
                    
                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-20 h-14 bg-black flex items-center justify-center border-4 border-black"
                        style={{ boxShadow: "4px 4px 0px 0px rgba(16, 185, 129, 1)" }}
                      >
                        <span 
                          className="text-3xl font-bold text-cyan-400"
                          style={{ fontFamily: "'Bangers', cursive" }}
                        >
                          {String(wateredTime.minutes).padStart(2, '0')}
                        </span>
                      </div>
                      <span 
                        className="text-xs font-bold text-gray-600 mt-1"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        MIN
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 text-center">
                  <p 
                    className="text-gray-500 font-bold"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Noch nicht erfasst
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleResetWatered}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                data-testid="dashboard-plants-reset"
              >
                <Droplet className="h-4 w-4 mr-2" />
                Jetzt gegossen
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Chat Card - Full width below */}
        <Card 
          className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          data-testid="dashboard-chat-card"
        >
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 border-b-4 border-black p-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle 
                  className="text-white text-2xl"
                  style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                  data-testid="dashboard-chat-title"
                >
                  WG-Chat
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Suchen..."
                    className="pl-9 h-10 border-4 border-black rounded-none bg-white text-gray-800 placeholder:text-gray-400"
                    data-testid="chat-search-input"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 bg-purple-500/10">
              <div
                ref={chatContainerRef}
                className="space-y-3 overflow-y-auto pr-2 transition-all duration-300"
                style={{ maxHeight: chatExpanded ? '800px' : '400px' }}
                data-testid="chat-messages-list"
              >
                {messages.length === 0 ? (
                  <p 
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    data-testid="chat-empty"
                  >
                    Noch keine Nachrichten. Starte den Chat.
                  </p>
                ) : (
                  (() => {
                    const searchLower = chatSearch.toLowerCase().trim();
                    const filteredMessages = searchLower
                      ? messages.filter((msg) => {
                          const nameMatch = msg.name.toLowerCase().includes(searchLower);
                          const contentMatch = msg.content.toLowerCase().includes(searchLower);
                          const replyMatch = msg.replies?.some(
                            (reply) =>
                              reply.name.toLowerCase().includes(searchLower) ||
                              reply.content.toLowerCase().includes(searchLower)
                          );
                          return nameMatch || contentMatch || replyMatch;
                        })
                      : messages;

                    if (filteredMessages.length === 0) {
                      return (
                        <p className="text-sm text-gray-500">
                          Keine Nachrichten gefunden fur "{chatSearch}"
                        </p>
                      );
                    }

                    const maxVisible = showAllMessages ? EXPANDED_VISIBLE_COUNT : INITIAL_VISIBLE_COUNT;
                    const visibleMessages = filteredMessages.slice(0, maxVisible);
                    const reversedMessages = [...visibleMessages].reverse();
                    return (
                      <>
                        {reversedMessages.map((message) => (
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
                        ))}
                        {filteredMessages.length > INITIAL_VISIBLE_COUNT && !showAllMessages && (
                          <Button
                            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            onClick={() => setShowAllMessages(true)}
                            data-testid="chat-show-more"
                          >
                            <ChevronDown className="h-4 w-4 mr-2" />
                            {filteredMessages.length - INITIAL_VISIBLE_COUNT} altere Nachrichten anzeigen
                          </Button>
                        )}
                      </>
                    );
                  })()
                )}
              </div>
              {/* Expand/Collapse Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setChatExpanded(!chatExpanded)}
                  className="p-2 bg-purple-500 hover:bg-purple-600 text-white border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
                  title={chatExpanded ? "Chat verkleinern" : "Chat erweitern"}
                  data-testid="chat-expand-button"
                >
                  {chatExpanded ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-gray-800"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
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
                    className="border-4 border-black rounded-none focus:ring-4 focus:ring-yellow-400 text-gray-800 placeholder:text-gray-400 bg-white"
                    data-testid="chat-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-gray-800"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
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
                    placeholder="Kurze Info fur alle"
                    className="border-4 border-black rounded-none focus:ring-4 focus:ring-yellow-400 text-gray-800 placeholder:text-gray-400 bg-white"
                    data-testid="chat-message-input"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSendMessage}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    data-testid="chat-send-button"
                  >
                    Senden
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
