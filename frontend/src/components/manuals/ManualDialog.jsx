import { useEffect, useState, useRef } from "react";
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
import { manualsApi } from "@/lib/api";
import { compressImageFile, IMAGE_DATA_MAX_BYTES } from "@/lib/image";
import { Plus, Camera } from "lucide-react";
import { ManualPlaceholder } from "@/components/manuals/ManualPlaceholder";

export const ManualDialog = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    steps: "",
    image_url: "",
    image_data: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      title: "",
      steps: "",
      image_url: "",
      image_data: "",
    });
  }, [open]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      // Komprimieren wie im Detail-Edit, damit große Handyfotos nicht scheitern
      const dataUrl = await compressImageFile(file);
      setForm((prev) => ({ ...prev, image_data: dataUrl }));
    } catch (error) {
      toast.error(error.message || "Bild konnte nicht verarbeitet werden.");
    } finally {
      // Input zurücksetzen, damit dieselbe Datei erneut gewählt werden kann
      event.target.value = "";
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (saving) return;
    if (!form.title || !form.steps) {
      toast.error("Bitte Titel und Schritte ergänzen.");
      return;
    }
    if (form.image_data && form.image_data.length > IMAGE_DATA_MAX_BYTES) {
      toast.error("Bild ist zu groß. Bitte wähle ein kleineres Bild.");
      return;
    }

    setSaving(true);
    try {
      const stepsArray = form.steps.split("\n").filter(s => s.trim());
      const data = await manualsApi.create({
        title: form.title,
        description: form.title, // Use title as description for backward compatibility
        steps: stepsArray,
        image_url: form.image_url,
        image_data: form.image_data,
      });
      toast.success("How to gespeichert.");
      onCreated?.(data);
      setOpen(false);
    } catch (error) {
      toast.error(`Speichern fehlgeschlagen: ${error.message || "Unbekannter Fehler"}`);
    } finally {
      setSaving(false);
    }
  };

  const imageSrc = form.image_data || form.image_url;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Neues How to anlegen"
          title="Neues How to anlegen"
          className="h-14 w-14 bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
          data-testid="manual-dialog-trigger"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-xl max-h-[95vh] overflow-hidden flex flex-col bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-gray-800 p-0"
        data-testid="manual-dialog"
      >
        <DialogHeader className="bg-white border-b-4 border-black p-4">
          <DialogTitle 
            className="text-gray-800 text-2xl"
            style={{ fontFamily: "'Bangers', cursive" }}
            data-testid="manual-dialog-title"
          >
            Neues How to
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Image with camera overlay */}
          <button
            type="button"
            onClick={handleImageClick}
            className="relative block w-full aspect-video overflow-hidden border-4 border-black bg-gray-100 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            aria-label={imageSrc ? "Bild ändern" : "Bild auswählen"}
            data-testid="manual-form-image-container"
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Ausgewähltes Bild"
                className="h-full w-full object-cover"
              />
            ) : (
              <ManualPlaceholder title="" />
            )}
            <span className="absolute bottom-2 right-2 bg-white px-2 py-1 border-2 border-black text-xs font-bold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Camera className="h-3 w-3 inline mr-1" aria-hidden="true" />
              {imageSrc ? "Bild ändern" : "Foto wählen"}
            </span>
          </button>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="manual-form-image-file-input"
          />
          
          <div className="space-y-2">
            <label
              className="text-sm font-bold text-gray-800"
              data-testid="manual-form-title-label"
              htmlFor="manual-form-title-input"
            >
              Titel
            </label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="z.B. Geschirrspüler"
              className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-gray-800 bg-white"
              id="manual-form-title-input"
              data-testid="manual-form-title-input"
            />
          </div>
          <div className="space-y-2 pb-2">
            <label
              className="text-sm font-bold text-gray-800"
              data-testid="manual-form-steps-label"
              htmlFor="manual-form-steps-input"
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
              className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-gray-800 bg-white"
              id="manual-form-steps-input"
              data-testid="manual-form-steps-input"
            />
          </div>
        </div>
        <DialogFooter className="flex-row items-center gap-2 p-4 border-t-4 border-black bg-gray-50">
          <Button
            className="flex-1 bg-white hover:bg-gray-100 text-gray-800 font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            onClick={() => setOpen(false)}
            data-testid="manual-dialog-cancel"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            aria-busy={saving}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            data-testid="manual-dialog-submit"
          >
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
