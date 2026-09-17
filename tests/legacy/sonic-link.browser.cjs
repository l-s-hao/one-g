/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS browser harness. */
// Run with NODE_PATH pointing to an available Playwright installation.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(15000);
    const base = process.env.ONE_G_TEST_URL || 'http://127.0.0.1:4174/one-g';
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto(`${base}/products/sonic-link/`); await page.waitForURL('**/login/**');
    assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/products/sonic-link');
    await page.locator('input[name="email"],input[name="account"]').fill('user@one-g.com');
    await page.locator('input[name="password"]').fill('123456'); await page.locator('form button[type="submit"]').click();
    await page.waitForURL('**/products/sonic-link/'); await page.reload();
    await page.getByRole('heading', { name: 'SONIC Link', exact: true }).waitFor();
    assert.equal(await page.locator('iframe').count(), 0);
    await page.getByRole('link', { name: '配置预览', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: '加入购物车', exact: true }).count(), 0);
    assert.equal(await page.locator('header [data-brand-logo]').filter({ visible: true }).count(), 1);
    assert.equal(await page.locator('footer [data-brand-logo]').count(), 1);
    assert.match(await page.title(), /SONIC Link.*即将开放/);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://l-s-hao.github.io/one-g/products/sonic-link/');
    await page.getByRole('button', { name: '咨询客服', exact: true }).click(); await page.locator('a[href="mailto:service@one-g.com"]').waitFor();
    for (const theme of ['dark', 'zandan-green', 'aegean-blue', 'falu-red', 'burnt-brick', 'color-vision-safe', 'monochrome']) {
      await page.evaluate(t => { localStorage.setItem('one-g-theme:user-demo', ['color-vision-safe', 'monochrome'].includes(t) ? 'dark' : t); localStorage.setItem('one-g-accessibility-theme', ['color-vision-safe', 'monochrome'].includes(t) ? t : 'null'); }, theme);
      await page.goto(`${base}/products/sonic-link/`); await page.waitForFunction(t => document.documentElement.dataset.theme === t, theme);
      console.log('theme', theme);
      for (const img of await page.locator('article img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(e => Promise.race([e.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error("Image decode timed out")), 10000))])); assert.ok(!(await img.evaluate(e => getComputedStyle(e).filter)).includes('invert')); }
    }
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: `.next/sonic-link-${width}.png`, fullPage: true });
    }
    await page.goto(`${base}/products/`);
    const card = page.locator('a.product-card[href$="/products/sonic-link/"]');
    await card.waitFor(); assert.match(await card.innerText(), /即将开放/); assert.match(await card.innerText(), /了解产品/);
    await page.getByRole('tab', { name: '配件', exact: true }).click(); await card.waitFor();
    for (const slug of ['robotdock', 'g1', 'g1-pro', 'arm-a1', 'arm-a2', 'hand-d1', 'vision-v1', 'rgbd', 'lidar-kit']) {
      await page.goto(`${base}/products/${slug}/`); await page.locator('h1').waitFor();
      if (slug === 'robotdock') { assert.equal(await page.locator('[data-bundle-id]').count(), 4); await page.getByRole('link', { name: '配置预览', exact: true }).waitFor(); }
    }
    for (const id of ['robot', 'robotdock']) {
      await page.goto(`${base}/configure/${id}/`); await page.waitForSelector('#workbench-build[aria-busy="false"]');
      assert.equal(await page.getByTestId('configuration-total').innerText(), id === 'robotdock' ? '价格待定' : '¥ 97,800');
    }
    assert.deepEqual(errors, []); console.log('PASS: auth return, shell, metadata, seven themes, images, mobile, catalog, all product pages and both configurators');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
