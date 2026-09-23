import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { manualsApi } from "@/lib/api";
import { ManualDialog } from "@/components/manuals/ManualDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ManualPlaceholder } from "@/components/manuals/ManualPlaceholder";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp, scaleIn } from "@/lib/motion";
import { Search, X } from "lucide-react";

export default function ManualsPage() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  // ?q= wird von den Gäste-Chips des Dashboards gesetzt; lokal synchron halten
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  const applySearch = (value) => {
    setSearch(value);
    setSearchParams(value.trim() ? { q: value.trim() } : {}, { replace: true });
  };

  useEffect(() => {
    const loadManuals = async () => {
      setLoadError(null);
      try {
        const data = await manualsApi.list();
        setManuals(data);
      } catch (error) {
        console.error("Failed to load manuals:", error);
        setLoadError(error);
      } finally {
        setLoading(false);
      }
    };
    loadManuals();
  }, []);

  const query = search.trim().toLowerCase();
  const filteredManuals = query
    ? manuals.filter((manual) =>
        [manual.title, manual.description, manual.steps].some((field) =>
          field?.toLowerCase().includes(query),
        ),
      )
    : manuals;

  return (
    <div className="min-h-screen relative" data-testid="manuals-page">
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
              data-testid="manuals-title"
            >
              How to.....
            </h1>
            <p
              className="mt-1 text-sm text-gray-500"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Geräte bedienen, Hausregeln kennen — ohne fragen zu müssen.
            </p>
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 mt-2" />
          </div>
          <ManualDialog onCreated={(manual) => setManuals((prev) => [manual, ...prev])} />
        </motion.div>

        {/* Suche */}
        <motion.div variants={fadeInUp} className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => applySearch(event.target.value)}
            placeholder="How to suchen (z.B. Waschmaschine, WLAN, Müll)"
            aria-label="How tos durchsuchen"
            className="h-11 border-4 border-black rounded-none bg-white pl-9 pr-10 text-gray-800 placeholder:text-gray-500"
            data-testid="manuals-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => applySearch("")}
              aria-label="Suche zurücksetzen"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-black bg-white text-gray-800 hover:bg-gray-100 transition-colors"
              data-testid="manuals-search-clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        {/* Manuals Grid */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          data-testid="manuals-grid"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {loadError ? (
            <div className="col-span-full">
              <ErrorCard
                title="Anleitungen konnten nicht geladen werden."
                onRetry={() => {
                  setLoading(true);
                  loadManuals();
                }}
                testId="manuals-error"
              />
            </div>
          ) : loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-none bg-gray-200" aria-hidden="true" />
            ))
          ) : manuals.length === 0 ? (
            <Card
              className="border-4 border-dashed border-gray-300 rounded-none bg-white col-span-full"
              data-testid="manuals-empty"
            >
              <CardContent className="py-12 text-center">
                <p
                  className="text-gray-500 text-lg"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Noch keine How tos. Tippe oben rechts auf +, um das erste anzulegen.
                </p>
              </CardContent>
            </Card>
          ) : filteredManuals.length === 0 ? (
            <Card
              className="border-4 border-dashed border-gray-300 rounded-none bg-white col-span-full"
              data-testid="manuals-search-empty"
            >
              <CardContent className="py-12 text-center">
                <p
                  className="text-gray-500 text-lg"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Kein How to für „{search.trim()}“ gefunden. Frag im WG-Chat — oder lege es oben rechts neu an.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredManuals.map((manual) => {
              const imageSrc = manual.image_data || manual.image_url || "";
              return (
                <motion.div
                  key={manual.id}
                  variants={scaleIn}
                >
                <Link
                  to={`/anleitungen/${manual.id}`}
                  className="group block"
                  data-testid={`manual-card-${manual.id}`}
                >
                  <Card className="bg-white border-4 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
                    <div
                      className="aspect-video overflow-hidden border-b-4 border-black bg-gray-100"
                      data-testid={`manual-image-${manual.id}`}
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={manual.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ManualPlaceholder title={manual.title} />
                      )}
                    </div>
                    <CardHeader className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100">
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
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
