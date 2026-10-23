// router.js — screen stack with enter/exit transitions.
// Screens are factories: (params, ctx) => { node, meta?, onEnter?(), onExit?() }
// Navigation is in-memory (no URL changes) so it works under any
// GitHub Pages sub-path without rewrites.

const prefersReduced =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createRouter({ routes, mount, phone, start, startParams }) {
  const stack = []; // [{ name, params, screen, node }]
  let busy = false;

  function build(name, params) {
    const def = routes[name];
    if (!def) throw new Error(`[router] unknown route: ${name}`);
    const ctx = { navigate, back, replace, reset, name };
    const screen = def(params || {}, ctx);
    const node = screen.node || screen; // allow returning a bare node
    node.classList.add("screen");
    node.dataset.route = name;
    return { name, params: params || {}, screen: screen.node ? screen : { node }, node };
  }

  function applyChrome(entry) {
    const meta = (entry.screen && entry.screen.meta) || {};
    phone.dataset.statusbar = meta.statusbar || "default";
    if (meta.theme) phone.dataset.theme = meta.theme;
  }

  function transition(incoming, outgoing, direction) {
    return new Promise((resolve) => {
      const enterCls =
        direction === "back" ? "scr-enter-back"
        : direction === "replace" ? "scr-enter-fade"
        : "scr-enter-forward";
      const exitCls =
        direction === "back" ? "scr-exit-back"
        : direction === "replace" ? "scr-exit-fade"
        : "scr-exit-forward";

      mount.appendChild(incoming.node);
      applyChrome(incoming);
      incoming.screen.onEnter && incoming.screen.onEnter();

      if (!outgoing || prefersReduced) {
        if (outgoing) {
          outgoing.screen.onExit && outgoing.screen.onExit();
          outgoing.node.remove();
        }
        resolve();
        return;
      }

      incoming.node.classList.add(enterCls);
      outgoing.node.classList.add(exitCls);

      let done = 0;
      const finish = () => {
        done++;
        if (done < 2) return;
        incoming.node.classList.remove(enterCls);
        outgoing.screen.onExit && outgoing.screen.onExit();
        outgoing.node.remove();
        resolve();
      };
      incoming.node.addEventListener("animationend", finish, { once: true });
      outgoing.node.addEventListener("animationend", finish, { once: true });
      // safety fallback
      setTimeout(() => { if (done < 2) { done = 1; finish(); } }, 500);
    });
  }

  async function go(name, params, direction, { replaceTop = false } = {}) {
    if (busy) return;
    busy = true;
    try {
      const incoming = build(name, params);
      const outgoing = stack[stack.length - 1] || null;

      if (direction === "back") {
        stack.pop(); // remove current (outgoing)
      } else if (replaceTop && stack.length) {
        stack.pop();
      }
      stack.push(incoming);

      await transition(incoming, outgoing, direction);
    } finally {
      busy = false;
    }
  }

  function navigate(name, params) { return go(name, params, "forward"); }
  function replace(name, params) { return go(name, params, "replace", { replaceTop: true }); }

  function back(fallback) {
    if (stack.length <= 1) {
      if (fallback) return go(fallback, {}, "back", { replaceTop: true });
      return;
    }
    const prev = stack[stack.length - 2];
    return go(prev.name, prev.params, "back");
  }

  // Reset the whole stack to a single route (used by demo reset)
  async function reset(name, params) {
    stack.slice(0, -1).forEach((e) => { e.node.remove(); });
    const keep = stack[stack.length - 1] || null;
    stack.length = 0;
    const incoming = build(name, params);
    stack.push(incoming);
    await transition(incoming, keep, "replace");
  }

  function current() { return stack[stack.length - 1]; }

  // boot
  (async () => {
    const first = build(start, startParams);
    stack.push(first);
    mount.appendChild(first.node);
    applyChrome(first);
    first.screen.onEnter && first.screen.onEnter();
  })();

  return { navigate, replace, back, reset, current, get depth() { return stack.length; } };
}
