import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';
import { watchRegistration } from './helpers/registration-lifecycle.mjs';

const library = await import(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const chromium = library.chromium || library.default?.chromium;
const production = process.env.ONE_G_PRODUCTION === '1';
const base = (process.env.ONE_G_TEST_URL || 'http://127.0.0.1:5558/one-g').replace(/\/$/, '');
const evidence = createBrowserEvidence({ name: 'registration-refresh', condition: process.env.ONE_G_RUN_CONDITION || (production ? 'production' : 'unspecified') });
const checks = [];
let browser, page, watcher;
const mark = name => { checks.push(name); evidence.record('check-passed', { name }); };
const fixture = () => ({ nickname: 'Fictional Refresh', email: `refresh-${crypto.randomUUID()}@example.test`, password: 'Synthetic-Refresh-Passphrase-7!', organization: 'Fictional Organization' });
const fill = async (p, values) => {
  await p.locator('#register-nickname').fill(values.nickname);
  await p.locator('#register-password').fill(values.password);
  await p.locator('#register-email').fill(values.email);
  await p.locator('#register-affiliation').selectOption('organization');
  await p.locator('#register-organization').fill(values.organization);
};
const noStoredDraft = async (p, values) => {
  const result = await p.evaluate(async values => {
    const stored = JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } });
    const privateValues = Object.values(values);
    let databaseCount = null, databaseContainsPersonalData = false;
    if (typeof indexedDB.databases === 'function') {
      const databases = await indexedDB.databases(); databaseCount = databases.length;
      for (const info of databases) {
        const db = await new Promise((resolve, reject) => { const request = indexedDB.open(info.name); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(new Error('Diagnostic database read failed')); request.onupgradeneeded = () => { request.transaction.abort(); }; });
        try {
          for (const name of db.objectStoreNames) {
            const records = await new Promise((resolve, reject) => { const request = db.transaction(name, 'readonly').objectStore(name).getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(new Error('Diagnostic store read failed')); });
            const serialized = JSON.stringify(records);
            if (privateValues.some(value => serialized.includes(value))) databaseContainsPersonalData = true;
          }
        } finally { db.close(); }
      }
    }
    return { personalDataStored: privateValues.some(value => stored.includes(value)), databaseCount, databaseContainsPersonalData };
  }, values);
  assert.equal(result.personalDataStored, false);
  assert.equal(result.databaseContainsPersonalData, false);
  evidence.record('storage-boundary', result);
};
const unchanged = async (p, expected) => {
  const after = await watcher.snapshot();
  assert.equal(after.document, expected.document);
  assert.equal(after.form, expected.form);
  assert.ok(Object.values(after.fields).every(field => field.matchesBaseline === true));
};
const open = async (context, clock = false) => {
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  if (clock) await page.clock.install();
  await evidence.attach(page);
  watcher = await watchRegistration(page, evidence);
  await page.goto(base + '/register/?region=international&returnTo=%2Faccount');
  await page.locator('#register-nickname').waitFor();
};
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.ONE_G_BROWSER });
  const context = await browser.newContext();
  await open(context);
  const values = fixture(); await fill(page, values);
  // 先以真实站内链接验证脏状态拦截已生效，不依赖输入后固定等待 Effect。
  await page.getByRole('link', { name: '已有账号？返回登录', exact: true }).click();
  await page.locator('dialog[open]').waitFor();
  await page.screenshot({ path: path.join(evidence.dir, 'leave-dialog.png'), caret: 'initial', mask: [page.locator('input,[class*="demo"]')] });
  await page.getByRole('button', { name: '继续填写', exact: true }).click();
  await page.locator('dialog[open]').waitFor({ state: 'hidden' });
  await watcher.cancelReload();
  await page.locator('#register-nickname').fill(values.nickname + ' edited');
  await page.locator('#register-nickname').fill(values.nickname);
  await page.screenshot({ path: path.join(evidence.dir, 'after-cancel.png'), caret: 'initial', mask: [page.locator('input,[class*="demo"]')] });
  mark('cancel native refresh: same document/form, all fields preserved and editable');
  await watcher.cancelReload();
  mark('second refresh cancellation: dirty native guard still active');
  const beforeInternal = await watcher.baseline();
  await page.getByRole('link', { name: '已有账号？返回登录', exact: true }).click();
  await page.getByRole('button', { name: '继续填写', exact: true }).click();
  await page.locator('dialog[open]').waitFor({ state: 'hidden' });
  await unchanged(page, beforeInternal);
  mark('internal navigation: continue preserves form');
  await page.getByRole('link', { name: '已有账号？返回登录', exact: true }).click();
  await page.getByRole('button', { name: '确认离开', exact: true }).click();
  await page.waitForURL('**/login/**');
  assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/account');
  await page.getByRole('link', { name: '没有账号？注册账号', exact: true }).click();
  await page.locator('#register-nickname').waitFor();
  assert.equal(await page.locator('#register-nickname').inputValue(), '');
  await noStoredDraft(page, values);
  mark('confirmed internal leave: original destination, no site draft on return');
  await fill(page, values);
  const afterReload = await watcher.confirmReload();
  assert.ok(Object.values(afterReload.fields).every(field => field.empty));
  await page.waitForFunction(() => window.registrationProbe.reactState()?.nicknameEmpty === true && window.registrationProbe.reactState()?.emailEmpty === true && window.registrationProbe.reactState()?.passwordEmpty === true);
  await noStoredDraft(page, values);
  mark('confirmed refresh: new document, empty React profile, no site persistence');
  await fill(page, values);
  const beforeTab = await watcher.baseline();
  const mailbox = await context.newPage();
  await mailbox.setContent('<title>Fictional mailbox</title><main>Local test mailbox</main>');
  await mailbox.bringToFront(); await mailbox.locator('main').click();
  await page.bringToFront(); await unchanged(page, beforeTab); await mailbox.close();
  await page.locator('[data-theme-toggle]').click(); await unchanged(page, beforeTab);
  await page.locator('[data-language-toggle]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await unchanged(page, beforeTab);
  await page.locator('[data-language-toggle]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'zh-CN');
  await unchanged(page, beforeTab);
  mark('real mailbox tab focus, theme and locale preserve current in-memory profile');
  await noStoredDraft(page, values);
  if (production) {
    assert.ok(await page.getByRole('button', { name: '注册服务暂未开放', exact: true }).isDisabled());
    assert.ok(await page.getByRole('button', { name: '模拟人机验证（仅开发）', exact: true }).isDisabled());
    mark('production: real registration/code service stays disabled; success cannot be exercised');
  } else {
    await page.evaluate(() => {
      window.registrationTestActions = { sends: 0, submits: 0 };
      document.addEventListener('click', event => { const button = event.target instanceof Element ? event.target.closest('button') : null; if (button && document.getElementById('registration-code')?.closest('[class*="codeRow"]')?.contains(button)) window.registrationTestActions.sends++; }, true);
      document.addEventListener('submit', () => window.registrationTestActions.submits++, true);
    });
    await page.getByRole('button', { name: '模拟人机验证（仅开发）', exact: true }).click();
    await page.getByRole('button', { name: '演示人机凭据已就绪（单次使用）', exact: true }).waitFor();
    await page.getByRole('button', { name: '获取验证码', exact: true }).click();
    await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。', { exact: true }).waitFor();
    await page.locator('#registration-code').fill('004271');
    await watcher.cancelReload();
    assert.deepEqual(await page.evaluate(() => window.registrationTestActions), { sends: 1, submits: 0 });
    await page.getByRole('button', { name: '注册账号（本地演示）', exact: true }).click();
    await page.waitForURL('**/login/**');
    await page.getByText('注册成功，请登录。', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('one-g-auth-demo')), null);
    assert.deepEqual(await page.evaluate(() => window.registrationTestActions), { sends: 1, submits: 1 });
    assert.equal(await page.locator('#register-password').count(), 0);
    await noStoredDraft(page, values);
    mark('after cancellation: existing code still valid, explicit registration once, login return with no session/prompt');
  }
  watcher.assertNoUnexpected(); watcher.close(); await context.close();
  if (!production) {
    const expiryContext = await browser.newContext(); await open(expiryContext, true);
    await fill(page, fixture());
    await page.evaluate(() => { window.registrationSendCount = 0; document.addEventListener('click', e => { if (e.target instanceof Element) { const button=e.target.closest('button');if(button&&document.getElementById('registration-code')?.closest('[class*="codeRow"]')?.contains(button))window.registrationSendCount++; } }, true); });
    await page.getByRole('button', { name: '模拟人机验证（仅开发）', exact: true }).click();
    await page.getByRole('button', { name: '演示人机凭据已就绪（单次使用）', exact: true }).waitFor();
    await page.getByRole('button', { name: '获取验证码', exact: true }).click();
    await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。', { exact: true }).waitFor();
    await page.locator('#registration-code').fill('004271'); await watcher.cancelReload();
    await page.clock.fastForward(310000);
    await page.getByRole('button', { name: '注册账号（本地演示）', exact: true }).click();
    await page.getByText('验证码错误或已失效，请重新获取。', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.registrationSendCount), 1);
    assert.ok(await page.getByRole('button', { name: '模拟人机验证（仅开发）', exact: true }).isVisible());
    watcher.assertNoUnexpected(); watcher.close(); await expiryContext.close();
    mark('expired verification remains expired; no automatic resend after refresh cancellation');
  }
  fs.writeFileSync(path.join(evidence.dir, 'checks.json'), JSON.stringify({ production, checks }, null, 2));
  evidence.finish('passed'); console.log(`PASS ${checks.length} registration lifecycle checks (${production ? 'production' : 'development Mock'})`);
} catch (error) {
  await evidence.fail(error, page); console.error(evidence.safeError(error)); process.exitCode = 1;
} finally { watcher?.close(); await browser?.close(); }
