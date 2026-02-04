import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ManualDetail() {
  const { id } = useParams();
  const [manual, setManual] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadManual = async () => {
      const response = await api.get(`/manuals/${id}`);
      setManual(response.data);
      setForm(response.data);
    };
    loadManual();
  }, [id]);

  const steps = useMemo(() => {
    if (!form?.steps) return [];
    return form.steps.split("\n").filter((line) => line.trim().length > 0);
  }, [form]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image_data: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.title || !form.description || !form.steps) {
      toast.error("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }
    setSaving(true);
    try {
      const response = await api.put(`/manuals/${id}`, form);
      setManual(response.data);
      setForm(response.data);
      toast.success("Anleitung aktualisiert.");
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  if (!manual || !form) {
    return (
      <div className="text-sm text-stone-600" data-testid="manual-loading">
        Anleitung wird geladen...
      </div>
    );
  }

  const imageSrc =
    form.image_data ||
    form.image_url ||
    "https://images.unsplash.com/photo-1607273177147-e7304c4d5d6c?crop=entropy&cs=srgb&fm=jpg&q=85";

  return (
    <div className="space-y-6" data-testid="manual-detail-page">
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/anleitungen" data-testid="manual-back-link">
          Zurück
        </Link>
      </Button>
      <Card className="overflow-hidden border-stone-200/80" data-testid="manual-detail-card">
        <div className="aspect-video overflow-hidden bg-stone-100" data-testid="manual-detail-image">
          <img
            src={imageSrc}
            alt={form.title}
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader>
          <CardTitle data-testid="manual-detail-title">Anleitung bearbeiten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700" data-testid="manual-edit-title-label">
              Titel
            </label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              data-testid="manual-edit-title"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700" data-testid="manual-edit-description-label">
              Beschreibung
            </label>
            <Input
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              data-testid="manual-edit-description"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700" data-testid="manual-edit-steps-label">
              Schritte
            </label>
            <Textarea
              rows={5}
              value={form.steps}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, steps: event.target.value }))
              }
              data-testid="manual-edit-steps"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" data-testid="manual-edit-image-url-label">
                Bild-URL
              </label>
              <Input
                value={form.image_url || ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, image_url: event.target.value }))
                }
                placeholder="https://..."
                data-testid="manual-edit-image-url"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" data-testid="manual-edit-image-file-label">
                Bild hochladen
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                data-testid="manual-edit-image-file"
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-emerald-900 text-emerald-50 hover:bg-emerald-800"
            data-testid="manual-edit-save"
          >
            {saving ? "Speichern..." : "Änderungen speichern"}
          </Button>
          <div>
            <h3
              className="mb-3 text-sm font-semibold text-stone-900"
              data-testid="manual-detail-steps-title"
            >
              Vorschau Schritte
            </h3>
            <ol className="space-y-2 text-sm text-stone-700">
              {steps.map((step, index) => (
                <li
                  key={`${manual.id}-step-${index}`}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  data-testid={`manual-step-${index}`}
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
