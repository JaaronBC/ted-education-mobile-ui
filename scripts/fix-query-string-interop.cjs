'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '..');

function check(value, message) {
  if (!value) throw new Error(message);
}

const routerRequire = createRequire(
  path.join(root, 'node_modules/expo-router/package.json')
);

const entry = routerRequire.resolve('query-string');

const queryManifest = JSON.parse(
  fs.readFileSync(
    path.join(path.dirname(entry), 'package.json'),
    'utf8'
  )
);

check(
  queryManifest.version === '7.1.3',
  'Unexpected query-string version. Review compatibility patch.'
);

const queryRequire = createRequire(entry);

const decoderEntry =
  queryRequire.resolve('decode-uri-component');

const decoderManifest = JSON.parse(
  fs.readFileSync(
    path.join(path.dirname(decoderEntry), 'package.json'),
    'utf8'
  )
);

check(
  decoderManifest.version === '0.5.1',
  'Secure decoder version is not installed.'
);

const modules = fs.realpathSync(
  path.join(root, 'node_modules')
);

const resolved = fs.realpathSync(entry);

const relative = path.relative(modules, resolved);

check(
  !relative.startsWith('..') && !path.isAbsolute(relative),
  'Dependency resolved outside project.'
);

const before =
  "const decodeComponent = require('decode-uri-component');";

const after = [
  "// TED: bridge CommonJS to the patched ESM decoder.",
  "const decoderModule = require('decode-uri-component');",
  "const decodeComponent = typeof decoderModule === 'function'",
  "  ? decoderModule",
  "  : decoderModule.default;"
].join('\n');

const source = fs.readFileSync(entry, 'utf8');

if (source.includes(after)) {
  console.log('Query-string compatibility patch already applied.');
} else {
  check(
    source.split(before).length === 2,
    'Unexpected dependency source. Refusing to patch.'
  );

  fs.writeFileSync(
    entry,
    source.replace(before, after),
    'utf8'
  );

  console.log('Secure query-string compatibility patch applied.');
}

const decoder = queryRequire('decode-uri-component');

const decode = typeof decoder === 'function'
  ? decoder
  : decoder.default;

check(typeof decode === 'function',
  'Secure decoder export is incompatible.');

check(decode('hello%20world') === 'hello world',
  'Secure decoder smoke test failed.');
