import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
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
import { Plus } from "lucide-react";
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
    const [eventsResponse, linksResponse] = await Promise.all([
      api.get("/events"),
      api.get("/berlin-links"),
    ]);
    setEvents(eventsResponse.data);
    setLinks(linksResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.location || !form.description) {
      toast.error("Bitte alle Felder ausfüllen.");
      return;
    }
    try {
      const response = await api.post("/events", {
        title: form.title,
        date: form.date,
        location: form.location,
        description: form.description,
        hashtags: parseTags(form.hashtags),
      });
      setEvents((prev) => [response.data, ...prev]);
      setForm({ title: "", date: "", location: "", description: "", hashtags: "" });
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Tipp konnte nicht gespeichert werden.");
    }
  };

  const handleLinkSubmit = async () => {
    if (!linkForm.url || !linkForm.description) {
      toast.error("Bitte Link und Beschreibung ausfüllen.");
      return;
    }
    try {
      const response = await api.post("/berlin-links", {
        url: linkForm.url,
        description: linkForm.description,
        hashtags: parseTags(linkForm.hashtags),
      });
      setLinks((prev) => [response.data, ...prev]);
      setLinkForm({ url: "", description: "", hashtags: "" });
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Link konnte nicht gespeichert werden.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-20 pt-20 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold" data-testid="berlin-page">
          Berlin
        </h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-12 w-12 rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
          data-testid="berlin-open-modal-button"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
              <Button
                onClick={handleSubmit}
                className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
                data-testid="berlin-submit-button"
              >
                Tipp posten
              </Button>
            </TabsContent>
            <TabsContent value="link" className="space-y-4" data-testid="berlin-tab-link-content">
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
              <Button
                onClick={handleLinkSubmit}
                className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
                data-testid="berlin-link-submit-button"
              >
                Link speichern
              </Button>
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
        <div className="space-y-4" data-testid="berlin-events-section">
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
                <Card key={event.id} data-testid={`berlin-event-${event.id}`}>
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

        <div className="space-y-4" data-testid="berlin-links-section">
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
                <Card key={link.id} data-testid={`berlin-link-${link.id}`}>
                  <CardHeader className="space-y-1">
                    <CardTitle data-testid={`berlin-link-title-${link.id}`}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#CCFF00] hover:underline"
                        data-testid={`berlin-link-url-${link.id}`}
                      >
                        {link.url}
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className="text-sm text-white/70"
                      data-testid={`berlin-link-description-${link.id}`}
                    >
                      {link.description}
                    </p>
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
