'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '..');

const routerRequire = createRequire(
  path.join(root, 'node_modules/expo-router/package.json')
);

const queryEntry = routerRequire.resolve('query-string');

const queryRequire = createRequire(queryEntry);

const qs = routerRequire('query-string');

test('Expo Router resolves the patched decoder', () => {
  const entry = queryRequire.resolve('decode-uri-component');

  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(path.dirname(entry), 'package.json'),
      'utf8'
    )
  );

  assert.equal(manifest.version, '0.5.1');
});

test('query parser decodes ordinary URL parameters', () => {
  const value = qs.parse('name=hello%20world&active=true');

  assert.equal(value.name, 'hello world');
  assert.equal(value.active, 'true');
});

test('query parser preserves multilingual characters', () => {
  const value = 'Unicode \u4e2d\u6587 \u65e5\u672c\u8a9e';

  assert.equal(
    qs.parse('value=' + encodeURIComponent(value)).value,
    value
  );
});

test('query parser handles repeated parameters', () => {
  const result = qs.parse('id=1&id=2');

  assert.deepEqual(result.id, ['1', '2']);
});

test('query parser handles a malformed escape safely', () => {
  const value = qs.parse('value=%ZZ');

  assert.equal(typeof value.value, 'string');
});

test('URL parsing preserves fragment and query values', () => {
  const value = qs.parseUrl(
    'https://example.invalid/profile?tab=security#details',
    { parseFragmentIdentifier: true }
  );

  assert.equal(value.url, 'https://example.invalid/profile');
  assert.equal(value.query.tab, 'security');
  assert.equal(value.fragmentIdentifier, 'details');
});

test('query serializer and parser round-trip values', () => {
  const original = {
    name: 'hello world',
    tab: 'security',
    count: '2'
  };

  const result = qs.parse(qs.stringify(original));

  assert.deepEqual({ ...result }, original);
});

test('query parser does not modify Object.prototype', () => {
  const parsed = qs.parse('__proto__=test&constructor=test');

  assert.equal(Object.getPrototypeOf(parsed), null);
  assert.equal(({}).test, undefined);
});

test('Expo fingerprint resolves secure minimatch', () => {
  const requireFingerprint = createRequire(
    path.join(
      root,
      'node_modules/@expo/fingerprint/package.json'
    )
  );

  const minimatch = requireFingerprint('minimatch');

  assert.equal(typeof minimatch.minimatch, 'function');

  assert.equal(
    minimatch.minimatch('src/example.ts', 'src/**/*.ts'),
    true
  );

  assert.equal(
    minimatch.minimatch('README.md', 'src/**/*.ts'),
    false
  );

  const packagePath =
    requireFingerprint.resolve('minimatch/package.json');

  const manifest = JSON.parse(
    fs.readFileSync(packagePath, 'utf8')
  );

  assert.equal(manifest.version, '11.0.9');
});
