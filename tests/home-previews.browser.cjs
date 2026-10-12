/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.env.ONE_G_TEST_URL||'http://localhost:5556/one-g';
const artifacts=process.env.ONE_G_ARTIFACTS||'/tmp/one-home-previews';fs.mkdirSync(artifacts,{recursive:true});
const expected={
 'home-products':[{id:'robotdock',href:'/one-g/products/robotdock/'},{id:'g1',href:'/one-g/products/g1/'},{id:'arm-a1',href:'/one-g/products/arm-a1/'},{id:'vision-v1',href:'/one-g/products/vision-v1/'}],
 'home-solutions':[{id:'teleoperation',href:'/one-g/solutions/teleoperation/'},{id:'inspection',href:'/one-g/solutions/#inspection'},{id:'handling',href:'/one-g/solutions/#handling'},{id:'ai',href:'/one-g/solutions/#ai'}]
};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER||'/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});const errors=[],results=[];
try{
 for(const [width,height] of (process.env.ONE_G_PREVIEW_SIZES?JSON.parse(process.env.ONE_G_PREVIEW_SIZES):[[1280,800],[1440,900],[1920,1080],[375,812],[390,844],[844,390],[1024,768],[768,1024]])){
 const p=await browser.newPage({viewport:{width,height}});p.on('pageerror',e=>errors.push(e.stack||e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 assert.equal((await p.goto(base+'/')).status(),200);await p.waitForTimeout(250);
 assert.deepEqual(await p.locator('main > div > section').evaluateAll(els=>els.map(el=>el.getAttribute('id')||el.getAttribute('aria-labelledby'))),['home-collage-title','home-products','home-solutions']);
 assert.equal(await p.locator('main video').count(),0);assert.equal(await p.locator('#home-robotdock-title,#home-sonic-link-title').count(),0);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const layouts=[];
 for(const [namespace,items] of Object.entries(expected)){
 const grid=p.locator(`[data-layout-grid="${namespace}"]`);assert.equal(await grid.locator('[data-preview-id]').count(),4);
 assert.deepEqual(await grid.locator('[data-preview-id]').evaluateAll(els=>els.map(el=>el.dataset.previewId)),items.map(x=>x.id));
 await grid.scrollIntoViewIfNeeded();await p.waitForTimeout(120);
 const geometry=await grid.evaluate(el=>({cols:getComputedStyle(el).gridTemplateColumns,rects:[...el.children].filter(x=>x.dataset.previewId).map(x=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})}));
 if(width>=900){assert.ok(geometry.rects[0].width>geometry.rects[1].width*1.9);assert.ok(geometry.rects[3].width>geometry.rects[2].width*1.9);assert.equal(geometry.rects[0].y,geometry.rects[1].y);assert.equal(geometry.rects[2].y,geometry.rects[3].y);}
 const checkItems=width===1280?items:[items[0],items[3]];
 for(const item of checkItems){
 const slot=grid.locator(`[data-preview-id="${item.id}"]`);const trigger=slot.locator('button[aria-expanded]');await trigger.scrollIntoViewIfNeeded();const start=await slot.locator('article').boundingBox();
 await trigger.focus();await p.keyboard.press('Enter');await p.waitForTimeout(100);const intermediate=await slot.locator('article').boundingBox();await p.waitForTimeout(480);
 const panel=grid.locator(`[data-preview-panel="${item.id}"]`);assert.equal(await panel.count(),1);assert.equal(await p.locator('[data-preview-panel]').count(),1);const end=await panel.boundingBox();const root=await grid.boundingBox();
 assert.ok(end.width*end.height>start.width*start.height*1.15);assert.ok(end.x>=root.x-1&&end.x+end.width<=root.x+root.width+1);assert.ok(end.y>=root.y-1&&end.y+end.height<=root.y+root.height+1);
 assert.ok(Math.abs(intermediate.width-end.width)>0.1||Math.abs(intermediate.height-end.height)>0.1,'shared layout transition has intermediate geometry');
 assert.equal(await panel.locator('a').getAttribute('href'),item.href);assert.equal(await panel.locator('button').count(),2);assert.equal(await panel.locator('button[aria-expanded]').isVisible(),false);
 assert.equal(await grid.locator('[data-preview-scrim]').evaluate(el=>getComputedStyle(el).pointerEvents),'auto');assert.equal(await panel.locator('[aria-modal="true"]').count(),0);
 await panel.locator('img').evaluate(el=>el.decode());assert.ok(await panel.locator('img').evaluate(el=>el.naturalWidth>0));
 if(item===items[0]){await p.screenshot({path:path.join(artifacts,`${namespace}-zh-expanded-${width}x${height}.png`)});}
 if(width===1280&&item.id==='robotdock'){
 assert.match(await panel.innerText(),/暂未开放销售/);assert.match(await panel.innerText(),/非实物照片/);
 await p.locator('button[lang="en"]:visible').first().click();await p.waitForTimeout(100);assert.match(await panel.innerText(),/first-generation concept/i);assert.match(await panel.innerText(),/Explore product/);assert.equal(await grid.getAttribute('data-expanded'),'robotdock');await p.screenshot({path:path.join(artifacts,'products-en-expanded.png')});
 await p.locator('button[lang="zh-CN"]:visible').first().click();
 }
 if(width===1280&&item.id==='teleoperation'){
 await p.locator('button[lang="en"]:visible').first().click();await p.waitForTimeout(100);assert.match(await panel.innerText(),/Teleoperation/);assert.match(await panel.innerText(),/Explore solution/);await p.screenshot({path:path.join(artifacts,'solutions-en-expanded.png')});await p.locator('button[lang="zh-CN"]:visible').first().click();
 }
 if(item.id==='inspection'){await grid.locator('[data-preview-scrim]').click({position:{x:100,y:6}});}else if(item.id==='g1'){await panel.locator('button[aria-label="关闭预览"]').click();}else{await p.keyboard.press('Escape');}
 await p.waitForTimeout(500);assert.equal(await p.locator('[data-preview-panel]').count(),0);assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);const returned=await slot.locator('article').boundingBox();assert.ok(Math.abs(returned.width-start.width)<1);assert.ok(Math.abs(returned.height-start.height)<1);assert.equal(await grid.locator('[data-preview-scrim]').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
 }
 await p.screenshot({path:path.join(artifacts,`${namespace}-zh-grid-${width}x${height}.png`)});layouts.push({namespace,...geometry});
 }
 // A second grid selection closes the first; namespaces never cross-animate.
 await p.locator('[data-layout-grid="home-products"] [data-preview-id="robotdock"] button[aria-expanded]').click();await p.waitForTimeout(500);
 await p.locator('[data-layout-grid="home-solutions"] [data-preview-id="teleoperation"] button[aria-expanded]').click();await p.waitForTimeout(500);
 assert.equal(await p.locator('[data-preview-panel]').count(),1);assert.equal(await p.locator('[data-layout-grid="home-products"]').getAttribute('data-expanded'),'');await p.keyboard.press('Escape');
 await p.locator('footer').scrollIntoViewIfNeeded();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.evaluate(()=>getComputedStyle(document.body).overflowY==='hidden'),false);
 results.push({width,height,layouts});await p.close();
 }
 // Mobile English content and real detail-link navigation.
 const mobile=await browser.newPage({viewport:{width:390,height:844}});await mobile.goto(base+'/');await mobile.locator('button[lang="en"]:visible').first().click();
 for(const namespace of Object.keys(expected)){const grid=mobile.locator(`[data-layout-grid="${namespace}"]`);await grid.locator('button[aria-expanded]').first().click();await mobile.waitForTimeout(550);assert.match(await grid.innerText(),/Explore (product|solution)/);const panelBox=await grid.locator('[data-preview-panel]').boundingBox();assert.ok(panelBox.y>=48&&panelBox.y+panelBox.height<=844);await mobile.screenshot({path:path.join(artifacts,`${namespace}-en-mobile.png`)});await mobile.keyboard.press('Escape');await mobile.waitForTimeout(480);}
 await mobile.locator('[data-layout-grid="home-products"] button[aria-expanded]').first().click();await mobile.waitForTimeout(500);await mobile.locator('[data-preview-panel] a').click();await mobile.waitForURL('**/products/robotdock/');assert.match(await mobile.locator('main').innerText(),/RoboDock/);await mobile.close();
 // Exact solution anchors must both navigate and reveal the actual panel.
 const p=await browser.newPage();for(const id of ['inspection','handling','ai']){const response=await p.goto(base+'/solutions/#'+id);if(response)assert.equal(response.status(),200);await p.waitForTimeout(300);assert.equal(await p.locator('#solution-'+id).isVisible(),true);}
 for(const item of expected['home-products'])assert.equal((await p.goto(new URL(base).origin+item.href)).status(),200);
 assert.equal((await p.goto(base+'/solutions/teleoperation/')).status(),200);await p.close();
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto(base+'/');const grid=reduced.locator('[data-layout-grid="home-products"]');await grid.locator('[data-preview-id="robotdock"] button[aria-expanded]').click();await reduced.waitForTimeout(80);assert.equal(await grid.getAttribute('data-expanded'),'robotdock');assert.match(await grid.innerText(),/暂未开放销售/);await reduced.screenshot({path:path.join(artifacts,'reduced-motion.png')});await reduced.keyboard.press('Escape');await reduced.waitForTimeout(80);assert.equal(await reduced.locator('[data-preview-panel]').count(),0);await reduced.close();
 fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify({results,errors},null,2));assert.deepEqual(errors,[]);console.log('PASS: responsive shared transitions, return geometry, keyboard/focus, all links, language, coordination, reduced motion, no resource/hydration errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
