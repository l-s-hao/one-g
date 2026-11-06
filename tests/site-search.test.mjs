import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';
const cache=new Map();function load(file){file=path.resolve(file.endsWith('.ts')?file:file+'.ts');if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(name=>load(name.startsWith('@/')?'src/'+name.slice(2):path.resolve(path.dirname(file),name)),mod,mod.exports);return mod.exports;}
const {searchSite,directProductMatch,searchIndex,normalizeSearch,quickSearchItems}=load('src/lib/site-search');
test('public search index is canonical, stable, deduplicated and excludes private/draft destinations',()=>{
 assert.equal(new Set(searchIndex.map(i=>i.id)).size,searchIndex.length);for(const item of searchIndex)assert.match(item.href,/^\/(products|solutions|about)([\/?#]|$)/);assert.deepEqual(quickSearchItems.map(i=>i.id),['product:robotdock','solution:teleoperation','page:/products','page:/about']);assert.ok(searchIndex.find(i=>i.id==='product:robotdock'));assert.equal(searchIndex.some(i=>i.id==='product:sonic-link'),false);
});
test('names, historical alias, supported Chinese aliases and width/space/hyphen normalization agree',()=>{
 for(const q of ['RoboDock','robodock',' RoboDock ','RobotDock','背包','小背包'])assert.equal(directProductMatch(q)?.id,'product:robotdock');assert.equal(normalizeSearch('ＯＮＥ－Ｇ  Ｇ１'),'onegg1');assert.equal(directProductMatch('ONE–G G1')?.id,'product:g1');
});
test('short models and broad category searches never collapse distinct variants',()=>{
 const ids=searchSite('G1','products').map(x=>x.item.id);assert.ok(ids.includes('product:g1')&&ids.includes('product:g1-pro'));assert.equal(directProductMatch('G1'),undefined);assert.equal(directProductMatch('Ｇ１'),undefined);assert.equal(directProductMatch('A1')?.id,'product:arm-a1');assert.equal(directProductMatch('G1 Pro')?.id,'product:g1-pro');assert.equal(directProductMatch('机器人'),undefined);assert.ok(searchSite('机械臂','products').length>=2);assert.equal(searchSite('G2','products').length,0);
});
test('controlled spelling suggestions do not auto navigate, invent results or cross scopes',()=>{
 const typo=searchSite('RoboDoc','products');assert.equal(typo[0].item.id,'product:robotdock');assert.notEqual(typo[0].match,'exact');assert.equal(searchSite('RoboDack','products')[0].match,'approximate');assert.equal(directProductMatch('RoboDoc'),undefined);assert.equal(searchSite('SONIC Link','products').length,0);assert.equal(directProductMatch('SONIC Link',searchSite('SONIC Link')),undefined);assert.equal(searchSite('SONIC Link')[0].item.id,'solution:teleoperation');for(const q of ['','  ','qzxvbnmasdf','<img src=x onerror=alert(1)>'])assert.equal(searchSite(q).length,0);assert.equal(searchSite('a'.repeat(10000)).length,0);
});

const {searchSuggestions,submitSearch}=load('src/lib/site-search');
test('suggestion actions distinguish query, correction and canonical destinations with a six-item budget',()=>{
 const empty=searchSuggestions('  ','all',[]);assert.equal(empty.length,4);assert.ok(empty.every(a=>a.kind==='destination'));assert.equal(searchSuggestions('  ','products',[]).length,0);
 const typed=searchSuggestions('ONE-G','all',searchSite('ONE-G'));assert.ok(typed.length<=6);assert.ok(typed.some(a=>a.kind==='query'&&a.query==='ONE-G'));assert.ok(typed.some(a=>a.kind==='destination'));
 const typo=searchSuggestions('RoboDack','products',searchSite('RoboDack','products'));const correction=typo.find(a=>a.kind==='correction');assert.equal(correction.query,searchSite('RoboDack','products')[0].item.name);assert.equal(submitSearch(correction.query,'products').phase,'results');
 for(const q of ['qzxvbnmasdf','---','<script>'])assert.equal(searchSuggestions(q,'all',searchSite(q)).length,0);
});
test('submitted snapshots keep the original query and every match while failures remain distinct from no results',()=>{
 const query='  ONE-G  ';const result=submitSearch(query,'all');assert.equal(result.phase,'results');assert.equal(result.committedQuery,query);assert.ok(result.matches.length>5);assert.equal(result.matches.length,searchSite(query).length);
 assert.equal(submitSearch('qzxvbnmasdf','products').phase,'empty');const fail=submitSearch('RoboDock','products',()=>{throw new Error('controlled index exception');});assert.deepEqual(fail,{phase:'error',committedQuery:'RoboDock'});assert.equal(submitSearch(fail.committedQuery,'products').phase,'results');assert.equal(submitSearch('SONIC Link','products').matches.length,0);
});
