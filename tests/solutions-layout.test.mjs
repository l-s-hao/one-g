import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const cache = new Map();
function load(file) {
  file = path.resolve(file.endsWith('.ts') ? file : file + '.ts');
  if (cache.has(file)) return cache.get(file).exports;
  const compiledModule = { exports: {} }; cache.set(file, compiledModule);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', code)(id => load(id.startsWith('@/') ? 'src/' + id.slice(2) : path.resolve(path.dirname(file), id)), compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
test('Page reading order keeps shared solution identity, original order and real detail destinations', () => {
  const { solutions } = load('src/data/solutions');
  const { solutionSections } = load('src/lib/solution-sections');
  assert.deepEqual(solutions.map(item => item.id), ['handling', 'inspection', 'teleoperation', 'ai']);
  assert.deepEqual(solutionSections.map(item => item.id), ['teleoperation', 'handling', 'inspection', 'ai']);
  assert.equal(new Set(solutionSections).size, 4);
  for (const item of solutionSections) assert.equal(item, solutions.find(source => source.id === item.id));
  assert.equal(solutionSections[0].detailHref, '/solutions/teleoperation');
  assert.equal(solutionSections.slice(1).some(item => item.detailHref), false);
  assert.equal(solutionSections[0].content.name, 'SONIC Link');
});
test('Continuous sections reuse classified evidence without assigning footage to inspection', () => {
  const { sectionDemos } = load('src/lib/solution-sections');
  const { solutionDemos } = load('src/data/solution-demos');
  assert.equal(sectionDemos.inspection, undefined);
  assert.deepEqual(sectionDemos.teleoperation, ['wholebody-balance']);
  assert.deepEqual(sectionDemos.handling, ['wholebody-pick']);
  assert.deepEqual(sectionDemos.ai, ['dance-video-motion', 'music-motion']);
  const ids = Object.values(sectionDemos).flat();
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(solutionDemos.find(demo => demo.id === id));
  assert.match(solutionDemos.find(demo => demo.id === 'wholebody-pick').boundary, /人工遥操作/);
  assert.match(solutionDemos.find(demo => demo.id === 'music-motion').status, /仿真/);
});
