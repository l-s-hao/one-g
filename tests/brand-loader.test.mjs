import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
const file='src/components/BrandLoader.tsx';
const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
new Function('require','module','exports',code)(id=>{
 if(id==='react/jsx-runtime')return jsxRuntime;
 if(id==='@/i18n/Elements')return {LSpan:props=>React.createElement('span',props)};
 if(id.endsWith('.css'))return {default:new Proxy({},{get:(_,key)=>key})};
 throw Error(id);
},mod,mod.exports);
const Loader=mod.exports.default;
test('SSR is deterministic, inactive loaders vanish, marks are decorative and status is singular',()=>{
 const active=renderToStaticMarkup(React.createElement(Loader,{label:'Loading'}));
 assert.equal(active,renderToStaticMarkup(React.createElement(Loader,{label:'Loading'})));
 assert.equal((active.match(/role="status"/g)||[]).length,1);
 assert.equal((active.match(/class="mark"/g)||[]).length,3);
 assert.equal((active.match(/class="shadow"/g)||[]).length,3);
 assert.ok(active.includes('aria-hidden="true"'));
 assert.equal(renderToStaticMarkup(React.createElement(Loader,{active:false})), '');
});
test('Compact variant keeps one exact static mark and no duplicate announcement',()=>{
 const compact=renderToStaticMarkup(React.createElement(Loader,{size:'compact',announce:false}));
 assert.equal((compact.match(/class="mark"/g)||[]).length,1);
 assert.equal(compact.includes('role="status"'),false);
 assert.equal(compact.includes('shadow'),false);
});
