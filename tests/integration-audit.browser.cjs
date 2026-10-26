/* eslint-disable @typescript-eslint/no-require-imports -- Safe local integration audit. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');
const mock=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';
const production=process.env.ONE_G_PRODUCTION_URL||'http://127.0.0.1:3001/one-g';
(async()=>{const browser=await chromium.launch({executablePath:process.env.ONE_G_BROWSER,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 for(const width of[390,1440])for(const locale of['zh-CN','en'])for(const theme of['light','dark']){
  const c=await browser.newContext({viewport:{width,height:1000}});
  await c.addInitScript(({locale,theme})=>{if(localStorage.getItem('one-g-audit-initialized'))return;localStorage.setItem('one-g-audit-initialized','1');localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'}));localStorage.setItem('one-g-cart:user-demo',JSON.stringify([{productId:'g1',quantity:2}]));localStorage.setItem('one-g-audit-sentinel','keep');},{locale,theme});
  const p=await c.newPage();p.setDefaultTimeout(15000);const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/hydrat|\[i18n\]/i.test(m.text()))errors.push(m.text());});
  await p.goto(mock+'/buy/robotdock/');await p.waitForFunction(()=>[...document.querySelectorAll('header a')].some(e=>e.getAttribute('href')==='/one-g/account/'));
  await p.locator('input[name="package-robotdock"]').first().check();await p.locator('input[type=radio][value="bank-transfer"]').check();
  const quantity=p.locator('main input[type=number]');await quantity.fill('3');const identity=await quantity.elementHandle();
  const before=await p.evaluate(()=>({session:localStorage.getItem('one-g-auth-demo'),cart:localStorage.getItem('one-g-cart:user-demo'),query:location.search}));
  await p.locator('[data-language-toggle]').click();await p.locator('[data-theme-toggle]').click();await p.waitForTimeout(500);
  assert.equal(await identity.evaluate(e=>e.isConnected),true);
  const after=await p.evaluate(()=>({session:localStorage.getItem('one-g-auth-demo'),cart:localStorage.getItem('one-g-cart:user-demo'),query:location.search}));assert.deepEqual(after,before);
  await p.reload();await p.waitForFunction(()=>document.querySelector('main input[type=number]')?.value==='3');
  await p.waitForFunction(({locale,theme})=>document.documentElement.lang===(locale==='en'?'zh-CN':'en')&&document.documentElement.classList.contains(theme==='light'?'dark':'light'),{locale,theme});
  assert.equal(await p.locator('input[value="bank-transfer"]').isChecked(),true);
  assert.equal(await p.evaluate(()=>document.documentElement.classList.contains('dark')),theme==='light');
  assert.equal(await p.evaluate(()=>document.documentElement.lang),locale==='en'?'zh-CN':'en');
  const other=await c.newPage();await other.goto(mock+'/products/');
  await other.evaluate(()=>localStorage.setItem('one-g-appearance-v1','night'));await p.waitForFunction(()=>document.documentElement.classList.contains('dark')&&localStorage.getItem('one-g-appearance-v1')==='dark');
  await other.evaluate(()=>localStorage.setItem('one-g-appearance-v1','invalid'));await p.waitForFunction(()=>document.documentElement.classList.contains('light')&&localStorage.getItem('one-g-appearance-v1')==='light');
  assert.equal(await p.evaluate(()=>['night','invalid','system','eye-comfort','color-vision-safe'].some(x=>document.documentElement.classList.contains(x))),false);
  assert.equal(await p.evaluate(()=>localStorage.getItem('one-g-audit-sentinel')),'keep');assert.equal(await quantity.inputValue(),'3');assert.deepEqual(errors,[]);
  await c.close();console.log('PASS state/refresh/cross-tab',width,locale,theme);
 }
 const c=await browser.newContext();await c.addInitScript(()=>localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'})));
 const p=await c.newPage();p.setDefaultTimeout(15000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const route of['/buy/sonic-link/','/products/sonic-link/','/configure/sonic-link/','/sonic-link/']){await p.goto(mock+route,{waitUntil:"commit"});await p.waitForURL(/\/solutions\/teleoperation\//);await p.reload();await p.locator('#solution-title').waitFor();}
 await p.goto(mock+'/products/');assert.equal(await p.locator('#product-catalog > [data-product-id]').count(),9);assert.equal(await p.locator('#product-catalog > [data-product-id="sonic-link"]').count(),0);
 await p.evaluate(()=>localStorage.setItem('one-g-cart:user-demo',JSON.stringify([{productId:'sonic-link',quantity:1},{productId:'g1',quantity:2}])));
 await p.goto(mock+'/cart/');await p.getByRole('button',{name:'移除历史 SONIC Link 项目',exact:true}).waitFor();assert.equal(await p.locator('.cart-row input').inputValue(),'2');
 assert.equal(await p.getByRole('button',{name:'请先移除不可购买项目',exact:true}).isDisabled(),true);
 await p.getByRole('button',{name:'移除历史 SONIC Link 项目',exact:true}).click();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('one-g-cart:user-demo')).some(x=>x.productId==='g1'&&x.quantity===2)),true);
 await p.goto(mock+'/checkout/');await p.waitForFunction(()=>document.querySelector('.checkout-sections p.tabular-nums')?.textContent==='¥ 79,600');
 console.log('PASS legacy URLs, canonical catalog and safe historical cart migration');
 let requests=0;p.on('request',r=>{if(r.method()==='POST')requests++;});
 await p.goto(mock+'/about/?openContact=about');const dialog=p.locator('dialog[open]');await dialog.waitFor();
 await dialog.getByRole('button',{name:'预览需求',exact:true}).click();assert.equal(await p.locator('#contact-name').evaluate(e=>e===document.activeElement),true);
 await p.locator('#contact-name').fill('Audit Example');await p.locator('#contact-email').fill('audit@example.test');await p.locator('#contact-description').fill('Synthetic local validation request.');
 await dialog.getByRole('button',{name:'预览需求',exact:true}).click();await dialog.getByText('仅供预览，尚未提交。',{exact:true}).waitFor();assert.equal(requests,0);await p.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
 assert.deepEqual(errors,[]);await c.close();console.log('PASS authenticated contact validation/local preview with no network submission');
 const prod=await browser.newContext();await prod.addInitScript(()=>{localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'admin-demo'}));localStorage.setItem('one-g-mock-auth','1');});
 const q=await prod.newPage();q.setDefaultTimeout(15000);const prodErrors=[];q.on('pageerror',e=>prodErrors.push(e.message));q.on('console',m=>{if(m.type()==='error'&&/hydrat/i.test(m.text()))prodErrors.push(m.text());});
 for(const path of['/admin/?role=ADMIN&mock=1','/%61dmin/','/cart/?mock=1']){await q.goto(production+path);await q.waitForURL(/\/login\//);assert.equal(await q.getByRole('button',{name:'登录暂未开放',exact:true}).isDisabled(),true);assert.equal(await q.getByText(/测试验证码/).count(),0);}
 await q.goto(production+'/login/?returnTo=%2Fone-g%2Fadmin');await q.locator('[data-theme-toggle]').waitFor();assert.equal(await q.getByRole('button',{name:'登录暂未开放',exact:true}).isDisabled(),true);
 assert.deepEqual(prodErrors,[]);await prod.close();console.log('PASS production ignores forged fixtures/flags and encoded protected URL; no hydration mismatch');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
