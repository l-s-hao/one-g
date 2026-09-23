/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');const fs=require('node:fs');
const base=process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g';const artifacts='/tmp/one-display-review';fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER});const errors=[],results=[];
 const context=await browser.newContext({colorScheme:'dark'});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 p.on('console',m=>{if(m.type()==='error'&&/hydration|did not match|server rendered/i.test(m.text()))errors.push(m.text())});
 const expectMode=async(mode,page=p)=>{await page.waitForFunction(mode=>document.documentElement.dataset.theme===mode,mode);assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),['standard','eye-comfort'].includes(mode)?'light':'dark');};
 const names={standard:'标准显示','eye-comfort':'护眼模式',night:'夜间模式','color-vision-safe':'色觉友好'};
 const headerPanel=async()=>{const opener=p.locator('header').getByRole('button',{name:'显示设置',exact:true});if(await opener.getAttribute('aria-expanded')!=='true')await opener.click();return p.locator('#header-accessibility');};
 const choose=async(mode,group)=>{group=group||await headerPanel();if(mode==='standard')await group.getByRole('button',{name:/^恢复标准(?:显示)?$/,exact:true}).click();else await group.getByRole('switch',{name:names[mode],exact:true}).check();await expectMode(mode);};
 const center=()=>p.locator('main').getByRole('group',{name:'显示模式',exact:true});
 const login=async(account='19900000001')=>{await p.goto(base+'/login/');if(account.includes('@'))await p.getByRole('button',{name:'邮箱登录',exact:true}).click();await p.getByLabel(account.includes('@')?'邮箱':'手机号',{exact:true}).fill(account);await p.getByRole('button',{name:'登录 ONE-G（演示）',exact:true}).click();await p.waitForURL(base+(account.startsWith('admin@')?'/admin/':'/account/'));await center().getByRole('switch',{name:'夜间模式',exact:true}).waitFor();};
 const logout=async()=>{await p.getByRole('button',{name:'退出登录',exact:true}).click();await p.waitForURL(url=>url.pathname==='/one-g/'||url.pathname==='/one-g/login/');};
 try{
 await p.goto(base+'/products/');await expectMode('standard');let group=await headerPanel();assert.equal(await group.getByRole('switch').count(),3);assert.equal(await group.getByRole('switch',{checked:true}).count(),0);assert.ok(await group.getByRole('switch',{name:'护眼模式',exact:true}).isEnabled());assert.equal(await group.locator('small').count(),0);await choose('eye-comfort',group);await p.reload();await expectMode('eye-comfort');await p.getByRole('link',{name:'了解公司',exact:true}).first().click();await p.waitForURL('**/about/');await expectMode('eye-comfort');await choose('standard');group=await headerPanel();
 await choose('night',group);await choose('color-vision-safe',group);await group.getByRole('switch',{name:'色觉友好',exact:true}).uncheck();await expectMode('standard');await p.reload();await expectMode('standard');
 results.push('No preferences + OS dark => standard; anonymous night/safe work; anonymous eye survives refresh and navigation; closing safe resets standard and persists');
 await login();await expectMode('standard');group=center();await choose('eye-comfort',group);await choose('color-vision-safe',group);await group.getByRole('switch',{name:'色觉友好',exact:true}).uncheck();await expectMode('standard');await choose('night',group);await choose('eye-comfort',group);await group.getByRole('switch',{name:'护眼模式',exact:true}).uncheck();await expectMode('standard');await p.reload();await expectMode('standard');
 await choose('night',center());const panel=await headerPanel();assert.ok(await panel.getByRole('switch',{name:'夜间模式',exact:true}).isChecked());await choose('standard',panel);assert.equal(await center().getByRole('switch',{checked:true}).count(),0);
 results.push('USER center/header synchronized; eye->safe->off and night->eye->off both standard; no layered restore');
 // Capture all modes on the same real product page, desktop and mobile.
 const palette={};for(const mode of Object.keys(names)){
  await p.goto(base+'/products/');await choose(mode);await p.locator('header').getByRole('button',{name:'关闭显示设置',exact:true}).click();
  palette[mode]=await p.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['--color-primary','--color-secondary','--bg','--surface','--surface-2','--text','--text-on-surface','--text-on-surface-2','--text-muted','--border','--border-strong','--accent','--button-primary-bg','--button-primary-text','--button-secondary-bg','--button-secondary-text','--effect-rgb','--primary-rgb','--surface-ink-rgb','--effect-color','--effect-dim','--logo-shine','--shimmer-bg'].map(k=>[k,s.getPropertyValue(k).trim()]));});
  for(const width of [1440,390]){await p.setViewportSize({width,height:1000});await p.screenshot({path:`${artifacts}/${mode}-${width}.png`,fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 }
 if(fs.existsSync('/tmp/one-palette-before.json')){const old=JSON.parse(fs.readFileSync('/tmp/one-palette-before.json'));assert.deepEqual(palette['eye-comfort'],old['caribbean-calcite']);for(const [key,value]of Object.entries(old['color-vision-safe']))if(key!=='--text-on-surface-2')assert.equal(palette['color-vision-safe'][key],value,key);}
 fs.writeFileSync(`${artifacts}/palette.json`,JSON.stringify(palette,null,2));results.push('Original eye palette exact computed-token match; safe palette retained (missing inset foreground corrected to its existing text token); 4 modes × 2 widths screenshots');
 await p.setViewportSize({width:1440,height:1000});await p.goto(base+'/account/');await choose('eye-comfort',center());await logout();await expectMode('eye-comfort');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('one-g-theme:user-demo')).displayMode),'eye-comfort');await p.reload();await expectMode('eye-comfort');
 await login('19900000002');await expectMode('standard');await choose('night',center());await logout();await expectMode('night');await p.reload();await expectMode('night');
 await login();await expectMode('eye-comfort');await choose('color-vision-safe',center());await logout();await expectMode('color-vision-safe');await p.reload();await expectMode('color-vision-safe');
 results.push('Logout eye => eye preserved without deleting owner preference; night/safe survive logout+refresh; A/B isolation works');
 await login('admin@one-g.com');await expectMode('standard');await choose('eye-comfort',center());await p.getByLabel('显示设置',{exact:true}).click();const adminMenu=p.locator('details');assert.ok(await adminMenu.getByRole('switch',{name:'护眼模式',exact:true}).isChecked());await choose('night',adminMenu);assert.ok(await center().getByRole('switch',{name:'夜间模式',exact:true}).isChecked());await p.screenshot({path:`${artifacts}/admin-night.png`,fullPage:true});await logout();await expectMode('night');
 await login();await expectMode('color-vision-safe');await choose('standard',center());await p.screenshot({path:`${artifacts}/account-standard.png`,fullPage:true});
 for(const route of ['/','/products/robotdock/','/products/robotdock/specs/','/buy/robotdock/','/solutions/','/about/','/deep-customization/','/login/','/cart/','/order-success/']){await p.goto(base+route);await expectMode('standard');await choose('night');assert.equal(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(31, 34, 38)');await choose('standard');}
 await p.goto(base+'/about/');await choose('night');await p.locator('header').getByRole('button',{name:'关闭显示设置',exact:true}).click();await p.screenshot({path:`${artifacts}/about-night.png`});
 await p.goto(base+'/login/');await choose('standard');await p.locator('header').getByRole('button',{name:'关闭显示设置',exact:true}).click();await p.screenshot({path:`${artifacts}/login-standard.png`});
 await p.setViewportSize({width:390,height:844});await headerPanel();await p.screenshot({path:`${artifacts}/mobile-settings.png`});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 results.push('ADMIN center/menu synchronized; all public, login, cart/order pages follow global mode; desktop/mobile settings screenshots');
 // Fresh contexts exercise real old storage, after AuthProvider is ready.
 for(const [seed,expected] of [
  [{'one-g-theme:user-demo':'caribbean-calcite'},'eye-comfort'],
  [{'one-g-theme:user-demo':'night','one-g-accessibility-theme:user-demo':'color-vision-safe'},'color-vision-safe'],
  [{'one-g-theme:user-demo':'monochrome'},'standard'],
  [{'one-g-theme:user-demo':JSON.stringify({version:2,displayMode:'standard'}),'one-g-accessibility-theme:user-demo':'color-vision-safe'},'standard'],
 ]){
  const c=await browser.newContext();await c.addInitScript(seed=>{if(sessionStorage.getItem('seeded'))return;sessionStorage.setItem('seeded','1');localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'}));for(const[k,v]of Object.entries(seed))localStorage.setItem(k,v);localStorage.setItem('one-g-cart:user-demo','keep-cart');localStorage.setItem('one-g-orders:user-demo','keep-orders');},seed);const q=await c.newPage();q.on('pageerror',e=>errors.push(e.message));await q.goto(base+'/account/');await q.locator('main').getByRole('switch',{name:'夜间模式',exact:true}).waitFor();await expectMode(expected,q);assert.equal(await q.evaluate(()=>localStorage.getItem('one-g-cart:user-demo')),'keep-cart');assert.equal(await q.evaluate(()=>localStorage.getItem('one-g-orders:user-demo')),'keep-orders');await q.locator('main').getByRole('button',{name:/^恢复标准(?:显示)?$/,exact:true}).click();await q.reload();await expectMode('standard',q);assert.equal(await q.evaluate(()=>JSON.parse(localStorage.getItem('one-g-theme:user-demo')).version),2);await c.close();
 }
 results.push('Legacy authenticated eye/night/overlay/retired IDs migrate once to v2; manual standard survives reload; cart/orders untouched');
 assert.deepEqual(errors,[]);fs.writeFileSync(`${artifacts}/results.json`,JSON.stringify({results,errors},null,2));for(const r of results)console.log('PASS',r);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
