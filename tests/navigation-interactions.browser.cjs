/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance, no application dependencies. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = (process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g').replace(/\/$/, '');
const output = process.env.ONE_G_NAV_OUTPUT || '/tmp/one-navigation-audit/dev';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  const report = { browser: browser.version(), base, checks: [], entries: [], samples: [], errors: [], warnings: [], failures: [] };
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => {
      window.navigationAudit = { clicks: [], longTasks: [], shifts: [] };
      document.addEventListener('click', event => {
        const a = event.target instanceof Element ? event.target.closest('a') : null;
        if (a) window.navigationAudit.clicks.push({ href: a.href, time: performance.now(), modified: event.ctrlKey || event.metaKey, preventedAtCapture: event.defaultPrevented });
      }, true);
      for (const type of ['longtask', 'layout-shift']) {
        if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
        new PerformanceObserver(list => { for (const item of list.getEntries()) {
          if (type === 'longtask') window.navigationAudit.longTasks.push({ start: item.startTime, duration: item.duration });
          else window.navigationAudit.shifts.push({ value: item.value, recentInput: item.hadRecentInput });
        } }).observe({ type, buffered: true });
      }
    });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') { report.errors.push(msg.text() + ' ' + msg.location().url); console.log('CONSOLE ERROR', { message: msg.text(), location: msg.location(), page: page.url(), lastCheck: report.checks.at(-1)?.label, lastEntry: report.entries.at(-1)?.label }); } if (/too many.*context|context lost/i.test(msg.text())) report.warnings.push(msg.text()); });
    page.on('response', response => { if (response.status() === 404) report.errors.push('404 ' + response.url()); });
    const top = href => page.locator(`[data-navigation-item="${href}"] > a`);
    const panel = index => page.locator('#desktop-nav-' + index);
    async function go(route = '/') {
      const response = await page.goto(base + route); assert.equal(response.status(), 200, route);
      await page.locator('[data-theme-toggle]').waitFor();
    }
    async function waitURL(href) {
      const expected = new URL(href, base).href;
      await page.waitForURL(url => url.href === expected);
    }
    async function open(index) {
      // URL updates precede React's commit. Wait for the new Header, so a hover
      // on the outgoing Header is not mistaken for an incoming preview failure.
      const pathname = new URL(page.url()).pathname.slice(new URL(base).pathname.length).replace(/\/+$/, '') || '/';
      await page.waitForFunction(path => document.querySelector('header.site-header')?.dataset.navigationPath === path, pathname);
      await page.mouse.move(30, 80); await page.waitForTimeout(200);
      await top(index === 0 ? '/products' : '/solutions').hover();
      await panel(index).waitFor({ state: 'visible' });
    }
    async function settled(index) { await open(index); await page.waitForTimeout(700); }
    async function clickRecord(label, locator) {
      const data = await locator.evaluate(e => { const r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { tag: e.tagName, href: e.getAttribute('href'), hit: hit?.tagName, hitInside: e.contains(hit), nested: !!e.querySelector('button,a') }; });
      assert.equal(data.tag, 'A'); assert.ok(data.href); assert.equal(data.nested, false);
      const started = Date.now(); await locator.click(); await waitURL(data.href);
      report.entries.push({ label, ...data, actual: new URL(page.url()).pathname + new URL(page.url()).search + new URL(page.url()).hash, clickToURLWallMs: Date.now() - started });
    }
    async function invariant(label) {
      const value = await page.evaluate(() => ({
        nested: document.querySelectorAll('a button,button a').length,
        effects: document.querySelectorAll('header.site-header .specular-edge,header.site-header canvas').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        animationFlags: document.querySelectorAll('header [data-animating]').length,
        activeTheme: document.documentElement.dataset.magicuiThemeVt ?? null,
      }));
      assert.equal(value.nested, 0); assert.equal(value.effects, 0); assert.equal(value.overflow, false, label);
      report.checks.push({ label, ...value });
    }
    // A: a first click uses the native anchor, before any preview animation.
    await go(); await clickRecord('A cold main products', top('/products'));
    // B and C: clicks never wait for a preview to finish.
    await go(); await top('/solutions').hover(); await clickRecord('B opening main solutions', top('/solutions'));
    await settled(0); await clickRecord('C open main products', top('/products'));
    await settled(0); await top('/products').click(); await page.waitForTimeout(350);
    assert.equal(await panel(0).isHidden(), true); // F same-route close
    await invariant('F current-route closes');
    await clickRecord('About main', top('/about'));
    await clickRecord('Logo', page.locator('header.site-header').getByRole('link').first());
    // All image entries and view-all links use their own real route, no locale-derived paths.
    for (const index of [0, 1]) {
      await settled(index); const items = await panel(index).locator('[data-header-image-card]').evaluateAll(es => es.map(e => ({ id: e.dataset.flipId, href: e.getAttribute('href') })));
      assert.equal(items.length, index ? 4 : 9);
      await clickRecord(index ? 'View all solutions' : 'View all products', panel(index).locator('a').first());
      for (const item of items) {
        await settled(index); await clickRecord(item.id, panel(index).locator(`[data-flip-id="${item.id}"]`));
        if (item.href.includes('#')) { const hash = item.href.split('#')[1]; await page.locator('#solution-' + hash).waitFor({ state: 'visible' }); }
      }
    }
    await settled(0); await panel(0).locator('[data-header-image-card]').first().click(); await page.waitForURL('**/products/robotdock/');
    await clickRecord('D detail to solutions main', top('/solutions'));
    // E: native Ctrl and middle click create real new tabs.
    for (const options of [{ modifiers: ['Control'] }, { button: 'middle' }]) {
      const before = page.url(); const tabPromise = context.waitForEvent('page'); await top('/products').click(options);
      const tab = await tabPromise; await tab.waitForURL('**/products/'); assert.equal(page.url(), before); await tab.close();
    }
    report.checks.push({ label: 'E Ctrl and middle click preserve native new tabs', pass: true });
    // G/H: theme and preview overlap, then actual physical click during the 400ms snapshot.
    await settled(0); await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500); await top('/products').click(); await page.waitForURL('**/products/');
    const linkBox = await top('/solutions').boundingBox();
    await page.locator('[data-theme-toggle]').click();
    await page.mouse.click(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2);
    await page.waitForURL('**/solutions/'); await page.waitForTimeout(150);
    assert.equal(await page.locator('html').getAttribute('data-magicui-theme-vt'), null);
    assert.equal(await page.evaluate(() => localStorage.getItem('one-g-appearance-v1')), await page.locator('html').evaluate(e => e.classList.contains('dark') ? 'dark' : 'light'));
    report.checks.push({ label: 'G/H menu + theme, physical click while expanding navigates and clears busy', pass: true });
    // I: menu and category state survive a locale update.
    await settled(0); await page.locator('[data-language-toggle]').click();
    await panel(0).getByRole('button', { name: 'Robot arms', exact: true }).click(); await page.waitForTimeout(250);
    assert.equal(await panel(0).locator('[data-header-image-card]').count(), 2);
    await panel(0).locator('[data-header-image-card]').first().click(); await page.waitForURL('**/products/arm-a1/');
    // J: rapid switches/escape leave no absolute-position/animation leftovers.
    for (let i = 0; i < 12; i++) { await top(i % 2 ? '/products' : '/solutions').hover(); await page.waitForTimeout(125); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(350);
    assert.equal(await page.locator('header [data-animating]').count(), 0);
    assert.equal(await page.locator('header [data-header-image-card]').evaluateAll(es => es.every(e => !e.style.position && !e.style.transform)), true);
    // K: grid identity/DOM survive theme and locale changes; inner link remains usable.
    await go(); const grid = page.locator('[data-layout-grid="home-products"]');
    await grid.locator('button').first().click(); await page.waitForTimeout(600);
    const identity = await grid.getAttribute('data-expanded');
    await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500);
    await page.locator('[data-language-toggle]').click(); assert.equal(await grid.getAttribute('data-expanded'), identity);
    await grid.locator('[data-preview-panel] a').first().click(); await page.waitForURL('**/products/robotdock/');
    // L: product category stays selected through theme/locale updates.
    await go('/products/'); const tabs = page.getByRole('tab');
    for (const index of [1, 3, 2, 4, 1]) await tabs.nth(index).click();
    await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500);
    await page.locator('[data-language-toggle]').click(); assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true');
    await page.locator('[data-card-hover-host] a[href*="/products/"]').filter({ visible: true }).first().click(); await page.waitForURL(/\/products\/[^/]+\/$/);
    // N: focus opens preview, Escape does not reopen it, Enter always navigates.
    await go('/products/'); await page.keyboard.press('Tab'); await top('/solutions').focus();
    await panel(1).waitFor({ state: 'visible' }); await page.keyboard.press('Escape'); await page.waitForTimeout(350);
    assert.equal(await panel(1).isHidden(), true); assert.equal(await top('/solutions').evaluate(e => e === document.activeElement), true);
    await page.keyboard.press('Enter'); await page.waitForURL('**/solutions/');
    await top('/products').focus(); await panel(0).waitFor({ state: 'visible' });
    const image = panel(0).locator('[data-header-image-card]').first();
    await page.keyboard.press('Tab');
    assert.equal(await panel(0).evaluate(e => e.contains(document.activeElement)), true);
    for (let i = 0; i < 9 && !(await image.evaluate(e => e === document.activeElement)); i++) await page.keyboard.press('Tab');
    assert.equal(await image.evaluate(e => e === document.activeElement), true);
    assert.notEqual(await image.evaluate(e => getComputedStyle(e).outlineStyle), 'none');
    await page.keyboard.press('Enter'); await page.waitForURL('**/products/robotdock/');
    await page.goBack(); await page.waitForTimeout(250); assert.equal(await panel(0).isHidden(), true);
    await page.goForward(); await page.waitForURL('**/products/robotdock/'); await page.reload(); await page.locator('[data-theme-toggle]').waitFor();
    // Search/user/cart and input/package/payment state.
    await page.locator('header button[aria-controls="header-search"]').click(); await page.locator('#site-search').fill('RoboDock');
    await page.locator('[data-language-toggle]').click(); await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500);
    assert.equal(await page.locator('#site-search').inputValue(), 'RoboDock'); await page.keyboard.press('Escape');
    await page.locator('header a[href*="/login/"]').filter({ visible: true }).first().click(); await page.waitForURL('**/login/**');
    await page.locator('#recipient').fill('19900000001'); await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500); await page.locator('[data-language-toggle]').click(); assert.equal(await page.locator('#recipient').inputValue(), '19900000001');
    await go('/buy/robotdock/'); const radios = page.locator('main input[type=radio]'); await radios.first().check(); await radios.last().check();
    await page.locator('main input[type=number]').fill('2'); await page.waitForFunction(() => new URL(location.href).searchParams.get('quantity') === '2'); const query = new URL(page.url()).search;
    await page.locator('[data-language-toggle]').click(); await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500);
    assert.equal(new URL(page.url()).search, query); assert.equal(await radios.first().isChecked(), true); assert.equal(await radios.last().isChecked(), true); assert.equal(await page.locator('main input[type=number]').inputValue(), '2');
    await page.locator('header a[href*="returnTo"]').click(); await page.waitForURL('**/login/**'); assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/cart');
    // API fallback, reduced motion, failure/cancellation, rapid toggle mutex.
    await go('/products/'); await page.evaluate(() => { document.startViewTransition = () => { throw Error('test failure'); }; });
    await page.locator('[data-theme-toggle]').click(); assert.equal(await page.locator('html').getAttribute('data-magicui-theme-vt'), null);
    await page.reload(); await page.locator('[data-theme-toggle]').waitFor(); await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => { document.startViewTransition = () => { throw Error('must not animate reduced motion'); }; }); await page.locator('[data-theme-toggle]').click(); await invariant('reduced motion fallback');
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.reload(); await page.locator('[data-theme-toggle]').waitFor();
    await page.evaluate(() => { const b = document.querySelector('[data-theme-toggle]'); b.click(); b.click(); b.click(); }); await page.waitForTimeout(600); assert.equal(await page.locator('html').getAttribute('data-magicui-theme-vt'), null);
    // Four sizes, both languages and both themes. Touch text click and independent preview.
    for (const width of [390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 }); await go('/products/');
      for (const locale of ['zh-CN', 'en']) {
        if ((await page.locator('html').getAttribute('lang')) !== locale) await page.locator('[data-language-toggle]').click();
        for (const theme of ['light', 'dark']) {
          if ((await page.locator('html').evaluate(e => e.classList.contains('dark') ? 'dark' : 'light')) !== theme) { await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500); }
          if (width >= 1024) await settled(0);
          else { await page.locator('button[aria-controls="mobile-navigation"]').click(); await page.locator('#mobile-navigation button[aria-controls="mobile-nav-0"]').click(); await page.locator('#mobile-nav-0').waitFor({ state: 'visible' }); await page.waitForTimeout(600); }
          await invariant(`${width} ${locale} ${theme}`); await page.screenshot({ path: `${output}/${width}-${locale}-${theme}.png` }); await page.keyboard.press('Escape');
        }
      }
    }
    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const phone = await touch.newPage(); await phone.goto(base + '/'); await phone.locator('[data-theme-toggle]').waitFor();
    await phone.locator('button[aria-controls="mobile-navigation"]').tap(); await phone.locator('#mobile-navigation a[href$="/products/"]').first().tap(); await phone.waitForURL('**/products/');
    await phone.locator('button[aria-controls="mobile-navigation"]').tap(); await phone.locator('#mobile-navigation button[aria-controls="mobile-nav-1"]').tap(); await phone.locator('#mobile-nav-1').waitFor({ state: 'visible' }); await phone.waitForTimeout(600);
    await phone.locator('#mobile-nav-1 a[href*="teleoperation"]').tap(); await phone.waitForURL('**/solutions/teleoperation/');
    await phone.locator('[data-theme-toggle]').tap(); await phone.waitForTimeout(500); await phone.locator('[data-language-toggle]').tap();
    await phone.screenshot({ path: output + '/touch-solution.png' });
    report.checks.push({ label: 'M/O single-touch main link, separate preview, image route, theme/language', pass: true });
    report.samples = await page.evaluate(() => ({ ...window.navigationAudit, pendingHeaderAnimations: [...document.querySelectorAll('header.site-header *')].flatMap(e => e.getAnimations()).filter(a => a.playState === 'running').length }));
    assert.deepEqual(report.errors, []); assert.deepEqual(report.warnings, []);
  } catch (error) { report.failures.push(error.stack); throw error; }
  finally { fs.writeFileSync(output + '/results.json', JSON.stringify(report, null, 2)); await browser.close(); }
  console.log('PASS', report.checks.length, 'combinations;', report.entries.length, 'real link entries;', report.browser);
})().catch(error => { console.error(error); process.exitCode = 1; });
