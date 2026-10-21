/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser acceptance test. */
const {chromium}=require('playwright-core');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.ONE_G_TEST_URL || 'http://127.0.0.1:3001/one-g',dir=process.env.ONE_G_ARTIFACTS || require('node:path').resolve(__dirname,'../docs/reviews/media-integration');fs.mkdirSync(dir,{recursive:true});
(async()=>{
const b=await chromium.launch({headless:true,...(process.env.ONE_G_BROWSER ? {executablePath:process.env.ONE_G_BROWSER} : {})});
const results={browser:await b.version(),base,matrix:[],playback:[],checks:[],errors:[]};
try{
for(const width of [390,1440])for(const locale of ['zh-CN','en'])for(const theme of ['light','dark']){
 const c=await b.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 await c.addInitScript(({locale,theme})=>{localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);},{locale,theme});
 const p=await c.newPage();p.on('pageerror',e=>results.errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&m.text().includes('[i18n]'))results.errors.push(m.text())});
 const videos=[];p.on('request',r=>{if(/\.mp4/.test(r.url()))videos.push(r.url())});
 for(const route of ['/solutions/','/solutions/teleoperation/','/products/robotdock/','/products/robotdock/specs/']){
  const r=await p.goto(base+route);assert.equal(r.status(),200);await p.waitForFunction(l=>document.documentElement.lang===l,locale);await p.waitForTimeout(180);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow');
  assert.equal(await p.locator('html').getAttribute('class').then(s=>s.includes(theme)),true,'theme');
  if(locale==='en')assert.equal(await p.locator('main').innerText().then(s=>/[\u3400-\u9fff]/.test(s)),false,'English page has Chinese '+route);
  for(const img of await p.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());assert.equal(await img.evaluate(el=>el.naturalWidth>0),true)}
  assert.equal(videos.length,0,'preload none must not fetch videos');
  assert.equal(await p.locator('video[autoplay],video[loop],video[muted]').count(),0);
  if(route==='/solutions/'){
   assert.equal(await p.locator('main article').count(),4);assert.equal(await p.locator('main video').count(),0);
   assert.equal(await p.locator('main [data-demo]').count(),0,'index has no expanded demos initially');
  }
  if(route==='/products/robotdock/')assert.equal(await p.locator('#compute-evidence').count(),1);
  await p.evaluate(()=>scrollTo(0,0));
  await p.screenshot({path:`${dir}/${route.split('/').filter(Boolean).join('-')}-${width}-${locale}-${theme}.png`,fullPage:true});
  results.matrix.push({width,locale,theme,route,status:200,images:'decoded',overflow:false,videoRequestsBeforeClick:videos.length});
 }
 await c.close();
}
const c=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>results.errors.push(e.message));
async function go(route){const response=await p.goto(base+route);if(response)assert.equal(response.status(),200);else assert.equal(p.url(),base+route);await p.locator('main h1').waitFor();}
async function playAll(){
 for(const video of await p.locator('video[data-evidence-video]').all()){
  await video.scrollIntoViewIfNeeded();const id=await video.evaluate(v=>v.closest('[data-demo]').dataset.demo);
  assert.equal(await video.getAttribute('preload'),'none');assert.equal(await video.evaluate(v=>v.controls&&!v.autoplay&&!v.loop),true);
  const info=await video.evaluate(async v=>{
   v.volume=.35;await v.play();v.playbackRate=4;
   return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('playback timeout')),45000);v.addEventListener('ended',()=>{clearTimeout(timer);resolve({duration:v.duration,width:v.videoWidth,height:v.videoHeight,ended:v.ended,controls:v.controls,volume:v.volume,readyState:v.readyState})},{once:true});v.addEventListener('error',()=>reject(Error(v.error?.message)),{once:true})});
  });results.playback.push({id,...info,method:'Complete browser playback at 4x; not real-time human audiovisual watch'});
 }
}
await go('/solutions/teleoperation/');await playAll();
// second play pauses first and keeps user-set volume controls
const vv=p.locator('video');await vv.nth(0).evaluate(v=>v.play());await vv.nth(1).evaluate(v=>v.play());assert.equal(await vv.nth(0).evaluate(v=>v.paused),true);await vv.nth(1).evaluate(v=>v.pause());results.checks.push('Only one evidence video plays at a time; volume adjustable');
await go('/solutions/#handling');await p.locator('#handling video').waitFor();await playAll();
await p.locator('#handling button[aria-expanded]').click();assert.equal(await p.locator('main video').count(),0);results.checks.push('Collapsing an expanded solution unmounts playback');
await go('/solutions/#ai');await p.locator('#ai video').first().waitFor();await playAll();await p.screenshot({path:dir+'/intelligent-expanded-desktop.png',fullPage:true});
await p.setViewportSize({width:390,height:844});await p.screenshot({path:dir+'/intelligent-expanded-mobile.png',fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
// deterministic network failure and retry without relying on a broken production URL
await p.route('**/3pt-demo.mp4',r=>r.fulfill({status:404,body:'missing'}));await go('/solutions/teleoperation/');const first=p.locator('[data-demo="3pt-demo"]');await first.locator('video').evaluate(v=>v.load());await first.locator('video').evaluate(v=>v.play().catch(()=>{}));await first.locator('[role=status]').waitFor();await first.screenshot({path:dir+'/media-failure-mobile.png'});await p.unroute('**/3pt-demo.mp4');await first.getByRole('button').click();await first.locator('video').evaluate(v=>v.play());await p.waitForFunction(()=>document.querySelector('[data-demo="3pt-demo"] video').currentTime>0);await first.locator('video').evaluate(v=>v.pause());assert.equal(await first.locator('[role=status]').count(),0);results.checks.push('404 yields visible fallback; retry recovers playback');
// Route/business regression smoke, using production export (no actual auth or payment)
for(const route of ['/','/products/','/buy/robotdock/','/login/','/cart/','/checkout/']){await go(route);assert.ok(await p.locator('main').isVisible());}
await go('/buy/robotdock/');assert.equal(await p.locator('input[name="package-robotdock"]').count(),4);assert.equal(await p.getByRole('button',{name:'加入购物车',exact:true}).isEnabled(),false);
await go('/products/');assert.equal(await p.locator('.product-grid a[href*="sonic-link"]').count(),0);
await go('/solutions/');assert.equal(await p.locator('main a[href*="buy/sonic-link"]').count(),0);
await p.locator('header [data-language-toggle]').click();await p.waitForFunction(()=>document.documentElement.lang==='en');await p.locator('header [data-language-toggle]').click();await p.waitForFunction(()=>document.documentElement.lang==='zh-CN');
results.checks.push('Home, catalog, login, cart, checkout render; RoboDock retains 4 disabled-purchase previews; no SONIC Link product/purchase introduced; language switch works');
assert.deepEqual(results.errors,[]);results.passed=true;fs.writeFileSync(dir+'/browser-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({matrix:results.matrix.length,playback:results.playback,checks:results.checks,errors:results.errors},null,2));await c.close();
}catch(e){results.failure=String(e.stack);fs.writeFileSync(dir+'/browser-results.json',JSON.stringify(results,null,2));throw e}finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
