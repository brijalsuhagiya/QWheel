// components.js — DOM builders for every reusable UI piece.
// Screens compose these; they never hand-build buttons/toggles/etc.

import { icon } from "./icons.js";

/* ============================================================
   Tiny DOM helpers
   ============================================================ */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "attrs") for (const [a, av] of Object.entries(v)) {
      if (av != null && av !== false) node.setAttribute(a, av === true ? "" : av);
    }
    else node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null || c === false) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

export const frag = (nodes) => {
  const f = document.createDocumentFragment();
  nodes.filter(Boolean).forEach((n) => f.appendChild(n));
  return f;
};

// Activate a custom control with Enter/Space (keyboard parity)
export function activatable(node, handler) {
  node.addEventListener("click", handler);
  node.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler(e);
    }
  });
  return node;
}

/* ============================================================
   Buttons
   ============================================================ */
export function button(label, { variant = "primary", onClick, disabled, meta, cls = "", type = "button", ariaLabel } = {}) {
  const variants = {
    primary: "btn",
    secondary: "btn btn--secondary",
    ghost: "btn btn--ghost",
    success: "btn btn--success",
    danger: "btn btn--danger",
  };
  const children = [];
  if (meta) {
    children.push(el("span", { text: label }));
    children.push(el("span", { class: "btn__sep" }));
    children.push(el("span", { class: "btn__meta", text: meta }));
  } else {
    children.push(document.createTextNode(label));
  }
  return el("button", {
    class: `${variants[variant] || variants.primary} ${cls}`.trim(),
    type,
    attrs: { "aria-disabled": disabled ? "true" : null, "aria-label": ariaLabel || null },
    disabled: disabled || null,
    onClick: disabled ? null : onClick,
  }, children);
}

export function iconButton(name, { onClick, label, cls = "", plain = false } = {}) {
  const b = el("button", {
    class: `icon-btn ${plain ? "icon-btn--plain" : ""} ${cls}`.trim(),
    type: "button",
    attrs: { "aria-label": label || name },
    html: icon(name),
  });
  if (onClick) b.addEventListener("click", onClick);
  return b;
}

/* ============================================================
   Header + action bar
   ============================================================ */
export function header({ title, sub, onBack, small = false, trailing } = {}) {
  const kids = [];
  if (onBack) kids.push(iconButton("back", { onClick: onBack, label: "Go back", plain: true }));
  kids.push(
    el("div", { class: "header__titles" }, [
      el("div", { class: `header__title ${small ? "header__title--sm" : ""}`.trim(), text: title }),
      sub ? el("div", { class: "header__sub", text: sub }) : null,
    ])
  );
  if (trailing) kids.push(el("div", { style: { marginLeft: "auto" } }, [trailing]));
  return el("header", { class: "header" }, kids);
}

export function actionBar(children, { note, float = false } = {}) {
  const kids = Array.isArray(children) ? children : [children];
  if (note) kids.push(el("div", { class: "action-bar__note", html: note }));
  return el("div", { class: `action-bar ${float ? "action-bar--float" : ""}`.trim() }, kids);
}

/* ============================================================
   Pills / badges / chips
   ============================================================ */
export function badge(text, kind = "dark") {
  const kids = [];
  if (kind === "warn") kids.push(el("span", { class: "badge__dot" }));
  kids.push(document.createTextNode(text));
  return el("span", { class: `badge badge--${kind}` }, kids);
}

export function pill(text, { dotColor, surface = false } = {}) {
  const kids = [];
  if (dotColor) kids.push(el("span", { class: "pill__dot", style: { background: dotColor } }));
  kids.push(document.createTextNode(text));
  return el("span", { class: `pill ${surface ? "pill--surface" : ""}`.trim() }, kids);
}

/** Radiogroup of chips. options:[{value,label}] */
export function chipGroup(options, { value, onChange, label } = {}) {
  const group = el("div", { class: "chip-group", role: "radiogroup", attrs: { "aria-label": label } });
  let current = value;
  options.forEach((opt) => {
    const chip = el("button", {
      class: "chip",
      type: "button",
      role: "radio",
      text: opt.label,
      attrs: { "aria-checked": String(opt.value === current), tabindex: opt.value === current ? "0" : "-1" },
    });
    activatable(chip, () => {
      current = opt.value;
      group.querySelectorAll(".chip").forEach((c, i) => {
        const on = options[i].value === current;
        c.setAttribute("aria-checked", String(on));
        c.setAttribute("tabindex", on ? "0" : "-1");
      });
      onChange && onChange(current);
    });
    group.appendChild(chip);
  });
  return group;
}

/* ============================================================
   Toggle (role=switch)
   ============================================================ */
export function toggle({ checked = false, onChange, label, kind = "" } = {}) {
  const t = el("button", {
    class: `toggle ${kind ? "toggle--" + kind : ""}`.trim(),
    type: "button",
    role: "switch",
    attrs: { "aria-checked": String(checked), "aria-label": label || "Toggle" },
  });
  activatable(t, () => {
    const next = t.getAttribute("aria-checked") !== "true";
    t.setAttribute("aria-checked", String(next));
    onChange && onChange(next);
  });
  return t;
}

/* ============================================================
   Checkbox (role=checkbox)
   ============================================================ */
export function checkbox({ checked = false, onChange, label } = {}) {
  const c = el("button", {
    class: "checkbox",
    type: "button",
    role: "checkbox",
    attrs: { "aria-checked": String(checked), "aria-label": label || "Checkbox" },
    html: icon("checkThin", { size: 16 }),
  });
  activatable(c, () => {
    const next = c.getAttribute("aria-checked") !== "true";
    c.setAttribute("aria-checked", String(next));
    // re-trigger draw animation
    const svg = c.querySelector("svg path");
    if (svg) { svg.style.animation = "none"; void svg.offsetWidth; svg.style.animation = ""; }
    onChange && onChange(next);
  });
  return c;
}

/* ============================================================
   Stepper (−  value  +)
   ============================================================ */
export function stepper({ value = 0, min = 0, max = 99, onChange, label = "value" } = {}) {
  let v = value;
  const dec = el("button", { class: "stepper__btn", type: "button", attrs: { "aria-label": `Decrease ${label}` }, html: icon("minus", { size: 18 }) });
  const inc = el("button", { class: "stepper__btn", type: "button", attrs: { "aria-label": `Increase ${label}` }, html: icon("plus", { size: 18 }) });
  const out = el("div", { class: "stepper__val", attrs: { "aria-live": "polite", role: "status" }, text: String(v) });
  const sync = () => {
    out.textContent = String(v);
    dec.disabled = v <= min;
    inc.disabled = v >= max;
  };
  dec.addEventListener("click", () => { if (v > min) { v--; sync(); onChange && onChange(v); } });
  inc.addEventListener("click", () => { if (v < max) { v++; sync(); onChange && onChange(v); } });
  sync();
  return el("div", { class: "stepper" }, [dec, out, inc]);
}

/* ============================================================
   Slider (role=slider) — pointer + keyboard
   ============================================================ */
export function slider({ value = 0, min = 0, max = 10, step = 1, label = "Value", format, onChange } = {}) {
  let v = Math.min(max, Math.max(min, value));
  const fmt = format || ((x) => String(x));
  const fill = el("div", { class: "slider__fill" });
  const thumb = el("div", { class: "slider__thumb" });
  const valueLabel = el("span", { class: "slider__value", text: fmt(v) });
  const track = el("div", {
    class: "slider__track",
    role: "slider",
    tabindex: "0",
    attrs: {
      "aria-label": label,
      "aria-valuemin": String(min),
      "aria-valuemax": String(max),
      "aria-valuenow": String(v),
      "aria-valuetext": fmt(v),
    },
  }, [fill, thumb]);

  const paint = () => {
    const pct = ((v - min) / (max - min)) * 100;
    fill.style.width = pct + "%";
    thumb.style.left = pct + "%";
    track.setAttribute("aria-valuenow", String(v));
    track.setAttribute("aria-valuetext", fmt(v));
    valueLabel.textContent = fmt(v);
  };
  const setV = (nv, notify = true) => {
    const clamped = Math.min(max, Math.max(min, Math.round(nv / step) * step));
    if (clamped === v) return;
    v = clamped;
    paint();
    if (notify) onChange && onChange(v);
  };

  const fromClientX = (clientX) => {
    const r = track.getBoundingClientRect();
    const ratio = (clientX - r.left) / r.width;
    setV(min + ratio * (max - min));
  };

  let dragging = false;
  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    track.setPointerCapture(e.pointerId);
    track.focus();
    fromClientX(e.clientX);
  });
  track.addEventListener("pointermove", (e) => { if (dragging) fromClientX(e.clientX); });
  const end = (e) => { if (dragging) { dragging = false; try { track.releasePointerCapture(e.pointerId); } catch (_) {} } };
  track.addEventListener("pointerup", end);
  track.addEventListener("pointercancel", end);

  track.addEventListener("keydown", (e) => {
    const big = Math.max(step, Math.round((max - min) / 10));
    const map = {
      ArrowRight: step, ArrowUp: step,
      ArrowLeft: -step, ArrowDown: -step,
      PageUp: big, PageDown: -big,
      Home: min - v, End: max - v,
    };
    if (e.key in map) {
      e.preventDefault();
      setV(v + map[e.key]);
    }
  });

  paint();
  const head = el("div", { class: "slider__head" }, [
    el("span", { class: "slider__label", text: label }),
    valueLabel,
  ]);
  return el("div", { class: "slider" }, [head, track]);
}

/* ============================================================
   List rows
   ============================================================ */
export function row({ icon: ic, iconKind, title, sub, trailing, onClick, badgeEl } = {}) {
  const kids = [];
  if (ic) kids.push(el("div", { class: `row__icon ${iconKind ? "row__icon--" + iconKind : ""}`.trim(), html: icon(ic) }));
  const body = el("div", { class: "row__body" }, [
    el("div", { class: "row__title" }, [title, badgeEl || null].filter(Boolean).length > 1
      ? [el("span", { text: title }), badgeEl] : title),
    sub ? el("div", { class: "row__sub", text: sub }) : null,
  ]);
  kids.push(body);
  if (trailing) {
    const tr = el("div", { class: "row__trail" });
    (Array.isArray(trailing) ? trailing : [trailing]).forEach((t) =>
      tr.appendChild(typeof t === "string" ? el("span", { html: t }) : t));
    kids.push(tr);
  }
  const node = el("div", { class: `row ${onClick ? "row--tap" : ""}`.trim() }, kids);
  if (onClick) {
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    activatable(node, onClick);
  }
  return node;
}

export function chevron() {
  return el("span", { html: icon("chevronRight", { size: 18 }) });
}

/* ============================================================
   Selectable option (radio list) — pickup points, etc.
   ============================================================ */
export function option({ badge: b, badgeKind = "a", title, titleBadge, sub, checked = false, onSelect } = {}) {
  const titleKids = [el("span", { text: title })];
  if (titleBadge) titleKids.push(titleBadge);
  const node = el("button", {
    class: "option",
    type: "button",
    role: "radio",
    attrs: { "aria-checked": String(checked) },
  }, [
    b ? el("span", { class: `option__badge`, text: b }) : null,
    el("div", { class: "option__body" }, [
      el("div", { class: "option__title" }, titleKids),
      sub ? el("div", { class: "option__sub", text: sub }) : null,
    ]),
    el("span", { class: "radio" }),
  ]);
  activatable(node, () => onSelect && onSelect());
  return node;
}

/* ============================================================
   Ride card
   ============================================================ */
export function rideCard(opt, { checked = false, onSelect } = {}) {
  const nameKids = [el("span", { text: opt.name })];
  if (opt.tag) nameKids.push(badge(opt.tag, opt.tagKind === "dark" ? "dark" : "success"));
  const metaBits = [];
  if (opt.meta) metaBits.push(opt.meta);
  else {
    if (opt.seats) metaBits.push(`${opt.seats} seats`);
    if (opt.bags) metaBits.push(`fits ${opt.bags} bags`);
  }
  if (opt.etaMin != null) metaBits.push(`${opt.etaMin} min`);

  const price = el("div", { class: "ride__price" }, [
    el("div", { class: "ride__fare", text: `₹${opt.price}` }),
    opt.save ? el("div", { class: "ride__save", text: `Save ₹${opt.save}` }) : null,
  ]);

  const node = el("button", {
    class: "ride",
    type: "button",
    role: "radio",
    attrs: { "aria-checked": String(checked), "aria-label": `${opt.name}, ₹${opt.price}` },
  }, [
    el("div", { class: "ride__icon", html: icon(opt.icon, { size: 26 }) }),
    el("div", { class: "ride__body" }, [
      el("div", { class: "ride__name" }, nameKids),
      el("div", { class: "ride__meta", text: metaBits.join(" · ") }),
    ]),
    price,
  ]);
  activatable(node, () => onSelect && onSelect(opt));
  return node;
}

/* ============================================================
   Avatar
   ============================================================ */
export function avatar(initial, { size = "", color, cls = "" } = {}) {
  return el("span", {
    class: `avatar ${size ? "avatar--" + size : ""} ${cls}`.trim(),
    style: color ? { background: color } : {},
    text: initial,
    attrs: { "aria-hidden": "true" },
  });
}

/* ============================================================
   Progress dots
   ============================================================ */
export function dots(total, active) {
  const wrap = el("div", { class: "dots", attrs: { role: "tablist", "aria-label": "Progress" } });
  for (let i = 0; i < total; i++) {
    wrap.appendChild(el("span", { class: `dots__dot ${i === active ? "dots__dot--active" : ""}`.trim() }));
  }
  return wrap;
}

/* ============================================================
   Banner (inline callout)
   ============================================================ */
export function banner({ icon: ic = "shield", title, sub, chevron: hasChev = false, onClick } = {}) {
  const node = el("div", { class: `banner ${onClick ? "banner--tap" : ""}`.trim() }, [
    el("div", { class: "banner__icon", html: icon(ic, { size: 18 }) }),
    el("div", { class: "banner__body" }, [
      el("div", { class: "banner__title", text: title }),
      sub ? el("div", { class: "banner__sub", text: sub }) : null,
    ]),
    hasChev ? el("div", { class: "banner__chev", html: icon("chevronRight", { size: 18 }) }) : null,
  ]);
  if (onClick) {
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    activatable(node, onClick);
  }
  return node;
}

/* ============================================================
   Skeleton helper
   ============================================================ */
export function skeleton(w, h, { radius } = {}) {
  return el("div", { class: "skeleton", style: { width: w, height: h, borderRadius: radius } });
}

/* ============================================================
   Toasts — stack, auto-dismiss ~2.5s
   ============================================================ */
let toastStack = [];
export function toast(message, { kind = "", icon: ic, duration = 2500 } = {}) {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const node = el("div", {
    class: `toast ${kind ? "toast--" + kind : ""}`.trim(),
    attrs: { role: "status" },
  }, [
    ic ? el("span", { html: icon(ic, { size: 18 }) }) : null,
    el("span", { text: message }),
  ]);
  root.appendChild(node);
  toastStack.push(node);
  restackToasts();
  requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add("toast--in")));

  const remove = () => {
    node.classList.remove("toast--in");
    node.addEventListener("transitionend", () => {
      node.remove();
      toastStack = toastStack.filter((t) => t !== node);
      restackToasts();
    }, { once: true });
    // fallback if transitionend doesn't fire (reduced motion)
    setTimeout(() => {
      if (node.isConnected) { node.remove(); toastStack = toastStack.filter((t) => t !== node); restackToasts(); }
    }, 320);
  };
  const timer = setTimeout(remove, duration);
  node.addEventListener("click", () => { clearTimeout(timer); remove(); });
  return node;
}
function restackToasts() {
  // newest at bottom; older ones lift up
  const base = 0;
  for (let i = toastStack.length - 1, lift = 0; i >= 0; i--, lift++) {
    toastStack[i].style.transform = toastStack[i].classList.contains("toast--in")
      ? `translateY(${base - lift * 64}px)` : "";
    toastStack[i].style.zIndex = String(100 + i);
  }
}

/* ============================================================
   Bottom sheet — slide up over 40% overlay, focus-trap, Esc
   ============================================================ */
export function openSheet(buildContent, { title, labelledBy } = {}) {
  const root = document.getElementById("overlay-root");
  if (!root) return { close: () => {} };

  const backdrop = el("div", { class: "sheet-backdrop" });
  const titleId = labelledBy || (title ? "sheet-title-" + Date.now() : null);
  const sheet = el("div", {
    class: "sheet",
    role: "dialog",
    attrs: { "aria-modal": "true", "aria-label": title ? null : "Dialog", "aria-labelledby": titleId },
  });
  sheet.appendChild(el("div", { class: "sheet__grip" }));
  if (title) sheet.appendChild(el("h2", { class: "sheet__title", id: titleId, text: title }));

  let closed = false;
  const api = {
    close() {
      if (closed) return;
      closed = true;
      backdrop.classList.remove("sheet-backdrop--in");
      sheet.classList.remove("sheet--in");
      const done = () => { root.contains(backdrop) && backdrop.remove(); lastFocus && lastFocus.focus && lastFocus.focus(); };
      sheet.addEventListener("transitionend", done, { once: true });
      setTimeout(() => { if (!closed) return; done(); }, 320);
      document.removeEventListener("keydown", onKey, true);
    },
  };

  const content = buildContent(api);
  if (content) sheet.appendChild(content);
  backdrop.appendChild(sheet);
  root.appendChild(backdrop);

  const lastFocus = document.activeElement;
  // focus trap
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); api.close(); return; }
    if (e.key === "Tab") {
      const f = sheet.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"]), [role="slider"]');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener("keydown", onKey, true);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) api.close(); });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    backdrop.classList.add("sheet-backdrop--in");
    sheet.classList.add("sheet--in");
    const focusable = sheet.querySelector('button:not(.sheet__grip), input, [role="slider"]');
    focusable && focusable.focus();
  }));

  return api;
}

/* ============================================================
   Star rating (role=radiogroup of stars) — pointer + keyboard
   ============================================================ */
export function starRating({ value = 0, max = 5, onChange, label = "Rating" } = {}) {
  let v = value;
  const group = el("div", { class: "stars", role: "radiogroup", attrs: { "aria-label": label } });
  function paint() {
    group.querySelectorAll(".star-btn").forEach((b, i) => {
      const on = i < v;
      b.classList.toggle("star-btn--on", on);
      b.setAttribute("aria-checked", String(i + 1 === v));
      b.setAttribute("tabindex", (i + 1 === (v || 1)) ? "0" : "-1");
    });
  }
  for (let i = 1; i <= max; i++) {
    const b = el("button", {
      class: "star-btn", type: "button", role: "radio",
      attrs: { "aria-label": `${i} star${i > 1 ? "s" : ""}` },
      html: icon("star", { size: 34 }),
    });
    b.addEventListener("click", () => { v = i; paint(); onChange && onChange(v); });
    b.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); v = Math.min(max, (v || 0) + 1); paint(); group.querySelectorAll(".star-btn")[v - 1].focus(); onChange && onChange(v); }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); v = Math.max(1, (v || 1) - 1); paint(); group.querySelectorAll(".star-btn")[v - 1].focus(); onChange && onChange(v); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); v = i; paint(); onChange && onChange(v); }
    });
    group.appendChild(b);
  }
  paint();
  return group;
}

/* ============================================================
   Tag group (multi-select, role=group of toggle buttons)
   ============================================================ */
export function tagGroup(options, { selected = [], onChange, label } = {}) {
  const chosen = new Set(selected);
  const group = el("div", { class: "chip-group", role: "group", attrs: { "aria-label": label } });
  options.forEach((opt) => {
    const b = el("button", {
      class: "chip", type: "button",
      attrs: { "aria-pressed": String(chosen.has(opt)) },
      text: opt,
    });
    activatable(b, () => {
      if (chosen.has(opt)) chosen.delete(opt); else chosen.add(opt);
      b.setAttribute("aria-pressed", String(chosen.has(opt)));
      onChange && onChange([...chosen]);
    });
    group.appendChild(b);
  });
  return group;
}

/* ============================================================
   Textarea
   ============================================================ */
export function textarea({ placeholder = "", label, rows = 3, onInput } = {}) {
  const ta = el("textarea", {
    class: "textarea", rows: String(rows), placeholder,
    attrs: { "aria-label": label || placeholder },
  });
  if (onInput) ta.addEventListener("input", () => onInput(ta.value));
  return ta;
}

/* Confirm sheet for destructive actions */
export function confirmSheet({ title, message, confirmLabel = "Confirm", danger = true, onConfirm }) {
  return openSheet((api) => {
    return frag([
      el("p", { class: "text-soft", style: { marginBottom: "20px", fontSize: "var(--fs-sm)" }, text: message }),
      el("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } }, [
        button(confirmLabel, { variant: danger ? "danger" : "primary", onClick: () => { api.close(); onConfirm && onConfirm(); } }),
        button("Keep it", { variant: "ghost", onClick: () => api.close() }),
      ]),
    ]);
  }, { title });
}
