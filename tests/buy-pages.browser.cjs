/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';
const artifacts='/tmp/one-g-buy-check';fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER});const errors=[],results=[];
 try{
 for(const theme of ['caribbean-calcite','night','color-vision-safe']){
  const context=await browser.newContext();await context.addInitScript(theme=>{if(theme!=='caribbean-calcite')localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'}));localStorage.setItem('one-g-theme:user-demo',theme==='night'?'night':'caribbean-calcite');localStorage.setItem('one-g-accessibility-theme',theme==='color-vision-safe'?theme:'null');},theme);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const width of [375,390,768,1440,1920])for(const [id,count] of [['robotdock',4],['sonic-link',3]]){
   await page.setViewportSize({width,height:900});assert.equal((await page.goto(`${base}/buy/${id}/`)).status(),200);await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
   assert.equal(await page.getByRole('radio').count(),count);assert.equal(await page.getByRole('radio',{checked:true}).count(),0);
   await page.getByRole('radio').nth(1).check();assert.equal(await page.getByRole('radio',{checked:true}).count(),1);const selection=await page.getByRole('radio').nth(1).inputValue();assert.equal(new URL(page.url()).searchParams.get('package'),selection);
   await page.reload();await page.waitForFunction(()=>document.querySelector('main input:checked'));assert.equal(await page.getByRole('radio',{checked:true}).inputValue(),selection);
   await page.getByRole('radio').first().focus();await page.keyboard.press('ArrowDown');assert.equal(await page.getByRole('radio').nth(1).isChecked(),true);
   assert.ok(await page.getByRole('button',{name:'加入购物车',exact:true}).isDisabled());assert.equal(await page.getByText('支付方式待配置',{exact:true}).count(),1);assert.equal(await page.getByText('暂无已确认的推荐商品。',{exact:true}).count(),1);
   assert.equal(await page.locator('header').getByRole('link',{name:'配置',exact:true}).count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.evaluate(()=>localStorage.getItem('one-g-cart')),null);
   await page.screenshot({path:`${artifacts}/${id}-${theme}-${width}.png`,fullPage:true});
   results.push(`${id} ${theme} ${width}: public, package count/selection/reload/keyboard, blocked checkout, no overflow`);
  }await context.close();
 }
 const context=await browser.newContext();const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 for(const [old,target] of [['/configure/#robotdock','/buy/robotdock/'],['/configure/?bundle=full#sonic-link','/buy/sonic-link/?package=full'],['/configure/robotdock/?package=hand','/buy/robotdock/?package=hand'],['/configure/sonic-link/?bundleId=dual','/buy/sonic-link/?package=dual'],['/configure/?product=sonic-link&package=full&price=1','/buy/sonic-link/?package=full'],['/configure/','/'],['/configure/robot/','/'],['/customize/start/','/'],['/configure/?product=unknown','/']]){
  await p.goto(base+old);await p.waitForURL(base+target);results.push(`legacy ${old} -> ${target}`);
 }
 await p.goto(base+'/buy/robotdock/?package=hand');await p.waitForFunction(()=>document.querySelector('main input:checked'));await p.getByRole('radio').nth(2).check();await p.goBack();await p.waitForFunction(()=>document.querySelector('main input:checked')?.value==='hand');await p.goForward();await p.waitForFunction(()=>document.querySelector('main input:checked')?.value==='gripper');
 const target='/buy/robotdock/?package=gripper';await p.goto(base+'/login/?returnTo='+encodeURIComponent(target));await p.getByLabel('邮箱',{exact:true}).fill('user@one-g.com');await p.getByLabel('密码',{exact:true}).fill('123456');await p.getByRole('button',{name:'登录 ONE-G',exact:true}).click();await p.waitForURL(base+target);await p.waitForFunction(()=>document.querySelector('main input:checked')?.value==='gripper');assert.equal(await p.evaluate(()=>localStorage.getItem('one-g-cart')),null);assert.ok(await p.getByRole('button',{name:'加入购物车',exact:true}).isDisabled());results.push('Existing demo login with safe buy returnTo restores package ID, no automatic cart mutation; current preview products remain blocked.');
 for(const id of ['robotdock','sonic-link']){
  await p.goto(base+'/');const section=p.locator('main section').nth(id==='robotdock'?0:1);await section.getByRole('link',{name:'购买',exact:true}).click();await p.waitForURL(`**/buy/${id}/`);
  for(const suffix of ['', '/specs']){await p.goto(`${base}/products/${id}${suffix}/`);const links=p.locator('main').getByRole('link',{name:'购买',exact:true});assert.ok(await links.count()>0);for(const link of await links.all())assert.equal(await link.getAttribute('href'),`/one-g/buy/${id}/`);}
 }
 await p.setViewportSize({width:390,height:844});await p.goto(base+'/');const menu=p.getByRole('button',{name:'打开菜单',exact:true});if(await menu.count()){await menu.click();assert.equal(await p.locator('header').getByRole('link',{name:'配置',exact:true}).count(),0);}
 assert.deepEqual(errors,[]);fs.writeFileSync(`${artifacts}/results.json`,JSON.stringify({results,errors},null,2));console.log(`PASS ${results.length} checks; ${artifacts}`);await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
