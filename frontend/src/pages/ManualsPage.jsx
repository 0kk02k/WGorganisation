import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ManualDialog } from "@/components/manuals/ManualDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-6" data-testid="manuals-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="manuals-title">
            How to.....
          </h1>
        </div>
        <ManualDialog onCreated={(manual) => setManuals((prev) => [manual, ...prev])} />
      </div>

      <div className="grid gap-4 md:grid-cols-2" data-testid="manuals-grid">
        {manuals.length === 0 ? (
          <Card className="border-dashed border-stone-300" data-testid="manuals-empty">
            <CardContent className="py-8 text-center text-sm text-stone-600">
              Noch keine Anleitungen. Lege eine neue an.
            </CardContent>
          </Card>
        ) : (
          manuals.map((manual) => {
            const imageSrc =
              manual.image_data ||
              manual.image_url ||
              "https://images.unsplash.com/photo-1607273177147-e7304c4d5d6c?crop=entropy&cs=srgb&fm=jpg&q=85";
            return (
              <Link
                to={`/anleitungen/${manual.id}`}
                key={manual.id}
                className="group"
                data-testid={`manual-card-${manual.id}`}
              >
                <Card className="overflow-hidden border-stone-200/80 transition-colors group-hover:bg-stone-50">
                  <div className="aspect-video overflow-hidden bg-stone-100" data-testid={`manual-image-${manual.id}`}>
                    <img
                      src={imageSrc}
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
            );
          })
        )}
      </div>
    </div>
  );
}
