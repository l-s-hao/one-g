/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser validation. */
const {chromium}=require('/tmp/one-g-route-check/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});p.setDefaultTimeout(20000);const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'})));
 const base=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';
 async function go(r){let res;try{res=await p.goto(base+r)}catch(e){if(!String(e).includes('ERR_ABORTED'))throw e;res=await p.goto(base+r)}assert.equal(res.status(),200);await p.locator('main h1').first().waitFor({state:'attached'});await p.waitForTimeout(400);}
 await go('/');
 for(const theme of ['caribbean-calcite','night','color-vision-safe']){
  await p.evaluate(t=>{localStorage.setItem('one-g-theme:user-demo',t==='color-vision-safe'?'night':t);localStorage.setItem('one-g-accessibility-theme',t==='color-vision-safe'?t:'null');},theme);
  for(const route of ['/solutions/','/about/','/products/']){
   await go(route);await p.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
   assert.equal(await p.locator('[data-brand-theme]').count(),0);
   if(route==='/about/'){
    assert.ok(await p.locator('.scroll-expand').count());assert.equal(await p.locator('#brand-lanyard').count(),1);
    const colors=await p.locator('#brand-lanyard').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,expected:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()}));console.log(theme,'Lanyard',colors);
    await p.screenshot({path:'.next/three-fixes-about-'+theme+'.png'});
    await p.locator('#brand-lanyard').scrollIntoViewIfNeeded();await p.locator('#brand-lanyard canvas').waitFor();
    assert.ok(await p.locator('main img').evaluateAll(imgs=>imgs.every(img=>!getComputedStyle(img).filter.includes('invert'))));
   }
  }
 }
 for(const width of [1440,375,390,768]){
  await p.setViewportSize({width,height:900});await go('/solutions/');assert.equal(await p.locator('main article').count(),4);assert.equal(await p.locator('main section').count(),1);assert.equal(await p.getByRole('button',{name:'咨询 ONE-G',exact:true}).count(),1);
  const height=await p.evaluate(()=>document.documentElement.scrollHeight);console.log('Solutions height',width,height);if(width===1440)assert.ok(height<1400);if(width===375)assert.ok(height<1900);
  for(const route of ['/solutions/','/about/','/products/']){await go(route);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+route);if(route==='/products/'){assert.deepEqual(await p.getByRole('tablist',{name:'商品分类'}).getByRole('tab').allTextContents(),['全部','机器人','机械臂','灵巧手','视觉系统']);assert.equal(await p.locator('.product-grid a').count(),8);assert.equal(await p.locator('.product-grid a[href*="robotdock"],.product-grid a[href*="sonic-link"]').count(),0);}await p.screenshot({path:'.next/three-fixes-'+width+'-'+route.split('/')[1]+'.png'});}
 }
 await go('/products/?category=accessory');assert.equal(await p.getByRole('tablist',{name:'商品分类'}).getByRole('tab').first().getAttribute('aria-selected'),'true');
 for(const route of ['/','/configure/','/account/'])await go(route);
 assert.deepEqual(errors,[]);console.log('PASS three themes, responsive pages, compact Solutions, five category filters, retained interactions and unaffected routes');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
