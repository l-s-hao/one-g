import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const cache=new Map();function load(file){file=path.resolve(file.endsWith('.ts')?file:file+'.ts');if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(id=>load(id.startsWith('@/')?'src/'+id.slice(2):path.resolve(path.dirname(file),id)),mod,mod.exports);return mod.exports;}
const values=new Map();global.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
const data=load('src/data/themes'),resolver=load('src/lib/theme-resolver'),prefs=load('src/lib/user-preferences');
test('Four modes; every active switch off resets standard, inactive off does nothing, no layered restore',()=>{
 assert.deepEqual(data.displayModes.map(m=>m.id),['standard','eye-comfort','night','color-vision-safe']);
 for(const current of data.displayModes.map(m=>m.id))for(const special of ['eye-comfort','night','color-vision-safe']){
  assert.equal(resolver.toggleDisplayMode(current,special,false),current===special?'standard':current);
  assert.equal(resolver.toggleDisplayMode(current,special,true),special);
 }
 let mode=resolver.toggleDisplayMode('eye-comfort','color-vision-safe',true);mode=resolver.toggleDisplayMode(mode,'color-vision-safe',false);assert.equal(mode,'standard');
 mode=resolver.toggleDisplayMode('night','eye-comfort',true);mode=resolver.toggleDisplayMode(mode,'eye-comfort',false);assert.equal(mode,'standard');
 assert.equal(resolver.toggleDisplayMode('night','eye-comfort',true),'eye-comfort');assert.equal(resolver.resolveDisplayMode('eye-comfort'),'eye-comfort');
 for(const mode of ['night','color-vision-safe'])assert.equal(resolver.resolveDisplayMode(mode),mode);
});
test('Actual legacy keys migrate once; visible overlay wins, logout does not erase owner preference',()=>{
 for(const [raw,expected] of [['caribbean-calcite','eye-comfort'],['night','night'],['color-vision-safe','color-vision-safe'],['monochrome','standard'],['dark','standard'],['unknown','standard'],[null,'standard']]){
  values.clear();if(raw!==null)values.set('one-g-theme:user-demo',raw);values.set('one-g-cart:user-demo','keep');values.set('one-g-auth-demo','keep');
  assert.equal(prefs.loadDisplayPreference('user-demo'),expected);assert.deepEqual(JSON.parse(values.get('one-g-theme:user-demo')),{version:2,displayMode:expected});assert.equal(values.get('one-g-cart:user-demo'),'keep');assert.equal(values.get('one-g-auth-demo'),'keep');
 }
 values.clear();values.set('one-g-theme:user-demo','caribbean-calcite');values.set('one-g-accessibility-theme:user-demo','color-vision-safe');assert.equal(prefs.loadDisplayPreference('user-demo'),'color-vision-safe');
 prefs.saveDisplayPreference('standard','user-demo');assert.equal(prefs.loadDisplayPreference('user-demo'),'standard');assert.equal(values.get('one-g-accessibility-theme:user-demo'),'color-vision-safe');
 assert.equal(prefs.loadDisplayPreference('user-demo-b'),'standard');
 prefs.saveDisplayPreference('eye-comfort','user-demo');prefs.saveDisplayPreference('standard');assert.equal(prefs.loadDisplayPreference('user-demo'),'eye-comfort');assert.equal(prefs.loadDisplayPreference(),'standard');
});
test('Anonymous migration restores eye comfort; legacy overlay/null precedence and corrupt v2 are safe',()=>{
 for(const raw of ['caribbean-calcite',JSON.stringify({version:2,displayMode:'eye-comfort'}),'unknown']){values.clear();values.set('one-g-theme',raw);assert.equal(prefs.loadDisplayPreference(),raw==='unknown'?'standard':'eye-comfort');}
 values.clear();values.set('one-g-home-accessibility','color-vision-safe');assert.equal(prefs.loadDisplayPreference(),'color-vision-safe');prefs.saveDisplayPreference('standard');assert.equal(prefs.loadDisplayPreference(),'standard');
 values.clear();values.set('one-g-home-accessibility','color-vision-safe');values.set('one-g-accessibility-theme','null');assert.equal(prefs.loadDisplayPreference(),'standard');
 values.clear();values.set('one-g-theme','night');assert.equal(prefs.loadDisplayPreference(),'night');
 values.set('one-g-theme',JSON.stringify({version:2,displayMode:'invalid'}));values.set('one-g-accessibility-theme','color-vision-safe');assert.equal(prefs.loadDisplayPreference(),'standard');
});
const lum=hex=>{const rgb=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
test('New palette text/button/field boundary contrast and retained eye block',()=>{
 const css=fs.readFileSync('src/app/themes.css','utf8');
 for(const [fg,bg] of [['#0C2B4E','#DEEAF0'],['#3E5C73','#DEEAF0'],['#0C2B4E','#2FBBD2'],['#E6E8E5','#1F2226'],['#919AA4','#2A2F35'],['#1F2226','#E6E8E5']])assert.ok(contrast(fg,bg)>=4.5,`${fg}/${bg}: ${contrast(fg,bg)}`);
 for(const [border,bg] of [['#5B7C90','#DEEAF0'],['#76808A','#2A2F35']])assert.ok(contrast(border,bg)>=3,`${border}/${bg}: ${contrast(border,bg)}`);
 assert.ok(css.includes('--bg:#F0E6D2; --surface:#F6EEDC; --surface-2:#E4D5B8;'));assert.ok(css.includes('html[data-theme="color-vision-safe"] .color-vision-only {display:inline;}'));
});
