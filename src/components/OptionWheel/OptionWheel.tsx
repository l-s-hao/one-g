"use client";
// Adapted from React Bits OptionWheel TS-CSS (https://reactbits.dev/r/OptionWheel-TS-CSS.json), retrieved 2026-11-05.
// ONE-G 扩展：真实链接、受控 selectedIndex、静默 sync 与共享连续进度；不是官方原生 API。
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import type { CSSProperties } from "react";
import "./OptionWheel.css";
export type WheelItem = { id: string; label: string };
export type WheelSource = "click" | "keyboard" | "gesture" | "reading" | "sync";
export type WheelHandle = { sync: (index: number) => void; position: () => number; moveTo: (logical: number, source?: WheelSource) => void };
export interface OptionWheelProps {
  items: readonly WheelItem[];
  selectedIndex: number;
  onSelect: (index: number, source: WheelSource, position: number, target: number) => void;
  onPositionChange: (position: number, settled: boolean) => void;
  reducedMotion: boolean;
  side?: "left";
  spacing?: number;
  curve?: number;
  tilt?: number;
  smoothing?: number;
  loop?: boolean;
  managedWheel?: boolean;
  draggable?: boolean;
}
const OptionWheel = forwardRef<WheelHandle, OptionWheelProps>(function OptionWheel(props, ref) {
  const root = useRef<HTMLElement>(null);
  const state = useRef({ position: 0, target: 0, selected: 0, raf: 0, last: 0, row: 42, compact: false, height: 390, padding: 40, moved: false, drag: null as null | { y: number; start: number; id: number }, wheel: false });
  const latest = useRef(props);
  useEffect(() => { latest.current = props; });
  // 外部受控值仅静默恢复视觉；用户选择已先更新 selected，不会被父组件回传值重复启动。
  useEffect(() => {
    const s = state.current;
    if (s.selected === props.selectedIndex) return;
    s.position = s.target = s.selected = props.selectedIndex;
    root.current?.dispatchEvent(new Event("wheel-sync"));
  }, [props.selectedIndex]);
  useEffect(() => {
    const s = state.current;
    if (props.reducedMotion) s.position = s.target = s.selected;
    root.current?.dispatchEvent(new Event("wheel-sync"));
  }, [props.reducedMotion]);
  useImperativeHandle(ref, () => ({ position: () => state.current.position, sync: index => {
    const s = state.current; s.position = s.target = index; s.selected = ((Math.round(index)%latest.current.items.length)+latest.current.items.length)%latest.current.items.length;
    root.current?.dispatchEvent(new Event("wheel-sync"));
  }, moveTo: (logical, source = "reading") => { root.current?.dispatchEvent(new CustomEvent("wheel-target", {detail:{logical,source}})); } }), []);
  useEffect(() => {
    const el = root.current!; const s = state.current;
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>("a"));
    function paint(settled: boolean) {
      const cfg = latest.current; const tilt = cfg.reducedMotion ? 0 : (cfg.tilt ?? 6) * Math.PI / 180;
      const R = tilt ? s.row / tilt : 0;
      // 首尾项仍需落在真实目录区域内；不能让曲线后的点击框压进 Header 或正文。
      const low = R ? -R * Math.sin(Math.min(Math.PI/2,s.position*tilt)) : -s.position*s.row;
      const high = R ? R * Math.sin(Math.min(Math.PI/2,(links.length-1-s.position)*tilt)) : (links.length-1-s.position)*s.row;
      const shift = cfg.loop ? 0 : Math.max(s.padding-s.height/2-low, Math.min(0,s.height/2-s.padding-high));
      links.forEach((link, i) => {
        let d = i - s.position;
        if (cfg.loop) d = ((d + links.length/2) % links.length + links.length) % links.length - links.length/2;
        const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tilt));
        const x = R ? -R * (1 - Math.cos(angle)) * (cfg.curve ?? 1) : 0;
        const y = R ? R * Math.sin(angle) : d * s.row;
        if (s.compact) {
          // 手机采用可换行的紧凑目录；轻微弧线倾斜仍共享同一位置，不把整套桌面轮盘占位搬进首屏。
          link.style.transform = `translateY(${Math.sin(d*.1)*3}px) rotate(${cfg.reducedMotion?0:Math.max(-2,Math.min(2,d))}deg)`;
        } else link.style.transform = `translate(${x}px, calc(${y+shift}px - 50%)) rotate(${Math.max(-12,Math.min(12,angle * 180 / Math.PI))}deg)`;
        link.style.opacity = String(Math.max(.58, 1 - Math.abs(d) * .1));
        link.style.setProperty("--ow-p", String(Math.max(0, 1 - Math.abs(d))));
      });
      el.dataset.position = String(s.position);
      cfg.onPositionChange(s.position, settled);
    }
    function select(index: number, source: WheelSource) {
      const logical = index;
      index = latest.current.loop ? ((Math.round(index) % links.length)+links.length)%links.length : Math.max(0, Math.min(links.length - 1, index));
      if (index !== s.selected || source === "click" || source === "keyboard") { s.selected = index; latest.current.onSelect(index, source, s.position, logical); }
    }
    function frame(now: number) {
      const dt = Math.min((now - s.last) / 1000, .05); s.last = now;
      const cfg = latest.current;
      const k = cfg.reducedMotion ? 1 : 1 - Math.exp(-dt / (Math.max(cfg.smoothing ?? 200, 1) / 1000));
      s.position += (s.target - s.position) * k;
      let settled = Math.abs(s.target - s.position) < .006;
      if (settled) s.position = s.target;
      // 滚轮不用固定计时器猜停稳：唯一插值环收敛后吸附并提交 URL。
      if (settled && s.wheel) {
        s.wheel = false; s.target = Math.round(s.target); select(s.target, "gesture");
        settled = Math.abs(s.target - s.position) < .006;
      }
      paint(settled);
      s.raf = settled ? 0 : requestAnimationFrame(frame);
    }
    function start() { if (!s.raf) { s.last = performance.now(); s.raf = requestAnimationFrame(frame); } }
    function measure() { s.row = Math.max(1, parseFloat(getComputedStyle(el).fontSize) * (latest.current.spacing ?? 1.4), ...links.map(link => link.offsetHeight + 12));
      s.padding = Math.max(...links.map(link=>link.offsetHeight/2 + link.offsetWidth*.105)) + 12;
      s.compact = window.innerWidth <= 600;
      el.style.minHeight = s.compact ? "0px" : `${Math.ceil((links.length-1)*s.row+2*s.padding)}px`;
      s.height = el.clientHeight; paint(!s.raf); }
    function sync() { const drag=s.drag;s.drag=null;s.moved=false;if(drag&&el.hasPointerCapture(drag.id))el.releasePointerCapture(drag.id); if (s.raf) cancelAnimationFrame(s.raf); s.raf = 0; s.wheel = false; paint(true); }
    function wheel(e: WheelEvent) {
      if (latest.current.managedWheel) return;
      if (e.ctrlKey || e.deltaY === 0) return;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      if ((s.target <= 0 && delta < 0) || (s.target >= links.length - 1 && delta > 0)) return;
      e.preventDefault();
      s.target = Math.max(0, Math.min(links.length - 1, s.target + Math.max(-1, Math.min(1, delta / s.row))));
      select(Math.round(s.target), "gesture"); s.wheel = true; start();
    }
    function down(e: PointerEvent) { if (e.button !== 0 || latest.current.draggable === false) return; s.moved = false; s.drag = { y: e.clientY, start: s.position, id: e.pointerId }; }
    function move(e: PointerEvent) {
      const d = s.drag; if (!d) return;
      if (Math.abs(e.clientY - d.y) > 5 && !s.moved) { s.moved = true; el.setPointerCapture(d.id); }
      if (!s.moved) return;
      const target = d.start - (e.clientY - d.y) / s.row;
      s.target = latest.current.loop ? target : Math.max(0, Math.min(links.length - 1, target));
      select(Math.round(s.target), "gesture"); start();
    }
    function end() {
      const d = s.drag; if (!d) return;
      if (el.hasPointerCapture(d.id)) el.releasePointerCapture(d.id);
      s.drag = null;
      if (s.moved) { s.target = Math.round(s.target); select(s.target, "gesture"); start(); }
    }
    function click(e: MouseEvent) {
      const link = (e.target as Element).closest("a"); if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (s.moved) { e.preventDefault(); s.moved = false; return; }
      e.preventDefault(); const i = links.indexOf(link);
      const current = ((Math.round(s.position)%links.length)+links.length)%links.length;
      let delta = i-current; if(latest.current.loop && Math.abs(delta)>links.length/2) delta -= Math.sign(delta)*links.length;
      s.target = latest.current.loop ? Math.round(s.position)+delta : i; select(s.target, "click"); start();
    }
    function key(e: KeyboardEvent) {
      s.moved = false;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault(); const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
      s.target = e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : latest.current.loop ? Math.round(s.target)+d : Math.max(0, Math.min(links.length - 1, Math.round(s.target) + d));
      if(latest.current.loop && (e.key==='Home'||e.key==='End')){const requested=e.key==='Home'?0:links.length-1;const current=((Math.round(s.position)%links.length)+links.length)%links.length;let delta=requested-current;if(Math.abs(delta)>links.length/2)delta-=Math.sign(delta)*links.length;s.target=Math.round(s.position)+delta;}
      select(s.target, "keyboard"); links[((s.target%links.length)+links.length)%links.length]?.focus({preventScroll:true}); start();
    }
    function command(event: Event) {
      const {logical,source} = (event as CustomEvent<{logical:number;source:WheelSource}>).detail;
      s.target = logical; select(logical,source); start();
    }
    el.addEventListener("wheel-target",command);
    const resize = new ResizeObserver(measure); resize.observe(el); links.forEach(link => resize.observe(link)); measure();
    el.dataset.ready = "true";
    el.addEventListener('wheel', wheel, {passive:false}); el.addEventListener('pointerdown',down); el.addEventListener('pointermove',move); el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end); el.addEventListener('lostpointercapture',end); el.addEventListener('click',click); el.addEventListener('keydown',key); el.addEventListener('wheel-sync',sync);
    return () => {
      el.removeEventListener("wheel-target",command);
      if (s.raf) cancelAnimationFrame(s.raf); s.raf = 0; resize.disconnect();
      if (s.drag && el.hasPointerCapture(s.drag.id)) el.releasePointerCapture(s.drag.id); s.drag = null;
      el.removeEventListener('wheel',wheel); el.removeEventListener('pointerdown',down); el.removeEventListener('pointermove',move); el.removeEventListener('pointerup',end); el.removeEventListener('pointercancel',end); el.removeEventListener('lostpointercapture',end); el.removeEventListener('click',click); el.removeEventListener('keydown',key); el.removeEventListener('wheel-sync',sync);
    };
  }, []);
  return <nav ref={root} className="about-option-wheel" aria-label="About" style={{'--ow-spacing':props.spacing ?? 1.4} as CSSProperties}>
    {props.items.map((item, index) => <a key={item.id} href={`#${item.id}`} aria-current={props.selectedIndex === index ? "location" : undefined}>{item.label}</a>)}
  </nav>;
});
export default OptionWheel;
