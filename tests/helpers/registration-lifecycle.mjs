/** 仅注入隔离浏览器：ID 保存在测试内存，不写入 DOM/key；字段只归档空值与相等性。
 * React 私有结构探针只作诊断，正式断言以原生导航、文档和真实可见表单为准。 */
export function registrationProbe() {
  const doc = crypto.randomUUID(); const forms = new WeakMap(); let ordinal = 0; let baseline; let profileState = null;
  const fields = { nickname:'register-nickname', email:'register-email', password:'register-password', phone:'register-phone', organization:'register-organization', code:'registration-code' };
  const formId = () => { const form=document.getElementById(fields.nickname)?.form;if(!form)return null;if(!forms.has(form))forms.set(form,`form-${++ordinal}`);return forms.get(form) };
  const snapshot = () => ({document:doc,form:formId(),fields:Object.fromEntries(Object.entries(fields).map(([key,id])=>{const node=document.getElementById(id);return [key,{exists:!!node,empty:!node?.value,matchesBaseline:baseline?node?.value===baseline[key]:null}]}))});
  const emit = (kind,data={}) => {void window.registrationProbeEvent({kind,elapsedMs:Math.round(performance.now()),document:doc,...data})};
  window.registrationProbe={snapshot,reactState:()=>profileState,baseline(){baseline=Object.fromEntries(Object.entries(fields).map(([key,id])=>[key,document.getElementById(id)?.value]));return snapshot()}};
  emit('document-init');
  for(const name of ['beforeunload','pagehide','pageshow','visibilitychange','blur','focus','DOMContentLoaded'])window.addEventListener(name,event=>emit(name,{persisted:event.persisted===true,...snapshot()}),true);
  const descriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
  Object.defineProperty(HTMLInputElement.prototype,'value',{...descriptor,set(value){descriptor.set.call(this,value);const field=Object.keys(fields).find(key=>fields[key]===this.id);if(field)emit('field-write',{field,empty:!this.value,form:formId()})}});
  let previous='';const observe=()=>{const s=snapshot();const key=JSON.stringify(s);if(key!==previous){previous=key;emit('form-state',s)}};
  document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(observe).observe(document.body,{subtree:true,childList:true});observe()});
  let renderer=0;const instances=new WeakMap();let mounts=0;const commits=new Map();
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__={supportsFiber:true,renderers:new Map(),inject(value){this.renderers.set(++renderer,value);return renderer},onCommitFiberUnmount(_,f){if(instances.has(f))emit('registration-unmount',{instance:instances.get(f)})},onCommitFiberRoot(_,root){try{const pending=[root.current];while(pending.length){const f=pending.pop();if(f.child)pending.push(f.child);if(f.sibling)pending.push(f.sibling);let h=f.memoizedState;while(h){const value=h.memoizedState;if(value&&typeof value==='object'&&['nickname','password','email','region','affiliation'].every(key=>Object.hasOwn(value,key))){let id=instances.get(f)||instances.get(f.alternate);if(!id){id=`registration-${++mounts}`;emit('registration-mount',{instance:id})}instances.set(f,id);if(f.alternate)instances.set(f.alternate,id);const state={instance:id,nicknameEmpty:!value.nickname,emailEmpty:!value.email,passwordEmpty:!value.password};profileState=state;const key=JSON.stringify(state);if(commits.get(id)!==key){commits.set(id,key);emit('registration-commit',state)}}h=h.next}}}catch{emit('react-probe-unavailable')}}};
}
export async function attachRegistrationProbe(page,evidence){
 await page.exposeBinding('registrationProbeEvent',(_,data)=>evidence.record('registration-observation',data));await page.addInitScript(registrationProbe);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Page.enable');
 cdp.on('Page.frameNavigated',e=>{if(!e.frame.parentId)evidence.record('document-navigation',{loader:e.frame.loaderId,pathname:new URL(e.frame.url).pathname})});
 cdp.on('Page.navigatedWithinDocument',e=>evidence.record('same-document-navigation',{pathname:new URL(e.url).pathname}));
 cdp.on('Page.javascriptDialogOpening',e=>evidence.record('native-dialog-opening',{type:e.type}));
 cdp.on('Page.javascriptDialogClosed',e=>evidence.record('native-dialog-closed',{accepted:e.result}));
 page.on('websocket',socket=>socket.on('framereceived',frame=>{try{const m=JSON.parse(String(frame.payload));if(/^[A-Za-z-]{1,40}$/.test(m.action||m.type||''))evidence.record('dev-message',{action:m.action||m.type})}catch{/* Not a structured development event. */}}));
 return cdp;
}

import assert from 'node:assert/strict';

/** 测试专用原生对话框控制器：同一时刻仅一位处理者，未知对话框一律取消并记为失败。 */
export async function watchRegistration(page, evidence) {
  assert.equal(page.listenerCount('dialog'), 0, 'Registration test already has a dialog handler');
  assert.equal(page.context().listenerCount('dialog'), 0, 'Context auto dialog handlers are not allowed');
  const cdp = await attachRegistrationProbe(page, evidence);
  let expected; const unexpected = []; const closed = [];
  cdp.on('Page.javascriptDialogClosed', event => closed.push(event.result));
  const onDialog = async dialog => {
    const request = expected;
    try {
      evidence.record('dialog-decision', { type: dialog.type(), action: request?.action || 'dismiss-unexpected', expected: !!request });
      assert.equal(dialog.type(), 'beforeunload');
      if (!request) {
        unexpected.push(new Error('Unexpected native beforeunload: extra navigation must be investigated'));
        await dialog.dismiss(); return;
      }
      if (request.action === 'accept') await dialog.accept(); else await dialog.dismiss();
      evidence.record('dialog-decision-completed', { action: request.action });
      request.resolve();
    } catch (error) { if (request) request.reject(error); else unexpected.push(error); }
  };
  page.on('dialog', onDialog);
  const assertNoUnexpected = () => { if (unexpected.length) throw unexpected[0]; };
  const nativeReload = async action => {
    assertNoUnexpected(); assert.equal(expected, undefined);
    let timer;
    const handled = new Promise((resolve, reject) => {
      expected = { action, resolve, reject };
      // 事件等待的既有 30s 上限，不是刷新后的固定等待，也不等待取消后不会出现的 load。
      timer = setTimeout(() => reject(new Error('Expected native beforeunload dialog did not appear')), 30000);
    });
    const index = closed.length;
    const operation = cdp.send('Page.reload').then(() => ({ ok: true }), error => ({ ok: false, error }));
    try {
      await handled;
      const result = await operation;
      if (!result.ok) throw result.error;
      return index;
    } finally { clearTimeout(timer); expected = undefined; }
  };
  const snapshot = () => page.evaluate(() => window.registrationProbe.snapshot());
  const baseline = () => page.evaluate(() => window.registrationProbe.baseline());
  const assertVisibleForm = async () => {
    assert.equal(await page.locator('#register-nickname').count(), 1);
    assert.equal(await page.locator('#register-nickname').isVisible(), true);
  };
  const cancelReload = async () => {
    await assertVisibleForm();
    const before = await baseline(); evidence.record('cancel-reload-before', before);
    const index = await nativeReload('dismiss');
    const after = await snapshot(); evidence.record('cancel-reload-after', after);
    assert.deepEqual(closed.slice(index), [false], 'The browser must actually cancel the single native prompt');
    assert.equal(after.document, before.document, 'Cancelled reload must keep the same document');
    assert.equal(after.form, before.form, 'Cancelled reload must keep the same form instance');
    assert.ok(Object.values(after.fields).every(field => field.matchesBaseline === true), 'Cancelled reload changed a registered field');
    await assertVisibleForm(); assertNoUnexpected();
    return { sameDocument: true, sameForm: true, fieldsUnchanged: true };
  };
  const confirmReload = async () => {
    const before = await snapshot(); evidence.record('confirm-reload-before', before);
    const loaded = page.waitForEvent('domcontentloaded');
    const index = await nativeReload('accept');
    await loaded; await page.locator('#register-nickname').waitFor();
    const after = await snapshot(); evidence.record('confirm-reload-after', after);
    assert.deepEqual(closed.slice(index), [true]);
    assert.notEqual(after.document, before.document, 'Confirmed reload must create a new document');
    assertNoUnexpected(); return after;
  };
  return { cdp, snapshot, baseline, cancelReload, confirmReload, assertNoUnexpected, close() { page.off('dialog', onDialog); } };
}
