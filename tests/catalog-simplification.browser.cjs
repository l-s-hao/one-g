/* eslint-disable @typescript-eslint/no-require-imports -- Browser regression test. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER, headless: true });
  const errors = [];
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.setItem('one-g-theme', JSON.stringify({version:2,displayMode:'night'}));
      localStorage.setItem('one-g-theme:user-demo', JSON.stringify({version:2,displayMode:'eye-comfort'}));
      localStorage.setItem('one-g-accessibility-theme', 'color-vision-safe');
      localStorage.setItem('one-g-preservation-check', 'keep');
    });
    const page = await context.newPage();
    page.on('response',r=>{if(r.status()>=400)console.error('HTTP',r.status(),r.url());});
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if(m.type()==='error') errors.push(`${m.text()} (${m.location().url})`); });
    for(const width of [375,390,768,1440,1920]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base+'/products/');
      await page.locator('.product-card:not([data-filter-hidden])').first().waitFor();
      assert.equal(await page.locator('.product-card:not([data-filter-hidden])').count(),9);
      const result = await page.evaluate(() => ({overflow:document.documentElement.scrollWidth>innerWidth,theme:document.documentElement.getAttribute('data-theme'),bg:getComputedStyle(document.querySelector('.products-page')).backgroundColor,cols:getComputedStyle(document.querySelector('.product-grid')).gridTemplateColumns.split(' ').length,ids:[...document.querySelectorAll('.product-card:not([data-filter-hidden])')].map(e=>e.dataset.productId)}));
      assert.equal(result.overflow,false); assert.equal(result.theme,null);assert.equal(result.bg,'rgb(247, 244, 238)');assert.equal(new Set(result.ids).size,9);assert.equal(result.cols,width>=1280?3:2);
      assert.equal(await page.getByRole('button',{name:'显示设置',exact:true}).count(),0);
      assert.equal(await page.getByRole('heading',{name:/主产品|标准商品/}).count(),0);
      for(const [name,count] of [['机器人',3],['机械臂',2],['灵巧手',1],['视觉系统',3],['全部',9]]) {
        await page.getByRole('tab',{name:new RegExp(name)}).click();
        await page.waitForFunction(n=>document.querySelectorAll('.product-card:not([data-filter-hidden])').length===n,count,{timeout:10000}).catch(async e=>{console.error({width,name,count,url:page.url(),actual:await page.locator('.product-card:not([data-filter-hidden])').count()});throw e;});
      }
      for(const id of ['robotdock']) {
        const card=page.locator(`[data-product-id="${id}"]`);
        assert.equal(await card.getByRole('link',{name:'购买',exact:true}).getAttribute('href'),`/one-g/buy/${id}/`);
        assert.equal(await card.getByRole('link',{name:'了解更多',exact:true}).getAttribute('href'),`/one-g/products/${id}/`);
        assert.ok(await card.getByText('获取报价').isVisible());
      }
      await page.reload();await page.locator('.product-card:not([data-filter-hidden])').first().waitFor();
      assert.equal(await page.evaluate(()=>localStorage.getItem('one-g-preservation-check')),'keep');
    }
    for(const route of ['/','/products/robotdock/','/buy/robotdock/','/solutions/','/about/','/deep-customization/','/login/','/account/','/admin/','/admin/login/','/cart/']) {
      await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(200);
      assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-theme')),null);
      assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()),'#F7F4EE');
      assert.equal(await page.getByText('外观与显示辅助',{exact:true}).count(),0);
    }

    await page.goto(base+'/');
    const sonic=page.locator('section').filter({has:page.locator('#home-sonic-link-title')});
    assert.equal(await sonic.getByRole('link',{name:'购买',exact:true}).count(),0);
    assert.equal(await sonic.getByRole('link',{name:'了解方案',exact:true}).getAttribute('href'),'/one-g/solutions/teleoperation/');
    assert.equal(await page.locator('a[href*="/buy/sonic-link"]').count(),0);
    await page.goto(base+'/solutions/');
    assert.equal(await page.locator('article').count(),4);
    assert.equal(await page.locator('#teleoperation').getByRole('link',{name:'查看方案 →'}).getAttribute('href'),'/one-g/solutions/teleoperation/');
    for(const route of ['/products/sonic-link/','/products/sonic-link/specs/','/buy/sonic-link/','/configure/sonic-link/','/sonic-link/','/#sonic-link','/configure/?product=sonic-link']) {
      const response=await page.goto(base+route,{waitUntil:'commit'});assert.ok(response.status()<400);
      await page.waitForURL(url=>url.pathname.replace(/\/+$/,'')==='/one-g/solutions/teleoperation');
      await page.getByRole('heading',{name:'SONIC Link',exact:true}).waitFor();
      assert.equal(await page.locator('a[href*="/buy/sonic-link"]').count(),0);
      assert.equal(await page.getByRole('button',{name:/加入购物车|购买/}).count(),0);
      for(const id of ['modes','system','workflow','showcase','technical'])assert.equal(await page.locator('#'+id).count(),1);
    }
    if(process.env.ONE_G_TEST_PRODUCTION !== '1') {
      await page.goto(base+'/');
      await sonic.getByRole('button',{name:'联系我们',exact:true}).click();
      await page.waitForURL(url=>url.pathname.replace(/\/+$/,'')==='/one-g/login');
      assert.ok(new URL(page.url()).searchParams.get('returnTo').includes('openContact=solutions'));
      await page.getByLabel('手机号',{exact:true}).fill('19900000001');
      await page.getByRole('button',{name:'登录 ONE-G（演示）',exact:true}).click();
      await page.waitForURL(url=>url.pathname==='/one-g/');
      await page.getByRole('dialog').waitFor();
      await page.getByRole('button',{name:'关闭需求窗口',exact:true}).click();
      await page.evaluate(()=>localStorage.setItem('one-g-cart:user-demo',JSON.stringify([{productId:'arm-a1',quantity:2},{productId:'sonic-link',quantity:1}])));
      await page.goto(base+'/cart/');
      await page.getByRole('alert').filter({hasText:'SONIC Link'}).waitFor();
      assert.equal(await page.getByRole('link',{name:'去结算',exact:true}).count(),0);
      await page.getByLabel('ONE-G Arm A1 数量').fill('3');
      assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-cart:user-demo')).some(x=>x.productId==='sonic-link')));
      await page.goto(base+'/checkout/');
      await page.getByRole('alert').filter({hasText:'SONIC Link'}).waitFor();
      assert.equal(await page.getByRole('button',{name:'创建演示待支付订单',exact:true}).isDisabled(),true);
      await page.goto(base+'/cart/');await page.getByRole('button',{name:'移除历史 SONIC Link 项目',exact:true}).click();
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('one-g-cart:user-demo'))),[{productId:'arm-a1',quantity:3}]);
      await page.getByRole('link',{name:'去结算',exact:true}).waitFor();
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: 5 widths; 9 products; 4 solutions; legacy URL compatibility; preserved media/technical content; contact login return; historical cart checkout block; no console/hydration errors');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
