import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';
const { chromium }=await import(process.env.ONE_G_PLAYWRIGHT||'playwright-core');
const base=(process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g').replace(/\/$/,'');
const targetsOnly=process.env.ONE_G_MEDIA_STAGE==='targets';
const evidence=createBrowserEvidence({name:'media-display',condition:process.env.ONE_G_PRODUCTION==='1'?'production':'warm'});
const result={targetsOnly,matrix:[],checks:[],errors:[]};let browser,page;
async function bareVideos(){
 for(const block of await page.locator('main [data-demo]').all()){
  assert.equal(await block.locator('h3').count(),1);assert.equal(await block.locator('video').count(),1);
  assert.equal(await block.locator('figcaption,p,small,a').count(),0);
  const v=block.locator('video');assert.equal(await v.evaluate(n=>n.controls&&!n.autoplay&&!n.loop&&n.preload==='none'),true);
  assert.ok(await v.getAttribute('aria-label'));
  const boxes=await block.evaluate(n=>({figure:n.getBoundingClientRect().bottom,player:n.lastElementChild.getBoundingClientRect().bottom}));assert.ok(Math.abs(boxes.figure-boxes.player)<2);
 }
}
async function ready(locale,theme){await page.waitForFunction(({locale,theme})=>document.documentElement.lang===locale&&document.documentElement.classList.contains(theme),{locale,theme});await page.evaluate(()=>document.fonts.ready);}
async function imageReady(){await page.waitForFunction(()=>[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0&&r.left<innerWidth&&r.right>0;}).every(i=>i.complete));}
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER});
 const combos=targetsOnly?[[1440,'zh-CN','light'],[390,'en','dark']]:[1440,390].flatMap(w=>['zh-CN','en'].flatMap(l=>['light','dark'].map(t=>[w,l,t])));
 for(const [width,locale,theme]of combos){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
  await context.addInitScript(({locale,theme})=>{if(!sessionStorage.getItem('media-display-init')){sessionStorage.setItem('media-display-init','1');localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);}}, {locale,theme});
  page=await context.newPage();await evidence.attach(page);page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});
  assert.equal((await page.goto(base+'/solutions/')).status(),200);await ready(locale,theme);await bareVideos();
  const titles=await page.locator('#ai [data-demo] h3').allTextContents();assert.equal(titles.length,2);assert.ok(titles[1].includes(locale==='en'?'simulation':'仿真'));
  for(const id of ['dance-video-motion','music-motion']){
   const figure=page.locator(`[data-demo="${id}"]`);await figure.evaluate(n=>scrollTo(0,n.getBoundingClientRect().top+scrollY-100));
   await figure.screenshot({path:path.join(evidence.dir,`${id}-${width}-${locale}-${theme}.png`),caret:'initial'});
  }
  if(!targetsOnly){assert.equal(await page.locator('main figcaption').count(),0);assert.equal(await page.locator('#media-sources').count(),1);assert.match(await page.locator('#media-sources').innerText(),/AI-CDR Center/);assert.equal(await page.locator('main [data-demo] a').count(),0);}
  result.matrix.push({area:'intelligent-task-media',width,locale,theme,passed:true});
  for(const [kind,index]of [['products',0],['solutions',1]]){
   await page.goto(base+'/solutions/');await ready(locale,theme);
   if(width===1440)await page.locator(`header [data-navigation-item="/${kind}"] > a`).hover();
   else{await page.locator('header button[aria-controls="mobile-navigation"]').click();await page.locator(`header button[aria-controls="mobile-nav-${index}"]`).click();}
   const menu=page.locator(`[data-header-image-menu="${kind}"]:visible`);await menu.waitFor();
   for(const card of await menu.locator('[data-header-image-card]').all()){
    const copy=card.locator('[data-button-effect="invert"]');assert.equal(await copy.locator(':scope > span').count(),1);assert.equal(await copy.locator('p,small').count(),0);assert.ok(await copy.innerText());assert.ok(await card.getAttribute('href'));
   }
   if(kind==='products')assert.equal(await menu.locator('[data-header-image-card] [data-button-effect="invert"]').first().innerText(),'RoboDock');
   await imageReady();await menu.screenshot({path:path.join(evidence.dir,`navigation-${kind}-${width}-${locale}-${theme}.png`),caret:'initial'});
   result.matrix.push({area:'navigation-'+kind,width,locale,theme,passed:true});
  }
  if(!targetsOnly){
   for(const route of ['/','/products/','/products/robotdock/','/products/robotdock/specs/','/solutions/teleoperation/','/about/','/buy/robotdock/','/deep-customization/']){
    assert.equal((await page.goto(base+route)).status(),200);await ready(locale,theme);await bareVideos();assert.equal(await page.locator('main figcaption').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const broken=await page.locator('main [aria-describedby]').evaluateAll(ns=>ns.flatMap(n=>(n.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&!document.getElementById(id))));assert.deepEqual(broken,[]);
    const creditCount=await page.locator('#media-sources').count();assert.ok(creditCount<=1);
    if(route==='/about/'||route==='/solutions/teleoperation/')assert.equal(creditCount,1);
    if(route==='/products/robotdock/'){assert.ok(await page.locator('#design-evidence').isVisible());assert.match(await page.locator('main').innerText(),locale==='en'?/concept|Concept/:/概念/);}
    if(route==='/buy/robotdock/')assert.equal(await page.locator('button[aria-describedby="purchase-unavailable"]').isDisabled(),true);
    if(route==='/'){
     const grid=page.locator('[data-layout-grid="home-products"]');await grid.locator('[data-preview-id="robotdock"] button[aria-expanded]').click();const panel=page.locator('#home-products-robotdock-preview');await panel.waitFor();assert.equal(await panel.locator('p,figcaption,small').count(),0);assert.equal(await panel.locator('a[href*="products/robotdock"]').count(),1);await page.keyboard.press('Escape');
    }
    if((width===1440&&locale==='zh-CN'&&theme==='light')||(width===390&&locale==='en'&&theme==='dark'))await page.screenshot({path:path.join(evidence.dir,`page-${route.split('/').filter(Boolean).join('-')||'home'}-${width}-${locale}-${theme}.png`),caret:'initial'});
    result.matrix.push({area:route,width,locale,theme,passed:true});
   }
  }
  await context.close();
 }
 if(!targetsOnly){
  const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page=await c.newPage();await evidence.attach(page);
  await page.goto(base+'/solutions/');const a=page.locator('#ai video').first(),b=page.locator('#ai video').nth(1);
  await a.evaluate(v=>v.play());await page.waitForFunction(()=>document.querySelector('#ai video').currentTime>0);await b.evaluate(v=>v.play());assert.equal(await a.evaluate(v=>v.paused),true);await b.evaluate(v=>v.pause());
  evidence.record('intentional-media-response-failure',{demo:'3pt-demo',status:404});
  await page.route('**/3pt-demo.mp4',r=>r.fulfill({status:404,body:'missing'}));await page.goto(base+'/solutions/teleoperation/');const f=page.locator('[data-demo="3pt-demo"]');await f.locator('video').evaluate(v=>v.load());await f.locator('[role="status"]').waitFor();assert.equal(await f.locator('[role="status"]').evaluate(n=>n.parentElement.contains(n.previousElementSibling)&&n.parentElement.querySelector('video')!==null),true);
  await page.unroute('**/3pt-demo.mp4');await f.getByRole('button').click();await f.locator('video').evaluate(v=>v.play());await page.waitForFunction(()=>document.querySelector('[data-demo="3pt-demo"] video').currentTime>0);assert.equal(await f.locator('[role="status"]').count(),0);await f.locator('video').evaluate(v=>v.pause());await c.close();
  result.checks.push('Playback, single active player, in-player error/retry, source credit once per page, all shared callers, business limits and aria references');
 }
 assert.deepEqual(result.errors,[]);fs.writeFileSync(path.join(evidence.dir,'results.json'),JSON.stringify(result,null,2));evidence.finish('passed');console.log(`PASS media display: ${result.matrix.length} combinations`);
}catch(error){fs.writeFileSync(path.join(evidence.dir,'results.json'),JSON.stringify(result,null,2));await evidence.fail(error,page);throw error;}finally{await browser?.close();}
