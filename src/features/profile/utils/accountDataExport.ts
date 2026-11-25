import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import type { AccountDataExport } from '../api/accountDataApi';
import { sessionGeneration } from '../../../services/sessionTokens';

const MAX_EXPORT_BYTES = 2 * 1024 * 1024;

function checkedRecord(
  value: unknown,
  allowed: readonly string[],
  required: readonly string[] = allowed,
): Record<string, unknown> {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    throw new Error('Invalid account export.');
  }

  const record = value as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) {
      throw new Error('Unexpected account export field.');
    }
  }

  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      throw new Error('Incomplete account export.');
    }
  }

  return record;
}

function scalarRecord(
  value: unknown,
  allowed: readonly string[],
  required: readonly string[] = allowed,
): Record<string, unknown> {
  const record = checkedRecord(value, allowed, required);

  for (const item of Object.values(record)) {
    if (
      item !== null &&
      typeof item !== 'string' &&
      typeof item !== 'number' &&
      typeof item !== 'boolean'
    ) {
      throw new Error('Invalid account export field.');
    }
  }

  return record;
}

function validateExport(
  data: AccountDataExport,
  expectedAccountId: string,
): string {
  checkedRecord(
    data,
    [
      'formatVersion',
      'exportedAt',
      'scope',
      'account',
      'connectedAccounts',
      'security',
      'completeness',
      'limits',
    ],
    [
      'formatVersion',
      'exportedAt',
      'scope',
      'account',
      'connectedAccounts',
      'security',
      'completeness',
    ],
  );

  if (
    !expectedAccountId ||
    data.account?.id !== expectedAccountId ||
    data.scope !== 'account-data-only' ||
    (data.formatVersion !== 1 && data.formatVersion !== 2) ||
    typeof data.exportedAt !== 'string' ||
    !Number.isFinite(Date.parse(data.exportedAt))
  ) {
    throw new Error('Invalid account export.');
  }

  const profileKeys = [
    'id',
    'email',
    'fullName',
    'gender',
    'role',
    'preferredLanguage',
    'fontScale',
    'highContrast',
    'onboardingCompletedAt',
    'emailVerifiedAt',
    'createdAt',
    'updatedAt',
  ];

  if (data.formatVersion === 2) {
    profileKeys.push('onboardingStep');
  }

  scalarRecord(data.account, profileKeys);

  if (
    !Array.isArray(data.connectedAccounts) ||
    data.connectedAccounts.length > 10
  ) {
    throw new Error('Invalid account export.');
  }

  for (const account of data.connectedAccounts) {
    scalarRecord(account, [
      'provider',
      'createdAt',
    ]);
  }

  checkedRecord(data.security, [
    'mfaEnabled',
    'mfaEnabledAt',
    'sessions',
    'recentEvents',
  ]);

  if (
    typeof data.security.mfaEnabled !== 'boolean' ||
    (
      data.security.mfaEnabledAt !== null &&
      typeof data.security.mfaEnabledAt !== 'string'
    )
  ) {
    throw new Error('Invalid account export.');
  }

  if (
    !Array.isArray(data.security.sessions) ||
    data.security.sessions.length > 200 ||
    !Array.isArray(data.security.recentEvents) ||
    data.security.recentEvents.length > 1000
  ) {
    throw new Error('Invalid account export.');
  }

  const sessionKeys = [
    'createdAt',
    'updatedAt',
    'expiresAt',
    'absoluteExpiresAt',
    'revokedAt',
  ];

  if (data.formatVersion === 2) {
    sessionKeys.push(
      'devicePlatform',
      'lastActiveAt',
    );
  }

  for (const session of data.security.sessions) {
    scalarRecord(session, sessionKeys);
  }

  for (const event of data.security.recentEvents) {
    scalarRecord(event, ['type', 'createdAt']);
  }

  scalarRecord(data.completeness, [
    'sessionsTruncated',
    'eventsTruncated',
    'medicalRecordsIncluded',
    'avatarFileIncluded',
  ]);

  if (
    typeof data.completeness.sessionsTruncated !== 'boolean' ||
    typeof data.completeness.eventsTruncated !== 'boolean' ||
    data.completeness.medicalRecordsIncluded !== false ||
    data.completeness.avatarFileIncluded !== false
  ) {
    throw new Error('Unexpected account export scope.');
  }

  if (data.formatVersion === 2) {
    scalarRecord(data.limits, [
      'maximumSessions',
      'maximumSecurityEvents',
      'securityEventWindowDays',
    ]);

    if (
      data.limits?.maximumSessions !== 200 ||
      data.limits.maximumSecurityEvents !== 1000 ||
      data.limits.securityEventWindowDays !== 90
    ) {
      throw new Error('Invalid account export limits.');
    }
  } else if (data.limits !== undefined) {
    throw new Error('Unexpected export version fields.');
  }

  const content = JSON.stringify(data, null, 2);

  const size = encodeURIComponent(content)
    .replace(/%[0-9A-F]{2}/gi, 'x')
    .length;

  if (size > MAX_EXPORT_BYTES) {
    throw new Error('Account export is too large.');
  }

  return content;
}

export async function saveAccountData(
  data: AccountDataExport,
  epoch: number,
  isActive: () => boolean,
  expectedAccountId: string,
): Promise<boolean> {
  function assertCurrent() {
    if (
      epoch !== sessionGeneration() ||
      !isActive()
    ) {
      throw new Error('Session changed.');
    }
  }

  assertCurrent();

  if (Platform.OS !== 'android') {
    throw new Error(
      'File export is currently supported on Android.',
    );
  }

  const content = validateExport(data, expectedAccountId);

  const storage =
    FileSystem.StorageAccessFramework;

  const permission =
    await storage.requestDirectoryPermissionsAsync();

  assertCurrent();

  if (!permission.granted) {
    return false;
  }

  const filename =
    'TED-account-data-' +
    new Date().toISOString()
      .replace(/[:.]/g, '-') +
    '.json';

  const uri = await storage.createFileAsync(
    permission.directoryUri,
    filename,
    'application/json',
  );

  try {
    assertCurrent();

    await FileSystem.writeAsStringAsync(
      uri,
      content,
      {
        encoding: FileSystem.EncodingType.UTF8,
      },
    );

    assertCurrent();
  } catch (error) {
    await FileSystem.deleteAsync(uri, {
      idempotent: true,
    }).catch(() => {
      console.warn(
        'Incomplete account export cleanup could not be confirmed.',
      );
    });

    throw error;
  }

  return true;
}
