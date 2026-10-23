// app.js — entry point. Builds the route table, picks the initial
// route, applies the saved theme, and boots the router.

import { createRouter } from "./router.js";
import * as screens from "./screens.js";
import * as store from "./store.js";
import { toast } from "./components.js";

const routes = {
  splash: screens.splash,
  onboarding: screens.onboarding,
  phone: screens.phone,
  otp: screens.otp,
  photo: screens.photo,
  home: screens.home,
  pickup: screens.pickup,
  tripDetails: screens.tripDetails,
  rideOptions: screens.rideOptions,
  safety: screens.safety,
  shareRide: screens.shareRide,
  detour: screens.detour,
  confirm: screens.confirm,
  finding: screens.finding,
  arriving: screens.arriving,
};

const phone = document.getElementById("phone");
const viewport = document.getElementById("viewport");

// Apply persisted theme preference before first paint.
if (store.get("prefs.darkTheme")) phone.dataset.theme = "dark";

// Always boot from the splash for the demo narrative.
createRouter({
  routes,
  mount: viewport,
  phone,
  start: "splash",
  startParams: {},
});

// Gentle heads-up if storage is unavailable (private browsing etc.).
if (!store.storageAvailable) {
  window.addEventListener("load", () => {
    setTimeout(() => toast("Private mode: your progress won't be saved.", { duration: 3200 }), 2200);
  });
}

// Expose a tiny debug hook (handy during manual testing; harmless in prod).
window.QuickWheel = { store };
