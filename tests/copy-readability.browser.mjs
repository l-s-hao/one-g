import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';
const { chromium } = await import(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const base=(process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g').replace(/\/$/,'');
const production=process.env.ONE_G_PRODUCTION==='1';
const evidence=createBrowserEvidence({name:'copy-readability',condition:production?'production':'warm'});
const result={matrix:[],checks:[],errors:[]};let browser,page;
const representative=[['catalog','/products/','#product-catalog'],['solutions','/solutions/','#handling'],['robotdock','/products/robotdock/','#product-overview-title'],['product','/products/g1/','#product-description-title'],['register','/register/','#register-title']];
const other=[['home','/','#home-products'],['teleoperation','/solutions/teleoperation/','#overview'],['about','/about/','#platform-route'],['deep','/deep-customization/','h1'],['login','/login/','#auth-title'],['forgot','/forgot-password/','h1'],['purchase','/buy/robotdock/','h1']];
async function checkDescriptions(){
 const invalid=await page.locator('main input[aria-describedby],main select[aria-describedby],main textarea[aria-describedby]').evaluateAll(nodes=>nodes.flatMap(n=>(n.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&!document.getElementById(id)).map(id=>({input:n.id,missing:id}))));assert.deepEqual(invalid,[]);
}
async function font(selector,width){assert.equal(await page.locator(selector).first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize)),width===390?16:18);}
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER});
 for(const width of [1440,390])for(const locale of ['zh-CN','en'])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
  await context.addInitScript(({locale,theme})=>{if(!sessionStorage.getItem('copy-test-init')){sessionStorage.setItem('copy-test-init','1');localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);}}, {locale,theme});
  page=await context.newPage();await evidence.attach(page);page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});
  const extended=(width===1440&&locale==='zh-CN'&&theme==='light')||(width===390&&locale==='en'&&theme==='dark');
  for(const [name,url,selector]of [...representative,...(extended?other:[])]){
   assert.equal((await page.goto(base+url)).status(),200);await page.locator(selector).first().waitFor();
   await page.waitForFunction(({locale,theme})=>document.documentElement.lang===locale&&document.documentElement.classList.contains(theme),{locale,theme});await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,name+' overflow');await checkDescriptions();assert.equal(await page.locator('main a[href="#"]').count(),0);
   if(name==='catalog'){
    const ids=await page.locator('#product-catalog [data-product-id]').evaluateAll(n=>n.map(e=>e.dataset.productId));assert.equal(ids.length,new Set(ids).size);assert.ok(ids.includes('robotdock'));assert.equal(ids.includes('sonic-link'),false);
    assert.equal(await page.locator('#product-catalog .product-subtitle').count(),0);
    const card=page.locator('#product-catalog [data-product-id="robotdock"]');assert.ok(await card.locator('[data-product-status="concept"]').isVisible());
    assert.match(await card.innerText(),locale==='en'?/Not on sale/:/暂未开售/);assert.equal(await card.locator('figcaption').count(),0);assert.equal(await card.locator('p').filter({hasText:locale==='en'?'AI concept image':'AI 概念图'}).count(),0);
    assert.ok(await card.locator('a[href*="products/robotdock"]').first().isVisible());
   }
   if(name==='solutions'){assert.equal(await page.locator('main [data-solution-section]').count(),4);assert.equal(await page.locator('main button[aria-expanded]').count(),0);await font('#handling p',width);assert.match(await page.locator('#inspection').innerText(),locale==='en'?/not confirmed|unconfirmed|not confirm/i:/未确认/);}
   if(name==='robotdock'){await font('[aria-labelledby="product-overview-title"] > p',width);assert.match(await page.locator('#design-evidence').innerText(),locale==='en'?/concept|Concept/:/概念图/);}
   if(name==='product'){assert.equal(await page.locator('#product-description-title').count(),1);assert.equal(await page.locator('.product-description > p').count(),3);assert.match(await page.locator('.product-description').innerText(),locale==='en'?/unconfirmed/:/待确认/);await font('.product-description > p',width);assert.equal(await page.locator('.product-description').evaluate(n=>getComputedStyle(n,'::before').content),'none');if(width===390){const gaps=await page.locator('.product-specs dl > div').evaluateAll(rows=>rows.map(row=>row.querySelector('dd').getBoundingClientRect().left-row.querySelector('dt').getBoundingClientRect().right));assert.ok(gaps.every(gap=>gap>=15),'Specification key/value gap');}}
   if(name==='register'){for(const id of ['password-help','region-help','register-password-error','auth-feedback'])assert.equal(await page.locator('#'+id).count(),1);assert.equal(await page.locator('#register-password').getAttribute('required'),'');}
   if(name==='about')assert.equal(await page.locator('#team-practice').count(),0);
   if(name==='purchase'){assert.ok(await page.locator('#purchase-unavailable').isVisible());assert.equal(await page.locator('button[aria-describedby="purchase-unavailable"]').isDisabled(),true);}
   if(name==='home'){
    assert.equal(await page.getByText('点击展开',{exact:true}).count(),0);
    const grid=page.locator('[data-layout-grid="home-products"]');await grid.locator('[data-preview-id="robotdock"] button[aria-expanded]').click();
    await page.locator('[data-preview-panel="robotdock"]').waitFor();assert.equal(await page.locator('#home-products-robotdock-preview a[href*="products/robotdock"]').count(),1);
    await page.locator('[data-preview-panel="robotdock"] button').last().click();await page.locator('[data-preview-panel="robotdock"]').waitFor({state:'detached'});
   }
   await page.locator(selector).first().evaluate(n=>window.scrollTo(0,n.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(n).scrollMarginTop)||110)));
   await page.waitForFunction(()=>[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&r.width>0&&r.height>0&&r.left<innerWidth&&r.right>0;}).every(i=>i.complete));
   if(extended)await page.screenshot({path:path.join(evidence.dir,`${name}-${width}-${locale}-${theme}.png`),caret:'initial',mask:[page.locator('input')]});
   result.matrix.push({name,url,width,locale,theme,passed:true});
  }
  await context.close();
 }
 if(!production){
  for(const role of ['USER','ADMIN']){
   const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await c.addInitScript(role=>{localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:role==='ADMIN'?'admin-demo':'user-demo'}));},role);
   page=await c.newPage();await evidence.attach(page);
   for(const url of role==='ADMIN'?['/admin/']:['/account/','/cart/','/checkout/']){
    await page.goto(base+url);await page.waitForFunction(()=>document.querySelector('main h1')&&!location.pathname.includes('/login'));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    if(role==='ADMIN')assert.equal(await page.locator('#admin-section-title').innerText(),'仪表盘');
    await page.screenshot({path:path.join(evidence.dir,`${role}-${url.replaceAll('/','')}.png`),caret:'initial',mask:[page.locator('section[aria-labelledby="account-info"],section[aria-labelledby="admin-profile"]')]});
   }
   if(role==='USER'){
    await page.goto(base+'/about/#contact');await page.locator('main [data-contact-entry="about"]').click();const dialog=page.locator('dialog[open]');await dialog.waitFor();
    await dialog.getByRole('button',{name:'预览需求',exact:true}).click();assert.equal(await page.locator('#contact-name').evaluate(n=>n===document.activeElement),true);assert.equal(await page.locator('#contact-name-error').count(),1);await checkDescriptions();
    await page.locator('#contact-name').fill('Fictional Copy Review');await page.locator('#contact-email').fill('copy@example.test');await page.locator('#contact-description').fill('Fictional local preview.');
    await dialog.getByRole('button',{name:'预览需求',exact:true}).click();await dialog.getByText('仅供预览，尚未提交。',{exact:true}).waitFor();await page.keyboard.press('Escape');
   }
   await c.close();
  }
  const c=await browser.newContext();page=await c.newPage();await evidence.attach(page);await page.goto(base+'/register/');await page.getByRole('button',{name:'模拟人机验证（仅开发）',exact:true}).click();await page.locator('#register-nickname-error:not([hidden])').waitFor();assert.equal(await page.locator('#register-nickname').evaluate(n=>n===document.activeElement),true);await checkDescriptions();await c.close();
  result.checks.push('Mock account/admin/cart/checkout, contact field errors and preview, registration errors and aria associations');
 }
 assert.deepEqual(result.errors,[]);result.checks.push('All retained conditions, real detail text, semantic headings, local font tokens, live aria-describedby, no empty links or overflow');fs.writeFileSync(path.join(evidence.dir,'results.json'),JSON.stringify(result,null,2));evidence.finish('passed');console.log(`PASS copy/readability: ${result.matrix.length} page combinations`);
}catch(error){fs.writeFileSync(path.join(evidence.dir,'results.json'),JSON.stringify(result,null,2));await evidence.fail(error,page);throw error;}finally{await browser?.close();}
