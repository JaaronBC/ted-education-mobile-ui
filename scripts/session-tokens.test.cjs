const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function deferred() {
  let resolve;
  const promise = new Promise(r => {
    resolve = r;
  });
  return { promise, resolve };
}

function credentials(name) {
  return {
    accessToken: `${name}-access`,
    refreshToken: `${name}-refresh`,
    expiresIn: 900,
  };
}

function loadTokens(fetchMock, beforeWrite) {
  const storage = new Map();

  const secureStore = {
    getItemAsync: async key =>
      storage.get(key) ?? null,

    setItemAsync: async (key, value) => {
      if (beforeWrite) {
        await beforeWrite(key, value);
      }

      storage.set(key, value);
    },

    deleteItemAsync: async key => {
      storage.delete(key);
    },
  };

  const source = fs.readFileSync(
    path.join(
      __dirname,
      '../src/services/sessionTokens.ts'
    ),
    'utf8'
  );

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const exports = {};

  vm.runInNewContext(compiled, {
    exports,
    require: name => {
      if (name === 'expo-secure-store') {
        return secureStore;
      }

      throw new Error('Unexpected import: ' + name);
    },
    process: {
      env: {
        EXPO_PUBLIC_API_URL: 'https://example.invalid',
      },
    },
    fetch: fetchMock ?? (() => {
      throw new Error('Unexpected network request');
    }),
    AbortController,
    setTimeout,
    clearTimeout,
  });

  return { api: exports, storage };
}

function establish(api, name) {
  return api.establishSession(
    credentials(name),
    api.sessionGeneration(),
    () => {}
  );
}

test('new login advances generation', async () => {
  const { api } = loadTokens();
  const before = api.sessionGeneration();

  const result = await establish(api, 'alice');

  assert.equal(result.epoch, before + 1);
  assert.equal(
    await api.getValidAccessToken(),
    'alice-access'
  );
});

test('replacement invalidates the previous generation', async () => {
  const { api } = loadTokens();

  const alice = await establish(api, 'alice');
  const bob = await establish(api, 'bob');

  assert.equal(bob.epoch, alice.epoch + 1);

  assert.equal(
    await api.getValidAccessToken(),
    'bob-access'
  );
});

test('normal token storage preserves generation', async () => {
  const { api } = loadTokens();

  await establish(api, 'alice');

  const epoch = api.sessionGeneration();

  await api.storeSession(credentials('alice-new'));

  assert.equal(api.sessionGeneration(), epoch);

  assert.equal(
    await api.getValidAccessToken(),
    'alice-new-access'
  );
});

test('stale login generation cannot commit', async () => {
  const { api } = loadTokens();

  const oldEpoch = api.sessionGeneration();

  await establish(api, 'bob');

  await assert.rejects(async () => {
    await api.establishSession(
      credentials('alice'),
      oldEpoch,
      () => {}
    );
  }, /Session changed/);

  assert.equal(
    await api.getValidAccessToken(),
    'bob-access'
  );
});

test('cancelled login cannot leave committed credentials', async () => {
  const started = deferred();
  const pending = deferred();

  let cancelled = false;

  const { api, storage } = loadTokens(
    undefined,
    async (key, value) => {
      if (
        key === 'ted_session_v1' &&
        JSON.parse(value).accessToken
      ) {
        started.resolve();
        await pending.promise;
      }
    }
  );

  const request = api.establishSession(
    credentials('alice'),
    api.sessionGeneration(),
    () => {
      if (cancelled) {
        throw new Error('Login cancelled');
      }
    }
  );

  const rejection = assert.rejects(
    request,
    /Login cancelled/
  );

  await started.promise;

  cancelled = true;
  pending.resolve();

  await rejection;

  assert.equal(storage.size, 1);

  const persisted = JSON.parse(
    storage.get('ted_session_v1')
  );

  assert.equal(persisted.signedOut, true);
  assert.equal(persisted.accessToken, undefined);
  assert.equal(persisted.refreshToken, undefined);
  assert.equal(await api.getValidAccessToken(), null);
});

test('old refresh cannot overwrite a replacement session', async () => {
  const started = deferred();
  const pending = deferred();

  const { api } = loadTokens(async () => {
    started.resolve();
    return pending.promise;
  });

  await establish(api, 'alice');

  const refresh = api.refreshAccessToken();

  const rejection = assert.rejects(
    refresh,
    /Session changed/
  );

  await started.promise;

  await establish(api, 'bob');

  pending.resolve({
    ok: true,
    status: 200,
    json: async () => credentials('alice-new'),
  });

  await rejection;

  assert.equal(
    await api.getValidAccessToken(),
    'bob-access'
  );
});

test('concurrent refresh requests share one network call', async () => {
  const started = deferred();
  const pending = deferred();

  let calls = 0;

  const { api } = loadTokens(async () => {
    calls++;
    started.resolve();
    return pending.promise;
  });

  await establish(api, 'alice');

  const epoch = api.sessionGeneration();

  const first = api.refreshAccessToken();

  await started.promise;

  const second = api.refreshAccessToken();

  pending.resolve({
    ok: true,
    status: 200,
    json: async () => credentials('alice-new'),
  });

  const results = await Promise.all([first, second]);

  assert.equal(calls, 1);
  assert.equal(results[0], 'alice-new-access');
  assert.equal(results[1], 'alice-new-access');
  assert.equal(api.sessionGeneration(), epoch);
});

test('logout clears stored credentials', async () => {
  const { api, storage } = loadTokens();

  await establish(api, 'alice');

  const epoch = api.sessionGeneration();

  await api.clearSessionTokens();

  assert.equal(storage.size, 1);

  const persisted = JSON.parse(
    storage.get('ted_session_v1')
  );

  assert.equal(persisted.signedOut, true);
  assert.equal(persisted.accessToken, undefined);
  assert.equal(persisted.refreshToken, undefined);
  assert.equal(await api.getValidAccessToken(), null);
  assert.ok(api.sessionGeneration() > epoch);
});