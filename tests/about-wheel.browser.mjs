import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';
const {chromium}=await import(process.env.ONE_G_PLAYWRIGHT || '/home/lsh/.cache/hairline-look/node_modules/playwright-core/index.mjs');
const evidence=createBrowserEvidence({name:'about-wheel',condition:process.env.ONE_G_PRODUCTION==='1'?'production':'warm'});
const base=process.env.ONE_G_TEST_URL || 'http://127.0.0.1:5566/one-g';
const ids=['company-introduction','our-vision','platform-route','capabilities','contact'];
const results={matrix:[],checks:[],errors:[]};let browser;
async function settle(p,id){await p.waitForFunction(id=>{const n=document.querySelector('[data-active-chapter]');return n?.dataset.activeChapter===id&&n.dataset.transitioning==='false';},id);}
async function choose(p,i){await p.locator('nav[aria-label="About"] a').nth(i).click();await settle(p,ids[i]);}
async function valid(p){assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'horizontal overflow');assert.equal(await p.locator('main .scroll-expand,main .scroll-stack-card').count(),0);assert.equal(await p.locator('[data-chapter]:visible').count(),1);assert.equal(await p.locator('[data-chapter]:visible').evaluate(n=>n.inert),false);assert.equal(await p.locator('main figcaption').count(),0);assert.ok(await p.locator('nav[aria-label="About"] a').evaluateAll(ns=>ns.every(n=>{const r=n.getBoundingClientRect();return document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===n;})),'wheel link centers unobstructed');assert.equal(await p.locator('nav[aria-label="About"] a[aria-current="location"]').count(),1);}
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER || '/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
 for(const [width,height]of (process.env.ONE_G_WHEEL_INTERACTIONS_ONLY==='1'?[]:process.env.ONE_G_WHEEL_PHONE_ONLY==='1'?[[390,844]]:[[1440,1000],[1920,1080],[768,1024],[390,844],[1440,600]]))for(const locale of ['zh-CN','en'])for(const theme of ['light','dark']){
  const c=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',isMobile:width===390,hasTouch:width===390});
  await c.addInitScript(({locale,theme})=>{localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);},{locale,theme});
  const p=await c.newPage();p.on('pageerror',e=>results.errors.push({width,locale,theme,message:e.message}));p.on('console',m=>{if(m.type()==='error')results.errors.push({width,locale,theme,message:m.text()});});
  await p.goto(base+'/about/');await p.waitForSelector('[data-enhanced]');await p.waitForFunction(({locale,theme})=>document.documentElement.lang===locale&&document.documentElement.classList.contains(theme),{locale,theme});await p.evaluate(()=>document.fonts.ready);
  await settle(p,ids[0]);await valid(p);
  if((width===1440&&height===1000)||(width===390))await p.screenshot({path:path.join(evidence.dir,`${width}-${locale}-${theme}-intro.png`)});
  for(const i of [1,2,3,4,0]){await choose(p,i);await valid(p);const box=await p.locator('[data-chapter]:visible').boundingBox();const st=await p.locator('#about-chapter-stage').boundingBox();assert.ok(st.height>=box.height-2,'stage fits full content');}
  await choose(p,2);await p.reload();await settle(p,ids[2]);await valid(p);
  if(width===390||width===1440&&height===1000)await p.screenshot({path:path.join(evidence.dir,`${width}-${locale}-${theme}-route.png`)});
  results.matrix.push({width,height,locale,theme,result:'passed'});evidence.record('matrix-pass',{width,height,locale,theme});console.log('matrix',width,height,locale,theme);await c.close();
 }
 if(process.env.ONE_G_WHEEL_TOUCH_ONLY!=='1'){
 const c=await browser.newContext({viewport:{width:1440,height:1000}});const p=await c.newPage();
 const capture=await c.newCDPSession(p);const frames=[];let capturing=true;capture.on('Page.screencastFrame',event=>{if(!capturing)return;frames.push({data:Buffer.from(event.data,'base64'),time:event.metadata.timestamp});void capture.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(error=>{if(capturing)throw error;});});await capture.send('Page.startScreencast',{format:'jpeg',quality:65,maxWidth:1440,maxHeight:1000,everyNthFrame:1});p.on('pageerror',e=>results.errors.push({phase:'interactions',message:e.message}));p.on('console',m=>{if(m.type()==='error')results.errors.push({phase:'interactions',message:m.text()});});
 await p.goto(base+'/about/');await p.waitForSelector('[data-enhanced]');await settle(p,ids[0]);
 await p.locator('nav[aria-label="About"] a').nth(1).click();
 await p.waitForFunction(()=>{const n=document.querySelector('[data-active-chapter]');return n?.dataset.transitioning==='true'&&Number(n.dataset.progress)>.1&&Number(n.dataset.progress)<.8;});
 const mid=await p.evaluate(()=>({position:Number(document.querySelector('.about-option-wheel').dataset.position),progress:Number(document.querySelector('[data-progress]').dataset.progress),layers:[...document.querySelectorAll('[data-chapter]:not([hidden])')].map(n=>({id:n.dataset.chapter,rotation:Number(n.dataset.rotation),opacity:getComputedStyle(n).opacity,inert:n.inert}))}));
 assert.equal(mid.layers.length,2);assert.ok(mid.layers.some(n=>Math.abs(n.rotation)>1));assert.ok(mid.position>0&&mid.position<1);evidence.record('shared-progress-keyframe',mid);await p.screenshot({path:path.join(evidence.dir,'next-mid-arc.png')});await settle(p,ids[1]);
 await p.locator('nav[aria-label="About"] a').nth(0).click();await p.waitForFunction(()=>{const n=document.querySelector('[data-progress]');return n?.dataset.transitioning==='true'&&Number(n.dataset.progress)>.1&&Number(n.dataset.progress)<.8;});
 const reverse=await p.locator('[data-chapter]:visible').evaluateAll(ns=>ns.map(n=>({id:n.dataset.chapter,rotation:Number(n.dataset.rotation)})));assert.ok(reverse.find(n=>n.id==='company-introduction').rotation<0);assert.ok(reverse.find(n=>n.id==='our-vision').rotation>0);evidence.record('reverse-progress-keyframe',{layers:reverse});await p.screenshot({path:path.join(evidence.dir,'previous-mid-arc.png')});await settle(p,ids[0]);results.checks.push('opposite arc direction');
 await p.locator('nav[aria-label="About"] a').nth(4).click();
 await p.waitForFunction(()=>document.querySelector('[data-transitioning]')?.dataset.transitioning==='true');
 assert.deepEqual(await p.locator('[data-chapter]:visible').evaluateAll(ns=>ns.map(n=>n.dataset.chapter)),[ids[0],ids[4]]);await p.screenshot({path:path.join(evidence.dir,'first-to-last-arc.png')});await settle(p,ids[4]);
 await choose(p,0);await p.evaluate(()=>{const a=document.querySelectorAll('nav[aria-label="About"] a');a[3].click();a[1].click();a[4].click();});await settle(p,ids[4]);await valid(p);results.checks.push('far jump and rapid replacement');
 await p.goBack();await settle(p,ids[1]);await p.goForward();await settle(p,ids[4]);results.checks.push('history');
 await p.goto(base+'/products/robotdock/');await p.locator('a[href*="/about"][href$="#platform-route"]').click();await settle(p,ids[2]);results.checks.push('real product reverse link');
 await p.goto(base+'/about/#integration-layer');await settle(p,ids[2]);await valid(p);results.checks.push('legacy anchor direct');
 const nav=p.locator('nav[aria-label="About"]');await nav.locator('a').nth(2).focus();await p.keyboard.press('ArrowDown');await settle(p,ids[3]);assert.equal(await p.locator('nav a:focus').getAttribute('href'),'#capabilities');results.checks.push('keyboard scoped');
 const video=p.locator('[data-chapter="capabilities"] video');await video.evaluate(v=>v.play());await p.waitForFunction(()=>document.querySelector('[data-chapter="capabilities"] video').currentTime>0);await choose(p,4);assert.ok(await video.evaluate(v=>v.paused));await choose(p,3);assert.ok(await video.evaluate(v=>v.paused));results.checks.push('video pauses without auto resume');
 await p.evaluate(()=>window.__aboutVideo=document.querySelector('[data-chapter="capabilities"] video'));
 // Change preferences through existing controls where available, without remounting the stage.
 const language=p.locator('[data-language-toggle]');
 assert.equal(await language.count(),1);{await language.first().click();await p.waitForFunction(()=>document.documentElement.lang==='en');assert.ok(await p.evaluate(()=>window.__aboutVideo===document.querySelector('[data-chapter="capabilities"] video')));}
 await p.locator('[data-theme-toggle]').click();await p.waitForFunction(()=>document.documentElement.classList.contains('dark'));assert.ok(await p.evaluate(()=>window.__aboutVideo===document.querySelector('[data-chapter="capabilities"] video')));results.checks.push('preferences preserve video and active chapter');
 await p.emulateMedia({reducedMotion:'reduce'});await choose(p,0);await valid(p);assert.equal(await p.locator('[data-chapter]:visible').evaluate(n=>getComputedStyle(n).transform),'none');results.checks.push('reduced motion');
 await p.emulateMedia({reducedMotion:'no-preference'});await choose(p,2);
 await choose(p,1);await nav.hover();await p.mouse.wheel(0,35);await p.waitForFunction(()=>location.hash==='#platform-route');await settle(p,ids[2]);results.checks.push('local wheel commits selection');
 const box=await nav.boundingBox();await p.mouse.move(box.x+60,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+60,box.y+box.height/2-35,{steps:5});await p.mouse.move(box.x+60,box.y+box.height/2+35,{steps:5});await p.mouse.up();await p.waitForFunction(()=>document.querySelector('[data-transitioning]')?.dataset.transitioning==='false');await valid(p);results.checks.push('drag reversal');
 await choose(p,0);await nav.hover();await p.mouse.wheel(0,-400);await p.waitForFunction(()=>scrollY>=0);await settle(p,ids[0]);await choose(p,4);await nav.hover();await p.mouse.wheel(0,500);await settle(p,ids[4]);results.checks.push('wheel endpoint selection remains bounded');
 await p.evaluate(()=>window.scrollTo(0,0));
 await p.locator('header a[href$="/products/"]').first().hover();await p.locator('#desktop-nav-0 [data-header-image-menu="products"]').waitFor({state:'visible'});await p.locator('#desktop-nav-0 [data-header-image-menu="products"] button[aria-label="Close menu"]').click();await p.locator('#desktop-nav-0 [data-header-image-menu="products"]').waitFor({state:'hidden'});results.checks.push('navigation image drawer');
 // 真实搜索开关验证原有浮层与当前章节保持。
 const search=p.locator('button[aria-label="Search"],button[aria-label="搜索"]');await search.click();await p.locator('#site-search').waitFor({state:'visible'});await p.keyboard.press('Escape');await p.locator('#site-search').waitFor({state:'hidden'});await settle(p,ids[4]);results.checks.push('header search overlay preserves chapter');
 await p.locator('[data-contact-entry="about"]').click();await p.waitForURL(/login/);assert.ok(new URL(p.url()).searchParams.get('returnTo')?.includes('openContact=about'));await p.goBack();await settle(p,ids[4]);results.checks.push('consult login return context');
 await p.locator('#brand-lanyard').scrollIntoViewIfNeeded();assert.ok(await p.locator('footer').count());await p.locator('footer').scrollIntoViewIfNeeded();results.checks.push('lanyard and footer reachable');
 await capture.send('Page.stopScreencast');capturing=false;
 assert.ok(frames.length>8);const sampled=[];let fi=0;for(let time=frames[0].time;time<=frames.at(-1).time;time+=1/15){while(fi+1<frames.length&&frames[fi+1].time<=time)fi++;sampled.push(frames[fi].data);}
 execFileSync('/home/lsh/.cache/ms-playwright/ffmpeg-1011/ffmpeg-linux',['-loglevel','error','-f','image2pipe','-r','15','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libvpx','-b:v','1M',path.join(evidence.dir,'chapter-interactions.webm')],{input:Buffer.concat(sampled),maxBuffer:1024*1024});
 fs.writeFileSync(path.join(evidence.dir,'recording-timeline.json'),JSON.stringify({capturedFrames:frames.length,first:frames[0].time,last:frames.at(-1).time,fps:15,method:'CDP screencast + existing cached ffmpeg1011; no dependency installation'},null,2));
 await c.close();
 }
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mp=await mobile.newPage();await mp.goto(base+'/about/');await mp.waitForSelector('[data-enhanced]');await mp.locator('nav[aria-label="About"] a').nth(3).tap();await settle(mp,ids[3]);await mp.evaluate(()=>window.scrollBy(0,300));await mp.waitForFunction(()=>scrollY>0);assert.equal(await mp.locator('[data-active-chapter]').getAttribute('data-active-chapter'),ids[3]);await mp.locator('nav[aria-label="About"] a').nth(4).tap();await settle(mp,ids[4]);await mobile.close();results.checks.push('real touch selection and body scroll without chapter hijack');
 const nojs=await browser.newContext({javaScriptEnabled:false});const np=await nojs.newPage();await np.goto(base+'/about/');assert.equal(await np.locator('[data-chapter]:visible').count(),5);assert.ok(await np.locator('a[href*="products/robotdock"]').count());await nojs.close();results.checks.push('SSR no script readable');
 assert.deepEqual(results.errors,[],'browser errors');fs.writeFileSync(path.join(evidence.dir,'results.json'),JSON.stringify(results,null,2));evidence.finish('passed');console.log(JSON.stringify({directory:evidence.dir,matrix:results.matrix.length,checks:results.checks}));
}catch(error){fs.writeFileSync(path.join(evidence.dir,'results.json'),JSON.stringify({...results,failure:String(error)},null,2));evidence.finish('failed');throw error;}finally{await browser?.close();}
