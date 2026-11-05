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
test('About links resolve to the existing product, solution and category', () => {
  const { aboutNavigation: links } = load('src/lib/about-navigation');
  const { getProductById } = load('src/lib/products');
  const { solutions } = load('src/data/solutions');
  const { shopLinks } = load('src/data/site-navigation');
  assert.equal(links.dock, '/products/' + getProductById('robotdock').slug);
  assert.equal(links.teleoperation, solutions.find(item => item.id === 'teleoperation').detailHref);
  assert.ok(shopLinks.some(item => item.href === links.robots));
  assert.equal(links.teleoperationSection, '/solutions#teleoperation');
  assert.equal(links.platformRoute, '/about#platform-route');
  assert.equal(getProductById('sonic-link'), undefined);
});
test('About publishes only selected evidence and retains old entry points', () => {
  const page = fs.readFileSync('src/app/about/page.tsx', 'utf8');
  for (const id of ['our-vision','our-positioning','contact-title','platform-route','integration-layer','capabilities','platform-direction','contact']) assert.ok(page.includes('id="'+id+'"'));
  assert.equal(page.includes('id="team-practice"'), false);
  assert.equal(/西溪湿地|康养机构|高压线路/.test(page), false);
  assert.match(page, /ids=\{\["wholebody-balance"\]\}/);
  assert.match(page, /<LanyardBrandSection/);
  assert.match(page, /entry="about"/);
  const { solutionDemos } = load('src/data/solution-demos');
  assert.match(solutionDemos.find(d=>d.id==='wholebody-balance').boundary, /研究演示/);
});

test('About chapter registry preserves published order and legacy hash mapping', () => {
  const { publishedAboutChapters: chapters, aboutChapterIndex } = load('src/data/about-chapters');
  assert.deepEqual(chapters.map(c => c.id), ['company-introduction','our-vision','platform-route','capabilities','contact']);
  assert.equal(new Set(chapters.flatMap(c => c.anchors)).size, chapters.flatMap(c => c.anchors).length);
  for (const [hash, expected] of [['#integration-layer',2],['#our-positioning',2],['#platform-route',2],['#contact-title',4],['#platform-direction',4],['#capabilities',3],['#our-vision',1]]) assert.equal(aboutChapterIndex(hash),expected);
  assert.equal(aboutChapterIndex('#team-practice'),-1);
  assert.equal(aboutChapterIndex('#invalid'),-1);
  const hero = fs.readFileSync('src/components/AboutHero.tsx','utf8');
  assert.doesNotMatch(hero,/ScrollExpand|ABOUT ONE-G/);
  assert.match(hero,/brandCopy.slogan/);
});
