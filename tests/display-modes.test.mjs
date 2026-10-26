import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const cache=new Map();function load(file){file=path.resolve(file.endsWith('.ts')?file:file+'.ts');if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(id=>load(id.startsWith('@/')?'src/'+id.slice(2):path.resolve(path.dirname(file),id)),mod,mod.exports);return mod.exports;}
test('Standard light/dark palettes have one provider and no retired display modes',()=>{
 const css=fs.readFileSync('src/app/colors.css','utf8');
 for(const token of ['--bg:#F7F4EE','--color-primary:#2B2F36','--accent:#3A73D9','--text:#17191D','--surface:#FFFFFF','--surface-2:#E9E5DE'])assert.ok(css.includes(token),token);
 assert.doesNotMatch(css,/data-theme|eye-comfort|color-vision-safe|night/);
 const layout=fs.readFileSync('src/app/layout.tsx','utf8');assert.equal((layout.match(/<ThemeProvider>/g)||[]).length,1);
 const provider=fs.readFileSync('src/components/ThemeProvider.tsx','utf8');
 assert.match(provider,/themes=\{\["light", "dark"\]\}/);
 assert.match(provider,/storageKey=\{themeStorageKey\}/);
 assert.match(fs.readFileSync("src/lib/theme-preference.ts","utf8"),/one-g-appearance-v1/);
 assert.match(css,/html\.dark/);
 assert.doesNotMatch(provider,/eye-comfort|color-vision-safe/);
});
test('Catalog uses unique canonical IDs and true categories, retaining unpriced offering restrictions',()=>{
 const api=load('src/lib/products');const all=api.getCatalogProducts();
 assert.equal(all.length,9);assert.equal(new Set(all.map(p=>p.id)).size,all.length);
 for(const category of ['robot','arm','hand','vision'])assert.deepEqual(api.getCatalogProducts(category),all.filter(p=>p.category===category));
 for(const id of ['robotdock']){const product=all.find(p=>p.id===id);assert.equal(product,api.getProductById(id));assert.equal(product.price,undefined);assert.notEqual(product.status,'active');}
});
