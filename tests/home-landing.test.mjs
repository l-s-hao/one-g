import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const cache=new Map();
function load(file){file=path.resolve(file.endsWith('.ts')?file:file+'.ts');if(cache.has(file))return cache.get(file).exports;const loaded={exports:{}};cache.set(file,loaded);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;new Function('require','module','exports',code)(id=>load(id.startsWith('@/')?'src/'+id.slice(2):path.resolve(path.dirname(file),id)),loaded,loaded.exports);return loaded.exports;}
test('homepage selections retain canonical identities, categories and real solution destinations',()=>{
 const home=load('src/lib/home-content').getHomeContent();const {getProductById}=load('src/lib/products');
 assert.equal(home.dock,getProductById('robotdock'));assert.equal(home.dock.status,'concept');assert.equal(home.dockHref,'/products/robotdock');
 assert.deepEqual(home.products.map(p=>p.product.id),['g1','arm-a1']);for(const item of home.products){assert.equal(item.product,getProductById(item.product.id));assert.ok(item.product.images.length);assert.equal(item.href,'/products/'+item.product.slug);}
 assert.deepEqual(home.categories.map(x=>new URL(x.href,'https://example.test').searchParams.get('category')),['robot','arm','hand','vision',null]);
 assert.equal(home.teleoperation.detailHref,'/solutions/teleoperation');assert.equal(home.demo.id,'wholebody-balance');assert.match(home.demo.boundary,/研究演示/);assert.deepEqual(home.scenes.map(x=>x.href),['/solutions#handling','/solutions#inspection','/solutions#ai']);assert.equal(getProductById('sonic-link'),undefined);
});
test('new homepage mounts no collage or expandable grids and preserves legacy product redirects',()=>{
 const page=fs.readFileSync('src/app/page.tsx','utf8');assert.doesNotMatch(page,/HomeCollageHero|HomePreviewProvider|HomeProductsPreview|HomeSolutionsPreview/);assert.match(page,/LegacyOfferingHash/);assert.match(page,/HomeLanding/);
 const ui=fs.readFileSync('src/components/HomeLanding.tsx','utf8');assert.deepEqual([...ui.matchAll(/data-home-section="([a-z]+)"/g)].map(m=>m[1]),['hero','categories','products','solutions','company']);assert.doesNotMatch(ui,/formatPrice|AddToCart|purchaseHref|autoPlay/);assert.match(ui,/dock\.detail!\.statusNote/);assert.match(ui,/渲染参考/);
});
