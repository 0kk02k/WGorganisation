import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { DEMO_MANUALS } from "@/lib/constants";
import { ManualDialog } from "@/components/manuals/ManualDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ManualsPage() {
  const [manuals, setManuals] = useState([]);

  useEffect(() => {
    const loadManuals = async () => {
      const response = await api.get("/manuals");
      setManuals(response.data);
    };
    loadManuals();
  }, []);

  const seedManuals = async () => {
    try {
      await Promise.all(DEMO_MANUALS.map((manual) => api.post("/manuals", manual)));
      const response = await api.get("/manuals");
      setManuals(response.data);
      toast.success("Beispiel-Anleitungen hinzugefügt.");
    } catch (error) {
      toast.error("Beispiel konnte nicht geladen werden.");
    }
  };

  return (
    <div className="space-y-6" data-testid="manuals-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="font-[Manrope] text-3xl font-bold tracking-tight"
            data-testid="manuals-title"
          >
            Bedienungsanleitungen
          </h1>
          <p className="text-sm text-stone-600" data-testid="manuals-subtitle">
            Speichere alle Geräte-Anleitungen inklusive Bilder.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={seedManuals}
            data-testid="manuals-seed-button"
          >
            Beispiel-Anleitungen
          </Button>
          <ManualDialog onCreated={(manual) => setManuals((prev) => [manual, ...prev])} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2" data-testid="manuals-grid">
        {manuals.length === 0 ? (
          <Card className="border-dashed border-stone-300" data-testid="manuals-empty">
            <CardContent className="py-8 text-center text-sm text-stone-600">
              Noch keine Anleitungen. Lege eine neue an oder nutze die Beispiele.
            </CardContent>
          </Card>
        ) : (
          manuals.map((manual) => (
            <Link
              to={`/anleitungen/${manual.id}`}
              key={manual.id}
              className="group"
              data-testid={`manual-card-${manual.id}`}
            >
              <Card className="overflow-hidden border-stone-200/80 transition-colors group-hover:bg-stone-50">
                <div className="aspect-video overflow-hidden bg-stone-100" data-testid={`manual-image-${manual.id}`}>
                  <img
                    src={manual.image_data || manual.image_url}
                    alt={manual.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle data-testid={`manual-title-${manual.id}`}>
                    {manual.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600" data-testid={`manual-description-${manual.id}`}>
                    {manual.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
