import { useEffect, useState } from "react";
import { staysApi } from "@/lib/appwrite";
import { StayDialog } from "@/components/stays/StayDialog";
import { StaysList } from "@/components/stays/StaysList";

export default function StaysPage() {
  const [stays, setStays] = useState([]);

  useEffect(() => {
    const loadStays = async () => {
      try {
        const data = await staysApi.list();
        setStays(data);
      } catch (error) {
        console.error("Failed to load stays:", error);
      }
    };
    loadStays();
  }, []);

  return (
    <div className="min-h-screen bg-white relative" data-testid="stays-page">
      {/* Dot-Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative inline-block">
            <h1 
              className="text-4xl tracking-wide text-gray-800"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="stays-title"
            >
              Aufenthalte
            </h1>
            <div className="h-2 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 mt-2" />
          </div>
          <StayDialog
            triggerLabel="Neue Belegung"
            triggerTestId="stays-new-button"
            onCreated={(stay) => setStays((prev) => [stay, ...prev])}
          />
        </div>

        <StaysList stays={stays} testIdPrefix="stays" />
      </div>
    </div>
  );
}
