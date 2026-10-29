/* eslint-disable @typescript-eslint/no-require-imports -- Opt-in browser acceptance; no production dependency. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const out = process.env.ONE_G_SCREENSHOTS || '/tmp/one-multilingual-layout';
const selector = 'main button:not([aria-controls$="-preview"]), main a[data-button-intent], dialog[open] button';
const samples = {
  double: 'Request verification code Request verification code',
  triple: 'Request verification code Request verification code Request verification code',
  word: 'RequestVerificationCode'.repeat(3),
  thai: 'ยืนยันการสั่งซื้อ กำลังส่งรหัสยืนยัน',
  vietnamese: 'Xác nhận đặt hàng và gửi lại mã xác nhận',
  arabic: 'تأكيد الشراء وإعادة إرسال رمز التحقق',
};

async function inspect(page) {
  return page.evaluate(selector => {
    const failures = [];
    const root = document.documentElement;
    if (root.scrollWidth > root.clientWidth + 1) failures.push(`page ${root.scrollWidth} > ${root.clientWidth}`);
    for (const dialog of document.querySelectorAll('dialog[open]')) if (dialog.scrollWidth > dialog.clientWidth + 1) failures.push('dialog horizontal clipping');
    for (const el of document.querySelectorAll(selector)) {
      if (!el.checkVisibility({ visibilityProperty: true }) || el.closest('[inert]')) continue;
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      const text = el.innerText.trim();
      // Icon-only actions keep their dimensions; they are not stress-label targets.
      if (!text) continue;
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) failures.push(`scroll: ${text.slice(0, 36)}`);
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || !node.parentElement.checkVisibility({ visibilityProperty: true })) continue;
        const range = document.createRange(); range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1) failures.push(`text: ${text.slice(0, 36)}`);
        }
      }
      for (const svg of el.querySelectorAll('svg')) {
        const r = svg.getBoundingClientRect();
        if (r.width + 1 < Number(svg.getAttribute('width'))) failures.push(`icon: ${text.slice(0, 36)}`);
      }
    }
    const bar = document.querySelector('.mobile-checkout-bar');
    if (bar && getComputedStyle(bar).position === 'fixed') {
      const footer = document.querySelector('footer');
      if (!footer || parseFloat(getComputedStyle(footer).paddingBlockEnd) + 1 < bar.getBoundingClientRect().height) failures.push('bar scroll clearance is too short');
    }
    return { failures: [...new Set(failures)], width: innerWidth, dpr: devicePixelRatio };
  }, selector);
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'one-layout-browser-'));
  const extension = path.join(temp, 'extension'); fs.mkdirSync(extension);
  fs.writeFileSync(path.join(extension, 'manifest.json'), JSON.stringify({ manifest_version: 3, name: 'Local layout zoom test', version: '1.0', permissions: ['tabs'], background: { service_worker: 'background.js' } }));
  fs.writeFileSync(path.join(extension, 'background.js'), 'chrome.runtime.onInstalled.addListener(() => {});');
  const browser = await chromium.launchPersistentContext(path.join(temp, 'profile'), {
    executablePath: process.env.ONE_G_BROWSER, viewport: null, reducedMotion: 'reduce',
    ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox', `--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  const results = [], errors = [], fonts = [];
  try {
    const worker = browser.serviceWorkers()[0] || await browser.waitForEvent('serviceworker');
    const page = browser.pages()[0];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (/hydration|didn't match|did not match/i.test(message.text())) errors.push(message.text()); });
    for (const locale of ['zh-CN', 'en']) for (const theme of ['light', 'dark']) {
      for (const route of (process.env.ONE_G_LAYOUT_ROUTES?.split(',') || ['register', 'login', 'cart-empty', 'cart', 'checkout', 'buy/robotdock', 'products', 'products/g1', 'contact', 'home'])) {
        await page.goto(base + '/login/');
        await page.evaluate(({ locale, theme, route }) => {
          localStorage.setItem('one-g-locale', locale);
          localStorage.setItem('one-g-appearance-v1', theme);
          if (['cart', 'cart-empty', 'checkout', 'contact'].includes(route)) localStorage.setItem('one-g-auth-demo', JSON.stringify({ version: 1, userId: 'user-demo' }));
          else localStorage.removeItem('one-g-auth-demo');
          localStorage.setItem('one-g-cart:user-demo', JSON.stringify(route === 'cart-empty' ? [] : [{ productId: 'g1', quantity: 1 }, { productId: 'sonic-link', quantity: 1 }]));
        }, { locale, theme, route });
        await page.goto(base + '/' + (route === 'cart-empty' ? 'cart' : route === 'contact' ? 'deep-customization' : route === 'home' ? '' : route) + (route === 'home' ? '' : '/'));
        await page.waitForFunction(locale => document.documentElement.lang === locale, locale);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(200);
        if (route === 'contact') { await page.locator('main [data-contact-entry]').first().click(); await page.locator('dialog[open]').waitFor(); }
        if (route === 'home') { await page.locator('#home-products [data-preview-id="robotdock"] button[aria-expanded]').click(); await page.locator('#home-products [data-preview-panel="robotdock"] a').waitFor(); }
        // Save text nodes, not innerHTML: inputs, refs, handlers and component state survive.
        await page.evaluate(selector => {
          window.layoutLabels = [];
          for (const el of document.querySelectorAll(selector)) {
            if (!el.innerText.trim() || el.closest('[inert]')) continue;
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const nodes = [];
            while (walker.nextNode()) { const node = walker.currentNode; if (node.textContent.trim() && !node.parentElement.closest('svg') && (!node.parentElement.closest('[aria-hidden=true]') || node.parentElement.closest('[class*=resendReserve]'))) nodes.push(node); }
            window.layoutLabels.push({ el, nodes: nodes.map(node => [node, node.textContent]), disabled: el.disabled, busy: el.getAttribute('aria-busy'), dir: el.getAttribute('dir') });
          }
        }, selector);
        for (const width of [320, 390, 768, 1440]) for (const zoom of [1, 2]) {
          await page.setViewportSize({ width: width * zoom, height: 1000 * zoom });
          await worker.evaluate(async ({ base, zoom }) => { const tabs = await chrome.tabs.query({}); const tab = tabs.find(t => t.url?.startsWith(base)); await chrome.tabs.setZoom(tab.id, zoom); }, { base, zoom });
          await page.waitForFunction(({ width, zoom }) => Math.abs(innerWidth - width) < 1 && Math.abs(devicePixelRatio - zoom) < .01, { width, zoom });
          for (const mode of ['default', ...Object.keys(samples), 'loading', 'disabled']) {
            await page.evaluate(({ mode, samples }) => {
              for (const { el, nodes, disabled, busy, dir } of window.layoutLabels) {
                for (const [node, text] of nodes) node.textContent = mode === 'double' ? `${text} ${text}` : mode === 'triple' ? `${text} ${text} ${text}` : samples[mode] || text;
                if (el.tagName === 'BUTTON') el.disabled = mode === 'disabled' || disabled;
                if (mode === 'loading') { el.setAttribute('aria-busy', 'true'); for (const [node] of nodes) node.textContent = 'Processing your purchase request…'; }
                else if (busy === null) el.removeAttribute('aria-busy'); else el.setAttribute('aria-busy', busy);
                if (mode === 'arabic') el.dir = 'rtl'; else if (dir === null) el.removeAttribute('dir'); else el.dir = dir;
              }
            }, { mode, samples });
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const data = await inspect(page);
            results.push({ locale, theme, route, viewportWidth: width * zoom, targetCssWidth: width, zoom, mode, ...data });
            if (width === 320 && zoom === 1 && locale === 'en' && theme === 'dark' && ['default', 'word', 'arabic'].includes(mode)) {
              await page.screenshot({ path: path.join(out, `${route.replaceAll('/', '-')}-${mode}.png`), fullPage: true });
            }
            if (width === 320 && zoom === 2 && locale === 'en' && theme === 'dark' && mode === 'word') await page.screenshot({ path: path.join(out, `${route.replaceAll('/', '-')}-word-200.png`), fullPage: true });
            if (['thai', 'vietnamese', 'arabic'].includes(mode) && width === 390 && zoom === 1 && locale === 'en' && theme === 'light' && route === 'register') {
              const cdp = await browser.newCDPSession(page); await cdp.send('DOM.enable'); const { root } = await cdp.send('DOM.getDocument');
              const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'button[type=submit] .action-text' });
              fonts.push({ sample: mode, ...(await cdp.send('CSS.enable').then(() => cdp.send('CSS.getPlatformFontsForNode', { nodeId }))) }); await cdp.detach();
              await page.screenshot({ path: path.join(out, `glyph-${mode}.png`), fullPage: true });
            }
          }
        }
        console.log(`${locale} ${theme} ${route}: checked`);
      }
    }
  } finally { await browser.close(); fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ results, errors, fonts }, null, 2)); }
  const failures = results.filter(r => r.failures.length);
  console.log(JSON.stringify({ checks: results.length, failures: failures.length, errors, fonts, examples: failures.slice(0, 25) }, null, 2));
  assert.equal(failures.length, 0, 'Layout failures; see results.json'); assert.deepEqual(errors, []);
})().catch(error => { console.error(error); process.exitCode = 1; });
