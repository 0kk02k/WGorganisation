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
    <div className="min-h-screen relative" data-testid="manuals-page">
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative inline-block">
            <h1 
              className="text-4xl tracking-wide text-gray-800"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="manuals-title"
            >
              How to.....
            </h1>
            <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 mt-2" />
          </div>
          <ManualDialog onCreated={(manual) => setManuals((prev) => [manual, ...prev])} />
        </div>

        {/* Manuals Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="manuals-grid">
          {manuals.length === 0 ? (
            <Card 
              className="border-4 border-dashed border-gray-300 rounded-none bg-white col-span-full"
              data-testid="manuals-empty"
            >
              <CardContent className="py-12 text-center">
                <p 
                  className="text-gray-500 text-lg"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Noch keine Anleitungen. Lege eine neue an.
                </p>
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
                  className="group block"
                  data-testid={`manual-card-${manual.id}`}
                >
                  <Card className="bg-white border-4 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
                    <div 
                      className="aspect-video overflow-hidden border-b-4 border-black bg-gray-100" 
                      data-testid={`manual-image-${manual.id}`}
                    >
                      <img
                        src={imageSrc}
                        alt={manual.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader className="p-4 bg-gradient-to-r from-violet-100 to-fuchsia-100">
                      <CardTitle 
                        className="text-lg font-bold text-gray-800"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        data-testid={`manual-title-${manual.id}`}
                      >
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
    </div>
  );
}
