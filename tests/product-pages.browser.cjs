/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const artifacts = process.env.ONE_G_ARTIFACTS || '/tmp/one-g-product-review';
const products = [{id:'robotdock',name:'RobotDock'}, {id:'sonic-link',name:'SONIC Link'}];
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.ONE_G_BROWSER?{executablePath:process.env.ONE_G_BROWSER}:{})});
 const results=[],errors=[];
 const watch=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});};
 try {
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();watch(page);page.setDefaultTimeout(15000);
  const go=async route=>{const r=await page.goto(base+route);assert.equal(r.status(),200,route);await page.locator('main').waitFor();await page.waitForTimeout(180);};
  const shot=async name=>{for(const img of await page.locator('main img').all()){if(await img.isVisible()&&!await img.evaluate(el=>!!el.closest('[inert]'))){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode().catch(()=>{}));}}await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);await page.screenshot({path:path.join(artifacts,name),fullPage:true});};
  const noOverflow=async label=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,label);
  await go('/');
  assert.equal(await page.locator('main section').count(),2);
  assert.equal(await page.locator('main [inert],main [data-autoplay],main button').count(),0);
  for(const [index,product] of products.entries()){
   const section=page.locator('main section').nth(index);
   assert.equal(await section.getByRole('link',{name:'了解产品'}).getAttribute('href'),`/one-g/products/${product.id}/`);
   assert.equal(await section.getByRole('link',{name:'购买'}).getAttribute('href'),`/one-g/buy/${product.id}/`);
  }
  for(const width of [375,390,768,1440,1920]){
   await page.setViewportSize({width,height:900});await go('/');await noOverflow('home '+width);await shot(`home-${width}.png`);
   for(const product of products){
    for(const suffix of ['', '/specs']){
     const route=`/products/${product.id}${suffix}/`;await go(route);await noOverflow(route+width);
     assert.equal(await page.locator('footer').count(),1);assert.equal(await page.locator('main [data-package]').count(),0);assert.equal(await page.getByRole('button',{name:'加入购物车',exact:true}).count(),0);
     assert.equal(await page.locator('main [id]').evaluateAll(elements=>new Set(elements.map(e=>e.id)).size===elements.length),true,'unique IDs');
     const local=page.getByRole('navigation',{name:`${product.name} 产品导航`,includeHidden:true});
     assert.equal(await local.count(),1);
     assert.equal(await local.getAttribute('aria-hidden'),suffix?'false':'true');
     if(!suffix){
      const hero=page.locator('#product-hero');
      assert.equal(await hero.getByRole('link',{name:'购买'}).getAttribute('href'),`/one-g/buy/${product.id}/`);
      await page.locator('#applications').scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert.equal(await local.getAttribute('aria-hidden'),'false');
      const h=await page.locator('header.site-header').boundingBox(),n=await local.boundingBox();assert.ok(n.y>=h.y+h.height+7,'Header clearance');
      await local.locator('a').first().focus();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);assert.equal(await local.getAttribute('aria-hidden'),'false','focused nav retained');
      await page.locator('header.site-header a').first().focus();await page.waitForTimeout(150);assert.equal(await local.getAttribute('aria-hidden'),'true');
      assert.equal(await local.locator('a').first().evaluate(el=>{el.focus();return el===document.activeElement}),false,'hidden nav inert');
     }else{
      assert.ok(await page.locator('main dl').count()>0);
      assert.equal(await page.locator('footer [aria-current="page"]').textContent(),'技术规格');
     }
     if(width===390||width===1440)await shot(`${product.id}${suffix?'-specs':'-overview'}-${width}.png`);
     if(!suffix){await page.locator('#applications').scrollIntoViewIfNeeded();await page.waitForTimeout(150);}
     if(width<768){
      await local.getByRole('button',{name:'产品页面菜单'}).click();
      await local.getByRole('link',{name:'技术规格',exact:true}).focus();await page.keyboard.press('Escape');
      assert.equal(await local.getByRole('button',{name:'产品页面菜单'}).evaluate(el=>el===document.activeElement),true);
      assert.equal(await local.getByRole('button',{name:'产品页面菜单'}).getAttribute('aria-expanded'),'false');
     }
     if(width===390||width===1440)await page.screenshot({path:path.join(artifacts,`${product.id}${suffix?'-specs':'-floating'}-nav-${width}.png`)});
     await page.locator('header.site-header a').first().focus();await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(150);
     if(await local.getAttribute('aria-hidden')==='false'){const n=await local.boundingBox(),f=await page.locator('footer').boundingBox();assert.ok(n.y+n.height<=f.y+1,'nav does not cover footer');}
    }
   }
   console.log('PASS layout, nav, specs:',width);
  }
  // Product menu transition, back/forward and direct refresh preserve routes.
  await page.setViewportSize({width:390,height:844});await go('/products/robotdock/');await page.locator('#applications').scrollIntoViewIfNeeded();
  const dockNav=page.getByRole('navigation',{name:'RobotDock 产品导航'});
  await dockNav.getByRole('button',{name:'产品页面菜单'}).click();await dockNav.getByRole('link',{name:'技术规格',exact:true}).click();await page.waitForURL('**/products/robotdock/specs/');
  await page.reload();assert.equal(await page.locator('main h1').textContent(),'RobotDock技术规格');await page.goBack();await page.waitForURL('**/products/robotdock/');await page.goForward();await page.waitForURL('**/products/robotdock/specs/');
  for(const product of products){
   await go('/#'+product.id);await page.waitForURL(`**/products/${product.id}/`);
   await page.locator('#product-hero').getByRole('link',{name:'购买'}).click();await page.waitForURL(`**/buy/${product.id}/`);
   assert.equal(await page.getByRole('radio').count(),product.id==='robotdock'?4:3);
   assert.ok(await page.getByRole('button',{name:'加入购物车',exact:true}).isDisabled());
  }
  await go('/products/');assert.equal(await page.getByRole('tab',{name:'配件',exact:true}).count(),0);assert.equal(await page.locator('main .product-grid').getByText(/^(RobotDock|SONIC Link)$/).count(),0);
  await go('/products/arm-a1/?source=product-review#buy');await page.getByRole('button',{name:'加入购物车',exact:true}).click();await page.waitForURL('**/login/**');assert.equal(new URL(page.url()).searchParams.get('returnTo'),'/products/arm-a1?source=product-review#buy');
  await page.locator('input[name="email"]').fill('user@one-g.com');await page.locator('input[name="password"]').fill('123456');await page.locator('form button[type="submit"]').click();await page.waitForURL('**/products/arm-a1/**');await page.getByRole('status').filter({hasText:'登录成功，请继续加入购物车。'}).waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('one-g-cart')),null);
  results.push('Five widths, four public product routes, first-screen purchase, responsive/focus-safe local nav, grouped source specs, direct refresh/history, legacy hashes, package targets and unchanged ordinary-product cart guard.');
  for(const theme of ['caribbean-calcite','night','color-vision-safe']){
   await page.evaluate(theme=>{localStorage.setItem('one-g-theme:user-demo',theme==='night'?'night':'caribbean-calcite');localStorage.setItem('one-g-accessibility-theme',theme==='color-vision-safe'?theme:'null');},theme);
   for(const width of [375,390,768,1440,1920]){
    await page.setViewportSize({width,height:900});
    for(const route of ['/','/products/robotdock/','/products/robotdock/specs/','/products/sonic-link/','/products/sonic-link/specs/']){
     await go(route);await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);await noOverflow(theme+route+width);
     if(width===1440&&route==='/products/robotdock/specs/')await page.screenshot({path:path.join(artifacts,`specs-${theme}.png`)});
    }
   }
   console.log('PASS theme:',theme);
  }
  const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const mobile=await touch.newPage();watch(mobile);await mobile.goto(base+'/');const cdp=await touch.newCDPSession(mobile);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:310,y:350}]});for(let x=280;x>=90;x-=30)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:350}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.deepEqual(await mobile.locator('main section h1').allTextContents(),['RobotDock','SONIC Link']);await touch.close();
  assert.deepEqual(errors,[]);results.push('All three themes on all five widths and routes, static homepage after touch gesture, zero page/console errors.');
  fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify({base,results,errors},null,2));console.log('PASS',results.join('\n'));await context.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
