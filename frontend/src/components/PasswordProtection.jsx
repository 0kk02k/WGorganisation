import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

// Passwort kommt aus der Umgebungsvariable. Ein Dev-Fallback dient nur der
// lokalen Entwicklung - in Production-Builds wird kein Passwort eingebettet.
const SITE_PASSWORD =
  process.env.REACT_APP_SITE_PASSWORD ||
  (process.env.NODE_ENV !== "production" ? "boddin-dev" : undefined);

export function PasswordProtection({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  // Bei Seitenaufruf prüfen, ob bereits authentifiziert
  useEffect(() => {
    const auth = sessionStorage.getItem("wg_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  if (!SITE_PASSWORD) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="relative z-10 w-full max-w-md p-8">
          <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
            <h1
              className="text-3xl text-gray-800 mb-3"
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              BODDIN14 WG-HUB
            </h1>
            <p
              className="text-gray-600"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Der Zugang ist nicht konfiguriert. Bitte setze die
              Umgebungsvariable <code className="font-bold">REACT_APP_SITE_PASSWORD</code>{" "}
              und baue die App neu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("wg_authenticated", "true");
      setError(false);
    } else {
      setError(true);
      setPassword("");
      // Fehler directement wieder eingabebereit machen
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-black mb-4">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h1
              className="text-3xl text-gray-800"
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              BODDIN14 WG-HUB
            </h1>
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-teal-400 mt-2" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="gate-password"
                className="text-sm font-semibold text-gray-800"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Passwort eingeben
              </label>
              <Input
                id="gate-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                aria-invalid={error || undefined}
                aria-describedby={error ? "gate-password-error" : undefined}
                className="border-4 border-black rounded-none focus:ring-4 focus:ring-yellow-400 text-gray-800 placeholder:text-gray-400"
                autoFocus
                ref={inputRef}
              />
            </div>

            <p
              id="gate-password-error"
              aria-live="assertive"
              className="text-red-600 text-sm font-semibold"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {error
                ? "Falsches Passwort. Bitte versuche es erneut - bei Problemen wende dich an die WG-Verwaltung."
                : ""}
            </p>

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Anmelden
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
