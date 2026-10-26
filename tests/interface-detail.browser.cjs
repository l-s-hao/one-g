/* eslint-disable @typescript-eslint/no-require-imports -- External browser audit; no dependency added. */
const {chromium} = require(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const assert = require('node:assert/strict'), fs = require('node:fs');
const stage = process.env.ONE_G_DETAIL_STAGE || 'after', out = process.env.ONE_G_DETAIL_OUT || '/tmp/one-g-detail';
const base = process.env.ONE_G_TEST_URL || 'http://localhost:3000/one-g';
fs.mkdirSync(`${out}/${stage}`, {recursive:true});
const routes = {
  products: '/products/', solutions: '/solutions/', product: '/products/robotdock/',
  teleoperation: '/solutions/teleoperation/', about: '/about/', deep: '/deep-customization/',
  login: '/login/', register: '/register/', contact: '/deep-customization/?openContact=deep',
};
function measure() {
  const rect = e => {const r=e.getBoundingClientRect(); return {width:r.width,height:r.height};};
  const headings = [...document.querySelectorAll('main h1, main h2, main h3, #contact-dialog-title')].filter(e=>e.getClientRects().length && !e.classList.contains('sr-only')).map(e=>{
    const s=getComputedStyle(e), lines=new Map(), walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
    let node;
    while ((node=walker.nextNode())) for(let i=0;i<node.length;i++) {
      const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect();
      if(!r.height || !node.textContent[i].trim())continue;
      const key=Math.round(r.y*10)/10, line=lines.get(key)||{text:'',left:r.left,right:r.right};
      line.text+=node.textContent[i];line.left=Math.min(line.left,r.left);line.right=Math.max(line.right,r.right);lines.set(key,line);
    }
    const brands=[]; const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
    while ((node=w.nextNode())) for(const brand of ['ONE-G','RoboDock','SONIC Link']) {
      const index=node.textContent.indexOf(brand);if(index<0)continue;
      const r=document.createRange();r.setStart(node,index);r.setEnd(node,index+brand.length);
      brands.push({brand,lines:[...r.getClientRects()].filter(x=>x.width>0).length});
    }
    return {text:e.textContent,tag:e.tagName,...rect(e),font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight,spacing:s.letterSpacing,color:s.color,margin:s.margin,padding:s.padding,wrap:s.textWrap,wordBreak:s.wordBreak,lines:[...lines.values()].map(x=>({text:x.text,width:x.right-x.left})),brands,overflow:e.scrollWidth>e.clientWidth+1};
  });
  const cards=[...document.querySelectorAll('#product-catalog > [data-card-hover-host]:not([data-filter-hidden]), main [data-card-hover-host]')].filter((e,i,a)=>a.indexOf(e)===i && e.getClientRects().length).map(e=>{
    const surface=e.querySelector(':scope > [data-card-hover-surface]')||e, s=getComputedStyle(surface);
    return {text:surface.textContent,...rect(e),surface:rect(surface),padding:s.padding,border:s.borderWidth,borderColor:s.borderColor,radius:s.borderRadius,shadow:s.boxShadow,bg:s.backgroundColor,images:[...surface.querySelectorAll('img')].map(rect)};
  });
  return {headings,cards,overflow:document.documentElement.scrollWidth>innerWidth+1, viewport:innerWidth,theme:document.documentElement.className};
}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.ONE_G_BROWSER,args:['--no-sandbox','--enable-unsafe-swiftshader']});const rows=[];
  const previous=stage==='before'?null:JSON.parse(fs.readFileSync(`${out}/${stage==='titles'?'before':'titles'}/results.json`));
  try {
    for(const width of [390,768,1440,1920]) for(const locale of ['zh-CN','en']) for(const theme of ['light','dark']) {
      const c=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
      await c.addInitScript(({locale,theme})=>{localStorage.setItem('one-g-locale',locale);localStorage.setItem('one-g-appearance-v1',theme);localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:'user-demo'}));},{locale,theme});
      const p=await c.newPage();p.setDefaultTimeout(15000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
      for(const [name,path]of Object.entries(routes)) {
        try {await p.goto(base+path, {waitUntil:'domcontentloaded'});} catch(error) {if(!String(error).includes('ERR_ABORTED'))throw error; await p.goto(base+path, {waitUntil:'domcontentloaded'});}
        await p.waitForFunction(l=>document.documentElement.lang===l,locale);
        await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(100);
        if(name==='contact')await p.locator('dialog[open]').waitFor();
        const data=await p.evaluate(measure), row={width,locale,theme,name,...data};
        assert.equal(data.overflow,false,`${stage}/${width}/${locale}/${theme}/${name}: horizontal overflow`);
        if(previous) {
          const old=previous.find(r=>r.width===width&&r.locale===locale&&r.theme===theme&&r.name===name);
          old.headings=old.headings.filter(h=>h.width>1 || h.height>1);
          assert.equal(data.headings.length,old.headings.length);
          for(let i=0;i<data.headings.length;i++){
            const h=data.headings[i], before=old.headings[i];
            for(const key of ['text','font','size','weight','lineHeight','spacing','color','margin','padding'])assert.equal(h[key],before[key],`${name} heading ${i} ${key}`);
            assert.ok(Math.abs(h.width-before.width)<.1,`${name} heading ${i} width changed`);
            assert.equal(h.overflow,false,`${name} heading overflow: ${h.text}`);
            assert.notEqual(h.wordBreak,'break-all');
            for(const brand of h.brands) assert.ok(brand.lines<=1 || before.brands.some(b=>b.brand===brand.brand&&b.lines>=brand.lines),`brand split: ${h.text}`);
          }
          assert.equal(data.cards.length,old.cards.length);
          for(let i=0;i<data.cards.length;i++)for(const key of ['width','height','surface','padding','border','radius','images'])assert.deepEqual(data.cards[i][key],old.cards[i][key],`${name} card ${i} ${key}`);
        }
        // Before/after pairs at identical viewport, language, theme, scroll and reduced-motion state.
        if((width===390&&locale==='en') || (width===1440&&locale==='zh-CN')) {
          const target=name==='contact'?p.locator('dialog[open]'):p.locator('main');
          await p.screenshot({path:`${out}/${stage}/${name}-${width}-${locale}-${theme}.png`});
          if(['products','solutions','deep','product'].includes(name)) {
            const card=p.locator('main [data-card-hover-host]').first();
            if(await card.count()){await card.scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${stage}/${name}-cards-${width}-${locale}-${theme}.png`});}
          }
          if(name==='contact')assert.ok(await target.isVisible());
        }
        rows.push(row);fs.writeFileSync(`${out}/${stage}/results.json`,JSON.stringify(rows,null,2));
      }
      assert.deepEqual(errors,[]);await c.close();console.log('PASS',stage,width,locale,theme);
    }
  }finally{await browser.close();}
  console.log('PASS',stage,rows.length,'page combinations');
})().catch(e=>{console.error(e);process.exitCode=1});
