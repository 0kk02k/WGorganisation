import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BerlinPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });

  const loadEvents = async () => {
    const response = await api.get("/events");
    setEvents(response.data);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.location || !form.description) {
      toast.error("Bitte alle Felder ausfüllen.");
      return;
    }
    try {
      const response = await api.post("/events", form);
      setEvents((prev) => [response.data, ...prev]);
      setForm({ title: "", date: "", location: "", description: "" });
    } catch (error) {
      toast.error("Tipp konnte nicht gespeichert werden.");
    }
  };

  return (
    <div className="space-y-6" data-testid="berlin-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="berlin-title">
          Berlin
        </h1>
      </div>

      <Card data-testid="berlin-form-card">
        <CardHeader>
          <CardTitle data-testid="berlin-form-title">Veranstaltungstipp posten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
            data-testid="berlin-submit-button"
          >
            Tipp posten
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4" data-testid="berlin-events-section">
        <h2 className="text-xl font-semibold" data-testid="berlin-events-title">
          Aktuelle Tipps
        </h2>
        {events.length === 0 ? (
          <Card className="border-dashed border-stone-300" data-testid="berlin-empty">
            <CardContent className="py-8 text-center text-sm text-stone-600">
              Noch keine Tipps vorhanden.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id} data-testid={`berlin-event-${event.id}`}>
                <CardHeader className="space-y-1">
                  <CardTitle data-testid={`berlin-event-title-${event.id}`}>
                    {event.title}
                  </CardTitle>
                  <p className="text-sm text-white/60" data-testid={`berlin-event-meta-${event.id}`}>
                    {event.date} · {event.location}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70" data-testid={`berlin-event-description-${event.id}`}>
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
