import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Animation paths must remain exact copies of the formal SVG, including wordmark outlines.
test('Header animation retains every original SVG path and viewBox', () => {
  const source = fs.readFileSync(new URL('../src/components/header-logo-paths.ts', import.meta.url), 'utf8');
  const paths = JSON.parse(source.slice(source.indexOf('{'), source.lastIndexOf(' as const;')));
  for (const [variant, file] of [['horizontal', 'one-g-horizontal.svg'], ['mark', 'one-g-symbol.svg']]) {
    const xml = fs.readFileSync(new URL(`../public/brand/${file}`, import.meta.url), 'utf8');
    const original = [...xml.matchAll(/<path\s+d="([^"]+)"/g)].map(match => match[1]);
    assert.equal(paths[variant].viewBox, /viewBox="([^"]+)"/.exec(xml)[1]);
    assert.equal(paths[variant].outer + paths[variant].inner, original[0]);
    assert.equal(paths[variant].symbol, original[0]);
    assert.deepEqual(paths[variant].words, original.slice(1));
  }
});

// Canonical absolute curve commands let us compare split paths without approximating curves.
function commands(d) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
  let i = 0, command, x = 0, y = 0, start;
  const result = [];
  const add = (a, b) => Math.round((a + b) * 1000000) / 1000000;
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) command = tokens[i++];
    const upper = command.toUpperCase();
    if (upper === 'Z') {
      if (x !== start[0] || y !== start[1]) result.push(['L', ...start]);
      [x, y] = start;
      continue;
    }
    const n = { M: 2, C: 6, H: 1, L: 2 }[upper];
    assert.ok(n, `Unexpected SVG command ${command}`);
    const v = tokens.slice(i, i + n).map(Number); i += n;
    const relative = command !== upper;
    if (upper === 'M') { [x, y] = relative ? [add(x, v[0]), add(y, v[1])] : v; start = [x, y]; continue; }
    if (upper === 'C') {
      const points = v.map((value, index) => relative ? add(index % 2 ? y : x, value) : value);
      result.push(['C', ...points]); [x, y] = points.slice(-2);
    } else {
      const end = upper === 'H' ? [relative ? add(x, v[0]) : v[0], y] : relative ? [add(x, v[0]), add(y, v[1])] : v;
      if (end[0] !== x || end[1] !== y) result.push(['L', ...end]);
      [x, y] = end;
    }
  }
  return result;
}

test('Staggered G segments preserve every exact original curve and connection', () => {
  const text = fs.readFileSync(new URL('../src/components/header-logo-paths.ts', import.meta.url), 'utf8');
  const paths = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf(' as const;')));
  for (const entry of Object.values(paths)) {
    const segments = ['main', 'connection', 'detail'].flatMap(name => commands(entry.innerSegments[name]));
    assert.deepEqual(segments, commands(entry.inner));
  }
});
