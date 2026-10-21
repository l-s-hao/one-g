import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/fonts/sources.json'), 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('All distributed binaries match acquisition hashes and are real WOFF2 files', () => {
  for (const font of [manifest.inter, ...manifest.noto.files]) {
    const file = path.join(root, font.target);
    assert.equal(fs.readFileSync(file).subarray(0, 4).toString(), 'wOF2', font.target);
    assert.equal(fs.statSync(file).size, font.bytes, font.target);
    assert.equal(hash(file), font.sha256, font.target);
    assert.match(font.url, /^https:\/\/(raw\.githubusercontent\.com\/rsms\/inter|fonts\.gstatic\.com\/s\/notosanssc)\//);
  }
});

test('Publisher Chinese coverage, weight ranges and swap mapping survive local hosting intact', () => {
  const before = fs.readFileSync(path.join(root, 'public/fonts/noto-sans-sc/google-fonts-original.css'), 'utf8');
  const after = fs.readFileSync(path.join(root, 'src/app/fonts.css'), 'utf8');
  const faces = text => [...text.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => match[1]);
  const originals = faces(before), local = faces(after).slice(1);
  assert.equal(local.length, originals.length);
  const field = (face, name) => face.match(new RegExp(name + ':\\s*([^;]+);'))?.[1];
  originals.forEach((face, i) => {
    for (const name of ['font-family', 'font-style', 'font-weight', 'font-display', 'unicode-range']) assert.equal(field(local[i], name), field(face, name));
    assert.equal(field(local[i], 'font-weight'), '100 900');
    const file = manifest.noto.files[i];
    assert.ok(local[i].includes('/one-g/fonts/noto-sans-sc/' + file.filename));
  });
  assert.doesNotMatch(after, /https?:|data:|local\(/);
});

test('Complete original license notices accompany both distributed font families', () => {
  for (const family of [manifest.inter, manifest.noto]) {
    const file = path.join(root, family.license), license = fs.readFileSync(file, 'utf8');
    assert.equal(hash(file), family.licenseSha256);
    assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
    assert.match(license, /Copyright/);
    assert.match(license, /PERMISSION/);
    assert.match(license, /TERMINATION/);
    assert.match(license, /DISCLAIMER/);
  }
  assert.match(fs.readFileSync(path.join(root, manifest.noto.license), 'utf8'), /Reserved Font Name 'Source'/);
});
