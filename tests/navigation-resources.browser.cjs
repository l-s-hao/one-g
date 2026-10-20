/* eslint-disable @typescript-eslint/no-require-imports -- Production resource/identity sampling. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = (process.env.ONE_G_TEST_URL || 'http://127.0.0.1:3001/one-g').replace(/\/$/, '');
const output = process.env.ONE_G_NAV_OUTPUT || '/tmp/one-navigation-audit/resources'; fs.mkdirSync(output, { recursive: true });
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
 const report = { base, browser: browser.version(), samples: [], errors: [], warnings: [] };
 try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => {
   const active = new Map(), frames = new Set(); let ticks = 0;
   const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
   EventTarget.prototype.addEventListener = function(type, callback, options) {
    if ((this === window || this === document || this === document.documentElement) && !(options && typeof options === 'object' && options.once) && !/InjectedScript|addHitTargetInterceptorListeners|Playwright/.test(new Error().stack || '') && !type.startsWith('__playwright')) {
     let events = active.get(this); if (!events) active.set(this, events = new Map());
     let set = events.get(type); if (!set) events.set(type, set = new Set()); set.add(callback);
    }
    return add.call(this, type, callback, options);
   };
   EventTarget.prototype.removeEventListener = function(type, callback, options) { active.get(this)?.get(type)?.delete(callback); return remove.call(this, type, callback, options); };
   const request = requestAnimationFrame, cancel = cancelAnimationFrame;
   window.requestAnimationFrame = callback => { const id = request(time => { frames.delete(id); ticks++; callback(time); }); frames.add(id); return id; };
   window.cancelAnimationFrame = id => { frames.delete(id); cancel(id); };
   const tasks = [], shifts = [];
   for (const type of ['longtask', 'layout-shift']) if (PerformanceObserver.supportedEntryTypes.includes(type)) new PerformanceObserver(list => {
    for (const entry of list.getEntries()) { if (type === 'longtask') tasks.push({ start: entry.startTime, duration: entry.duration }); else shifts.push({ value: entry.value, recentInput: entry.hadRecentInput }); }
   }).observe({ type, buffered: true });
   window.resourceAudit = () => ({ listeners: [...active].flatMap(([target, events]) => [...events].map(([type, callbacks]) => ({ target: target === window ? 'window' : target === document ? 'document' : 'html', type, count: callbacks.size }))).filter(x => x.count), raf: frames.size, ticks, tasks, shifts });
  });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') report.errors.push(msg.text() + ' ' + msg.location().url); if (/too many.*context|context lost/i.test(msg.text())) report.warnings.push(msg.text()); });
  const link = href => page.locator(`[data-navigation-item="${href}"] > a`);
  const sample = async name => { const data = await page.evaluate(() => window.resourceAudit()); report.samples.push({ name, ...data }); return data; };
  await page.goto(base + '/products/'); await page.locator('[data-theme-toggle]').waitFor(); await page.waitForTimeout(3000);
  await link('/products').click(); await link('/products').hover(); await page.waitForTimeout(700); await page.keyboard.press('Escape'); await page.mouse.move(30, 80); await page.waitForTimeout(3200);
  const baseline = await sample('products idle baseline after first-use library initialization');
  for (let i = 0; i < 10; i++) { await page.mouse.move(30, 80); await page.waitForTimeout(180); await link(i % 2 ? '/products' : '/solutions').hover(); await page.waitForTimeout(160); await page.keyboard.press('Escape'); }
  await page.mouse.move(30, 80); await page.waitForTimeout(3200); const menuEnd = await sample('after 10 menu cycles, idle');
  assert.deepEqual(menuEnd.listeners, baseline.listeners); assert.equal(menuEnd.raf, baseline.raf); assert.equal(await page.locator('header [data-animating]').count(), 0);
  await link('/about').click(); await page.waitForURL('**/about/');
  await page.locator('#brand-lanyard').scrollIntoViewIfNeeded(); await page.locator('.lanyard[data-ready="true"]').waitFor({ timeout: 30000 });
  await page.evaluate(() => { window.originalLanyard = document.querySelector('.lanyard canvas'); window.originalScroll = document.querySelector('.scroll-expand__stage'); });
  await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500); await page.locator('[data-language-toggle]').click();
  assert.equal(await page.evaluate(() => window.originalLanyard === document.querySelector('.lanyard canvas') && window.originalScroll === document.querySelector('.scroll-expand__stage')), true);
  report.renderer = await page.locator('.lanyard canvas').evaluate(canvas => { const gl = canvas.getContext('webgl2'); const ext = gl?.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'not exposed'; });
  await page.screenshot({ path: output + '/about-lanyard.png' }); await sample('about visible after theme and locale');
  await page.evaluate(() => { window.scrollTo(0, 0); }); await page.waitForTimeout(3500); const offscreen = await sample('about lanyard offscreen');
  const ticks = offscreen.ticks; await page.waitForTimeout(400); const idle = await sample('about offscreen +400ms');
  assert.equal(idle.ticks, ticks, 'offscreen Lanyard/ScrollExpand do not keep requesting frames');
  await page.evaluate(() => { delete window.originalLanyard; delete window.originalScroll; });
  for (let i = 0; i < 3; i++) { await link('/solutions').click(); await page.waitForURL('**/solutions/'); await link('/products').click(); await page.waitForURL('**/products/'); }
  await page.mouse.move(30, 80); await page.waitForTimeout(3200); const routeEnd = await sample('after route cycles, products idle');
  assert.deepEqual(routeEnd.listeners, baseline.listeners); assert.equal(routeEnd.raf, baseline.raf);
  // Route via actual Logo; verify the collage identity does not restart.
  await page.locator('header.site-header a').first().click(); await page.waitForURL(base + '/');
  await page.locator('main section[data-running="true"]').waitFor();
  await page.evaluate(() => { window.originalHero = document.querySelector('section[data-running]'); window.heroAnimations = window.originalHero.getAnimations({ subtree: true }); });
  await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500); await page.locator('[data-language-toggle]').click();
  assert.equal(await page.evaluate(() => window.originalHero === document.querySelector('section[data-running]')), true);
  assert.equal(await page.evaluate(() => window.originalHero.getAnimations({ subtree: true }).every(a => window.heroAnimations.includes(a))), true);
  await page.screenshot({ path: output + '/collage-stable.png' });
  assert.deepEqual(report.errors, []); assert.deepEqual(report.warnings, []);
  report.status = 'PASS'; console.log('PASS lifecycle listeners/RAF, offscreen Lanyard/ScrollExpand, stable theme/locale identities');
 } catch (error) { report.status = 'FAIL'; report.failure = error.stack; throw error; }
 finally { fs.writeFileSync(output + '/results.json', JSON.stringify(report, null, 2)); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
