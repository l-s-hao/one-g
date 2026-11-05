import { chromium } from '/home/lsh/.cache/hairline-look/node_modules/playwright-core/index.mjs';
const dir='/home/lsh/ONE/docs/reviews/content-player-20261105/ux-review/';const browser=await chromium.launch({headless:true,executablePath:'/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
const page=await browser.newPage({viewport});await page.goto('http://localhost:3000/one-g/solutions/teleoperation/');await page.waitForTimeout(4000);console.log(name,'body', (await page.locator('body').innerText()).slice(0,200));await page.screenshot({path:dir+name+'-latest-entry.png'});
const video=page.locator('video').first();await video.scrollIntoViewIfNeeded();await page.waitForTimeout(2000);
const card=video.locator('..');console.log(name,'card',await card.evaluate(e=>({tag:e.tagName,buttons:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))})));
await page.screenshot({path:dir+name+'-stable-before.png'});
const pause=card.getByRole('button',{name:'暂停',exact:true});if(await pause.count())await pause.click();else await card.getByRole('button',{name:'播放',exact:true}).click();await page.waitForTimeout(500);
console.log(name,'after toggle',await video.evaluate(e=>({paused:e.paused,time:e.currentTime})));
await card.getByRole('button',{name:'全屏',exact:true}).click();await page.waitForTimeout(1500);
console.log(name,'fs',await page.evaluate(()=>({fullscreen:!!document.fullscreenElement,width:innerWidth,height:innerHeight})));await page.screenshot({path:dir+name+'-stable-fullscreen.png'});
await card.getByRole('button').last().click();await page.waitForTimeout(800);await page.screenshot({path:dir+name+'-stable-return.png'});console.log(name,'return',await video.evaluate(e=>({paused:e.paused,time:e.currentTime,rect:{y:e.getBoundingClientRect().y}})));if(await video.evaluate(e=>e.paused))await card.getByRole('button',{name:'播放',exact:true}).click();await page.waitForTimeout(1500);await card.getByRole('button',{name:'暂停',exact:true}).click();await page.mouse.move(2,100);await page.waitForTimeout(1200);await page.screenshot({path:dir+name+'-paused-check.png'});await page.close();}await browser.close();
