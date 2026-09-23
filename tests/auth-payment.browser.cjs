/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert=require('node:assert/strict');
const base=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER});const errors=[];let checks=0;
 const context=await browser.newContext();const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const pass=msg=>{checks++;console.log('PASS',msg)};
 const login=async(channel='phone',identity='19900000001')=>{
  if(channel==='email')await page.getByRole('button',{name:'邮箱登录',exact:true}).click();
  await page.getByLabel(channel==='phone'?'手机号':'邮箱',{exact:true}).fill(identity);
  await page.getByRole('button',{name:'获取验证码',exact:true}).click();
  await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。',{exact:true}).waitFor();
  await page.getByLabel('验证码',{exact:true}).fill('004271');
  await page.getByRole('button',{name:'登录 ONE-G（演示）',exact:true}).click();
 };
 try {
 for(const route of ['/','/products/','/products/robotdock/','/products/sonic-link/specs/','/buy/robotdock/','/buy/sonic-link/','/solutions/','/about/','/deep-customization/']){
  const response=await page.goto(base+route);if(response)assert.equal(response.status(),200,route);await page.locator('main').waitFor();assert.ok(!page.url().includes('/login'),route);}
 pass('public browsing remains public');
 await page.goto(base+'/login/');assert.equal(await page.locator('input[type=password]').count(),0);
 assert.equal(await page.getByRole('link',{name:/忘记密码|淘宝|微信账号|支付宝账号/}).count(),0);
 await page.getByLabel('手机号',{exact:true}).fill('123');await page.getByRole('button',{name:'获取验证码',exact:true}).click();await page.getByText('请输入有效的 11 位手机号。').waitFor();
 await page.getByLabel('手机号',{exact:true}).fill('19900000999');await page.getByRole('button',{name:'获取验证码',exact:true}).click();await page.getByText('暂时无法完成请求，请检查输入或稍后重试。').waitFor();assert.equal(await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。',{exact:true}).count(),0);
 pass('format and send failure do not claim delivery');
 await page.clock.install();
 await page.getByLabel('手机号',{exact:true}).fill('19900000001');await page.getByRole('button',{name:'获取验证码',exact:true}).click();
 assert.ok(await page.getByRole('button',{name:'发送中…',exact:true}).isDisabled());
 await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。',{exact:true}).waitFor();
 assert.ok(await page.getByRole('button',{name:/秒后重发/}).isDisabled());
 await page.getByLabel('验证码',{exact:true}).fill('999999');await page.getByRole('button',{name:'登录 ONE-G（演示）',exact:true}).click();await page.getByText('验证码错误或已失效，请重试或重新获取。').waitFor();
 await page.clock.fastForward(61000);await page.getByRole('button',{name:'获取验证码',exact:true}).click();await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。',{exact:true}).waitFor();
 await page.clock.fastForward(300001);await page.getByLabel('验证码',{exact:true}).fill('004271');await page.getByRole('button',{name:'登录 ONE-G（演示）',exact:true}).click();await page.getByText('验证码错误或已失效，请重新获取。').waitFor();
 pass('sending/verification lock, wrong code, expiry and resend');
 await page.getByLabel('手机号',{exact:true}).fill('19900000002');assert.equal(await page.getByLabel('验证码',{exact:true}).inputValue(),'');assert.equal(await page.getByRole('button',{name:'登录 ONE-G（演示）',exact:true}).isDisabled(),false);
 await page.getByRole('button',{name:'获取验证码',exact:true}).click();await page.getByRole('button',{name:'邮箱登录',exact:true}).click();
 await page.waitForTimeout(700);assert.equal(await page.getByText('演示验证请求已就绪，未发送真实短信/邮件。',{exact:true}).count(),0);
 assert.ok(await page.getByRole('button',{name:'登录 ONE-G（演示）',exact:true}).isDisabled());
 await page.getByLabel('邮箱',{exact:true}).fill('bad');await page.getByRole('button',{name:'获取验证码',exact:true}).click();await page.getByText('请输入有效的邮箱地址。').waitFor();
 pass('channel/address changes invalidate challenge and in-flight requests');
 await page.goto(base+'/login/');await login();await page.waitForURL(base+'/account/');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-auth-demo')).userId),'user-demo');
 await page.evaluate(()=>{localStorage.setItem('one-g-theme:user-demo','night');localStorage.setItem('one-g-cart:user-demo',JSON.stringify([{productId:'arm-a1',quantity:2}]));});
 await page.getByRole('button',{name:'切换用户',exact:true}).click();await page.waitForURL(url=>url.pathname==='/one-g/login/');
 await login('email','demo-a@example.test');await page.waitForURL(base+'/account/');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-auth-demo')).userId),'user-demo');await page.waitForFunction(()=>document.documentElement.dataset.theme==='night');
 pass('both pre-bound fixture channels retain original ID and theme; switch user works');
 for(const slug of ['robotdock','sonic-link']){
  await page.goto(`${base}/buy/${slug}/`);await page.locator('input[name="package-'+slug+'"]').nth(1).check();
  const packageId=await page.locator('input[name="package-'+slug+'"]').nth(1).inputValue();await page.getByLabel('数量',{exact:true}).fill('3');await page.getByRole('radio',{name:/支付宝/}).check();
  assert.equal(await page.locator('main fieldset').last().getByRole('radio').count(),3);assert.ok(await page.getByRole('button',{name:'加入购物车',exact:true}).isDisabled());
  await page.getByRole('link',{name:'深度定制'}).click();await page.getByRole('link',{name:'← 返回购买',exact:true}).click();await page.waitForURL(`**/buy/${slug}/**`);
  await page.waitForFunction(id=>document.querySelector('main input[name^="package-"]:checked')?.value===id,packageId);assert.equal(await page.getByLabel('数量',{exact:true}).inputValue(),'3');assert.ok(await page.getByRole('radio',{name:/支付宝/}).isChecked());
  const target=new URL(page.url()).pathname.replace('/one-g','')+new URL(page.url()).search;
  await page.evaluate(()=>localStorage.removeItem('one-g-auth-demo'));
  await page.goto(base+'/login/?returnTo='+encodeURIComponent(target));await login('email','demo-a@example.test');await page.waitForURL(base+target);
  await page.waitForFunction(id=>document.querySelector('main input[name^="package-"]:checked')?.value===id,packageId);assert.equal(await page.getByLabel('数量',{exact:true}).inputValue(),'3');assert.ok(await page.getByRole('radio',{name:/支付宝/}).isChecked());
 }
 pass('both purchases preserve package, quantity and payment through deep customization and login; preview add blocked');
 await page.goto(base+'/checkout/');await page.getByRole('button',{name:'创建演示待支付订单',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('main input[value=alipay]')?.checked);
 await page.getByRole('button',{name:'创建演示待支付订单',exact:true}).click();await page.waitForURL('**/order-success/**');await page.getByText('演示订单（非真实交易）',{exact:true}).waitFor();await page.getByText('状态：待支付',{exact:true}).waitFor();
 const firstOrder=new URL(page.url()).searchParams.get('order');await page.reload();await page.getByText('状态：待支付',{exact:true}).waitFor();
 await page.goto(base+'/checkout/');await page.getByRole('button',{name:'创建演示待支付订单',exact:true}).click();await page.waitForURL('**/order-success/**');assert.equal(new URL(page.url()).searchParams.get('order'),firstOrder);
 for(const [label,id] of [['微信支付','wechat-pay'],['对公转账','bank-transfer']]){
  await page.goto(base+'/checkout/');await page.getByRole('radio',{name:new RegExp(label)}).check();await page.getByRole('button',{name:'创建演示待支付订单',exact:true}).click();await page.waitForURL('**/order-success/**');await page.getByText('支付方式：'+label,{exact:true}).waitFor();if(id==='bank-transfer')await page.getByText('对公收款信息待配置',{exact:true}).waitFor();assert.equal(await page.locator('main img, main canvas').count(),0);
 }
 pass('checkout keeps preselection; demo orders stay pending, refresh/retry idempotent; three methods, no fake bank/QR');
 await page.goto(base+'/order-success/?success=true');await page.getByText('订单不存在、不可访问或订单服务尚未接入。').waitFor();assert.equal(await page.getByText('已支付',{exact:true}).count(),0);
 await page.goto(base+'/account/');await page.getByRole('button',{name:'切换用户',exact:true}).click();await page.waitForURL(url=>url.pathname==='/one-g/login/');await login('email','demo-b@example.test');await page.waitForURL(base+'/account/');await page.getByText('暂无订单记录。',{exact:true}).waitFor();
 await page.goto(base+'/order-success/?order='+encodeURIComponent(firstOrder));await page.getByText('订单不存在、不可访问或订单服务尚未接入。').waitFor();
 await page.goto(base+'/cart/');await page.getByText('购物车还是空的',{exact:true}).waitFor();
 await page.goto(base+'/admin/');await page.getByRole('heading',{name:'无权限',exact:true}).waitFor();
 pass('other user cart/orders inaccessible, success URL ignored, USER cannot enter admin');
 await page.goto(base+'/account/');await page.getByRole('button',{name:'退出登录',exact:true}).click();await page.waitForURL(base+'/');
 await page.goto(base+'/products/arm-a1/');await page.getByRole('button',{name:'加入购物车',exact:true}).click();await page.waitForURL(url=>url.pathname==='/one-g/login/');await login();await page.waitForURL(base+'/products/arm-a1/');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-cart:user-demo'))[0].quantity),2);
 await page.getByRole('button',{name:'加入购物车',exact:true}).click();await page.getByRole('button',{name:'已加入购物车',exact:true}).waitFor();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-cart:user-demo'))[0].quantity),3);
 pass('eligible add requires login, returns safely and never auto-adds');
 await page.goto(base+'/admin/login/');await page.waitForURL(url=>url.pathname==='/one-g/login/');assert.equal(await page.locator('input[type=password]').count(),0);await page.getByRole('button',{name:'邮箱登录',exact:true}).click();await page.getByLabel('邮箱',{exact:true}).fill('admin@one-g.com');await page.getByRole('button',{name:'登录 ONE-G（演示）',exact:true}).click();await page.waitForURL(base+'/admin/');
 pass('legacy admin login redirects to unified form; exact administrator fixture enters admin');
 assert.deepEqual(errors,[]);console.log(`PASS ${checks} browser scenarios; no page errors`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
