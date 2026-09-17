/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node browser verification. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.setDefaultTimeout(15000);
  const base=process.env.ONE_G_TEST_URL||'http://127.0.0.1:4175/one-g';
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const ready=()=>page.waitForSelector('#workbench-build[aria-busy="false"]');
  async function go(id,query=''){await page.goto(`${base}/configure/${id}/${query}`);await ready();}
  for(const route of ['/configure','/configure/robot','/configure/robotdock','/configure/sonic-link']) {
   await page.goto(`${base}${route}/`);await page.waitForURL('**/login/**');assert.equal(new URL(page.url()).searchParams.get('returnTo'),route);
  }
  await page.locator('input[name="email"],input[name="account"]').fill('user@one-g.com');await page.locator('input[name="password"]').fill('123456');await page.locator('form button[type="submit"]').click();await page.waitForURL('**/configure/sonic-link/');await ready();
  for(const [old,target] of [['/customize','/configure/robot'],['/customize/start','/configure']]) {
   await page.goto(`${base}${old}/?scene=handling&scope=arm&extra=keep#details`);
   await page.waitForURL(url=>url.pathname===`/one-g${target}/`);
   assert.equal(new URL(page.url()).searchParams.get('extra'),'keep');assert.equal(new URL(page.url()).hash,'#details');
  }
  for(const theme of ['dark','zandan-green','aegean-blue','falu-red','burnt-brick','color-vision-safe','monochrome']) {
   await page.evaluate(t=>{localStorage.setItem('one-g-theme:user-demo',['color-vision-safe','monochrome'].includes(t)?'dark':t);localStorage.setItem('one-g-accessibility-theme',['color-vision-safe','monochrome'].includes(t)?t:'null');},theme);
   for(const id of ['robot','robotdock','sonic-link']) {
    await go(id);await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
    assert.equal(await page.getByRole('navigation',{name:'配置导航'}).getByRole('link').count(),2);
    assert.equal(await page.locator('#workbench-build').getByText('READY · 配置就绪',{exact:true}).count(),1);
    assert.ok(await page.locator('#workbench-library').innerText().then(t=>t.includes('必选')));
    assert.ok(!(await page.title()).match(/Customize|定制/i));
   }
  }
  console.log('PASS auth, legacy suffix, three-product seven themes, navigation/status/required');
  await page.evaluate(()=>{localStorage.setItem('one-g-theme:user-demo','dark');localStorage.setItem('one-g-accessibility-theme','null');});
  for(const [width,height] of [[1280,720],[1440,1000],[375,844],[390,844]]) {
   await page.setViewportSize({width,height});
   for(const [id,groups] of [['robot',5],['robotdock',1],['sonic-link',2]]) {
    await go(id);assert.equal(await page.locator('[data-slot-type]').count(),groups);
    if(width>=1280){
     const layout=await page.evaluate(()=>({pageOverflow:document.documentElement.scrollHeight>innerHeight+2,panels:['workbench-library','workbench-build','workbench-summary'].map(id=>{const e=document.getElementById(id);return {id,overflow:getComputedStyle(e).overflowY,clipped:e.scrollHeight>e.clientHeight+2};})}));
     assert.equal(layout.pageOverflow,false);assert.equal(layout.panels[0].overflow,'auto');assert.equal(layout.panels[2].overflow,'auto');assert.equal(layout.panels[1].overflow,'hidden');assert.equal(layout.panels[1].clipped,false,`${id}: ${JSON.stringify(layout)}`);
     assert.ok(await page.locator('[data-slot-type]').evaluateAll(slots=>slots.every(slot=>[...slot.querySelectorAll('button[aria-label^="从插槽移除"]')].every(button=>button.getBoundingClientRect().bottom<=slot.getBoundingClientRect().bottom))), `${id}: slot removal must remain inside its card`);
    }else{
     for(const tab of ['当前配置','模块库','配置清单']){await page.getByRole('tab',{name:tab,exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
     const name=id==='robot'?'保存配置':'保存配置预览';const save=page.getByRole('button',{name,exact:true}).filter({visible:true});await save.last().click();
     if(id!=='robot'){await page.getByRole('button',{name:id==='sonic-link'?'获取报价':'咨询客服',exact:true}).filter({visible:true}).last().click();await page.locator('a[href^="mailto:"]').filter({visible:true}).waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.locator('[aria-label="配置操作"]').evaluate(e=>e.getBoundingClientRect().height<150),'Contact popup must not stretch the bottom action bar');}
     await page.getByRole('tab',{name:'当前配置',exact:true}).click();
    }
    await page.screenshot({path:`.next/step10-${id}-${width}.png`,fullPage:true});
   }
  }
  console.log('PASS all desktop/mobile sizes, tabs and unified actions');
  await page.setViewportSize({width:1440,height:1000});await page.goto(`${base}/configure/`);
  const cards=page.getByRole('navigation',{name:'选择配置产品'}).getByRole('link');assert.equal(await cards.count(),3);
  for(const card of await cards.all())assert.ok((await card.innerText()).split('\n').length>=4);
  for(const [id,product] of [['robot','g1'],['robotdock','robotdock'],['sonic-link','sonic-link']]) {
   await go(id);await page.getByRole('navigation',{name:'配置导航'}).getByRole('link',{name:'查看产品 →'}).click();await page.waitForURL(`**/products/${product}/`);
   await page.getByRole('link',{name:id==='robot'?'开始配置':'配置预览',exact:true}).click();await ready();
  }
  for(const slug of ['arm-a1','arm-a2','hand-d1','vision-v1','rgbd','lidar-kit']){await page.goto(`${base}/products/${slug}/`);assert.equal(await page.locator('.product-actions a[href*="/configure/"]').count(),0);}
  // A base-only Robot is ready while retaining the documented installed-group progress.
  await go('robot');await page.getByRole('button',{name:'清空配置',exact:true}).click();
  if(await page.locator('[data-category="base"]').getAttribute('aria-expanded')!=='true')await page.locator('[data-category="base"]').click();
  await page.locator('[data-option-id="g1"]').click();assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),'20');
  assert.equal(await page.getByRole('button',{name:'保存配置',exact:true}).filter({visible:true}).isEnabled(),true);
  await page.getByRole('button',{name:'加入购物车',exact:true}).filter({visible:true}).click();await page.waitForURL('**/cart/');await page.getByText('ONE-G G1 配置方案',{exact:true}).waitFor();
  const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-config:robot')).snapshot);assert.equal(snapshot.productId,'g1');assert.equal(snapshot.price,39800);
  await page.evaluate(()=>{localStorage.setItem('one-g-theme:user-demo','aegean-blue');localStorage.setItem('one-g-accessibility-theme','null');});
  for(const route of ['/','/about/']){await page.goto(base+route);await page.waitForFunction(()=>document.documentElement.dataset.theme==='brand');assert.equal(await page.locator('a[href*="/customize"]').count(),0);}
  assert.deepEqual(errors,[]);console.log('PASS registry cards, bidirectional product navigation, accessory CTA removal, ready/progress/cart and brand lock');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
