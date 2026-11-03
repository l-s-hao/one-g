import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';
const { chromium } = await import(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const base = process.env.ONE_G_TEST_URL || 'http://127.0.0.1:5560/one-g';
const evidence = createBrowserEvidence({ name: 'catalog-actions', condition: process.env.ONE_G_PRODUCTION === '1' ? 'production' : 'warm' });
const baseline = process.env.ONE_G_CATALOG_BASELINE ? JSON.parse(fs.readFileSync(process.env.ONE_G_CATALOG_BASELINE, 'utf8')) : null;
const result = { matrix: [], checks: [], errors: [] };
const selector = '#product-catalog [data-product-id="robotdock"] [data-catalog-actions] > a[data-button-intent="ordinary"]';
let browser, page;
async function open(width = 1440, locale = 'zh-CN', theme = 'light', options = {}) {
  const context = await browser.newContext({ viewport: { width, height: 950 }, reducedMotion: 'no-preference', ...options });
  await context.addInitScript(({ locale, theme }) => { localStorage.setItem('one-g-locale', locale); localStorage.setItem('one-g-appearance-v1', theme); }, { locale, theme });
  page = await context.newPage(); await evidence.attach(page);
  page.on('console', message => { if (message.type() === 'error') result.errors.push(message.text()); });
  page.on('pageerror', error => result.errors.push(error.message));
  await page.goto(base + '/products/');
  await page.waitForFunction(locale => document.documentElement.lang === locale && document.querySelector('[data-catalog-actions]'), locale);
  await page.evaluate(() => document.fonts.ready); await page.mouse.move(0, 0);
  return context;
}
async function settle(y, target = selector) {
  await page.waitForFunction(({ target, y }) => {
    const link = document.querySelector(target), surface = link?.firstElementChild;
    if (!surface) return false;
    const transform = getComputedStyle(surface).transform;
    const offset = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
    return Math.abs(offset - y) < .001 && !link.getAnimations({ subtree: true }).some(animation => animation.playState === 'running');
  }, { target, y });
}
const state = link => link.evaluate(node => {
  const visual = node.firstElementChild, s = getComputedStyle(visual), a = getComputedStyle(node);
  const rect = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
  const card = node.closest('[data-product-id]').querySelector('[data-card-hover-surface]');
  return { outer: rect(node), visual: rect(visual), card: rect(card), transform: s.transform, shadow: s.boxShadow, background: s.backgroundColor, color: s.color, border: s.borderColor, borderWidth: s.borderWidth, padding: s.padding, fontSize: s.fontSize, fontWeight: s.fontWeight, radius: s.borderRadius, transitionProperty: s.transitionProperty, duration: s.transitionDuration, easing: s.transitionTimingFunction, outerBackground: a.backgroundColor, decoration: a.textDecorationLine, focus: { style: a.outlineStyle, width: a.outlineWidth }, arrow: visual.querySelector('[aria-hidden]') ? getComputedStyle(visual.querySelector('[aria-hidden]')).transform : null };
});
function near(a, b, message) { assert.ok(Math.abs(a - b) < .1, `${message}: ${a} vs ${b}`); }
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.ONE_G_BROWSER });
  for (const width of [1440, 390]) for (const locale of ['zh-CN', 'en']) for (const theme of ['light', 'dark']) {
    const context = await open(width, locale, theme);
    const cards = await page.locator('#product-catalog article').evaluateAll(nodes => nodes.map(card => {
      const rect = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
      return { id: card.dataset.productId, rect: rect(card), links: [...card.querySelectorAll('[data-catalog-actions] a')].map(a => ({ text: a.textContent, href: a.getAttribute('href'), rect: rect(a) })) };
    }));
    if (baseline) {
      const old = baseline.find(row => row.width === width && row.locale === locale && row.theme === theme);
      assert.deepEqual(cards.map(card => card.id), old.cards.map(card => card.id));
      for (const [index, card] of cards.entries()) {
        const before = old.cards[index];
        for (const key of ['x', 'y', 'width', 'height']) near(card.rect[key], before.rect[key], `card ${card.id} ${key}`);
        assert.equal(card.links.length, before.links.length);
        for (const [i, link] of card.links.entries()) {
          assert.equal(link.text, before.links[i].text); assert.equal(link.href, before.links[i].href);
          for (const key of ['x', 'y', 'width', 'height']) near(link.rect[key], before.links[i].rect[key], `link ${card.id} ${key}`);
        }
      }
    }
    assert.equal(cards.some(card => card.id === 'sonic-link'), false);
    const link = page.locator(selector); await link.scrollIntoViewIfNeeded();
    // 先稳定既有卡片上浮，再测按钮自身命中框与2px视觉位移，避免混淆两层坐标。
    const card = page.locator('[data-product-id="robotdock"]'); await card.hover({ position: { x: 12, y: 12 } });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-product-id="robotdock"] > [data-card-hover-surface]')).translate.endsWith('-4px'));
    const before = await state(link);
    await link.hover(); await settle(-2); const hover = await state(link);
    near(hover.outer.width, before.outer.width, 'stable hit width'); near(hover.outer.height, before.outer.height, 'stable hit height');
    near(hover.outer.y - hover.card.y, before.outer.y - before.card.y, 'hit area relative to card');
    near(hover.visual.y - hover.outer.y, -2, 'whole visual surface lifted');
    assert.notEqual(hover.background, before.background); assert.notEqual(hover.color, before.color); assert.notEqual(hover.shadow, 'none');
    assert.equal(hover.decoration, 'none'); assert.equal(hover.duration, '0.2s');
    assert.equal(hover.easing, 'cubic-bezier(0.22, 1, 0.36, 1)');
    assert.equal(hover.transitionProperty, 'transform, background-color, color, border-color, box-shadow');
    assert.equal(await link.locator('[aria-hidden]').evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41), 2);
    assert.equal(hover.borderWidth, before.borderWidth); assert.equal(hover.padding, before.padding);
    await page.screenshot({ path: path.join(evidence.dir, `hover-${width}-${locale}-${theme}.png`), caret: 'initial' });
    await page.mouse.down(); await settle(0); const pressed = await state(link); assert.equal(pressed.shadow, 'none');
    assert.equal(await link.locator('[aria-hidden]').evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41), 0);
    await page.screenshot({ path: path.join(evidence.dir, `pressed-${width}-${locale}-${theme}.png`), caret: 'initial' });
    await page.mouse.move(0, 0); await page.mouse.up(); await settle(0);
    const rest = await state(link); assert.equal(rest.background, before.background); assert.equal(rest.shadow, 'none');
    const purchase = card.locator('[data-catalog-actions] > a[data-button-intent="purchase"]');
    assert.equal(await purchase.locator('[aria-hidden]').count(), 0, 'Do not add a purchase arrow');
    await purchase.hover(); const buySelector = selector.replace('ordinary', 'purchase'); await settle(-2, buySelector);
    const buyHover = await state(purchase); assert.notEqual(buyHover.background, hover.background);
    result.matrix.push({ width, locale, theme, cards: cards.length, defaultGeometryMatches: !!baseline, hoverY: -2, pressY: 0, stableHitArea: true, invertAndShadow: true });
    await context.close();
  }
  const context = await open(); const link = page.locator(selector); await link.hover(); await settle(-2);
  await link.evaluate(node => { window.catalogEdgeCounts = { enter: 0, leave: 0 }; node.addEventListener('pointerenter', () => window.catalogEdgeCounts.enter++); node.addEventListener('pointerleave', () => window.catalogEdgeCounts.leave++); });
  const box = await link.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + 1); await settle(-2);
  assert.deepEqual(await page.evaluate(() => window.catalogEdgeCounts), { enter: 0, leave: 0 });
  for (let i = 0; i < 6; i++) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.move(box.x + box.width + 12, box.y + box.height / 2); }
  await page.mouse.move(0, 0); await settle(0); assert.equal((await state(link)).shadow, 'none');
  result.checks.push('Edge hover does not oscillate; rapid enter/leave restores full surface');
  // 以下仅在隔离浏览器标记现有Link状态，不增加应用的disabled/loading业务或改变跳转语义。
  for (const attribute of ['aria-disabled', 'aria-busy']) {
    await link.evaluate((node, attribute) => node.setAttribute(attribute, 'true'), attribute);
    await link.hover(); await settle(0); const snapshot = await state(link); assert.equal(snapshot.shadow, 'none'); assert.equal(snapshot.duration, '0s');
    await page.mouse.down(); await settle(0); await page.mouse.move(0, 0); await page.mouse.up();
    await link.evaluate((node, attribute) => node.removeAttribute(attribute), attribute);
  }
  await link.hover(); await settle(-2);
  await page.locator('#product-catalog').evaluate(node => node.setAttribute('data-card-hover-disabled', 'true'));
  await settle(0); assert.equal((await state(link)).duration, '0s');
  await page.locator('#product-catalog').evaluate(node => node.removeAttribute('data-card-hover-disabled'));
  await settle(-2); await page.mouse.move(0, 0); await settle(0);
  result.checks.push('Synthetic disabled/loading presentation states do not lift or press; no claim of new catalog loading workflow');
  const g1 = '#product-catalog [data-product-id="g1"] [data-catalog-actions] > a';
  await page.locator(g1).hover(); await settle(-2, g1);
  const robotTab = page.getByRole('tab', { name: /机器人/ }); await robotTab.focus(); await robotTab.press('Enter');
  await page.waitForFunction(() => document.getElementById('product-catalog').hasAttribute('data-filter-animating'));
  await settle(0, g1); assert.equal((await state(page.locator(g1))).duration, '0s');
  for (const name of ['机械臂', '灵巧手', '全部']) await page.getByRole('tab', { name: new RegExp(name) }).click();
  await page.waitForFunction(() => { const grid = document.getElementById('product-catalog'); return !grid.inert && !grid.hasAttribute('data-filter-animating') && !grid.querySelector('[data-filter-hidden]'); });
  await link.hover(); await settle(-2); await page.mouse.move(0, 0); await settle(0);
  result.checks.push('Actual Flip flag/inert cancels button offset immediately; rapid filtering settles and restores hover');
  await link.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  assert.equal(await link.evaluate(node => node === document.activeElement), true); assert.equal((await state(link)).focus.style, 'solid');
  const originalURL = page.url(); await page.keyboard.press('Space'); assert.equal(page.url(), originalURL);
  await page.keyboard.press('Enter'); await page.waitForURL('**/products/robotdock/');
  assert.equal(await page.locator('[data-catalog-actions]').count(), 0);
  await page.goto(base + '/products/'); await page.locator(selector).waitFor();
  await page.locator('[data-product-id="robotdock"] [data-catalog-actions] > a[data-button-intent="purchase"]').click();
  await page.waitForURL('**/buy/robotdock/');
  assert.equal(await page.locator('input[name="package-robotdock"]').count(), 4);
  assert.equal(await page.getByRole('button', { name: '加入购物车', exact: true }).isDisabled(), true);
  for (const route of ['/', '/solutions/', '/about/']) { await page.goto(base + route); await page.locator('main h1').waitFor(); assert.equal(await page.locator('[data-catalog-actions]').count(), 0); }
  result.checks.push('Keyboard focus and native Link Enter/Space preserved; purchase remains concept preview; home/solutions/About have no catalog action variant');
  await context.close();
  const reduced = await open(1440, 'zh-CN', 'light', { reducedMotion: 'reduce' }); const still = page.locator(selector);
  const initialColor = (await state(still)).background; await still.hover(); await settle(0);
  assert.equal((await state(still)).duration, '0s'); assert.notEqual((await state(still)).background, initialColor); await reduced.close();
  const touch = await open(390, 'en', 'dark', { isMobile: true, hasTouch: true }); const tap = page.locator(selector);
  assert.equal(await page.evaluate(() => matchMedia('(hover:hover) and (pointer:fine)').matches), false);
  await tap.tap(); await page.waitForURL('**/products/robotdock/'); assert.equal(await page.locator('[data-catalog-actions]').count(), 0); await touch.close();
  result.checks.push('Reduced motion keeps instant inversion without displacement; touch performs one-tap navigation without hover activation');
  const longLabel = await open(390, 'zh-CN', 'light', { reducedMotion: 'reduce' });
  // 临时改文案必须等真实分类事件完成水合，不能在SSR文本上提前制造水合差异。
  await page.getByRole('tab', { name: /机器人/ }).click();
  await page.waitForFunction(() => new URL(location.href).searchParams.get('category') === 'robot' && document.querySelector('[role="tab"][aria-selected="true"]')?.textContent.includes('机器人'));
  await page.getByRole('tab', { name: /全部/ }).click();
  await page.waitForFunction(() => !new URL(location.href).searchParams.has('category') && !document.querySelector('#product-catalog [data-filter-hidden]'));

  await page.locator(selector).evaluate(node => { node.firstElementChild.firstChild.textContent = '了解此商品的详细功能与使用说明 '; });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await page.locator(selector).evaluate(node => node.getBoundingClientRect().width <= node.parentElement.getBoundingClientRect().width), true);
  await page.screenshot({ path: path.join(evidence.dir, 'synthetic-long-chinese.png'), caret: 'initial' });
  await longLabel.close();
  result.checks.push('Isolated long-Chinese-label stress probe wraps within the original action area; production copy unchanged');

  assert.deepEqual(result.errors, []); fs.writeFileSync(path.join(evidence.dir, 'results.json'), JSON.stringify(result, null, 2)); evidence.finish('passed'); console.log(`PASS catalog actions: ${result.matrix.length} visual combinations and ${result.checks.length} interaction groups`);
} catch (error) { fs.writeFileSync(path.join(evidence.dir, 'results.json'), JSON.stringify(result, null, 2)); await evidence.fail(error, page); console.error(evidence.safeError(error)); process.exitCode = 1; }
finally { await browser?.close(); }
