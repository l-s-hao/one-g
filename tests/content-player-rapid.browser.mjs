import assert from 'node:assert/strict';import fs from 'node:fs';
const {chromium}=await import('/home/lsh/.cache/hairline-look/node_modules/playwright-core/index.mjs');const browser=await chromium.launch({headless:true,executablePath:'/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const dir=`docs/reviews/content-player-20261105/rapid-${Date.now()}`;fs.mkdirSync(dir,{recursive:true});const results=[];
try{for(let run=1;run<=3;run++){
 const c=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}});const p=await c.newPage();await p.goto((process.env.ONE_G_TEST_URL||'http://localhost:5566/one-g')+'/solutions/teleoperation/');const a=p.locator('[data-media-id="3pt-demo"]');await a.scrollIntoViewIfNeeded();await a.getByRole('button',{name:'继续播放'}).click();await p.waitForFunction(()=>document.querySelector('[data-media-id="3pt-demo"]')?.dataset.phase==='playing');
 await a.focus();await p.keyboard.press(' ');assert.equal(await a.locator('video').evaluate(v=>v.paused),true);await p.keyboard.press(' ');await p.waitForFunction(()=>document.querySelector('[data-media-id="3pt-demo"]')?.dataset.phase==='playing');
 await a.getByRole('button',{name:'暂停',exact:true}).click();await a.getByRole('button',{name:'继续播放'}).click();await p.waitForFunction(()=>document.querySelector('[data-media-id="3pt-demo"]')?.dataset.phase==='playing');
 results.push({run,rapidKeyboard:true,rapidButtons:true});await c.close();
}console.log(dir,results);fs.writeFileSync(dir+'/results.json',JSON.stringify(results,null,2));}catch(e){fs.writeFileSync(dir+'/failure.txt',e.stack);throw e;}finally{await browser.close();}
