/* eslint-disable @typescript-eslint/no-require-imports -- Opt-in browser audit; no project dependency added. */
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core'), fs = require('fs');
const stage = process.env.STAGE || 'after', dir = (process.env.ONE_G_FONT_AUDIT_OUT || require('node:path').join(require('node:os').tmpdir(), 'one-g-font-audit')) + '/' + stage;
fs.mkdirSync(dir, { recursive: true });
const routes = stage === 'before' ? ['/', '/products/robotdock/', '/products/robotdock/specs/', '/login/', '/solutions/teleoperation/'] : ['/', '/products/', '/products/arm-a1/', '/products/robotdock/', '/products/robotdock/specs/', '/buy/robotdock/', '/solutions/', '/solutions/teleoperation/', '/about/', '/deep-customization/', '/login/', '/account/', '/admin/'];
(async () => {
    const b = await chromium.launch({ executablePath: process.env.ONE_G_BROWSER }), rows = [];
    try {
        for (const width of [1440, 390])
            for (const locale of ['zh-CN', 'en'])
                for (const theme of (stage === 'before' ? ['light'] : ['light', 'dark'])) {
                    const c = await b.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390, isMobile: width === 390 });
                    await c.addInitScript(({ locale, theme }) => { localStorage.setItem('one-g-locale', locale); localStorage.setItem('one-g-appearance-v1', theme); localStorage.setItem('one-g-auth-demo', JSON.stringify({ version: 1, userId: location.pathname.includes('/admin') ? 'admin-demo' : 'user-demo' })); }, { locale, theme });
                    await c.route('**/*', r => r.request().url().includes('_rsc=') ? r.abort() : r.continue());
                    for (const route of routes) {
                        const p = await c.newPage(), requests = [], errors = [];
                        p.on('response', r => { if (/\.(woff2?|ttf|otf)(\?|$)/.test(r.url()))
                            requests.push({ url: r.url(), status: r.status(), fromServiceWorker: r.fromServiceWorker() }); });
                        p.on('pageerror', e => errors.push(e.message));
                        p.on('console', m => { if (m.type() === 'error' && /font|hydration|\[i18n\]/i.test(m.text()))
                            errors.push(m.text()); });
                        await p.goto((['/account/', '/admin/'].includes(route) ? (process.env.ONE_G_MOCK_URL || 'http://localhost:3000/one-g') : (process.env.ONE_G_TEST_URL || 'http://127.0.0.1:3001/one-g')) + route);
                        await p.waitForFunction(locale => document.documentElement.lang === locale, locale);
                        if (['/account/', '/admin/'].includes(route))
                            await p.locator('main [data-invert-variant=secondary]').first().waitFor();
                        await p.evaluate(() => document.fonts.ready);
                        await p.waitForTimeout(150);
                        const client = await c.newCDPSession(p);
                        await client.send('DOM.enable');
                        await client.send('CSS.enable');
                        let doc = await client.send('DOM.getDocument');
                        const rendered = [];
                        for (const selector of ['#home-collage-title [data-title-line]', 'main h1', 'main h2', 'header.site-header nav a', 'main [data-button-effect=invert] .action-text', 'main p', 'main label', 'main input', 'footer p']) {
                            const { nodeId } = await client.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector });
                            if (!nodeId)
                                continue;
                            const fonts = await client.send('CSS.getPlatformFontsForNode', { nodeId });
                            const el = p.locator(selector).first();
                            rendered.push({ selector, text: (await el.textContent()).trim().slice(0, 120), ...fonts, geometry: await el.evaluate(e => { let s = getComputedStyle(e), r = e.getBoundingClientRect(); return { width: r.width, height: r.height, scrollWidth: e.scrollWidth, clientWidth: e.clientWidth, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, fontFamily: s.fontFamily }; }) });
                        }
                        const pageFontRequests = requests.slice();
                        const fontTimings = await p.evaluate(() => performance.getEntriesByType('resource').filter(e => /\.(woff2?|ttf|otf)(\?|$)/.test(e.name)).map(e => ({ url: e.name, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, duration: e.duration })));
                        // Explicit shaped text probes distinguish Chinese, Latin, prices and weight 900; no product source changes.
                        await p.evaluate(() => { let d = document.createElement('div'); d.id = 'audit-font-probes'; d.style.cssText = 'position:fixed;bottom:0;left:0;z-index:9999;background:white;color:black;font-size:16px'; for (const [id, text, weight] of [['zh', '一智通万机具身智能开发与应用平台 张龘 𠮷', 400], ['en', 'RoboDock SONIC Link user+long@example.test', 400], ['numbers', '¥12,800.50 0123456789', 400], ['heavy', '中 ONE-G 900', 900]]) {
                            let s = document.createElement('span');
                            s.id = 'audit-probe-' + id;
                            s.textContent = text;
                            s.style.fontWeight = weight;
                            d.append(s);
                        } document.body.append(d); });
                        await p.evaluate(() => document.fonts.ready);
                        doc = await client.send('DOM.getDocument');
                        const probes = [];
                        for (const name of ['zh', 'en', 'numbers', 'heavy']) {
                            const { nodeId } = await client.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#audit-probe-' + name });
                            probes.push({ name, ...await client.send('CSS.getPlatformFontsForNode', { nodeId }) });
                        }
                        await p.locator('#audit-font-probes').evaluate(e => e.remove());
                        const overflow = await p.evaluate(() => ({ document: document.documentElement.scrollWidth > innerWidth + 1, body: document.body.scrollWidth, viewport: innerWidth }));
                        if ((width === 1440 && locale === 'zh-CN' && theme === 'light') || (width === 390 && locale === 'en' && theme === 'dark') || (stage === 'before' && width === 390 && locale === 'en'))
                            await p.screenshot({ path: dir + '/' + (route === '/' ? 'home' : route.split('/').filter(Boolean).join('-')) + '-' + width + '-' + theme + '.png' });
                        rows.push({ stage, route, width, locale, theme, rendered, probes, pageFontRequests, fontTimings, requests, overflow, errors });
                        fs.writeFileSync(dir + '/rendered-fonts.json', JSON.stringify(rows, null, 2));
                        console.log(stage, width, locale, theme, route, 'fonts', requests.length, 'errors', errors.length);
                        await p.close();
                    }
                    await c.close();
                }
    }
    finally {
        await b.close();
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
