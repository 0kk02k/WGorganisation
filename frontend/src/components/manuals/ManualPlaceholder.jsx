import { Wrench } from "lucide-react";

/**
 * Neutrale Bildplatzhalter-Fläche für Anleitungen ohne Foto.
 * Ersetzt das frühere generische Stockfoto, das falsche Infos transportierte.
 */
export const ManualPlaceholder = ({ title = "", className = "" }) => {
  const initial = (title || "").trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`h-full w-full bg-gray-100 flex flex-col items-center justify-center gap-1 ${className}`}
      role="img"
      aria-label={`Kein Bild hinterlegt für ${title || "diese Anleitung"}`}
      data-testid="manual-placeholder"
    >
      <Wrench className="h-8 w-8 text-gray-400" aria-hidden="true" />
      <span
        className="text-3xl text-gray-300 leading-none"
        style={{ fontFamily: "'Bangers', cursive" }}
        aria-hidden="true"
      >
        {initial}
      </span>
    </div>
  );
};

export default ManualPlaceholder;
