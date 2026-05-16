import { motion } from "framer-motion";

// ============ REUSABLE VARIANTS ============

// Staggered container for lists/grids
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// Single item in a staggered list
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Fade in from below
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// Scale-in for cards
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

// Slide in from right (mobile nav)
export const slideInRight = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// Overlay fade
export const overlayFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Chat message entrance
export const chatMessage = {
  initial: { opacity: 0, x: -16, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

// Flip digit for counter
export const flipDigit = {
  initial: { y: -20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: { duration: 0.1 },
  },
};

// Calendar cell hover
export const calendarCellHover = {
  whileHover: { scale: 1.06, transition: { type: "spring", stiffness: 400, damping: 20 } },
  whileTap: { scale: 0.95 },
};

// Spring hover for cards/buttons
export const springHover = {
  whileHover: {
    scale: 1.02,
    y: -2,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
  whileTap: { scale: 0.98 },
};

// ============ MOTION COMPONENTS ============

// Drop-in replacement for cards in staggered lists
export const MotionCard = motion.div;

// Motion wrapper for page content
export const PageMotion = motion.div;
