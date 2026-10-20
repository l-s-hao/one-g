/* eslint-disable @typescript-eslint/no-require-imports -- Existing development-only auth fixtures, no real account operations. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = (process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g').replace(/\/$/, '');
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
 const rows = [];
 try {
  for (const [id, label, userTarget, cartTarget] of [[null, '用户登录', '/login/', 'returnTo=%2Fcart'], ['user-demo', '用户中心', '/account/', '/cart/'], ['admin-demo', '管理后台', '/admin/', '/admin/']]) {
   const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
   await context.addInitScript(({ id }) => {
    if (id) localStorage.setItem('one-g-auth-demo', JSON.stringify({ version: 1, userId: id }));
    localStorage.setItem('one-g-cart:user-demo', JSON.stringify([{ productId: 'g1', quantity: 2 }]));
   }, { id });
   const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
   await page.goto(base + '/buy/robotdock/'); await page.locator('[data-theme-toggle]').waitFor();
   const user = page.locator(`header a[aria-label="${label}"]`); await user.waitFor();
   const cart = page.locator('header a').filter({ has: page.locator('svg.lucide-shopping-cart') });
   assert.ok((await user.getAttribute('href')).endsWith(userTarget)); assert.ok((await cart.getAttribute('href')).includes(cartTarget));
   const before = await page.evaluate(() => ({ session: localStorage.getItem('one-g-auth-demo'), cart: localStorage.getItem('one-g-cart:user-demo') }));
   const radios = page.locator('main input[type=radio]'); await radios.first().check(); await radios.last().check();
   await page.locator('main input[type=number]').fill('3'); await page.waitForFunction(() => new URL(location.href).searchParams.get('quantity') === '3');
   const query = new URL(page.url()).search;
   await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500); await page.locator('[data-language-toggle]').click();
   assert.equal(new URL(page.url()).search, query); assert.equal(await radios.first().isChecked(), true); assert.equal(await radios.last().isChecked(), true);
   assert.deepEqual(await page.evaluate(() => ({ session: localStorage.getItem('one-g-auth-demo'), cart: localStorage.getItem('one-g-cart:user-demo') })), before);
   const href = await cart.getAttribute('href'); await cart.click(); await page.waitForURL(new URL(href, base).href);
   await page.goto(base + '/buy/robotdock/'); const newUser = page.locator('header a').filter({ has: page.locator('svg.lucide-user-round') }).filter({ visible: true });
   await newUser.waitFor(); await page.waitForFunction(target => [...document.querySelectorAll('header a')].some(a => a.querySelector('svg.lucide-user-round') && a.getClientRects().length && new URL(a.href).pathname.endsWith(target)), userTarget); const destination = await newUser.getAttribute('href'); await newUser.click(); await page.waitForURL(new URL(destination, base).href);
   assert.deepEqual(errors, []); rows.push({ role: id || 'anonymous', userTarget, cartTarget, preserves: ['session', 'cart', 'package', 'payment', 'quantity'], pass: true });
   await context.close();
  }
  fs.mkdirSync('/tmp/one-navigation-audit/auth', { recursive: true }); fs.writeFileSync('/tmp/one-navigation-audit/auth/results.json', JSON.stringify(rows, null, 2)); console.log('PASS', JSON.stringify(rows));
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
