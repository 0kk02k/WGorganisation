import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarDays, BookOpen, Settings, MapPin, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { pageTransition, slideInRight, overlayFade } from "@/lib/motion";

const navItems = [
  {
    to: "/",
    label: "Übersicht",
    short: "Home",
    icon: Home,
    testId: "nav-home-link",
    color: "from-yellow-400 to-orange-500",
  },
  {
    to: "/kalender",
    label: "Kalender",
    short: "Kalender",
    icon: CalendarDays,
    testId: "nav-calendar-link",
    color: "from-teal-400 to-emerald-400",
  },
  {
    to: "/anleitungen",
    label: "How to.....",
    short: "How to",
    icon: BookOpen,
    testId: "nav-manuals-link",
    color: "from-pink-500 to-rose-500",
  },
  {
    to: "/berlin",
    label: "Berlin",
    short: "Berlin",
    icon: MapPin,
    testId: "nav-berlin-link",
    color: "from-orange-500 to-red-500",
  },
  {
    to: "/einstellungen",
    label: "Einstellungen",
    short: "Info",
    icon: Settings,
    testId: "nav-settings-link",
    color: "from-purple-500 to-pink-500",
  },
];

export const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Hide title bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setTitleVisible(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileNav = () => {
    setMobileNavOpen((prev) => !prev);
  };

  return (
    <div
      className="relative min-h-screen bg-white text-gray-800"
      data-testid="app-shell"
    >
      {/* Dot-Pattern Overlay - same style as index.css body::before */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(50, 50, 55, 0.5) 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px"
        }} 
      />
      
      {/* Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/3 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 left-0 w-36 h-36 bg-teal-400 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Combined Title + Navigation Bar - Desktop only */}
      <header 
        className={`fixed inset-x-0 z-40 hidden border-b-4 border-black bg-white transition-all duration-300 overflow-hidden min-[755px]:block ${
          titleVisible ? "h-32" : "h-14"
        }`}
        data-testid="desktop-header"
      >
        {/* Scrolling Ticker - Background layer, full height behind nav */}
        <div 
          className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${
            titleVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex whitespace-nowrap animate-ticker h-full items-center">
            {[...Array(20)].map((_, i) => (
              <span 
                key={i}
                className="tracking-wide text-gray-800"
                style={{ fontFamily: "'Bangers', cursive", fontSize: '3.9rem' }}
              >
                BODDINWG-HUB++++
              </span>
            ))}
          </div>
        </div>
        
        {/* Navigation - always visible, positioned at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 z-10 mx-auto flex max-w-6xl items-center justify-center px-4 py-3 md:px-8`}>
          <nav className="flex w-full items-center justify-between gap-2" data-testid="top-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  const calendarActive =
                    item.to === "/kalender" && location.pathname.startsWith("/aufenthalte");
                  return cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-bold border-4 border-black rounded-none transition-all duration-150",
                    isActive || calendarActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                      : "bg-white text-gray-800 hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  );
                }}
                data-testid={item.testId}
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                <item.icon className="h-4 w-4" />
                <span data-testid={`${item.testId}-label`}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Brand Bar with Hamburger Menu */}
      <div
        className="fixed inset-x-0 top-0 z-40 border-b-4 border-black bg-white overflow-hidden min-[755px]:hidden"
        data-testid="mobile-brand-bar"
      >
        <div className="relative py-3 overflow-hidden">
          {/* Scrolling Ticker */}
          <div 
            className="flex whitespace-nowrap animate-ticker"
          >
            {[...Array(20)].map((_, i) => (
              <span 
                key={i}
                className="text-xl tracking-wide text-gray-800"
                style={{ fontFamily: "'Bangers', cursive" }}
              >
                BODDINWG-HUB++++
              </span>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-teal-400" />
        {/* Hamburger Menu Button - positioned absolute within the bar */}
        <button
          type="button"
          onClick={toggleMobileNav}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 items-center justify-center border-4 border-black bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          data-testid="mobile-nav-toggle"
        >
          {mobileNavOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            key="mobile-overlay"
            className="fixed inset-0 z-40 bg-black/50 min-[755px]:hidden"
            onClick={() => setMobileNavOpen(false)}
            data-testid="mobile-nav-overlay"
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            key="mobile-nav-panel"
            className="fixed right-0 top-0 z-50 h-full w-64 border-l-4 border-black bg-white p-6 pt-20 min-[755px]:hidden"
            data-testid="mobile-nav-panel"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col gap-3" data-testid="mobile-nav-links">
              {navItems.map((item) => (
                <NavLink
                  key={`${item.to}-drawer`}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) => {
                    const calendarActive =
                      item.to === "/kalender" && location.pathname.startsWith("/aufenthalte");
                    return cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-bold border-4 border-black rounded-none transition-all",
                      isActive || calendarActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                        : "bg-white text-gray-800 hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    );
                  }}
                  data-testid={`mobile-${item.testId}`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={`mx-auto w-full max-w-6xl px-2 pb-20 pt-20 transition-all duration-300 min-[755px]:px-4 min-[755px]:pb-28 md:px-8 ${
          titleVisible ? "min-[755px]:pt-36" : "min-[755px]:pt-20"
        }`}
        data-testid="main-content"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
