# QuickWheel — last-mile prototype

> **Last-mile, sorted.** A static, mobile-only HTML/CSS/JS prototype of a
> hub-to-destination (railway / airport / bus-stand → doorstep) ride-booking
> flow, built from the supplied wireframes and the *"Ride Home From Public
> Hubs"* brief.

No framework, no build step, no runtime dependencies (optional Google Font).
It runs from any static file server and from GitHub Pages with zero changes.

---

## Run locally

```bash
cd quickwheel
python3 -m http.server 8000
# open http://localhost:8000/
```

Any static server works (`npx serve`, VS Code Live Server, etc.). There is
**nothing to install or build** — open `index.html` through a server and the
app boots at the splash screen.

> Opening `index.html` via `file://` will fail: ES modules require `http(s)`.
> Always serve it.

---

## Deploy to GitHub Pages

1. Create a repo and push these files to `main` (the repo root should contain
   `index.html`, `404.html`, `.nojekyll`, `css/`, `js/`, `assets/`).
2. **Settings → Pages →** Source: *Deploy from a branch*, Branch: **`main`**,
   Folder: **`/ (root)`**.
   *(If you nest the app under `/docs`, choose `/docs` instead.)*
3. Open `https://<user>.github.io/<repo>/`.

Works at a **project sub-path** (`username.github.io/repo/`) and at a
**user/org root** (`username.github.io/`) — every path is relative and
leading-slash-free, so nothing needs to change between the two.

Why it "just works" on Pages:

- All asset paths are relative (`css/base.css`, `./router.js`) — never
  root-absolute.
- Filenames are all lowercase and imports match exactly (Pages is
  case-sensitive / Linux).
- ES modules load via `<script type="module" src="js/app.js">` with a `.js`
  extension.
- **`.nojekyll`** is present so Pages serves everything verbatim.
- **`404.html`** is a byte-for-byte copy of `index.html`, so a deep-link
  refresh still boots the app.
- No service worker, no `process.env`, no Node APIs.

---

## What's built

A complete first-run → booking → ride → arrival flow, 17 screens, reconciled
from the 17 wireframes and the brief's target journey (sections 10.2 & 11):

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 1 | Splash | `splash` | Auto-advances (~1.9s) or tap to skip. |
| 2 | Onboarding ×3 | `onboarding` | Doorstep / Fair fares / Safety, with progress dots. |
| 3 | Enter number | `phone` | Validated phone field + "Continue with Apple" (demo). |
| 4 | Verify number | `otp` | 6-cell OTP, live caret, resend countdown. |
| 5 | Add photo | `photo` | Required-photo gate; CTA disabled until added. |
| 6 | Home | `home` | Map + saved places; hamburger **Menu**, avatar. |
| 7 | Pickup point | `pickup` | Verified pickup A/B/C radio list on a map. |
| 8 | Trip details | `tripDetails` | Passenger & trolley-bag steppers, SUV suggestion. |
| 9 | Choose a ride | `rideOptions` | Loading skeleton → QuickXL/QuickGo/Shared/AC Bus. |
| 10 | Your safety | `safety` | Verified-driver / record / live-share / women-only toggles, SOS. |
| 11 | Share your ride | `shareRide` | Co-passenger match, split-fare savings. |
| 12 | Smart detour | `detour` | Cheaper-route offer (skips toll & surge). |
| 13 | Confirm your ride | `confirm` | Fare breakdown, coupon `FIRST50`, confirm. |
| 14 | Finding your ride | `finding` | Radar match; auto-advances to driver. |
| 15 | Driver arriving | `arriving` | Driver card, PIN, call/message/share-trip; **Start ride** begins the trip. |
| 16 | On trip | `onTrip` | Live progress bar, next stop, counting-down ETA; car moves on the map, then auto-arrives. |
| 17 | Reached + feedback | `arrived` | "You've reached", fare summary, star rating, what-went-well tags, optional tip & note. |

**Flow wiring:** `splash → onboarding → phone → otp → photo → home → pickup →
tripDetails → rideOptions → confirm → detour → finding → arriving → onTrip →
arrived → (home)`. `safety` opens from the ride-options safety banner;
`shareRide` opens when the **Shared** option is selected (its CTA becomes "Set
up shared ride"). `arriving` → **Start ride** → `onTrip` steps through the
journey stages and auto-advances to `arrived`; submitting (or skipping)
feedback returns to `home`.

Every screen handles its states: empty/required (photo gate, "rate before you
submit" on feedback), **loading** (ride-options skeleton, finding spinner,
live trip progress), **validation** (phone, OTP & rating inline errors in an
`aria-live` region), **destructive actions** behind confirm sheets (cancel
search, cancel ride, SOS, reset demo), and **storage disabled** (silent
in-memory fallback + a one-time heads-up toast).

**Interactions & feel:** route transitions (slide-in-right forward,
slide-in-left back, fade for replace, ~220ms), `:active` tile/button scale,
animated toggles, draw-in checkbox, pointer **and** keyboard slider, stacking
auto-dismiss toasts, bottom sheets over a 40% overlay (backdrop-tap + Escape,
focus-trapped). `prefers-reduced-motion: reduce` collapses all of it.

**Accessibility:** semantic `<main>`/`<header>`/`<nav>`, `role="switch"`
(toggles), `role="checkbox"`, `role="radiogroup"/"radio"` (chips, pickup
points, ride cards), `role="slider"` with `aria-valuemin/max/now/valuetext`, a keyboard-navigable
`role="radiogroup"` **star rating**, multi-select feedback tags
(`aria-pressed`), `role="dialog" aria-modal="true"` sheets, `aria-live="polite"`
toast/error region, ≥44×44px touch targets, visible focus rings, and
AA-contrast color pairs in **both light and dark** themes.

**Theme:** light-first (matches the wireframes). A full dark theme ships on
`.phone[data-theme="dark"]` and is switchable from **Menu → Ride preferences
→ Dark theme** (persisted).

### Inferred / reconciled screens

The wireframes show no bottom tab bar, so navigation is a **stack flow**, not
tabs — the home screen uses a hamburger **Menu** and an avatar instead. To
avoid dead buttons, the Menu exposes Payment methods / Trip history / Help
(each a "Coming soon" toast), a **Ride preferences** sheet (which is also
where the reusable **slider** and **checkbox** components live — max-walk
distance, cheaper-route alerts, dark theme), and **Reset demo**. The
**Smart detour** screen (wireframe 14) isn't pinned to a fixed spot in the
flow; it's placed right after booking confirmation as a "cheaper route found
before dispatch" moment.

The **On trip** (`onTrip`) and **Reached + feedback** (`arrived`) screens
extend the journey past the last wireframe (driver arriving), covering the
brief's target-journey Step 5 "ride with support" and Step 6 "arrive, pay,
rate" (§10.2). `onTrip` simulates movement by stepping through a few progress
stages (position, next stop, ETA) before auto-arriving.

## Marked WIP / out of scope

These are intentionally stubbed and **never dead** — they show a "Soon" badge
or fire a "coming soon" toast:

- Payment-method picker ("Change ›"), coupon entry, trip history, help centre.
- "Continue with Apple" sign-in, add name/details, trusted-contact picker.
- Real calling/messaging, real SOS dispatch, real map tiles & live GPS.
- Driver/operator-side flows (brief §10.3) and real shared-ride matching.

---

## Project structure

```
quickwheel/
├── index.html            app shell: phone frame, status bar, mount points
├── 404.html              byte-for-byte copy of index.html (deep-link refresh)
├── .nojekyll             serve files verbatim on Pages
├── favicon.svg           crosshair logo (also the apple-touch-icon)
├── README.md
├── css/
│   ├── reset.css         reset + reduced-motion guard
│   ├── variables.css     design tokens (color/type/space/motion) + dark theme
│   ├── base.css          body, phone frame, status bar, responsive collapse
│   ├── components.css     every reusable UI piece
│   ├── screens.css       per-screen layouts + the map treatment
│   └── animations.css    keyframes + route-transition classes
├── js/
│   ├── icons.js          inline SVG icon map (only source of icons)
│   ├── data.js           all dummy entities (only place data shape lives)
│   ├── store.js          localStorage adapter + in-memory fallback + pub/sub
│   ├── components.js     DOM builders for every reusable UI piece
│   ├── router.js         screen stack + enter/exit transitions
│   ├── screens.js        each route as a factory returning a DOM node
│   └── app.js            entry: route table, initial route, theme
└── assets/               empty — the prototype ships asset-free
```

Reusable UI has exactly one home: a builder in `components.js` + a rule in
`components.css`. Screens never redefine buttons, toggles, sliders, chips or
inputs, never hard-code a color/radius/duration (those live in
`variables.css`), and get icons only from `icons.js`.

---

## Design tokens

Extracted from the wireframes and defined in `css/variables.css` (names kept
from the scaffold; values replaced with the real design):

- **Primary action** is near-black `--accent: #0a0a0b` (inverts to white in
  dark). Accents: blue `#2f6bff` (markers/links), green `#1a8a4d` (savings),
  purple `#7b5cff` (safety), red `#e0362f` (SOS), amber for "Required".
- Radii `--r-xs…--r-pill`, 4-pt spacing `--s-1…--s-8`, type
  `--fs-micro…--fs-3xl`, motion `--dur-fast/base/slow` with
  `--ease-out: cubic-bezier(0.2,0.8,0.2,1)`.
- Dark counterparts live under `.phone[data-theme="dark"]`; `color` is set on
  `.phone` so themed text cascades inside the theme scope.

Font is **Inter** (Google Fonts) with a system-font fallback — if the font
request is blocked the UI degrades gracefully to the system stack.

---

## Assets handoff

The prototype ships **asset-free** (every icon is inline SVG from
`js/icons.js`). If brand imagery arrives later, drop it under `assets/` and
reference it **relatively** (never a leading `/`). Slots this project would
use:

| Where in the UI        | Suggested path          | Format     | Target size |
| ---------------------- | ----------------------- | ---------- | ----------- |
| App logo (splash)      | `assets/logo.svg`       | SVG        | 128 × 128   |
| Hero / splash backdrop | `assets/hero.jpg`       | JPG / WebP | 1125 × 2436 |
| User / co-rider photo  | `assets/photos/<id>.jpg`| JPG / WebP | 240 × 240   |
| Driver photo           | `assets/photos/<id>.jpg`| JPG / WebP | 240 × 240   |
| Vehicle thumbnails     | `assets/vehicles/<id>.svg` | SVG     | 96 × 96     |
| Map tiles (if real map)| `assets/map/<z>/<x>/<y>.png` | PNG   | 256 × 256   |
| Favicon                | `favicon.svg`           | SVG        | 512 × 512   |
| iOS touch icon         | `apple-touch-icon.png`  | PNG        | 180 × 180   |

To re-skin for a brand, swap the values in `css/variables.css` — no screen
code changes.

---

## "Done" checklist

- `python3 -m http.server` → every screen reachable, every interaction works,
  **no console errors or 404s** (verified via a headless click-through of all
  17 routes).
- Relative, leading-slash-free paths → identical render at a Pages sub-path or
  user-root; every CSS/JS/font request returns 200.
- Resizing between a phone viewport and a wide desktop reflows cleanly: the app
  sits in a centered phone frame on wide windows and fills the viewport below
  ~520px; it never grows past phone width.
- Full dark theme, reduced-motion support, keyboard-operable custom controls,
  and an in-memory fallback when storage is disabled.
