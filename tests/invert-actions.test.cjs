/* eslint-disable @typescript-eslint/no-require-imports -- Compile the shared presentation layer in isolation. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const root = path.resolve(__dirname, '..');
const output = ts.transpileModule(fs.readFileSync(path.join(root, 'src/i18n/Elements.tsx'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const exportsForTest = {};
const requireStub = name => name === './LocaleProvider' ? { translate: text => text, useLocale: () => ({ locale: 'zh-CN' }) }
  : name === 'next/link' || name === 'next/image' ? { __esModule: true, default: name }
  : require(name);
new Function('require', 'exports', output)(requireStub, exportsForTest);

test('Explicit appearance preserves native form props, ref, events and label layout', () => {
  const ref = React.createRef(); const onClick = () => {}; const onChange = () => {};
  const button = exportsForTest.LButton({ effect: 'invert', intent: 'ordinary', ref, type: 'submit', form: 'needs', name: 'action', value: 'preview', disabled: true, 'aria-busy': true, 'data-test-id': 'primary', onClick, onChange, children: '验证中…' });
  assert.equal(button.type, 'button');
  for (const [key, value] of Object.entries({ ref, type: 'submit', form: 'needs', name: 'action', value: 'preview', disabled: true, 'aria-busy': true, onClick, onChange })) assert.equal(button.props[key], value);
  assert.equal(button.props['data-button-effect'], 'invert');
  assert.equal(button.props['data-invert-variant'], 'primary');
  assert.equal(button.props.children.type, 'span');
  assert.equal(button.props.children.props.children, '验证中…');
  assert.equal('effect' in button.props, false);
  assert.equal(exportsForTest.LButton({ children: '小控件' }).props['data-button-effect'], undefined);
});

test('Enabled actions retain native handlers; aria-disabled actions block pointer and keyboard', () => {
  for (const Component of [exportsForTest.LocalizedLink, exportsForTest.LA, exportsForTest.LButton]) {
    let clicks = 0, keys = 0; const click = () => clicks++; const key = () => keys++;
    const href = Component === exportsForTest.LA ? '/one-g/products/' : { pathname: '/products', query: { category: 'arm' } };
    const target = Component === exportsForTest.LButton ? { type: 'button' } : { href };
    const props = { ...target, effect: 'invert', onClick: click, onKeyDown: key, children: '查看' };
    const enabled = Component(props); assert.equal(enabled.props.href, target.href); assert.equal(enabled.props.onClick, click);
    const disabled = Component({ ...props, 'aria-disabled': true });
    let prevented = 0, stopped = 0; const event = { preventDefault: () => prevented++, stopPropagation: () => stopped++ };
    disabled.props.onClick(event);
    for (const value of ['Enter', ' ']) disabled.props.onKeyDown({ ...event, key: value });
    disabled.props.onKeyDown({ ...event, key: 'Tab' });
    assert.equal(clicks, 0); assert.equal(keys, 1); assert.equal(prevented, 3); assert.equal(stopped, 3); assert.equal(disabled.props.href, target.href);
  }
});

test('No source runtime still imports the removed dedicated renderer or opts into the retired effect', () => {
  function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(tsx?|css)$/.test(file)) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /components\/specular|SpecularEdge|specular-edge|data-specular-host|effect=["']specular["']/);
  } }
  walk(path.join(root, 'src'));
  assert.equal(fs.existsSync(path.join(root, 'src/components/specular')), false);
});

 test('Secondary Link presentation consumes appearance props without changing navigation or native props', () => {
  const ref = React.createRef();
  for (const Component of [exportsForTest.LocalizedLink, exportsForTest.LA, exportsForTest.LButton]) {
    const element = Component({ ref, effect: 'invert', effectVariant: 'secondary', effectSurface: 'card', href: '/products?from=dialog', type: 'button', children: '返回编辑' });
    assert.equal(element.props['data-invert-variant'], 'secondary');
    assert.equal(element.props['data-invert-surface'], 'card');
    assert.equal(element.props.href, '/products?from=dialog');
    assert.equal(element.props.ref, ref);
    for (const key of ['effect', 'effectVariant', 'effectSurface']) assert.equal(key in element.props, false);
  }
});
