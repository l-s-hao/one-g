/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser tooling. */
const {chromium} = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const out = process.env.ONE_G_STAGGER_OUT || '/tmp/one-g-stagger';
fs.mkdirSync(out, {recursive: true});
function instrument() {
  window.entrances = [];
  window.entranceObservers = [];
  const native = Element.prototype.animate;
  Element.prototype.animate = function(frames, options) {
    if (this.matches('[data-stagger-group] > [data-card-hover-host]')) {
      const record = {text: this.textContent.slice(0, 40), frames, options, started: performance.now(), target: this};
      window.entrances.push(record);
    }
    return native.call(this, frames, options);
  };
  const NativeObserver = window.IntersectionObserver;
  window.IntersectionObserver = class extends NativeObserver {
    constructor(...args) {super(...args); this.targets = new Set(); window.entranceObservers.push(this);}
    observe(el) {this.targets.add(el); return super.observe(el);}
    unobserve(el) {this.targets.delete(el); return super.unobserve(el);}
    disconnect() {this.targets.clear(); return super.disconnect();}
  };
}
const samples = p => p.evaluate(() => window.entrances.map(({target, ...r}) => ({...r, connected: target.isConnected})));
const settled = async p => {
  await p.waitForTimeout(900);
  assert.equal(await p.locator('[data-stagger-group] > *').evaluateAll(items => items.every(e => getComputedStyle(e).opacity === '1' && e.getAnimations().length === 0)), true);
};
(async () => {
  const browser = await chromium.launch({executablePath: process.env.ONE_G_BROWSER, args: ['--no-sandbox', '--enable-unsafe-swiftshader']});
  const results = [];
  try {
    for (const width of (process.env.ONE_G_STAGGER_LIFECYCLE_ONLY ? [] : [1440, 390])) for (const locale of ['zh-CN', 'en']) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({viewport: {width, height: 900}, isMobile: width === 390, hasTouch: width === 390});
      await context.addInitScript(({locale, theme}) => {localStorage.setItem('one-g-locale', locale); localStorage.setItem('one-g-appearance-v1', theme);}, {locale, theme});
      await context.addInitScript(instrument);
      const page = await context.newPage(); page.setDefaultTimeout(15000);
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      for (const route of ['/deep-customization/', '/products/robotdock/', '/solutions/teleoperation/']) {
        await page.goto(base + route);
        await page.waitForFunction(l => document.documentElement.lang === l, locale);
        const groups = page.locator('[data-stagger-group]');
        assert.ok(await groups.count() > 0);
        for (let index = 0; index < await groups.count(); index++) {
          const group = groups.nth(index);
          await group.scrollIntoViewIfNeeded();
          // Mobile groups can span several viewports; each host is observed on its own first entry.
          for (const item of await group.locator(':scope > *').all()) await item.scrollIntoViewIfNeeded();
        }
        await settled(page);
        const records = await samples(page); assert.ok(records.length > 0);
        for (const r of records) {
          assert.equal(r.options.duration, 350); assert.ok(r.options.delay >= 0 && r.options.delay <= 500);
          assert.equal(r.options.delay % 100, 0);
          assert.deepEqual(r.frames, [{opacity: 0, transform: 'translateY(8px)'}, {opacity: 1, transform: 'translateY(0)'}]);
        }
        if (width === 1440 && route === '/deep-customization/') assert.deepEqual(records.slice(0, 4).map(r => r.options.delay), [0, 100, 200, 300]);
        await page.evaluate(() => scrollTo(0, 0)); await groups.first().scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
        assert.equal((await samples(page)).length, records.length, 'scrolling back must not replay');
        // Real locale and theme controls must preserve hosts and the played set.
        const firstHost = await groups.first().locator(':scope > *').first().elementHandle();
        const language = page.locator("[data-language-toggle]");
        await language.click(); await page.locator('[data-theme-toggle]').click(); await page.waitForTimeout(500);
        assert.equal(await firstHost.evaluate(e => e.isConnected), true);
        assert.equal((await samples(page)).length, records.length);
        await settled(page);
        assert.deepEqual(errors, []);
        results.push({width, locale, theme, route, count: records.length, delays: records.map(r => r.options.delay)});
      }
      await page.screenshot({path: `${out}/final-${width}-${locale}-${theme}.png`});
      await context.close(); console.log('PASS matrix', width, locale, theme);
    }
    // Focus and pointer interaction immediately settle only the card being operated.
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    await context.addInitScript(instrument);
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    await page.goto(base + '/products/robotdock/');
    const target = page.locator('#applications [data-stagger-group] > *').first();
    await target.evaluate(e => e.scrollIntoView({block: 'center'}));
    await page.waitForFunction(() => document.querySelector('#applications [data-stagger-group] > *').getAnimations().length > 0);
    await target.locator('a').focus();
    assert.equal(await target.evaluate(e => getComputedStyle(e).opacity), '1');
    assert.equal(await target.evaluate(e => e.getAnimations().length), 0);
    await target.locator('a').click(); await page.waitForURL(/\/solutions\//);
    await page.waitForFunction(() => !window.entranceObservers.some(o => [...o.targets].some(e => e.matches('[data-stagger-group] > [data-card-hover-host]') && !e.isConnected)));
    // Reduced motion, unavailable Observer/WAAPI, failed animation and no JavaScript all stay visible.
    for (const mode of ['reduce', 'no-observer', 'no-animation', 'throw-animation', 'throw-observer', 'cancel', 'hidden']) {
      const c = await browser.newContext({reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference', viewport: {width: 1440, height: 900}});
      await c.addInitScript(instrument);
      await c.addInitScript(mode => {
        if (mode === 'no-observer') window.IntersectionObserver = undefined;
        if (mode === 'throw-observer') window.IntersectionObserver = class {constructor() {throw Error('observer test');}};
        if (mode === 'no-animation') Element.prototype.animate = undefined;
        if (mode === 'throw-animation') {const original = Element.prototype.animate; Element.prototype.animate = function(...args) {if (this.matches('[data-stagger-group] > *')) throw Error('animation test'); return original.apply(this, args);};}
      }, mode);
      const p = await c.newPage(); await p.goto(base + '/deep-customization/');
      const group = p.locator('[data-stagger-group]').first(); await group.scrollIntoViewIfNeeded();
      if (mode === 'cancel') await group.evaluate(e => e.getAnimations({subtree:true}).forEach(a => a.cancel()));
      if (mode === 'hidden') await p.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange'));});
      await settled(p);
      if (['reduce','no-observer','no-animation','throw-observer'].includes(mode)) assert.equal((await samples(p)).length, 0);
      await c.close(); console.log('PASS fallback', mode);
    }
    const nojs = await browser.newContext({javaScriptEnabled: false}); const p = await nojs.newPage();
    await p.goto(base + '/deep-customization/'); assert.equal(await p.locator('[data-stagger-group] > *').evaluateAll(es => es.every(e => getComputedStyle(e).opacity === '1')), true); await nojs.close();
    // Interrupt active entrance via a real internal link and ensure no detached observers remain.
    for (let i = 0; i < 3; i++) {
      await page.goto(base + '/products/robotdock/'); await page.locator('#applications [data-stagger-group] a').first().scrollIntoViewIfNeeded();
      await page.locator('#applications [data-stagger-group] a').first().click(); await page.waitForURL(/\/solutions\//);
      await page.waitForFunction(() => !window.entranceObservers.some(o => [...o.targets].some(e => e.matches('[data-stagger-group] > [data-card-hover-host]') && !e.isConnected)));
    }
    await context.close();
    fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
    console.log('PASS focus, card interaction, rapid navigation, cleanup, no-JS; matrix', results.length);
  } finally {await browser.close();}
})().catch(e => {console.error(e); process.exitCode = 1;});
