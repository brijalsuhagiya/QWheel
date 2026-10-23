// icons.js — inline SVG icon map. The ONLY source of icon markup.
// Each entry is the inner markup of a 24x24 (0 0 24 24) stroke icon
// unless noted. Use icon(name) to get a full <svg> string.

const P = {
  logo: `<circle cx="12" cy="12" r="7"/><line x1="12" y1="2.5" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21.5" y2="12"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>`,
  back: `<path d="M15 5l-7 7 7 7"/>`,
  menu: `<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>`,
  close: `<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>`,
  search: `<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>`,
  chevronRight: `<path d="M9 5l7 7-7 7"/>`,
  chevronDown: `<path d="M5 9l7 7 7-7"/>`,
  home: `<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>`,
  briefcase: `<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`,
  train: `<rect x="5" y="3" width="14" height="13" rx="3"/><line x1="5" y1="11" x2="19" y2="11"/><circle cx="9" cy="13.5" r="0.6" fill="currentColor" stroke="none"/><circle cx="15" cy="13.5" r="0.6" fill="currentColor" stroke="none"/><path d="M8 16l-2 4"/><path d="M16 16l2 4"/>`,
  camera: `<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>`,
  lock: `<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>`,
  plus: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  minus: `<line x1="5" y1="12" x2="19" y2="12"/>`,
  check: `<path d="M5 12.5l4.5 4.5L19 7.5"/>`,
  checkThin: `<path d="M5 12.5l4.5 4.5L19 7.5"/>`,
  star: `<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" fill="currentColor" stroke="none"/>`,
  shield: `<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>`,
  record: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/>`,
  location: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>`,
  person: `<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>`,
  people: `<circle cx="9" cy="8" r="3.4"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6"/><path d="M17 14.3A5.5 5.5 0 0 1 20.5 19.5"/>`,
  luggage: `<rect x="6" y="7" width="12" height="13" rx="2"/><path d="M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7"/><line x1="10" y1="11" x2="10" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/>`,
  car: `<path d="M3 13l1.8-4.5A3 3 0 0 1 7.6 6.5h8.8a3 3 0 0 1 2.8 2L21 13"/><path d="M3 13h18v4a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H6.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><circle cx="7" cy="16" r="0.6" fill="currentColor" stroke="none"/><circle cx="17" cy="16" r="0.6" fill="currentColor" stroke="none"/>`,
  suv: `<path d="M2.5 13l1.5-4a3 3 0 0 1 2.8-2h10.4a3 3 0 0 1 2.8 2l1.5 4"/><rect x="2.5" y="13" width="19" height="5" rx="1.5"/><circle cx="7" cy="18" r="1.6" fill="var(--bg-surface)"/><circle cx="17" cy="18" r="1.6" fill="var(--bg-surface)"/>`,
  bus: `<rect x="4" y="4" width="16" height="13" rx="2.5"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="9" y1="4" x2="9" y2="11"/><line x1="15" y1="4" x2="15" y2="11"/><path d="M7 17v2"/><path d="M17 17v2"/>`,
  phone: `<path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" fill="currentColor" stroke="none"/>`,
  message: `<rect x="3.5" y="5" width="17" height="12" rx="3" fill="currentColor" stroke="none"/><path d="M7 20l1.5-3H17" fill="currentColor" stroke="none"/>`,
  arrowUp: `<line x1="12" y1="19" x2="12" y2="5"/><path d="M6 11l6-6 6 6"/>`,
  sos: `<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none"/>`,
  clock: `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`,
  rupee: `<path d="M8 6h8"/><path d="M8 9.5h8"/><path d="M8 13h3.5a3.5 3.5 0 0 0 0-7"/><path d="M8 13l6 5"/>`,
  percent: `<line x1="7" y1="17" x2="17" y2="7"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/>`,
  edit: `<path d="M4 20h4L19 9l-4-4L4 16z"/><line x1="14" y1="6" x2="18" y2="10"/>`,
  apple: `<path d="M16 13c0 3 2 4 2 4s-1.3 3-3 3c-1 0-1.7-.7-2.9-.7S9.9 20 9 20c-1.8 0-4-3.3-4-6.3C5 10 7 8.5 8.8 8.5c1 0 1.9.7 2.7.7s1.6-.8 2.9-.8c1 0 2.4.5 3.1 1.6-2 .9-1.8 3-1.5 3.5z" fill="currentColor" stroke="none"/><path d="M13.5 6.5c.7-.8.6-2 .6-2s-1.2.1-2 .9c-.6.7-.7 1.9-.7 1.9s1.3.1 2.1-.8z" fill="currentColor" stroke="none"/>`,
  reset: `<path d="M4 12a8 8 0 1 1 2.3 5.6"/><path d="M4 20v-5h5"/>`,
  card: `<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  history: `<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 7v4h4"/><path d="M12 8v4l3 2"/>`,
  help: `<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.6 1.3c0 1.7-2.1 2-2.1 3.2"/><circle cx="12" cy="17" r="0.7" fill="currentColor" stroke="none"/>`,
  moon: `<path d="M20 14a8 8 0 1 1-9-11 6.5 6.5 0 0 0 9 11z"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2M12 19.5v2M4.2 7l1.7 1M18.1 16l1.7 1M4.2 17l1.7-1M18.1 8l1.7-1M2.5 12h2M19.5 12h2"/>`,
  walk: `<circle cx="13" cy="4.5" r="1.6" fill="currentColor" stroke="none"/><path d="M10 21l2-5-2-3V9l4-1 2 3 2 1"/><path d="M12 13l-3 1-1 3"/>`,
};

/**
 * Return a complete <svg> string for a named icon.
 * @param {string} name  key in the icon map
 * @param {object} [opt] { size, stroke, cls }
 */
export function icon(name, opt = {}) {
  const inner = P[name];
  if (!inner) {
    console.warn(`[icons] unknown icon: ${name}`);
    return "";
  }
  const size = opt.size || 24;
  const stroke = opt.stroke != null ? opt.stroke : 2;
  const cls = opt.cls ? ` class="${opt.cls}"` : "";
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

export const hasIcon = (name) => Boolean(P[name]);
