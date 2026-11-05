"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Captions } from "lucide-react";
import { useLocale, translate } from "@/i18n/LocaleProvider";
import { claimContentPlayer, coordinateContentPlayers, pauseContentWithin, readMediaSession, registerContentPlayer, releaseContentPlayer, writeMediaSession } from "@/lib/content-playback";
import { attachVideoProgress } from "@/lib/video-progress";
import { applyUserVolume } from "@/lib/media-volume";
import ElasticSlider from "./ElasticSlider";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeLowIcon, VolumeOffIcon } from "@hugeicons/core-free-icons";
import BrandLoader from "./BrandLoader";
import styles from "./ContentVideo.module.css";

type Phase = 'idle' | 'requesting' | 'playing' | 'paused' | 'buffering' | 'ended' | 'blocked' | 'error';
type Props = { mediaId: string; src: string; poster?: string; label: string; width?: number; height?: number; className?: string; tracks?: readonly {src:string;srcLang:string;label:string;default?:boolean}[] };
export default function ContentVideo({ mediaId, src, poster, label, width, height, className, tracks = [] }: Props) {
  const root = useRef<HTMLDivElement>(null); const video = useRef<HTMLVideoElement>(null);
  const api = useRef<{play:(manual:boolean)=>void;pause:()=>void;toggle:()=>void} | null>(null);
  const [enhanced,setEnhanced] = useState(false); const [phase,setPhase] = useState<Phase>('idle');
  const progressInput = useRef<HTMLInputElement>(null); const timeLabel = useRef<HTMLSpanElement>(null);
  const progress = useRef<ReturnType<typeof attachVideoProgress> | null>(null);
  const onScreen = useRef(false);
  const [hasPosition,setHasPosition] = useState(false);
  const [progressDrag,setProgressDrag] = useState<string | null>(null);
  const progressKey = `${mediaId}:${src}`;
  const progressDragging = progressDrag === progressKey;
  const lastNonZeroVolume = useRef(1);
  const [volumeWritable,setVolumeWritable] = useState(true);
  const [volumeDragging,setVolumeDragging] = useState(false);
  const [reducedControls,setReducedControls] = useState(false);
  const surfaceGesture = useRef<{id:number;x:number;y:number;moved:boolean} | null>(null);
  const surfaceClick = useRef(false);
  const [volume,setVolume] = useState(1); const [muted,setMuted] = useState(true);
  const [fullscreenActive,setFullscreenActive] = useState(false);
  const [seeking,setSeeking] = useState(false); const [awake,setAwake] = useState(true);
  const [captions,setCaptions] = useState(false); const [nativeFullscreen,setNativeFullscreen] = useState(false);
  const { locale } = useLocale(); const en = locale === 'en';
  const text = (zh:string,english:string) => en ? english : zh;
  useEffect(() => {
    const el = video.current; const shell = root.current; if (!el || !shell) return;
    let live = true; let version = 0; let intent = false;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & {connection?: {saveData?:boolean}}).connection;
    const saved = readMediaSession(mediaId);
    const player = {root:shell, visible:0, requested:saved.started || saved.stopped || saved.ended, manual:false, pause:()=>pause(false), auto:()=>play(false)};
    const update = (next:Phase) => { if (live) setPhase(next); };
    const wake = () => {
      setAwake(true); clearTimeout(hide);
      hide = setTimeout(() => { if (!el.paused && !shell.contains(document.activeElement) && !el.seeking) setAwake(false); }, 2500);
    };
    const pause = (user:boolean) => {
      intent = false; version++;
      if (user) { player.requested = true; writeMediaSession(mediaId,{stopped:true}); }
      el.pause(); update(el.ended ? 'ended' : 'paused'); releaseContentPlayer(player); wake();
    };
    const play = (manual:boolean) => {
      if (!live) return;
      if (!manual) {
        const current = readMediaSession(mediaId);
        if(current.started || current.stopped || current.ended) {player.requested=true;coordinateContentPlayers();return;}
      }
      if (!claimContentPlayer(player,manual)) return;
      player.requested = true;
      if (!manual && (document.hidden || reduced.matches || connection?.saveData || shell.closest('[hidden],[inert]'))) { releaseContentPlayer(player); return; }
      if (!manual) el.muted = true;
      if (manual && el.ended) { el.currentTime = 0; writeMediaSession(mediaId,{ended:false}); }
      el.loop = false; intent = true; const request = ++version; update('requesting');
      const result = el.play();
      result?.then(() => { if (!live || request !== version || !intent) { if (!intent) el.pause(); } }).catch((error:DOMException) => {
        if (!live || request !== version) return;
        intent = false; releaseContentPlayer(player);
        update(error.name === 'NotAllowedError' || error.name === 'AbortError' ? 'blocked' : 'error'); wake();
      });
    };
    api.current = {play, pause:()=>pause(true), toggle:()=>{if(intent || !el.paused)pause(true);else play(true);}};
    const playing = () => {
      if (!intent) { el.pause(); return; }
      writeMediaSession(mediaId,{started:true, stopped:false, ended:false}); update('playing'); wake();
    };
    // pause 事件可在下一次 play 请求之后才派发，必须以媒体当前 paused 值排除旧事件。
    const paused = () => { if (!live || el.ended || !el.paused) return; metadata(); intent=false; version++; update('paused'); releaseContentPlayer(player); wake(); };
    const ended = () => { intent=false; version++; writeMediaSession(mediaId,{started:true,ended:true}); update('ended'); releaseContentPlayer(player); wake(); };
    const metadata = () => setHasPosition(el.currentTime > 0);
    const volumeChange = () => {if(el.volume>0)lastNonZeroVolume.current=el.volume;setVolume(el.volume);setMuted(el.muted);};
    const seekingStart = () => setSeeking(true); const seekingEnd = () => {setSeeking(false);metadata();};
    const waiting = () => {if(intent) update('buffering');};
    const error = () => { intent=false;version++;update('error');releaseContentPlayer(player);wake(); };
    const visibility = () => {if(document.hidden) pause(false);else coordinateContentPlayers();};
    const fullscreenChange = () => {setFullscreenActive(document.fullscreenElement===shell);progress.current?.setOnScreen(document.fullscreenElement===shell || onScreen.current);};
    document.addEventListener("fullscreenchange",fullscreenChange);
    shell.dataset.lowEffects=String(connection?.saveData===true);
    const nativeStart = () => setNativeFullscreen(true); const nativeEnd = () => setNativeFullscreen(false);
    const events = {playing, pause:paused, ended, loadedmetadata:metadata, durationchange:metadata, timeupdate:metadata, volumechange:volumeChange, seeking:seekingStart, seeked:seekingEnd, waiting, error, webkitbeginfullscreen:nativeStart, webkitendfullscreen:nativeEnd};
    for (const [name,handler] of Object.entries(events)) el.addEventListener(name,handler);
    const unregister = registerContentPlayer(player);
    const measure = (ratio:number) => {
      player.visible=ratio;
      onScreen.current = ratio > 0 && !shell.closest("[hidden],[inert]");
      progress.current?.setOnScreen(document.fullscreenElement===shell || onScreen.current);
      if ((ratio < .25 || shell.closest('[hidden],[inert]')) && document.fullscreenElement !== shell && !el.matches(':fullscreen') && !(el as HTMLVideoElement & {webkitDisplayingFullscreen?:boolean}).webkitDisplayingFullscreen) pause(false);
      coordinateContentPlayers();
    };
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry])=>measure(entry.intersectionRatio),{threshold:[0,.25,.5,.75,1],rootMargin:'-80px 0px 0px 0px'}) : null;
    observer?.observe(shell);
    const mutation = new MutationObserver(()=>{if(shell.closest('[hidden],[inert]')) pauseContentWithin(shell);});
    for(let parent:HTMLElement|null=shell.parentElement;parent;parent=parent.parentElement) mutation.observe(parent,{attributes:true,attributeFilter:['hidden','inert']});
    const motion = () => {setReducedControls(reduced.matches);if(reduced.matches && !player.manual) pause(false);};
    setReducedControls(reduced.matches);
    reduced.addEventListener('change',motion); document.addEventListener('visibilitychange',visibility);
    shell.addEventListener('pointermove',wake); shell.addEventListener('pointerdown',wake); shell.addEventListener('focusin',wake);
    el.muted=true;el.loop=false;el.playsInline=true;
    metadata();volumeChange();
    // 监听与协调均已安装后才移除原生控件；无 JS 时原生控件继续可用。
    el.controls=false;setEnhanced(true);
    return () => {live=false;intent=false;version++;el.pause();el.controls=true;api.current=null;clearTimeout(hide);observer?.disconnect();mutation.disconnect();unregister();reduced.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('fullscreenchange',fullscreenChange);shell.removeEventListener('pointermove',wake);shell.removeEventListener('pointerdown',wake);shell.removeEventListener('focusin',wake);for(const [name,handler] of Object.entries(events))el.removeEventListener(name,handler);};
  }, [mediaId,src]);
  const toggle = () => api.current?.toggle();
  const seek = (value:number) => progress.current?.seek(value);
  const changeVolume = (percent:number) => {
    const media=video.current;if(!media||!Number.isFinite(percent))return;
    if(!applyUserVolume(media,percent))setVolumeWritable(false);
    if(media.volume>0)lastNonZeroVolume.current=media.volume;
    setVolume(media.volume);setMuted(media.muted);
  };
  const toggleMute = () => {
    const media=video.current;if(!media)return;
    if(media.muted||media.volume===0){
      if(media.volume===0){try{media.volume=lastNonZeroVolume.current;}catch{setVolumeWritable(false);}}
      media.muted=false;
    }else media.muted=true;
  };
  const fullscreen = async () => {
    const shell=root.current;const el=video.current as (HTMLVideoElement & {webkitEnterFullscreen?:()=>void})|null;
    try {if(document.fullscreenElement) await document.exitFullscreen();else if(shell?.requestFullscreen) await shell.requestFullscreen();else el?.webkitEnterFullscreen?.();} catch {el?.webkitEnterFullscreen?.();}
  };
  const playing = phase==='playing'||phase==='buffering'||phase==='requesting';
  const softened = (phase==='paused' && hasPosition)||phase==='ended';
  const show = awake||phase!=='playing'||seeking||progressDragging||volumeDragging;
  useLayoutEffect(() => {
    const media=video.current;const input=progressInput.current;const label=timeLabel.current;
    if(!enhanced||!media||!input||!label)return;
    const controller=attachVideoProgress(media,input,label,()=>setProgressDrag(null));
    progress.current=controller;controller.setOnScreen(onScreen.current);
    return ()=>{controller.destroy();if(progress.current===controller)progress.current=null;};
  }, [enhanced,mediaId,src]);
  useLayoutEffect(()=>{progress.current?.setVisible(show);},[show]);
  return <div onPointerDownCapture={event=>{if(!event.isPrimary){surfaceGesture.current=null;surfaceClick.current=false;}}} ref={root} data-content-player data-media-id={mediaId} data-phase={phase} data-seeking={seeking} data-softened={softened&&!nativeFullscreen&&!captions} data-controls-visible={show} className={`${styles.root} ${className??''}`} tabIndex={0} aria-label={translate(label,locale)}
    onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key===' '||event.key==='k'){event.preventDefault();event.stopPropagation();toggle();}else if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();event.stopPropagation();seek((video.current?.currentTime ?? 0)+(event.key==='ArrowRight'?5:-5));}}}>
    <video ref={video} data-evidence-video controls playsInline muted loop={false} preload="metadata" poster={poster} src={src} width={width} height={height} aria-label={translate(label,locale)} className={styles.media}>
      {tracks.map(track=><track key={track.src} kind="subtitles" {...track}/>)}
      {text('当前浏览器无法播放此视频。','Your browser cannot play this video.')}
    </video>
    {enhanced && <>
      {!nativeFullscreen && <div className={styles.surface} data-media-surface aria-hidden="true"
        onPointerDown={event=>{
          surfaceClick.current=false;
          if(!event.isPrimary||event.button!==0||surfaceGesture.current){surfaceGesture.current=null;return;}
          surfaceGesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
        }}
        onPointerMove={event=>{const g=surfaceGesture.current;if(g&&g.id===event.pointerId&&Math.hypot(event.clientX-g.x,event.clientY-g.y)>8)g.moved=true;}}
        onPointerUp={event=>{const g=surfaceGesture.current;surfaceClick.current=!!g&&g.id===event.pointerId&&!g.moved;surfaceGesture.current=null;}}
        onPointerCancel={()=>{surfaceGesture.current=null;surfaceClick.current=false;}}
        onPointerLeave={()=>{if(surfaceGesture.current){surfaceGesture.current=null;surfaceClick.current=false;}}}
        onClick={()=>{const allowed=surfaceClick.current;surfaceClick.current=false;if(allowed&&phase!=='ended'&&phase!=='error')toggle();}}/>}
      <div className={styles.shade} aria-hidden="true"/>
      {(phase === "requesting" || phase === "buffering") && <div className={styles.buffering}><BrandLoader label="正在缓冲…"/></div>}
      {!playing && <button type="button" className={styles.center} onClick={()=>{if(phase==='error')video.current?.load();api.current?.play(true);}} aria-label={phase==='ended'?text('重播','Replay'):phase==='error'?text('重试加载','Retry video'):text('继续播放','Resume playback')}>
        {phase==='ended'||phase==='error'?<RotateCcw/>:<Play/>}
      </button>}
      {(phase==='error'||phase==='blocked')&&<p className={styles.status} role="status">{phase==='error'?text('视频暂时无法加载，请重试。','Video could not load. Please retry.'):text('点击播放','Select play to watch')}</p>}
      <div className={styles.controls} data-media-controls>
        <input ref={progressInput} className={styles.progress} type="range" min="0" max="1" step="any" defaultValue="0" aria-label={text('播放进度','Playback position')}
          onPointerDown={event=>{if(progress.current?.begin(event.pointerId))setProgressDrag(progressKey);}}
          onPointerUp={event=>progress.current?.finish(event.pointerId)}
          onPointerCancel={event=>progress.current?.finish(event.pointerId)}
          onLostPointerCapture={event=>progress.current?.finish(event.pointerId)}
          onBlur={()=>progress.current?.finish()}
          onKeyDown={event=>{const media=video.current;if(!media)return;const targets:Record<string,number>={ArrowLeft:media.currentTime-.1,ArrowDown:media.currentTime-.1,ArrowRight:media.currentTime+.1,ArrowUp:media.currentTime+.1,Home:0,End:media.duration};if(event.key in targets){event.preventDefault();event.stopPropagation();seek(targets[event.key]);}}}
          />

        <div className={styles.row}>
          <button type="button" onClick={toggle} aria-label={playing?text('暂停','Pause'):phase==='ended'?text('重播','Replay'):text('播放','Play')}>{playing?<Pause/>:phase==='ended'?<RotateCcw/>:<Play/>}</button>
          <span ref={timeLabel} className={styles.time}/>
          <span className={styles.spacer}/>
          <button type="button" data-media-control aria-label={muted||volume===0?text('取消静音','Unmute'):text('静音','Mute')} onClick={toggleMute}>{muted||volume===0?<VolumeX/>:<Volume2/>}</button>
          <ElasticSlider className={styles.volume} value={muted?0:volume*100} startingValue={0} maxValue={100}
            onChange={changeVolume} onChangeEnd={()=>setVolumeDragging(false)} onInteractionChange={setVolumeDragging}
            ariaLabel={volumeWritable?text('音量','Volume'):text('音量（请使用系统音量）','Volume (use system controls)')}
            formatValue={value=>`${Math.round(value)}%`} disabled={!volumeWritable} wheel={false} valuePosition="none"
            leftIcon={<HugeiconsIcon icon={muted||volume===0?VolumeOffIcon:VolumeLowIcon} size={20} strokeWidth={1.75}/>}
            thickness={3} activeThickness={reducedControls?3:7} growOnHover={!reducedControls} maxStretch={reducedControls?0:6}
            bounce={reducedControls?0:.35} restOpacity={1} trackColor="rgba(255,255,255,.4)" rangeColor="var(--accent,#3A73D9)" fillContentColor="#fff"/>

          {!!tracks.length&&<button type="button" aria-label={text('字幕','Captions')} aria-pressed={captions} onClick={()=>{const next=!captions;setCaptions(next);const media=video.current;if(media)Array.from(media.textTracks).forEach(track=>{track.mode=next?'showing':'disabled';});}}><Captions/></button>}
          <button type="button" onClick={fullscreen} aria-label={fullscreenActive?text('退出全屏','Exit fullscreen'):text('全屏','Fullscreen')}><Maximize/></button>
        </div>
      </div>
    </>}
  </div>;
}
