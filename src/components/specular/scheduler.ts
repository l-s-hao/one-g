import { clamp, link, loopPosition, rimPoint, UNIFORMS, wrap } from "./shader";

// ONE-G adaptation: one reusable WebGL2 context, at most four local 2D outputs.
// No browser APIs run during module evaluation or React's first render.
export const SPECULAR = Object.freeze({ intensity: 1, idleIntensity: .35, shineSize: 10,
  shineFade: 34, thickness: 1.2, glow: 1, followMouse: true, proximity: 250, autoAnimate: false });
const BUDGET = 4;
const PAD = 24;
type Entry = { host: HTMLElement; edge: HTMLSpanElement; visible: boolean; spot: number; level: number;
  ready: boolean; canvas?: HTMLCanvasElement; output?: CanvasRenderingContext2D | null };
type Renderer = { canvas: HTMLCanvasElement; gl: WebGL2RenderingContext; program: WebGLProgram;
  buffer: WebGLBuffer | null; vao: WebGLVertexArrayObject | null; uniforms: Record<string, WebGLUniformLocation | null> };
const entries = new Set<Entry>();
let renderer: Renderer | null = null;
let failed = false;
let frameId = 0;
let last = 0;
let draws = 0;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let stop: (() => void) | undefined;
let pointer: { x: number; y: number } | null = null;
let reduced = false;

function clearOutput(entry: Entry) {
  entry.canvas?.remove(); entry.canvas = undefined; entry.output = undefined;
  entry.edge.removeAttribute("data-dynamic"); entry.ready = false;
}
function clearAll() { for (const entry of entries) clearOutput(entry); }
function dispose() {
  if (!renderer) return;
  const { gl, program, buffer, vao } = renderer;
  renderer = null;
  gl.deleteBuffer(buffer); gl.deleteVertexArray(vao); gl.deleteProgram(program);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
}
function createRenderer() {
  if (renderer || failed) return renderer;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true,
      antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true });
    if (!gl) { failed = true; return null; }
    const program = link(gl);
    if (!program) { gl.getExtension("WEBGL_lose_context")?.loseContext(); failed = true; return null; }
    const uniforms: Renderer["uniforms"] = {};
    for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);
    const buffer = gl.createBuffer(), vao = gl.createVertexArray();
    gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      if (renderer?.canvas !== canvas) return;
      failed = true; renderer = null;
      cancelAnimationFrame(frameId); frameId = 0; clearAll();
    });
    renderer = { canvas, gl, program, buffer, vao, uniforms };
  } catch { failed = true; clearAll(); }
  return renderer;
}
// Computed color properties resolve CSS variables before reaching the shader.
function rgb(color: string): number[] {
  const values = color.match(/[\d.]+/g)?.map(Number);
  return values && values.length >= 3 ? values.slice(0, 3).map(value => value / 255) : [1, 1, 1];
}
function allowed(entry: Entry) {
  return entry.visible && entry.host.isConnected && !entry.host.matches(":disabled,[aria-disabled=true],[aria-busy=true]")
    && !entry.host.closest("[hidden],[inert],[aria-hidden=true]")
    && entry.host.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
}
function draw(entry: Entry, rect: DOMRect, radius: number, line: number[], base: number[]) {
  const render = createRenderer();
  if (!render) return;
  if (!entry.canvas) {
    entry.canvas = document.createElement("canvas"); entry.canvas.setAttribute("aria-hidden", "true");
    entry.canvas.className = "specular-edge__canvas";
    entry.output = entry.canvas.getContext("2d");
    if (!entry.output) { failed = true; clearAll(); dispose(); return; }
    entry.edge.append(entry.canvas);
  }
  const { gl, canvas, program, uniforms: u, vao } = render;
  const width = entry.host.offsetWidth, height = entry.host.offsetHeight;
  if (!width || !height || !rect.width) return;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round((width + PAD * 2) * ratio), h = Math.round((height + PAD * 2) * ratio);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  if (entry.canvas.width !== w) entry.canvas.width = w;
  if (entry.canvas.height !== h) entry.canvas.height = h;
  const scaleX = w / (width + PAD * 2), scaleY = h / (height + PAD * 2);
  gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(program);
  gl.uniform2f(u.uCenter, (PAD + width / 2) * scaleX, (PAD + height / 2) * scaleY);
  gl.uniform2f(u.uHalf, width / 2 * scaleX, height / 2 * scaleY);
  gl.uniform1f(u.uRadius, radius * scaleX); gl.uniform1f(u.uPx, ratio);
  const [x, y] = rimPoint(entry.spot, width / 2, height / 2, radius);
  const pull = 1 - Math.min(.35 * height / 2, Math.hypot(x, y)) / Math.max(Math.hypot(x, y), .0001);
  gl.uniform1f(u.uSpot, entry.spot); gl.uniform2f(u.uEntry, x * pull * scaleX, y * pull * scaleY);
  gl.uniform3fv(u.uLineColor, line); gl.uniform3fv(u.uBaseColor, base);
  gl.uniform1f(u.uIntensity, SPECULAR.intensity * entry.level);
  gl.uniform2f(u.uWindow, SPECULAR.shineSize / 360, SPECULAR.shineFade / 360 + .0001);
  gl.uniform1f(u.uThickness, SPECULAR.thickness); gl.uniform1f(u.uGlow, SPECULAR.glow);
  gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.bindVertexArray(null);
  entry.output!.clearRect(0, 0, w, h); entry.output!.drawImage(canvas, 0, 0);
  entry.edge.dataset.dynamic = "true"; draws++;
}
function frame(now: number) {
  frameId = 0;
  if (document.hidden || reduced || failed) { clearAll(); return; }
  const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60; last = now;
  const candidates = [...entries].filter(allowed).map(entry => {
    const rect = entry.host.getBoundingClientRect();
    const distance = pointer ? Math.hypot(Math.max(rect.left - pointer.x, 0, pointer.x - rect.right),
      Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom)) : Infinity;
    const focused = entry.host.matches(":focus-visible");
    return { entry, rect, distance, focused };
  }).filter(item => item.focused || item.distance < SPECULAR.proximity || item.entry.canvas)
    .sort((a, b) => Number(b.focused) - Number(a.focused) || a.distance - b.distance).slice(0, BUDGET);
  const chosen = new Set(candidates.map(item => item.entry));
  for (const entry of entries) if (!chosen.has(entry)) clearOutput(entry);
  let settling = false, active = false;
  for (const { entry, rect, distance, focused } of candidates) {
    const width = entry.host.offsetWidth, height = entry.host.offsetHeight;
    const style = getComputedStyle(entry.host), edgeStyle = getComputedStyle(entry.edge);
    const radius = Math.min(parseFloat(style.borderTopLeftRadius) || 0, width / 2, height / 2);
    const inset = radius * (1 - Math.SQRT1_2);
    const rest = loopPosition(inset - width / 2, height / 2 - inset, width / 2, height / 2, radius);
    let spot = rest, near = focused ? 1 : 0;
    if (pointer && distance < SPECULAR.proximity) {
      const scale = rect.width / width || 1;
      const x = (pointer.x - rect.left - rect.width / 2) / scale;
      const y = (rect.top + rect.height / 2 - pointer.y) / scale;
      const t = clamp(1 - distance / SPECULAR.proximity, 0, 1);
      near = Math.max(near, t * t * (3 - 2 * t));
      const nearest = loopPosition(x, y, width / 2, height / 2, radius);
      const depth = clamp(Math.min(width / 2 - Math.abs(x), height / 2 - Math.abs(y)) / (height * .4), 0, 1);
      const sway = rest - x / (width / 2) * .06 - y / (height / 2) * .02;
      const offset = sway - nearest - Math.round(sway - nearest);
      spot = wrap(nearest + offset * depth * depth * (3 - 2 * depth));
    }
    const level = SPECULAR.idleIntensity + (1 - SPECULAR.idleIntensity) * near;
    if (!entry.ready) { entry.spot = rest; entry.level = SPECULAR.idleIntensity; entry.ready = true; }
    let diff = spot - entry.spot; diff -= Math.round(diff);
    entry.spot = wrap(entry.spot + diff * (1 - Math.exp(-dt * 8)));
    entry.level += (level - entry.level) * (1 - Math.exp(-dt * 7));
    settling ||= Math.abs(diff) > .0002 || Math.abs(level - entry.level) > .001;
    active ||= near > 0;
    try { draw(entry, rect, radius, rgb(edgeStyle.color), rgb(edgeStyle.borderTopColor)); }
    catch { failed = true; clearAll(); dispose(); break; }
  }
  if (settling && !failed) frameId = requestAnimationFrame(frame);
  else {
    last = 0;
    if (!active && !idleTimer) idleTimer = setTimeout(() => { idleTimer = undefined; clearAll(); }, 800);
  }
}
function wake() {
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = undefined; }
  if (!frameId && !document.hidden && !reduced && !failed) frameId = requestAnimationFrame(frame);
}
function start() {
  const media = matchMedia("(prefers-reduced-motion: reduce)"); reduced = media.matches;
  const move = (event: PointerEvent) => { if (event.pointerType !== "mouse") return; pointer = { x: event.clientX, y: event.clientY }; wake(); };
  const leave = () => { pointer = null; wake(); };
  const touch = (event: PointerEvent) => { if (event.pointerType !== "mouse") { pointer = null; clearAll(); } };
  const visibility = () => { pointer = null; cancelAnimationFrame(frameId); frameId = 0; last = 0; clearAll(); if (!document.hidden) wake(); };
  const motion = () => { reduced = media.matches; visibility(); };
  const intersection = new IntersectionObserver(items => {
    for (const item of items) for (const entry of entries) if (entry.host === item.target) {
      entry.visible = item.isIntersecting; if (!entry.visible) clearOutput(entry);
    }
    wake();
  });
  const resize = new ResizeObserver(wake);
  const mutation = new MutationObserver(wake);
  mutation.observe(document.documentElement, { subtree: true, attributes: true,
    attributeFilter: ["class", "hidden", "inert", "disabled", "aria-hidden", "aria-disabled", "aria-busy"] });
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", touch, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  document.addEventListener("focusin", wake); document.addEventListener("focusout", wake);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("blur", leave); window.addEventListener("scroll", wake, { passive: true, capture: true });
  media.addEventListener("change", motion);
  stop = () => {
    intersection.disconnect(); resize.disconnect(); mutation.disconnect();
    window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", touch);
    document.documentElement.removeEventListener("pointerleave", leave);
    document.removeEventListener("focusin", wake); document.removeEventListener("focusout", wake);
    document.removeEventListener("visibilitychange", visibility); window.removeEventListener("blur", leave);
    window.removeEventListener("scroll", wake, true); media.removeEventListener("change", motion);
    cancelAnimationFrame(frameId); frameId = 0; if (idleTimer) clearTimeout(idleTimer); idleTimer = undefined;
    pointer = null; last = 0; clearAll(); dispose(); failed = false; stop = undefined;
  };
  return { intersection, resize };
}
let observers: ReturnType<typeof start> | undefined;
export function registerEdge(edge: HTMLSpanElement) {
  const host = edge.parentElement;
  if (!host) return;
  if (!observers) observers = start();
  const entry: Entry = { host, edge, visible: false, spot: 0, level: SPECULAR.idleIntensity, ready: false };
  entries.add(entry); observers.intersection.observe(host); observers.resize.observe(host);
  return () => {
    observers?.intersection.unobserve(host); observers?.resize.unobserve(host);
    clearOutput(entry); entries.delete(entry);
    if (!entries.size) { stop?.(); observers = undefined; }
  };
}
/** Read-only diagnostics used by browser acceptance; no production polling. */
export function specularDiagnostics() {
  return { registered: entries.size, eligible: [...entries].filter(allowed).length, contexts: Number(!!renderer),
    outputs: [...entries].filter(entry => entry.canvas).length, budget: BUDGET, raf: !!frameId, draws, failed, reduced };
}
