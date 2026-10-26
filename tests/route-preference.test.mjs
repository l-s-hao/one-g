import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const cache = new Map();
function load(file) {
  file = path.resolve(file.endsWith('.ts') ? file : file + '.ts');
  if (cache.has(file)) return cache.get(file).exports;
  const mod = {exports:{}}; cache.set(file,mod);
  new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(id=>load(id.startsWith('@/')?'src/'+id.slice(2):path.resolve(path.dirname(file),id)),mod,mod.exports);
  return mod.exports;
}
const {safeReturnTo,requiredRole} = load('src/lib/auth-routing');
const {canonicalConfigurationHref} = load('src/lib/configuration-routing');
const {normalizeStoredTheme,themeMigrationScript,themeStorageKey} = load('src/lib/theme-preference');
test('Prefixed return paths share role checks, reject login loops and duplicate prefixes',()=>{
  for(const value of ['/one-g/admin','/one-g/%61dmin','/one-g/login','/one-g/register','/one-g/admin/login','/one-g/one-g/admin','/one-g/%2fadmin'])assert.equal(safeReturnTo(value,'USER'),'/account');
  assert.equal(requiredRole('/one-g/admin'),'ADMIN');
  assert.equal(requiredRole('/one-g/%61dmin'),'ADMIN');
  assert.equal(requiredRole('/%61dmin'),'ADMIN');
  assert.equal(requiredRole('/one-g/cart'),'USER');
  assert.equal(safeReturnTo('/one-g/cart?view=summary#total','USER'),'/cart?view=summary#total');
  assert.equal(safeReturnTo('/one-g/admin','ADMIN'),'/admin');
  for(const value of ['https://example.test/cart','//example.test/admin','/%2fadmin','/%255cadmin','/one-g/%5cadmin'])assert.equal(safeReturnTo(value,'USER'),'/account');
  assert.equal(safeReturnTo('/one-g/cart','ADMIN'),'/admin');
  assert.equal(canonicalConfigurationHref('/one-g/configure/sonic-link'),'/solutions/teleoperation');
  assert.equal(canonicalConfigurationHref('/one-g/configure/robotdock'),'/buy/robotdock');
  assert.equal(canonicalConfigurationHref('/one-g/%63onfigure/robotdock'),'/buy/robotdock');
  assert.equal(canonicalConfigurationHref('https://example.test/configure/robotdock'),'https://example.test/configure/robotdock');
});
test('Theme migration is bounded, repeatable and agrees with the runtime normalizer',()=>{
  for(const value of [null,'light','dark','standard','eye-comfort','night','color-vision-safe','system','invalid']){
    const store=new Map([['one-g-cart:a','keep-cart'],['one-g-auth-demo','keep-session'],['one-g-locale','keep-locale']]);
    if(value!==null)store.set(themeStorageKey,value);
    let writes=0;const localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>{writes++;store.set(key,value);}};
    vm.runInNewContext(themeMigrationScript,{localStorage});
    assert.equal(store.get(themeStorageKey),value===null?undefined:normalizeStoredTheme(value));
    const firstWrites=writes;vm.runInNewContext(themeMigrationScript,{localStorage});assert.equal(writes,firstWrites);
    assert.equal(store.get('one-g-cart:a'),'keep-cart');assert.equal(store.get('one-g-auth-demo'),'keep-session');assert.equal(store.get('one-g-locale'),'keep-locale');
  }
  assert.doesNotThrow(()=>vm.runInNewContext(themeMigrationScript,{get localStorage(){throw Error('storage unavailable');}}));
});
