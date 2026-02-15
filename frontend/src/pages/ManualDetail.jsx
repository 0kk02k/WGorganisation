import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { manualsApi } from "@/lib/appwrite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ManualDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manual, setManual] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadManual = async () => {
      try {
        const data = await manualsApi.get(id);
        setManual(data);
        setForm({ ...data, steps: Array.isArray(data.steps) ? data.steps.join("\n") : "" });
      } catch (error) {
        console.error("Failed to load manual:", error);
      }
    };
    loadManual();
  }, [id]);

  const steps = useMemo(() => {
    if (!form?.steps) return [];
    const stepsStr = typeof form.steps === "string" ? form.steps : form.steps.join("\n");
    return stepsStr.split("\n").filter((line) => line.trim().length > 0);
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
      return false;
    }
    setSaving(true);
    try {
      const stepsArray = typeof form.steps === "string" 
        ? form.steps.split("\n").filter(s => s.trim()) 
        : form.steps;
      const data = await manualsApi.update(id, {
        ...form,
        steps: stepsArray,
      });
      setManual(data);
      setForm({ ...data, steps: Array.isArray(data.steps) ? data.steps.join("\n") : "" });
      toast.success("Anleitung aktualisiert.");
      return true;
    } catch (error) {
      toast.error("Speichern fehlgeschlagen.");
      return false;
    } finally {
      setSaving(false);
    }
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

  const imageSrc =
    form.image_data ||
    form.image_url ||
    "https://images.unsplash.com/photo-1607273177147-e7304c4d5d6c?crop=entropy&cs=srgb&fm=jpg&q=85";

  return (
    <div className="min-h-screen bg-white relative" data-testid="manual-detail-page">
      {/* Dot-Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
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
          {/* Image */}
          <div 
            className="aspect-video overflow-hidden border-b-4 border-black bg-gray-100" 
            data-testid="manual-detail-image"
          >
            <img
              src={imageSrc}
              alt={form.title}
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-b-4 border-black p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <label
                    className="text-sm font-bold text-white"
                    data-testid="manual-edit-title-label"
                  >
                    Titel
                  </label>
                  <Input
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="bg-white border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    data-testid="manual-edit-title"
                  />
                </div>
              ) : (
                <CardTitle 
                  className="text-white text-2xl"
                  style={{ fontFamily: "'Bangers', cursive" }}
                  data-testid="manual-detail-title"
                >
                  {manual.title}
                </CardTitle>
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
                  <Button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                    data-testid="manual-delete-button"
                  >
                    Anleitung löschen
                  </Button>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="space-y-2 mt-4">
                <label
                  className="text-sm font-bold text-white"
                  data-testid="manual-edit-description-label"
                >
                  Beschreibung
                </label>
                <Input
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="bg-white border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  data-testid="manual-edit-description"
                />
              </div>
            ) : (
              <p 
                className="text-white/90 mt-2"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                data-testid="manual-detail-description"
              >
                {manual.description}
              </p>
            )}
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
                  className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                  data-testid="manual-edit-steps"
                />
              </div>
            )}
            {isEditing && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800" data-testid="manual-edit-image-url-label">
                    Bild-URL
                  </label>
                  <Input
                    value={form.image_url || ""}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, image_url: event.target.value }))
                    }
                    placeholder="https://..."
                    className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                    data-testid="manual-edit-image-url"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800" data-testid="manual-edit-image-file-label">
                    Bild hochladen
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    data-testid="manual-edit-image-file"
                  />
                </div>
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
                    className="border-4 border-black p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
                    data-testid={`manual-step-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <span 
                        className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold flex items-center justify-center border-2 border-black"
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
