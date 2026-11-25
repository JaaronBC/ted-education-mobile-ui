const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function harness(platform = 'android') {
  let epoch = 1;
  const calls = [];

  const files = {
    StorageAccessFramework: {
      requestDirectoryPermissionsAsync: async () => {
        calls.push('picker');
        return {granted:true,directoryUri:'content://test'};
      },
      createFileAsync: async () => {
        calls.push('create');
        return 'content://test/file';
      },
    },
    EncodingType:{UTF8:'utf8'},
    writeAsStringAsync: async (_uri, text) => {
      calls.push(['write',JSON.parse(text)]);
    },
    deleteAsync: async () => {
      calls.push('delete');
    },
  };

  const source = fs.readFileSync(
    path.join(__dirname,'../src/features/profile/utils/accountDataExport.ts'),
    'utf8'
  );

  const compiled = ts.transpileModule(source,{
    compilerOptions:{
      module:ts.ModuleKind.CommonJS,
      target:ts.ScriptTarget.ES2022
    }
  }).outputText;

  const exports = {};

  vm.runInNewContext(compiled,{
    exports,
    require(name){
      if(name==='react-native')return {Platform:{OS:platform}};
      if(name==='expo-file-system/legacy')return files;
      if(name==='../../../services/sessionTokens')return {sessionGeneration:()=>epoch};
      throw Error('Unexpected import: '+name);
    },
    console
  });

  return {
    files,
    calls,
    save:exports.saveAccountData,
    changeSession:()=>epoch++
  };
}

function data() {
  const at = '2026-11-01T00:00:00.000Z';

  return {
    formatVersion:2,
    exportedAt:at,
    scope:'account-data-only',
    limits:{
      maximumSessions:200,
      maximumSecurityEvents:1000,
      securityEventWindowDays:90
    },
    account:{
      id:'owner',
      email:'patient@example.test',
      fullName:'Patient',
      gender:null,
      role:'PATIENT',
      preferredLanguage:'en',
      fontScale:1,
      highContrast:false,
      onboardingStep:3,
      onboardingCompletedAt:at,
      emailVerifiedAt:at,
      createdAt:at,
      updatedAt:at
    },
    connectedAccounts:[],
    security:{
      mfaEnabled:false,
      mfaEnabledAt:null,
      sessions:[],
      recentEvents:[]
    },
    completeness:{
      sessionsTruncated:false,
      eventsTruncated:false,
      medicalRecordsIncluded:false,
      avatarFileIncluded:false
    }
  };
}

test('valid V2 export writes only approved JSON',async()=>{
  const h=harness();
  const input=data();
  assert.equal(await h.save(input,1,()=>true,'owner'),true);
  assert.deepEqual(h.calls,['picker','create',['write',input]]);
});

test('V1 remains compatible',async()=>{
  const h=harness();
  const input=data();
  input.formatVersion=1;
  delete input.limits;
  delete input.account.onboardingStep;
  assert.equal(await h.save(input,1,()=>true,'owner'),true);
});

for(const [name,mutate] of [
  ['credential field',d=>d.account.passwordHash='not-allowed'],
  ['foreign account',d=>d.account.id='other'],
  ['unknown export version',d=>d.formatVersion=3],
  ['over-limit events',d=>d.security.recentEvents=Array(1001).fill({type:'x',createdAt:d.exportedAt})],
  ['medical scope',d=>d.completeness.medicalRecordsIncluded=true],
  ['large export',d=>d.account.fullName='x'.repeat(2*1024*1024)]
]) {
  test('rejects '+name+' before opening storage',async()=>{
    const h=harness();
    const input=data();
    mutate(input);

    await assert.rejects(h.save(input,1,()=>true,'owner'));
    assert.deepEqual(h.calls,[]);
  });
}

test('directory denial does not create a file',async()=>{
  const h=harness();

  h.files.StorageAccessFramework.requestDirectoryPermissionsAsync=async()=>({granted:false});

  assert.equal(await h.save(data(),1,()=>true,'owner'),false);
  assert.deepEqual(h.calls,[]);
});

test('session change during directory selection prevents file creation',async()=>{
  const h=harness();

  h.files.StorageAccessFramework.requestDirectoryPermissionsAsync=async()=>{
    h.changeSession();
    return {granted:true,directoryUri:'content://test'};
  };

  await assert.rejects(h.save(data(),1,()=>true,'owner'),/Session changed/);
  assert.deepEqual(h.calls,[]);
});

test('partial write failure removes the file',async()=>{
  const h=harness();
  h.files.writeAsStringAsync=async()=>{throw Error('write failed');};

  await assert.rejects(h.save(data(),1,()=>true,'owner'),/write failed/);
  assert.deepEqual(h.calls,['picker','create','delete']);
});

test('session change after write removes stale export',async()=>{
  const h=harness();
  h.files.writeAsStringAsync=async()=>h.changeSession();

  await assert.rejects(h.save(data(),1,()=>true,'owner'),/Session changed/);
  assert.deepEqual(h.calls,['picker','create','delete']);
});

test('unsupported platform does not request storage',async()=>{
  const h=harness('ios');

  await assert.rejects(h.save(data(),1,()=>true,'owner'),/Android/);
  assert.deepEqual(h.calls,[]);
});
