/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER});
 const context=await browser.newContext();const errors=[];
 try {
 await context.addInitScript(()=>localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'})));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.ONE_G_TEST_URL||'http://localhost:3010/one-g';
 for(const width of [375,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/login/');
  await page.getByText('验证码服务尚未接入，暂不支持真实用户登录。',{exact:true}).waitFor();
  assert.ok(await page.getByRole('button',{name:'获取验证码',exact:true}).isDisabled());assert.ok(await page.getByRole('button',{name:'登录暂未开放',exact:true}).isDisabled());
  assert.equal(await page.locator('input[type=password]').count(),0);assert.equal(await page.getByText(/测试验证码/).count(),0);
  await page.getByRole('button',{name:'邮箱登录',exact:true}).click();assert.ok(await page.getByRole('button',{name:'获取验证码',exact:true}).isDisabled());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 for(const path of ['/account/','/cart/','/checkout/','/order-success/?success=true']){await page.goto(base+path);await page.waitForURL('**/login/**');}
 for(const slug of ['robotdock','sonic-link']) {
  await page.goto(`${base}/buy/${slug}/`);await page.getByRole('radio',{name:/微信支付/}).check();assert.ok(await page.getByRole('button',{name:'加入购物车',exact:true}).isDisabled());
  await page.getByRole('link',{name:'深度定制'}).click();await page.getByRole('link',{name:'← 返回购买',exact:true}).click();await page.waitForURL(`**/buy/${slug}/**`);await page.waitForFunction(()=>document.querySelector('main input[value=\"wechat-pay\"]')?.checked);
 }
 const adminContext=await browser.newContext();
 await adminContext.addInitScript(()=>{localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'admin-demo',role:'ADMIN'}));localStorage.setItem('NEXT_PUBLIC_ONE_G_MOCK_AUTH','1');localStorage.setItem('mockAuthEnabled','true');});
 const admin=await adminContext.newPage();admin.on('pageerror',e=>errors.push(e.message));
 await admin.goto(base+'/admin/?role=ADMIN&mock=1');await admin.waitForURL(url=>url.pathname==='/one-g/login/');
 assert.equal(await admin.getByRole('link',{name:'管理员入口',exact:true}).count(),0);
 await admin.getByRole('button',{name:'邮箱登录',exact:true}).click();await admin.getByLabel('邮箱',{exact:true}).fill('admin@one-g.com');assert.ok(await admin.getByRole('button',{name:'登录暂未开放',exact:true}).isDisabled());
 await admin.goto(base+'/admin/login/');await admin.waitForURL(url=>url.pathname==='/one-g/login/');assert.equal(await admin.locator('input[type=password]').count(),0);
 await adminContext.close();
 console.log('PASS production: administrator fixture/session and URL/storage flags cannot authorize admin; legacy entry uses unified disabled form');
 assert.deepEqual(errors,[]);console.log('PASS production: phone/email disabled, no mock code/password, forged USER session ignored, protected routes redirect, public purchases and deep return retain payment/prefix, 375/1440 no overflow or hydration error');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
