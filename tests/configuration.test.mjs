import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_ONE_G_MOCK_AUTH = "1";
const nodeRequire = createRequire(import.meta.url);
// Compile local TS with the project's alias, without adding a runtime/test dependency.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = new Map();
function load(file) {
  file = path.resolve(root, file.endsWith('.ts') ? file : `${file}.ts`);
  if (cache.has(file)) return cache.get(file).exports;
  const compiledModule = { exports: {} }; cache.set(file, compiledModule);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localRequire = id => id.startsWith('@/') ? load(`src/${id.slice(2)}`) : id.startsWith('.') ? load(path.resolve(path.dirname(file), id)) : nodeRequire(id);
  new Function('require', 'module', 'exports', code)(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const engine = load('src/lib/configuration/engine');
const storage = load('src/lib/configuration/storage');
const adapters = load('src/lib/configuration/adapters');
const { robotSchema: robot } = load('src/data/configuration/schemas/robot');
const { defaultConfiguration: oldDefault } = load('src/data/configurator');
const option = (groupId, id, price = 10) => ({ groupId, id, price, name: id, status: 'active' });
const fixture = () => ({ id: 'test-only', productType: 'test', title: 'Test', entryHref: '/configure', cartLabel: 'Test', defaults: {}, groups: [
  { id: 'bundle', label: 'Bundle', heading: 'BUNDLE', order: 0, selectionMode: 'single', required: true, progressWeight: 2, options: [option('bundle', 'shared'), option('bundle', 'other')] },
  { id: 'extras', label: 'Extras', heading: 'EXTRAS', order: 1, selectionMode: 'multiple', required: false, minSelections: 2, maxSelections: 2, options: [option('extras', 'shared'), option('extras', 'b'), option('extras', 'c')] },
  { id: 'service', label: 'Service', heading: 'SERVICE', order: 2, selectionMode: 'single', required: false, options: [{ ...option('service', 'quote'), price: undefined }] },
] });
function localStorageMock() {
  const values = new Map();
  global.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } };
  global.localStorage = window.localStorage;
  localStorage.setItem("one-g-auth-demo", JSON.stringify({version:1,userId:"user-demo"}));
  return values;
}
test('Robot baseline, adapters and optional omission preserve STEP 4 behavior', () => {
  const state = engine.getInitialConfiguration(robot);
  assert.deepEqual(adapters.genericToRobotConfiguration(state), oldDefault);
  assert.deepEqual(adapters.robotConfigurationToGeneric(oldDefault), state);
  assert.equal(engine.getConfigurationTotal(robot, state), 97800);
  assert.equal(engine.getProgress(robot, state).completion, 60);
  assert.equal(engine.configurationValid(robot, { base: ['g1'] }), true);
  assert.equal(engine.configurationValid(robot, {}), false);
  assert.equal(engine.getConfigurationTotal(robot, {}), undefined);
  assert.equal(engine.getProgress(robot, { base: ['g1'], arm: ['no-arm'], hand: ['no-hand'] }).completion, 20);
});
test('Three groups, composite option identities, single replacement, multi limits and weighted progress', () => {
  const schema = fixture();
  let state = engine.emptyConfiguration(schema);
  state = engine.changeModule(schema, state, schema.groups[0].options[0]);
  assert.equal(engine.isInstalled(state, schema.groups[1].options[0]), false);
  assert.notEqual(engine.optionKey(schema.groups[0].options[0]), engine.optionKey(schema.groups[1].options[0]));
  assert.equal(engine.getProgress(schema, state).completion, 50);
  state = engine.changeModule(schema, state, schema.groups[0].options[1]);
  assert.deepEqual(state.bundle, ['other']);
  state = engine.changeModule(schema, state, schema.groups[1].options[0]);
  assert.equal(engine.configurationValid(schema, state), false);
  state = engine.changeModule(schema, state, schema.groups[1].options[1]);
  assert.equal(engine.configurationValid(schema, state), true);
  assert.deepEqual(engine.changeModule(schema, state, schema.groups[1].options[2]), state);
  assert.equal(engine.getProgress(schema, state).completion, 75);
  assert.equal(engine.getConfigurationTotal(schema, state), 30);
  assert.equal(engine.getConfigurationTotal(schema, { ...state, service: ['quote'] }), undefined);
  assert.equal(engine.configurationValid(schema, { ...state, extras: ['shared', 'b', 'c'] }), false);
  assert.equal(engine.configurationValid(schema, { ...state, missing: ['bad'] }), false);
  assert.equal(engine.getProgress({ ...schema, groups: [] }, {}).completion, 0);
});
test('Generic dependencies, exclusions, required groups and Robot allow-list adapter', () => {
  const schema = fixture(), target = schema.groups[2].options[0];
  schema.compatibilityRules = [{ option: { groupId: 'service', optionId: 'quote' }, type: 'requires', target: { groupId: 'bundle', optionId: 'shared' } }];
  assert.equal(engine.getAvailability(schema, target, {}).available, false);
  assert.equal(engine.getAvailability(schema, target, { bundle: ['shared'] }).available, true);
  schema.compatibilityRules[0] = { option: { groupId: 'service', optionId: 'quote' }, type: 'incompatibleWith', target: { groupId: 'bundle', optionId: 'shared' } };
  assert.equal(engine.getAvailability(schema, target, { bundle: ['shared'] }).available, false);
  schema.compatibilityRules[0] = { option: { groupId: 'service', optionId: 'quote' }, type: 'requiresGroup', groupId: 'extras' };
  assert.equal(engine.getAvailability(schema, target, {}).available, false);
  assert.equal(engine.getAvailability(schema, target, { extras: ['b'] }).available, true);
  schema.compatibilityRules[0] = { option: { groupId: 'service', optionId: 'quote' }, type: 'allowedOptions', groupId: 'bundle', optionIds: ['other'] };
  assert.equal(engine.getAvailability(schema, target, { bundle: ['shared'] }).available, false);
  assert.equal(engine.getAvailability(schema, target, { bundle: ['other'] }).available, true);
});
test('Scene recommendations preserve omitted groups, ignore unknown groups and validate complete candidate', () => {
  for (const scene of ['handling', 'inspection', 'teleoperation', 'ai']) {
    const groups = engine.getRecommendedGroups(robot, scene);
    const state = engine.buildRecommendedConfiguration(robot, engine.getInitialConfiguration(robot), groups);
    assert.ok(state); assert.equal(engine.getProgress(robot, state).completion, 100);
  }
  const schema = fixture();
  schema.recommendations = [{ scene: 'test', recommended: { bundle: ['other', 'shared'], unknown: ['bad'], service: ['quote'] } }];
  const groups = engine.getRecommendedGroups(schema, 'test');
  assert.equal(groups.length, 2); assert.equal(groups[0].options.length, 1);
  const next = engine.buildRecommendedConfiguration(schema, { extras: ['shared', 'b'] }, groups);
  assert.deepEqual(next.extras, ['shared', 'b']);
  schema.compatibilityRules = [{ option: { groupId: 'service', optionId: 'quote' }, type: 'requires', target: { groupId: 'bundle', optionId: 'shared' } }];
  assert.equal(engine.buildRecommendedConfiguration(schema, {}, groups), null);
});
test('scope IDs, legacy aliases and unknown fallback are schema-driven', () => {
  assert.equal(engine.resolveDirection(robot, 'inspection', 'perception').scope.groupId, 'vision');
  assert.equal(engine.resolveDirection(robot, 'handling', 'unknown').scope.groupId, 'base');
  assert.equal(engine.resolveDirection(robot, 'teleoperation', null).scene.preferredGroup, 'capability');
  assert.equal(engine.resolveDirection(fixture(), null, 'bundle').scope.groupId, 'bundle');
});
test('Old ID and Chinese records migrate without deleting source; removal cannot resurrect legacy', async () => {
  for (const old of [oldDefault, { 基础型号: 'ONE-G G1', 机械臂: '标准机械臂', 灵巧手: '五指灵巧手', 视觉系统: [], 功能: [] }]) {
    const values = localStorageMock(); values.set('one-g-config', JSON.stringify(old));
    const stored = await storage.readConfiguration(robot);
    assert.equal(stored.version, 2); assert.equal(stored.schemaId, 'robot');
    assert.equal(stored.selections.base[0], 'g1');
    assert.ok(values.has('one-g-config')); assert.ok(values.has('one-g-config:robot'));
    storage.removeConfiguration(robot); assert.equal(await storage.readConfiguration(robot), null);
  }
});
test('Snapshot survives catalog removal and captures independent IDs, names, summary and prices', async () => {
  localStorageMock(); const schema = fixture();
  const input = { bundle: ['shared'], extras: ['b', 'shared'] };
  const saved = storage.saveConfiguration(schema, input); input.bundle.push('other');
  assert.equal(saved.snapshot.price, 30); assert.deepEqual(saved.snapshot.selections.bundle, ['shared']);
  schema.groups[0].options = [];
  const restored = await storage.readConfiguration(schema);
  assert.deepEqual(restored.selections.bundle, []);
  assert.equal(restored.snapshot.summary[0].options[0].name, 'shared');
  assert.equal(restored.snapshot.price, 30);
  schema.groups[1].options[0].price = Infinity;
  const unknown = storage.createSnapshot(schema, { extras: ['shared'] });
  assert.equal(unknown.price, undefined);
  assert.equal(unknown.summary[1].options[0].price, undefined);
  assert.equal(storage.saveConfiguration(schema, { extras: ['shared'] }).snapshot, undefined);
  assert.equal(await storage.readConfiguration(schema), null, 'Incomplete active configuration cannot become a cart snapshot');
});
test('Future/malformed records remain intact; failed migration write still recovers configuration', async () => {
  const values = localStorageMock();
  for (const raw of [JSON.stringify({ version: 3 }), '{broken', 'null']) {
    values.set('one-g-config:robot', raw); values.set('one-g-config', JSON.stringify(oldDefault));
    assert.equal(await storage.readConfiguration(robot), null);
    assert.equal(values.get('one-g-config:robot'), raw);
  }
  values.delete('one-g-config:robot');
  window.localStorage.setItem = () => { throw Error('storage denied'); };
  assert.equal((await storage.readConfiguration(robot)).selections.base[0], 'g1');
});


test('Concept catalog product is discoverable, excluded from Robot options and cannot enter cart', async () => {
  const catalog = load('src/lib/products');
  const cart = load('src/lib/cart');
  const product = catalog.getProductBySlug('robotdock');
  assert.equal(product.status, 'concept'); assert.equal(product.price, undefined);
  assert.ok(catalog.getProducts().includes(product));
  assert.ok(catalog.getProductsByCategory('accessory').includes(product));
  assert.equal(catalog.getFeaturedProducts().includes(product), false);
  assert.equal(catalog.getCoreProduct().id, 'g1');
  assert.equal(engine.getWorkbenchGroups(robot)[0].options.some(option => option.id === product.id), false);
  assert.equal(product.detail.bundles.length, 4);
  assert.ok(product.detail.bundles[3].items.some(item => item.includes('2台')));
  localStorageMock();
  await assert.rejects(cart.addCartProduct(product.id, "user-demo"), /暂不可购买/);
  assert.deepEqual(await cart.readCart("user-demo"), []);
  assert.deepEqual(cart.parseCart([{ productId: product.id, quantity: 1 }]), []);
  await cart.addCartProduct('g1', 'user-demo'); assert.equal((await cart.readCart("user-demo"))[0].id, 'g1');
});

test('RobotDock registry and four mutually exclusive bundles reuse product facts without Robot groups', () => {
  const { getConfiguratorSchema } = load('src/data/configuration/registry');
  const dock = getConfiguratorSchema('robotdock');
  const product = load('src/lib/products').getProductById('robotdock');
  assert.equal(getConfiguratorSchema('robot'), robot);
  assert.equal(getConfiguratorSchema('xxx'), undefined);
  assert.equal(getConfiguratorSchema('__proto__'), undefined);
  assert.deepEqual(dock.groups.map(group => group.id), ['bundle']);
  const group = dock.groups[0]; assert.equal(group.selectionMode, 'single'); assert.equal(group.required, true);
  let state = engine.getInitialConfiguration(dock);
  for (const [index, option] of group.options.entries()) {
    assert.deepEqual(option.metadata.includes, product.detail.bundles[index].items);
    assert.equal(option.status, 'concept'); assert.equal(option.price, undefined);
    state = engine.changeModule(dock, state, option);
    assert.deepEqual(state.bundle, [option.id]);
    assert.equal(engine.configurationValid(dock, state), true);
    assert.equal(engine.getProgress(dock, state).completion, 100);
    assert.equal(engine.getConfigurationPriceLabel(dock, state), '价格待定');
  }
  assert.deepEqual(engine.getRecommendedGroups(dock, 'handling'), []);
  assert.equal(engine.resolveDirection(dock, 'handling', 'arm').scope.groupId, 'bundle');
  assert.equal(engine.configurationValid(dock, {bundle:[]}), false);
  assert.equal(engine.getProgress(dock, {bundle:[]}).completion, 0);
});
test('Preview storage is isolated and has no cart snapshot; product status fails closed', async () => {
  const { getConfiguratorSchema } = load('src/data/configuration/registry');
  const dock = getConfiguratorSchema('robotdock');
  const policy = load('src/lib/configuration/policy');
  const cart = load('src/lib/cart');
  const values = localStorageMock();
  storage.saveConfiguration(robot, engine.getInitialConfiguration(robot));
  const original = values.get('one-g-config:robot');
  const stored = storage.saveConfiguration(dock, {bundle:['gripper-camera']});
  assert.equal(stored.snapshot, undefined); assert.equal(stored.schemaId, 'robotdock');
  assert.equal(values.get('one-g-config:robot'), original);
  assert.equal((await storage.readConfiguration(dock)).selections.bundle[0], 'gripper-camera');
  assert.equal(await cart.readSavedConfiguration('user-demo'), null, 'Unowned legacy configuration is not assigned to this user');
  storage.saveConfiguration(robot, engine.getInitialConfiguration(robot), 'user-demo');
  assert.equal((await cart.readSavedConfiguration('user-demo')).schemaId, 'robot');
  assert.equal(values.has('one-g-cart'), false);
  assert.equal(policy.isConfigurationPreview({...dock,purchaseMode:'cart'}), true);
  assert.equal(policy.isConfigurationPreview({...robot,productId:'missing'}), true);
  storage.removeConfiguration(robot, "user-demo"); assert.equal(await cart.readSavedConfiguration("user-demo"), null);
  assert.ok(await storage.readConfiguration(dock));
});
test('Mixed/unknown prices and optional groups have explicit semantics', () => {
  const schema=fixture(); schema.progressMode='required'; schema.groups[1].minSelections=0;
  assert.equal(engine.getProgress(schema,{bundle:['shared']}).completion,100);
  assert.equal(engine.configurationValid(schema,{bundle:['shared']}),true);
  assert.equal(engine.getConfigurationPriceLabel(schema,{service:['quote']}),'价格待定');
  assert.equal(engine.getConfigurationPriceLabel(schema,{bundle:['shared'],service:['quote']}),'部分价格待确认');
  assert.match(engine.getConfigurationPriceLabel(schema,{bundle:['shared']}),/10/);
  const concept={...schema.groups[0].options[0],status:'concept'};
  assert.equal(engine.getAvailability(schema,concept,{}).available,false);
});

test('SONIC Link is discoverable but cannot be purchased; STEP 9 configuration remains preview-only', async () => {
  const catalog = load('src/lib/products');
  const product = catalog.getProductBySlug('sonic-link');
  assert.equal(product.status, 'coming-soon');
  assert.equal(product.price, undefined);
  assert.equal(load("src/lib/configuration/catalog").getProductActions(product).configurePath, "/configure/sonic-link");
  assert.ok(catalog.getProducts().includes(product));
  assert.ok(catalog.getProductsByCategory('accessory').includes(product));
  assert.ok(catalog.getProducts().filter(p => p.status === 'coming-soon').includes(product));
  assert.equal(catalog.getProductStatusLabel(product.status), '即将开放');
  assert.ok(!catalog.getFeaturedProducts().includes(product));
  assert.ok(!robot.groups[0].options.some(option => option.productId === product.id));
  assert.equal(load('src/lib/configuration/policy').isConfigurationPreview(load('src/data/configuration/registry').getConfiguratorSchema(product.id)), true);
  const cart = load('src/lib/cart'); localStorageMock();
  await assert.rejects(cart.addCartProduct(product.id, "user-demo"), /暂不可购买/);
  assert.deepEqual(await cart.readCart("user-demo"), []);
  assert.deepEqual(cart.parseCart([{productId: product.id, quantity: 1}]), []);
});

test('SONIC packages × optional gripper preserve exact contents, ready, unknown price and isolation', async () => {
  const schema = load('src/data/configuration/registry').getConfiguratorSchema('sonic-link');
  const product = load('src/lib/products').getProductById('sonic-link');
  assert.deepEqual(schema.groups.map(g => [g.id,g.selectionMode,g.required,g.maxSelections]), [['bundle','single',true,1],['add-on','multiple',false,1]]);
  assert.deepEqual(schema.groups[0].options.map(o => o.metadata.includes), product.detail.bundles.map(b => b.items));
  assert.deepEqual(schema.groups[1].options.map(o => o.metadata.includes), product.detail.addOns.map(a => a.items));
  const values = localStorageMock();
  storage.saveConfiguration(robot, engine.getInitialConfiguration(robot));
  const dock = load('src/data/configuration/registry').getConfiguratorSchema('robotdock');
  storage.saveConfiguration(dock, engine.getInitialConfiguration(dock));
  const robotSaved = values.get('one-g-config:robot'), dockSaved = values.get('one-g-config:robotdock');
  let state = engine.getInitialConfiguration(schema);
  const gripper = schema.groups[1].options[0];
  for (const add of [false,true]) {
    state = engine.changeModule(schema,state,gripper,!add);
    for (const option of schema.groups[0].options) {
      state = engine.changeModule(schema,state,option);
      assert.deepEqual(state['add-on'],add?['gripper']:[]);
      assert.equal(engine.configurationValid(schema,state),true);
      assert.equal(engine.getProgress(schema,state).completion,100);
      assert.equal(engine.getProgress(schema,state).dimensions.length,1);
      assert.equal(engine.getConfigurationTotal(schema,state),undefined);
      assert.equal(engine.getConfigurationPriceLabel(schema,state),'价格待定');
      const saved=storage.saveConfiguration(schema,state); assert.equal(saved.snapshot,undefined);
      assert.deepEqual((await storage.readConfiguration(schema)).selections,state);
    }
  }
  assert.equal(values.get('one-g-config:robot'),robotSaved); assert.equal(values.get('one-g-config:robotdock'),dockSaved);
  assert.equal(values.get('one-g-cart'),undefined);
  assert.equal(engine.configurationValid(schema,{'bundle':[],'add-on':['gripper']}),false);
  assert.equal(engine.getProgress(schema,{'bundle':[],'add-on':['gripper']}).completion,0);
  assert.equal(engine.configurationValid(schema,{'bundle':['three','full'],'add-on':[]}),false);
  assert.deepEqual(engine.getRecommendedGroups(schema,'handling'),[]);
  assert.equal(schema.compatibilityRules,undefined);
  assert.equal(engine.resolveDirection(schema,'inspection','add-on').scope.groupId,'add-on');
  assert.equal(engine.resolveDirection(schema,'handling','unknown').scope.groupId,'bundle');
});

test('Schema query preselection validates IDs, resets add-ons only for explicit links and has no product branch', () => {
  const schema=load('src/data/configuration/registry').getConfiguratorSchema('sonic-link');
  assert.equal(engine.getEntrySelections(schema,new URLSearchParams('')),undefined);
  for (const [value,expected] of [['three','three'],['full','full'],['dual','dual'],['','three'],['bad','three'],['__proto__','three'],['constructor','three']]) {
    const state=engine.getEntrySelections(schema,new URLSearchParams({bundle:value,gripper:'true'}));
    assert.deepEqual(state,{bundle:[expected],'add-on':[]});
    const alternate=schema.groups[0].options.find(o=>o.id!==expected);
    assert.deepEqual(engine.changeModule(schema,state,alternate).bundle,[alternate.id]);
  }
  assert.equal(engine.getEntrySelections(robot,new URLSearchParams('bundle=full')),undefined);
  const generic={...fixture(),defaults:{bundle:['shared'],extras:['shared','b'],service:[]},querySelections:[{parameter:'kit',groupId:'bundle'}]};
  assert.deepEqual(engine.getEntrySelections(generic,new URLSearchParams('kit=other')).bundle,['other']);
});

test('Registry drives center and product CTA without making ordinary accessories configurable', () => {
  const catalog=load('src/lib/configuration/catalog'), products=load('src/lib/products');
  assert.deepEqual(catalog.getConfigurationEntries().map(e=>e.schema.id),['robot','robotdock','sonic-link']);
  for(const id of ['g1','g1-pro','robotdock','sonic-link']) assert.equal(catalog.getProductActions(products.getProductById(id)).canConfigure,true);
  for(const id of ['arm-a1','hand-d1','rgbd']) assert.equal(catalog.getProductActions(products.getProductById(id)).canConfigure,false);
  assert.equal(catalog.getProductActions(products.getProductById('sonic-link')).configurationLabel,'配置预览');
  const registry=load('src/data/configuration/registry').configuratorRegistry;
  // Test-only registration proves the entry list is not hardcoded to three JSX cards.
  registry.fixture={...robot,id:'fixture',productId:'arm-a1'};
  assert.ok(catalog.getConfigurationEntries().some(e=>e.href==='/configure/fixture'));
  delete registry.fixture;
});

test('Unified actions separate required readiness from installation progress and prohibit preview cart', () => {
  const {getConfigurationActions}=load('src/lib/configuration/actions');
  const ready=getConfigurationActions(robot,{base:['g1']});
  assert.equal(ready.canSave,true);assert.equal(ready.canAddToCart,true);assert.equal(engine.getProgress(robot,{base:['g1']}).completion,20);
  assert.equal(getConfigurationActions(robot,{}).canAddToCart,false);
  for(const id of ['robotdock','sonic-link']) {
    const schema=load('src/data/configuration/registry').getConfiguratorSchema(id);
    const actions=getConfigurationActions(schema,engine.getInitialConfiguration(schema));
    assert.equal(actions.canSave,true);assert.equal(actions.canAddToCart,false);assert.equal(actions.saveLabel,'保存配置预览');
  }
  const schema={...fixture(),groups:[{...fixture().groups[0],options:[]}]};
  assert.equal(engine.configurationValid(schema,{}),false,'Hidden empty required group must not silently become ready');
});

test('Snapshot includes product relation, keeps captured prices, and current sale status blocks old Cart records', async () => {
  const values=localStorageMock(),cart=load('src/lib/cart');
  const state=engine.getInitialConfiguration(robot);
  const saved=storage.saveConfiguration(robot,state,"user-demo");assert.equal(saved.snapshot.productId,'g1');
  const product=load('src/lib/products').getProductById('g1'),originalPrice=product.price,originalStatus=product.status;
  try {
    product.price=1;assert.equal((await cart.readSavedConfiguration("user-demo")).price,97800);
    delete saved.snapshot.productId;values.set('one-g-config:robot:user:user-demo',JSON.stringify(saved));
    assert.equal((await cart.readSavedConfiguration("user-demo")).price,97800,'Old v2 snapshot remains readable');
    product.status='coming-soon';assert.equal(await cart.readSavedConfiguration("user-demo"),null);
  } finally {product.price=originalPrice;product.status=originalStatus;}
});

test('Product purchase navigation and legacy URLs validate known package IDs', () => {
  const { getProductActions } = load('src/lib/product-actions');
  const products = load('src/lib/products');
  for (const id of ['robotdock', 'sonic-link', 'g1']) {
    const actions = getProductActions(products.getProductById(id));
    assert.equal(actions.configurePath, id === 'g1' ? '/' : `/buy/${id}`);
    assert.equal(actions.configurationLabel, id === 'g1' ? '查看系统配置' : '购买');
  }
  assert.equal(getProductActions(products.getProductById('arm-a1')).configurePath, undefined);
  const routing = load('src/lib/auth-routing');
  assert.equal(routing.requiredRole('/solutions#handling'), null);
  assert.equal(routing.requiredRole('/configure'), null);
  assert.equal(routing.requiredRole('/products'), null);
  for (const route of ['/configure/robot', '/configure/robotdock', '/configure/sonic-link', '/customize', '/customize/start']) {
    assert.equal(routing.safeReturnTo(`${route}/?scene=inspection&scope=perception#old`, 'USER'), ['/configure/robotdock','/configure/sonic-link'].includes(route) ? route.replace('/configure/', '/buy/') : '/');
  }
  assert.equal(routing.safeReturnTo('/configure/?product=robotdock&package=hand&price=1', 'USER'), '/buy/robotdock?package=hand');
  assert.equal(routing.safeReturnTo('/configure/?product=robotdock&package=dual', 'USER'), '/buy/robotdock');
  assert.equal(routing.safeReturnTo('/buy/robotdock?package=hand', 'USER'), '/buy/robotdock?package=hand');
  assert.equal(routing.requiredRole('/buy/robotdock'), null);
  assert.equal(routing.safeReturnTo('//evil.example', 'USER'), '/account');
  assert.equal(routing.safeReturnTo('/admin', 'USER'), '/account');
});


test('Public browsing, personal routes, admin boundaries and pending cart hints', () => {
  const auth = load('src/lib/auth-routing');
  for (const route of ['/', '/about', '/solutions', '/deep-customization', '/configure', '/products', '/products/arm-a1', '/search', '/customize']) assert.equal(auth.requiredRole(route), null, route);
  for (const route of ['/cart', '/checkout', '/orders', '/account', '/account/orders', '/order-success']) assert.equal(auth.requiredRole(route), 'USER', route);
  assert.equal(auth.requiredRole('/admin/login'), null);
  assert.equal(auth.requiredRole('/admin/products'), 'ADMIN');
  assert.equal(auth.requiredRole('/cartoon'), null);
  assert.equal(auth.safeReturnTo('/products/arm-a1?source=card#details', 'USER'), '/products/arm-a1?source=card#details');
  assert.equal(auth.safeReturnTo('/%2fexternal.example', 'USER'), '/account');
  const values = new Map();global.sessionStorage = {getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key)};
  const pending = load('src/lib/pending-cart-action');
  pending.rememberCartIntent('arm-a1', '/products/arm-a1');
  assert.equal(pending.consumeCartIntent('arm-a2', '/products/arm-a2'), false);
  assert.equal(pending.consumeCartIntent('arm-a1', '/products/arm-a1'), true);
  assert.equal(pending.consumeCartIntent('arm-a1', '/products/arm-a1'), false);
  values.set('one-g-pending-cart-action', JSON.stringify({action:'add-to-cart',productId:'arm-a1',pathname:'/products/arm-a1',createdAt:Date.now()-16*60*1000}));
  assert.equal(pending.consumeCartIntent('arm-a1', '/products/arm-a1'), false);
});
