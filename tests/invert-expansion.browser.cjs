/* eslint-disable @typescript-eslint/no-require-imports -- Opt-in local browser acceptance; no new dependency. */
// Requires production static preview plus a separate Mock-Auth dev preview.
const { chromium } = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const fs = require('fs');
const dir = process.env.ONE_G_SCREENSHOTS || require('node:path').join(require('node:os').tmpdir(), 'one-g-invert-expansion');
fs.mkdirSync(dir, { recursive: true });
const expected = { '/': 2, '/products/': 0, '/products/arm-a1/': 1, '/products/robotdock/': 4, '/products/robotdock/specs/': 4, '/buy/robotdock/': 2, '/solutions/': 1, '/solutions/teleoperation/': 2, '/about/': 1, '/deep-customization/': 1, '/login/': 1, '/account/': 3, '/admin/': 2, '/cart/': 2, '/checkout/': 1, '/order-success/': 1 };
const routes = ['/', '/products/', '/products/arm-a1/', '/products/robotdock/', '/products/robotdock/specs/', '/buy/robotdock/', '/solutions/', '/solutions/teleoperation/', '/about/', '/deep-customization/', '/login/', '/account/', '/admin/', '/cart/', '/checkout/', '/order-success/'];
(async () => { const b = await chromium.launch({ headless: true, executablePath: process.env.ONE_G_BROWSER }); const results = []; try {
    for (const width of [1440, 390])
        for (const theme of ['light', 'dark'])
            for (const locale of ['zh-CN', 'en']) {
                const c = await b.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390, isMobile: width === 390 });
                await c.addInitScript(({ theme, locale }) => { localStorage.setItem('one-g-appearance-v1', theme); localStorage.setItem('one-g-locale', locale); if (!location.pathname.includes('/login'))
                    localStorage.setItem('one-g-auth-demo', JSON.stringify({ version: 1, userId: location.pathname.includes('/admin') ? 'admin-demo' : 'user-demo' })); }, { theme, locale });
                await c.route('**/*', r => (r.request().url().includes('_rsc=') || r.request().headers()['next-router-prefetch']) ? r.abort() : r.continue());
                for (const route of routes) {
                    if (results.some(r => r.route === route && r.width === width && r.theme === theme && r.locale === locale))
                        continue;
                    const p = await c.newPage();
                    const errors = [];
                    p.on('pageerror', e => errors.push(e.stack || String(e)));
                    let loaded = false;
                    for (let attempt = 0; attempt < 3 && !loaded; attempt++) {
                        try {
                            await p.goto((['/account/', '/admin/', '/cart/', '/checkout/'].includes(route) ? (process.env.ONE_G_MOCK_URL || 'http://localhost:3000/one-g') : (process.env.ONE_G_TEST_URL || 'http://127.0.0.1:3001/one-g')) + route);
                            await p.locator('main').waitFor();
                            await p.waitForFunction(({ theme, locale }) => document.documentElement.classList.contains(theme) && document.documentElement.lang === locale, { theme, locale }, { timeout: 7000 });
                            loaded = true;
                        }
                        catch (e) {
                            if (attempt === 2)
                                throw e;
                            console.log('retry', route, String(e).slice(0, 90));
                            errors.length = 0;
                        }
                    }
                    await p.evaluate(() => document.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); }, true));
                    if (['/account/', '/admin/'].includes(route))
                        await p.locator('main [data-invert-variant=secondary]').first().waitFor();
                    await p.waitForTimeout(300);
                    const actions = p.locator('main [data-button-effect="invert"]');
                    if (expected[route])
                        await actions.nth(expected[route] - 1).waitFor();
                    let count = await actions.count();
                    const checks = [];
                    for (let i = 0; i < count; i++) {
                        const a = actions.nth(i);
                        if (!await a.isVisible())
                            continue;
                        await a.scrollIntoViewIfNeeded();
                        await p.mouse.move(0, 0);
                        await p.waitForTimeout(230);
                        const read = () => a.evaluate(e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(), after = getComputedStyle(e, '::after'); return { text: e.textContent.trim(), variant: e.dataset.invertVariant, background: s.backgroundColor, color: s.color, border: after.borderColor, width: r.width, height: r.height, transition: s.transitionProperty, duration: s.transitionDuration, transform: s.transform, filter: s.filter, underline: s.textDecorationLine, disabled: e.matches(':disabled,[aria-disabled="true"],[aria-busy="true"]'), outline: s.outlineStyle }; });
                        const normal = await read();
                        await a.hover({ force: true });
                        await p.waitForTimeout(240);
                        const hover = await read();
                        const changed = normal.background !== hover.background;
                        const failures = [];
                        if (normal.width !== hover.width || normal.height !== hover.height)
                            failures.push('hover geometry');
                        if (normal.transform !== 'none' || hover.transform !== 'none' || hover.filter !== 'none')
                            failures.push('transform/filter');
                        if (hover.underline !== 'none')
                            failures.push('underline');
                        if (!normal.disabled && changed !== (width === 1440))
                            failures.push('hover state');
                        if (normal.disabled && changed)
                            failures.push('disabled hover');
                        if (normal.transition !== 'background-color, color, border-color' || normal.duration !== '0.2s')
                            failures.push('transition');
                        let focus = null, active = null;
                        if (!normal.disabled) {
                            await p.keyboard.press('Tab');
                            await a.focus();
                            focus = await a.evaluate(e => ({ visible: e.matches(':focus-visible'), style: getComputedStyle(e).outlineStyle, width: getComputedStyle(e).outlineWidth }));
                            if (!focus.visible || focus.style === 'none')
                                failures.push('keyboard focus');
                            if (width === 1440) {
                                await a.hover();
                                await p.mouse.down();
                                active = await read();
                                await p.mouse.move(0, 0);
                                await p.mouse.up();
                                if (active.width !== normal.width || active.height !== normal.height)
                                    failures.push('active geometry');
                            }
                        }
                        await p.emulateMedia({ reducedMotion: 'reduce' });
                        const reduced = await read();
                        if (reduced.duration !== '0s')
                            failures.push('reduced motion');
                        await p.emulateMedia({ reducedMotion: 'no-preference' });
                        checks.push({ normal, hover, focus, active, reducedDuration: reduced.duration, failures });
                    }
                    const invalid = await p.locator('a button,button a,.site-header [data-button-effect="invert"],[role="tab"][data-button-effect="invert"],[data-specular-host],.specular-edge').count();
                    if ((width === 1440 && theme === 'light' && locale === 'zh-CN') || (width === 390 && theme === 'dark' && locale === 'en')) {
                        await p.evaluate(() => scrollTo(0, 0));
                        await p.screenshot({ path: dir + '/' + (route === '/' ? 'home' : route.split('/').filter(Boolean).join('-')) + '-' + width + '-' + theme + '.png' });
                    }
                    results.push({ route, width, theme, locale, url: p.url(), actions: checks, invalid, errors });
                    fs.writeFileSync(dir + '/matrix.json', JSON.stringify(results, null, 2));
                    console.log(width, theme, locale, route, 'actions', checks.length, 'failures', checks.reduce((n, x) => n + x.failures.length, 0) + invalid + errors.length);
                    await p.close();
                }
                await c.close();
            }
    const failures = results.flatMap(r => r.actions.flatMap(a => a.failures.map(f => ({ route: r.route, width: r.width, theme: r.theme, locale: r.locale, text: a.normal.text, f }))));
    fs.writeFileSync(dir + '/matrix-summary.json', JSON.stringify({ routes: routes.length, scenarios: results.length, actions: results.reduce((n, r) => n + r.actions.length, 0), failures, invalid: results.filter(r => r.invalid || r.errors.length) }, null, 2));
    if (failures.length || results.some(r => r.invalid || r.errors.length || r.actions.length !== expected[r.route]))
        process.exitCode = 1;
}
finally {
    await b.close();
} })().catch(e => { console.error(e); process.exitCode = 1; });
