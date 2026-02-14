import { useEffect, useMemo, useState } from "react";
import { eventsApi, berlinLinksApi } from "@/lib/appwrite";
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
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

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

  const filteredEvents = selectedTag
    ? events.filter((event) => safeTags(event.hashtags).includes(selectedTag))
    : events;
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
      const data = await eventsApi.create({
        title: form.title,
        date: form.date,
        location: form.location,
        description: form.description,
        hashtags: parseTags(form.hashtags),
      });
      setEvents((prev) => [data, ...prev]);
      setForm({ title: "", date: "", location: "", description: "", hashtags: "" });
      setIsModalOpen(false);
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
      const data = await berlinLinksApi.create({
        url: linkForm.url,
        description: linkForm.description,
        hashtags: parseTags(linkForm.hashtags),
      });
      setLinks((prev) => [data, ...prev]);
      setLinkForm({ url: "", description: "", hashtags: "" });
      setIsModalOpen(false);
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
    <div className="space-y-6" data-testid="berlin-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold" data-testid="berlin-title">
          Berlin
        </h1>
        <Button
          onClick={openCreateModal}
          className="h-12 w-12 rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
          data-testid="berlin-open-modal-button"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
        <DialogContent
          className="max-w-2xl border-white/10 bg-[#141414]/95 text-white"
          data-testid="berlin-create-modal"
        >
          <DialogHeader>
            <DialogTitle data-testid="berlin-create-title">Neuer Beitrag</DialogTitle>
          </DialogHeader>
          <Tabs
            value={postType}
            onValueChange={setPostType}
            className="space-y-4"
            data-testid="berlin-create-tabs"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="event" data-testid="berlin-tab-event">
                Veranstaltung
              </TabsTrigger>
              <TabsTrigger value="link" data-testid="berlin-tab-link">
                Link
              </TabsTrigger>
            </TabsList>
            <TabsContent value="event" className="space-y-4" data-testid="berlin-tab-event-content">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs text-white/60" data-testid="berlin-title-label">
                    Titel
                  </label>
                  <Input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="z.B. Jazz Night"
                    data-testid="berlin-title-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/60" data-testid="berlin-date-label">
                    Datum
                  </label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    data-testid="berlin-date-input"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs text-white/60" data-testid="berlin-location-label">
                    Ort
                  </label>
                  <Input
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, location: event.target.value }))
                    }
                    placeholder="z.B. Kreuzberg"
                    data-testid="berlin-location-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/60" data-testid="berlin-description-label">
                    Beschreibung
                  </label>
                  <Textarea
                    rows={2}
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Was lohnt sich?"
                    data-testid="berlin-description-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/60" data-testid="berlin-hashtags-label">
                  Hashtags
                </label>
                <Input
                  value={form.hashtags}
                  onChange={(event) => setForm((prev) => ({ ...prev, hashtags: event.target.value }))}
                  placeholder="#club, #openair"
                  data-testid="berlin-hashtags-input"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleSubmit}
                  className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
                  data-testid="berlin-submit-button"
                >
                  Tipp posten
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="link" className="space-y-4" data-testid="berlin-tab-link-content">
              <div className="space-y-2">
                <label className="text-xs text-white/60" data-testid="berlin-link-description-label">
                  Beschreibung
                </label>
                <Textarea
                  rows={2}
                  value={linkForm.description}
                  onChange={(event) =>
                    setLinkForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Warum ist der Link hilfreich?"
                  data-testid="berlin-link-description-input"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs text-white/60" data-testid="berlin-link-url-label">
                    URL
                  </label>
                  <Input
                    value={linkForm.url}
                    onChange={(event) =>
                      setLinkForm((prev) => ({ ...prev, url: event.target.value }))
                    }
                    placeholder="https://..."
                    data-testid="berlin-link-url-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/60" data-testid="berlin-link-hashtags-label">
                    Hashtags
                  </label>
                  <Input
                    value={linkForm.hashtags}
                    onChange={(event) =>
                      setLinkForm((prev) => ({ ...prev, hashtags: event.target.value }))
                    }
                    placeholder="#tickets, #club"
                    data-testid="berlin-link-hashtags-input"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleLinkSubmit}
                  className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
                  data-testid="berlin-link-submit-button"
                >
                  Link speichern
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2" data-testid="berlin-tags">
          <Button
            variant={selectedTag ? "outline" : "default"}
            onClick={() => setSelectedTag(null)}
            className="rounded-full"
            data-testid="berlin-tag-all"
          >
            Alle
          </Button>
          {availableTags.map((tag, index) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              onClick={() => setSelectedTag(tag)}
              className="rounded-full"
              data-testid={`berlin-tag-${index}`}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2" data-testid="berlin-columns">
        <div
          className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(176,38,255,0.15)]"
          data-testid="berlin-events-section"
        >
          <h2 className="text-xl font-semibold" data-testid="berlin-events-title">
            Aktuelle Tipps
          </h2>
          {filteredEvents.length === 0 ? (
            <Card className="border-dashed border-stone-300" data-testid="berlin-empty">
              <CardContent className="py-8 text-center text-sm text-stone-600">
                Noch keine Tipps vorhanden.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="relative" data-testid={`berlin-event-${event.id}`}>
                  <CardHeader className="space-y-1">
                    <CardTitle data-testid={`berlin-event-title-${event.id}`}>
                      {event.title}
                    </CardTitle>
                    <p className="text-xs text-white/60" data-testid={`berlin-event-date-${event.id}`}>
                      {formatGermanDate(event.date)}
                    </p>
                    <p
                      className="text-xs text-white/60"
                      data-testid={`berlin-event-location-${event.id}`}
                    >
                      {event.location}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p
                      className="text-sm text-white/70"
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
                            className="rounded-full bg-white/10 text-white/70"
                            data-testid={`berlin-event-tag-${event.id}-${index}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div
          className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(176,38,255,0.15)]"
          data-testid="berlin-links-section"
        >
          <h2 className="text-xl font-semibold" data-testid="berlin-links-title">
            Dauerhafte Links
          </h2>
          {filteredLinks.length === 0 ? (
            <Card className="border-dashed border-stone-300" data-testid="berlin-links-empty">
              <CardContent className="py-8 text-center text-sm text-stone-600">
                Noch keine Links vorhanden.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredLinks.map((link) => (
                <Card key={link.id} className="relative" data-testid={`berlin-link-${link.id}`}>
                  <CardHeader className="space-y-1">
                    <CardTitle data-testid={`berlin-link-title-${link.id}`}>
                      {link.description}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#CCFF00] hover:underline"
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
                            className="rounded-full bg-white/10 text-white/70"
                            data-testid={`berlin-link-tag-${link.id}-${index}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
