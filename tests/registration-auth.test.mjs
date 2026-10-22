import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
function loader(env='development',flag='1') {
 process.env.NODE_ENV=env;process.env.NEXT_PUBLIC_ONE_G_MOCK_AUTH=flag;
 const cache=new Map();
 function load(file){file=path.resolve(file.endsWith('.ts')?file:file+'.ts');if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(id=>load(id.startsWith('@/')?'src/'+id.slice(2):path.resolve(path.dirname(file),id)),mod,mod.exports);return mod.exports;}return load;
}
const profile=(extra={})=>({region:'international',nickname:'Fictional tester',password:'  Synthetic-passphrase-7!  ',email:'fictional-new@example.test',phone:'',affiliation:'individual',organization:'',...extra});
const registrationContext=email=>({purpose:'register',region:'international',channel:'email',recipient:email});
async function send(load,context,service=load('src/lib/auth/verification').verificationService){const proof=await load('src/lib/auth/human').humanVerification.issue(context);return service.send({...context,humanToken:proof.token});}
test('Central region/profile policy: mainland phone, international email only, individual vs organization, no password rewriting',()=>{
 const load=loader(),policy=load('src/lib/auth/policy'),accounts=load('src/lib/auth/accounts');
 assert.equal(policy.allowsChannel('international','phone'),false);assert.equal(policy.allowsChannel('international','wechat'),false);assert.equal(policy.allowsChannel('mainland','phone'),true);
 assert.deepEqual(accounts.registrationErrors(profile()),{});assert.ok(accounts.registrationErrors(profile({region:'mainland'})).phone);assert.ok(accounts.registrationErrors(profile({affiliation:'organization'})).organization);
 assert.ok(accounts.registrationErrors(profile({password:'weak'})).password);assert.equal(policy.validPassword('x'.repeat(129)+'7'),false);
 assert.equal(accounts.findAccount('email','not-registered@example.test'),undefined);
});
test('Human proofs are single-use, expire and bind purpose/target/region; send is protected',async()=>{
 const load=loader();let now=1000;const human=load('src/lib/auth/human').createMockHumanVerification(()=>now);
 const service=load('src/lib/auth/verification').createMockVerificationService(()=>now,0,human);const context=registrationContext('proof@example.test');
 await assert.rejects(service.send({...context,humanToken:''}),/人机/);
 let proof=await human.issue(context);await service.send({...context,humanToken:proof.token});await assert.rejects(service.send({...context,humanToken:proof.token}),/人机/);
 proof=await human.issue(context);await assert.rejects(service.send({...context,recipient:'other@example.test',humanToken:proof.token}),/人机/);
 proof=await human.issue(context);now+=120001;await assert.rejects(service.send({...context,humanToken:proof.token}),/人机/);
 proof=await human.issue(context);await assert.rejects(service.send({...context,purpose:'login',humanToken:proof.token}),/人机/);
 await assert.rejects(service.send({purpose:'login',region:'international',channel:'phone',recipient:'19900000001',humanToken:'anything'}),/无法完成验证/);
});
test('Challenges bind purpose/address/region, enforce expiry/attempts/cooldown, never create unknown login users',async()=>{
 const load=loader();let now=1000;const human=load('src/lib/auth/human').createMockHumanVerification(()=>now);const service=load('src/lib/auth/verification').createMockVerificationService(()=>now,0,human);const context=registrationContext('challenge@example.test');
 const issue=async ctx=>service.send({...ctx,humanToken:(await human.issue(ctx)).token});let c=await issue(context);
 await assert.rejects(service.verify({...context,purpose:'login',challengeId:c.id,code:'004271'}),/错误或已失效/);
 await assert.rejects(service.consumeRegistration({...context,recipient:'else@example.test',challengeId:c.id,code:'004271'}),/错误或已失效/);
 await assert.rejects(issue(context),e=>e.retryAt===61000);
 await service.consumeRegistration({...context,challengeId:c.id,code:'004271'});await assert.rejects(service.consumeRegistration({...context,challengeId:c.id,code:'004271'}),/错误或已失效/);
 now+=61000;c=await issue(context);for(let i=0;i<5;i++)await assert.rejects(service.consumeRegistration({...context,challengeId:c.id,code:'999999'}),/错误或已失效/);await assert.rejects(service.consumeRegistration({...context,challengeId:c.id,code:'004271'}),/错误或已失效/);
 now+=61000;c=await issue(context);now+=300001;await assert.rejects(service.consumeRegistration({...context,challengeId:c.id,code:'004271'}),/错误或已失效/);
 await assert.rejects(issue({...context,purpose:'login'}),/无法完成验证/);assert.equal(load('src/lib/auth/accounts').findAccount('email',context.recipient),undefined);
});
test('Explicit registration creates only one memory USER, no session; email verified, phone unverified; both login methods retain ID',async()=>{
 const load=loader(),service=load('src/lib/auth/account-service').accountService,accounts=load('src/lib/auth/accounts'),otp=load('src/lib/auth/verification').verificationService;
 const inputProfile=profile({region:'mainland',phone:'19900000003'});const context={...registrationContext(inputProfile.email),region:'mainland'};
 const c=await send(load,context);assert.equal(accounts.findAccount('email',inputProfile.email),undefined);
 const request={profile:inputProfile,verification:{...context,challengeId:c.id,code:'004271'},requestId:'fictional-idempotency'};
 await Promise.all([service.register(request),service.register(request)]);await service.register(request);
 const account=accounts.findAccount('email',inputProfile.email);assert.equal(account.role,'USER');assert.equal(account.emailVerified,true);assert.equal(account.phoneVerified,false);assert.equal(account.affiliation,'individual');assert.equal(accounts.findAccount('phone',inputProfile.phone),undefined);
 assert.equal((await service.passwordLogin({region:'mainland',channel:'email',recipient:inputProfile.email,password:inputProfile.password})).user.id,account.id);
 await assert.rejects(service.passwordLogin({region:'mainland',channel:'email',recipient:inputProfile.email,password:inputProfile.password.trim()}),/无法完成验证/);
 await assert.rejects(service.passwordLogin({region:'mainland',channel:'phone',recipient:inputProfile.phone,password:inputProfile.password}),/无法完成验证/);
 await assert.rejects(service.register({...request,role:'ADMIN'}),/无法完成验证/);await assert.rejects(service.register({...request,profile:{...inputProfile,role:'ADMIN'}}),/无法完成验证/);
 await assert.rejects(accounts.createMemoryAccount(inputProfile),/无法完成验证/);assert.equal(accounts.findAccount('email',inputProfile.email).id,account.id);
 // Use a separate channel/region-context challenge factory after register cooldown; verify still resolves the same repository ID.
 const loginContext={purpose:'login',region:'international',channel:'email',recipient:inputProfile.email};const isolated=load('src/lib/auth/verification').createMockVerificationService(Date.now,0);const loginChallenge=await send(load,loginContext,isolated);
 assert.equal((await isolated.verify({...loginContext,challengeId:loginChallenge.id,code:'004271'})).id,account.id);
 await assert.rejects(otp.verify({...context,purpose:'login',challengeId:c.id,code:'004271'}),/错误或已失效/);
 assert.equal(accounts.findAccount('phone','19900000001').id,'user-demo');
});
test('Password failures are limited and overseas phone cannot bypass adapter policy',async()=>{
 const load=loader(),service=load('src/lib/auth/account-service').accountService;
 const request={region:'mainland',channel:'email',recipient:'unknown@example.test',password:'bad'};
 for(let i=0;i<5;i++)await assert.rejects(service.passwordLogin(request),/无法完成验证/);await assert.rejects(service.passwordLogin(request),/次数过多/);
 await assert.rejects(service.passwordLogin({...request,region:'international',channel:'phone',recipient:'19900000001'}),/无法完成验证/);
 const result=await service.passwordLogin({region:'international',channel:'email',recipient:'demo-a@example.test',password:'123456'});assert.equal(result.user.id,'user-demo');
});
test('Production refuses account creation/human/send/password even with explicit mock flag, and reload loses memory registrations',async()=>{
 const load=loader('production'),context=registrationContext('production@example.test');
 await assert.rejects(load('src/lib/auth/human').humanVerification.issue(context),/尚未接入/);
 await assert.rejects(load('src/lib/auth/verification').verificationService.send({...context,humanToken:'forged'}),/尚未接入/);
 await assert.rejects(load('src/lib/auth/account-service').accountService.register({profile:profile(),verification:{...context,code:'004271',challengeId:'forged'},requestId:'forged'}),/无法完成验证/);
 await assert.rejects(load('src/lib/auth/accounts').createMemoryAccount(profile()),/无法完成验证/);
 const fresh=loader();assert.equal(fresh('src/lib/auth/accounts').findAccount('email','fictional-new@example.test'),undefined);
});
