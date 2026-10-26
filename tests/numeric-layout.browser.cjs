/* eslint-disable @typescript-eslint/no-require-imports -- Opt-in browser check, external tooling. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const out = process.env.ONE_G_NUMERIC_OUT || '/tmp/one-g-numeric';
fs.mkdirSync(out, { recursive: true });
const box = loc => loc.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
const stable = (a, b, keys = ['x', 'width']) => keys.forEach(k => assert.ok(Math.abs(a[k] - b[k]) < .1, `${k}: ${a[k]} → ${b[k]}`));
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER, args: ['--no-sandbox'] });
  const results = [];
  try {
    for (const width of [1440, 390]) for (const locale of ['zh-CN', 'en']) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, isMobile: width === 390, hasTouch: width === 390 });
      await context.addInitScript(({locale, theme}) => {
        localStorage.setItem('one-g-locale', locale);
        localStorage.setItem('one-g-appearance-v1', theme);
      }, {locale, theme});
      let page = await context.newPage();
      page.setDefaultTimeout(15000);
      page.setDefaultNavigationTimeout(30000);
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const row = {width, locale, theme, countdown: []};
      for (const route of ['login', 'register']) {
        if (route === 'register') {
          await page.close(); page = await context.newPage(); page.setDefaultTimeout(15000);
          page.on('pageerror', e => errors.push(e.message));
        }
        console.log('CHECK', width, locale, theme, route);
        // Only Date is fixed; application intervals/RAF keep their native scheduling.
        await page.clock.setFixedTime(new Date());
        await page.goto(`${base}/${route}/`);
        await page.waitForFunction(l => document.documentElement.lang === l, locale);
        await page.evaluate(() => document.fonts.ready);
        if (route === 'login') await page.locator('#recipient').fill('demo-a@example.test');
        else {
          await page.locator('#register-nickname').fill('Numeric Test');
          await page.locator('#register-email').fill('numeric@example.test');
          await page.locator('#register-phone').fill('19900000009');
          await page.locator('#register-password').fill('NumericTest123!');
        }
        const human = page.getByRole('button', {name: locale === 'en' ? 'Simulate human verification (development only)' : '模拟人机验证（仅开发）', exact: true});
        await human.click();
        const button = page.locator('[class*="codeRow"] > button');
        await button.waitFor();
        await page.waitForFunction(() => !document.querySelector('[class*="codeRow"] > button').disabled);
        const start = await page.evaluate(() => Date.now());
        await page.clock.setFixedTime(new Date(start));
        await button.click();
        await page.waitForFunction(() => /60/.test(document.querySelector('[class*="codeRow"] > button').innerText));
        await page.waitForFunction(l => document.querySelector('[class*=resendReserve]').textContent === (l === 'en' ? '60 seconds until resend' : '60 秒后重发'), locale);
        console.log('sent', route);
        await page.evaluate(async () => { await document.fonts.load('400 14px "Inter Variable"', "0123456789"); await document.fonts.ready; });
        const before = await box(button);
        const input = page.locator('input[autocomplete="one-time-code"]');
        const inputBefore = await box(input);
        for (const [seconds, elapsed] of [[59, 1000], [58, 2000], [10, 50000], [9, 51000]]) {
          await page.clock.setFixedTime(new Date(start + elapsed));
          await page.waitForFunction(n => {
            const spans = document.querySelector('[class*="resendLabel"]').children;
            return spans[spans.length - 1].textContent.startsWith(String(n) + ' ');
          }, seconds);
          stable(before, await box(button)); stable(inputBefore, await box(input));
          assert.equal(await button.locator('[class*="resendLabel"]').evaluate(e => getComputedStyle(e).fontVariantNumeric), 'tabular-nums');
          row.countdown.push({route, seconds, button: await box(button)});
          console.log('stable', route, seconds);
        }
        await input.fill('004271'); assert.equal(await input.inputValue(), '004271');
        if (process.env.ONE_G_SKIP_SCREENSHOTS !== "1") await page.screenshot({path: `${out}/${route}-${width}-${locale}-${theme}.png`});
      }
      // Restore only existing demo fixtures; no real account or order is created.
      await page.evaluate(() => {
        localStorage.setItem('one-g-auth-demo', JSON.stringify({version: 1, userId: 'user-demo'}));
        localStorage.setItem('one-g-cart:user-demo', JSON.stringify([{productId: 'g1', quantity: 9}]));
      });
      await page.goto(`${base}/cart/`);
      const quantity = page.locator('.cart-row input[type="number"]');
      await quantity.waitFor(); await page.evaluate(() => document.fonts.ready);
      const del = page.locator('.cart-row > button'), card = page.locator('.cart-row');
      const checkout = page.locator('.cart-checkout > a');
      const qBefore = await box(quantity), delBefore = await box(del), cardBefore = await box(card), checkoutBefore = await box(checkout);
      const total = page.locator('.cart-checkout .tabular-nums');
      assert.equal(await total.textContent(), '¥ 358,200');
      await quantity.fill('10'); await quantity.blur();
      await page.waitForFunction(() => document.querySelector('.cart-checkout .tabular-nums').textContent === '¥ 398,000');
      stable(qBefore, await box(quantity)); stable(delBefore, await box(del)); stable(cardBefore, await box(card)); stable(checkoutBefore, await box(checkout));
      // Real quantity calculation crosses a monetary digit boundary.
      await quantity.fill('2'); assert.equal(await total.textContent(), '¥ 79,600');
      await quantity.fill('3'); assert.equal(await total.textContent(), '¥ 119,400');
      stable(delBefore, await box(del)); stable(checkoutBefore, await box(checkout));
      // Presentation-only price boundary fixture, using the actual formatted amount element.
      const amount = page.locator('.cart-row > p');
      for (const value of ['¥ 999', '¥ 1,000', '¥ 9,999']) {
        await amount.evaluate((e, value) => {e.textContent = value;}, value);
        stable(delBefore, await box(del)); stable(cardBefore, await box(card));
        assert.equal(await amount.evaluate(e => getComputedStyle(e).whiteSpace), 'nowrap');
      }
      assert.equal(await quantity.evaluate(e => getComputedStyle(e).fontVariantNumeric), 'tabular-nums');
      assert.equal(await page.locator('main h1').evaluate(e => getComputedStyle(e).fontVariantNumeric), 'normal');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      if (process.env.ONE_G_SKIP_SCREENSHOTS !== "1") await page.screenshot({path: `${out}/cart-${width}-${locale}-${theme}.png`});
      await page.goto(`${base}/buy/robotdock/?quantity=9`);
      const purchaseQty = page.locator('input[type="number"]');
      await purchaseQty.waitFor(); await page.waitForFunction(() => document.querySelector('input[type="number"]').value === '9');
      const purchaseBefore = await box(purchaseQty); await purchaseQty.fill('10'); stable(purchaseBefore, await box(purchaseQty));
      assert.equal(await purchaseQty.evaluate(e => getComputedStyle(e).fontVariantNumeric), 'tabular-nums');
      await page.goto(`${base}/checkout/`);
      await page.waitForFunction(() => document.querySelector('.checkout-sections .tabular-nums')?.textContent === '3');
      assert.equal(await page.locator('.checkout-sections p.tabular-nums').textContent(), '¥ 119,400');
      await page.evaluate(() => localStorage.setItem('one-g-orders:user-demo', JSON.stringify([{
        id: 'DEMO-0000123', userId: 'user-demo', demo: true, status: 'pending', payment: 'alipay',
        items: [{productId: 'g1', quantity: 3}], amount: 119400, currency: 'CNY',
        createdAt: new Date().toISOString(), idempotencyKey: 'numeric-layout-fixture'
      }])));
      await page.goto(`${base}/order-success/?order=DEMO-0000123`);
      const orderAmount = page.locator('main section .tabular-nums');
      await orderAmount.waitFor();
      assert.equal(await orderAmount.textContent(), '¥ 119,400');
      assert.equal(await orderAmount.evaluate(e => getComputedStyle(e).fontVariantNumeric), 'tabular-nums');
      assert.ok((await page.locator('main').innerText()).includes('DEMO-0000123'));
      await page.goto(`${base}/products/`); await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.product-card-price .tabular-nums').first().evaluate(e => getComputedStyle(e).fontVariantNumeric), 'tabular-nums');
      await page.goto(`${base}/products/g1/`); await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.product-detail-copy > .tabular-nums').textContent(), '¥ 39,800');
      assert.equal(await page.evaluate(t => document.documentElement.classList.contains(t), theme), true);
      assert.deepEqual(errors, []);
      row.quantity = '9 → 10'; row.amount = ['79,600 → 119,400 (real calculation)', '999 → 1,000 → 9,999 (DOM fixture)'];
      results.push(row); console.log('PASS', width, locale, theme);
      fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exitCode = 1;});
