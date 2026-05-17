import { useEffect, useMemo, useState } from "react";
import { eventsApi, berlinLinksApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";

const parseTags = (value) =>
  value
    .split(",")
    .map((tag) => tag.replace("#", "").trim())
    .filter(Boolean)
    .map((tag) => `#${tag}`);

const safeTags = (tags) => (Array.isArray(tags) ? tags : []);

const formatGermanDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export default function BerlinPage() {
  const [events, setEvents] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    hashtags: "",
  });
  const [linkForm, setLinkForm] = useState({
    url: "",
    description: "",
    hashtags: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postType, setPostType] = useState("event");
  const [editingType, setEditingType] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    events.forEach((event) => safeTags(event.hashtags).forEach((tag) => tagSet.add(tag)));
    links.forEach((link) => safeTags(link.hashtags).forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [events, links]);

  // Filter out past events (only show today and future events)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentEvents = events.filter((event) => {
    if (!event.date) return true;
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  // Sort events by date (closest to today first)
  const sortedEvents = [...currentEvents].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    return dateA - dateB;
  });

  const filteredEvents = selectedTag
    ? sortedEvents.filter((event) => safeTags(event.hashtags).includes(selectedTag))
    : sortedEvents;
  const filteredLinks = selectedTag
    ? links.filter((link) => safeTags(link.hashtags).includes(selectedTag))
    : links;

  const loadData = async () => {
    try {
      const [eventsData, linksData] = await Promise.all([
        eventsApi.list(),
        berlinLinksApi.list(),
      ]);
      setEvents(eventsData);
      setLinks(linksData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setForm({ title: "", date: "", location: "", description: "", hashtags: "" });
    setLinkForm({ url: "", description: "", hashtags: "" });
    setPostType("event");
    setEditingType(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditEvent = (event) => {
    setForm({
      title: event.title || "",
      date: event.date || "",
      location: event.location || "",
      description: event.description || "",
      hashtags: safeTags(event.hashtags).join(", "),
    });
    setPostType("event");
    setEditingType("event");
    setEditingId(event.id);
    setIsModalOpen(true);
  };

  const openEditLink = (link) => {
    setLinkForm({
      url: link.url || "",
      description: link.description || "",
      hashtags: safeTags(link.hashtags).join(", "),
    });
    setPostType("link");
    setEditingType("link");
    setEditingId(link.id);
    setIsModalOpen(true);
  };

  const handleModalChange = (open) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingType(null);
      setEditingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.location || !form.description) {
      toast.error("Bitte alle Felder ausfüllen.");
      return;
    }
    try {
      if (editingType === "event" && editingId) {
        // Update existing event
        const data = await eventsApi.update(editingId, {
          title: form.title,
          date: form.date,
          location: form.location,
          description: form.description,
          hashtags: parseTags(form.hashtags),
        });
        setEvents((prev) => prev.map((item) => (item.id === editingId ? data : item)));
        toast.success("Tipp aktualisiert.");
      } else {
        // Create new event
        const data = await eventsApi.create({
          title: form.title,
          date: form.date,
          location: form.location,
          description: form.description,
          hashtags: parseTags(form.hashtags),
        });
        setEvents((prev) => [data, ...prev]);
        toast.success("Tipp erstellt.");
      }
      setForm({ title: "", date: "", location: "", description: "", hashtags: "" });
      setIsModalOpen(false);
      setEditingType(null);
      setEditingId(null);
    } catch (error) {
      toast.error("Tipp konnte nicht gespeichert werden.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingId || editingType !== "event") return;
    try {
      await eventsApi.delete(editingId);
      setEvents((prev) => prev.filter((item) => item.id !== editingId));
      setEditingId(null);
      setEditingType(null);
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Tipp konnte nicht gelöscht werden.");
    }
  };

  const handleLinkSubmit = async () => {
    if (!linkForm.url || !linkForm.description) {
      toast.error("Bitte Link und Beschreibung ausfüllen.");
      return;
    }
    try {
      if (editingType === "link" && editingId) {
        // Update existing link
        const data = await berlinLinksApi.update(editingId, {
          url: linkForm.url,
          description: linkForm.description,
          hashtags: parseTags(linkForm.hashtags),
        });
        setLinks((prev) => prev.map((item) => (item.id === editingId ? data : item)));
        toast.success("Link aktualisiert.");
      } else {
        // Create new link
        const data = await berlinLinksApi.create({
          url: linkForm.url,
          description: linkForm.description,
          hashtags: parseTags(linkForm.hashtags),
        });
        setLinks((prev) => [data, ...prev]);
        toast.success("Link erstellt.");
      }
      setLinkForm({ url: "", description: "", hashtags: "" });
      setIsModalOpen(false);
      setEditingType(null);
      setEditingId(null);
    } catch (error) {
      toast.error("Link konnte nicht gespeichert werden.");
    }
  };

  const handleDeleteLink = async () => {
    if (!editingId || editingType !== "link") return;
    try {
      await berlinLinksApi.delete(editingId);
      setLinks((prev) => prev.filter((item) => item.id !== editingId));
      setEditingId(null);
      setEditingType(null);
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Link konnte nicht gelöscht werden.");
    }
  };

  return (
    <div className="min-h-screen relative" data-testid="berlin-page">
      {/* Modal - outside stagger container since it's an overlay */}
      <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
        <DialogContent
          className="max-w-2xl bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-gray-800"
          data-testid="berlin-create-modal"
        >
          <DialogHeader className="bg-gradient-to-r from-pink-500 to-orange-500 border-b-4 border-black p-4 -m-6 mb-0">
             <DialogTitle 
               className="text-white text-2xl"
               style={{ fontFamily: "'Bangers', cursive" }}
               data-testid="berlin-create-title"
             >
               {editingType ? "Bearbeiten" : "Neuer Beitrag"}
             </DialogTitle>
           </DialogHeader>
          <Tabs
            value={postType}
            onValueChange={setPostType}
            className="space-y-4 pt-8"
            data-testid="berlin-create-tabs"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 border-4 border-black rounded-none h-12">
              <TabsTrigger 
                value="event" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-emerald-400 data-[state=active]:text-white font-bold rounded-none"
                data-testid="berlin-tab-event"
              >
                Veranstaltung
              </TabsTrigger>
              <TabsTrigger 
                value="link" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-blue-400 data-[state=active]:text-white font-bold rounded-none"
                data-testid="berlin-tab-link"
              >
                Link
              </TabsTrigger>
            </TabsList>
            <TabsContent value="event" className="space-y-4" data-testid="berlin-tab-event-content">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label 
                    className="text-sm font-bold text-gray-800"
                    data-testid="berlin-title-label"
                  >
                    Titel
                  </label>
                  <Input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="z.B. Jazz Night"
                    className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                    data-testid="berlin-title-input"
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-sm font-bold text-gray-800"
                    data-testid="berlin-date-label"
                  >
                    Datum
                  </label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                    data-testid="berlin-date-input"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label 
                    className="text-sm font-bold text-gray-800"
                    data-testid="berlin-location-label"
                  >
                    Ort
                  </label>
                  <Input
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, location: event.target.value }))
                    }
                    placeholder="z.B. Kreuzberg"
                    className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                    data-testid="berlin-location-input"
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-sm font-bold text-gray-800"
                    data-testid="berlin-description-label"
                  >
                    Beschreibung
                  </label>
                  <Textarea
                    rows={2}
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Was lohnt sich?"
                    className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                    data-testid="berlin-description-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label 
                  className="text-sm font-bold text-gray-800"
                  data-testid="berlin-hashtags-label"
                >
                  Hashtags
                </label>
                <Input
                  value={form.hashtags}
                  onChange={(event) => setForm((prev) => ({ ...prev, hashtags: event.target.value }))}
                  placeholder="#club, #openair"
                  className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                  data-testid="berlin-hashtags-input"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                 <Button
                   onClick={handleSubmit}
                   className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 px-6 py-3"
                   data-testid="berlin-submit-button"
                 >
                   {editingType === "event" ? "Aktualisieren" : "Tipp posten"}
                 </Button>
                {editingType === "event" && (
                  <Button
                    onClick={handleDeleteEvent}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 px-4 py-3"
                    data-testid="berlin-delete-button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="link" className="space-y-4" data-testid="berlin-tab-link-content">
              <div className="space-y-2">
                <label 
                  className="text-sm font-bold text-gray-800"
                  data-testid="berlin-link-description-label"
                >
                  Beschreibung
                </label>
                <Textarea
                  rows={2}
                  value={linkForm.description}
                  onChange={(event) =>
                    setLinkForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Warum ist der Link hilfreich?"
                  className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                  data-testid="berlin-link-description-input"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label 
                    className="text-sm font-bold text-gray-800"
                    data-testid="berlin-link-url-label"
                  >
                    URL
                  </label>
                  <Input
                    value={linkForm.url}
                    onChange={(event) =>
                      setLinkForm((prev) => ({ ...prev, url: event.target.value }))
                    }
                    placeholder="https://..."
                    className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                    data-testid="berlin-link-url-input"
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-sm font-bold text-gray-800"
                    data-testid="berlin-link-hashtags-label"
                  >
                    Hashtags
                  </label>
                  <Input
                    value={linkForm.hashtags}
                    onChange={(event) =>
                      setLinkForm((prev) => ({ ...prev, hashtags: event.target.value }))
                    }
                    placeholder="#tickets, #club"
                    className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                    data-testid="berlin-link-hashtags-input"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                 <Button
                   onClick={handleLinkSubmit}
                   className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 px-6 py-3"
                   data-testid="berlin-link-submit-button"
                 >
                   {editingType === "link" ? "Aktualisieren" : "Link speichern"}
                 </Button>
                {editingType === "link" && (
                  <Button
                    onClick={handleDeleteLink}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 px-4 py-3"
                    data-testid="berlin-link-delete-button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

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
              data-testid="berlin-title"
            >
              Berlin
            </h1>
            <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 mt-2" />
          </div>
          <Button
            onClick={openCreateModal}
            className="h-14 w-14 bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
            data-testid="berlin-open-modal-button"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2" data-testid="berlin-tags">
            <Button
              variant={selectedTag ? "outline" : "default"}
              onClick={() => setSelectedTag(null)}
              className={`font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 ${
                selectedTag ? "bg-white text-gray-800" : "bg-yellow-400 text-black"
              }`}
              data-testid="berlin-tag-all"
            >
              Alle
            </Button>
            {availableTags.map((tag, index) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(tag)}
                className={`font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 ${
                  selectedTag === tag ? "bg-pink-500 text-white" : "bg-white text-gray-800"
                }`}
                data-testid={`berlin-tag-${index}`}
              >
                {tag}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Content Grid */}
        <motion.div variants={staggerItem} className="grid gap-6 lg:grid-cols-2 items-start" data-testid="berlin-columns">
          {/* Events Section */}
          <Card 
            className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            data-testid="berlin-events-section"
          >
            <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 border-b-4 border-black p-4">
              <CardTitle 
                className="text-white text-2xl"
                style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                data-testid="berlin-events-title"
              >
                Aktuelle Tipps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 bg-red-500/10">
              {filteredEvents.length === 0 ? (
                <div className="border-4 border-dashed border-gray-300 p-8 text-center">
                  <p className="text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Noch keine Tipps vorhanden.
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="relative border-4 border-black p-4 bg-gradient-to-r from-amber-50 to-orange-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                    data-testid={`berlin-event-${event.id}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEvent(event);
                      }}
                      className="absolute bottom-0 right-0 p-1 bg-gray-100 hover:bg-white border-t-2 border-l-2 border-black transition-all duration-150"
                      data-testid={`berlin-event-edit-${event.id}`}
                      title="Bearbeiten"
                    >
                      <Pencil className="h-3 w-3 text-gray-600" />
                    </button>
                    <h3 
                      className="text-lg font-bold text-gray-800"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                      data-testid={`berlin-event-title-${event.id}`}
                    >
                      {event.title}
                    </h3>
                    <p 
                      className="text-sm text-gray-500"
                      data-testid={`berlin-event-date-${event.id}`}
                    >
                      {formatGermanDate(event.date)} · {event.location}
                    </p>
                    <p
                      className="text-sm text-gray-600 mt-2"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                      data-testid={`berlin-event-description-${event.id}`}
                    >
                      {event.description}
                    </p>
                    {safeTags(event.hashtags).length > 0 && (
                      <div
                        className="mt-3 flex flex-wrap gap-2"
                        data-testid={`berlin-event-tags-${event.id}`}
                      >
                        {safeTags(event.hashtags).map((tag, index) => (
                          <Badge
                            key={`${event.id}-${tag}`}
                            className="bg-yellow-400 text-black font-bold border-2 border-black rounded-none"
                            data-testid={`berlin-event-tag-${event.id}-${index}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Links Section */}
          <Card 
            className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            data-testid="berlin-links-section"
          >
            <CardHeader className="bg-gradient-to-r from-cyan-400 to-blue-500 border-b-4 border-black p-4">
              <CardTitle 
                className="text-white text-2xl"
                style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                data-testid="berlin-links-title"
              >
                Dauerhafte Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 bg-cyan-400/10">
              {filteredLinks.length === 0 ? (
                <div className="border-4 border-dashed border-gray-300 p-8 text-center">
                  <p className="text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Noch keine Links vorhanden.
                  </p>
                </div>
              ) : (
                filteredLinks.map((link) => (
                  <div 
                    key={link.id} 
                    className="relative border-4 border-black p-4 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                    data-testid={`berlin-link-${link.id}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditLink(link);
                      }}
                      className="absolute bottom-0 right-0 p-1 bg-gray-100 hover:bg-white border-t-2 border-l-2 border-black transition-all duration-150"
                      data-testid={`berlin-link-edit-${link.id}`}
                      title="Bearbeiten"
                    >
                      <Pencil className="h-3 w-3 text-gray-600" />
                    </button>
                    <h3 
                      className="text-lg font-bold text-gray-800"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                      data-testid={`berlin-link-title-${link.id}`}
                    >
                      {link.description}
                    </h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-teal-600 hover:text-teal-800 font-semibold underline"
                      data-testid={`berlin-link-url-${link.id}`}
                    >
                      {link.url}
                    </a>
                    {safeTags(link.hashtags).length > 0 && (
                      <div
                        className="mt-3 flex flex-wrap gap-2"
                        data-testid={`berlin-link-tags-${link.id}`}
                      >
                        {safeTags(link.hashtags).map((tag, index) => (
                          <Badge
                            key={`${link.id}-${tag}`}
                            className="bg-teal-400 text-black font-bold border-2 border-black rounded-none"
                            data-testid={`berlin-link-tag-${link.id}-${index}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
