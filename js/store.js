// store.js — app state backed by localStorage with a silent
// in-memory fallback (private browsing / disabled storage).
// Exposes get/set/update/subscribe/reset. All mutations flow here.

import {
  TRIP_DEFAULTS,
  SAFETY_TOGGLES,
  SHARE_PREFS,
  PREF_DEFAULTS,
  PICKUP_POINTS,
  RIDE_OPTIONS,
  PAYMENT,
  COUPON,
} from "./data.js";

const KEY = "quickwheel.state.v1";

/* ---- storage adapter with in-memory fallback ---- */
const memory = new Map();
let storageOK = true;
try {
  const t = "__qw_probe__";
  localStorage.setItem(t, "1");
  localStorage.removeItem(t);
} catch (_) {
  storageOK = false;
}

const backend = storageOK
  ? {
      read(k) {
        try { return localStorage.getItem(k); } catch (_) { return memory.get(k) ?? null; }
      },
      write(k, v) {
        try { localStorage.setItem(k, v); } catch (_) { memory.set(k, v); }
      },
      remove(k) {
        try { localStorage.removeItem(k); } catch (_) { memory.delete(k); }
      },
    }
  : {
      read: (k) => (memory.has(k) ? memory.get(k) : null),
      write: (k, v) => memory.set(k, v),
      remove: (k) => memory.delete(k),
    };

export const storageAvailable = storageOK;

/* ---- default shape ---- */
function defaults() {
  const safety = {};
  SAFETY_TOGGLES.forEach((t) => (safety[t.key] = t.on));
  const sharePrefs = {};
  SHARE_PREFS.forEach((p) => (sharePrefs[p.key] = p.on));

  return {
    onboarded: false,
    authed: false,
    user: { firstName: "", phone: "", photo: false },
    trip: {
      hubId: "ndls",
      pickupId: PICKUP_POINTS.find((p) => p.default)?.id || "A",
      passengers: TRIP_DEFAULTS.passengers,
      bags: TRIP_DEFAULTS.bags,
      rideId: RIDE_OPTIONS[0].id,
      shared: false,
      detourTaken: false,
      payment: PAYMENT.method,
      coupon: COUPON.applied ? COUPON.code : null,
    },
    safety,
    sharePrefs,
    prefs: { ...PREF_DEFAULTS },
  };
}

/* ---- load / persist ---- */
function load() {
  const raw = backend.read(KEY);
  if (!raw) return defaults();
  try {
    const saved = JSON.parse(raw);
    // shallow-merge over defaults so new keys appear for old saves
    const d = defaults();
    return {
      ...d,
      ...saved,
      user: { ...d.user, ...(saved.user || {}) },
      trip: { ...d.trip, ...(saved.trip || {}) },
      safety: { ...d.safety, ...(saved.safety || {}) },
      sharePrefs: { ...d.sharePrefs, ...(saved.sharePrefs || {}) },
      prefs: { ...d.prefs, ...(saved.prefs || {}) },
    };
  } catch (_) {
    return defaults();
  }
}

let state = load();
const subscribers = new Set();

function persist() {
  backend.write(KEY, JSON.stringify(state));
}

function emit() {
  subscribers.forEach((fn) => {
    try { fn(state); } catch (e) { console.error("[store] subscriber error", e); }
  });
}

/* ---- public API ---- */
export function getState() {
  return state;
}

export function get(path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), state);
}

/** Replace top-level slices (shallow-merged) and notify. */
export function set(patch) {
  state = { ...state, ...patch };
  persist();
  emit();
  return state;
}

/** Update a nested slice immutably: update("trip", { bags: 2 }). */
export function update(slice, patch) {
  state = { ...state, [slice]: { ...state[slice], ...patch } };
  persist();
  emit();
  return state;
}

/** Toggle a boolean inside a slice; returns new value. */
export function toggle(slice, key) {
  const next = !state[slice][key];
  update(slice, { [key]: next });
  return next;
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** Wipe everything back to defaults (demo reset). */
export function reset() {
  backend.remove(KEY);
  state = defaults();
  persist();
  emit();
  return state;
}
