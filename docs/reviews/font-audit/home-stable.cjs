// Historical audit entry retained; native imports keep CJS execution and lint compatible.
(async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { pathToFileURL } = await import('node:url');
  const { default: assert } = await import('node:assert/strict');
  const tooling = process.env.ONE_G_PLAYWRIGHT;
  const { chromium } = await import(tooling ? pathToFileURL(path.extname(tooling) ? tooling : path.join(tooling, 'index.mjs')).href : 'playwright-core');
  const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
  const output = process.env.ONE_G_FONT_AUDIT_OUT || '/tmp/one-font-audit';
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER });
  const rows = [];
  try {
    for (const width of [1440, 390]) for (const locale of ['zh-CN', 'en']) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390 });
      await context.addInitScript(({ locale, theme }) => { localStorage.setItem('one-g-locale', locale); localStorage.setItem('one-g-appearance-v1', theme); }, { locale, theme });
      const page = await context.newPage();
      await page.goto(base + '/');
      await page.locator('[data-theme-toggle]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2600);
      const lines = await page.locator('[data-title-line]').evaluateAll(elements => elements.map(element => {
        const rect = element.getBoundingClientRect(), parent = element.parentElement.getBoundingClientRect();
        return { text: element.textContent, opacity: getComputedStyle(element).opacity, top: rect.top, parentTop: parent.top, bottom: rect.bottom, parentBottom: parent.bottom, width: rect.width, parentWidth: parent.width };
      }));
      assert.ok(lines.length > 0);
      for (const line of lines) {
        assert.equal(line.opacity, '1');
        assert.ok(line.top >= line.parentTop - 1 && line.bottom <= line.parentBottom + 1 && line.width <= line.parentWidth + 1);
      }
      rows.push({ width, locale, theme, lines });
      await page.screenshot({ path: path.join(output, `home-stable-${width}-${locale}-${theme}.png`) });
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(output, 'home-stable.json'), JSON.stringify(rows, null, 2));
  console.log('PASS 8 home title clipping checks');
})().catch(error => { console.error(error); process.exitCode = 1; });
