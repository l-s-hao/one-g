/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
// NODE_PATH=/path/to/node_modules ONE_G_BROWSER=/path/to/chrome node tests/home-navigation.browser.cjs
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const artifacts = process.env.ONE_G_ARTIFACTS || '/tmp/one-g-navigation-review';
fs.mkdirSync(artifacts, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.ONE_G_BROWSER ? { executablePath: process.env.ONE_G_BROWSER } : {}) });
  const results = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [], videoRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => { if (page.url().replace(/\/$/, '') === base && (request.resourceType() === 'media' || /hf_20260508|cloudfront/.test(request.url()))) videoRequests.push(request.url()); });
    const go = async route => {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      await page.locator('main').waitFor();
      await page.waitForTimeout(180);
    };
    const noOverflow = async label => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, label);
    const shot = async name => {
      // Load below-fold images by visiting them before taking a full-page capture.
      for (const image of await page.locator('main img').all()) {
        if (await image.isVisible() && !await image.evaluate(img => !!img.closest('[inert]'))) { await image.scrollIntoViewIfNeeded(); await image.evaluate(img => img.decode().catch(() => {})); }
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifacts, name), fullPage: true });
    };
    await go('/');
    const header = page.locator('header.site-header');
    const showcases = page.locator('main section');
    assert.equal(await showcases.count(), 2);
    assert.deepEqual(await showcases.locator('h1').allTextContents(), ['RobotDock', 'SONIC Link']);
    assert.equal(await page.locator('main [data-package],main [inert],main [data-autoplay],main button').count(), 0);
    assert.equal(await page.locator('video,#home-video-title').count(), 0);
    assert.equal(await page.locator('footer').count(), 1);
    for (const link of await showcases.locator('a').all()) {
      await link.focus(); assert.equal(await link.evaluate(el => el === document.activeElement), true);
    }
    await page.locator('header.site-header a').first().focus();
    // Pointer travel from the item to the full-width panel keeps it open.
    await header.getByRole('button', { name: '展开解决方案', exact: true }).first().hover(); await page.waitForTimeout(160);
    await page.locator('#desktop-nav-0 a').first().hover(); await page.waitForTimeout(220);
    assert.equal(await page.locator('#desktop-nav-0').isVisible(), true);
    await page.locator('#desktop-nav-0 a').first().focus(); await page.keyboard.press('Escape');
    assert.equal(await header.getByRole('button', { name: '展开解决方案', exact: true }).first().evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Space'); assert.equal(await page.locator('#desktop-nav-0').isVisible(), true);
    await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    await header.getByRole('button', { name: '搜索', exact: true }).click();
    assert.equal(await page.locator('#desktop-nav-0').isVisible(), false);
    await page.locator('#site-search').fill('RobotDock');
    assert.equal(await page.locator('#header-search li').count(), 1);
    await header.getByRole('button', { name: '显示辅助', exact: true }).click();
    assert.equal(await page.locator('#header-search').isVisible(), false);
    await page.keyboard.press('Escape');
    results.push('Homepage: two static product sections and four focusable links; Header: hover travel, keyboard, Escape focus, exclusive panels, search.');

    // All footer destinations resolve, including actual protected-link login targets.
    const footer = page.locator('footer');
    assert.equal(await footer.locator('section').count(), 5);
    const footerLinks = await footer.locator('a').evaluateAll(links => links.map(link => ({ label: link.textContent.trim() || link.getAttribute('aria-label'), href: link.href })));
    for (const link of footerLinks) {
      const url = new URL(link.href);
      assert.ok(!url.pathname.includes('/one-g/one-g'));
      assert.notEqual(url.hash, '#');
      const response = await page.request.get(url.href.split('#')[0]); assert.equal(response.status(), 200, link.href);
    }
    assert.equal(await footer.locator('a[href^="tel:"],a[href^="mailto:"]').count(), 0);
    for (const [label, category] of [['机器人','robot'],['机械臂','arm'],['灵巧手','hand'],['视觉系统','vision']]) {
      await footer.getByRole('link', { name: label, exact: true }).click();
      await page.waitForURL(url => url.searchParams.get('category') === category);
      assert.equal(await page.getByRole('tab', { name: label, exact: true }).getAttribute('aria-selected'), 'true');
      assert.equal(await page.getByRole('tab', { name: '配件', exact: true }).count(), 0);
      assert.equal(await page.locator('main .product-grid').getByText(/^(RobotDock|SONIC Link)$/).count(), 0);
    }
    for (const [label, id] of [['搬运','handling'],['巡检','inspection'],['遥操作','teleoperation'],['智能任务','ai']]) {
      await footer.getByRole('link', { name: label, exact: true }).click();
      await page.locator(`#${id} button[aria-expanded="true"]`).waitFor();
      assert.equal(await page.locator(`#solution-${id}`).isVisible(), true);
    }
    for (const name of ['RobotDock','SONIC Link']) {
      await footer.getByRole('link', { name, exact: true }).click();
      await page.waitForURL(url => url.pathname.endsWith(name === 'RobotDock' ? '/products/robotdock/' : '/products/sonic-link/'));
      const target = page.locator('#product-hero');
      await target.waitFor();
    }
    await go('/products/arm-a1/');
    assert.equal(await footer.getByRole('navigation', { name: '页脚路径' }).locator('[aria-current="page"]').textContent(), await page.locator('main h1').textContent());
    results.push('Footer: all link URLs HTTP 200; four categories select correctly; four solution anchors expand; product anchors, current-product breadcrumb, no placeholder contact links.');

    for (const width of [375,390,768,1024,1440,1920]) {
      await page.setViewportSize({ width, height: 900 }); await go('/');
      const geometry = await page.evaluate(() => ({ header: document.querySelector('header.site-header').getBoundingClientRect().bottom, first: document.querySelector('main section').getBoundingClientRect().top }));
      assert.ok(Math.abs(geometry.header - geometry.first) < 2);
      const titleSize = await showcases.locator('h1').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      assert.ok(width < 768 ? titleSize >= 28 && titleSize <= 34 : titleSize >= 48 && titleSize <= 64);
      const logo = await header.locator('[data-brand-logo]:visible').boundingBox();
      assert.ok(width < 768 ? Math.abs(logo.width / logo.height - 1) < .01 : Math.abs(logo.width / logo.height - 1222 / 328) < .02);
      if (width < 1024) {
        await header.getByRole('button', { name: '打开菜单', exact: true }).click();
        await page.locator('#mobile-navigation').getByRole('button', { name: '展开解决方案', exact: true }).click();
        await page.locator('#mobile-nav-0 a').first().focus(); await page.keyboard.press('Escape');
        assert.equal(await header.getByRole('button', { name: '打开菜单', exact: true }).evaluate(el => el === document.activeElement), true);
        await header.getByRole('button', { name: '打开菜单', exact: true }).click();
        await page.setViewportSize({ width: 1200, height: 900 });
        assert.equal(await page.locator('#mobile-navigation').isVisible(), false);
        assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden');
        await page.setViewportSize({ width, height: 900 });
      }
      if (width < 600) {
        await footer.getByRole('button', { name: '产品与配置', exact: true }).click();
        assert.equal(await footer.getByRole('link', { name: 'RobotDock', exact: true }).isVisible(), true);
        await footer.getByRole('button', { name: '商品选购', exact: true }).click();
        assert.equal(await footer.getByRole('link', { name: 'RobotDock', exact: true }).isVisible(), false);
        await footer.getByRole('button', { name: '商品选购', exact: true }).click();
      }
      await noOverflow('home ' + width); await shot(`home-${width}.png`);
      for (const route of ['/configure/','/solutions/','/products/','/about/','/deep-customization/']) {
        await go(route); assert.ok(!page.url().includes('/login')); await noOverflow(route + width);
      }
      results.push(`${width}px: homepage, configure, solutions, products, about, deep customization public; no horizontal overflow; responsive header/footer and logo geometry.`);
    }
    // Anonymous guards remain intact and navigation creates no pending cart action.
    for (const route of ['/account/','/cart/']) { await go(route); await page.waitForURL('**/login/**'); assert.equal(new URL(page.url()).searchParams.get('returnTo'), route.replace(/\/$/,'')); }
    assert.equal(await page.evaluate(() => sessionStorage.getItem('one-g-pending-cart-action')), null);
    await go('/admin/'); await page.waitForURL('**/admin/login/**');
    // Exercise real ThemeProvider session preferences rather than overriding CSS attributes.
    await page.evaluate(() => localStorage.setItem('one-g-auth-demo', JSON.stringify({ version: 1, userId: 'user-demo' })));
    for (const route of ['/account/','/cart/']) { await go(route); assert.ok(!page.url().includes('/login')); }
    for (const theme of ['caribbean-calcite','night','color-vision-safe']) {
      await page.evaluate(theme => { localStorage.setItem('one-g-theme:user-demo', theme === 'night' ? 'night' : 'caribbean-calcite'); localStorage.setItem('one-g-accessibility-theme', theme === 'color-vision-safe' ? theme : 'null'); }, theme);
      for (const width of [375,390,768,1024,1440,1920]) {
        await page.setViewportSize({ width, height: 900 }); await go('/');
        await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, theme);
        await noOverflow(theme + width);
        const contrast = await page.evaluate(() => {
          const rgb = text => text.match(/[\d.]+/g).slice(0,3).map(Number).map(n => { n /= 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; });
          const lum = text => rgb(text).reduce((sum,n,i) => sum + n * [.2126,.7152,.0722][i], 0);
          const ratio = (fg,bg) => { const a=lum(fg),b=lum(bg); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05); };
          const header=document.querySelector('header.site-header'), footer=document.querySelector('footer');
          return { header:ratio(getComputedStyle(header).color,getComputedStyle(header).backgroundColor), footer:ratio(getComputedStyle(footer.querySelector('li a')).color,getComputedStyle(footer).backgroundColor), cta:ratio(getComputedStyle(document.querySelector('main section a')).color,getComputedStyle(document.querySelector('main section a')).backgroundColor) };
        });
        assert.ok(Object.values(contrast).every(value => value >= 4.5), JSON.stringify({ theme, contrast }));
        if (width === 1440 && theme !== 'caribbean-calcite') await shot(`home-${theme}.png`);
      }
    }
    await page.setViewportSize({width:1440,height:900}); await go('/');
    await header.getByRole('button',{name:'展开解决方案',exact:true}).first().click();
    await page.screenshot({path:path.join(artifacts,'header-panel.png')});
    await page.keyboard.press('Escape');
    await footer.getByRole('button',{name:'显示辅助',exact:true}).click();
    await footer.getByRole('radio',{name:'标准显示',exact:true}).check();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='caribbean-calcite');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await showcases.evaluateAll(items=>items.every(el=>getComputedStyle(el).transform==='none')),true);
    assert.deepEqual(errors,[]); assert.deepEqual(videoRequests,[]);
    results.push('Three themes at six widths via ThemeProvider; text and CTA contrast >= 4.5:1; reduced motion; anonymous/user/admin guards; no pending cart action, page/console errors or homepage video requests.');
    fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify({base,results,footerLinks,errors,videoRequests},null,2));
    console.log(results.join('\n')); console.log('PASS; screenshots and results:',artifacts);
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
