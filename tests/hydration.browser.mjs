import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';
const { chromium } = await import(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const production = process.env.ONE_G_PRODUCTION === '1';
const base = process.env.ONE_G_TEST_URL || 'http://127.0.0.1:5558/one-g';
// 仅用于保留修复前对照；默认路径必须保持全部 console/pageerror 断言。
const legacy = process.env.ONE_G_LEGACY_CARET === '1';
const evidence = createBrowserEvidence({ name: 'hydration', condition: production ? 'production' : 'warm' });
let browser, page;
const results = [];
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.ONE_G_BROWSER });
  for (const method of ['fresh', 'direct', 'refresh', 'screenshot']) {
    for (const locale of method === 'fresh' ? ['zh-CN'] : ['zh-CN', 'en']) for (const theme of method === 'fresh' ? ['light'] : ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
      if (method !== 'fresh') await context.addInitScript(({ locale, theme }) => {
        localStorage.setItem('one-g-locale', locale);
        localStorage.setItem('one-g-appearance-v1', theme);
      }, { locale, theme });
      page = await context.newPage();
      await evidence.attach(page);
      const errors = [], mutations = [];
      page.on('console', message => { if (message.type() === 'error') { errors.push(message.text()); evidence.record('console-error', { case: `${method}-${locale}-${theme}`, text: message.text() }); } });
      page.on('pageerror', error => errors.push(error.message));
      await page.exposeBinding('recordHydrationMutation', (_, value) => { mutations.push(value); evidence.record('input-style-mutation', { case: `${method}-${locale}-${theme}`, ...value }); });
      await page.addInitScript(() => {
        new MutationObserver(records => {
          for (const record of records) if (record.type === 'attributes' && record.target instanceof HTMLInputElement && record.attributeName === 'style') {
            // 不读取 value；记录导致 hydration 差异的属性及是否发生在测试截图期间。
            void window.recordHydrationMutation({ id: record.target.id || null, caret: record.target.style.caretColor, elapsedMs: Math.round(performance.now()) });
          }
        }).observe(document, { subtree: true, attributes: true, attributeFilter: ['style'] });
      });
      const url = base + '/register/?region=mainland';
      const response = await page.goto(url, { waitUntil: 'load' });
      let documentHTML = await response.text();
      if (method === 'refresh') {
        const refreshed = await page.reload(); documentHTML = await refreshed.text();
      }
      await page.locator('#register-nickname').waitFor();
      const id = `${method}-${locale}-${theme}`;
      // 原始 Document 响应只截取 input 标签；空白测试页面且排除 value，避免收集任何凭据。
      const inputs = [...documentHTML.matchAll(/<input\b[^>]*>/g)].map(match => match[0].replace(/\svalue="[^"]*"/g, ''));
      fs.writeFileSync(path.join(evidence.dir, `${id}-document-inputs.html`), inputs.join('\n'));
      if (method.endsWith('screenshot')) {
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(evidence.dir, `${id}.png`), fullPage: true, ...(legacy ? {} : { caret: 'initial' }), mask: [page.locator('input,[class*="demo"]')] });
      }
      await page.waitForFunction(({ locale, theme }) => document.documentElement.lang === locale && document.documentElement.classList.contains(theme), { locale, theme });
      // 用真实交互核对初始化后的功能；不以警告消失代替控件可用。
      await page.locator('#register-nickname').fill('Fictional Hydration');
      await page.locator('[data-theme-toggle]').click();
      await page.waitForFunction(theme => !document.documentElement.classList.contains(theme), theme);
      assert.equal(await page.locator('#register-nickname').inputValue(), 'Fictional Hydration');
      await page.locator('[data-language-toggle]').click();
      await page.waitForFunction(locale => document.documentElement.lang !== locale, locale);
      assert.equal(await page.locator('#register-nickname').inputValue(), 'Fictional Hydration');
      if (!legacy) assert.deepEqual(mutations, [], 'Screenshot must not rewrite input inline style');
      const row = { id, production, legacy, pathname: '/one-g/register/?region=mainland', signedIn: false, errors, mutations, interactionsPassed: true };
      results.push(row);
      fs.writeFileSync(path.join(evidence.dir, 'cases.json'), JSON.stringify(results, null, 2));
      evidence.record('hydration-case', { id, production, legacy, errorCount: errors.length, caretMutationCount: mutations.length, interactionsPassed: true });
      await context.close();
    }
  }
  if (!production) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    await context.addInitScript(() => { localStorage.setItem('one-g-auth-demo', JSON.stringify({ version: 1, userId: 'user-demo' })); });
    page = await context.newPage(); await evidence.attach(page);
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/buy/robotdock/?package=hand&quantity=3&payment=bank-transfer');
    await page.waitForFunction(() => document.querySelector('main input[type=number]')?.value === '3' && document.querySelector('input[type=radio][value="hand"]')?.checked && document.querySelector('input[type=radio][value="bank-transfer"]')?.checked);
    const selection = () => page.evaluate(() => ({ quantity: document.querySelector('main input[type=number]')?.value, radios: [...document.querySelectorAll('main input[type=radio]:checked')].map(node => node.value) }));
    const before = await selection();
    await page.locator('[data-theme-toggle]').click();
    await page.locator('[data-language-toggle]').click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    assert.deepEqual(await selection(), before);
    await page.locator('header [data-navigation-item="/products"] > a').hover();
    await page.locator('#desktop-nav-0').waitFor({ state: 'visible' });
    assert.ok(await page.locator('#desktop-nav-0 [data-header-image-card]').count() > 0);
    await page.locator('header [data-navigation-item="/products"] > a').click();
    await page.waitForURL('**/products/');
    assert.deepEqual(errors, []);
    evidence.record('purchase-and-navigation-check', { choicesRetained: true, hoverPreviewVisible: true, navigationCompleted: true, errorCount: errors.length });
    fs.writeFileSync(path.join(evidence.dir, 'purchase-navigation.json'), JSON.stringify({ choicesRetained: true, hoverPreviewVisible: true, navigationCompleted: true }));
    await context.close();
  }
  assert.deepEqual(results.flatMap(row => row.errors), []);
  evidence.finish('passed'); console.log(`PASS ${results.length} hydration cases; legacy=${legacy}, production=${production}`);
} catch (error) { await evidence.fail(error, page); console.error(evidence.safeError(error)); process.exitCode = 1; }
finally { await browser?.close(); }
