/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';
const artifacts=process.env.ONE_G_ARTIFACTS||'/tmp/one-g-home-showcase';
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.ONE_G_BROWSER?{executablePath:process.env.ONE_G_BROWSER}:{})});
 const errors=[],results=[];
 try{
  for(const theme of ['caribbean-calcite','night','color-vision-safe']){
   const context=await browser.newContext();
   await context.addInitScript(theme=>{localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'}));localStorage.setItem('one-g-theme:user-demo',theme==='night'?'night':'caribbean-calcite');localStorage.setItem('one-g-accessibility-theme',theme==='color-vision-safe'?theme:'null');},theme);
   const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   for(const width of [375,390,1440,1920]){
    await p.setViewportSize({width,height:900});assert.equal((await p.goto(base+'/')).status(),200);
    await p.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
    const sections=p.locator('main section');assert.equal(await sections.count(),2);
    assert.deepEqual(await sections.locator('h1').allTextContents(),['RobotDock','SONIC Link']);
    assert.equal(await p.locator('main button,main [inert],main [aria-roledescription],main [data-autoplay],main video,main #applications').count(),0);
    const geometry=await p.evaluate(()=>{
     const sections=[...document.querySelectorAll('main section')];
     return {sections:sections.map(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {top:r.top,bottom:r.bottom,width:r.width,position:s.position,overflow:s.overflowX,transform:s.transform,hidden:el.hidden||el.inert||el.getAttribute('aria-hidden')==='true'};}),header:document.querySelector('header.site-header').getBoundingClientRect().bottom,footer:document.querySelector('footer').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.equal(geometry.overflow,false);assert.ok(Math.abs(geometry.sections[0].top-geometry.header)<2);
    assert.ok(Math.abs(geometry.sections[0].bottom-geometry.sections[1].top)<2);
    assert.ok(Math.abs(geometry.sections[1].bottom-geometry.footer)<2);
    for(const section of geometry.sections){assert.equal(section.position,'static');assert.equal(section.overflow,'visible');assert.equal(section.transform,'none');assert.equal(section.hidden,false);assert.equal(section.width,width);}
    const links=sections.locator('a');const expected=['/one-g/products/robotdock/','/one-g/buy/robotdock/','/one-g/products/sonic-link/','/one-g/buy/sonic-link/'];
    assert.deepEqual(await links.evaluateAll(items=>items.map(el=>el.getAttribute('href'))),expected);
    await links.first().focus();for(let index=0;index<4;index++){if(index)await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('href')),expected[index]);}
    for(const image of await sections.locator('img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode());assert.equal(await image.evaluate(el=>getComputedStyle(el).objectFit),'contain');}
    await p.evaluate(()=>scrollTo(0,0));
    if(theme==='caribbean-calcite'||width===1440)await p.screenshot({path:path.join(artifacts,`home-${theme}-${width}.png`),fullPage:true});
    results.push(`${theme} ${width}px: both sections in flow, order and footer adjacency, all 4 links keyboard accessible, no overflow/hidden slides/controls, original-ratio media.`);
   }
   await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/');
  const cdp=await context.newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:650}]});
  for(let y=600;y>=200;y-=40)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(250);assert.ok(await p.evaluate(()=>scrollY)>100,'native vertical touch scroll');
  await p.evaluate(()=>scrollTo(0,0));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:310,y:350}]});
  for(let x=280;x>=90;x-=30)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:350}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.deepEqual(await p.locator('main section h1').allTextContents(),['RobotDock','SONIC Link']);
  for(const [index,id] of ['robotdock','sonic-link'].entries()){
   await p.goto(base+'/');await p.locator('main section').nth(index).getByRole('link',{name:'了解产品'}).click();await p.waitForURL(`**/products/${id}/`);assert.equal(await p.locator('#product-title').textContent(),index?'SONIC Link':'RobotDock');
   await p.goto(base+'/');await p.locator('main section').nth(index).getByRole('link',{name:'购买'}).click();await p.waitForURL(`**/buy/${id}/`);assert.ok(await p.getByRole('radio').count()>0);assert.ok(!p.url().includes('/login'));
  }
  await p.goto(base+'/');await p.waitForTimeout(7000);assert.deepEqual(await p.locator('main section h1').allTextContents(),['RobotDock','SONIC Link']);assert.equal(await p.locator('main [inert],main [data-autoplay]').count(),0);
  await p.locator('footer').scrollIntoViewIfNeeded();assert.ok(await p.evaluate(()=>scrollY)>0);
  assert.deepEqual(errors,[]);results.push('Real vertical touch scroll, no horizontal swipe replacement, 4 actual CTA navigations remain public, stable after 7 seconds, reachable footer; no browser errors.');
  fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify({base,results,errors},null,2));console.log('PASS',results.join('\n'));await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
