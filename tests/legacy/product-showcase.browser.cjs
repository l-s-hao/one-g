/* eslint-disable @typescript-eslint/no-require-imports -- Browser regression test. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert=require('node:assert/strict'); const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.ONE_G_BROWSER,headless:true});
try {
const errors=[];const rows=[];fs.mkdirSync('docs/product-showcase/screenshots',{recursive:true});
for(const mode of ['standard','night','eye-comfort','color-vision-safe']){
const context=await browser.newContext();await context.addInitScript(m=>localStorage.setItem('one-g-theme',JSON.stringify({version:2,displayMode:m})),mode);
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/hydrat|did not match|didn't match/.test(m.text()))errors.push(m.text())});
for(const width of [375,390,768,1080,1440,1920]){
await page.setViewportSize({width,height:900});await page.goto((process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g')+'/products/');await page.waitForTimeout(2000);
await page.waitForFunction(m=>document.documentElement.dataset.theme===m,mode);
const result=await page.evaluate(()=>{
const hero=document.querySelector('section[aria-labelledby="products-title"]');const ring=hero.querySelector('[class*="_ring_"]');const cards=[...ring.children];const scene=hero.querySelector('[class*="_scene_"]');const preview=hero.querySelector('[class*="browserPosition"]');const b=hero.querySelector('a');
return {overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,cards:cards.length,visible:cards.filter(c=>getComputedStyle(c).visibility==='visible').length,perspective:getComputedStyle(ring).perspective,origin:getComputedStyle(ring).perspectiveOrigin,transform:cards.find(c=>getComputedStyle(c).visibility==='visible').style.transform,core:document.querySelectorAll('h3[id^="core-"][id$="-title"]').length,standard:document.querySelectorAll('.product-grid>.product-card').length,clip:getComputedStyle(b).overflow,background:getComputedStyle(hero).backgroundColor,surface:getComputedStyle(cards[0]).backgroundColor,accent:getComputedStyle(hero).getPropertyValue('--showcase-accent'),scene:scene.getBoundingClientRect().toJSON(),preview:preview.getBoundingClientRect().toJSON(),broken:[...hero.querySelectorAll('img')].filter(i=>i.complete&&i.naturalWidth===0).length};});
assert.equal(result.overflow,false,`${mode} ${width} overflow`);assert.equal(result.h1,1);assert.equal(result.cards,37);assert.ok(result.visible>=8&&result.visible<=9);assert.equal(result.perspective,'891px');assert.equal(result.core,2);assert.equal(result.standard,8);assert.equal(result.clip,'hidden');assert.equal(result.broken,0);if(mode==='color-vision-safe')assert.equal(result.accent.trim(),'#EDB3D9');rows.push({mode,width,...result});
if(width===1440||width===390)await page.screenshot({path:`docs/product-showcase/screenshots/${mode}-${width}.png`});
}
await page.setViewportSize({width:1440,height:900});await page.reload();await page.waitForTimeout(2000);
const first=page.locator('[class*="_ring_"] > div').first(); const control=page.getByRole('button',{name:'暂停商品展示旋转'});
await control.click();const frozen=await first.getAttribute('style');await page.waitForTimeout(350);assert.equal(await first.getAttribute('style'),frozen);
await page.getByRole('link',{name:'浏览商品'}).click();await page.waitForTimeout(200);assert.ok(await page.locator('#product-catalog').evaluate(e=>e.getBoundingClientRect().top>=64));
await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(200);assert.equal(await first.getAttribute('style'),frozen);
await page.getByRole('button',{name:'继续商品展示旋转'}).click();await page.waitForTimeout(350);assert.notEqual(await first.getAttribute('style'),frozen);
await page.locator('[role="tab"]').filter({hasText:'机械臂'}).click();await page.waitForTimeout(500);assert.equal(await page.locator('.product-grid>.product-card').count(),2);assert.equal(await page.locator('h3[id^="core-"][id$="-title"]').count(),2);
await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(150);const offscreen=await first.getAttribute('style');await page.waitForTimeout(350);assert.equal(await first.getAttribute('style'),offscreen);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(350);assert.notEqual(await first.getAttribute('style'),offscreen);
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('button[class*=pause]').disabled);const staticStyle=await first.getAttribute('style');await page.waitForTimeout(350);assert.equal(await first.getAttribute('style'),staticStyle);assert.equal(await page.getByRole('button',{name:'已根据减少动态效果设置停止旋转'}).isDisabled(),true);
await page.reload();await page.waitForTimeout(500);assert.equal(await page.locator('#products-title').evaluate(e=>getComputedStyle(e).animationName),'none');
await page.goto((process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g')+'/about/');await page.goto((process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g')+'/products/');await page.waitForTimeout(500);assert.equal(await page.locator('h1').textContent(),'商品中心');
await page.locator('footer').scrollIntoViewIfNeeded();assert.ok(await page.locator('footer').isVisible());await context.close();
}
assert.deepEqual(errors,[]);fs.writeFileSync('docs/product-showcase/results.json',JSON.stringify({rows,errors},null,2));await browser.close();console.log('PASS 24 width/theme cases; pause/resume; anchor; filtering; reduced motion; refresh; navigation; Footer; hydration');
} finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
