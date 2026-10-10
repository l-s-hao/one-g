/* eslint-disable @typescript-eslint/no-require-imports -- Static dictionary coverage audit. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/i18n/dictionary.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const dictionaryExports = {};
new Function('exports', compiled)(dictionaryExports);
const dictionary = dictionaryExports.english;

test('Every source Chinese message has a local English translation', () => {
  const missing = new Set();
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { if (entry.name !== 'i18n') walk(file); continue; }
      if (!/\.tsx?$/.test(file) || entry.name === 'LanguageSwitch.tsx') continue;
      const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      function visit(node) {
        if (ts.isStringLiteralLike(node) || ts.isJsxText(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
          const text = node.text.trim();
          if (/[\u3400-\u9fff]/.test(text) && !(text in dictionary)) missing.add(`${path.relative(process.cwd(), file)}: ${text}`);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  walk(path.join(__dirname, '../src'));
  assert.deepEqual([...missing], [], 'Add missing messages to src/i18n/dictionary.ts');
  assert.ok(Object.values(dictionary).every(text => text && !/[\u3400-\u9fff]/.test(text)));
});
