import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';
const { chromium } = await import(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const base = (process.env.ONE_G_TEST_URL || 'http://127.0.0.1:5558/one-g').replace(/\/$/, '');
const production = process.env.ONE_G_PRODUCTION === '1';
const evidence = createBrowserEvidence({ name: 'solutions-layout', condition: production ? 'production' : 'warm' });
const results = { matrix: [], checks: [], errors: [] };
let browser, page;
const ids = ['teleoperation', 'handling', 'inspection', 'ai'];
async function contextFor(width = 1440, locale = 'zh-CN', theme = 'light', signedIn = false) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce' });
  await context.addInitScript(({ locale, theme, signedIn }) => {
    if (localStorage.getItem('one-g-solutions-test-initialized')) return;
    localStorage.setItem('one-g-solutions-test-initialized', '1');
    localStorage.setItem('one-g-locale', locale); localStorage.setItem('one-g-appearance-v1', theme);
    if (signedIn) localStorage.setItem('one-g-auth-demo', JSON.stringify({ version: 1, userId: 'user-demo' }));
  }, { locale, theme, signedIn });
  return context;
}
async function attach(context) {
  page = await context.newPage(); await evidence.attach(page);
  page.on('console', message => { if (message.type() === 'error') results.errors.push(message.text()); });
  page.on('pageerror', error => results.errors.push(error.message));
  return page;
}
async function ready(locale = 'zh-CN', theme = 'light') {
  await page.locator('[data-solution-section="ai"]').waitFor();
  await page.waitForFunction(({ locale, theme }) => document.documentElement.lang === locale && document.documentElement.classList.contains(theme), { locale, theme });
  await page.locator('main [data-contact-entry="solutions"]').waitFor();
  await page.waitForFunction(() => document.querySelector('main [data-contact-entry="solutions"]')?.disabled === false);
}
async function anchorVisible(id) {
  await page.waitForFunction(id => {
    const target = document.getElementById(id); const header = document.querySelector('header.site-header');
    if (!target || !header) return false;
    const top = target.getBoundingClientRect().top;
    return top >= header.getBoundingClientRect().bottom - 1 && top < innerHeight - 20;
  }, id);
}
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.ONE_G_BROWSER });
  for (const width of [1440, 1920, 768, 390]) for (const locale of ['zh-CN', 'en']) for (const theme of ['light', 'dark']) {
    const context = await contextFor(width, locale, theme); await attach(context);
    const requestedVideos = []; page.on('request', request => { if (/\.mp4(?:\?|$)/.test(request.url())) requestedVideos.push(request.url()); });
    const response = await page.goto(base + '/solutions/'); assert.equal(response.status(), 200); await ready(locale, theme);
    assert.deepEqual(await page.locator('main [data-solution-section]').evaluateAll(nodes => nodes.map(node => node.id)), ids);
    assert.equal(await page.locator('main [hidden], main button[aria-expanded], main [data-card-hover-host]').count(), 0);
    assert.equal(await page.locator('main video').count(), 4);
    assert.equal(await page.locator('main video[autoplay], main video[loop]').count(), 0);
    for (const id of ids) {
      assert.ok(await page.locator('#' + id + ' h2').isVisible());
      assert.ok(await page.locator('#' + id + ' p').first().isVisible());
      assert.equal(await page.locator('#' + id).evaluate(node => node.children[0].tagName), 'DIV');
    }
    for (const video of await page.locator('main video').all()) {
      assert.equal(await video.getAttribute('preload'), 'none'); assert.equal(await video.evaluate(node => node.controls && node.paused), true);
    }
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded(); await image.evaluate(node => node.decode());
      assert.equal(await image.evaluate(node => node.naturalWidth > 0), true);
    }
    assert.equal(requestedVideos.length, 0, 'No video media should load before user playback');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    if (locale === 'en') assert.equal(/[\u3400-\u9fff]/.test(await page.locator('main').innerText()), false);
    await page.evaluate(() => scrollTo(0, 0)); await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(evidence.dir, `solutions-${width}-${locale}-${theme}.png`), fullPage: true, caret: 'initial' });
    await page.screenshot({ path: path.join(evidence.dir, `hero-${width}-${locale}-${theme}.png`), caret: 'initial' });
    await page.locator('main nav a[href="#handling"]').click(); await anchorVisible('handling');
    assert.equal(new URL(page.url()).hash, '#handling');
    results.matrix.push({ width, locale, theme, sections: 4, contentsInitiallyVisible: true, autoplay: false, videoRequests: 0, anchorClearOfHeader: true, overflow: false });
    await context.close();
  }
  results.checks.push('16 viewport/language/theme combinations; default content, native directory, natural document scrolling and no eager video traffic');
  const context = await contextFor(); await attach(context);
  for (const id of ids) {
    await page.goto(base + '/solutions/?origin=compat#' + id); await ready(); await anchorVisible(id);
    assert.equal(new URL(page.url()).searchParams.get('origin'), 'compat');
    await page.reload(); await ready(); await anchorVisible(id);
  }
  await page.goto(base + '/solutions/#solution-handling'); await ready(); await anchorVisible('solution-handling');
  await page.goto(base + '/solutions/#not-a-solution'); await ready(); assert.equal(await page.locator('main [data-solution-section]').count(), 4);
  await page.locator('main nav a[href="#teleoperation"]').click(); await anchorVisible('teleoperation');
  await page.locator('main nav a[href="#handling"]').click(); await anchorVisible('handling');
  await page.goBack(); await anchorVisible('teleoperation'); await page.goForward(); await anchorVisible('handling');
  const tab = await context.newPage(); await tab.goto(base + '/solutions/#inspection'); await tab.locator('#inspection h2').waitFor();
  assert.equal(await tab.locator('main [data-solution-section]').count(), 4); await tab.close();
  const video = page.locator('#handling video'); await video.scrollIntoViewIfNeeded();
  const box = await video.boundingBox(); await video.click({ position: { x: 24, y: box.height - 44 } });
  await page.waitForFunction(() => document.querySelector('#handling video').currentTime > 0);
  const handle = await video.elementHandle();
  await page.locator('#teleoperation video').evaluate(node => node.play());
  assert.equal(await video.evaluate(node => node.paused), true);
  await page.locator('#teleoperation video').evaluate(node => node.pause());
  await page.locator('[data-theme-toggle]').click(); await page.locator('[data-language-toggle]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert.equal(await handle.evaluate(node => node.isConnected), true);
  assert.equal(await page.locator('main video').count(), 4);
  await page.locator('[data-language-toggle]').click(); await page.waitForFunction(() => document.documentElement.lang === 'zh-CN');
  await page.locator('#teleoperation a[href*="/solutions/teleoperation"]').click(); await page.waitForURL('**/solutions/teleoperation/'); await page.locator('#solution-title').waitFor();
  results.checks.push('Stable IDs, legacy body-ID alias, retained query, reload, back/forward, new tab, real detail link; native playback, single-playing video and media identity through theme/language');
  await page.goto(base + '/solutions/?origin=contact#handling'); await ready('zh-CN', 'dark');
  await page.locator('main [data-contact-entry="solutions"]').click(); await page.waitForURL('**/login/**');
  const target = new URL(page.url()).searchParams.get('returnTo'); assert.ok(target.startsWith('/solutions?')); assert.ok(target.includes('openContact=solutions')); assert.ok(target.endsWith('#handling'));
  results.checks.push('Anonymous contact uses existing login flow with safe return and solution context');
  if (!production) {
    await page.getByRole('button', { name: '密码登录', exact: true }).click();
    await page.getByLabel('邮箱', { exact: true }).fill('demo-a@example.test');
    await page.getByLabel('密码', { exact: true }).fill('123456');
    await page.getByRole('button', { name: '登录 ONE-G（演示）', exact: true }).click();
    await page.waitForURL('**/solutions/**'); await page.locator('dialog[open]').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('origin'), 'contact');
    assert.equal(new URL(page.url()).hash, '#handling');
    assert.equal(new URL(page.url()).searchParams.has('openContact'), false);
    await page.keyboard.press('Escape'); await page.locator('dialog[open]').waitFor({ state: 'detached' });
    results.checks.push('Existing Mock password login returns to the original solution context and opens demand preview');
  }

  await context.close();
  if (!production) {
    const signed = await contextFor(1440, 'zh-CN', 'light', true); await attach(signed);
    let posts = 0; page.on('request', request => { if (request.method() === 'POST') posts++; });
    await page.goto(base + '/solutions/?openContact=solutions&origin=contact#handling');
    const dialog = page.locator('dialog[open]'); await dialog.waitFor();
    assert.equal(new URL(page.url()).searchParams.get('origin'), 'contact'); assert.equal(new URL(page.url()).hash, '#handling');
    await page.locator('#contact-name').fill('Fictional Scenario'); await page.locator('#contact-email').fill('scenario@example.test');
    await page.locator('#contact-description').fill('Fictional local scenario preview.');
    await dialog.getByRole('button', { name: '预览需求', exact: true }).click(); await dialog.getByText('仅供预览，尚未提交。', { exact: true }).waitFor();
    assert.equal(posts, 0); await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'detached' });
    await page.locator('main [data-contact-entry="solutions"]').click(); await page.locator('dialog[open]').waitFor(); await page.keyboard.press('Escape');
    results.checks.push('Signed-in contact consumes only openContact marker, opens existing preview, makes no submission and hero CTA remains usable');
    await signed.close();
  }
  const navigationContext = await contextFor(); await attach(navigationContext);
  await page.goto(base + '/');
  const grid = page.locator('[data-layout-grid="home-solutions"]');
  await grid.locator('[data-preview-id="teleoperation"] button[aria-expanded]').first().click();
  await page.waitForFunction(() => document.querySelector('[data-layout-grid="home-solutions"]')?.getAttribute('data-expanded') === 'teleoperation');
  assert.equal(await grid.locator('[data-preview-panel="teleoperation"] a[href*="/solutions/teleoperation"]').count(), 1);
  // 首页组件不在本轮修改范围；使用其既有键盘关闭入口核验全局预览状态复位。
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('[data-layout-grid="home-solutions"]')?.getAttribute('data-expanded') === '');
  await page.locator('header [data-navigation-item="/solutions"] > a').hover();
  const menu = page.locator('#desktop-nav-1'); await menu.waitFor({ state: 'visible' });
  assert.equal(await menu.locator('[data-header-image-card]').count(), 4);
  const handlingLink = menu.locator('a[href$="#handling"]');
  assert.equal(new URL(await handlingLink.getAttribute('href'), page.url()).pathname.replace(/\/+$/, ''), '/one-g/solutions');
  await handlingLink.click();
  await page.waitForFunction(() => location.hash === '#handling' && location.pathname.replace(/\/+$/, '').endsWith('/solutions'));
  await ready(); await anchorVisible('handling');
  results.checks.push('Existing homepage solution Layout Grid expands/closes; Header image drawer retains all four entries and its handling link reaches the open section');
  await navigationContext.close();
  const staticContext = await browser.newContext({ javaScriptEnabled: false }); const staticPage = await staticContext.newPage();
  await staticPage.goto(base + '/solutions/'); assert.equal(await staticPage.locator('main [data-solution-section]').count(), 4);
  assert.ok(await staticPage.locator('#handling p').first().isVisible()); await staticContext.close();
  results.checks.push('All four sections exist in server HTML with JavaScript disabled');
  assert.deepEqual(results.errors, []);
  fs.writeFileSync(path.join(evidence.dir, 'results.json'), JSON.stringify(results, null, 2)); evidence.finish('passed'); console.log(`PASS solutions layout: ${results.matrix.length} combinations, ${results.checks.length} interaction groups`);
} catch (error) { fs.writeFileSync(path.join(evidence.dir, 'results.json'), JSON.stringify(results, null, 2)); await evidence.fail(error, page); console.error(evidence.safeError(error)); process.exitCode = 1; }
finally { await browser?.close(); }
