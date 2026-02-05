import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarDays, BookOpen, Settings, MapPin, Menu, X } from "lucide-react";
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
  return (
    <div
      className="relative min-h-screen bg-[#050505] text-white"
      data-testid="app-shell"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-72 w-72 rounded-full bg-[#B026FF]/25 blur-[140px]" />
        <div className="absolute bottom-[-140px] right-[-60px] h-72 w-72 rounded-full bg-[#CCFF00]/20 blur-[160px]" />
      </div>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-white/5 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-4 md:px-8">
          <nav
            className="hidden w-full items-center justify-between gap-2 md:flex"
            data-testid="top-nav"
          >
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
      <main
        className="mx-auto w-full max-w-6xl px-4 pb-28 pt-28 md:px-8"
        data-testid="main-content"
      >
        {children}
      </main>
      <nav
        className="fixed bottom-4 left-1/2 z-40 w-[min(92%,560px)] -translate-x-1/2 rounded-full border border-white/5 bg-white/5 px-2 py-2 shadow-[0_0_30px_rgba(176,38,255,0.25)] backdrop-blur-2xl md:hidden"
        data-testid="bottom-nav"
      >
        <div className="flex items-center justify-between px-2">
          {navItems.map((item) => (
            <NavLink
              key={`${item.to}-mobile`}
              to={item.to}
              className={({ isActive }) => {
                const calendarActive =
                  item.to === "/kalender" && location.pathname.startsWith("/aufenthalte");
                return cn(
                  "hover-lift flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
                  isActive || calendarActive
                    ? "bg-[#CCFF00]/15 text-[#CCFF00]"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                );
              }}
              data-testid={`${item.testId}-mobile`}
            >
              <item.icon className="h-4 w-4" />
              <span data-testid={`${item.testId}-mobile-label`}>{item.short}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
