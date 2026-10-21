/* eslint-disable @typescript-eslint/no-require-imports -- Standalone opt-in appearance acceptance. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.ONE_G_TEST_URL || 'http://127.0.0.1:3001/one-g';
const out = process.env.ONE_G_SCREENSHOTS || path.resolve(__dirname, '../docs/reviews/invert-buttons');
const baseline = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../docs/reviews/invert-buttons/baseline.json')));
fs.mkdirSync(out, { recursive: true });
const read = el => el.evaluate(e => {
  const s = getComputedStyle(e), r = e.getBoundingClientRect(), pseudo = getComputedStyle(e, '::after'), label = e.querySelector('.action-text')?.getBoundingClientRect();
  return { text: e.textContent.trim(), width: r.width, height: r.height, padding: s.padding, radius: s.borderRadius, font: s.font,
    label: label ? { x: label.x-r.x, y: label.y-r.y, width: label.width, height: label.height } : null,
    bg: s.backgroundColor, color: s.color, border: pseudo.borderColor, borderWidth: pseudo.borderWidth,
    duration: s.transitionDuration, transition: s.transitionProperty, transform: s.transform, filter: s.filter,
    decoration: s.textDecorationLine, outline: s.outlineStyle, outlineWidth: s.outlineWidth,
    surface: e.dataset.invertSurface, disabled: e.matches(':disabled,[aria-disabled="true"],[aria-busy="true"]') };
});
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.ONE_G_BROWSER });
  const result = { browser: await browser.version(), base, geometry: [], states: [], checks: [], errors: [] };
  try {
    for (const width of [390, 1440]) {
      const p = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      p.on('pageerror', error => result.errors.push(error.message));
      for (const row of baseline.filter(item => item.width === width)) {
        await p.goto(base + row.route); await p.locator('main').waitFor(); await p.waitForTimeout(180);
        const hosts = p.locator('[data-button-effect="invert"]');
        for (const old of row.elements) {
          const candidates = await hosts.all(); let found;
          for (const el of candidates) {
            if (await el.evaluate((e, old) => e.tagName === old.tag && e.textContent.trim() === old.text && e.getAttribute('href') === old.href, old)) { found = el; break; }
          }
          assert.ok(found, 'Existing host absent: ' + row.route + old.text);
          const current = await read(found);
          for (const field of ['width','height']) assert.ok(Math.abs(current[field]-old[field]) < .1, `${row.route} ${old.text} ${field}: ${old[field]} -> ${current[field]}`);
          assert.equal(current.padding, old.padding); assert.equal(current.radius, old.radius); assert.equal(current.font, old.font);
          for (const field of ['x','y','width','height']) assert.ok(Math.abs(current.label[field]-old.label[field]) < .1, 'Label moved: ' + row.route + old.text + field);
          result.geometry.push({ width, route: row.route, text: old.text, before: { width: old.width, height: old.height }, after: { width: current.width, height: current.height }, labelUnchanged: true });
        }
        assert.equal(await p.locator('[data-specular-host],.specular-edge,.specular-edge__canvas').count(), 0);
        assert.equal(await p.locator('header.site-header [data-button-effect], [role=tab][data-button-effect], [data-header-image-card][data-button-effect]').count(), 0);
        assert.equal(await p.locator('a button,button a').count(), 0);
      }
      await p.close();
    }
    // Four appearances/languages, mouse and touch; check the real CSS states.
    for (const width of [390,1440]) for (const theme of ['light','dark']) {
      const locale = width === 390 ? 'en' : 'zh-CN';
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width===390, isMobile: width===390, reducedMotion: 'no-preference' });
      await context.addInitScript(({theme,locale}) => { localStorage.setItem('one-g-appearance-v1',theme);localStorage.setItem('one-g-locale',locale); }, {theme,locale});
      const p = await context.newPage(); p.on('pageerror', error => result.errors.push(error.message));
      p.on('console', message => { if(message.type()==='error' && /\[i18n\]|hydration/i.test(message.text())) result.errors.push(message.text()); });
      for (const [route,selector,name] of [['/solutions/','main [data-button-effect]','cta'],['/products/robotdock/','main a[data-button-effect]','purchase-link'],['/buy/robotdock/','main button[data-button-effect]','disabled'],['/login/','button[type=submit]','login-disabled']]) {
        await p.goto(base+route);await p.waitForFunction(locale=>document.documentElement.lang===locale,locale);
        const el=p.locator(selector).first();await el.waitFor();await el.scrollIntoViewIfNeeded();await p.mouse.move(0,0);await p.waitForTimeout(250);
        const before=await read(el);assert.equal(before.duration,'0.2s');assert.equal(before.transition,'background-color, color, border-color');
        await el.hover();await p.waitForTimeout(250);const hover=await read(el);
        assert.equal(hover.width,before.width);assert.equal(hover.height,before.height);assert.equal(hover.decoration,'none');assert.equal(hover.transform,'none');assert.equal(hover.filter,'none');assert.equal(hover.borderWidth,'2px');
        if(width===1440 && !before.disabled){assert.notEqual(before.bg,hover.bg);assert.equal(hover.border,'rgb(58, 115, 217)');}
        else assert.equal(before.bg,hover.bg,'Disabled/touch does not invert');
        if(name==='cta') {
          await p.screenshot({path:path.join(out,`cta-${width}-${theme}.png`),fullPage:false});
          await el.screenshot({path:path.join(out,`cta-detail-${width}-${theme}.png`)});
        }
        if(!before.disabled){await p.mouse.move(0,0);await p.keyboard.press('Tab');await el.focus();assert.equal((await read(el)).outline,'solid');assert.equal((await read(el)).outlineWidth,'2px');}
        await p.emulateMedia({reducedMotion:'reduce'});assert.equal((await read(el)).duration,'0s');await p.emulateMedia({reducedMotion:'no-preference'});
        result.states.push({width,theme,locale,name,before,hover});
      }
      await p.goto(base+'/');await p.locator('#home-products button[data-layout-trigger]').first().count();
      // Use the established Layout Grid opener; its whole-card interaction is unchanged.
      const trigger=p.locator('#home-products button').first();await trigger.scrollIntoViewIfNeeded();await trigger.click();
      const editorial=p.locator('#home-products a[data-button-effect="invert"]');await editorial.waitFor({state:'visible'});assert.equal(await editorial.getAttribute('data-invert-surface'),'card');await editorial.scrollIntoViewIfNeeded();await p.mouse.move(0,0);await p.waitForTimeout(250);const initial=await read(editorial);await editorial.hover();await p.waitForTimeout(250);const hovered=await read(editorial);assert.equal(initial.width,hovered.width);assert.equal(initial.height,hovered.height);
      if(width===1440)assert.notEqual(initial.bg,hovered.bg);
      await editorial.screenshot({path:path.join(out,`editorial-${width}-${theme}.png`)});
      // A single tap/click follows a real Next link; native keyboard Enter also works.
      await editorial.click();await p.waitForURL('**/products/robotdock/');
      await p.goto(base+'/products/arm-a1/');await p.locator('main [data-button-effect="invert"]').click();await p.waitForURL('**/login/**');
      assert.ok(new URL(p.url()).searchParams.get('returnTo').includes('/products/arm-a1'));
      await p.goto(base+'/products/robotdock/');const buy=p.locator('#product-hero a[data-button-effect]');await buy.focus();await p.keyboard.press('Enter');await p.waitForURL('**/buy/robotdock/');
      await context.close();
    }
    result.checks.push('Existing host dimensions, padding, radius, font and label offsets match recorded baseline', 'No button Canvas, old edge DOM, nested controls or excluded navigation/filter opt-ins', '200ms color-only transitions; stable hover dimensions; disabled/loading exclusions; independent keyboard focus; reduced motion instant', 'Mouse and touch, light/dark, Chinese/English, Layout Grid CTA and card surface; native Link/Enter navigation; add-to-cart login guard');
    assert.deepEqual(result.errors,[]);result.passed=true;
  } catch(error) {result.failure=String(error.stack);throw error;} finally {fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
