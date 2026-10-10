/* eslint-disable @typescript-eslint/no-require-imports -- Browser regression test. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const expected = {
  all: ['robotdock','g1','g1-pro','arm-a1','arm-a2','hand-d1','vision-v1','rgbd','lidar-kit'],
  robot: ['robotdock','g1','g1-pro'], arm: ['arm-a1','arm-a2'],
  hand: ['hand-d1'], vision: ['vision-v1','rgbd','lidar-kit'],
};
const labels = { all:'全部', robot:'机器人', arm:'机械臂', hand:'灵巧手', vision:'视觉系统' };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER, headless: true });
  const errors = [];
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {
      // Chromium requests this root favicon before the basePath metadata arrives.
      if (m.type() === 'error' && !m.location().url.endsWith('/favicon.ico')) errors.push(m.text());
    });
    async function settled(category) {
      await page.waitForFunction(() => {
        const grid = document.querySelector('#product-catalog');
        return grid && !grid.hasAttribute('data-filter-animating');
      });
      const result = await page.locator('#product-catalog').evaluate(grid => ({
        ids:[...grid.children].filter(e=>!e.hasAttribute('data-filter-hidden')).map(e=>e.dataset.productId),
        unique:new Set([...grid.children].map(e=>e.dataset.flipId)).size,
        count:grid.children.length, inert:grid.inert, height:grid.style.height,
        dirty:[...grid.children].filter(e=>e.style.cssText).map(e=>e.dataset.productId),
        hiddenFocusable:[...grid.children].filter(e=>e.hasAttribute('data-filter-hidden') && !e.inert).length,
        overflow:document.documentElement.scrollWidth>innerWidth,
      }));
      assert.deepEqual(result.ids,expected[category]);
      assert.equal(result.unique,9); assert.equal(result.count,9);
      assert.equal(result.inert,false); assert.equal(result.height,'');
      assert.deepEqual(result.dirty,[]); assert.equal(result.hiddenFocusable,0);
      assert.equal(result.overflow,false);
      assert.equal(await page.getByRole('tab',{selected:true}).textContent(),'✓ '+labels[category]);
    }
    async function select(category, animate = true) {
      await page.getByRole('tab',{name:new RegExp(labels[category])}).click();
      await page.waitForURL(url => (url.searchParams.get('category') || 'all') === category);
      if (animate) {
        await page.waitForSelector('#product-catalog[data-filter-animating]');
        assert.equal(await page.locator('#product-catalog').evaluate(e=>e.inert),true);
      }
      await settled(category);
    }
    await page.goto(base+'/products/');
    await settled('all');
    const dimensions = await page.locator('.product-card').evaluateAll(es=>es.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
    // Capture immutable card contents and links across every layout transition.
    const content = await page.locator('.product-card').evaluateAll(cards=>cards.map(e=>({id:e.dataset.productId,html:e.innerHTML})));
    await select('robot'); await select('arm'); await select('hand'); await select('vision'); await select('all');
    assert.deepEqual(await page.locator('.product-card').evaluateAll(es=>es.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))),dimensions);
    // Verify retained cards actually move and leaving cards fade while still mounted.
    const before = await page.locator('[data-product-id="arm-a1"]').boundingBox();
    await page.getByRole('tab',{name:'机械臂',exact:true}).click();
    await page.waitForSelector('#product-catalog[data-filter-animating]');
    await page.waitForTimeout(100);
    const middle = await page.locator('[data-product-id="arm-a1"]').boundingBox();
    const leaving = await page.locator('[data-product-id="g1"]').evaluate(e=>({opacity:+getComputedStyle(e).opacity,display:getComputedStyle(e).display,inert:e.inert}));
    assert.ok(leaving.opacity>0 && leaving.opacity<1); assert.notEqual(leaving.display,'none'); assert.equal(leaving.inert,true);
    await settled('arm');
    const after = await page.locator('[data-product-id="arm-a1"]').boundingBox();
    assert.ok(Math.abs(before.y-after.y)>100);
    assert.ok(middle.y>after.y && middle.y<before.y);
    await page.getByRole('tab',{name:'全部',exact:true}).click();
    await page.waitForSelector('#product-catalog[data-filter-animating]');
    await page.waitForTimeout(100);
    assert.ok(await page.locator('[data-product-id="g1"]').evaluate(e=>+getComputedStyle(e).opacity<1));
    await settled('all');
    await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      for (const label of ['机械臂','机器人','灵巧手','全部']) tabs.find(e=>e.textContent.includes(label)).click();
    });
    await page.waitForTimeout(250);
    await settled('all');
    assert.equal(new URL(page.url()).searchParams.get('category'),null);
    for (const category of ['arm','robot','hand','vision','all','hand']) {
      await page.getByRole('tab',{name:new RegExp(labels[category])}).click();
      await page.waitForURL(url=>(url.searchParams.get('category')||'all')===category);
    }
    await settled('hand');
    await page.reload(); await settled('hand');
    await select('vision'); await page.goBack(); await settled('hand');
    await page.goForward(); await settled('vision');
    await select('all');
    await page.getByRole('tab',{name:'机械臂',exact:true}).click();
    await page.waitForSelector('#product-catalog[data-filter-animating]');
    await page.setViewportSize({width:390,height:844}); await settled('arm');
    await select('all');
    assert.deepEqual(await page.locator('.product-card').evaluateAll(cards=>cards.map(e=>({id:e.dataset.productId,html:e.innerHTML}))),content);
    await page.locator('[data-product-id="robotdock"]').getByRole('link',{name:'购买',exact:true}).click();
    await page.waitForURL('**/buy/robotdock/');
    await page.goto(base+'/products/?category=vision'); await settled('vision');
    for (const width of [375,390,768,1440,1920]) {
      await page.setViewportSize({width,height:900});
      await select('all'); await select('robot'); await select('arm');
      await select('hand'); await select('vision');
    }
    await page.getByRole('tab',{name:'全部',exact:true}).click();
    await page.waitForSelector('#product-catalog[data-filter-animating]');
    await page.emulateMedia({reducedMotion:'reduce'});
    await settled('all');
    await select('robot',false); await select('arm',false);
    assert.equal(await page.locator('#product-catalog[data-filter-animating]').count(),0);
    const touch = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const mobile = await touch.newPage();
    mobile.on('pageerror',e=>errors.push(e.message));
    await mobile.goto(base+'/products/');
    await mobile.getByRole('tab',{name:'机械臂',exact:true}).tap();
    await mobile.waitForSelector('#product-catalog[data-filter-animating]');
    await mobile.waitForFunction(()=>!document.querySelector('#product-catalog').hasAttribute('data-filter-animating'));
    assert.deepEqual(await mobile.locator('.product-card:not([data-filter-hidden])').evaluateAll(es=>es.map(e=>e.dataset.productId)),expected.arm);
    await touch.close();
    assert.deepEqual(errors,[]);
    console.log('PASS: filter counts/order; retained movement; enter/leave opacity; rapid switching; resize; refresh; history; direct query; touch; reduced motion; stable content/IDs; purchase link; clean styles; no hydration/GSAP errors');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
