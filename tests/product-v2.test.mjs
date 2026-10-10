import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import crypto from 'node:crypto';
const cache = new Map();
function load(file) {
 file=path.resolve(file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(file))return cache.get(file).exports;
 const compiledModule={exports:{}};cache.set(file,compiledModule);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',code)(id=>load(id.startsWith('@/')?'src/'+id.slice(2):path.resolve(path.dirname(file),id)),compiledModule,compiledModule.exports);return compiledModule.exports;
}
test('Offering references preserve canonical packages and ordinary product order',()=>{
 const products=load('src/lib/products').getProducts();const isOffering=load('src/data/configurable-offerings').isConfigurableOffering;
 assert.deepEqual(products.filter(p=>!isOffering(p.id)).map(p=>p.id),['g1','g1-pro','arm-a1','arm-a2','hand-d1','vision-v1','rgbd','lidar-kit']);
 const offerings=load('src/lib/configurable-offerings').getOfferingPackages();assert.deepEqual(offerings.map(o=>o.packages.length),[4]);
 for(const o of offerings){assert.equal(o.packages,o.product.detail.bundles);assert.equal(o.product.price,undefined);assert.notEqual(o.product.status,'active');}
 for(const [file,hash] of Object.entries(JSON.parse(fs.readFileSync('tests/product-v2-baseline.json','utf8'))))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file);
});
