import { NavLink } from "react-router-dom";
import {
  Home,
  CalendarDays,
  ClipboardList,
  BookOpen,
  Settings,
} from "lucide-react";
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
    to: "/aufenthalte",
    label: "Aufenthalte",
    short: "Check-in",
    icon: ClipboardList,
    testId: "nav-stays-link",
  },
  {
    to: "/anleitungen",
    label: "Anleitungen",
    short: "Geräte",
    icon: BookOpen,
    testId: "nav-manuals-link",
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
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" data-testid="app-shell">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-stone-200/70 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <div className="space-y-1">
            <p
              data-testid="app-title"
              className="font-[Manrope] text-xl font-bold tracking-tight text-stone-900"
            >
              Teilzeit-WG Hub
            </p>
            <p
              data-testid="app-subtitle"
              className="text-sm text-stone-600"
            >
              Check-in, Belegung & Gerätewissen
            </p>
          </div>
          <nav className="hidden items-center gap-2 md:flex" data-testid="top-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-900 text-emerald-50 shadow-sm"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                  )
                }
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
        className="mx-auto w-full max-w-5xl px-4 pb-28 pt-28 md:px-8"
        data-testid="main-content"
      >
        {children}
      </main>
      <nav
        className="fixed bottom-4 left-1/2 z-40 w-[min(92%,560px)] -translate-x-1/2 rounded-full border border-stone-200 bg-white/80 px-2 py-2 shadow-xl backdrop-blur-2xl md:hidden"
        data-testid="bottom-nav"
      >
        <div className="flex items-center justify-between px-2">
          {navItems.map((item) => (
            <NavLink
              key={`${item.to}-mobile`}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-emerald-900 text-emerald-50"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                )
              }
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
