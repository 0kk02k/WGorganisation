import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarDays, BookOpen, Settings, MapPin, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/",
    label: "Übersicht",
    short: "Home",
    icon: Home,
    testId: "nav-home-link",
  },
  {
    to: "/kalender",
    label: "Kalender",
    short: "Kalender",
    icon: CalendarDays,
    testId: "nav-calendar-link",
  },
  {
    to: "/anleitungen",
    label: "How to.....",
    short: "How to",
    icon: BookOpen,
    testId: "nav-manuals-link",
  },
  {
    to: "/berlin",
    label: "Berlin",
    short: "Berlin",
    icon: MapPin,
    testId: "nav-berlin-link",
  },
  {
    to: "/einstellungen",
    label: "Einstellungen",
    short: "Info",
    icon: Settings,
    testId: "nav-settings-link",
  },
];

export const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const toggleMobileNav = () => {
    setMobileNavOpen((prev) => !prev);
  };

  return (
    <div
      className="relative min-h-screen bg-[#050505] text-white"
      data-testid="app-shell"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-72 w-72 rounded-full bg-[#B026FF]/25 blur-[140px]" />
        <div className="absolute bottom-[-140px] right-[-60px] h-72 w-72 rounded-full bg-[#CCFF00]/20 blur-[160px]" />
      </div>
      <header className="fixed inset-x-0 top-0 z-40 hidden border-b border-white/5 bg-white/5 backdrop-blur-2xl min-[755px]:block">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-4 md:px-8">
          <nav className="flex w-full items-center justify-between gap-2" data-testid="top-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  const calendarActive =
                    item.to === "/kalender" && location.pathname.startsWith("/aufenthalte");
                  return cn(
                    "hover-lift flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive || calendarActive
                      ? "bg-[#CCFF00]/15 text-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.35)]"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  );
                }}
                data-testid={item.testId}
              >
                <item.icon className="h-4 w-4" />
                <span data-testid={`${item.testId}-label`}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <div
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-center border-b border-white/5 bg-white/5 px-4 py-4 backdrop-blur-2xl min-[755px]:hidden"
        data-testid="mobile-brand-bar"
      >
        <span
          className="text-2xl font-semibold uppercase tracking-[0.3em] text-white/80"
          data-testid="mobile-brand-text"
        >
          BODDIN14 WG-HUB
        </span>
      </div>
      {/* Mobile Navigation - always visible with slide effect */}
      <div
        className={`fixed inset-0 z-50 min-[755px]:hidden transition-all duration-300 ${
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        data-testid="mobile-nav-wrapper"
      >
        <button
          type="button"
          onClick={toggleMobileNav}
          className={`absolute inset-0 bg-black/60 transition-opacity ${
            mobileNavOpen ? "opacity-100" : "opacity-0"
          }`}
          data-testid="mobile-nav-overlay"
        />
        <aside
          className={`absolute right-0 top-0 flex h-full flex-col gap-6 border-l border-white/10 bg-white/5 p-6 pt-20 text-white backdrop-blur-2xl transition-transform duration-300 ${
            mobileNavOpen ? "translate-x-0" : "translate-x-[calc(100%-3.5rem)]"
          }`}
          data-testid="mobile-nav-panel"
        >
          {/* Hamburger button connected to nav */}
          <button
            type="button"
            onClick={toggleMobileNav}
            className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 flex h-14 w-10 items-center justify-center rounded-l-xl border-r border-white/10 bg-white/5 text-white backdrop-blur-2xl transition-all hover:bg-white/10"
            data-testid="mobile-nav-toggle"
          >
            <Menu
              className={`h-5 w-5 transition-transform duration-300 ${
                mobileNavOpen ? "rotate-90" : "rotate-0"
              }`}
            />
          </button>
          <div
            className={`flex flex-col gap-2 transition-opacity duration-300 ${
              mobileNavOpen ? "opacity-100" : "opacity-0"
            }`}
            data-testid="mobile-nav-links"
          >
            {navItems.map((item) => (
              <NavLink
                key={`${item.to}-drawer`}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) => {
                  const calendarActive =
                    item.to === "/kalender" && location.pathname.startsWith("/aufenthalte");
                  return cn(
                    "flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium transition-colors",
                    isActive || calendarActive
                      ? "border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] shadow-[0_0_18px_rgba(204,255,0,0.35)]"
                      : "border-white/10 text-white/70 hover:border-white/30 hover:text-white",
                  );
                }}
                data-testid={`mobile-${item.testId}`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </aside>
      </div>
      <main
        className="mx-auto w-full max-w-6xl px-4 pb-28 pt-28 md:px-8"
        data-testid="main-content"
      >
        {children}
      </main>
    </div>
  );
};
