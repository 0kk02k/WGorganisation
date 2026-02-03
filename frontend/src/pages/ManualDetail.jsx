import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManualDetail() {
  const { id } = useParams();
  const [manual, setManual] = useState(null);

  useEffect(() => {
    const loadManual = async () => {
      const response = await api.get(`/manuals/${id}`);
      setManual(response.data);
    };
    loadManual();
  }, [id]);

  const steps = useMemo(() => {
    if (!manual?.steps) return [];
    return manual.steps.split("\n").filter((line) => line.trim().length > 0);
  }, [manual]);

  if (!manual) {
    return (
      <div className="text-sm text-stone-600" data-testid="manual-loading">
        Anleitung wird geladen...
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="manual-detail-page">
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/anleitungen" data-testid="manual-back-link">
          Zurück
        </Link>
      </Button>
      <Card className="overflow-hidden border-stone-200/80" data-testid="manual-detail-card">
        <div className="aspect-video overflow-hidden bg-stone-100" data-testid="manual-detail-image">
          <img
            src={manual.image_data || manual.image_url}
            alt={manual.title}
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader>
          <CardTitle data-testid="manual-detail-title">{manual.title}</CardTitle>
          <p className="text-sm text-stone-600" data-testid="manual-detail-description">
            {manual.description}
          </p>
        </CardHeader>
        <CardContent>
          <h3
            className="mb-3 text-sm font-semibold text-stone-900"
            data-testid="manual-detail-steps-title"
          >
            Schritt-für-Schritt
          </h3>
          <ol className="space-y-2 text-sm text-stone-700">
            {steps.map((step, index) => (
              <li
                key={`${manual.id}-step-${index}`}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                data-testid={`manual-step-${index}`}
              >
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
