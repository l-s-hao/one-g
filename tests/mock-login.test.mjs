import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
function loader() {
 const cache=new Map();
 function load(file) {
  file=path.resolve(file.endsWith('.ts')?file:file+'.ts');if(cache.has(file))return cache.get(file).exports;
  const mod={exports:{}};cache.set(file,mod);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',code)(id=>load(id.startsWith('@/')?'src/'+id.slice(2):path.resolve(path.dirname(file),id)),mod,mod.exports);return mod.exports;
 }return load;
}
const values=new Map();global.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
test('Explicit development Mock adapter: exact fixture identities retain IDs and roles',async()=>{
 process.env.NODE_ENV='development';process.env.NEXT_PUBLIC_ONE_G_MOCK_AUTH='1';const load=loader(),adapter=load('src/lib/auth/mock-login');
 for(const [channel,recipient,id,role] of [['phone','19900000001','user-demo','USER'],['phone','19900000002','user-demo-b','USER'],['email','demo-a@example.test','user-demo','USER'],['email','demo-b@example.test','user-demo-b','USER'],['email','admin@one-g.com','admin-demo','ADMIN']]) {
  assert.equal(adapter.canUseMockShortcut(channel,recipient),true);const result=await adapter.authenticateMockShortcut(channel,recipient);assert.equal(result.ok,true);assert.equal(result.user.id,id);assert.equal(result.user.role,role);
 }
 for(const recipient of ['', 'someone@one-g.com','superadmin@one-g.com','admin@evil.test','role=ADMIN']){assert.equal(adapter.canUseMockShortcut('email',recipient),false);assert.equal((await adapter.authenticateMockShortcut('email',recipient)).ok,false);}
 assert.equal((await adapter.authenticateMockShortcut('phone','19900000003')).ok,false);
 const abort=new AbortController();abort.abort();await assert.rejects(adapter.authenticateMockShortcut('phone','19900000001',abort.signal),{name:'AbortError'});
 const routes=load('src/lib/auth-routing');assert.equal(routes.safeReturnTo(null,'ADMIN'),'/admin');assert.equal(routes.safeReturnTo('/account','ADMIN'),'/admin');assert.equal(routes.safeReturnTo('/admin','USER'),'/account');assert.equal(routes.loginDestination('/admin','ADMIN'),'/login?returnTo=%2Fadmin');
});
test('Shortcut requires both development and explicit flag, plus selected Mock adapter',async()=>{
 for(const [env,flag] of [['production','1'],['production','0'],['development','0'],['test','1']]){
  process.env.NODE_ENV=env;process.env.NEXT_PUBLIC_ONE_G_MOCK_AUTH=flag;const load=loader(),adapter=load('src/lib/auth/mock-login');assert.equal(adapter.mockShortcutEnabled,false);
  assert.equal((await adapter.authenticateMockShortcut('email','admin@one-g.com')).ok,false);assert.equal((await adapter.authenticateMockShortcut('phone','19900000001')).ok,false);
  if(env==='production'||flag==='0')for(const id of ['user-demo','admin-demo']){localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:id,role:'ADMIN'}));assert.equal(load('src/lib/auth-client').readDemoSession(),null);assert.equal((await load('src/lib/auth-client').authenticate('admin@one-g.com','admin123','ADMIN')).ok,false);}
 }
 process.env.NODE_ENV='development';process.env.NEXT_PUBLIC_ONE_G_MOCK_AUTH='1';const load=loader();load('src/lib/auth/verification').verificationService.mode='unconfigured';assert.equal(load('src/lib/auth/mock-login').mockShortcutEnabled,false);
});
