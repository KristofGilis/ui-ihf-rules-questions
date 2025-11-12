/**
 * Application-wide constants
 * Single source of truth for magic numbers and configuration values
 */

/**
 * Z-index values for layered UI elements
 * Higher values appear on top
 */
export const Z_INDEX = {
  /** Toast notifications - highest priority */
  TOAST: 10000,
  /** Skip to main content link when focused */
  SKIP_LINK: 9999,
  /** Modal dialogs and overlays */
  MODAL: 1000,
  /** Fixed header and footer navigation */
  HEADER: 50,
  FOOTER: 50,
} as const;

/**
 * Toast notification durations in milliseconds
 */
export const TOAST_DURATION = {
  /** Error messages - longer display time */
  ERROR: 5000,
  /** Warning messages */
  WARNING: 5000,
  /** Success messages - shorter display */
  SUCCESS: 3000,
  /** Info messages - shorter display */
  INFO: 3000,
} as const;

/**
 * Quiz timing configuration
 */
export const QUIZ_CONFIG = {
  /** Default time per question in seconds (timed mode) */
  TIME_PER_QUESTION: 90,
  /** Default number of questions */
  DEFAULT_QUESTION_COUNT: 10,
} as const;

/**
 * Animation durations and delays in milliseconds
 */
export const ANIMATION = {
  /** Toast slide-in animation duration */
  TOAST_SLIDE: 300,
  /** Dialog fade-in duration */
  DIALOG_FADE: 200,
  /** Scroll restoration delay */
  SCROLL_DELAY: 100,
} as const;

/**
 * Breakpoint values (should match Tailwind config)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
