/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser tooling. */
const {chromium} = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
(async () => {
  const browser = await chromium.launch({executablePath: process.env.ONE_G_BROWSER, args: ['--no-sandbox', '--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 900}}); page.setDefaultTimeout(15000);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/');
    assert.equal(await page.locator('[data-stagger-group]').count(), 0);
    for (const namespace of ['home-products', 'home-solutions']) {
      const grid = page.locator(`[data-layout-grid="${namespace}"]`);
      await grid.locator('button[aria-expanded]').first().click();
      await page.waitForTimeout(550);
      assert.equal(await grid.locator('[data-preview-panel]').count(), 1);
      await page.keyboard.press('Escape'); await page.waitForTimeout(600);
      assert.equal(await grid.locator('[data-preview-panel]').count(), 0);
      assert.equal(await grid.getAttribute('data-card-hover-disabled'), null);
      await grid.locator('button[aria-expanded]').first().click(); await page.waitForTimeout(70);
      await page.keyboard.press('Escape'); await page.waitForTimeout(600);
      assert.equal(await grid.getAttribute('data-card-hover-disabled'), null);
    }
    console.log('PASS existing Hero excluded; both Layout Grids expand/close/interrupt');
    await page.goto(base + '/products/');
    assert.equal(await page.locator('[data-stagger-group]').count(), 0);
    for (const [label, ids] of [['机械臂', ['arm-a1', 'arm-a2']], ['视觉系统', ['vision-v1', 'rgbd', 'lidar-kit']], ['机器人', ['robotdock', 'g1', 'g1-pro']]]) {
      await page.getByRole('tab', {name: label, exact: true}).click();
      await page.waitForSelector('#product-catalog[data-filter-animating]');
      await page.waitForFunction(() => !document.querySelector('#product-catalog').hasAttribute('data-filter-animating'));
      assert.deepEqual(await page.locator('#product-catalog > [data-product-id]:not([data-filter-hidden])').evaluateAll(es => es.map(e => e.dataset.productId)), ids);
      assert.equal(await page.locator('#product-catalog').evaluate(e => e.inert), false);
    }
    console.log('PASS existing GSAP Flip, final visibility and interactivity');
    const opener = page.locator('header [data-navigation-item="/products"] > a');
    await opener.hover();
    const panel = page.locator('#' + await opener.getAttribute('aria-controls'));
    await panel.waitFor({state: 'visible'}); await page.waitForTimeout(500);
    assert.equal(await panel.locator('[data-layout="grid"]').count(), 1);
    assert.equal(await panel.locator('[data-stagger-group]').count(), 0);
    await panel.getByRole('button', {name: '机械臂', exact: true}).click();
    await page.waitForTimeout(450);
    assert.equal(await panel.locator('[data-header-image-card]').count(), 2);
    await page.keyboard.press('Escape'); await panel.waitFor({state:'hidden'});
    console.log('PASS existing MenuToGrid, menu category and panel close');
    await page.goto(base + '/about/');
    assert.equal(await page.locator('main [data-stagger-group]').count(), 0);
    const frame = page.locator('.scroll-expand__frame'); await frame.waitFor();
    const before = await frame.evaluate(e => getComputedStyle(e).clipPath);
    await page.evaluate(() => scrollTo(0, 650)); await page.waitForTimeout(600);
    const after = await frame.evaluate(e => getComputedStyle(e).clipPath);
    assert.notEqual(after, before);
    const lanyard = page.locator('#brand-lanyard'); await lanyard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    assert.ok(await lanyard.locator('canvas, img').count() > 0);
    const canvas = lanyard.locator('canvas').first();
    if (await canvas.count()) {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 20, {steps: 4}); await page.mouse.up();
    }
    assert.deepEqual(errors, []);
    console.log('PASS About ScrollExpand responds to scroll; Lanyard mounts/drag smoke; no added entrance');
    const touch = await browser.newContext({viewport: {width:390,height:844},isMobile:true,hasTouch:true});
    const mobile = await touch.newPage(); await mobile.goto(base + '/products/');
    await mobile.getByRole('tab',{name:'机械臂',exact:true}).tap();
    await mobile.waitForURL(/category=arm/);
    await mobile.waitForFunction(() => !document.querySelector('#product-catalog').hasAttribute('data-filter-animating') && document.querySelectorAll('#product-catalog > [data-product-id]:not([data-filter-hidden])').length === 2);
    assert.deepEqual(await mobile.locator('#product-catalog > [data-product-id]:not([data-filter-hidden])').evaluateAll(es=>es.map(e=>e.dataset.productId)),['arm-a1','arm-a2']);
    await mobile.getByRole('button',{name:'打开菜单',exact:true}).click();
    await mobile.locator('#mobile-navigation').waitFor({state:'visible'});
    await mobile.getByRole('button',{name:'商品中心：展开预览',exact:true}).click();
    await mobile.locator('#mobile-nav-0').waitFor({state:'visible'});
    assert.equal(await mobile.locator('header [data-stagger-group]').count(),0);
    await touch.close();
    console.log('PASS touch Flip and mobile navigation');
  } finally {await browser.close();}
})().catch(e => {console.error(e);process.exitCode=1;});
