import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { manualsApi } from "@/lib/appwrite";
import { ManualDialog } from "@/components/manuals/ManualDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManualsPage() {
  const [manuals, setManuals] = useState([]);

  useEffect(() => {
    const loadManuals = async () => {
      try {
        const data = await manualsApi.list();
        setManuals(data);
      } catch (error) {
        console.error("Failed to load manuals:", error);
      }
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="manuals-grid">
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
                className="group hover-lift"
                data-testid={`manual-card-${manual.id}`}
              >
                <Card className="overflow-hidden transition-colors group-hover:bg-white/5">
                  <div className="aspect-video overflow-hidden bg-stone-100" data-testid={`manual-image-${manual.id}`}>
                    <img
                      src={imageSrc}
                      alt={manual.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                <CardHeader className="p-3">
                  <CardTitle className="text-base" data-testid={`manual-title-${manual.id}`}>
                    {manual.title}
                  </CardTitle>
                </CardHeader>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
