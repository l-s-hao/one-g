import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
function loader() {
 const cache=new Map();
 function load(file) {
  file=path.resolve(file.endsWith('.ts')?file:file+'.ts');
  if(cache.has(file))return cache.get(file).exports;
  const mod={exports:{}};cache.set(file,mod);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',code)(id=>load(id.startsWith('@/')?'src/'+id.slice(2):path.resolve(path.dirname(file),id)),mod,mod.exports);
  return mod.exports;
 }
 return load;
}
process.env.NODE_ENV='test';process.env.NEXT_PUBLIC_ONE_G_MOCK_AUTH='1';process.env.NEXT_PUBLIC_ONE_G_MOCK_COMMERCE='1';
const load=loader();
const otp=load('src/lib/auth/verification');
const values=new Map();
global.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
global.window={localStorage};
const session=id=>localStorage.setItem('one-g-auth-demo',JSON.stringify({version:1,userId:id}));
test('Mock OTP: stable bound identities, leading zero, single use, role isolation',async()=>{
 const service=otp.createMockVerificationService(Date.now,0);
 for(const channel of ['phone','email']) {
  const request={channel,recipient:otp.testIdentities[0][channel]};const c=await service.send(request);
  const verified=await service.verify({...request,challengeId:c.id,code:otp.testCode});assert.equal(verified.id,'user-demo');assert.equal(verified.role,'USER');
  await assert.rejects(service.verify({...request,challengeId:c.id,code:otp.testCode}),/错误或已失效/);
 }
 await assert.rejects(service.send({channel:'email',recipient:'admin@one-g.com'}),/暂时无法完成/);
});
test('OTP invalid format, unknown recipient, resend, expiry, attempts, discard, address/channel mismatch and cancellation',async()=>{
 let now=1000;const service=otp.createMockVerificationService(()=>now,0);const a={channel:'phone',recipient:otp.testIdentities[0].phone};
 await assert.rejects(service.send({...a,recipient:'123'}),/有效/);
 await assert.rejects(service.send({...a,recipient:'19900000999'}),/暂时无法完成/);
 let c=await service.send(a);await assert.rejects(service.send(a),e=>e.retryAt===61000);
 for(let i=0;i<5;i++)await assert.rejects(service.verify({...a,challengeId:c.id,code:'000000'}),/错误或已失效/);
 await assert.rejects(service.verify({...a,challengeId:c.id,code:otp.testCode}),/错误或已失效/);
 now+=61000;c=await service.send(a);
 await assert.rejects(service.verify({...a,recipient:otp.testIdentities[1].phone,challengeId:c.id,code:otp.testCode}),/错误或已失效/);
 await assert.rejects(service.verify({...a,channel:'email',challengeId:c.id,code:otp.testCode}),/错误或已失效/);
 now+=300001;await assert.rejects(service.verify({...a,challengeId:c.id,code:otp.testCode}),/错误或已失效/);
 c=await service.send(a);now+=61000;const newer=await service.send(a);
 await assert.rejects(service.verify({...a,challengeId:c.id,code:otp.testCode}),/错误或已失效/);
 service.discard(newer.id);await assert.rejects(service.verify({...a,challengeId:newer.id,code:otp.testCode}),/错误或已失效/);
 const abort=new AbortController();abort.abort();await assert.rejects(service.send(a,abort.signal),{name:'AbortError'});
});
test('Cart and demo orders belong to stable user ID, no legacy auto-assignment, no fake paid status',async()=>{
 values.clear();const cart=load('src/lib/cart'),service=load('src/lib/commerce/service').commerceService;
 localStorage.setItem('one-g-cart',JSON.stringify([{productId:'arm-a1',quantity:2}]));session('user-demo');
 assert.deepEqual(await cart.readCart('user-demo'),[]);
 await cart.addCartProduct('arm-a1','user-demo',2);assert.equal((await cart.readCart('user-demo'))[0].quantity,2);
 const input={items:[{productId:'arm-a1',quantity:2}],payment:'alipay',idempotencyKey:'test-one'};
 const order=await service.createOrder('user-demo',input);assert.equal(order.status,'pending');assert.equal(order.demo,true);assert.equal(order.amount,25600);
 assert.equal((await service.createOrder('user-demo',{...input,total:1})).id,order.id);
 for(const payment of ['alipay','wechat-pay','bank-transfer']){const item=await service.createOrder('user-demo',{...input,payment,idempotencyKey:payment});await assert.rejects(service.initiatePayment('user-demo',item.id),/尚未接入|待配置/);}
 assert.equal(await service.getBankDetails(),null);
 await assert.rejects(service.createOrder('user-demo',{...input,items:[{productId:'robotdock',quantity:1}],idempotencyKey:'concept'}),/待确认/);
 await assert.rejects(service.createOrder('user-demo',{...input,items:[{productId:'sonic-link',quantity:1}],idempotencyKey:'unknown-price'}),/待确认/);
 const raw=JSON.parse(localStorage.getItem('one-g-orders:user-demo'));raw[0].status='paid';localStorage.setItem('one-g-orders:user-demo',JSON.stringify(raw));assert.equal(await service.getOrder('user-demo',order.id),null);
 session('user-demo-b');assert.deepEqual(await cart.readCart('user-demo-b'),[]);assert.deepEqual(await service.listOrders('user-demo-b'),[]);assert.equal(await service.getOrder('user-demo-b',order.id),null);
 await assert.rejects(cart.readCart('user-demo'));await assert.rejects(service.getOrder('user-demo',order.id));
 assert.ok(localStorage.getItem('one-g-cart'));
});
test('Existing IDs/themes remain, password USER disabled, admin stays independent, safe return preserves choices',async()=>{
 const auth=load('src/lib/auth-client'),routing=load('src/lib/auth-routing');
 assert.equal((await auth.authenticate('user@one-g.com','123456','USER')).ok,false);
 assert.equal((await auth.authenticate('admin@one-g.com','admin123','ADMIN')).ok,true);
 const theme=load('src/lib/user-preferences');
 theme.saveDisplayPreference('night','user-demo');
 assert.equal(theme.loadDisplayPreference('user-demo'),'night');assert.equal(theme.loadDisplayPreference('user-demo-b'),'standard');
 theme.saveDisplayPreference('color-vision-safe','user-demo');assert.equal(theme.loadDisplayPreference('user-demo'),'color-vision-safe');
 const target='/buy/robotdock/?package=hand&quantity=3&payment=alipay';assert.equal(routing.safeReturnTo(target,'USER'),target);
 for(const url of ['https://evil.test','//evil.test','/admin','/%2f%2fevil.test'])assert.equal(routing.safeReturnTo(url,'USER'),'/account');
 for(const url of ['/','/products','/buy/robotdock','/solutions','/about','/deep-customization'])assert.equal(routing.requiredRole(url),null);
 assert.deepEqual(load('src/lib/payments').paymentMethods.map(m=>m.id),['alipay','wechat-pay','bank-transfer']);
});
test('Production build mode refuses OTP and normal demo sessions even with opt-in flags',async()=>{
 process.env.NODE_ENV='production';const prod=loader();const auth=prod('src/lib/auth-client');session('user-demo');assert.equal(auth.readDemoSession(),null);
 assert.equal(prod('src/lib/demo-mode').mockAuthEnabled,false);assert.equal(prod('src/lib/demo-mode').mockCommerceEnabled,false);
 await assert.rejects(prod('src/lib/auth/verification').verificationService.send({channel:'phone',recipient:'19900000001'}),/尚未接入/);
 await assert.rejects(prod('src/lib/commerce/service').commerceService.createOrder('user-demo',{}),/尚未接入/);
 process.env.NODE_ENV='test';
});
