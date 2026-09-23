/* eslint-disable @typescript-eslint/no-require-imports -- Browser acceptance checks. */
const {chromium}=require(process.env.ONE_G_PLAYWRIGHT||'playwright-core');const assert=require('node:assert/strict');
const base=process.env.ONE_G_TEST_URL||'http://localhost:3010/one-g';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.ONE_G_BROWSER});const errors=[];try{
 const noJS=await browser.newContext({javaScriptEnabled:false,colorScheme:'dark'});const first=await noJS.newPage();await first.goto(base+'/products/');assert.equal(await first.locator('html').getAttribute('data-theme'),'standard');assert.equal(await first.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(222, 234, 240)');await noJS.close();
 for(const [seed,expected]of [
  [{},'standard'],
  [{'one-g-theme':'caribbean-calcite'},'eye-comfort'],
  [{'one-g-accessibility-theme':'color-vision-safe'},'color-vision-safe'],
  [{'one-g-auth-demo':JSON.stringify({version:1,userId:'user-demo'}),'one-g-theme:user-demo':'caribbean-calcite','one-g-theme':JSON.stringify({version:2,displayMode:'night'})},'night'],
 ]){
  const c=await browser.newContext({colorScheme:'dark'});await c.addInitScript(seed=>{if(sessionStorage.getItem('seeded'))return;sessionStorage.setItem('seeded','1');for(const[k,v]of Object.entries(seed))localStorage.setItem(k,v);},seed);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/hydration|did not match/i.test(m.text()))errors.push(m.text())});await p.goto(base+'/products/');await p.waitForFunction(mode=>document.documentElement.dataset.theme===mode,expected);await p.locator('header').getByRole('button',{name:'显示设置',exact:true}).click();const panel=p.locator('#header-accessibility');assert.ok(await panel.getByRole('switch',{name:'护眼模式',exact:true}).isEnabled());await panel.getByRole('switch',{name:'护眼模式',exact:true}).check();await p.waitForFunction(()=>document.documentElement.dataset.theme==='eye-comfort');
  await panel.getByRole('switch',{name:'夜间模式',exact:true}).check();await p.waitForFunction(()=>document.documentElement.dataset.theme==='night');await panel.getByRole('switch',{name:'色觉友好',exact:true}).check();await panel.getByRole('switch',{name:'色觉友好',exact:true}).focus();await p.keyboard.press('Space');await p.waitForFunction(()=>document.documentElement.dataset.theme==='standard');await p.reload();await p.waitForFunction(()=>document.documentElement.dataset.theme==='standard');
  if(seed['one-g-theme:user-demo'])assert.equal(await p.evaluate(()=>localStorage.getItem('one-g-theme:user-demo')),'caribbean-calcite');await c.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS production: SSR standard under dark OS, anonymous migrations, public modes, public eye mode, keyboard off -> standard persisted, no overwrite of unverified user preference or hydration errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
