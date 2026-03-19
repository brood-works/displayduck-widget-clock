const m = /* @__PURE__ */ new Map(), S = (s) => String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"), A = (s) => {
  const t = m.get(s);
  if (t)
    return t;
  const e = s.replace(/\bthis\b/g, "__item"), i = new Function("scope", `with (scope) { return (${e}); }`);
  return m.set(s, i), i;
}, u = (s, t) => {
  try {
    return A(s)(t);
  } catch {
    return "";
  }
}, f = (s, t = 0, e) => {
  const i = [];
  let n = t;
  for (; n < s.length; ) {
    const o = s.indexOf("{{", n);
    if (o === -1)
      return i.push({ type: "text", value: s.slice(n) }), { nodes: i, index: s.length };
    o > n && i.push({ type: "text", value: s.slice(n, o) });
    const a = s.indexOf("}}", o + 2);
    if (a === -1)
      return i.push({ type: "text", value: s.slice(o) }), { nodes: i, index: s.length };
    const c = s.slice(o + 2, a).trim();
    if (n = a + 2, c === "/if" || c === "/each") {
      if (e === c)
        return { nodes: i, index: n };
      i.push({ type: "text", value: `{{${c}}}` });
      continue;
    }
    if (c.startsWith("#if ")) {
      const l = f(s, n, "/if");
      i.push({
        type: "if",
        condition: c.slice(4).trim(),
        children: l.nodes
      }), n = l.index;
      continue;
    }
    if (c.startsWith("#each ")) {
      const l = f(s, n, "/each");
      i.push({
        type: "each",
        source: c.slice(6).trim(),
        children: l.nodes
      }), n = l.index;
      continue;
    }
    i.push({ type: "expr", value: c });
  }
  return { nodes: i, index: n };
}, h = (s, t) => {
  let e = "";
  for (const i of s) {
    if (i.type === "text") {
      e += i.value;
      continue;
    }
    if (i.type === "expr") {
      e += S(u(i.value, t));
      continue;
    }
    if (i.type === "if") {
      u(i.condition, t) && (e += h(i.children, t));
      continue;
    }
    const n = u(i.source, t);
    if (Array.isArray(n))
      for (const o of n) {
        const a = Object.create(t);
        a.__item = o, e += h(i.children, a);
      }
  }
  return e;
}, T = (s) => {
  const t = f(s).nodes;
  return (e) => h(t, e);
};
function w(s, t = "asset") {
  return window.__TAURI_INTERNALS__.convertFileSrc(s, t);
}
var v;
(function(s) {
  s.WINDOW_RESIZED = "tauri://resize", s.WINDOW_MOVED = "tauri://move", s.WINDOW_CLOSE_REQUESTED = "tauri://close-requested", s.WINDOW_DESTROYED = "tauri://destroyed", s.WINDOW_FOCUS = "tauri://focus", s.WINDOW_BLUR = "tauri://blur", s.WINDOW_SCALE_FACTOR_CHANGED = "tauri://scale-change", s.WINDOW_THEME_CHANGED = "tauri://theme-changed", s.WINDOW_CREATED = "tauri://window-created", s.WEBVIEW_CREATED = "tauri://webview-created", s.DRAG_ENTER = "tauri://drag-enter", s.DRAG_OVER = "tauri://drag-over", s.DRAG_DROP = "tauri://drag-drop", s.DRAG_LEAVE = "tauri://drag-leave";
})(v || (v = {}));
const E = (s) => {
  if (typeof s != "function")
    return !1;
  const t = s;
  return t._isSignal === !0 && typeof t.set == "function" && typeof t.subscribe == "function";
}, R = (s, t) => {
  const e = [];
  for (const i of Object.keys(s)) {
    const n = s[i];
    E(n) && e.push(n.subscribe(() => t()));
  }
  return () => {
    for (const i of e)
      i();
  };
}, W = (s, t) => new Proxy(
  { payload: t },
  {
    get(e, i) {
      if (typeof i != "string")
        return;
      if (i in e)
        return e[i];
      const n = s[i];
      return typeof n == "function" ? n.bind(s) : n;
    },
    has(e, i) {
      return typeof i != "string" ? !1 : i in e || i in s;
    }
  }
), F = ["src", "href", "poster"], z = "{{pack-install-path}}/", y = "{{ASSETS}}", _ = (s) => {
  const t = s.trim();
  return t.length === 0 || t.startsWith("data:") || t.startsWith("blob:") || t.startsWith("http://") || t.startsWith("https://") || t.startsWith("file:") || t.startsWith("asset:") || t.startsWith("mailto:") || t.startsWith("tel:") || t.startsWith("javascript:") || t.startsWith("//") || t.startsWith("/") || t.startsWith("#");
}, N = (s) => {
  const t = s.trim();
  if (!t)
    return null;
  if (!_(t))
    return t.replace(/^\.\/+/, "").replace(/^\/+/, "");
  if (t.startsWith("http://") || t.startsWith("https://"))
    try {
      const e = new URL(t);
      if (e.origin === window.location.origin)
        return `${e.pathname}${e.search}${e.hash}`.replace(/^\/+/, "");
    } catch {
      return null;
    }
  return null;
}, C = (s, t) => {
  const e = s.replaceAll("\\", "/").replace(/\/+$/, ""), i = `${e}/${t.trim()}`, n = i.split("/"), o = [];
  for (const a of n) {
    if (!a || a === ".") {
      o.length === 0 && i.startsWith("/") && o.push("");
      continue;
    }
    if (a === "..") {
      (o.length > 1 || o.length === 1 && o[0] !== "") && o.pop();
      continue;
    }
    o.push(a);
  }
  return o.join("/") || e;
}, p = (s, t) => {
  const e = N(t);
  if (!s || !e)
    return t;
  try {
    return w(C(s, e));
  } catch {
    return t;
  }
}, M = (s) => {
  const t = s.trim().replaceAll("\\", "/").replace(/\/+$/, "");
  if (!t)
    return "";
  try {
    return w(t);
  } catch {
    return t;
  }
}, I = (s, t) => s.split(",").map((e) => {
  const i = e.trim();
  if (!i)
    return i;
  const [n, o] = i.split(/\s+/, 2), a = p(t, n);
  return o ? `${a} ${o}` : a;
}).join(", "), L = (s, t) => s.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (e, i, n) => {
  const o = p(t, n);
  return o === n ? e : `url("${o}")`;
}), g = (s, t) => {
  for (const n of F) {
    const o = s.getAttribute(n);
    if (!o)
      continue;
    const a = p(t, o);
    a !== o && s.setAttribute(n, a);
  }
  const e = s.getAttribute("srcset");
  if (e) {
    const n = I(e, t);
    n !== e && s.setAttribute("srcset", n);
  }
  const i = s.getAttribute("style");
  if (i) {
    const n = L(i, t);
    n !== i && s.setAttribute("style", n);
  }
}, x = (s, t) => {
  if (t) {
    s instanceof Element && g(s, t);
    for (const e of Array.from(s.querySelectorAll("*")))
      g(e, t);
  }
}, b = (s, t) => {
  if (!t)
    return s;
  let e = s;
  const i = M(t);
  return i && e.includes(y) && (e = e.replaceAll(y, i)), e.includes(z) ? e.replace(/\{\{pack-install-path\}\}\/([^"')\s]+)/g, (n, o) => p(t, o)) : e;
}, O = (s, t) => class {
  constructor({
    mount: i,
    payload: n,
    setLoading: o
  }) {
    this.cleanups = [], this.widgetDirectory = "", this.mount = i, this.payload = n ?? {}, this.setLoading = typeof o == "function" ? o : (() => {
    }), this.assetObserver = new MutationObserver((a) => {
      if (this.widgetDirectory)
        for (const c of a) {
          if (c.type === "attributes" && c.target instanceof Element) {
            g(c.target, this.widgetDirectory);
            continue;
          }
          for (const l of Array.from(c.addedNodes))
            l instanceof Element && x(l, this.widgetDirectory);
        }
    }), this.logic = new s({
      mount: i,
      payload: this.payload,
      setLoading: (a) => this.setLoading(!!a),
      on: (a, c, l) => this.on(a, c, l)
    }), this.cleanupSignalSubscriptions = R(this.logic, () => this.render()), this.assetObserver.observe(this.mount, {
      subtree: !0,
      childList: !0,
      attributes: !0,
      attributeFilter: ["src", "href", "poster", "srcset", "style"]
    });
  }
  onInit() {
    this.render(), this.logic.onInit?.();
  }
  onUpdate(i) {
    this.payload = i ?? {}, this.logic.onUpdate?.(this.payload), this.render();
  }
  onDestroy() {
    for (this.cleanupSignalSubscriptions(); this.cleanups.length > 0; )
      this.cleanups.pop()?.();
    this.assetObserver.disconnect(), this.logic.onDestroy?.(), this.mount.innerHTML = "";
  }
  render() {
    const i = W(this.logic, this.payload);
    this.widgetDirectory = String(
      this.payload?.widgetDirectory ?? this.payload?.directory ?? ""
    ).trim();
    const n = b(t.template, this.widgetDirectory), o = b(t.styles, this.widgetDirectory), c = T(n)(i);
    this.mount.innerHTML = `<style>${o}</style>${c}`, this.mount.setAttribute("data-displayduck-render-empty", c.trim().length === 0 ? "true" : "false"), x(this.mount, this.widgetDirectory), this.logic.afterRender?.();
  }
  on(i, n, o) {
    const a = (l) => {
      const d = l.target?.closest(n);
      !d || !this.mount.contains(d) || o(l, d);
    };
    this.mount.addEventListener(i, a);
    const c = () => this.mount.removeEventListener(i, a);
    return this.cleanups.push(c), c;
  }
};
var r;
let $ = (r = class {
  constructor(t) {
    this.ctx = t, this.clockTimerId = null, this.flipTimeouts = /* @__PURE__ */ new Map(), this.widgetName = "", this.analogMarkerRotation = 0, this.flipDigits = [], this.digitalHourEl = null, this.digitalMinuteEl = null, this.digitalSecondEl = null, this.analogHourEl = null, this.analogMinuteEl = null, this.analogMarkerEl = null, this.analogTickEls = [], this.flipDigitEls = [], this.analogDigits = [3, 6, 9, 12], this.analogTicks = Array.from({ length: 60 }, (i, n) => n), this.config = this.extractConfig(t.payload), this.widgetName = this.extractWidgetName(t.payload);
    const e = this.getCurrentTime();
    this.flipDigits = this.createFlipDigits(e);
  }
  onInit() {
    this.cacheDomRefs(), this.applyTimeToDom(this.getCurrentTime(), !0), this.scheduleNextTick();
  }
  onUpdate(t) {
    this.config = this.extractConfig(t), this.widgetName = this.extractWidgetName(t), setTimeout(() => {
      this.cacheDomRefs(), this.flipDigits = this.createFlipDigits(this.getCurrentTime()), this.applyTimeToDom(this.getCurrentTime(), !0), this.scheduleNextTick();
    }, 0);
  }
  onDestroy() {
    this.stopClock();
  }
  isAnalog() {
    return this.styles() === "analog";
  }
  isDigital() {
    return this.styles() === "digital";
  }
  isFlip() {
    return this.styles() === "flip";
  }
  styles() {
    const t = String(this.config.styles ?? "").toLowerCase();
    if (t === "flip" || t === "digital" || t === "analog")
      return t;
    const e = this.widgetName.toLowerCase();
    return e.includes("flip") ? "flip" : e.includes("analog") ? "analog" : (e.includes("digital"), "digital");
  }
  showSeconds() {
    return !!this.config.showSeconds;
  }
  ledFont() {
    return !!this.config.ledFont;
  }
  blinkSeparator() {
    return !!this.config.blinkSeparator;
  }
  getTickRotation(t) {
    return `rotate(${t * 6})`;
  }
  getDigitTransform(t) {
    return `rotate(${t * 30}) translate(0 -55) rotate(${-t * 30})`;
  }
  firstFlipPair() {
    return [0, 1];
  }
  secondFlipPair() {
    return [2, 3];
  }
  thirdFlipPair() {
    return [4, 5];
  }
  cacheDomRefs() {
    this.digitalHourEl = this.ctx.mount.querySelector("[data-clock-hour]"), this.digitalMinuteEl = this.ctx.mount.querySelector("[data-clock-minute]"), this.digitalSecondEl = this.ctx.mount.querySelector("[data-clock-second]"), this.analogHourEl = this.ctx.mount.querySelector("[data-analog-hour]"), this.analogMinuteEl = this.ctx.mount.querySelector("[data-analog-minute]"), this.analogMarkerEl = this.ctx.mount.querySelector("[data-analog-marker]"), this.analogTickEls = Array.from(this.ctx.mount.querySelectorAll("[data-analog-tick]")), this.flipDigitEls = Array.from(this.ctx.mount.querySelectorAll("[data-flip-index]"));
  }
  scheduleNextTick() {
    if (this.stopClock(), this.isAnalog()) {
      const e = () => {
        const i = /* @__PURE__ */ new Date();
        this.analogMarkerRotation = (i.getSeconds() + i.getMilliseconds() / 1e3) * 6, this.applyTimeToDom(this.getTimeForDate(i), !1), this.clockTimerId = setTimeout(e, r.ANALOG_REFRESH_MS);
      };
      e();
      return;
    }
    const t = () => {
      const e = Date.now(), i = this.isFlip() ? r.FLIP_DURATION_MS : 0;
      let n = 1e3 - e % 1e3 - i;
      n <= 0 && (n += 1e3), this.clockTimerId = setTimeout(() => {
        const o = Date.now(), a = this.isFlip() ? o + r.FLIP_DURATION_MS : o;
        this.applyTimeToDom(this.getTimeForDate(new Date(a)), !1), t();
      }, n);
    };
    t();
  }
  stopClock() {
    this.clockTimerId && (clearTimeout(this.clockTimerId), this.clockTimerId = null);
    for (const t of this.flipTimeouts.values())
      clearTimeout(t);
    this.flipTimeouts.clear();
  }
  applyTimeToDom(t, e) {
    this.applyDigital(t), this.applyAnalog(t), this.applyFlip(t, e);
  }
  applyDigital(t) {
    !this.digitalHourEl || !this.digitalMinuteEl || (this.digitalHourEl.textContent = t.h, this.digitalMinuteEl.textContent = t.m, this.digitalSecondEl && (this.digitalSecondEl.textContent = t.s));
  }
  applyAnalog(t) {
    if (!this.analogHourEl || !this.analogMinuteEl) return;
    const e = this.getAnalogHourRotation(t), i = this.getAnalogMinuteRotation(t);
    if (this.analogHourEl.setAttribute("transform", `rotate(${e})`), this.analogMinuteEl.setAttribute("transform", `rotate(${i})`), this.analogMarkerEl && this.analogMarkerEl.setAttribute("transform", `rotate(${this.analogMarkerRotation - 3} 0 0)`), this.showSeconds())
      for (let n = 0; n < this.analogTickEls.length; n += 1) {
        const o = this.analogTickEls[n], a = this.getAnalogTickDistance(n);
        o.setAttribute("data-active", a >= 0 ? String(a) : "");
      }
    else
      for (const n of this.analogTickEls)
        n.setAttribute("data-active", "");
  }
  applyFlip(t, e) {
    if (!this.flipDigitEls.length) return;
    const i = `${t.h}${t.m}${t.s}`.split("");
    for (let n = 0; n < this.flipDigitEls.length; n += 1) {
      const o = this.flipDigitEls[n], a = this.flipDigits[n] ?? { current: "0", next: "0", flipping: !1 }, c = i[n] ?? "0", l = this.flipTimeouts.get(n);
      if (l && (clearTimeout(l), this.flipTimeouts.delete(n)), e || a.current === c) {
        a.current = c, a.next = c, a.flipping = !1, this.flipDigits[n] = a, this.renderFlipDigit(n, o);
        continue;
      }
      a.next = c, a.flipping = !0, this.flipDigits[n] = a, this.renderFlipDigit(n, o);
      const k = setTimeout(() => {
        const d = this.flipDigits[n];
        d && (d.current = d.next, d.flipping = !1, this.flipDigits[n] = d, this.renderFlipDigit(n, o), this.flipTimeouts.delete(n));
      }, r.FLIP_DURATION_MS);
      this.flipTimeouts.set(n, k);
    }
  }
  renderFlipDigit(t, e) {
    const i = this.flipDigits[t];
    if (!i) return;
    e.classList.toggle("flipping", i.flipping);
    const n = e.querySelector(".digit-full"), o = e.querySelector(".digit-static.top .value"), a = e.querySelector(".digit-static.bottom .value"), c = e.querySelector(".digit-flip.top .value"), l = e.querySelector(".digit-flip.bottom .value");
    n && (n.textContent = i.current), o && (o.textContent = i.flipping ? i.next : i.current), a && (a.textContent = i.current), c && (c.textContent = i.current), l && (l.textContent = i.next);
  }
  getAnalogHourRotation(t) {
    const e = Number(t.h) % 12, i = Number(t.m);
    return (e + i / 60) * 30;
  }
  getAnalogMinuteRotation(t) {
    const e = Number(t.m), i = Number(t.s);
    return (e + i / 60) * 6;
  }
  getAnalogTickDistance(t) {
    const e = (Math.round(this.analogMarkerRotation / 6) % 60 + 60) % 60;
    if (!Number.isFinite(e)) return -1;
    const i = (e - t + 60) % 60;
    return i <= 4 ? i : -1;
  }
  getCurrentTime() {
    return this.getTimeForDate(/* @__PURE__ */ new Date());
  }
  getTimeForDate(t) {
    const e = this.config.use24Hour === void 0 ? !0 : !!this.config.use24Hour;
    let i = t.getHours();
    return e || (i = i % 12 || 12), {
      h: String(i).padStart(2, "0"),
      m: String(t.getMinutes()).padStart(2, "0"),
      s: String(t.getSeconds()).padStart(2, "0")
    };
  }
  createFlipDigits(t) {
    return `${t.h}${t.m}${t.s}`.split("").map((e) => ({
      current: e,
      next: e,
      flipping: !1
    }));
  }
  extractConfig(t) {
    const e = t?.config;
    return !e || typeof e != "object" || Array.isArray(e) ? {} : e;
  }
  extractWidgetName(t) {
    const e = t?.name;
    return typeof e == "string" ? e : "";
  }
}, r.FLIP_DURATION_MS = 180, r.ANALOG_REFRESH_MS = 50, r);
const H = `<div class="clock">
  {{#if isAnalog()}}
    <div class="analog-wrapper">
      <svg class="analog-clock" viewBox="-60 -60 120 120" aria-label="Analog clock">
        <circle class="dial" cx="0" cy="0" r="46"></circle>
        <g class="second-ticks">
          {{#each analogTicks}}
            <line
              class="tick"
              data-analog-tick="true"
              data-active="{{ showSeconds() ? getAnalogTickDistance(this) : '' }}"
              x1="0"
              y1="-38"
              x2="0"
              y2="-42"
              transform="{{ getTickRotation(this) }}">
            </line>
          {{/each}}
        </g>
        <g class="hour-labels">
          {{#each analogDigits}}
            <text
              class="digit"
              x="0"
              y="0"
              text-anchor="middle"
              dominant-baseline="middle"
              transform="{{ getDigitTransform(this) }}">
              {{ this }}
            </text>
          {{/each}}
        </g>
        <g class="hands">
          <line class="hand hour" data-analog-hour="true" x1="0" y1="5" x2="0" y2="-17"></line>
          <line class="hand minute" data-analog-minute="true" x1="0" y1="8" x2="0" y2="-26"></line>
        </g>
        {{#if showSeconds()}}
          <g class="seconds-marker" data-analog-marker="true">
            <path d="M -3 -31 L 3 -31 L 0 -36 Z"></path>
          </g>
        {{/if}}
        <circle class="pivot" cx="0" cy="0" r="2.4"></circle>
      </svg>
    </div>
  {{/if}}

  {{#if isDigital()}}
    <div class="digital-clock">
      {{#if ledFont()}}
        <div class="background">
          <div class="digits led">88</div>
          <div class="separator led">:</div>
          <div class="digits led">88</div>
          {{#if showSeconds()}}
            <div class="separator led">:</div>
            <div class="digits led">88</div>
          {{/if}}
        </div>
      {{/if}}

      <div class="digits{{ ledFont() ? ' led' : '' }}" data-clock-hour="true">00</div>
      <div class="separator{{ ledFont() ? ' led' : '' }}{{ blinkSeparator() ? ' blink' : '' }}">:</div>
      <div class="digits{{ ledFont() ? ' led' : '' }}" data-clock-minute="true">00</div>
      {{#if showSeconds()}}
        <div class="separator{{ ledFont() ? ' led' : '' }}{{ blinkSeparator() ? ' blink' : '' }}">:</div>
        <div class="digits{{ ledFont() ? ' led' : '' }}" data-clock-second="true">00</div>
      {{/if}}
    </div>
  {{/if}}

  {{#if isFlip()}}
    <div class="flipclock">
      <div class="digit-group">
        {{#each firstFlipPair()}}
          <div class="digit" data-flip-index="{{ this }}">
            <span class="digit-full">0</span>
            <span class="digit-static top"><span class="value">0</span></span>
            <span class="digit-static bottom"><span class="value">0</span></span>
            <span class="digit-flip top"><span class="value">0</span></span>
            <span class="digit-flip bottom"><span class="value">0</span></span>
          </div>
        {{/each}}
      </div>
      <div class="separator{{ blinkSeparator() ? ' blink' : '' }}">:</div>
      <div class="digit-group">
        {{#each secondFlipPair()}}
          <div class="digit" data-flip-index="{{ this }}">
            <span class="digit-full">0</span>
            <span class="digit-static top"><span class="value">0</span></span>
            <span class="digit-static bottom"><span class="value">0</span></span>
            <span class="digit-flip top"><span class="value">0</span></span>
            <span class="digit-flip bottom"><span class="value">0</span></span>
          </div>
        {{/each}}
      </div>
      {{#if showSeconds()}}
        <div class="separator{{ blinkSeparator() ? ' blink' : '' }}">:</div>
        <div class="digit-group">
          {{#each thirdFlipPair()}}
            <div class="digit" data-flip-index="{{ this }}">
              <span class="digit-full">0</span>
              <span class="digit-static top"><span class="value">0</span></span>
              <span class="digit-static bottom"><span class="value">0</span></span>
              <span class="digit-flip top"><span class="value">0</span></span>
              <span class="digit-flip bottom"><span class="value">0</span></span>
            </div>
          {{/each}}
        </div>
      {{/if}}
    </div>
  {{/if}}
</div>
`, U = '.clock{width:100%;height:100%}.clock .blink{animation:blink .75s ease-out infinite alternate}.clock .analog-wrapper{--clock-size: min(var(--host-width, 200px), var(--host-height, 200px));--clock-padding: calc(var(--clock-size) / 15);width:100%;height:100%;display:flex;justify-content:center;align-items:center}.clock .analog-clock{width:calc(var(--clock-size) - var(--clock-padding) * 2);height:calc(var(--clock-size) - var(--clock-padding) * 2);overflow:visible;color:#ffffffe0}.clock .analog-clock .dial{fill:transparent;stroke:#ffffffad;stroke-width:1.2px}.clock .analog-clock .second-ticks .tick{stroke:#ffffff4d;stroke-width:.8px;stroke-linecap:round;opacity:1;transition:stroke 1s linear,stroke-width 1s linear,opacity 1s linear}.clock .analog-clock .second-ticks .tick[data-active="0"]{stroke:#fffffff2;stroke-width:1.8px;opacity:1}.clock .analog-clock .second-ticks .tick[data-active="1"]{stroke:#fffc;stroke-width:1.5px;opacity:.82}.clock .analog-clock .second-ticks .tick[data-active="2"]{stroke:#ffffff9e;stroke-width:1.25px;opacity:.64}.clock .analog-clock .second-ticks .tick[data-active="3"]{stroke:#ffffff7a;stroke-width:1.05px;opacity:.5}.clock .analog-clock .second-ticks .tick[data-active="4"]{stroke:#ffffff70;stroke-width:.9px;opacity:.7}.clock .analog-clock .hour-labels .digit{fill:currentColor;font-size:.53rem;font-weight:500;font-family:sans-serif}.clock .analog-clock .hands .hand{stroke-linecap:round}.clock .analog-clock .hands .hour{stroke:#ffffff94;stroke-width:2.4px}.clock .analog-clock .hands .minute{stroke:#ffffffe0;stroke-width:1.35px}.clock .analog-clock .seconds-marker path{fill:#fffffff5}.clock .analog-clock .pivot{fill:var(--color-primary);stroke:#fff;stroke-width:1.2px}.clock .digital-clock{width:100%;height:100%;display:flex;justify-content:center;align-items:center;font-size:calc(var(--host-width, 200px) / 5);position:relative}.clock .digital-clock .separator{display:flex;align-items:center;transform:translateY(-.1em)}.clock .digital-clock .separator.led{transform:translateY(-15%)}.clock .digital-clock .digits{font-variant-numeric:tabular-nums lining-nums}.clock .digital-clock .digits.led{font-family:digi-mono,monospace,sans-serif}.clock .digital-clock .background{display:flex;position:absolute;opacity:.2}.clock .flipclock{--clock-size: calc(var(--host-width, 200px) / 24);--digit-width: calc(var(--clock-size) * 3);--digit-height: calc(var(--clock-size) * 4.2);--digit-font-size: calc(var(--clock-size) * 3);--digit-radius: calc(var(--clock-size) * .4);--flip-duration: .25s;display:flex;align-items:center;justify-content:center;gap:calc(var(--clock-size) * .65);width:100%;height:100%}.clock .flipclock .digit-group{display:flex;gap:calc(var(--clock-size) * .3)}.clock .flipclock .separator{color:#eee;font-size:calc(var(--clock-size) * 2.4);font-weight:700;line-height:1;text-shadow:0 calc(var(--clock-size) * .05) calc(var(--clock-size) * .12) #333}.clock .flipclock .digit{position:relative;width:var(--digit-width);height:var(--digit-height);perspective:calc(var(--clock-size) * 28);border-radius:var(--digit-radius);box-shadow:0 calc(var(--clock-size) * .15) calc(var(--clock-size) * .45) #111}.clock .flipclock .digit .digit-full{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#eee;font-size:var(--digit-font-size);font-weight:700;line-height:1;text-shadow:0 calc(var(--clock-size) * .05) calc(var(--clock-size) * .12) #333;z-index:2}.clock .flipclock .digit:after{content:"";position:absolute;left:0;top:50%;width:100%;height:calc(var(--clock-size) * .08);transform:translateY(calc(var(--clock-size) * -.04));background:#000;z-index:4}.clock .flipclock .digit-static,.clock .flipclock .digit-flip{position:absolute;left:0;width:100%;height:50%;overflow:hidden;backface-visibility:hidden;z-index:1}.clock .flipclock .digit-static .value,.clock .flipclock .digit-flip .value{position:absolute;left:50%;width:100%;height:var(--digit-height);display:block;color:#eee;font-size:var(--digit-font-size);font-weight:700;line-height:var(--digit-height);text-align:center;transform:translate(-50%);text-shadow:0 calc(var(--clock-size) * .05) calc(var(--clock-size) * .12) #333}.clock .flipclock .digit-static.top,.clock .flipclock .digit-flip.top{top:0;background:#181818;border-top:1px solid black;border-radius:var(--digit-radius) var(--digit-radius) 0 0;box-shadow:inset 0 calc(var(--clock-size) * .5) calc(var(--clock-size) * 1.2) #111}.clock .flipclock .digit-static.top .value,.clock .flipclock .digit-flip.top .value{top:0}.clock .flipclock .digit-static.bottom,.clock .flipclock .digit-flip.bottom{bottom:0;background:#2a2a2a;border-bottom:1px solid #444444;border-radius:0 0 var(--digit-radius) var(--digit-radius);box-shadow:inset 0 calc(var(--clock-size) * .5) calc(var(--clock-size) * 1.2) #202020}.clock .flipclock .digit-static.bottom .value,.clock .flipclock .digit-flip.bottom .value{top:calc(var(--digit-height) * -.5)}.clock .flipclock .digit-static .value{opacity:0}.clock .flipclock .digit-flip{opacity:0;pointer-events:none;z-index:3}.clock .flipclock .digit-flip.top{transform-origin:50% 100%;transform:rotateX(0)}.clock .flipclock .digit-flip.bottom{display:none}.clock .flipclock .digit.flipping .digit-flip.top{opacity:1;animation:flipTop var(--flip-duration) ease-out forwards}@keyframes flipTop{0%{transform:rotateX(0)}to{transform:rotateX(-90deg)}}@keyframes blink{0%{opacity:1}49%{opacity:1}50%{opacity:0}to{opacity:0}}.text-shadows .analog-clock{filter:drop-shadow(1px 1px .25em rgba(0,0,0,.5))}', D = O($, { template: H, styles: U }), P = D, B = { DisplayDuckWidget: D, Widget: P };
export {
  D as DisplayDuckWidget,
  P as Widget,
  B as default
};
