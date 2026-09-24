import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { manualsApi } from "@/lib/api";
import { compressImageFile, IMAGE_DATA_MAX_BYTES } from "@/lib/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { toast } from "sonner";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { ManualPlaceholder } from "@/components/manuals/ManualPlaceholder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManualDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manual, setManual] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const fileInputRef = useRef(null);

  const loadManual = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await manualsApi.get(id);
      setManual(data);
      setForm({ ...data, steps: Array.isArray(data.steps) ? data.steps.join("\n") : "" });
    } catch (error) {
      console.error("Failed to load manual:", error);
      setLoadError(error);
    }
  }, [id]);

  useEffect(() => {
    loadManual();
  }, [loadManual]);

  const steps = useMemo(() => {
    if (!form?.steps) return [];
    const stepsStr = typeof form.steps === "string" ? form.steps : form.steps.join("\n");
    return stepsStr.split("\n").filter((line) => line.trim().length > 0);
  }, [form]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      // Bild komprimieren bevor es gespeichert wird (wie im Anlegen-Dialog)
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
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.title || !form.steps) {
      toast.error("Bitte Titel und Schritte ausfüllen.");
      return false;
    }
    setSaving(true);
    try {
      const stepsArray = typeof form.steps === "string" 
        ? form.steps.split("\n").filter(s => s.trim()) 
        : form.steps;
      
      // Prüfe Bildgröße (max 5MB nach Base64)
      if (form.image_data && form.image_data.length > IMAGE_DATA_MAX_BYTES) {
        toast.error("Bild ist zu groß. Bitte wähle ein kleineres Bild.");
        setSaving(false);
        return false;
      }

      const data = await manualsApi.update(id, {
        title: form.title,
        description: form.title, // Use title as description for backward compatibility
        steps: stepsArray,
        image_url: form.image_url || "",
        image_data: form.image_data || "",
        view_count: form.view_count, // Preserve view_count
      });
      setManual(data);
      setForm({ ...data, steps: Array.isArray(data.steps) ? data.steps.join("\n") : "" });
      toast.success("Anleitung aktualisiert.");
      return true;
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Speichern fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      ...manual,
      steps: Array.isArray(manual.steps) ? manual.steps.join("\n") : "",
    });
    setIsEditing(false);
  };

  const handleEditToggle = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    const saved = await handleSave();
    if (saved) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (saving) return;
    try {
      await manualsApi.delete(id);
      toast.success("Anleitung gelöscht.");
      navigate("/anleitungen");
    } catch (error) {
      toast.error("Löschen fehlgeschlagen.");
    }
  };

  if (!manual || !form) {
    // Fehler beim Laden: sichtbarer Fehlerzustand mit Retry statt endlosem "wird geladen"
    if (loadError) {
      return (
        <div className="max-w-xl" data-testid="manual-load-error">
          <ErrorCard
            title="Anleitung konnte nicht geladen werden."
            message="Prüfe die Verbindung und versuche es erneut."
            onRetry={() => {
              setManual(null);
              setForm(null);
              loadManual();
            }}
          />
        </div>
      );
    }
    return (
      <div
        className="text-lg text-gray-500 p-8"
        style={{ fontFamily: "'Nunito', sans-serif" }}
        data-testid="manual-loading"
      >
        Anleitung wird geladen...
      </div>
    );
  }

  const imageSrc = form.image_data || form.image_url || "";

  return (
    <div className="min-h-screen relative" data-testid="manual-detail-page">
      <div className="relative z-10 space-y-6">
        {/* Back Button */}
        <Button
          asChild
          className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
        >
          <Link to="/anleitungen" data-testid="manual-back-link">
            Zurück
          </Link>
        </Button>

        {/* Main Card */}
        <Card className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Image with edit overlay */}
          {isEditing ? (
            <button
              type="button"
              onClick={handleImageClick}
              className="relative block w-full aspect-video overflow-hidden border-b-4 border-black bg-gray-100 cursor-pointer"
              aria-label="Bild für diese Anleitung ändern"
              data-testid="manual-detail-image"
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={form.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ManualPlaceholder title={form.title} />
              )}
              <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Camera className="h-8 w-8 text-gray-800" />
                </span>
              </span>
            </button>
          ) : (
            <div
              className="relative aspect-video overflow-hidden border-b-4 border-black bg-gray-100"
              data-testid="manual-detail-image"
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={form.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ManualPlaceholder title={form.title} />
              )}
            </div>
          )}
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="manual-edit-image-file"
          />
          
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-teal-700 to-emerald-700 border-b-4 border-black p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <label
                    className="text-sm font-bold text-white"
                    style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                    data-testid="manual-edit-title-label"
              htmlFor="manual-edit-title"
                  >
                    Titel
                  </label>
                  <Input
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="bg-white border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-gray-800"
                    id="manual-edit-title"
              data-testid="manual-edit-title"
                  />
                </div>
              ) : (
                <h1
                  className="text-white text-2xl"
                  style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                  data-testid="manual-detail-title"
                >
                  {manual.title}
                </h1>
              )}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleEditToggle}
                  disabled={saving}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                  data-testid="manual-edit-toggle"
                >
                  {saving ? "Speichern..." : isEditing ? "Speichern" : "Bearbeiten"}
                </Button>
                {isEditing && (
                  <>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="bg-white hover:bg-gray-100 text-gray-800 font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                      data-testid="manual-cancel-edit-button"
                    >
                      Abbrechen
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          aria-label="Anleitung löschen"
                          className="bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                          data-testid="manual-delete-button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        data-testid="manual-delete-dialog"
                      >
                        <AlertDialogHeader className="bg-gradient-to-r from-red-500 to-rose-500 border-b-4 border-black p-4 -m-6 mb-0">
                          <AlertDialogTitle
                            className="text-white text-2xl"
                            style={{ fontFamily: "'Bangers', cursive" }}
                            data-testid="manual-delete-title"
                          >
                            Anleitung wirklich löschen?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription
                          className="text-gray-600 pt-8"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                          data-testid="manual-delete-description"
                        >
                          „{manual.title}" und alle Schritte werden dauerhaft entfernt.
                        </AlertDialogDescription>
                        <AlertDialogFooter className="flex gap-2 mt-4">
                          <AlertDialogCancel
                            className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
                            data-testid="manual-delete-cancel"
                          >
                            Abbrechen
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
                            data-testid="manual-delete-confirm"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 space-y-4">
            {isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800" data-testid="manual-edit-steps-label">
                  Schritte
                </label>
                <Textarea
                  rows={5}
                  value={form.steps}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, steps: event.target.value }))
                  }
                  className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-gray-800 bg-white"
                  data-testid="manual-edit-steps"
                />
              </div>
            )}
            
            {/* Steps */}
            <div>
              <h3
                className="mb-4 text-xl font-bold text-gray-800"
                style={{ fontFamily: "'Bangers', cursive" }}
                data-testid="manual-detail-steps-title"
              >
                Schritt-für-Schritt
              </h3>
              <ol className="space-y-3">
                {steps.map((step, index) => (
                  <li
                    key={`${manual.id}-step-${index}`}
                    className="border-4 border-black p-4 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                    data-testid={`manual-step-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-teal-700 to-emerald-700 text-white font-bold flex items-center justify-center border-2 border-black"
                        style={{ fontFamily: "'Bangers', cursive" }}
                      >
                        {index + 1}
                      </span>
                      <span 
                        className="text-gray-800"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {step}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
