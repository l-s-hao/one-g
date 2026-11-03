import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';
const { chromium } = await import(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const production = process.env.ONE_G_PRODUCTION === '1';
const evidence = createBrowserEvidence({ name: 'about-layout', condition: production ? 'production' : 'warm' });
const result = { matrix: [], checks: [], errors: [] };
let browser, page;
async function ready(locale, theme) {
  await page.locator('#platform-direction').waitFor();
  await page.waitForFunction(({ locale, theme }) => document.documentElement.lang === locale && document.documentElement.classList.contains(theme), {locale,theme});
  await page.waitForFunction(() => document.querySelector('main [data-contact-entry="about"]')?.disabled === false);
}
try {
  browser = await chromium.launch({ headless:true, executablePath:process.env.ONE_G_BROWSER });
  for (const width of [1440,768,390]) for (const locale of ['zh-CN','en']) for (const theme of ['light','dark']) {
    const context = await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
    await context.addInitScript(({locale,theme}) => {if (!localStorage.getItem('about-test-init')) {localStorage.setItem('about-test-init','1');localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);}}, {locale,theme});
    page = await context.newPage(); await evidence.attach(page);
    page.on('pageerror', e=>result.errors.push(e.stack ?? e.message));
    page.on('console', m=>{if(m.type()==='error')result.errors.push(m.text());});
    assert.equal((await page.goto(base+'/about/')).status(),200); await ready(locale,theme);
    for(const id of ['our-vision','platform-route','our-positioning','integration-layer','capabilities','platform-direction','contact','brand-lanyard']) assert.equal(await page.locator('#'+id).count(),1);
    assert.equal(await page.locator('#team-practice').count(),0);
    assert.equal(await page.locator('main').getByText(/西溪湿地|康养机构|高压线路/).count(),0);
    assert.equal(await page.locator('main video').count(),1);
    assert.equal(await page.locator('main video').evaluate(v=>v.controls && v.paused && v.preload==='none' && !v.autoplay),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.locator('main a[href="#"]').count(),0);
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:path.join(evidence.dir,`${width}-${locale}-${theme}-top.png`),caret:'initial'});
    await page.locator('#capabilities figure img').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{const i=document.querySelector('#capabilities figure img');return i?.complete&&i.naturalWidth>0;});
    await page.locator('#capabilities').screenshot({path:path.join(evidence.dir,`${width}-${locale}-${theme}-capabilities.png`),caret:'initial'});
    await page.locator('#platform-route').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(evidence.dir,`${width}-${locale}-${theme}-body.png`),fullPage:true,caret:'initial'});
    result.matrix.push({width,locale,theme,passed:true});
    if(width===1440&&locale==='zh-CN'&&theme==='light') {
      const video=page.locator('main video'); await video.evaluate(v=>{v.dataset.testInstance='preserved';});
      await page.locator('[data-theme-toggle]').click(); await page.waitForFunction(()=>document.documentElement.classList.contains('dark'));
      await page.locator('[data-language-toggle]').click(); await page.waitForFunction(()=>document.documentElement.lang==='en');
      assert.equal(await video.getAttribute('data-test-instance'),'preserved');
      const brain=page.locator('main ul li').filter({has:page.getByRole('heading',{name:'High-level intelligence',exact:true})}); assert.equal(await brain.locator('a').count(),0);
      await page.locator('main a[href*="/products/robotdock"]').first().click(); await page.waitForURL(/products\/robotdock/);
      await page.goBack(); await ready('en','dark');
      await page.locator('main a[href*="category=robot"]').click(); await page.waitForURL(/category=robot/); await page.goBack(); await ready('en','dark');
      await page.locator('main a[href*="solutions/teleoperation"]').first().click(); await page.waitForURL(/solutions\/teleoperation/); await page.goBack(); await ready('en','dark');
      await page.locator('main a[href*="#teleoperation"]').click(); await page.waitForURL(/#teleoperation/); await page.goBack(); await ready('en','dark');
      await page.locator('main [data-contact-entry="about"]').click(); await page.waitForURL(/login/);
      assert.match(new URL(page.url()).searchParams.get('returnTo'),/^\/about/);
      result.checks.push('real product/category/solution links, history, preferences preserve video, login return');
    }
    await context.close();
  }
  // 直接打开、刷新及反向入口，使用新文档而非仅检查 URL。
  const c=await browser.newContext({viewport:{width:1440,height:1000}}); page=await c.newPage(); await evidence.attach(page);
  await page.goto(base+'/about/#platform-route'); await page.locator('#platform-route').waitFor();
  await page.waitForFunction(()=>{const t=document.querySelector('#platform-route').getBoundingClientRect().top;const h=document.querySelector('header.site-header').getBoundingClientRect().bottom;return t>=h-1&&t<innerHeight;});
  await page.reload(); await page.locator('#platform-route').waitFor();
  result.checks.push('direct anchor and refresh');
  for(const url of ['/products/robotdock/','/solutions/']) {
    await page.goto(base+url);
    const back=page.locator('main a[href*="/about/"][href$="#platform-route"]');
    await back.click(); await page.waitForURL(/about\/#platform-route/); await page.locator('#route-title').waitFor();
    assert.ok(await page.locator('#route-title').isVisible());
  }
  result.checks.push('RoboDock and solutions reverse entries');
  const target=page.locator('main a[href*="/products/robotdock"]').first();
  const [tab]=await Promise.all([c.waitForEvent('page'),target.click({button:'middle'})]);
  await tab.waitForLoadState();assert.match(tab.url(),/products\/robotdock/);await tab.close();
  await target.focus();assert.equal(await target.evaluate(n=>n===document.activeElement),true);
  await page.keyboard.press('Enter');await page.waitForURL(/products\/robotdock/);
  result.checks.push('native new-tab and keyboard Enter');
  await c.close();
  assert.deepEqual(result.errors,[]);
  fs.writeFileSync(path.join(evidence.dir,'results.json'),JSON.stringify(result,null,2)); evidence.finish('passed');
} catch(error) {fs.writeFileSync(path.join(evidence.dir,'results.json'),JSON.stringify(result,null,2));await evidence.fail(error,page);throw error;}
finally {await browser?.close();}
