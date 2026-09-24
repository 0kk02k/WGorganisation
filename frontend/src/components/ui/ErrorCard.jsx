import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Gemeinsame Fehlerkarte für fehlgeschlagene Ladevorgänge.
 * Unterscheidet "kaputt" sichtbar von "leer".
 */
export function ErrorCard({
  title = "Laden fehlgeschlagen.",
  message,
  onRetry,
  testId,
}) {
  return (
    <div
      className="border-4 border-dashed border-red-500 bg-white p-6 text-center"
      data-testid={testId || "error-card"}
      role="alert"
    >
      <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" aria-hidden="true" />
      <p
        className="font-bold text-gray-800"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {title}
      </p>
      {message && (
        <p
          className="text-sm text-gray-600 mt-1"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {message}
        </p>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
          style={{ fontFamily: "'Nunito', sans-serif" }}
          data-testid={`${testId ? `${testId}-retry` : "error-retry"}`}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Erneut versuchen
        </Button>
      )}
    </div>
  );
}

export default ErrorCard;
