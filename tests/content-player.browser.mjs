import assert from 'node:assert/strict';
import fs from 'node:fs';

const dir=`docs/reviews/content-player-20261105/run-${Date.now()}`;fs.mkdirSync(dir,{recursive:true});
process.env.PLAYWRIGHT_BROWSERS_PATH=process.env.PLAYWRIGHT_BROWSERS_PATH||process.cwd()+'/docs/reviews/content-player-20261105/browser-runtime';
const {chromium}=await import('/home/lsh/.cache/hairline-look/node_modules/playwright-core/index.mjs');
const browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER||'/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const base=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';const results=[];
const waitPlaying=async(p,id)=>p.waitForFunction(id=>{const n=document.querySelector(`[data-media-id="${id}"]`);return n?.dataset.phase==='playing'&&n.querySelector('video').currentTime>0;},id);
try{
 const c=await browser.newContext({viewport:{width:1440,height:1000}});const p=await c.newPage();
 await p.goto(base+'/solutions/teleoperation/');const a=p.locator('[data-media-id="3pt-demo"]');await a.scrollIntoViewIfNeeded();await waitPlaying(p,'3pt-demo');
 assert.equal(await a.locator('video').evaluate(v=>v.muted&&!v.loop&&!v.autoplay&&!v.controls),true);results.push('real muted visible autoplay');
 await a.getByRole('button',{name:'暂停',exact:true}).click();await p.waitForFunction(()=>document.querySelector('[data-media-id="3pt-demo"]').dataset.phase==='paused');
 const pos=await a.locator('video').evaluate(v=>v.currentTime);assert.ok(pos>0);
 await p.waitForFunction(()=>getComputedStyle(document.querySelector('[data-media-id="3pt-demo"] video')).filter==='blur(6px)'); assert.equal(await a.locator('video').evaluate(v=>getComputedStyle(v).filter),'blur(6px)');assert.equal(await a.getByRole('button',{name:'继续播放'}).evaluate(v=>getComputedStyle(v).filter),'none');await a.screenshot({path:dir+'/paused-desktop.png'});
 await a.getByRole('button',{name:'继续播放'}).click();await waitPlaying(p,'3pt-demo');assert.ok(await a.locator('video').evaluate((v,pos)=>v.currentTime>=pos,pos));results.push('pause media only and resume');
 await a.locator('video').evaluate(v=>{v.currentTime=v.duration-.4;});await p.waitForFunction(()=>document.querySelector('[data-media-id="3pt-demo"]').dataset.phase==='ended');
 assert.equal(await a.locator('video').evaluate(v=>v.ended&&v.paused&&v.currentTime===v.duration),true);await a.screenshot({path:dir+'/ended-desktop.png'});results.push('real ended stops at final frame');
 await a.getByRole('button',{name:'重播'}).first().click();await waitPlaying(p,'3pt-demo');assert.ok(await a.locator('video').evaluate(v=>v.currentTime<5));
 await p.reload();await a.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('[data-media-id="3pt-demo"] video')?.readyState>=1);assert.equal(await a.locator('video').evaluate(v=>v.paused),true);results.push('refresh session suppression and manual replay');
 await a.getByRole('button',{name:'继续播放'}).click();await waitPlaying(p,'3pt-demo');const b=p.locator('[data-media-id="wholebody-balance"]');await b.getByRole('button',{name:'继续播放'}).click();await waitPlaying(p,'wholebody-balance');assert.equal(await a.locator('video').evaluate(v=>v.paused),true);results.push('two visible players manual priority');
 await b.getByRole('button',{name:'暂停',exact:true}).click();await b.getByRole('slider',{name:'播放进度'}).fill('3');assert.equal(await b.locator('video').evaluate(v=>v.paused),true);results.push('paused seek remains paused');
 await c.close();
 for(const width of [1440,390]) for(const locale of ['zh-CN','en']) for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
 await context.addInitScript(({locale,theme})=>{localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);},{locale,theme});
 const page=await context.newPage();await page.goto(base+'/solutions/teleoperation/');const player=page.locator('[data-media-id="3pt-demo"]');await player.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.documentElement.lang==='en'||document.querySelector('[data-content-player] button'));
 assert.equal(await player.locator('video').evaluate(v=>v.paused),true);await player.screenshot({path:`${dir}/${width}-${locale}-${theme}.png`});await context.close();}
 results.push('8 viewport/language/theme combinations, reduced motion');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'));};});const bp=await blocked.newPage();await bp.goto(base+'/');await bp.locator('[data-media-id="wholebody-balance"]').scrollIntoViewIfNeeded();await bp.waitForFunction(()=>document.querySelector('[data-media-id="wholebody-balance"]').dataset.phase==='blocked');assert.equal(await bp.locator('[data-media-id="wholebody-balance"] [role="status"]').innerText(),'点击播放');await blocked.close();results.push('injected autoplay rejection distinguished from resource error');
 fs.writeFileSync(dir+'/results.json',JSON.stringify({results},null,2));console.log(dir,results);
}catch(e){fs.writeFileSync(dir+'/failure.txt',String(e.stack));throw e;}finally{await browser.close();}
