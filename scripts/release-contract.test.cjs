const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const file = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(file(p), 'utf8');

test('all five languages are registered', () => {
  const source = read('src/i18n/LanguageContext.tsx');

  for (const lang of [
    "'en'", "'zh'", "'ja'", "'ko'", "'es'"
  ]) {
    assert.ok(
      source.includes(lang),
      'Missing language: ' + lang
    );
  }

  for (const name of [
    'English', '中文', '日本語', '한국어', 'Español'
  ]) {
    assert.ok(
      source.includes(name),
      'Missing language name: ' + name
    );
  }
});

test('English is the initial default language', () => {
  const source = read('src/i18n/LanguageContext.tsx');

  assert.match(
    source,
    /useState<Language>\('en'\)/
  );
});

test('language preference is persisted', () => {
  const source = read('src/i18n/LanguageContext.tsx');

  assert.match(source, /AsyncStorage\.setItem/);
  assert.match(source, /AsyncStorage\.getItem/);
  assert.match(source, /updateAccountProfile/);
});

test('authentication screens exist', () => {
  for (const name of [
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'verify-2fa'
  ]) {
    assert.ok(
      fs.existsSync(
        file('src/app/(auth)/' + name + '.tsx')
      ),
      name + ' screen is missing'
    );
  }
});

test('all three onboarding steps exist', () => {
  for (const name of [
    'your-name',
    'preferences',
    'security'
  ]) {
    assert.ok(
      fs.existsSync(
        file('src/app/(setup)/' + name + '.tsx')
      ),
      name + ' step is missing'
    );
  }
});

test('new and old accounts have different routes', () => {
  const rootRoute = read('src/app/index.tsx');

  assert.match(rootRoute, /onboardingCompletedAt/);
  assert.match(rootRoute, /\/\(tabs\)\/home/);
  assert.match(rootRoute, /\/\(setup\)\//);
});

test('register supports duplicate email feedback', () => {
  const register = read('src/app/(auth)/register.tsx');

  assert.match(register, /duplicateAccountText/);
  assert.match(register, /status === 409/);
  assert.match(register, /forgot-password/);
});

test('account API supports profile updates', () => {
  const api = read('src/services/authApi.ts');

  assert.match(api, /updateProfile/);
  assert.match(api, /\/auth\/profile/);
});

test('existing 2FA entry remains available', () => {
  const security = read(
    'src/app/(tabs)/profile/security.tsx'
  );

  assert.match(
    security,
    /mfaSetup|mfaEnable|mfaStatus/
  );
});

test('existing password recovery remains available', () => {
  const api = read('src/services/authApi.ts');

  assert.match(api, /forgotPassword/);
  assert.match(api, /resetPassword/);
});
