/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node browser verification. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.setDefaultTimeout(15000);
  const base=process.env.ONE_G_TEST_URL || 'http://127.0.0.1:4175/one-g',errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const ready=()=>page.waitForSelector('#workbench-build[aria-busy="false"]');
  async function go(id='sonic-link',query=''){await page.goto(`${base}/configure/${id}/${query}`);await ready();}
  const save=()=>page.getByRole('button',{name:'保存配置预览',exact:true}).filter({visible:true}).click();
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-config:sonic-link')));
  async function choose(id){const option=page.locator(`[data-option-id="${id}"]`);if(await option.getAttribute('aria-pressed')!=='true')await option.click();}
  await page.goto(`${base}/configure/sonic-link/`);await page.waitForURL('**/login/**');
  assert.equal(new URL(page.url()).searchParams.get('returnTo'),'/configure/sonic-link');
  await page.locator('input[name="email"],input[name="account"]').fill('user@one-g.com');await page.locator('input[name="password"]').fill('123456');await page.locator('form button[type="submit"]').click();await page.waitForURL('**/configure/sonic-link/');await ready();
  assert.equal(await page.locator('[data-slot-type]').count(),2);assert.equal(await page.locator('[data-category]').count(),2);
  assert.match(await page.locator('h1').innerText(),/SONIC LINK CONFIGURATION PREVIEW/);
  assert.equal(await page.getByRole('button',{name:'加入购物车',exact:true}).count(),0);
  assert.equal(await page.getByText('RECOMMENDED BUILD',{exact:true}).count(),0);
  assert.equal(await page.getByTestId('configuration-total').innerText(),'价格待定');
  await save();assert.deepEqual((await state()).selections,{bundle:['three'],'add-on':[]});
  for(const gripper of [false,true]) {
   await page.locator('[data-category="add-on"]').click();
   if(gripper)await choose('gripper');
   await page.locator('[data-category="bundle"]').click();
   for(const id of ['full','dual','three']) {
    await choose(id);await save();const stored=await state();
    assert.deepEqual(stored.selections,{bundle:[id],'add-on':gripper?['gripper']:[]});assert.equal(stored.snapshot,undefined);
    assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),'100');
    assert.equal(await page.locator('#workbench-summary details li').count(),(id==='three'?4:5)+(gripper?1:0));
   }
  }
  await page.reload();await ready();await save();assert.deepEqual((await state()).selections['add-on'],['gripper']);
  for(const [query,expected] of [['?bundle=dual','dual'],['?bundle=full&gripper=true','full'],['?bundle=bad','three'],['?bundle=','three'],['?bundle=__proto__','three']]) {
   await go('sonic-link',query);await save();assert.deepEqual((await state()).selections,{bundle:[expected],'add-on':[]});
  }
  await go('sonic-link','?scope=add-on&scene=handling');await choose('gripper');await save();
  assert.equal(await page.getByText('RECOMMENDED BUILD',{exact:true}).count(),0);
  await page.getByRole('button',{name:'从插槽移除 三点遥操',exact:true}).click();
  assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),'0');assert.equal(await page.getByRole('button',{name:'保存配置预览',exact:true}).filter({visible:true}).isDisabled(),true);
  await go('sonic-link','?bundle=three');await page.getByRole('button',{name:'获取报价',exact:true}).filter({visible:true}).click();await page.locator('#workbench-summary a[href^="mailto:"]').waitFor();await page.locator('#workbench-summary a[href^="tel:"]').waitFor();await page.getByRole('button',{name:'关闭客服',exact:true}).filter({visible:true}).click();
  console.log('PASS six combinations, ready, query, saved restore, includes and quote');
  for(const theme of ['dark','zandan-green','aegean-blue','falu-red','burnt-brick','color-vision-safe','monochrome']) {
   await page.evaluate(t=>{localStorage.setItem('one-g-theme:user-demo',['color-vision-safe','monochrome'].includes(t)?'dark':t);localStorage.setItem('one-g-accessibility-theme',['color-vision-safe','monochrome'].includes(t)?t:'null');},theme);await go();await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
  }
  await page.evaluate(()=>{localStorage.setItem('one-g-theme:user-demo','dark');localStorage.setItem('one-g-accessibility-theme','null');});
  for(const [width,height] of [[1280,720],[1440,1000],[375,844],[390,844]]) {
   await page.setViewportSize({width,height});await go('sonic-link','?bundle=dual');
   if(width<768){for(const tab of ['模块库','配置清单','当前配置']){await page.getByRole('tab',{name:tab,exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}}
   else {
    const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollHeight>innerHeight+2,panels:['workbench-library','workbench-build','workbench-summary'].map(id=>{const e=document.getElementById(id);return {id,overflow:getComputedStyle(e).overflowY,clipped:e.scrollHeight>e.clientHeight+2};})}));
    assert.equal(layout.overflow,false);assert.equal(layout.panels[1].overflow,'hidden');assert.equal(layout.panels[1].clipped,false,JSON.stringify(layout));
   }
   await page.screenshot({path:`.next/sonic-configuration-${width}.png`,fullPage:true});
  }
  console.log('PASS seven themes, desktop panels, mobile tabs');
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${base}/configure/`);const entries=page.getByRole('navigation',{name:'选择配置产品'});assert.equal(await entries.getByRole('link').count(),3);assert.match(await entries.innerText(),/SONIC Link.*即将开放/s);await entries.getByRole('link',{name:/SONIC Link/}).click();await ready();
  for(const id of ['sonic-link','robotdock']){await page.goto(`${base}/products/${id}/`);await page.getByRole('link',{name:'配置预览',exact:true}).click();await page.waitForURL(`**/configure/${id}/`);await ready();}
  for(const id of ['hand','gripper','gripper-camera','base']){await choose(id);await save();const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-config:robotdock')));assert.deepEqual(stored.selections.bundle,[id]);assert.equal(stored.snapshot,undefined);assert.equal(await page.getByTestId('configuration-total').innerText(),'价格待定');}
  await page.reload();await ready();assert.match(await page.locator('header').allTextContents().then(x=>x.join(' ')),/概念产品 · 配置预览/);
  await go('robot');assert.equal(await page.getByTestId('configuration-total').innerText(),'¥ 97,800');assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),'60');
  for(const [scene,scope,price] of [['handling','arm','¥ 113,800'],['inspection','perception','¥ 110,800'],['teleoperation','capability','¥ 126,800']]) {
   await go('robot',`?scene=${scene}&scope=${scope}`);await page.getByRole('button',{name:'应用推荐配置',exact:true}).click();assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),'100');assert.equal(await page.getByTestId('configuration-total').innerText(),price);
  }
  await page.getByRole('button',{name:'加入购物车',exact:true}).filter({visible:true}).click();await page.waitForURL('**/cart/');await page.getByText('ONE-G G1 配置方案',{exact:true}).waitFor();
  const before=await page.evaluate(()=>({robot:localStorage.getItem('one-g-config:robot'),dock:localStorage.getItem('one-g-config:robotdock'),cart:localStorage.getItem('one-g-cart')}));
  await go();await save();assert.deepEqual(await page.evaluate(()=>({robot:localStorage.getItem('one-g-config:robot'),dock:localStorage.getItem('one-g-config:robotdock'),cart:localStorage.getItem('one-g-cart')})),before);
  await page.goto(`${base}/cart/`);await page.getByText('ONE-G G1 配置方案',{exact:true}).waitFor();assert.equal(await page.getByText(/SONIC Link 配置方案/).count(),0);
  await page.evaluate(()=>localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'admin-demo'})));await page.goto(`${base}/configure/sonic-link/`);await page.waitForURL('**/admin/');
  assert.deepEqual(errors,[]);console.log('PASS center, product CTAs, RobotDock bundles/save, Robot scenes/scope/recommendation/price/cart, isolation and ADMIN');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
