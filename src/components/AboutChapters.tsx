"use client";

import { pauseContentWithin } from "@/lib/content-playback";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import OptionWheel, { type WheelHandle, type WheelSource } from "./OptionWheel/OptionWheel";
import { publishedAboutChapters as chapters, aboutChapterIndex, type AboutChapterId } from "@/data/about-chapters";
import { useLocale } from "@/i18n/LocaleProvider";
import { boundaryIntent, contentCanScroll, normalizeChapter, type BoundaryGesture } from "@/lib/about-chapter-input";
import styles from "./AboutChapters.module.css";
type Transition = { from: number; to: number; start: number; direction: number; rotation: number; y: number; opacity: number; incomingRotation: number; incomingY: number; incomingOpacity: number; end: number };
export default function AboutChapters({ contents }: { contents: Record<AboutChapterId, ReactNode> }) {
  const { locale } = useLocale();
  const root = useRef<HTMLDivElement>(null); const stage = useRef<HTMLDivElement>(null); const wheel = useRef<WheelHandle>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const model = useRef({ active: 0, reduced: false, transition: null as Transition | null, pendingHash: false, logical: 0, phase: "reading", settleUntil: 0, scrolls: [] as number[], focusAfter: false, gesture: {last:0,direction:0,amount:0,used:false} as BoundaryGesture });
  const [active, setActive] = useState(0); const [reduced, setReduced] = useState(false);
  const measure = useCallback(() => {
    // 只校验阅读位置；内容、字体和语言变化绝不反过来决定舞台外壳高度。
    nodes.current.forEach(node => { if (node && !node.hidden && !node.inert) node.scrollTop = Math.min(node.scrollTop, Math.max(0,node.scrollHeight-node.clientHeight)); });
  }, []);
  const writeHash = useCallback((index: number, replace = false) => {
    const next = `#${chapters[index].id}`;
    if (location.hash !== next) history[replace ? "replaceState" : "pushState"](history.state, "", `${location.pathname}${location.search}${next}`);
  }, []);
  const position = useCallback((value: number, settled: boolean) => {
    const s = model.current; const t = s.transition;
    if (t) {
      const distance = t.end - t.start;
      const p = s.reduced || Math.abs(distance) < .001 ? 1 : Math.max(0, Math.min(1, (value - t.start) / distance));
      const small = window.innerWidth < 600; const angle = small ? 5 : 10; const travel = small ? 32 : 72;
      for (const [index, incoming] of [[t.from, false], [t.to, true]] as const) {
        const node = nodes.current[index]; if (!node) continue;
        const rotation = incoming ? t.incomingRotation * (1-p) : t.rotation * (1-p) - t.direction * angle * p;
        const y = incoming ? t.incomingY * (1-p) : t.y * (1-p) - t.direction * travel * p;
        node.style.transform = `translateY(${y}px) rotate(${rotation}deg)`;
        node.style.opacity = String(incoming ? t.incomingOpacity + (1-t.incomingOpacity)*p : t.opacity*(1-p));
        node.dataset.rotation = String(rotation); node.dataset.y = String(y);
      }
      root.current?.setAttribute('data-progress', String(p));
      if (settled) {
        const old = nodes.current[t.from]; if (old && t.from !== t.to) { old.hidden = true; old.style.transform = ''; old.style.opacity = ''; }
        const current = nodes.current[t.to]; if (current) { current.inert = false; current.hidden = false; current.style.transform = ''; current.style.opacity = ''; current.dataset.rotation = '0'; current.dataset.y = '0'; }
        s.transition = null; root.current?.setAttribute('data-transitioning','false');
        s.phase = s.reduced ? "reading" : "settling"; s.settleUntil = performance.now() + (s.reduced ? 0 : 150);
        root.current?.setAttribute('data-phase',s.phase);root.current?.setAttribute('data-settle-until',String(s.settleUntil));
        if (s.focusAfter) { current?.focus({preventScroll:true}); s.focusAfter = false; }
        measure();
      }
    }
    if (settled && s.pendingHash) { s.pendingHash = false; writeHash(s.active, true); }
  }, [measure, writeHash]);
  const select = useCallback((requested: number, source: WheelSource, start: number, logicalTarget: number) => {
    const index=normalizeChapter(requested,chapters.length);
    const s = model.current; const previous = s.active;
    s.logical = logicalTarget;
    const scroller = nodes.current[previous]; if(scroller) s.scrolls[previous] = scroller.scrollTop;
    if (source === 'click' || source === 'keyboard') { writeHash(index); s.pendingHash = false; } else if (source === 'gesture' || source === 'reading') s.pendingHash = true;
    if (previous === index) return;
    if (s.reduced) {
      pauseContentWithin(nodes.current[previous]);
      s.active = index; setActive(index); nodes.current.forEach(node=>{if(node){node.hidden=false;node.inert=false;}});
      nodes.current[index]?.scrollIntoView({behavior:'instant',block:'start'}); return;
    }
    const old = nodes.current[previous]; const target = nodes.current[index]; if (!target) return;
    // 隐藏前先移走正文焦点；目录操作本身不抢焦点到正文。
    if (old?.contains(document.activeElement)) root.current?.querySelector<HTMLAnchorElement>('nav a[aria-current]')?.focus({preventScroll:true});
    // 快速换选保留当前可见层的实际视觉状态，不排队；其余层立即 inert/hidden，视频只暂停不重建。
    const rotation = Number(old?.dataset.rotation ?? 0); const y = Number(old?.dataset.y ?? 0); const opacity = Number(old?.style.opacity || 1);
    const direction = logicalTarget > start ? 1 : -1; const small = window.innerWidth < 600;
    const incomingRotation = !target.hidden ? Number(target.dataset.rotation ?? 0) : direction*(small?5:10);
    const incomingY = !target.hidden ? Number(target.dataset.y ?? 0) : direction*(small?32:72);
    const incomingOpacity = !target.hidden ? Number(target.style.opacity || 1) : .25;
    nodes.current.forEach((node, i) => { if (!node) return; node.hidden = i !== previous && i !== index; node.inert = i !== index; if (i !== index) pauseContentWithin(node); });
    target.hidden = false;
    // 自然向上衔接上一章末端；目录主动选择统一从开头阅读，不保存到任何持久存储。
    target.scrollTop = source === 'reading' && direction < 0 ? target.scrollHeight : 0;
    s.phase = "transitioning"; root.current?.setAttribute('data-phase',s.phase);
    s.active = index; s.transition = {from: previous, to:index, start, direction, rotation,y,opacity,incomingRotation,incomingY,incomingOpacity,end:logicalTarget};
    root.current?.setAttribute('data-transitioning','true'); setActive(index); measure(); position(start, s.reduced);
    // 目录可直接返回整屏区；不会锁定 body，尾部仍由页面原生滚动。
    if (source !== 'reading') {
      const bounds = stage.current?.getBoundingClientRect(); const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height')) || 80;
      if (bounds && bounds.top < header) window.scrollBy({top:bounds.top-header,behavior:'instant'});
    }
  }, [measure, position, writeHash]);
  useEffect(() => {
    const s = model.current;
    // 旧自动高度的内联值只在接管时移除；兼容开发热更新保留的旧ref，不在帧循环清样式。
    stage.current?.style.removeProperty('min-height');
    s.scrolls ??=[];s.gesture ??={last:0,direction:0,amount:0,used:false};s.logical ??=s.active;s.phase ??='reading';s.settleUntil ??=0;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const restore = () => {
      // 保留旧锚点映射，产品/方案返回与历史记录均静默恢复，不播放中间章节或产生新历史。
      const index = aboutChapterIndex(location.hash); if (index < 0 && location.hash) return;
      const next = Math.max(0,index);
      if (nodes.current.some((node,i)=>i!==next && node?.contains(document.activeElement))) root.current?.querySelector<HTMLAnchorElement>(`nav a[href="#${chapters[next].id}"]`)?.focus({preventScroll:true});
      s.active = next; s.logical = next; s.phase="reading"; s.transition = null; s.pendingHash = false;
      nodes.current.forEach((node, i) => { if (!node) return; node.hidden = !s.reduced && i !== next; node.inert = !s.reduced && i !== next; node.scrollTop = s.scrolls[i] ?? 0; node.style.transform=''; node.style.opacity=''; if(i!==next) pauseContentWithin(node); });
      setActive(next); wheel.current?.sync(next); root.current?.setAttribute('data-transitioning','false');root.current?.setAttribute('data-phase','reading'); measure();
      if(root.current)window.scrollTo({top:root.current.offsetTop-(document.querySelector('header')?.getBoundingClientRect().height??76),behavior:'instant'});
      const anchor=document.getElementById(location.hash.slice(1));const container=nodes.current[next];
      if(container && anchor && container.contains(anchor) && s.scrolls[next]===undefined && !s.reduced) container.scrollTop=anchor.getBoundingClientRect().top-container.getBoundingClientRect().top;
    };
    const preference = () => { s.reduced = media.matches; setReduced(media.matches); root.current?.setAttribute('data-reduced',String(media.matches)); if (media.matches) {s.logical=s.active;wheel.current?.sync(s.logical);} nodes.current.forEach((node,i)=>{if(node){node.hidden=!s.reduced&&i!==s.active;node.inert=!s.reduced&&i!==s.active;}}); if(media.matches){nodes.current[s.active]?.scrollIntoView({behavior:'instant',block:'start'});}else if(root.current){window.scrollTo({top:root.current.offsetTop-(document.querySelector('header')?.getBoundingClientRect().height??76),behavior:'instant'});} };
    root.current?.setAttribute('data-enhanced','true');root.current?.setAttribute('data-transitioning','false');root.current?.setAttribute('data-phase','reading'); preference(); restore();
    const el = root.current!;
    const header = document.querySelector<HTMLElement>('header');
    const size = () => { el.style.setProperty('--about-header',`${header?.getBoundingClientRect().height ?? 76}px`); measure(); };
    size();
    const blocked = (target: EventTarget | null) => {
      if (s.reduced || document.querySelector('dialog[open], header [aria-hidden="false"]')) return true;
      if (getComputedStyle(document.body).overflow === 'hidden') return true;
      return target instanceof Element && !!target.closest('[data-content-player],input,textarea,select,video,audio,[contenteditable="true"],[role="slider"]');
    };
    const consume = (delta: number, nav: boolean, kind: 'wheel'|'touch'|'key') => {
      const bounds = el.getBoundingClientRect(); const h = header?.getBoundingClientRect().height ?? 76;
      if (s.reduced || bounds.top < h-4) return false;
      const now = performance.now(); const g = s.gesture;
      const ready = boundaryIntent(g,delta,now) || kind==='key';
      if (s.phase==='settling' && now>=s.settleUntil) {s.phase='reading';el.dataset.phase='reading';}
      if (s.phase==='transitioning' || s.phase==='settling') {g.used=true;return true;}
      if(g.used)return true;
      const node = nodes.current[s.active]; if(!node)return false;
      if (!nav && contentCanScroll(node.scrollTop,node.scrollHeight,node.clientHeight,delta)) {
        g.amount=0;
        if(kind!=='touch') node.scrollTop+=delta;
        return kind!=='touch';
      }
      if(!ready) return true;
      const direction=Math.sign(delta);const next=s.active+direction;
      // 目录主动循环，正文在首尾释放给文档；不能把二者统一取模。
      if(!nav && (next<0 || next>=chapters.length)) {
        g.used=true;
        if(next>=chapters.length){s.phase='tail';el.dataset.phase='tail';}
        // 首次边界事件仍可能被浏览器锁定在内层：明确交接这一次位移，随后离区全部放行。
        window.scrollBy({top:delta,behavior:'instant'});return true;
      }
      g.used=true;wheel.current?.moveTo(Math.round(s.logical)+direction,nav?'gesture':'reading');return true;
    };
    const onWheel = (event: WheelEvent) => {
      if(event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || Math.abs(event.deltaX)>Math.abs(event.deltaY) || !event.deltaY || blocked(event.target))return;
      const target=event.target as Element;
      const delta=event.deltaY*(event.deltaMode===1?24:event.deltaMode===2?stage.current?.clientHeight??600:1);
      if(consume(delta,!!target.closest('.about-option-wheel'),'wheel'))event.preventDefault();
    };
    let touch: {x:number;y:number;nav:boolean;skip:boolean}|null=null;
    const touchStart=(event:TouchEvent)=>{if(event.touches.length!==1){touch=null;return;}const t=event.touches[0];touch={x:t.clientX,y:t.clientY,nav:!!(event.target as Element).closest('.about-option-wheel'),skip:blocked(event.target)||!!(event.target as Element).closest('.about-option-wheel')};s.gesture={last:0,direction:0,amount:0,used:false};};
    const touchMove=(event:TouchEvent)=>{
      if(!touch||touch.skip||event.touches.length!==1||event.defaultPrevented)return;
      const t=event.touches[0];const delta=touch.y-t.clientY;const dx=touch.x-t.clientX;touch.x=t.clientX;touch.y=t.clientY;
      if(Math.abs(dx)>Math.abs(delta)||!delta)return;
      if(consume(delta,touch.nav,'touch')&&event.cancelable)event.preventDefault();
    };
    const touchEnd=()=>{touch=null;};
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Tab'&&!s.reduced&&!blocked(event.target)&&!(event.target as Element).closest('nav')){
        const node=nodes.current[s.active];
        const controls=node?Array.from(node.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input,textarea,select,video[controls],[tabindex="0"]')).filter(n=>n.getClientRects().length&&!n.closest('[hidden],[inert]')):[];
        const edge=event.shiftKey?event.target===node:event.target===(controls.at(-1)??node);
        const target=s.active+(event.shiftKey?-1:1);
        if(edge&&target>=0&&target<chapters.length){event.preventDefault();s.focusAfter=true;wheel.current?.moveTo(s.logical+(event.shiftKey?-1:1),'reading');return;}
      }
      if(event.defaultPrevented||event.altKey||event.metaKey||event.ctrlKey||blocked(event.target)||(event.target as Element).closest('nav,button,a'))return;
      let delta=event.key==='ArrowDown'?40:event.key==='ArrowUp'?-40:event.key==='PageDown'||event.key===' '? (stage.current?.clientHeight??600)*.8:event.key==='PageUp'?-(stage.current?.clientHeight??600)*.8:0;
      if(event.key===' '&&event.shiftKey)delta=-delta;
      if(!delta)return;
      if(!event.repeat)s.gesture={last:0,direction:0,amount:0,used:false};
      if(consume(delta,false,'key'))event.preventDefault();
    };
    const onScroll=()=>{
      const outside=el.getBoundingClientRect().top<(header?.getBoundingClientRect().height??76)-4;
      if(outside && !s.reduced){
        if(s.phase!=='tail'){
          s.phase='tail';el.dataset.phase='tail';const last=chapters.length-1;
          if(s.active!==last){s.active=last;s.logical=last;setActive(last);writeHash(last,true);nodes.current.forEach((node,i)=>{if(node){node.hidden=i!==last;node.inert=i!==last;if(i!==last)pauseContentWithin(node);}});wheel.current?.sync(last);}
          const node=nodes.current[last];if(node)node.scrollTop=node.scrollHeight;
        }
      }else if(s.phase==='tail'){s.phase='reading';el.dataset.phase='reading';s.gesture={last:0,direction:0,amount:0,used:false};}
    };
    const release=()=>{wheel.current?.sync(s.logical);s.phase='reading';el.dataset.phase='reading';s.gesture={last:0,direction:0,amount:0,used:false};touch=null;};
    el.addEventListener('wheel',onWheel,{passive:false});el.addEventListener('touchstart',touchStart,{passive:true});el.addEventListener('touchmove',touchMove,{passive:false});el.addEventListener('touchend',touchEnd);el.addEventListener('touchcancel',touchEnd);el.addEventListener('keydown',onKey);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('blur',release);const visibility=()=>{if(document.visibilityState==='hidden')release();};document.addEventListener('visibilitychange',visibility);
    const observer = new ResizeObserver(measure); nodes.current.forEach(node=>node&&observer.observe(node));
    const headerObserver=new ResizeObserver(size);if(header)headerObserver.observe(header);
    // 外壳只使用稳定视口与实际Header尺寸；正文观察只校验边界，不改变外壳高度。
    document.fonts.ready.then(measure); media.addEventListener('change',preference); window.addEventListener('popstate',restore); window.addEventListener('hashchange',restore);
    return () => { el.removeEventListener('wheel',onWheel);el.removeEventListener('touchstart',touchStart);el.removeEventListener('touchmove',touchMove);el.removeEventListener('touchend',touchEnd);el.removeEventListener('touchcancel',touchEnd);el.removeEventListener('keydown',onKey);window.removeEventListener('scroll',onScroll);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',visibility);headerObserver.disconnect(); observer.disconnect(); media.removeEventListener('change',preference); window.removeEventListener('popstate',restore); window.removeEventListener('hashchange',restore); };
  }, [measure,writeHash]);
  return <div ref={root} className={styles.layout} data-active-chapter={chapters[active].id}>
    <aside className={styles.sidebar}><OptionWheel ref={wheel} items={chapters.map(c=>({id:c.id,label:locale==='en'?c.en:c.zh}))} selectedIndex={active} onSelect={select} onPositionChange={position} reducedMotion={reduced} side="left" spacing={1.4} curve={1} tilt={6} smoothing={95} loop managedWheel draggable /></aside>
    <div ref={stage} className={styles.stage} id="about-chapter-stage">
      {chapters.map((chapter, i)=><div className={styles.chapter} key={chapter.id} ref={node=>{nodes.current[i]=node;}} data-chapter={chapter.id} tabIndex={0} onScroll={event=>{if(!event.currentTarget.hidden&&!event.currentTarget.inert)model.current.scrolls[i]=event.currentTarget.scrollTop;}}>{contents[chapter.id]}</div>)}
    </div>
  </div>;
}
