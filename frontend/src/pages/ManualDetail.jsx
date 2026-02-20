import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { manualsApi } from "@/lib/appwrite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, Pencil, Trash2 } from "lucide-react";

export default function ManualDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manual, setManual] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

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
    
    // Bild komprimieren bevor es gespeichert wird
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Maximal 1200px Breite/Höhe
        const maxSize = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Als JPEG mit 80% Qualität
        const compressedData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('[DEBUG] Original size:', reader.result.length, 'Compressed size:', compressedData.length);
        setForm((prev) => ({ ...prev, image_data: compressedData }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
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
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      if (form.image_data && form.image_data.length > maxImageSize) {
        toast.error("Bild ist zu groß. Bitte wähle ein kleineres Bild.");
        setSaving(false);
        return false;
      }
      
      console.log('[DEBUG] Saving manual with image_data length:', form.image_data?.length || 0);
      
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
      console.error("[DEBUG] Save error:", error);
      toast.error(`Speichern fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
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
          <div 
            className={`relative aspect-video overflow-hidden border-b-4 border-black bg-gray-100 ${isEditing ? 'cursor-pointer' : ''}`}
            onClick={handleImageClick}
            data-testid="manual-detail-image"
          >
            <img
              src={imageSrc}
              alt={form.title}
              className="h-full w-full object-cover"
            />
            {/* Edit overlay when in editing mode */}
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                <div className="bg-white p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Camera className="h-8 w-8 text-gray-800" />
                </div>
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
          </div>
          
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-b-4 border-black p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <label
                    className="text-sm font-bold text-white"
                    style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                    data-testid="manual-edit-title-label"
                  >
                    Titel
                  </label>
                  <Input
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="bg-white border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-gray-800"
                    data-testid="manual-edit-title"
                  />
                </div>
              ) : (
                <CardTitle 
                  className="text-white text-2xl"
                  style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
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
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                  className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150 text-gray-800 bg-white"
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
