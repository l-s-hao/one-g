/* eslint-disable @typescript-eslint/no-require-imports -- External browser checks. */
const {chromium} = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict'), fs = require('node:fs');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g', out = '/tmp/one-g-detail/accessibility';
fs.mkdirSync(out,{recursive:true});
const style = loc => loc.evaluate(e=>{const s=getComputedStyle(e);return {shadow:s.boxShadow,translate:s.translate,transform:s.transform,border:s.borderWidth,borderColor:s.borderColor,padding:s.padding,radius:s.borderRadius,background:s.backgroundColor,outline:s.outlineStyle,outlineWidth:s.outlineWidth,forced:s.forcedColorAdjust};});
(async()=>{
 const b=await chromium.launch({executablePath:process.env.ONE_G_BROWSER,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try{
  for(const width of (process.env.ONE_G_DETAIL_PHASE==='zoom'?[]:[390,1440]))for(const locale of ['zh-CN','en'])for(const theme of ['light','dark']){
   const c=await b.newContext({viewport:{width,height:1000},isMobile:width===390,hasTouch:width===390});
   await c.addInitScript(({locale,theme})=>{localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'}));},{locale,theme});
   const p=await c.newPage();p.setDefaultTimeout(15000);
   const go=async url=>{await p.goto(url);await p.waitForTimeout(200);};const errors=[];p.on('pageerror',e=>errors.push(e.message));
   for(const route of ['products','solutions']){
    await go(`${base}/${route}/`);await p.evaluate(()=>document.fonts.ready);
    const surface=p.locator('main [data-card-depth]').first();await surface.scrollIntoViewIfNeeded();await p.mouse.move(0,0);await p.waitForTimeout(230);
    const host=surface.locator('..'), before=await style(surface);
    assert.equal(before.border,'1px');assert.equal((before.shadow.match(/rgba?\(/g)||[]).length,2);
    assert.equal(before.transform,'none');
    if(theme==='dark')assert.notEqual(before.borderColor,'rgba(0, 0, 0, 0)');
    else assert.equal(before.borderColor,'rgba(0, 0, 0, 0)');
    assert.equal(await surface.evaluate(e=>{const s=getComputedStyle(e);return s.backgroundColor===getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();}),false);
    // Keep the outer clip layers; only the surface itself paints shadows.
    assert.equal(await host.evaluate(e=>{for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){if(['hidden','clip'].includes(getComputedStyle(p).overflowY))return false;}return true;}),true);
    if(width===1440){
     await host.hover();await p.waitForTimeout(240);const hover=await style(surface);
     assert.equal(hover.translate,'0px -4px');assert.equal(hover.transform,'none');
     assert.equal((hover.shadow.match(/rgba?\(/g)||[]).length,2,'hover replaces rest shadow rather than stacking four layers');
     await surface.locator('a,button').first().focus();await p.keyboard.press('Tab');
     assert.equal(await p.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle!=='none' && parseFloat(getComputedStyle(document.activeElement).outlineWidth)>0),true);
    }else{
     assert.equal(await p.evaluate(()=>matchMedia('(hover:hover) and (pointer:fine)').matches),false);
     assert.ok(['none','0px','0px 0px'].includes((await style(surface)).translate));
    }
   }
   await go(`${base}/buy/robotdock/`);
   const choice=p.locator('label[data-selected]').first();await choice.click();
   const selected=p.locator('label[data-selected="true"]');await selected.waitFor();
   assert.equal(await selected.getAttribute('data-card-depth'),null);
   assert.ok((await style(selected)).shadow.includes('inset'));
   assert.notEqual((await style(selected)).borderColor,'rgba(0, 0, 0, 0)');
   await selected.hover();await p.waitForTimeout(230);assert.ok((await style(selected)).shadow.includes('inset'));
   await go(`${base}/register/`);
   await p.locator('[class*="codeRow"]').waitFor();
   await p.getByRole('button',{name:locale==='en'?'Simulate human verification (development only)':'模拟人机验证（仅开发）',exact:true}).click();
   const invalid=p.locator('input[aria-invalid="true"]').first();await invalid.waitFor();assert.equal((await style(invalid)).outlineWidth,'2px');
   assert.equal(await p.locator('input[data-card-depth]').count(),0);
   assert.deepEqual(errors,[]);await c.close();console.log('PASS hover/focus/selected/error',width,locale,theme);
  }
  for(const theme of (process.env.ONE_G_DETAIL_PHASE==='zoom'?[]:['light','dark'])){
   const c=await b.newContext({forcedColors:'active',viewport:{width:1440,height:1000}});
   await c.addInitScript(t=>localStorage.setItem('one-g-appearance-v1',t),theme);
   const p=await c.newPage();
   for(const route of ['products','solutions']){
    await p.goto(`${base}/${route}/`);const card=p.locator('main [data-card-depth]').first();await card.scrollIntoViewIfNeeded();await card.hover();await p.waitForTimeout(240);
    const s=await style(card);assert.equal(s.shadow,'none');assert.equal(s.border,'1px');assert.notEqual(s.borderColor,'rgba(0, 0, 0, 0)');assert.equal(s.forced,'auto');
    await card.locator('a,button').first().focus();await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle!=='none'),true);
    await p.screenshot({path:`${out}/${route}-forced-${theme}.png`});
   }await c.close();console.log('PASS forced colors',theme);
  }
  // Match browser zoom's CSS viewport and pixel ratio: 125%/150%, with no source layout changes.
  for(const width of [390,768,1440,1920])for(const zoom of [1.25,1.5])for(const locale of ['zh-CN','en']){
   const c=await b.newContext({viewport:{width:Math.floor(width/zoom),height:Math.floor(1000/zoom)},deviceScaleFactor:zoom,reducedMotion:'reduce'});
   await c.addInitScript(l=>{localStorage.setItem('one-g-locale',l);localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'}));},locale);
   const p=await c.newPage();
   const go=async url=>{await p.goto(url);await p.waitForTimeout(100);};
   for(const route of ['solutions','deep-customization','products/robotdock','login','register']){
    await go(`${base}/${route}/`);await p.evaluate(()=>document.fonts.ready);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`zoom overflow ${width}/${zoom}/${locale}/${route}`);
    assert.equal(await p.locator('main h1,main h2,main h3').evaluateAll(es=>es.filter(e=>!e.classList.contains('sr-only')).every(e=>{const r=document.createRange();r.selectNodeContents(e);return [...r.getClientRects()].filter(x=>x.width>0).every(x=>x.left>=-1&&x.right<=innerWidth+1);})),true,`zoom title ${route}`);
   }await c.close();console.log('PASS equivalent zoom',width,zoom,locale);
  }
  const p=await b.newPage({viewport:{width:390,height:844}});await p.goto(base+'/');await p.waitForTimeout(2200);
  assert.equal(await p.locator('#home-collage-title [data-title-line]').count(),1);
  assert.equal(await p.locator('#home-collage-title').evaluate(e=>getComputedStyle(e).textWrap),'wrap');
  await p.locator('[data-language-toggle]').click();await p.waitForTimeout(2000);
  assert.equal(await p.locator('#home-collage-title [data-title-line]').count(),4);
  assert.equal(await p.locator('#home-collage-title [data-title-line]').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')),true);
  console.log('PASS original Chinese/English line reveal retained');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
