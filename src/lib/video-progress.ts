/** 播放反馈只采样真实媒体时间；不推进媒体、不推算缓冲、不创建业务计时器。 */
export function progressFraction(currentTime: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return 0;
  return Math.min(1, Math.max(0, currentTime / duration));
}
const clock = (value: number) => Number.isFinite(value)
  ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}` : "–:––";

export function attachVideoProgress(video: HTMLVideoElement, input: HTMLInputElement, label: HTMLElement, onInteractionEnd?: () => void) {
  let live = true;
  let raf: number | null = null;
  let playing = !video.paused && !video.ended && video.readyState >= 3;
  let visible = true;
  let onScreen = true;
  let pointer: number | null = null;
  let awaitingSeek = false;

  const stop = () => {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  };
  // 唯一视觉写入点：原生滑块值、填充CSS变量和ARIA由同一浮点时间派生。
  // JSX不再写value/百分比，语言或主题重渲染不会拿旧React状态覆盖帧进度。
  const paint = (seconds = video.currentTime) => {
    if (!live) return;
    const duration = video.duration;
    const valid = Number.isFinite(duration) && duration > 0;
    const fraction = progressFraction(seconds, duration);
    const current = valid && Number.isFinite(seconds) ? Math.min(duration, Math.max(0, seconds)) : 0;
    input.max = String(valid ? duration : 1);
    const hasSeekableRange = Array.from({ length: video.seekable.length }, (_, i) => video.seekable.end(i) > video.seekable.start(i)).some(Boolean);
    input.disabled = !valid || !hasSeekableRange;
    input.value = String(current);
    input.style.setProperty("--progress", `${fraction * 100}%`);
    input.setAttribute("aria-valuenow", String(current));
    input.setAttribute("aria-valuemax", String(valid ? duration : 1));
    const text = `${clock(current)} / ${clock(valid ? duration : NaN)}`;
    if (input.getAttribute("aria-valuetext") !== text) input.setAttribute("aria-valuetext", text);
    if (label.textContent !== text) label.textContent = text;
  };
  const canRefresh = () => live && visible && onScreen && !document.hidden && playing
    && !video.paused && !video.ended && !video.seeking && pointer === null && !awaitingSeek;
  const frame = () => {
    raf = null;
    if (!canRefresh()) return;
    paint();
    raf = requestAnimationFrame(frame);
  };
  const refresh = () => {
    if (canRefresh()) {
      if (raf === null) raf = requestAnimationFrame(frame);
    } else stop();
  };
  const sync = () => {
    if (pointer === null && !awaitingSeek) paint();
    refresh();
  };
  const started = () => { playing = true; sync(); };
  const stopped = () => { playing = false; stop(); if (pointer === null) paint(); };
  const paused = () => {if(video.paused)stopped();};
  const seeking = () => { stop(); };
  const seeked = () => { awaitingSeek = false; sync(); };
  const timeupdate = () => { if (raf === null && visible && onScreen && pointer === null && !awaitingSeek) paint(); };
  const changed = () => { if (pointer === null && !awaitingSeek) paint(); refresh(); };
  const events = { playing: started, pause: paused, ended: stopped, waiting: stopped, error: stopped,
    emptied: stopped, seeking, seeked, timeupdate, loadedmetadata: changed, durationchange: changed, progress: changed };
  for (const [name, handler] of Object.entries(events)) video.addEventListener(name, handler);
  const visibility = () => { if (document.hidden) {stop();finish();} else sync(); };
  document.addEventListener("visibilitychange", visibility);

  const seek = (seconds: number) => {
    if (!live || !Number.isFinite(seconds) || !Number.isFinite(video.duration) || video.duration <= 0 || !video.seekable.length) return;
    const wanted = Math.min(video.duration, Math.max(0, seconds));
    for (let i = 0; i < video.seekable.length; i++) {
      if (wanted < video.seekable.start(i) || wanted > video.seekable.end(i)) continue;
      if (wanted === video.currentTime) {awaitingSeek = video.seeking;paint(wanted);refresh();return;}
      stop(); awaitingSeek = true;
      paint(wanted);
      // 保留既有逐次定位策略；此处从不play/pause，也不改静音或播放意图。
      video.currentTime = wanted;
      return;
    }
  };
  const begin = (id: number) => {
    if (input.disabled || pointer !== null) return false;
    pointer = id; stop();
    input.setPointerCapture(id);
    return true;
  };
  const finish = (idToFinish?: number) => {
    if (pointer === null || (idToFinish !== undefined && pointer !== idToFinish)) return;
    const id = pointer;
    pointer = null;
    onInteractionEnd?.();
    if (input.hasPointerCapture(id)) input.releasePointerCapture(id);
    // seeked尚未到达时保留最后预览；完成后读媒体真实位置，不用旧timeupdate回拉。
    if (!video.seeking) awaitingSeek = false;
    sync();
  };
  const inputChanged = () => seek(Number(input.value));
  input.addEventListener("input", inputChanged);
  paint(); refresh();
  return {
    seek, begin, finish, sync,
    setVisible(next: boolean) { visible = next; if (next) sync(); else stop(); },
    setOnScreen(next: boolean) { onScreen = next; if (next) sync(); else stop(); },
    destroy() {
      live = false; stop();
      input.removeEventListener("input", inputChanged);
      if (pointer !== null && input.hasPointerCapture(pointer)) input.releasePointerCapture(pointer);
      pointer = null;
      for (const [name, handler] of Object.entries(events)) video.removeEventListener(name, handler);
      document.removeEventListener("visibilitychange", visibility);
    }
  };
}
