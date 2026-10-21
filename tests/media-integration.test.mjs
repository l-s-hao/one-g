import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const inventory = JSON.parse(readFileSync(path.join(root, 'src/data/media-sources.json')));
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');

test('Every selected public derivative matches its source ledger and authorized placement', () => {
  for (const asset of inventory.assets.filter(item => item.outputs?.length)) {
    assert.equal(asset.authorization.status, 'user-confirmed-display-permission');
    assert.ok(asset.pagePlacements.length);
    assert.ok(asset.descriptionEvidence.length);
    assert.ok(asset.sources.every(source => /^[a-f0-9]{40}$/.test(source.commit)));
    if (asset.type === 'video') {
      assert.equal(asset.decodeStatus, 'complete');
      assert.match(asset.reviewStatus, /timeline-visually-reviewed/);
      assert.ok(asset.streams.some(stream => stream.includes('Audio:')));
    }
    for (const output of asset.outputs) {
      assert.ok(output.path.startsWith('/one-g/'));
      const file = path.join(root, 'public', output.path.slice('/one-g/'.length));
      assert.equal(statSync(file).size, output.bytes);
      assert.equal(hash(file), output.sha256);
      assert.equal(output.derivedFrom, asset.sha256);
    }
  }
});

test('Existing source images remain intact; public video content is not duplicated', () => {
  for (const asset of inventory.assets.filter(item => item.existingBeforeTask)) {
    const file = path.join(root, 'public', asset.targetPublicPath.slice('/one-g/'.length));
    assert.equal(hash(file), asset.sha256, 'Original image changed: ' + file);
  }
  const hashes = new Set();
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(mp4|webm|mov|m4v)$/i.test(file)) {
        const contentHash = hash(file);
        assert.ok(!hashes.has(contentHash), 'Duplicate public video: ' + file);
        hashes.add(contentHash);
      }
    }
  }
  walk(path.join(root, 'public'));
});

test('Research mapping and simulation classification remain explicit', () => {
  const selected = inventory.assets.filter(item => item.type === 'video' && item.outputs?.length);
  const music = selected.find(item => item.sources.some(source => source.path.endsWith('/music-motion.mp4')));
  assert.equal(music.classification, 'simulation-research');
  assert.match(music.solutionRelationship, /not-confirmed-as-SONIC-Link/);
  const pick = selected.find(item => item.sources.some(source => source.path.endsWith('/wholebody-pick.mp4')));
  assert.ok(pick.sources.some(source => source.repository === 'one-g-website'));
  assert.ok(pick.sources.some(source => source.repository === 'g1-humanoid-teleoperation'));
  assert.equal(pick.pagePlacements.length, 1);
  assert.equal(selected.some(item => item.pagePlacements.some(page => page.includes('inspection'))), false);
});
