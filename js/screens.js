// screens.js — every route as a factory returning { node, meta, onEnter, onExit }.
// Screens read data via store/data and compose components only.

import { icon } from "./icons.js";
import {
  el, frag, activatable,
  button, iconButton, header, actionBar,
  badge, pill, chipGroup, toggle, checkbox, stepper, slider,
  row, chevron, option, rideCard, avatar, dots, banner,
  skeleton, toast, openSheet, confirmSheet,
} from "./components.js";
import * as store from "./store.js";
import * as D from "./data.js";

/* ============================================================
   Shared helpers
   ============================================================ */
function mapBackdrop() {
  return el("div", { class: "map", attrs: { "aria-hidden": "true" } }, [
    el("div", { class: "map__grid" }),
    el("div", { class: "map__park map__p1" }),
    el("div", { class: "map__park map__p2" }),
    el("div", { class: "map__park map__p3" }),
    el("div", { class: "map__park map__p4" }),
    el("div", { class: "map__park map__p5" }),
  ]);
}

const rideById = (id) => D.RIDE_OPTIONS.find((r) => r.id === id) || D.RIDE_OPTIONS[0];
const pickupById = (id) => D.PICKUP_POINTS.find((p) => p.id === id) || D.PICKUP_POINTS[0];

/* ============================================================
   1. SPLASH
   ============================================================ */
export function splash(_params, ctx) {
  const node = el("div", {}, [
    el("div", { class: "splash" }, [
      el("div", { class: "splash__logo", html: icon("logo", { size: 92, stroke: 2.4 }) }),
      el("div", { class: "splash__name", text: D.BRAND.name }),
      el("div", { class: "splash__tag", text: D.BRAND.tagline }),
      el("div", { class: "splash__loader" }),
    ]),
  ]);
  let timer;
  return {
    node,
    meta: { statusbar: "light" },
    onEnter() {
      const next = () => ctx.replace(store.get("onboarded") ? "home" : "onboarding", { slide: 0 });
      timer = setTimeout(next, 1900);
      node.addEventListener("click", () => { clearTimeout(timer); next(); });
    },
    onExit() { clearTimeout(timer); },
  };
}

/* ============================================================
   2. ONBOARDING (3 slides, internal index via param)
   ============================================================ */
export function onboarding(params, ctx) {
  const idx = Math.max(0, Math.min(D.ONBOARDING.length - 1, params.slide || 0));
  const slide = D.ONBOARDING[idx];
  const last = idx === D.ONBOARDING.length - 1;

  const stage = el("div", { class: "onb__stage" }, [buildStageArt(slide)]);

  const skip = el("div", { class: "onb__skip" }, [
    !last ? el("button", { type: "button", text: "Skip", onClick: finish }) : el("span", { style: { height: "44px" } }),
  ]);

  function finish() {
    store.set({ onboarded: true });
    ctx.replace("phone");
  }
  function advance() {
    if (last) finish();
    else ctx.replace("onboarding", { slide: idx + 1 });
  }

  const node = el("div", {}, [
    el("div", { class: "onb" }, [
      skip,
      stage,
      el("div", { class: "onb__scroll" }, [
        el("div", { class: "onb__dots" }, [dots(D.ONBOARDING.length, idx)]),
        el("h1", { class: "onb__title", text: slide.title }),
        el("p", { class: "onb__body", text: slide.body }),
      ]),
      actionBar([button(last ? "Get started" : "Next", { onClick: advance })]),
    ]),
  ]);
  return { node, meta: { statusbar: "dark" } };
}

function buildStageArt(slide) {
  if (slide.variant === "map") {
    const wrap = el("div", { class: "onb-map" });
    // four tiles
    [["6%", "8%", "40%", "26%"], ["58%", "16%", "34%", "24%"], ["8%", "52%", "34%", "30%"], ["56%", "50%", "36%", "34%"]]
      .forEach(([l, t, w, h]) => wrap.appendChild(el("div", { class: "onb-map__tile", style: { left: l, top: t, width: w, height: h } })));
    // route svg
    wrap.appendChild(el("div", { html: `
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
        <line x1="30" y1="26" x2="72" y2="68" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="2 7" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      </svg>` }).firstElementChild);
    wrap.appendChild(el("div", { class: "map-tag map-tag--light", style: { left: "30%", top: "18%" }, text: "Platform 1" }));
    wrap.appendChild(el("div", { class: "puck", style: { left: "30%", top: "26%", width: "16px", height: "16px" } }));
    wrap.appendChild(el("div", { class: "map-tag", style: { left: "72%", top: "76%" }, text: "Home" }));
    wrap.appendChild(el("div", { style: { position: "absolute", left: "72%", top: "68%", width: "14px", height: "14px", background: "var(--accent)", borderRadius: "50%", border: "3px solid var(--bg-card)", transform: "translate(-50%,-50%)" } }));
    return wrap;
  }
  if (slide.variant === "fares") {
    const wrap = el("div", { class: "onb-fares" });
    slide.fares.forEach((f) => {
      wrap.appendChild(el("div", { class: `fare-card ${f.best ? "fare-card--best" : ""}`.trim() }, [
        el("div", {}, [
          el("div", { class: "fare-card__name", text: f.name }),
          el("div", { class: "fare-card__sub", text: f.sub }),
        ]),
        el("div", { class: "fare-card__price", text: `₹${f.price}` }),
      ]));
    });
    return wrap;
  }
  // safety
  const wrap = el("div", { class: "onb-safety" });
  wrap.appendChild(el("div", { class: "onb-safety__check", html: icon("check", { size: 42, stroke: 2.6 }) }));
  const pills = el("div", { class: "onb-safety__pills" });
  slide.pills.forEach((p) => pills.appendChild(pill(p.label, { dotColor: p.color, surface: true })));
  wrap.appendChild(pills);
  return wrap;
}

/* ============================================================
   3. PHONE NUMBER
   ============================================================ */
export function phone(_params, ctx) {
  const errId = "phone-err";
  const input = el("input", {
    type: "tel", inputmode: "numeric", placeholder: D.USER.phoneSample,
    value: D.USER.phoneSample, autocomplete: "tel-national",
    attrs: { "aria-label": "Phone number", "aria-describedby": errId },
  });
  const phoneBox = el("div", { class: "phone-input" }, [
    el("span", { class: "phone-input__cc", text: D.USER.countryCode }),
    input,
  ]);
  const err = el("div", { class: "form-error", id: errId, attrs: { "aria-live": "polite" } });

  function submit() {
    const digits = (input.value || "").replace(/\D/g, "");
    if (digits.length < 10) {
      phoneBox.classList.add("phone-input--invalid");
      input.classList.add("input--invalid");
      err.textContent = "Enter a valid 10-digit mobile number.";
      input.focus();
      return;
    }
    store.update("user", { phone: `${D.USER.countryCode} ${input.value.trim()}` });
    ctx.navigate("otp");
  }
  input.addEventListener("input", () => {
    phoneBox.classList.remove("phone-input--invalid");
    input.classList.remove("input--invalid");
    err.textContent = "";
  });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

  const node = el("div", {}, [
    header({ onBack: () => ctx.back("onboarding") }),
    el("div", { class: "auth__scroll" }, [
      el("h1", { class: "auth__title", text: "Enter your number" }),
      el("p", { class: "auth__sub", text: "We'll text a one-time code to verify it's you." }),
      el("div", { style: { height: "24px" } }),
      phoneBox,
      err,
      el("div", { class: "auth__or", text: "or" }),
      button("Continue with Apple", { variant: "secondary", cls: "with-icon", onClick: () => toast("Apple sign-in isn't wired up in this demo.", { icon: "apple" }) }),
    ]),
    actionBar([button("Continue", { onClick: submit })], {
      note: 'By continuing you agree to our <a class="link" href="#" onclick="return false">Terms</a> and <a class="link" href="#" onclick="return false">Privacy Policy</a>.',
    }),
  ]);
  return { node, meta: { statusbar: "dark" } };
}

/* ============================================================
   4. OTP VERIFY
   ============================================================ */
export function otp(_params, ctx) {
  const LEN = 6;
  let value = "24"; // pre-filled like the wireframe (2,4,|)
  let countdown = 24;
  let timer;

  const cells = el("div", { class: "otp" });
  const hidden = el("input", {
    type: "tel", inputmode: "numeric", maxlength: String(LEN),
    class: "visually-hidden", value, attrs: { "aria-label": `${LEN}-digit code` },
  });
  const meta = el("div", { class: "otp__meta" });
  const err = el("div", { class: "form-error", attrs: { "aria-live": "polite" } });

  function renderCells() {
    cells.innerHTML = "";
    for (let i = 0; i < LEN; i++) {
      const filled = i < value.length;
      const active = i === value.length;
      const cell = el("div", {
        class: `otp__cell ${filled ? "otp__cell--filled" : ""} ${active ? "otp__cell--active" : ""}`.trim(),
      }, filled ? [document.createTextNode(value[i])] : active ? [el("div", { class: "otp__caret" })] : []);
      cells.appendChild(cell);
    }
  }
  function renderMeta() {
    meta.innerHTML = "";
    if (countdown > 0) {
      meta.appendChild(el("span", { text: "Resend code in " }));
      meta.appendChild(el("strong", { text: `00:${String(countdown).padStart(2, "0")}` }));
    } else {
      const resend = el("button", { type: "button", class: "link", style: { fontWeight: "700" }, text: "Resend code" });
      resend.addEventListener("click", () => { countdown = 24; renderMeta(); tick(); toast("New code sent.", { kind: "success", icon: "check" }); });
      meta.appendChild(resend);
    }
  }
  function tick() {
    clearInterval(timer);
    timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) { countdown = 0; clearInterval(timer); }
      renderMeta();
    }, 1000);
  }

  hidden.addEventListener("input", () => {
    value = hidden.value.replace(/\D/g, "").slice(0, LEN);
    err.textContent = "";
    renderCells();
  });
  cells.addEventListener("click", () => hidden.focus());

  function submit() {
    if (value.length < LEN) {
      err.textContent = `Enter all ${LEN} digits to continue.`;
      hidden.focus();
      return;
    }
    store.set({ authed: true });
    ctx.navigate("photo");
  }

  const node = el("div", {}, [
    header({ onBack: () => ctx.back("phone") }),
    el("div", { class: "auth__scroll" }, [
      el("h1", { class: "auth__title", text: "Verify your number" }),
      el("p", { class: "auth__sub" }, [
        el("span", { text: "Enter the 6-digit code sent to " }),
        el("br"),
        el("strong", { text: store.get("user.phone") || `${D.USER.countryCode} ${D.USER.phoneSample}` }),
        el("span", { text: "  " }),
        (() => { const e = el("button", { type: "button", class: "link", style: { fontWeight: "700" }, text: "Edit" }); e.addEventListener("click", () => ctx.back("phone")); return e; })(),
      ]),
      el("div", { style: { height: "24px" } }),
      cells, hidden, meta, err,
    ]),
    actionBar([button("Verify & continue", { onClick: submit })]),
  ]);

  return {
    node, meta: { statusbar: "dark" },
    onEnter() { renderCells(); renderMeta(); tick(); },
    onExit() { clearInterval(timer); },
  };
}

/* ============================================================
   5. ADD PHOTO
   ============================================================ */
export function photo(_params, ctx) {
  let hasPhoto = store.get("user.photo");
  const drop = el("button", {
    class: `photo__drop ${hasPhoto ? "photo__drop--filled" : ""}`.trim(),
    type: "button",
    attrs: { "aria-label": "Upload or take a photo" },
  });
  const hint = el("div", { class: "photo__hint", text: hasPhoto ? "Looking good!" : "Tap to upload or take a photo" });
  const reqWrap = el("div", { class: "photo__req" }, [badge("Required", "warn")]);
  const cta = button("Add photo to continue", { disabled: !hasPhoto, onClick: proceed });

  function paint() {
    drop.innerHTML = "";
    if (hasPhoto) {
      // a generated monogram "avatar photo" (no external asset needed)
      drop.appendChild(el("div", {
        style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--info)", color: "#fff", fontSize: "48px", fontWeight: "800" },
        text: (store.get("user.firstName") || D.USER.firstName)[0],
      }));
      drop.classList.add("photo__drop--filled");
      hint.textContent = "Tap to change photo";
      reqWrap.style.display = "none";
    } else {
      drop.innerHTML = icon("camera", { size: 40 });
      drop.classList.remove("photo__drop--filled");
      hint.textContent = "Tap to upload or take a photo";
      reqWrap.style.display = "flex";
    }
    cta.disabled = !hasPhoto;
    cta.setAttribute("aria-disabled", String(!hasPhoto));
  }
  drop.addEventListener("click", () => {
    hasPhoto = !hasPhoto;
    store.update("user", { photo: hasPhoto, firstName: store.get("user.firstName") || D.USER.firstName });
    paint();
    if (hasPhoto) toast("Photo added — only your first name & photo are shared.", { kind: "success", icon: "check" });
  });
  cta.addEventListener("click", proceed);

  function proceed() {
    if (!hasPhoto) return;
    store.update("user", { firstName: store.get("user.firstName") || D.USER.firstName });
    ctx.replace("home");
  }

  const node = el("div", {}, [
    header({ onBack: () => ctx.back("otp") }),
    el("div", { class: "auth__scroll" }, [
      el("h1", { class: "auth__title", text: "Add your photo" }),
      el("p", { class: "auth__sub", text: "A clear face photo builds trust with drivers and co-riders. It takes a second and is required to continue." }),
      drop, hint, reqWrap,
      el("div", { style: { height: "20px" } }),
      el("div", { class: "row-group" }, [
        row({ icon: "lock", title: "Everything else stays private", sub: "Phone, email & ID are never shown", trailing: pill("Hidden") }),
        row({ icon: "plus", title: "Name & details", sub: "Optional — add anytime later", trailing: chevron(), onClick: () => toast("You can add these later in Profile.", {}) }),
      ]),
    ]),
    actionBar([cta], { note: '<span class="photo__note">' + icon("check", { size: 16 }) + " Only your first name &amp; photo are visible to drivers</span>" }),
  ]);
  return { node, meta: { statusbar: "dark" }, onEnter: paint };
}

/* ============================================================
   6. HOME (map + bottom dock)
   ============================================================ */
export function home(_params, ctx) {
  const name = store.get("user.firstName") || D.USER.firstName;
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const savedRows = D.SAVED_PLACES.map((p, i) =>
    el("div", {}, [
      row({
        icon: p.icon, iconKind: p.kind === "hub" ? "info" : undefined,
        title: p.title, sub: p.sub, trailing: chevron(),
        onClick: () => startBooking(p),
      }),
      i < D.SAVED_PLACES.length - 1 ? el("div", { class: "divider", style: { margin: "0" } }) : null,
    ])
  );

  function startBooking(place) {
    // Any destination routes into the hub→destination pickup flow.
    ctx.navigate("pickup");
  }

  const search = el("div", {
    class: "search", role: "button", tabindex: "0", attrs: { "aria-label": "Where to?" },
  }, [
    el("span", { html: icon("search") }),
    el("span", { class: "search__text", text: "Where to?" }),
    el("span", { class: "search__when" }, [el("span", { text: "Now" }), el("span", { html: icon("chevronDown", { size: 12 }) })]),
  ]);
  activatable(search, () => ctx.navigate("pickup"));

  const node = el("div", { class: "screen--map" }, [
    mapBackdrop(),
    el("div", { class: "map-top" }, [
      iconButton("menu", { label: "Menu", onClick: openMenu }),
      avatar(name[0], { color: "var(--info)", cls: "" }),
    ]),
    el("div", { style: { position: "absolute", left: "50%", top: "42%" }, class: "puck" }),
    el("div", { class: "dock", style: { maxHeight: "62%" } }, [
      el("div", { class: "dock__grip" }),
      el("div", { class: "dock__scroll" }, [
        el("h1", { class: "home__greet", text: `Good ${part}, ${name}` }),
        search,
        el("div", { class: "section-label", text: "Saved places" }),
        frag(savedRows),
      ]),
    ]),
  ]);

  function openMenu() {
    openSheet((api) => {
      const items = D.MENU_ITEMS.map((m) =>
        row({
          icon: m.icon, title: m.title, sub: m.sub,
          trailing: m.soon ? badge("Soon", "info") : chevron(),
          onClick: () => {
            if (m.id === "settings") { api.close(); openSettings(); }
            else toast(`${m.title} is coming soon.`, {});
          },
        })
      );
      const resetRow = row({
        icon: "reset", iconKind: "danger", title: "Reset demo",
        sub: "Clear all saved state", trailing: chevron(),
        onClick: () => { api.close(); confirmReset(ctx); },
      });
      return frag([
        el("div", { class: "menu-head" }, [
          avatar(name[0], { size: "lg", color: "var(--info)" }),
          el("div", { class: "menu-head__body" }, [
            el("div", { class: "menu-head__name", text: name }),
            el("div", { class: "menu-head__sub", text: store.get("user.phone") || "Signed in" }),
          ]),
        ]),
        el("div", { class: "row-group" }, items),
        el("div", { style: { height: "12px" } }),
        el("div", { class: "row-group" }, [resetRow]),
      ]);
    }, { title: "Menu" });
  }

  return { node, meta: { statusbar: "default" } };
}

function openSettings() {
  openSheet(() => {
    const prefs = store.get("prefs");
    const walk = slider({
      value: prefs.maxWalkMin, min: 1, max: 10, step: 1,
      label: "Max walk to pickup",
      format: (v) => `${v} min`,
      onChange: (v) => store.update("prefs", { maxWalkMin: v }),
    });
    const alertRow = el("div", { class: "row" }, [
      el("div", { class: "row__body" }, [
        el("div", { class: "row__title", text: "Cheaper-route alerts" }),
        el("div", { class: "row__sub", text: "Suggest detours that skip surge & tolls" }),
      ]),
      checkbox({ checked: prefs.cheaperAlerts, label: "Cheaper-route alerts", onChange: (v) => store.update("prefs", { cheaperAlerts: v }) }),
    ]);
    const themeRow = el("div", { class: "row" }, [
      el("div", { class: "row__icon", html: icon("moon") }),
      el("div", { class: "row__body" }, [
        el("div", { class: "row__title", text: "Dark theme" }),
        el("div", { class: "row__sub", text: "Easier on the eyes at night" }),
      ]),
      toggle({ checked: prefs.darkTheme, label: "Dark theme", onChange: (v) => { store.update("prefs", { darkTheme: v }); document.getElementById("phone").dataset.theme = v ? "dark" : "light"; } }),
    ]);
    return frag([
      el("div", { class: "card", style: { marginBottom: "12px" } }, [walk]),
      el("div", { class: "row-group" }, [alertRow, themeRow]),
    ]);
  }, { title: "Ride preferences" });
}

function confirmReset(ctx) {
  confirmSheet({
    title: "Reset demo?",
    message: "This clears your saved progress and returns the prototype to the splash screen.",
    confirmLabel: "Reset everything",
    onConfirm: () => {
      store.reset();
      document.getElementById("phone").dataset.theme = "light";
      ctx.reset("splash");
      toast("Demo reset.", { kind: "success", icon: "check" });
    },
  });
}

/* ============================================================
   7. PICKUP POINT (map + dock with radio options)
   ============================================================ */
export function pickup(_params, ctx) {
  let selected = store.get("trip.pickupId");

  const optionsWrap = el("div", { role: "radiogroup", attrs: { "aria-label": "Pickup points" }, style: { display: "flex", flexDirection: "column", gap: "10px" } });
  function renderOptions() {
    optionsWrap.innerHTML = "";
    D.PICKUP_POINTS.forEach((p) => {
      optionsWrap.appendChild(option({
        badge: p.badge,
        title: p.title,
        titleBadge: p.tag ? badge(p.tag, "success") : null,
        sub: p.sub,
        checked: p.id === selected,
        onSelect: () => { selected = p.id; renderOptions(); },
      }));
    });
  }
  renderOptions();

  function confirm() {
    store.update("trip", { pickupId: selected });
    ctx.navigate("tripDetails");
  }

  const node = el("div", { class: "screen--map" }, [
    mapBackdrop(),
    el("div", { class: "map-header" }, [
      iconButton("back", { label: "Go back", plain: true, onClick: () => ctx.back("home") }),
      el("div", { class: "header__titles" }, [
        el("div", { class: "header__title header__title--sm", text: "Choose your pickup point" }),
        el("div", { class: "header__sub", text: D.HUB.name }),
      ]),
    ]),
    // map decorations
    el("div", { class: "map-label", style: { left: "50%", top: "28%" } }, [el("span", { html: icon("train", { size: 16 }) }), el("span", { text: D.HUB.short })]),
    el("div", { html: `<svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none"><line class="dash dash--blue" x1="40" y1="34" x2="62" y2="40"/></svg>` }).firstElementChild,
    el("div", { class: "puck", style: { left: "40%", top: "35%" } }),
    el("div", { class: "map-tag", style: { left: "52%", top: "35%" }, text: "You" }),
    el("div", { class: "pin", style: { left: "62%", top: "44%" } }, [el("div", { class: "pin__badge pin__badge--a", text: "A" })]),
    el("div", { class: "pin", style: { left: "33%", top: "54%" } }, [el("div", { class: "pin__badge pin__badge--plain", text: "B" })]),
    el("div", { class: "pin", style: { left: "72%", top: "32%" } }, [el("div", { class: "pin__badge pin__badge--plain", text: "C" })]),
    el("div", { class: "dock" }, [
      el("div", { class: "dock__grip" }),
      el("div", { class: "matched", style: { marginTop: "0" } }, [el("span", { html: icon("check", { size: 18 }) }), el("span", { text: "Pickup points verified for easy meetup" })]),
      el("div", { class: "dock__scroll" }, [optionsWrap]),
      el("div", { style: { paddingTop: "16px" } }, [button("Confirm pickup point", { onClick: confirm })]),
    ]),
  ]);
  return { node, meta: { statusbar: "default" } };
}

/* ============================================================
   8. TRIP DETAILS (passengers/bags steppers)
   ============================================================ */
export function tripDetails(_params, ctx) {
  const pk = pickupById(store.get("trip.pickupId"));
  let passengers = store.get("trip.passengers");
  let bags = store.get("trip.bags");

  const node = el("div", {}, [
    header({ title: "Trip details", small: true, onBack: () => ctx.back("pickup") }),
    el("div", { class: "screen__scroll" }, [
      el("div", { class: "card" }, [
        el("div", { class: "route" }, [
          el("div", { class: "route__stop" }, [
            el("div", { class: "route__marker" }, [el("span", { class: "route__dot route__dot--origin" }), el("span", { class: "route__line" })]),
            el("div", { class: "route__text" }, [el("div", { class: "route__place", text: pk.title }), el("div", { class: "route__detail", text: D.HUB.name })]),
          ]),
          el("div", { class: "route__stop" }, [
            el("div", { class: "route__marker" }, [el("span", { class: "route__dot route__dot--dest" })]),
            el("div", { class: "route__text" }, [el("div", { class: "route__place", text: D.DESTINATION.title }), el("div", { class: "route__detail", text: D.DESTINATION.sub })]),
          ]),
        ]),
      ]),
      el("div", { class: "section-label", text: "Who & what you're carrying" }),
      el("div", { class: "row" }, [
        el("div", { class: "row__icon", html: icon("person") }),
        el("div", { class: "row__body" }, [el("div", { class: "row__title", text: "Passengers" }), el("div", { class: "row__sub", text: "Including you" })]),
        stepper({ value: passengers, min: 1, max: D.TRIP_DEFAULTS.maxPassengers, label: "passengers", onChange: (v) => { passengers = v; store.update("trip", { passengers: v }); } }),
      ]),
      el("div", { class: "divider" }),
      el("div", { class: "row" }, [
        el("div", { class: "row__icon", html: icon("luggage") }),
        el("div", { class: "row__body" }, [el("div", { class: "row__title", text: "Trolley bags" }), el("div", { class: "row__sub", text: "Large check-in luggage" })]),
        stepper({ value: bags, min: 0, max: D.TRIP_DEFAULTS.maxBags, label: "bags", onChange: (v) => { bags = v; store.update("trip", { bags: v }); } }),
      ]),
      el("div", { class: "suggest" }, [
        el("div", { class: "suggest__icon", html: icon("suv", { size: 26 }) }),
        el("div", {}, [el("div", { class: "suggest__title", text: D.SUGGESTION.title }), el("div", { class: "suggest__sub", text: D.SUGGESTION.sub })]),
      ]),
      el("div", { class: "alt-note" }, [el("span", { html: icon("bus", { size: 20 }) }), el("span", { text: D.SUGGESTION.altNote })]),
    ]),
    actionBar([button("See ride options", { onClick: () => ctx.navigate("rideOptions") })]),
  ]);
  return { node, meta: { statusbar: "dark" } };
}

/* ============================================================
   9. RIDE OPTIONS (map + dock with ride cards, loading skeleton)
   ============================================================ */
export function rideOptions(_params, ctx) {
  let selected = store.get("trip.rideId");
  const listWrap = el("div", { class: "ride-list", role: "radiogroup", attrs: { "aria-label": "Ride options" } });
  const bookBtnWrap = el("div", { style: { paddingTop: "12px" } });

  function selectedRide() { return rideById(selected); }

  function renderBook() {
    bookBtnWrap.innerHTML = "";
    const r = selectedRide();
    const label = r.shareable ? "Set up shared ride" : `Book ${r.name}`;
    bookBtnWrap.appendChild(button(label, {
      variant: r.shareable ? "success" : "primary",
      meta: `₹${r.price}`,
      onClick: () => {
        store.update("trip", { rideId: selected, shared: !!r.shareable });
        if (r.shareable) ctx.navigate("shareRide");
        else ctx.navigate("confirm");
      },
    }));
  }

  function renderList() {
    listWrap.innerHTML = "";
    D.RIDE_OPTIONS.forEach((opt) => {
      listWrap.appendChild(rideCard(opt, {
        checked: opt.id === selected,
        onSelect: (o) => { selected = o.id; store.update("trip", { rideId: o.id }); renderList(); renderBook(); },
      }));
    });
  }

  function renderSkeleton() {
    listWrap.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      listWrap.appendChild(el("div", { class: "ride", style: { borderColor: "transparent" } }, [
        skeleton("46px", "46px", { radius: "50%" }),
        el("div", { class: "ride__body" }, [skeleton("45%", "15px"), el("div", { style: { height: "8px" } }), skeleton("65%", "12px")]),
        skeleton("54px", "22px"),
      ]));
    }
  }

  const safetyBanner = banner({
    icon: "shield", title: "Travelling solo? Safety tools are on",
    sub: "Trusted driver · trip recording · live share", chevron: true,
    onClick: () => ctx.navigate("safety"),
  });

  const payRow = el("div", { class: "pay-row" }, [
    el("div", { class: "pay-row__icon", html: icon("rupee", { size: 16 }) }),
    el("div", { class: "pay-row__body" }, [el("span", { text: `${D.PAYMENT.method} · ${D.PAYMENT.sub}` })]),
    (() => { const b = el("button", { type: "button", class: "pay-row__action", text: "Change ›" }); b.addEventListener("click", () => toast("Payment options are coming soon.", {})); return b; })(),
  ]);

  const node = el("div", { class: "screen--map" }, [
    mapBackdrop(),
    el("div", { class: "map-top" }, [iconButton("back", { label: "Go back", onClick: () => ctx.back("tripDetails") })]),
    el("div", { html: `<svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline class="solid" points="34,52 50,40 58,56 66,30"/></svg>` }).firstElementChild,
    el("div", { class: "car-marker", style: { left: "52%", top: "48%" }, html: icon("car", { size: 24 }) }),
    el("div", { class: "dock", style: { maxHeight: "78%" } }, [
      el("div", { class: "dock__grip" }),
      el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" } }, [
        el("h1", { style: { fontSize: "var(--fs-xl)", fontWeight: "800", letterSpacing: "-0.02em" }, text: "Choose a ride" }),
        el("span", { class: "text-soft", style: { fontSize: "var(--fs-sm)", fontWeight: "600" }, text: `${D.TRIP_META.distanceKm} km · ${D.TRIP_META.durationMin} min` }),
      ]),
      el("div", { class: "dock__scroll" }, [
        safetyBanner,
        el("div", { style: { height: "12px" } }),
        listWrap,
        el("div", { class: "divider" }),
        payRow,
      ]),
      bookBtnWrap,
    ]),
  ]);

  return {
    node, meta: { statusbar: "default" },
    onEnter() {
      renderSkeleton();
      renderBook();
      // simulate fetching prices
      setTimeout(() => { renderList(); }, store.get("__seenRides") ? 250 : 650);
      store.set({ __seenRides: true });
    },
  };
}

/* ============================================================
   10. YOUR SAFETY (toggles + trusted contacts + SOS)
   ============================================================ */
export function safety(_params, ctx) {
  const list = el("div", { class: "row-group safety-list" });
  D.SAFETY_TOGGLES.forEach((t, i) => {
    const r = el("div", { class: "row" }, [
      el("div", { class: `row__icon row__icon--${t.iconKind}`, html: icon(t.icon) }),
      el("div", { class: "row__body" }, [el("div", { class: "row__title", text: t.title }), el("div", { class: "row__sub", text: t.sub })]),
      toggle({
        checked: store.get(`safety.${t.key}`), label: t.title, kind: "success",
        onChange: (v) => { store.update("safety", { [t.key]: v }); toast(`${t.title}: ${v ? "on" : "off"}`, { kind: v ? "success" : "" }); },
      }),
    ]);
    list.appendChild(r);
  });

  const contactStack = el("div", { class: "avatar-stack" });
  D.TRUSTED_CONTACTS.forEach((c) => contactStack.appendChild(avatar(c.initial, { size: "sm", color: c.color })));
  const addBtn = avatar("+", { size: "sm", cls: "avatar--dash" });
  const addWrap = el("button", { type: "button", style: { marginLeft: "-8px" }, attrs: { "aria-label": "Add trusted contact" } }, [addBtn]);
  addWrap.addEventListener("click", () => toast("Trusted-contact picker is coming soon.", {}));
  contactStack.appendChild(addWrap);

  const node = el("div", {}, [
    header({ title: "Your safety", small: true, onBack: () => ctx.back("rideOptions") }),
    el("div", { class: "screen__scroll" }, [
      banner({ icon: "shield", title: "You're not travelling alone", sub: "Extra care for solo & women travellers — quietly on in the background." }),
      el("div", { class: "section-label", text: "Always on for you" }),
      list,
      el("div", { class: "safety-contacts" }, [
        el("span", { class: "safety-contacts__label", text: "Trusted contacts" }),
        contactStack,
      ]),
    ]),
    actionBar([
      button("Emergency SOS", { variant: "danger", onClick: () => sosSheet() }),
    ], { note: `Call the ${D.BRAND.supportLine} anytime` }),
  ]);

  function sosSheet() {
    confirmSheet({
      title: "Call emergency SOS?",
      message: `This will call the ${D.BRAND.supportLine} and share your live location with your trusted contacts. Use only in a real emergency.`,
      confirmLabel: "Call now",
      onConfirm: () => toast("SOS is a demo — no call was placed.", { kind: "danger", icon: "sos" }),
    });
  }

  return { node, meta: { statusbar: "dark" } };
}

/* ============================================================
   11. SHARE YOUR RIDE
   ============================================================ */
export function shareRide(_params, ctx) {
  const shared = rideById("shared");
  const solo = rideById("quickxl");
  const saved = D.RIDE_OPTIONS.find((r) => r.id === "shared").save;
  const pct = Math.round((saved / solo.price) * 100);

  const prefsGroup = el("div", { class: "row-group" });
  D.SHARE_PREFS.forEach((p) => {
    prefsGroup.appendChild(el("div", { class: "row" }, [
      el("div", { class: "row__body" }, [el("div", { class: "row__title", text: p.title }), el("div", { class: "row__sub", text: p.sub })]),
      toggle({ checked: store.get(`sharePrefs.${p.key}`), label: p.title, onChange: (v) => store.update("sharePrefs", { [p.key]: v }) }),
    ]));
  });

  const node = el("div", {}, [
    header({ title: "Share your ride", small: true, onBack: () => ctx.back("rideOptions") }),
    el("div", { class: "screen__scroll" }, [
      el("p", { class: "text-soft", style: { fontSize: "var(--fs-sm)", marginBottom: "16px" }, text: "Travelling solo? Share your route with a verified co-passenger and split the fare." }),
      el("div", { class: "save-card" }, [
        el("div", { class: "save-card__label", text: "You save" }),
        el("div", { class: "save-card__amount" }, [
          el("span", { text: `₹${saved}` }),
          el("span", { class: "save-card__was strike", text: `₹${solo.price}` }),
          el("span", { class: "save-card__now", text: `now ₹${shared.price}` }),
        ]),
        el("div", { class: "save-card__foot", text: `That's ${pct}% off your solo fare` }),
      ]),
      el("div", { class: "surface-card corider", style: { marginTop: "16px", border: "1.5px solid var(--line)" } }, [
        avatar(D.CORIDER.initial, { color: D.CORIDER.color }),
        el("div", { class: "corider__body" }, [
          el("div", { class: "corider__name" }, [
            el("span", { text: D.CORIDER.name }),
            el("span", { class: "star" }, [el("span", { html: icon("star", { size: 14 }) }), el("span", { text: String(D.CORIDER.rating) })]),
            D.CORIDER.verified ? badge("Verified", "safety") : null,
          ]),
          el("div", { class: "corider__sub", text: D.CORIDER.note }),
        ]),
      ]),
      el("div", { class: "matched" }, [el("span", { html: icon("check", { size: 18 }) }), el("span", { text: "1 co-passenger matched on the same route" })]),
      el("div", { class: "section-label", text: "Preferences" }),
      prefsGroup,
    ]),
    actionBar([button("Share ride", { variant: "success", meta: `save ₹${saved}`, onClick: () => { store.update("trip", { rideId: "shared", shared: true }); ctx.navigate("confirm"); } })]),
  ]);
  return { node, meta: { statusbar: "dark" } };
}

/* ============================================================
   12. SMART DETOUR (cheaper route)
   ============================================================ */
export function detour(_params, ctx) {
  const d = D.DETOUR;
  function proceed(taken) {
    store.update("trip", { detourTaken: taken });
    toast(taken ? `Smart detour applied — you saved ₹${d.save}.` : "Keeping the direct route.", { kind: taken ? "success" : "", icon: taken ? "check" : undefined });
    ctx.navigate("finding");
  }

  const direct = el("button", { type: "button", class: "surface-card", style: { border: "1.5px solid var(--line)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left" } }, [
    el("div", {}, [el("div", { style: { fontWeight: "700" }, text: d.direct.label }), el("div", { class: "text-soft", style: { fontSize: "var(--fs-sm)" }, text: `${d.direct.min} min` })]),
    el("div", { style: { fontWeight: "800", fontSize: "var(--fs-lg)" }, text: `₹${d.direct.price}` }),
  ]);
  activatable(direct, () => proceed(false));

  const smart = el("button", { type: "button", class: "surface-card", style: { border: "1.5px solid var(--accent)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left" } }, [
    el("div", {}, [
      el("div", { style: { fontWeight: "700", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" } }, [el("span", { text: d.smart.label }), badge(d.smart.tag, "success")]),
      el("div", { class: "text-soft", style: { fontSize: "var(--fs-sm)" } }, [el("span", { text: `${d.smart.min} min · ` }), el("span", { style: { color: "var(--warn)", fontWeight: "700" }, text: `+${d.extraMin} min` })]),
    ]),
    el("div", { style: { fontWeight: "800", fontSize: "var(--fs-lg)" }, text: `₹${d.smart.price}` }),
  ]);
  activatable(smart, () => proceed(true));

  const node = el("div", { class: "screen--map" }, [
    mapBackdrop(),
    el("div", { class: "map-top" }, [iconButton("back", { label: "Go back", onClick: () => ctx.back("confirm") })]),
    el("div", { html: `<svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline class="ghost" points="30,38 44,22 60,12"/><polyline class="solid" points="30,38 42,40 60,66"/></svg>` }).firstElementChild,
    el("div", { class: "puck", style: { left: "30%", top: "38%" } }),
    el("div", { style: { position: "absolute", left: "60%", top: "66%", width: "18px", height: "18px", background: "var(--accent)", border: "3px solid #fff", borderRadius: "50%", transform: "translate(-50%,-50%)" } }),
    el("div", { class: "map-tag", style: { left: "48%", top: "30%", background: "var(--success)", color: "#fff" }, text: `Save ₹${d.save}` }),
    el("div", { class: "dock" }, [
      el("div", { class: "dock__grip" }),
      el("h1", { style: { fontSize: "var(--fs-xl)", fontWeight: "800", letterSpacing: "-0.02em" }, text: "A cheaper route is available" }),
      el("p", { class: "text-soft", style: { fontSize: "var(--fs-sm)", margin: "6px 0 4px" }, text: "A small detour skips the toll & surge zone." }),
      el("div", { class: "dock__scroll" }, [
        el("div", { style: { display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px" } }, [direct, smart]),
        el("div", { class: "detour-compare" }, [
          el("div", { class: "detour-compare__col" }, [el("div", { class: "detour-compare__k", text: "Extra time" }), el("div", { class: "detour-compare__v detour-compare__v--warn", text: `+${d.extraMin} min` })]),
          el("div", { class: "detour-compare__col" }, [el("div", { class: "detour-compare__k", text: "You save" }), el("div", { class: "detour-compare__v detour-compare__v--save", text: `₹${d.save} (${d.pct}%)` })]),
        ]),
      ]),
      el("div", { style: { paddingTop: "12px", display: "flex", flexDirection: "column", gap: "4px" } }, [
        button("Take the detour", { meta: `save ₹${d.save}`, onClick: () => proceed(true) }),
        button("Keep direct route", { variant: "ghost", onClick: () => proceed(false) }),
      ]),
    ]),
  ]);
  return { node, meta: { statusbar: "default" } };
}

/* ============================================================
   13. CONFIRM YOUR RIDE
   ============================================================ */
export function confirm(_params, ctx) {
  const r = rideById(store.get("trip.rideId"));
  const pk = pickupById(store.get("trip.pickupId"));
  const passengers = store.get("trip.passengers");
  const bags = store.get("trip.bags");
  const coupon = store.get("trip.coupon");

  const node = el("div", { class: "screen--map" }, [
    mapBackdrop(),
    el("div", { class: "map-top" }, [iconButton("back", { label: "Go back", onClick: () => ctx.back("rideOptions") })]),
    el("div", { html: `<svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none"><line class="solid" x1="30" y1="40" x2="58" y2="12"/></svg>` }).firstElementChild,
    el("div", { class: "puck", style: { left: "30%", top: "40%" } }),
    el("div", { style: { position: "absolute", left: "62%", top: "62%", width: "16px", height: "16px", background: "var(--accent)", border: "3px solid #fff", borderRadius: "50%", transform: "translate(-50%,-50%)" } }),
    el("div", { class: "dock", style: { maxHeight: "80%" } }, [
      el("div", { class: "dock__grip" }),
      el("h1", { style: { fontSize: "var(--fs-xl)", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "4px" }, text: "Confirm your ride" }),
      el("div", { class: "dock__scroll" }, [
        el("div", { class: "confirm-ride" }, [
          el("div", { class: "ride__icon", html: icon(r.icon, { size: 26 }) }),
          el("div", { class: "confirm-ride__body" }, [
            el("div", { class: "confirm-ride__name", text: r.name }),
            el("div", { class: "confirm-ride__meta", text: `${r.seats ? r.seats + " seats · " : ""}${r.bags ? "fits " + r.bags + " bags · " : ""}${r.etaMin} min away` }),
          ]),
          el("div", { style: { fontWeight: "800", fontSize: "var(--fs-lg)" }, text: `₹${r.price}` }),
        ]),
        el("div", { class: "divider" }),
        el("div", { class: "route" }, [
          el("div", { class: "route__stop" }, [
            el("div", { class: "route__marker" }, [el("span", { class: "route__dot route__dot--origin" }), el("span", { class: "route__line" })]),
            el("div", { class: "route__text" }, [el("div", { class: "route__place", text: pk.title }), el("div", { class: "route__detail", text: D.HUB.name })]),
          ]),
          el("div", { class: "route__stop" }, [
            el("div", { class: "route__marker" }, [el("span", { class: "route__dot route__dot--dest" })]),
            el("div", { class: "route__text" }, [el("div", { class: "route__place", text: D.DESTINATION.title }), el("div", { class: "route__detail", text: D.DESTINATION.sub })]),
          ]),
        ]),
        el("div", { class: "confirm-chips" }, [
          pill(`${passengers} passengers`), pill(`${bags} bags`),
          pill("Safety on", { dotColor: "var(--safety)" }),
        ]),
        el("div", { class: "divider" }),
        el("div", { class: "pay-row" }, [
          el("div", { class: "pay-row__icon", html: icon("rupee", { size: 16 }) }),
          el("div", { class: "pay-row__body", text: `${D.PAYMENT.method} · ${D.PAYMENT.sub}` }),
          (() => { const b = el("button", { type: "button", class: "pay-row__action", text: "Change ›" }); b.addEventListener("click", () => toast("Payment options are coming soon.", {})); return b; })(),
        ]),
        el("div", { class: "pay-row" }, [
          el("div", { class: "pay-row__icon", html: icon("percent", { size: 16 }) }),
          el("div", { class: "pay-row__body", text: "Apply coupon" }),
          el("span", { class: "pay-row__action text-success", text: coupon ? `${coupon} applied` : "Add code" }),
        ]),
        el("div", { class: "total-row" }, [
          el("div", {}, [el("div", { class: "total-row__k", text: "Total" }), el("div", { class: "total-row__note", text: "Incl. taxes & tolls" })]),
          el("div", { class: "total-row__v", text: `₹${r.price}` }),
        ]),
      ]),
      el("div", { style: { paddingTop: "12px" } }, [button("Confirm booking", { onClick: () => ctx.navigate("detour") })]),
    ]),
  ]);
  return { node, meta: { statusbar: "default" } };
}

/* ============================================================
   14. FINDING YOUR RIDE (radar)
   ============================================================ */
export function finding(_params, ctx) {
  const r = rideById(store.get("trip.rideId"));
  const pk = pickupById(store.get("trip.pickupId"));
  let timer;

  const node = el("div", { class: "screen--map" }, [
    mapBackdrop(),
    el("div", { class: "puck puck--radar", style: { left: "50%", top: "40%" } }),
    el("div", { class: "dock" }, [
      el("div", { class: "dock__grip" }),
      el("div", { class: "finding-head" }, [
        el("div", { class: "finding-head__icon" }, [el("div", { class: "spinner spinner--sm" })]),
        el("div", {}, [
          el("div", { class: "finding-head__title", text: `Finding your ${r.name}…` }),
          el("div", { class: "finding-head__sub", text: "Matching you with a trusted driver nearby" }),
        ]),
      ]),
      el("div", { class: "divider", style: { margin: "4px 0 12px" } }),
      el("div", { class: "driver", style: { background: "var(--bg-card)" } }, [
        el("div", { class: "ride__icon", style: { background: "var(--bg-surface)" }, html: icon(r.icon, { size: 26 }) }),
        el("div", { class: "driver__body" }, [
          el("div", { class: "driver__name", text: `${r.name} · ${pk.badge === "A" ? "Gate 2" : pk.title} pickup` }),
          el("div", { class: "driver__car", text: "Usually matched in under a minute" }),
        ]),
        el("div", { style: { fontWeight: "800", fontSize: "var(--fs-lg)" }, text: `₹${r.price}` }),
      ]),
      el("div", { class: "matched", style: { margin: "14px 0" } }, [
        el("span", { style: { width: "20px", height: "20px", borderRadius: "50%", background: "var(--safety)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }, html: icon("checkThin", { size: 13 }) }),
        el("span", { text: "Trip recording & live location ready to go" }),
      ]),
      button("Cancel", { variant: "secondary", onClick: () => cancelSheet() }),
    ]),
  ]);

  function cancelSheet() {
    confirmSheet({
      title: "Cancel this search?",
      message: "We haven't matched a driver yet, so there's no cancellation fee. You'll go back to ride options.",
      confirmLabel: "Cancel search",
      onConfirm: () => { clearTimeout(timer); ctx.back("rideOptions"); },
    });
  }

  return {
    node, meta: { statusbar: "default" },
    onEnter() { timer = setTimeout(() => ctx.replace("arriving"), 2600); },
    onExit() { clearTimeout(timer); },
  };
}

/* ============================================================
   15. DRIVER ARRIVING
   ============================================================ */
export function arriving(_params, ctx) {
  const dr = D.DRIVER;
  const r = rideById(store.get("trip.rideId"));

  const node = el("div", { class: "screen--map" }, [
    mapBackdrop(),
    el("div", { class: "map-top" }, [iconButton("back", { label: "Back to home", onClick: () => ctx.reset("home") })]),
    el("div", { html: `<svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none"><line class="solid" x1="30" y1="46" x2="56" y2="74"/></svg>` }).firstElementChild,
    el("div", { class: "puck", style: { left: "30%", top: "46%" } }),
    el("div", { class: "car-marker", style: { left: "56%", top: "52%" }, html: icon("car", { size: 24 }) }),
    el("div", { class: "dock" }, [
      el("div", { class: "dock__grip" }),
      el("div", { class: "eta-row" }, [
        el("div", { class: "eta-row__title", text: `Arriving in ${dr.etaMin} min` }),
        el("div", { class: "pin-chip" }, [el("span", { text: "PIN " }), el("strong", { text: dr.pin })]),
      ]),
      el("div", { class: "dock__scroll" }, [
        el("div", { class: "driver" }, [
          avatar(dr.initial, { size: "lg", color: "var(--accent)", cls: "avatar--dark" }),
          el("div", { class: "driver__body" }, [
            el("div", { class: "driver__name" }, [
              el("span", { text: dr.name }),
              el("span", { class: "star" }, [el("span", { html: icon("star", { size: 14 }) }), el("span", { text: String(dr.rating) })]),
            ]),
            el("div", { class: "driver__car", text: dr.car }),
          ]),
          el("span", { class: "plate", text: dr.plate }),
        ]),
        el("div", { class: "contact-actions" }, [
          contactAction("phone", "Call", "call", () => toast("Calling the driver… (demo)", {})),
          contactAction("message", "Message", "msg", () => toast("Messaging isn't wired up in this demo.", {})),
          contactAction("arrowUp", "Share trip", "share", () => shareSheet()),
        ]),
        el("div", { class: "safety-strip" }, [
          el("div", { class: "safety-strip__icon", html: icon("checkThin", { size: 13 }) }),
          el("div", { class: "safety-strip__body" }, [
            el("div", { class: "safety-strip__title", text: "Safety active" }),
            el("div", { class: "safety-strip__sub", text: "Recording on · location shared with Mom, Priya" }),
          ]),
        ]),
      ]),
      button("Cancel ride", { variant: "ghost", onClick: () => cancelSheet() }),
    ]),
  ]);

  function contactAction(ic, label, kind, onClick) {
    const btn = el("button", { class: `contact-action__btn contact-action__btn--${kind}`, type: "button", attrs: { "aria-label": label }, html: icon(ic, { size: 24 }) });
    btn.addEventListener("click", onClick);
    return el("div", { class: "contact-action" }, [btn, el("span", { class: "contact-action__label", text: label })]);
  }
  function shareSheet() {
    openSheet(() => frag([
      el("p", { class: "text-soft", style: { fontSize: "var(--fs-sm)", marginBottom: "16px" }, text: "Send a live link so someone can follow your trip in real time." }),
      el("div", { class: "row-group" }, D.TRUSTED_CONTACTS.map((c) =>
        row({ title: c.name, trailing: badge("Sharing", "success"), })
      )),
      el("div", { style: { height: "12px" } }),
      button("Copy trip link", { onClick: () => toast("Trip link copied to clipboard (demo).", { kind: "success", icon: "check" }) }),
    ]), { title: "Share your trip" });
  }
  function cancelSheet() {
    confirmSheet({
      title: "Cancel this ride?",
      message: "A driver is already on the way, so a small cancellation fee of ₹30 may apply. You'll return to the home screen.",
      confirmLabel: "Cancel ride",
      onConfirm: () => { toast("Ride cancelled.", { kind: "danger" }); ctx.reset("home"); },
    });
  }

  return { node, meta: { statusbar: "default" } };
}
