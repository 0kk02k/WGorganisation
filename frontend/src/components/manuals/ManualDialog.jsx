import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Plus, ImageIcon } from "lucide-react";

export const ManualDialog = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    steps: "",
    image_url: "",
    image_data: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      title: "",
      description: "",
      steps: "",
      image_url: "",
      image_data: "",
    });
  }, [open]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image_data: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.steps) {
      toast.error("Bitte Titel, Beschreibung und Schritte ergänzen.");
      return;
    }

    try {
      const response = await api.post("/manuals", form);
      toast.success("Anleitung gespeichert.");
      onCreated?.(response.data);
      setOpen(false);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full bg-emerald-900 text-emerald-50 hover:bg-emerald-800"
          data-testid="manual-dialog-trigger"
        >
          <Plus className="mr-2 h-4 w-4" />
          Anleitung anlegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl" data-testid="manual-dialog">
        <DialogHeader>
          <DialogTitle data-testid="manual-dialog-title">
            Neue Bedienungsanleitung
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-700"
              data-testid="manual-form-title-label"
            >
              Titel
            </label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="z.B. Geschirrspüler"
              data-testid="manual-form-title-input"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-700"
              data-testid="manual-form-description-label"
            >
              Kurzbeschreibung
            </label>
            <Input
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Wofür ist das Gerät?"
              data-testid="manual-form-description-input"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-700"
              data-testid="manual-form-steps-label"
            >
              Schritte (jede Zeile = ein Schritt)
            </label>
            <Textarea
              rows={4}
              value={form.steps}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, steps: event.target.value }))
              }
              placeholder="1. Gerät einschalten..."
              data-testid="manual-form-steps-input"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
                data-testid="manual-form-image-url-label"
              >
                Bild-URL (optional)
              </label>
              <Input
                value={form.image_url}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    image_url: event.target.value,
                  }))
                }
                placeholder="https://..."
                data-testid="manual-form-image-url-input"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
                data-testid="manual-form-image-file-label"
              >
                Bild hochladen
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                data-testid="manual-form-image-file-input"
              />
            </div>
          </div>
          {form.image_data && (
            <div
              className="overflow-hidden rounded-2xl border border-stone-200"
              data-testid="manual-form-image-preview"
            >
              <img
                src={form.image_data}
                alt="Vorschau"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
          {!form.image_data && !form.image_url && (
            <div
              className="flex items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600"
              data-testid="manual-form-image-hint"
            >
              <ImageIcon className="h-4 w-4" />
              Füge ein Bild hinzu, damit die Anleitung leichter zu erkennen ist.
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="manual-dialog-cancel"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-emerald-900 text-emerald-50 hover:bg-emerald-800"
            data-testid="manual-dialog-submit"
          >
            Anleitung speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
