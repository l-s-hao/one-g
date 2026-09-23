/* eslint-disable @typescript-eslint/no-require-imports -- Firefox WebDriver/BiDi regression. */
// Start geckodriver --port 4444 and ONE-G first. No user browser profile is used.
const WebSocket = require('next/dist/compiled/ws');
const assert = require('node:assert/strict');
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
const driver = process.env.ONE_G_WEBDRIVER || 'http://127.0.0.1:4444';
const production = process.env.ONE_G_TEST_PRODUCTION === '1';
async function request(path, data, method) {
  const response = await fetch(driver + path, {method: method || (data ? 'POST' : 'GET'), headers: {'Content-Type': 'application/json'}, body: data ? JSON.stringify(data) : undefined});
  const result = await response.json();
  assert.ok(response.ok, JSON.stringify(result));
  return result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const session = await request('/session', {capabilities: {alwaysMatch: {browserName: 'firefox', webSocketUrl: true, 'moz:firefoxOptions': {args: ['-headless']}}}});
  const path = '/session/' + session.sessionId;
  const socket = new WebSocket(session.capabilities.webSocketUrl);
  await new Promise(resolve => socket.once('open', resolve));
  const errors = [];
  socket.on('message', bytes => {
    const event = JSON.parse(bytes);
    if (event.method === 'log.entryAdded' && event.params.level === 'error' && /hydrat|didn't match|did not match/i.test(JSON.stringify(event.params))) errors.push(event.params.text);
  });
  await new Promise(resolve => {
    socket.on('message', bytes => {if (JSON.parse(bytes).id === 1) resolve();});
    socket.send(JSON.stringify({id: 1, method: 'session.subscribe', params: {events: ['log.entryAdded']}}));
  });
  const js = (script, args = []) => request(path + '/execute/sync', {script, args});
  const names = {standard: '标准显示', night: '夜间模式', 'eye-comfort': '护眼模式', 'color-vision-safe': '色觉友好'};
  const check = async (expected) => {
    let state;
    for (let attempt = 0; attempt < 100; attempt++) {
      state = await js(`return {mode:document.documentElement.dataset.theme,groups:[...document.querySelectorAll('fieldset[aria-label="显示模式"]')].map(g=>({text:g.querySelector('p').textContent,disabled:g.querySelector('button').disabled,inputs:[...g.querySelectorAll('input')].map(e=>({name:e.getAttribute('aria-label'),checked:e.checked,disabled:e.disabled}))}))}`);
      if (state.mode === expected && state.groups.length && state.groups.every(g => !g.disabled)) break;
      await pause(100);
    }
    assert.equal(state.mode, expected);
    assert.ok(state.groups.length);
    for (const group of state.groups) {
      assert.equal(group.disabled, false);
      assert.equal(group.text, '当前：' + names[expected]);
      assert.equal(await js(`return document.querySelectorAll('fieldset[aria-label="显示模式"] small').length`), 0);
      for (const input of group.inputs) {
        assert.equal(input.checked, input.name === names[expected]);
        assert.equal(input.disabled, false);
      }
    }
  };
  try {
    // Inspect Document response, not the post-hydration Elements tree.
    const html = await (await fetch(base + '/products/')).text();
    const start = html.indexOf('id="header-accessibility"');
    const selector = html.slice(start, html.indexOf('</fieldset>', start));
    assert.equal((selector.match(/disabled=""/g) || []).length, 4);
    assert.equal((selector.match(/autoComplete="off"|autocomplete="off"/g) || []).length, 4);
    await request(path + '/url', {url: base + '/products/'});
    await check('standard', false);
    const cases = [[null, 'standard', 'standard'], [null, 'night', 'night'], [null, 'color-vision-safe', 'color-vision-safe'], [null, 'eye-comfort', 'eye-comfort'], [null, 'caribbean-calcite', 'eye-comfort']];
    if (!production) cases.push(['user-demo', 'eye-comfort', 'eye-comfort'], ['user-demo', 'caribbean-calcite', 'eye-comfort'], ['user-demo-b', 'night', 'night'], ['admin-demo', 'color-vision-safe', 'color-vision-safe']);
    for (const [id, saved, expected] of cases) {
      await js(`const [id,saved]=arguments;if(id)localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:id}));else localStorage.removeItem('one-g-auth-demo');localStorage.setItem(id?'one-g-theme:'+id:'one-g-theme',saved==='caribbean-calcite'?saved:JSON.stringify({version:2,displayMode:saved}));`, [id, saved]);
      await request(path + '/url', {url: base + (id === 'admin-demo' ? '/admin/' : id ? '/account/' : '/products/')});
      await check(expected, !!id);
      // location.reload() exercises Firefox session-history form restoration;
      // WebDriver's refresh command alone did not reliably reproduce the bug.
      for (let repeat = 0; repeat < 2; repeat++) {
        await js('location.reload();');
        await pause(1000);
        await check(expected, !!id);
      }
      await js(`document.querySelector('fieldset[aria-label="显示模式"] button').click()`);
      await check('standard', !!id);
      await js('location.reload();');
      await pause(1000);
      await check('standard', !!id);
      console.log(`PASS Firefox ordinary refresh, DOM, shared controls, reset persisted: ${id || 'anonymous'} / ${saved}`);
    }
    assert.deepEqual(errors, []);
    console.log('PASS original HTML: four disabled + autocomplete=off; no hydration errors');
  } finally {socket.close(); await request(path, undefined, 'DELETE');}
})().catch(error => {console.error(error);process.exitCode = 1;});
