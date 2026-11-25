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

function loadClient(fetchMock) {
  let generation = 0;
  let refreshCalls = 0;

  const sessionTokens = {
    sessionGeneration: () => generation,
    storedAccessToken: async () => 'old-token',
    getValidAccessToken: async () => 'old-token',
    refreshAccessToken: async () => {
      refreshCalls++;
      return 'refreshed-token';
    },
  };

  const source = fs.readFileSync(
    path.join(__dirname, '../src/services/apiClient.ts'),
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
      if (name === './sessionTokens') {
        return sessionTokens;
      }
      if (name === 'react-native') {
        return { Platform: { OS: 'android' } };
      }
      throw new Error('Unexpected import: ' + name);
    },
    process: {
      env: {
        EXPO_PUBLIC_API_URL: 'https://example.invalid',
      },
    },
    fetch: fetchMock,
    AbortController,
    setTimeout,
    clearTimeout,
  });

  return {
    apiRequest: exports.apiRequest,
    changeSession: () => generation++,
    refreshCalls: () => refreshCalls,
  };
}

function response(status, data) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(data),
  };
}

test('normal authenticated request succeeds', async () => {
  const client = loadClient(async () =>
    response(200, { id: 'alice' })
  );

  const result = await client.apiRequest(
    '/auth/profile',
    { token: 'old-token' }
  );

  assert.equal(result.id, 'alice');
});

test('late response is rejected after session change', async () => {
  const started = deferred();
  const pending = deferred();

  const client = loadClient(async () => {
    started.resolve();
    return pending.promise;
  });

  const request = client.apiRequest(
    '/auth/profile',
    { token: 'old-token' }
  );

  await started.promise;

  client.changeSession();

  pending.resolve(response(200, { id: 'alice' }));

  await assert.rejects(request, {
    name: 'SessionChangedError',
  });
});

test('stale 401 cannot refresh or retry', async () => {
  const started = deferred();
  const pending = deferred();
  let requests = 0;

  const client = loadClient(async () => {
    requests++;
    started.resolve();
    return pending.promise;
  });

  const request = client.apiRequest(
    '/auth/profile',
    {
      method: 'PATCH',
      token: 'old-token',
      body: { fullName: 'Alice' },
    }
  );

  await started.promise;

  client.changeSession();

  pending.resolve(response(401, {
    message: 'Unauthorized',
  }));

  await assert.rejects(request, {
    name: 'SessionChangedError',
  });

  assert.equal(client.refreshCalls(), 0);
  assert.equal(requests, 1);
});

test('401 refresh works in the same session', async () => {
  const tokens = [];

  const client = loadClient(async (url, options) => {
    tokens.push(options.headers.Authorization);

    if (tokens.length === 1) {
      return response(401, {});
    }

    return response(200, { id: 'alice' });
  });

  const result = await client.apiRequest(
    '/auth/profile',
    { token: 'old-token' }
  );

  assert.equal(result.id, 'alice');
  assert.equal(client.refreshCalls(), 1);

  assert.deepEqual(tokens, [
    'Bearer old-token',
    'Bearer refreshed-token',
  ]);
});

test('unauthenticated request remains supported', async () => {
  const client = loadClient(async () =>
    response(200, { success: true })
  );

  const result = await client.apiRequest(
    '/auth/login',
    { method: 'POST' }
  );

  assert.equal(result.success, true);
});

test('session change during token refresh prevents retry', async () => {
  const started = deferred();
  const pending = deferred();
  let requests = 0;

  const client = loadClient(async () => {
    requests++;
    started.resolve();
    return pending.promise;
  });

  const request = client.apiRequest(
    '/auth/profile',
    { token: 'old-token' }
  );

  await started.promise;

  pending.resolve(response(401, {}));

  queueMicrotask(() => client.changeSession());

  await assert.rejects(request, {
    name: 'SessionChangedError',
  });

  assert.equal(requests, 1);
});