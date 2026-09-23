/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');
const base=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER});const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const loginButton=()=>page.getByRole('button',{name:'登录 ONE-G（演示）',exact:true});
 const account=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-auth-demo')||'null'));
 const enter=async(recipient)=>{if(recipient.includes('@'))await page.getByRole('button',{name:'邮箱登录',exact:true}).click();await page.getByLabel(recipient.includes('@')?'邮箱':'手机号',{exact:true}).fill(recipient);};
 const shortcut=async(recipient,target)=>{await enter(recipient);await page.waitForFunction(()=>!document.querySelector('button[type=submit]')?.disabled);assert.equal(await page.getByLabel('验证码',{exact:true}).inputValue(),'');await loginButton().click();await page.waitForURL(base+target);};
 try{
 await page.goto(base+'/login/');assert.ok(await loginButton().isDisabled());assert.equal(await page.getByRole('link',{name:'管理员入口',exact:true}).count(),0);assert.equal(await page.getByText('admin@one-g.com',{exact:false}).count(),0);
 await enter('19900000003');assert.ok(await loginButton().isDisabled());assert.equal(await account(),null);
 await enter('19900000001');assert.equal(await account(),null);await shortcut('19900000001','/account/');assert.equal((await account()).userId,'user-demo');
 await page.evaluate(()=>{localStorage.setItem('one-g-cart:user-demo',JSON.stringify([{productId:'arm-a1',quantity:2}]));localStorage.setItem('one-g-theme:user-demo','night');});await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.theme==='night');
 await page.getByRole('button',{name:'切换用户',exact:true}).click();await page.waitForURL(url=>url.pathname==='/one-g/login/');assert.equal(await account(),null);await shortcut('19900000002','/account/');assert.equal((await account()).userId,'user-demo-b');await page.waitForFunction(()=>document.documentElement.dataset.theme==='standard');await page.goto(base+'/cart/');await page.getByText('购物车还是空的',{exact:true}).waitFor();
 await page.goto(base+'/admin/');await page.getByRole('heading',{name:'无权限',exact:true}).waitFor();
 await page.goto(base+'/account/');await page.getByRole('button',{name:'退出登录',exact:true}).click();await page.waitForURL(base+'/');assert.equal(await account(),null);
 await page.goto(base+'/login/?role=ADMIN&returnTo='+encodeURIComponent('/account'));await shortcut('admin@one-g.com','/admin/');assert.equal((await account()).userId,'admin-demo');assert.equal(await page.locator('header').getByRole('link',{name:'用户中心',exact:true}).count(),0);await page.reload();await page.waitForURL(base+'/admin/');
 await page.getByRole('button',{name:'退出登录',exact:true}).click();await page.waitForURL(url=>url.pathname==='/one-g/login/');assert.equal(await account(),null);assert.equal(await page.locator('input[type=password]').count(),0);
 await page.goto(base+'/admin/login/');await page.waitForURL(url=>url.pathname==='/one-g/login/');assert.equal(new URL(page.url()).pathname,'/one-g/login/');await shortcut('19900000001','/account/');assert.equal((await account()).userId,'user-demo');await page.waitForFunction(()=>document.documentElement.dataset.theme==='night');
 console.log('PASS A/B stable sessions, independent cart/theme, administrator same form, role guards, refresh/logout and legacy redirect');
 await page.goto(base+'/account/');await page.getByRole('button',{name:'退出登录',exact:true}).click();await page.waitForURL(base+'/');
 await page.goto(base+'/login/');await enter('19900000001');await page.getByRole('button',{name:'获取验证码',exact:true}).click();await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。',{exact:true}).waitFor();await page.getByLabel('验证码',{exact:true}).fill('999999');await loginButton().click();await page.getByText('验证码错误或已失效，请重试或重新获取。',{exact:true}).waitFor();assert.equal(await account(),null);
 await page.getByLabel('验证码',{exact:true}).fill('004271');await loginButton().click();await page.waitForURL(base+'/account/');assert.equal((await account()).userId,'user-demo');
 console.log('PASS existing challenge path rejects wrong code and accepts string 004271 without shortcut fallback');
 for(const slug of ['robotdock','sonic-link']){
  await page.goto(base+'/account/');await page.getByRole('button',{name:'退出登录',exact:true}).click();await page.waitForURL(base+'/');
  const target=`/buy/${slug}/?package=${slug==='robotdock'?'hand':'full'}&quantity=3&payment=alipay`;
  await page.goto(base+'/login/?returnTo='+encodeURIComponent(target));await shortcut('demo-a@example.test',target);await page.waitForFunction(()=>document.querySelector('main input[name^="package-"]:checked'));assert.equal(await page.getByLabel('数量',{exact:true}).inputValue(),'3');assert.ok(await page.getByRole('radio',{name:/支付宝/}).isChecked());
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-cart:user-demo'))[0].quantity),2);
 }
 await page.goto(base+'/account/');await page.getByRole('button',{name:'退出登录',exact:true}).click();await page.waitForURL(base+'/');await page.goto(base+'/login/?returnTo=https%3A%2F%2Fevil.test&role=ADMIN');await shortcut('demo-b@example.test','/account/');assert.equal((await account()).userId,'user-demo-b');
 assert.deepEqual(errors,[]);console.log('PASS both purchase return states, no auto-add, external return rejected, no browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
