import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

// Das Passwort wird aus der Umgebungsvariable gelesen
const SITE_PASSWORD = process.env.REACT_APP_SITE_PASSWORD || "Boddin14-2026";

export function PasswordProtection({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  // Bei Seitenaufruf prüfen, ob bereits authentifiziert
  useEffect(() => {
    const auth = sessionStorage.getItem("wg_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("wg_authenticated", "true");
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative">
      {/* Dot-Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
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
              WG Organiser
            </h1>
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-teal-400 mt-2" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label 
                className="text-sm font-semibold text-gray-800"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Passwort eingeben
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                className="border-4 border-black rounded-none focus:ring-4 focus:ring-yellow-400 text-gray-800 placeholder:text-gray-400"
                autoFocus
              />
            </div>

            {error && (
              <p 
                className="text-red-500 text-sm font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Falsches Passwort. Bitte versuche es erneut.
              </p>
            )}

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
