/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance script. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.ONE_G_TEST_URL||'http://127.0.0.1:5556/one-g';
const production=process.env.ONE_G_PRODUCTION==='1';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.ONE_G_BROWSER,headless:true});
 const context=await browser.newContext();const page=await context.newPage();const errors=[];const results=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
 const button=name=>page.getByRole('button',{name,exact:true});
 const session=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-auth-demo')||'null'));
 const reset=async()=>{await page.goto(base+'/login/');await page.evaluate(()=>localStorage.removeItem('one-g-auth-demo'));};
 const fresh=async(target='')=>{await page.goto(base+'/login/'+target);await page.waitForFunction(()=>document.querySelector('[data-login-mode]'));if(!production)await page.waitForFunction(()=>Array.from(document.querySelectorAll('section button')).some(b=>b.textContent==='获取验证码'&&!b.disabled));};
 const send=async(address)=>{await page.getByLabel('邮箱',{exact:true}).fill(address);await button('获取验证码').click();await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。',{exact:true}).waitFor();};
 const submit=()=>button('登录 ONE-G（演示）');
 try {
 await fresh();assert.equal(await page.locator('[data-login-mode]').getAttribute('data-login-mode'),'email');
 assert.deepEqual(await page.locator('[aria-label="其他登录方式"] button').allTextContents(),['手机号登录','微信扫码登录','管理员号登录']);
 assert.deepEqual(await page.locator('[aria-label="其他登录方式"] button').evaluateAll(es=>es.map(e=>e.type)),['button','button','button']);
 assert.equal(await page.locator('form').count(),1);assert.equal(await page.locator('section input').count(),2);
 assert.equal(await page.getByText(/GitHub|Google|OnlyFans|Sign up/).count(),0);
 assert.equal(await page.getByText(/admin@|admin123/).count(),0);
 await button('微信扫码登录').click();await page.getByText('微信登录暂未接入，请先使用邮箱或手机号登录。',{exact:true}).waitFor();assert.equal(await page.locator('form').count(),0);await button('微信扫码登录').click();assert.equal(await session(),null);
 await button('管理员号登录').click();await page.getByLabel('密码',{exact:true}).waitFor();assert.equal(await page.locator('input[type=password]').count(),1);assert.equal(await session(),null);
 await button('← 返回邮箱登录').click();results.push('default email, exactly three non-submit entries, one active form, honest WeChat placeholder');
 if(production){
  await page.getByLabel('邮箱',{exact:true}).fill('demo-a@example.test');assert.ok(await button('登录暂未开放').isDisabled());assert.ok(await button('获取验证码').isDisabled());assert.equal(await page.getByText(/测试验证码/).count(),0);
  await page.evaluate(()=>{localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'admin-demo'}));localStorage.setItem('NEXT_PUBLIC_ONE_G_MOCK_AUTH','1');});
  await page.goto(base+'/admin/');await page.waitForURL('**/login/**');await button('管理员号登录').click();assert.ok(await button('登录暂未开放').isDisabled());
  await page.goto(base+'/admin/login/');await page.waitForURL('**/login/**');await page.getByLabel('管理员账号',{exact:true}).waitFor();assert.ok(await button('登录暂未开放').isDisabled());results.push('production rejects mock/forged session, no demo fixtures, legacy admin lands on disabled admin form');
 }else{
  // Failed send and format feedback, without existence disclosure.
  await button('获取验证码').click();assert.equal(await page.locator(':focus').getAttribute('id'),'recipient');await page.getByLabel('邮箱',{exact:true}).fill('nobody@example.test');await button('获取验证码').click();await page.getByText('暂时无法完成请求，请检查输入或稍后重试。',{exact:true}).waitFor();
  // Abort send and verify by switching panel/recipient; no late session or feedback.
  await page.getByLabel('邮箱',{exact:true}).fill('demo-a@example.test');await button('获取验证码').click();await button('手机号登录').click();await page.waitForTimeout(500);assert.equal(await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。',{exact:true}).count(),0);assert.equal(await session(),null);
  await button('← 返回邮箱登录').click();await send('demo-a@example.test');await button('手机号登录').click();await button('← 返回邮箱登录').click();assert.ok(await page.getByRole('button',{name:/秒后重发/}).isDisabled());assert.equal(await page.getByLabel('验证码',{exact:true}).inputValue(),'');
  await fresh();await send('demo-b@example.test');await page.getByLabel('验证码',{exact:true}).fill('004271');await submit().click();await button('微信扫码登录').click();await page.waitForTimeout(500);assert.equal(await session(),null);
  results.push('invalid/send failure, aborted send/verify, stale feedback rejected, cooldown survives switching');
  // Fresh module instance after reload resets demo service; production rate limiting remains server responsibility.
  await fresh();await send('demo-a@example.test');await page.getByLabel('验证码',{exact:true}).fill('999999');await submit().click();await page.getByText('验证码错误或已失效，请重试或重新获取。',{exact:true}).waitFor();assert.equal(await session(),null);
  await page.getByLabel('验证码',{exact:true}).fill('004271');await submit().click();await page.waitForURL(base+'/account/');assert.equal((await session()).userId,'user-demo');
  await page.goto(base+'/admin/');await page.getByRole('heading',{name:'无权限',exact:true}).waitFor();results.push('leading-zero OTP, wrong code, stable user ID, USER cannot enter admin');
  await reset();await fresh();await button('手机号登录').click();await page.getByLabel('手机号',{exact:true}).fill('19900000002');await submit().click();await page.waitForURL(base+'/account/');assert.equal((await session()).userId,'user-demo-b');
  await reset();await fresh();await page.getByLabel('邮箱',{exact:true}).fill('admin@one-g.com');assert.ok(await submit().isDisabled());await button('管理员号登录').click();await page.getByLabel('管理员账号',{exact:true}).fill('user@one-g.com');await page.getByLabel('密码',{exact:true}).fill('123456');await submit().click();await page.getByText('管理员验证失败，请检查账号和密码后重试。',{exact:true}).waitFor();assert.equal(await session(),null);
  // Fixture credentials are obtained from the existing test source, never displayed by the product.
  const fixture=fs.readFileSync('src/data/mock-users.ts','utf8').match(/id: "admin-demo", email: "([^"]+)", password: "([^"]+)"/);
  await page.getByLabel('管理员账号',{exact:true}).fill(fixture[1]);await page.getByLabel('密码',{exact:true}).fill(fixture[2]);await submit().click();await page.waitForURL(base+'/admin/');assert.equal((await session()).userId,'admin-demo');
  await reset();await page.goto(base+'/admin/login/');await page.waitForURL('**/login/**');await page.getByLabel('管理员账号',{exact:true}).waitFor();results.push('phone shortcut B, admin excluded from email shortcut, USER password denied, existing admin credentials and compatibility redirect');
  await page.evaluate(()=>localStorage.setItem('one-g-cart:user-demo',JSON.stringify([{productId:'arm-a1',quantity:2}])));
  for(const target of ['/cart','/buy/robotdock/?package=hand&quantity=3&payment=alipay','/deep-customization?openContact=deep&product=robotdock','https://evil.test','/admin']){
   await reset();await fresh('?returnTo='+encodeURIComponent(target));await page.getByLabel('邮箱',{exact:true}).fill('demo-a@example.test');await submit().click();await page.waitForURL(url=>!url.pathname.includes('/login'),{timeout:60000});
   const expected=target.startsWith('https')||target==='/admin'?'/account':target;
   if(target.includes('openContact=')){await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'关闭需求窗口',exact:true}).click();}
   const url=new URL(page.url());assert.equal(url.pathname.replace(/\/$/,''),('/one-g'+expected.split('?')[0]).replace(/\/$/,''));
   if(target.includes('package=')){assert.equal(url.search,'?package=hand&quantity=3&payment=alipay');await page.waitForFunction(()=>document.querySelector('input[type=number]')?.value==='3');assert.equal(await page.getByLabel('数量',{exact:true}).inputValue(),'3');assert.ok(await page.getByRole('radio',{name:/支付宝/}).isChecked());}
  }
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-cart:user-demo'))),[{productId:'arm-a1',quantity:2}]);
  results.push('cart/purchase/contact query returns, external/admin return denied, shared session committed before navigation');
 }
 // Screenshots: all locale/theme/viewport combinations; no remount on language/theme changes.
 await reset();
 if(process.env.ONE_G_SKIP_SCREENSHOTS!=='1') for(const width of [1440,390]) for(const locale of ['zh-CN','en']) for(const theme of ['light','dark']) {
  const c=await browser.newContext({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390,reducedMotion:width===390?'reduce':'no-preference'});
  await c.addInitScript(({locale,theme})=>{localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);},{locale,theme});
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await p.goto(base+'/login/');await p.getByLabel(locale==='en'?'Email':'邮箱',{exact:true}).fill('draft@example.test');await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await p.locator('section').evaluate(e=>Math.round(e.getBoundingClientRect().width))<=448,true);
  const wrapper=p.locator('#recipient').locator('..');
  await wrapper.dispatchEvent('pointermove',{pointerType:'mouse',clientX:100,clientY:100});
  assert.equal(await wrapper.evaluate(e=>getComputedStyle(e).backgroundImage.includes('gradient')),width===1440);
  if(width===1440){await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await wrapper.evaluate(e=>getComputedStyle(e).backgroundImage),'none');await p.emulateMedia({reducedMotion:'no-preference'});}
  await wrapper.dispatchEvent('pointerleave',{pointerType:'mouse'});
  await p.locator('#recipient').focus();assert.notEqual(await p.locator('#recipient').evaluate(e=>getComputedStyle(e).outlineStyle),'none');
  await p.screenshot({path:`docs/reviews/login/${production?'production':'mock'}-${width}-${locale}-${theme}.png`,fullPage:true});await c.close();
 }
 await fresh();await page.getByLabel('邮箱',{exact:true}).fill('keep@example.test');await page.getByRole('button',{name:'切换到夜间模式',exact:true}).click();assert.equal(await page.getByLabel('邮箱',{exact:true}).inputValue(),'keep@example.test');
 await page.locator('[data-language-toggle]').click();await page.getByLabel('Email',{exact:true}).waitFor();assert.equal(await page.locator('#recipient').inputValue(),'keep@example.test');
 // Native pointer feedback absent on touch/reduced motion is enforced by CSS and tested in mobile contexts above.
 assert.deepEqual(errors,[]);results.push(process.env.ONE_G_SKIP_SCREENSHOTS==='1'?'Functional run: live theme/language preserve draft; no browser/hydration/i18n errors':'8 locale/theme/desktop/mobile screenshots, keyboard focus, touch/reduced-motion pointer suppression, live theme/language preserve draft, no overflow or browser/hydration/i18n errors');
 fs.writeFileSync(`docs/reviews/login/${production?'production':'mock'}-results.json`,JSON.stringify(results,null,2));console.log(results.join('\n'));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
