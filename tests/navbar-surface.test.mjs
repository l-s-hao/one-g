import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync('src/components/ui/navbar-surface.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', compiled)(mod, mod.exports);
const { chooseNavbarSurface, subscribeNavbarSurface, navbarSurfaceServerSnapshot } = mod.exports;
const normal = { supportsBlur: true, reducedTransparency: false, reducedMotion: false };

test('Opaque fallback respects capability and user preferences without requiring hardware APIs', () => {
  assert.equal(navbarSurfaceServerSnapshot(), 'solid');
  assert.equal(chooseNavbarSurface(normal), 'blur');
  assert.equal(chooseNavbarSurface({ ...normal, supportsBlur: false }), 'unsupported');
  assert.equal(chooseNavbarSurface({ ...normal, reducedTransparency: true }), 'reduced-transparency');
  assert.equal(chooseNavbarSurface({ ...normal, reducedMotion: true }), 'blur');
  assert.equal(chooseNavbarSurface({ ...normal, saveData: true }), 'save-data');
  for(const [hint,reason] of [['forcedSolid','forced-solid'],['forcedColors','forced-colors'],['coarsePointer','coarse-pointer']])assert.equal(chooseNavbarSurface({...normal,[hint]:true}),reason);
});

test('A single low/absent/invalid resource hint does not disable blur; combined low hints do', () => {
  for (const hints of [
    { hardwareConcurrency: 1 }, { hardwareConcurrency: 2, deviceMemory: 8 },
    { deviceMemory: 1 }, { deviceMemory: 2, hardwareConcurrency: 8 },
    { deviceMemory: 0, hardwareConcurrency: 0 },
    { deviceMemory: NaN, hardwareConcurrency: 2 },
    { deviceMemory: 1, hardwareConcurrency: -1 },
  ]) assert.equal(chooseNavbarSurface({ ...normal, ...hints }), 'blur');
  assert.equal(chooseNavbarSurface({ ...normal, deviceMemory: 2, hardwareConcurrency: 2 }), 'low-resources');
  assert.equal(chooseNavbarSurface({ ...normal, deviceMemory: 1, hardwareConcurrency: 1 }), 'low-resources');
});

test('Preference/connection notifications update once and stop after unmount cleanup', () => {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const savedNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const queries = Array.from({length:3},()=>new EventTarget());
  const connection = new EventTarget();
  let index = 0, updates = 0;
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { matchMedia: () => queries[index++] } });
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { connection } });
    const stop = subscribeNavbarSurface(() => updates++);
    queries.forEach(q=>q.dispatchEvent(new Event('change'))); connection.dispatchEvent(new Event('change'));
    assert.equal(updates, 4);
    stop();
    queries[0].dispatchEvent(new Event('change')); connection.dispatchEvent(new Event('change'));
    assert.equal(updates, 4);
  } finally {
    if (savedWindow) Object.defineProperty(globalThis, 'window', savedWindow); else delete globalThis.window;
    if (savedNavigator) Object.defineProperty(globalThis, 'navigator', savedNavigator); else delete globalThis.navigator;
  }
});
