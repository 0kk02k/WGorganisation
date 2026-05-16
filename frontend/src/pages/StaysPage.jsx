import { useEffect, useState } from "react";
import { staysApi } from "@/lib/api";
import { StayDialog } from "@/components/stays/StayDialog";
import { StaysList } from "@/components/stays/StaysList";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/motion";

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
    <div className="min-h-screen relative" data-testid="stays-page">
      <motion.div
        className="relative z-10 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-4">
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
        </motion.div>

        <StaysList stays={stays} testIdPrefix="stays" />
      </motion.div>
    </div>
  );
}
