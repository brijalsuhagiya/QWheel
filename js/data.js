// data.js — all dummy, static entities. The only place data shape lives.
// Fares, distances and copy mirror the QuickWheel wireframes & brief
// (last-mile hub→destination, Indian context, ₹ currency).

export const BRAND = {
  name: "QuickWheel",
  tagline: "Last-mile, sorted.",
  supportLine: "QuickWheel 24/7 safety line",
};

export const USER = {
  firstName: "Aarav",
  countryCode: "+91",
  phoneSample: "98765 43210",
};

// Onboarding slides
export const ONBOARDING = [
  {
    id: "doorstep",
    variant: "map",
    title: "From the station to your doorstep",
    body: "Trains, airports and bus stands to your exact door — book the last leg of any trip in seconds.",
  },
  {
    id: "fares",
    variant: "fares",
    title: "Fair fares, nothing hidden",
    body: "See the price, the route and every cheaper option up front. Pick what actually works for you.",
    fares: [
      { name: "Auto", sub: "Est. 12 min", price: 86, best: false },
      { name: "QuickGo", sub: "Best value", price: 74, best: true },
      { name: "Shared", sub: "Est. 12 min", price: 52, best: false },
    ],
  },
  {
    id: "safety",
    variant: "safety",
    title: "Safety, quietly built in",
    body: "Verified drivers, recorded trips and live location sharing — always on, never in your way.",
    pills: [
      { label: "Verified drivers", color: "var(--info)" },
      { label: "Trip recording", color: "var(--safety)" },
      { label: "Live location", color: "var(--success)" },
    ],
  },
];

// Home saved places
export const SAVED_PLACES = [
  { id: "home", icon: "home", title: "Home", sub: "Sector 24, Noida", kind: "default" },
  { id: "work", icon: "briefcase", title: "Work", sub: "Cyber Hub, Gurugram", kind: "default" },
  {
    id: "ndls",
    icon: "train",
    title: "New Delhi Railway Station",
    sub: "Recent · last-mile pickup",
    kind: "hub",
  },
];

export const HUB = {
  id: "ndls",
  name: "New Delhi Railway Station",
  short: "Railway Station",
};

// Verified pickup points at the hub (screen 09)
export const PICKUP_POINTS = [
  { id: "A", badge: "A", title: "Gate 2 · Prepaid Auto Stand", sub: "1 min walk · well-lit, staffed", tag: "Recommended", default: true },
  { id: "B", badge: "B", title: "Platform 1 Exit", sub: "3 min walk · covered", tag: null, default: false },
  { id: "C", badge: "C", title: "Paharganj Side Gate", sub: "5 min walk", tag: null, default: false },
];

export const DESTINATION = { title: "Home", sub: "Sector 24, Noida" };

export const TRIP_DEFAULTS = { passengers: 3, bags: 4, maxPassengers: 8, maxBags: 10 };

// Ride options (screen 11). distanceKm/durationMin shown in header.
export const TRIP_META = { distanceKm: 18, durationMin: 32 };

export const RIDE_OPTIONS = [
  { id: "quickxl", name: "QuickXL", icon: "suv", seats: 6, bags: 4, etaMin: 4, price: 412, tag: "Best for you", tagKind: "dark", save: 0 },
  { id: "quickgo", name: "QuickGo", icon: "car", seats: 4, bags: 2, etaMin: 3, price: 286, tag: "Cheapest", tagKind: "success", save: 126 },
  { id: "shared", name: "Shared", icon: "car", seats: 2, bags: 2, etaMin: 6, price: 168, tag: null, tagKind: null, save: 244, meta: "Co-ride · same route", shareable: true },
  { id: "bus", name: "AC Bus", icon: "bus", seats: null, bags: null, etaMin: 9, price: 90, tag: null, tagKind: null, save: 0, meta: "Seats available" },
];

export const SUGGESTION = {
  title: "Suggested: spacious SUV",
  sub: "Innova or Ertiga — fits 3 people + 4 bags",
  altNote: "Longer route? AC bus seats are also available at ₹90.",
};

// Safety toggles (screen 12). Keys map into store.safety.
export const SAFETY_TOGGLES = [
  { key: "verifiedDrivers", icon: "star", iconKind: "warn", title: "Top-rated, verified drivers", sub: "Background-checked · woman-preferred", on: true },
  { key: "recordTrip", icon: "record", iconKind: "danger", title: "Record this trip", sub: "Encrypted audio, only you control it", on: true },
  { key: "shareLive", icon: "location", iconKind: "info", title: "Share live location", sub: "With Mom & Priya for the whole trip", on: true },
  { key: "womenOnly", icon: "person", iconKind: "safety", title: "Women co-passengers only", sub: "Applies when you share a ride", on: true },
];

export const TRUSTED_CONTACTS = [
  { id: "m", initial: "M", name: "Mom", color: "var(--info)" },
  { id: "p", initial: "P", name: "Priya", color: "var(--success)" },
];

// Share-ride match (screen 13)
export const CORIDER = { initial: "N", name: "Neha", rating: 4.9, verified: true, note: "On your route · picks up in 2 min", color: "var(--safety)" };
export const SHARE_PREFS = [
  { key: "womenOnly", title: "Women co-passengers only", sub: "Match me with women riders", on: true },
  { key: "maxOne", title: "Max 1 co-passenger", sub: "Keep it quick & comfortable", on: true },
];

// Smart detour (screen 14)
export const DETOUR = {
  save: 74,
  pct: 18,
  extraMin: 6,
  direct: { label: "Direct route", min: 32, price: 412 },
  smart: { label: "Smart detour", min: 38, price: 338, tag: "Recommended" },
};

// Payment + coupon
export const PAYMENT = { method: "UPI", sub: "Pay by any app" };
export const COUPON = { code: "FIRST50", applied: true };

// Driver (screen 17)
export const DRIVER = {
  initial: "R",
  name: "Rajesh Kumar",
  rating: 4.9,
  car: "White Toyota Innova",
  plate: "DL3C AB 1234",
  pin: "4827",
  etaMin: 4,
};

// Menu / settings preferences (exercises slider + checkbox + toggle)
export const PREF_DEFAULTS = {
  maxWalkMin: 5,       // slider 1–10 min
  cheaperAlerts: true, // checkbox
  darkTheme: false,    // toggle (also flips app theme)
};

export const MENU_ITEMS = [
  { id: "payments", icon: "card", title: "Payment methods", sub: "UPI · ending in any app", soon: true },
  { id: "history", icon: "history", title: "Trip history", sub: "Your recent last-mile rides", soon: true },
  { id: "settings", icon: "settings", title: "Ride preferences", sub: "Walk distance, alerts, theme", soon: false },
  { id: "help", icon: "help", title: "Help & support", sub: "24/7 safety line", soon: true },
];
