import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StayDialog } from "@/components/stays/StayDialog";
import { StaysList } from "@/components/stays/StaysList";

export default function StaysPage() {
  const [stays, setStays] = useState([]);

  useEffect(() => {
    const loadStays = async () => {
      const response = await api.get("/stays");
      setStays(response.data);
    };
    loadStays();
  }, []);

  return (
    <div className="space-y-6" data-testid="stays-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="stays-title">
            Aufenthalte
          </h1>
        </div>
        <StayDialog
          triggerLabel="Neue Belegung"
          triggerTestId="stays-new-button"
          onCreated={(stay) => setStays((prev) => [stay, ...prev])}
        />
      </div>

      <StaysList stays={stays} testIdPrefix="stays" />
    </div>
  );
}
