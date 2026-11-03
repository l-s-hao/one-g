import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createBrowserEvidence } from './helpers/browser-evidence.mjs';

const library = await import(process.env.ONE_G_PLAYWRIGHT || 'playwright-core');
const chromium = library.chromium || library.default?.chromium;
const browser = await chromium.launch({ headless: true, executablePath: process.env.ONE_G_BROWSER });
const snapshot = dir => Object.fromEntries(fs.readdirSync(dir).map(file => [file, fs.readFileSync(path.join(dir, file)).toString('base64')]));
try {
  const page = await browser.newPage();
  const failed = createBrowserEvidence({ name: 'retention-probe', condition: 'retention-probe', artificial: true });
  await failed.attach(page);
  await page.setContent('<main><h1>Intentional retention probe</h1><input type="password" value="Synthetic-Retention-Secret!"></main>');
  failed.record('probe');
  failed.log('password: Synthetic-Retention-Secret!; code: 004271; cookie: synthetic-session\n');
  console.error('INTENTIONAL_RETENTION_FAILURE: not a logout reproduction');
  await failed.fail(new Error('Intentional evidence-retention probe'), page);
  assert.equal(JSON.parse(fs.readFileSync(path.join(failed.dir, 'run.json'))).result, 'failed');
  assert.ok(fs.existsSync(path.join(failed.dir, 'failure.png')));
  const preserved = snapshot(failed.dir);
  const passed = createBrowserEvidence({ name: 'retention-probe', condition: 'retention-probe', artificial: true });
  passed.record('probe');
  console.log('INTENTIONAL_RETENTION_SUCCESS');
  passed.finish('passed');
  assert.notEqual(passed.dir, failed.dir);
  assert.deepEqual(snapshot(failed.dir), preserved);
  assert.equal(JSON.parse(fs.readFileSync(path.join(passed.dir, 'run.json'))).result, 'passed');
  const root = path.dirname(passed.dir);
  const latest = JSON.parse(fs.readFileSync(path.join(root, 'latest.json')));
  assert.equal(latest.directory, path.basename(passed.dir));
  assert.equal(latest.artificial, true);
  assert.ok(!fs.readFileSync(path.join(failed.dir, 'output.log'), 'utf8').includes('Synthetic-Retention-Secret!'));
  fs.writeFileSync(path.join(root, `${path.basename(failed.dir)}-verification.json`), JSON.stringify({ artificial: true, logoutReproduced: false, failedDirectory: path.basename(failed.dir), passedDirectory: path.basename(passed.dir), originalFilesUnchanged: true }, null, 2));
  console.log('PASS separate directories, original failure files byte-identical, screenshot masked, latest points to success');
} finally { await browser.close(); }
