/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const {chromium}=require('/tmp/one-g-route-check/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'}));});
 const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';
 async function go(route){let res;try{res=await page.goto(base+route);}catch(error){if(!String(error).includes('ERR_ABORTED'))throw error;res=await page.goto(base+route);}assert.equal(res.status(),200,route);await page.locator('main h1').first().waitFor();}
 await go('/');await page.waitForFunction(()=>document.documentElement.dataset.theme==='caribbean-calcite');
 for(const theme of ['caribbean-calcite','night','color-vision-safe']){
  await page.evaluate(t=>{localStorage.setItem('one-g-theme:user-demo',t==='color-vision-safe'?'night':t);localStorage.setItem('one-g-accessibility-theme',t==='color-vision-safe'?t:'null');},theme);
  for(const route of ['/','/configure/','/solutions/','/products/','/account/','/cart/']){
   await go(route);await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);await page.waitForTimeout(400);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),theme+route);
   await page.screenshot({path:'.next/v2-'+theme+'-'+(route.split('/')[1]||'home')+'.png',fullPage:false});
  }
 }
 await go('/products/');const links=await page.locator('.product-grid a').evaluateAll(a=>a.map(x=>x.getAttribute('href')));assert.equal(links.some(x=>/robotdock|sonic-link/.test(x)),false);assert.equal(links.length,8);
 await go('/configure/');assert.equal(await page.locator('[data-package]').count(),7);assert.equal(await page.locator('[role="progressbar"],[data-slot-type]').count(),0);assert.equal(await page.getByRole('button',{name:'加入购物车',exact:true}).count(),0);
 for(const route of ['/configure/robot/','/configure/robotdock/','/configure/sonic-link/','/customize/','/customize/start/']){await page.goto(base+route+'?scene=inspection');await page.waitForURL('**/one-g/configure/');}
 await go('/account/');const appearance=page.getByRole('group',{name:'外观',exact:true});assert.equal(await appearance.getByRole('radio').count(),2);await appearance.getByRole('radio',{name:/夜间模式/}).check();await page.getByRole('group',{name:'显示辅助',exact:true}).last().getByRole('radio',{name:'标准显示'}).check();await page.waitForFunction(()=>document.documentElement.dataset.theme==='night');
 await appearance.getByRole('radio',{name:/日间模式/}).check();await page.waitForFunction(()=>document.documentElement.dataset.theme==='caribbean-calcite');
 for(const width of [375,390,768]){
  await page.setViewportSize({width,height:844});await go('/');const carousel=page.getByRole('region',{name:'可配置产品广告'});assert.equal(await carousel.locator('article').count(),2);
  await page.getByRole('button',{name:'下一张广告'}).click();assert.equal(await page.getByRole('button',{name:'显示 SONIC Link 广告'}).getAttribute('aria-current'),'true');
  await page.getByRole('link',{name:'了解能力',exact:true}).click();await page.waitForURL('**/#sonic-link');assert.equal(await page.locator('#sonic-link [data-package]').count(),0);
  await go('/');const image=page.locator('[aria-roledescription="幻灯片"]').first().locator('img');const box=await image.boundingBox();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.2,box.y+box.height*.5,{steps:8});await page.mouse.up();assert.equal(await page.getByRole('button',{name:'显示 SONIC Link 广告'}).getAttribute('aria-current'),'true');
  for(const route of ['/','/configure/','/account/']){await go(route);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+width);await page.screenshot({path:'.next/v2-mobile-'+width+'-'+(route.split('/')[1]||'home')+'.png',fullPage:false});}
  if(width<768){await page.getByRole('button',{name:'打开菜单'}).click();assert.deepEqual((await page.getByRole('navigation',{name:'移动端导航'}).getByRole('link').allTextContents()).slice(0,4),['配置','解决方案','商品中心','了解公司']);}
 }
 // Real touch input: swipe must switch slide without blocking vertical page scrolling.
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const tp=await touch.newPage();await tp.goto(base+'/');const box=await tp.locator('[aria-roledescription="幻灯片"]').first().locator('img').boundingBox();const cdp=await touch.newCDPSession(tp);const y=box.y+box.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:320,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:90,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await tp.getByRole('button',{name:'显示 SONIC Link 广告'}).getAttribute('aria-current'),'true');await touch.close();
 await page.setViewportSize({width:1440,height:1000});await go('/about/');await page.waitForFunction(()=>document.documentElement.dataset.theme==='caribbean-calcite');
 await go('/products/arm-a1/');await page.getByRole('button',{name:'加入购物车',exact:true}).click();await go('/cart/');assert.ok((await page.locator('main').innerText()).includes('A1'));
 const adminContext=await browser.newContext();await adminContext.addInitScript(()=>localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'admin-demo'})));const admin=await adminContext.newPage();await admin.goto(base+'/admin/');await admin.getByRole('group',{name:'外观',exact:true}).waitFor();assert.equal(await admin.getByRole('group',{name:'外观',exact:true}).getByRole('radio').count(),2);await adminContext.close();
 assert.deepEqual(errors,[]);console.log('PASS themes, packages, catalogue, legacy routes, account/admin, responsive drag/touch carousel, About theme and cart');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
