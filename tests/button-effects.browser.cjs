/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser scope acceptance. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = (process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g').replace(/\/$/, '');
const out = process.env.ONE_G_SCREENSHOTS || '/tmp/one-specular-scope';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  const results = [], errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => {
      window.buttonAudit = { contexts: 0, draws: 0 };
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        const gl = original.call(this, type, ...args);
        if (type === 'webgl2' && gl) {
          window.buttonAudit.contexts++;
          const draw = gl.drawArrays.bind(gl);
          gl.drawArrays = (...values) => { window.buttonAudit.draws++; return draw(...values); };
        }
        return gl;
      };
    });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/hydrat|didn.t match|too many.*context/i.test(m.text())) errors.push(m.text()); });
    async function go(path) { const response = await page.goto(base + path); assert.equal(response.status(), 200); await page.waitForTimeout(450); }
    async function audit(label) {
      const value = await page.evaluate(() => ({
        effects: document.querySelectorAll('[data-specular-host]').length,
        edges: document.querySelectorAll('.specular-edge').length,
        excluded: document.querySelectorAll('header.site-header .specular-edge, footer .specular-edge, [role=tab] .specular-edge, button[aria-pressed] .specular-edge, [data-header-image-card] .specular-edge').length,
        underline: [...document.querySelectorAll('button,[data-button-intent]')].some(e => getComputedStyle(e).textDecorationLine.includes('underline')),
        nested: document.querySelectorAll('button a,a button').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        outputs: document.querySelectorAll('.specular-edge__canvas').length,
        ...window.buttonAudit,
      }));
      assert.equal(value.edges, value.effects); assert.equal(value.excluded, 0);
      assert.equal(value.underline, false); assert.equal(value.nested, 0); assert.equal(value.overflow, false);
      assert.ok(value.outputs <= 4); results.push({ label, ...value }); return value;
    }
    await go('/products/');
    assert.equal((await audit('products default')).effects, 0);
    const nav = page.locator('header nav').first();
    await nav.getByRole('link', { name: '商品中心', exact: true }).hover(); await page.waitForTimeout(600);
    await page.locator('#desktop-nav-0').getByRole('button', { name: '机械臂', exact: true }).click(); await page.waitForTimeout(500);
    assert.equal(await page.locator('#desktop-nav-0 [data-header-image-card]').count(), 2);
    assert.equal((await audit('menu and filters')).contexts, 0);
    await page.screenshot({ path: out + '/navigation-light.png' }); await page.keyboard.press('Escape');
    const category = page.getByRole('tab').nth(1); await category.click(); await page.waitForTimeout(500);
    assert.equal(await category.getAttribute('aria-selected'), 'true');
    assert.equal((await audit('page category')).contexts, 0);
    await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500);
    await page.locator('[data-language-toggle]').click(); await page.waitForTimeout(150);
    assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(14, 15, 18)');
    assert.equal((await audit('English night compact controls')).effects, 0);
    await page.screenshot({ path: out + '/products-dark.png' });
    await page.reload(); await page.waitForTimeout(400); assert.equal((await audit('refresh')).contexts, 0);
    await page.locator('[data-language-toggle]').click(); await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(450);
    await go('/'); assert.equal((await audit('hero')).effects, 2);
    const main = page.locator('main [data-specular-host]').first();
    await page.locator('main section[data-running="true"]').waitFor();
    await main.hover(); await page.waitForTimeout(1600); assert.equal(await main.locator('canvas').count(), 1);
    const draws = await page.evaluate(() => window.buttonAudit.draws); await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => window.buttonAudit.draws), draws);
    await page.screenshot({ path: out + '/hero-light.png' });
    await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(450); await main.hover(); await page.waitForTimeout(1200);
    await page.screenshot({ path: out + '/hero-dark.png' });
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(150); assert.equal(await page.locator('.specular-edge__canvas').count(), 0);
    await page.keyboard.press("Tab"); await main.focus(); assert.notEqual(await main.evaluate(e => getComputedStyle(e).outlineStyle), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await main.click(); await page.waitForURL('**/products/'); await page.waitForTimeout(400);
    assert.equal((await audit('SPA product return')).edges, 0); assert.equal(await page.locator('canvas.specular-edge__canvas').count(), 0);
    for (const [route, count] of [['/products/robotdock/', 2], ['/buy/robotdock/', 1], ['/solutions/', 1], ['/deep-customization/', 1], ['/about/', 1], ['/login/', 1]]) {
      await go(route); assert.equal((await audit(route)).effects, count, route);
    }
    assert.equal(await page.getByRole('button', { name: '获取验证码', exact: true }).locator('.specular-edge').count(), 0);
    assert.equal(await page.locator('button[type=submit] .specular-edge').count(), 1);
    await go('/products/robotdock/'); const buy = page.locator('main a[data-specular-host]').first();
    await buy.hover(); await page.waitForTimeout(1200); assert.equal(await buy.locator('canvas').count(), 1);
    await page.screenshot({ path: out + '/detail-purchase.png' });
    await buy.click(); await page.waitForURL('**/buy/robotdock/'); await page.waitForTimeout(300);
    const disabled = page.locator('main button[disabled]'); assert.equal(await disabled.locator('.specular-edge').count(), 1); assert.equal(await disabled.locator('canvas').count(), 0);
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const phone = await mobile.newPage(); phone.on('pageerror', e => errors.push(e.message));
    await phone.goto(base + '/'); await phone.locator('main section[data-running="true"]').waitFor(); assert.equal(await phone.locator('[data-specular-host]').count(), 2);
    await phone.screenshot({ path: out + '/hero-mobile.png' });
    await phone.getByRole('button', { name: '打开菜单', exact: true }).tap(); await phone.waitForTimeout(300);
    await phone.locator('#mobile-navigation button[aria-controls="mobile-nav-0"]').tap(); await phone.waitForTimeout(600);
    assert.equal(await phone.locator('header .specular-edge').count(), 0);
    await phone.locator('#mobile-nav-0').getByRole('button', { name: '机械臂', exact: true }).tap(); await phone.waitForTimeout(500);
    assert.equal(await phone.locator('#mobile-nav-0 [data-header-image-card]').count(), 2);
    await phone.screenshot({ path: out + '/navigation-mobile.png' });
    assert.equal(await phone.locator('.specular-edge__canvas').count(), 0);
    assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []); fs.writeFileSync(out + '/results.json', JSON.stringify({ results, errors }, null, 2));
    console.log('PASS explicit primary scope, excluded menus/chips/cards/icons have no effects/resources, theme/language, mobile, focus, reduced motion, static disabled, SPA cleanup', JSON.stringify(results));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
