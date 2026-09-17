/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const base='http://127.0.0.1:4175/one-g';const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const go=async r=>{const response=await page.goto(base+r);assert.equal(response.status(),200,r);};
 for(const route of ['/','/solutions/','/about/']){await go(route);await page.waitForTimeout(300);assert.ok(!page.url().includes('/login'));}
 for(const route of ['/configure/','/products/','/account/','/cart/']){await go(route);await page.waitForURL('**/login/**');assert.equal(new URL(page.url()).searchParams.get('returnTo'),route.slice(0,-1));}
 await page.locator('input[name="email"],input[name="account"]').fill('user@one-g.com');await page.locator('input[name="password"]').fill('123456');await page.locator('form button[type="submit"]').click();await page.waitForURL('**/cart/');
 await page.evaluate(()=>{for(const id of ['robot','robotdock','sonic-link'])localStorage.setItem('one-g-config:'+id,'retained-user-data');});
 for(const route of ['/configure/robot/','/configure/robotdock/','/configure/sonic-link/','/customize/','/customize/start/']){await go(route+'?scene=inspection&scope=perception');await page.waitForURL('**/configure/');assert.equal(new URL(page.url()).search,'');}
 for(const route of ['/','/configure/','/solutions/','/products/','/products/robotdock/','/products/sonic-link/','/about/','/login/','/account/','/cart/']){
 await go(route);await page.waitForTimeout(250);assert.equal(await page.locator('a[href*="/customize"],a[href*="/configure/robot"],a[href*="/configure/sonic-link"]').count(),0,route);
 }
 await go('/');assert.equal(await page.locator('.home-page section').count(),1);assert.equal(await page.locator('.hero-actions a').count(),3);assert.equal(await page.locator('#site-footer').count(),1);
 assert.deepEqual(await page.getByRole('navigation',{name:'主导航',exact:true}).getByRole('link').allTextContents(),['配置','解决方案','商品中心','了解公司']);
 for(const slug of ['robotdock','sonic-link','g1']){await go('/products/'+slug+'/');await page.getByRole('link',{name:'查看系统配置',exact:true}).click();await page.waitForURL('**/configure/');}
 for(const theme of ['dark','zandan-green','aegean-blue','falu-red','burnt-brick','color-vision-safe','monochrome']){
 await page.evaluate(t=>{localStorage.setItem('one-g-theme:user-demo',['color-vision-safe','monochrome'].includes(t)?'dark':t);localStorage.setItem('one-g-accessibility-theme',['color-vision-safe','monochrome'].includes(t)?t:'null');},theme);
 for(const route of ['/configure/','/solutions/']){await go(route);await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);assert.equal(await page.locator('[role="tab"],[role="progressbar"],[data-slot-type]').count(),0);assert.ok(!/MODULE LIBRARY|CURRENT BUILD|CONFIGURATION SUMMARY|Apply Recommended/.test(await page.locator('main').innerText()));
 if(theme==='monochrome')assert.ok(await page.locator('main img').evaluateAll(imgs=>imgs.every(img=>!getComputedStyle(img).filter.includes('invert'))));}
 }
 for(const width of [375,768,1440]){await page.setViewportSize({width,height:900});for(const route of ['/configure/','/solutions/']){await go(route);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' '+width);await page.screenshot({path:'.next/reset-'+route.split('/')[1]+'-'+width+'.png',fullPage:true});}}
 await page.evaluate(()=>{localStorage.setItem('one-g-theme:user-demo','aegean-blue');localStorage.setItem('one-g-accessibility-theme','null');});
 for(const route of ['/','/about/']){await go(route);await page.waitForFunction(()=>document.documentElement.dataset.theme==='brand');}
 assert.deepEqual(await page.evaluate(()=>['robot','robotdock','sonic-link'].map(id=>localStorage.getItem('one-g-config:'+id))),Array(3).fill('retained-user-data'));
 await go('/products/arm-a1/');await page.getByRole('button',{name:'加入购物车',exact:true}).click();await go('/cart/');assert.ok((await page.locator('main').innerText()).includes('A1'));
 await page.setViewportSize({width:375,height:844});await go('/solutions/');await page.getByRole('button',{name:'打开菜单',exact:true}).click();assert.deepEqual((await page.getByRole('navigation',{name:'移动端导航',exact:true}).getByRole('link').allTextContents()).slice(0,4),['配置','解决方案','商品中心','了解公司']);
 await page.getByRole('button',{name:'关闭菜单',exact:true}).click();await page.getByRole('button',{name:'咨询 ONE-G',exact:true}).first().click();await page.locator('a[href^="mailto:"]').filter({visible:true}).waitFor();
 await go('/configure/');for(const img of await page.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
 const anonymous=await browser.newPage();for(const route of ['/configure/robot/','/configure/robotdock/','/configure/sonic-link/','/customize/','/customize/start/']){await anonymous.goto(base+route+'?scene=inspection');await anonymous.waitForURL('**/login/**');assert.equal(new URL(anonymous.url()).searchParams.get('returnTo'),'/configure');}await anonymous.close();
 assert.deepEqual(errors,[]);console.log('PASS routes, auth, five redirects, Hero, navigation, system CTA, seven themes, responsive pages, brand lock, preserved storage and product cart');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
