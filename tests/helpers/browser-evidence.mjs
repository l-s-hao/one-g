import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const conditions = new Set(['cold', 'warm', 'session-restored', 'production', 'unspecified', 'retention-probe']);
const redact = value => String(value)
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
  .replace(/\b\d{6}\b/g, '[code]')
  .replace(/Synthetic[-\w!]+|admin\d+/gi, '[test-secret]')
  .replace(/(^\s*(?:actual|expected):\s*).*$/gm, '$1[redacted]')
  .replace(/((?:password|token|cookie|authorization)\s*[:=]\s*)[^,\n]+/gi, '$1[redacted]');

/** 每次独占一个目录；latest 只作指针，原始日志始终追加，不复用上次失败的文件。仅用于虚构测试资料。 */
export function createBrowserEvidence({ name, condition = 'unspecified', artificial = false }) {
  if (!/^[a-z0-9-]+$/.test(name) || !conditions.has(condition)) throw new Error('Invalid evidence run classification');
  const root = path.resolve(process.env.ONE_G_EVIDENCE_ROOT || path.join(project, 'docs/reviews/browser-runs'));
  fs.mkdirSync(root, { recursive: true });
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${condition}-${crypto.randomUUID()}`;
  const dir = path.join(root, `${name}-${id}`);
  fs.mkdirSync(dir); // 不使用 recursive：即使发生碰撞也拒绝覆盖。
  const metadata = { id, name, condition, artificial, startedAt: new Date().toISOString(), result: 'running', command: ['node', path.relative(project, process.argv[1] || '')], node: process.version, platform: process.platform };
  metadata.productionBranch = process.env.ONE_G_PRODUCTION === '1';
  if (process.env.ONE_G_TEST_URL) {
    const target = new URL(process.env.ONE_G_TEST_URL);
    metadata.target = { origin: target.origin, pathname: target.pathname };
  }
  try {
    metadata.commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: project, encoding: 'utf8' }).trim();
    metadata.worktreeDiffSha256 = crypto.createHash('sha256').update(execFileSync('git', ['diff', '--binary'], { cwd: project })).digest('hex');
    const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src', 'tests', 'package.json', 'package-lock.json'], { cwd: project, encoding: 'utf8' }).trim().split('\n');
    const fingerprint = crypto.createHash('sha256');
    for (const file of [...new Set(files)].sort()) { fingerprint.update(file); fingerprint.update(fs.readFileSync(path.join(project, file))); }
    metadata.sourceSha256 = fingerprint.digest('hex');
  } catch { metadata.codeVersionUnavailable = true; }
  const writeMeta = () => fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify(metadata, null, 2));
  writeMeta();
  let finished = false;
  const log = message => { if (!finished) fs.appendFileSync(path.join(dir, 'output.log'), redact(message)); };
  const timeline = [];
  const record = (kind, data = {}) => {
    if (finished) return;
    const event = { at: new Date().toISOString(), kind, ...data };
    timeline.push(event);
    fs.appendFileSync(path.join(dir, 'timeline.jsonl'), JSON.stringify(event) + '\n');
  };
  const originals = new Map();
  for (const stream of [process.stdout, process.stderr]) {
    const original = stream.write.bind(stream); originals.set(stream, original);
    stream.write = (chunk, ...args) => { const safe = redact(chunk); log(safe); return original(safe, ...args); };
  }
  const finish = result => {
    if (finished) return;
    finished = true;
    metadata.result = result; metadata.finishedAt = new Date().toISOString(); writeMeta();
    fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(timeline, null, 2));
    for (const [stream, original] of originals) stream.write = original;
    const latest = path.join(root, `.latest-${id}.json`);
    fs.writeFileSync(latest, JSON.stringify({ id, name, condition, artificial, directory: path.basename(dir), result }, null, 2));
    fs.renameSync(latest, path.join(root, 'latest.json'));
  };
  const attach = async page => {
    metadata.browser = page.context().browser()?.version();
    metadata.viewport = page.viewportSize();
    writeMeta();
    await page.exposeBinding('recordBrowserEvidence', (_, data) => {
      if (data.kind === 'exit-click') record('exit-click');
      if (data.kind === 'session-cleared') record('session-cleared', { present: data.present === true });
    });
    await page.addInitScript(() => {
      document.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('button') : null;
        if (button && /退出登录|Log out/.test(button.textContent)) void window.recordBrowserEvidence({ kind: 'exit-click' });
      }, true);
      const remove = Storage.prototype.removeItem;
      Storage.prototype.removeItem = function(key) {
        const value = remove.call(this, key);
        if (key === 'one-g-auth-demo') void window.recordBrowserEvidence({ kind: 'session-cleared', present: this.getItem(key) !== null });
        return value;
      };
    });
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) record('navigation', { pathname: new URL(frame.url()).pathname });
    });
  };
  const fail = async (error, page) => {
    if (finished) return;
    log(`\n${error?.stack || error}\n`);
    record('failure', { type: error?.name || 'Error' });
    if (page && !page.isClosed()) {
      try {
        await page.screenshot({ path: path.join(dir, 'failure.png'), style: 'input,textarea{color:transparent!important;caret-color:transparent!important}', mask: [page.locator('[data-i18n-skip],[class*="demo"]'), page.locator('p').filter({ hasText: /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/ })] });
        metadata.failureScreenshot = 'failure.png';
      } catch { metadata.failureScreenshot = 'unavailable'; }
    }
    finish('failed');
  };
  return { dir, log, record, attach, finish, fail, safeError: error => redact(error?.stack || error) };
}
