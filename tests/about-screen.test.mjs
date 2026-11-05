import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync('src/lib/about-chapter-input.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};new Function('exports',source)(exports);
const {normalizeChapter,contentCanScroll,boundaryIntent}=exports;
test('content reads to a real fractional boundary before chapter intent',()=>{
 assert.ok(contentCanScroll(100,1000,600,80));assert.equal(contentCanScroll(399.2,1000,600,80),false);
 assert.equal(contentCanScroll(1.4,1000,600,-80),false);assert.ok(contentCanScroll(40,1000,600,-80));
 assert.equal(contentCanScroll(0,200,600,80),false);
});
test('one finite gesture cannot cascade through chapter transitions',()=>{
 const g={last:0,direction:0,amount:0,used:false};
 assert.equal(boundaryIntent(g,30,1000),false);assert.equal(boundaryIntent(g,40,1040),true);g.used=true;
 for(let t=1080;t<3000;t+=40)assert.equal(boundaryIntent(g,80,t),false);
 assert.equal(boundaryIntent(g,80,3400),true);
 g.used=true;assert.equal(boundaryIntent(g,-80,3440),true);
});
test('unwrapped wheel indices preserve both cyclic seams',()=>{
 assert.equal(normalizeChapter(5,5),0);assert.equal(normalizeChapter(-1,5),4);assert.equal(normalizeChapter(11,5),1);
});
