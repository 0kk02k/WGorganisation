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
import { manualsApi } from "@/lib/appwrite";
import { Plus, ImageIcon } from "lucide-react";

export const ManualDialog = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    steps: "",
    image_url: "",
    image_data: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      title: "",
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
    if (!form.title || !form.steps) {
      toast.error("Bitte Titel und Schritte ergänzen.");
      return;
    }

    try {
      const stepsArray = form.steps.split("\n").filter(s => s.trim());
      const data = await manualsApi.create({
        title: form.title,
        steps: stepsArray,
        image_url: form.image_url,
        image_data: form.image_data,
      });
      toast.success("Anleitung gespeichert.");
      onCreated?.(data);
      setOpen(false);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
          data-testid="manual-dialog-trigger"
        >
          <Plus className="mr-2 h-4 w-4" />
          Anleitung anlegen
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-xl bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-gray-800"
        data-testid="manual-dialog"
      >
        <DialogHeader className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-b-4 border-black p-4 -m-6 mb-0">
          <DialogTitle 
            className="text-white text-2xl"
            style={{ fontFamily: "'Bangers', cursive" }}
            data-testid="manual-dialog-title"
          >
            Neue Bedienungsanleitung
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-8">
          <div className="space-y-2">
            <label
              className="text-sm font-bold text-gray-800"
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
              className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
              data-testid="manual-form-title-input"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-bold text-gray-800"
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
              className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
              data-testid="manual-form-steps-input"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-gray-800"
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
                className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                data-testid="manual-form-image-url-input"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-gray-800"
                data-testid="manual-form-image-file-label"
              >
                Bild hochladen
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                data-testid="manual-form-image-file-input"
              />
            </div>
          </div>
          {form.image_data && (
            <div
              className="overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
              className="flex items-center gap-2 border-4 border-dashed border-gray-300 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 text-sm text-gray-600"
              data-testid="manual-form-image-hint"
            >
              <ImageIcon className="h-4 w-4" />
              <span style={{ fontFamily: "'Nunito', sans-serif" }}>
                Füge ein Bild hinzu, damit die Anleitung leichter zu erkennen ist.
              </span>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            onClick={() => setOpen(false)}
            data-testid="manual-dialog-cancel"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 text-white font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            data-testid="manual-dialog-submit"
          >
            Anleitung speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
