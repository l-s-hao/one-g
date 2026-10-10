/* eslint-disable @typescript-eslint/no-require-imports -- Browser regression test. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const production = process.env.ONE_G_TEST_PRODUCTION === '1';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.ONE_G_BROWSER });
  const errors = [];
  const names = { standard: '标准显示', night: '夜间模式', 'eye-comfort': '护眼模式', 'color-vision-safe': '色觉友好' };
  try {
    const cases = [[undefined, false, 'standard'], ['standard', false, 'standard'], ['night', false, 'night'], ['color-vision-safe', false, 'color-vision-safe'], ['eye-comfort', false, 'eye-comfort'], ['caribbean-calcite', false, 'eye-comfort']];
    if (!production) cases.push(['eye-comfort', true, 'eye-comfort'], ['caribbean-calcite', true, 'eye-comfort']);
    for (const [saved, loggedIn, expected] of cases) {
      const context = await browser.newContext();
      await context.addInitScript(({saved, loggedIn}) => {
        if (sessionStorage.getItem('hydration-seed')) return;
        sessionStorage.setItem('hydration-seed', '1');
        if (loggedIn) localStorage.setItem('one-g-auth-demo', JSON.stringify({version: 1, userId: 'user-demo'}));
        if (saved) localStorage.setItem(loggedIn ? 'one-g-theme:user-demo' : 'one-g-theme', saved === 'caribbean-calcite' ? saved : JSON.stringify({version: 2, displayMode: saved}));
      }, {saved, loggedIn});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && /hydrat|didn't match|did not match|server rendered/i.test(m.text())) errors.push(m.text()); });
      const check = async response => {
        // Inspect the actual response before React, independently of the hydrated DOM.
        const html = await response.text();
        const start = html.indexOf('id="header-accessibility"');
        const selector = html.slice(start, html.indexOf('</fieldset>', start));
        assert.match(selector, /当前：<!-- -->标准显示/);
        assert.equal((selector.match(/disabled=""/g) || []).length, 4);
        assert.equal((selector.match(/checked=""/g) || []).length, 0);
        await page.waitForFunction(() => {
          const button = document.querySelector('#header-accessibility button');
          return button && !button.disabled;
        });
        await page.waitForFunction(mode => document.documentElement.dataset.theme === mode, expected);
        await page.waitForFunction(() => !document.querySelector('#header-accessibility input[aria-label="夜间模式"]').disabled);
        assert.equal(await page.locator('html').getAttribute('data-theme'), expected);
        const controls = page.locator('#header-accessibility');
        assert.equal(await controls.locator('p').textContent(), `当前：${names[expected]}`);
        for (const [mode, name] of Object.entries(names)) if (mode !== 'standard') {
          const input = controls.locator(`input[aria-label="${name}"]`);
          assert.equal(await input.isChecked(), mode === expected);
          assert.equal(await input.evaluate(el => el.disabled), false, `${saved}: ${mode}`);
        }
        assert.equal(await controls.locator('small').count(), 0);
      };
      await check(await page.goto(base + (loggedIn ? '/account/' : '/products/')));
      await check(await page.reload());
      await page.setViewportSize({width: 390, height: 844});
      await check(await page.reload());
      await context.close();
      console.log(`PASS direct + desktop/mobile full refresh: ${saved || 'no preference'}, authenticated=${loggedIn} => ${expected}`);
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
