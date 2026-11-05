/** 标签页内仅保存三个布尔量；不记录位置、身份或长期观看历史。 */
export type MediaSession = { started: boolean; stopped: boolean; ended: boolean };
const memory = new Map<string, MediaSession>();
const key = 'one-g-content-playback-v1';
export function readMediaSession(id: string): MediaSession {
  if (!memory.has(id)) {
    let value: Partial<MediaSession> = {};
    try { value = JSON.parse(sessionStorage.getItem(key) || '{}')[id] || {}; } catch { /* 隐私模式降级到本模块内存。 */ }
    memory.set(id, { started: value.started === true, stopped: value.stopped === true, ended: value.ended === true });
  }
  return memory.get(id)!;
}
export function writeMediaSession(id: string, patch: Partial<MediaSession>) {
  memory.set(id, { ...readMediaSession(id), ...patch });
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || '{}');
    saved[id] = memory.get(id);
    sessionStorage.setItem(key, JSON.stringify(saved));
  } catch { /* 内存状态继续有效。 */ }
}
type Player = { root: HTMLElement; visible: number; requested: boolean; manual: boolean; pause: () => void; auto: () => void };
const players = new Set<Player>();
let owner: Player | undefined;
let scheduled = false;
export function coordinateContentPlayers() {
  if (scheduled) return;
  scheduled = true;
  // 合并同一轮可见性回调，再比较候选；不建立持续帧循环。
  const schedule = typeof requestAnimationFrame === "function" ? requestAnimationFrame : queueMicrotask;
  schedule(() => {
    scheduled = false;
    if (document.hidden || owner) return;
    const candidate = [...players].filter(p => p.visible >= .5 && !p.requested && !p.root.closest('[hidden],[inert]')).sort((a,b) => b.visible-a.visible)[0];
    if (candidate) candidate.auto();
  });
}
export function registerContentPlayer(player: Player) {
  players.add(player);
  return () => { players.delete(player); if (owner === player) owner = undefined; coordinateContentPlayers(); };
}
export function claimContentPlayer(player: Player, manual: boolean) {
  if (!manual && owner && owner !== player) return false;
  if (owner && owner !== player) owner.pause();
  owner = player; player.manual = manual;
  return true;
}
export function releaseContentPlayer(player: Player) { if (owner === player) owner = undefined; coordinateContentPlayers(); }
export function pauseContentWithin(root: Element | null) {
  for (const player of players) if (root?.contains(player.root)) player.pause();
}
