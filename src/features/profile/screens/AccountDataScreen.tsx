import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import type { Href } from 'expo-router';
import { useLayoutEffect,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  AppState,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  Download,
  Trash2,
} from 'lucide-react-native';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';

import { accountDataApi } from '../api/accountDataApi';
import { authApi } from '../../../services/authApi';
import { connectedAccountsApi } from '../api/connectedAccountsApi';
import { googleActionApi } from '../api/googleActionApi';
import { useGoogleActionChallenge } from '../hooks/useGoogleActionChallenge';
import GoogleActionVerification from '../components/GoogleActionVerification';
import { saveAccountData } from '../utils/accountDataExport';
import { sessionGeneration } from '../../../services/sessionTokens';

import { theme } from '../../../constants/theme';

const C = theme.colors;

type Action = 'export' | 'delete';

export default function DataManagementScreen() {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const { user, loading } = useSession();
  const router = useRouter();

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.content}>
          <Text style={styles.heading}>{t12("Sign in to manage your data")}</Text>

          <Pressable
            style={styles.button}
            accessibilityRole="button"
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>{tr10("Sign in")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const epoch = sessionGeneration();

  return (
    <DataManagementContent
      key={user.id + ':' + epoch}
      epoch={epoch}
      canDelete={user.role === 'PATIENT'}
    />
  );
}

function DataManagementContent({
  epoch,
  canDelete,
}: {
  epoch: number;
  canDelete: boolean;
}) {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();

  const {
    user,
    getToken,
    clearLocalSession,
  } = useSession();

  const [action, setAction] =
    useState<Action | null>(null);

  const [mode, setMode] =
    useState<'password' | 'google' | 'unavailable' | null>(null);

  const [mfaEnabled, setMfaEnabled] =
    useState<boolean | null>(null);

  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState('');
  const [reload, setReload] = useState(0);
  const requestGeneration = useRef(reload);
  useLayoutEffect(() => {
    requestGeneration.current = reload;
  }, [reload]);


  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const verification = useGoogleActionChallenge(
    mode !== 'google' || !action
      ? null
      : action === 'export'
        ? 'EXPORT_DATA'
        : 'DELETE_ACCOUNT',
    epoch,
  );

  const mounted = useRef(false);
  const active = useRef(false);
  const locked = useRef(false);
  const revision = useRef({ value: 0 });
  const credentialRevision = useRef(0);

  const clearInputs = useCallback(() => {
    setPassword('');
    setMfaCode('');
    setConfirmation('');
  }, []);

  useEffect(() => {
    const cleanupCounter = revision.current;

    mounted.current = true;

    return () => {
      mounted.current = false;
      active.current = false;
      cleanupCounter.value++;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      state => {
        if (state !== 'active') {
          credentialRevision.current++;
          clearInputs();
        }
      },
    );

    return () => subscription.remove();
  }, [clearInputs]);

  useFocusEffect(useCallback(() => {
    active.current = true;
    revision.current.value++;

    let valid = true;

    const currentLoad = () =>
      valid &&
      active.current &&
      requestGeneration.current === reload &&
      epoch === sessionGeneration();

    setStatusLoading(true);
    setStatusError('');
    setMode(null);
    setMfaEnabled(null);

    void (async () => {
      try {
        const token = await getToken();

        if (!currentLoad()) return;

        if (!token) {
          throw new Error('Sign in again.');
        }

        const [accounts, mfa] = await Promise.all([
          connectedAccountsApi.list(token),
          authApi.mfaStatus(token),
        ]);

        if (!currentLoad()) return;

        if (
          accounts.hasPassword &&
          accounts.canManageConnections
        ) {
          setMode('password');
        } else if (
          !accounts.hasPassword &&
          accounts.canSetPassword &&
          accounts.providers.some(
            provider => provider.provider === 'GOOGLE',
          ) &&
          (Platform.OS === 'android' || Platform.OS === 'ios')
        ) {
          setMode('google');
        } else {
          setMode('unavailable');
        }

        setMfaEnabled(mfa.enabled);
      } catch (err) {
        if (currentLoad()) {
          setMode(null);
          setMfaEnabled(null);
          setStatusError(
            err instanceof Error
              ? err.message
              : 'Unable to load account security settings.',
          );
        }
      } finally {
        if (currentLoad()) {
          setStatusLoading(false);
        }
      }
    })();

    return () => {
      valid = false;
      active.current = false;
      revision.current.value++;

      clearInputs();
      setAction(null);
      setError('');
      setMessage('');
    };
  }, [epoch, getToken, reload, clearInputs]));

  function current() {
    return (
      mounted.current &&
      active.current &&
      epoch === sessionGeneration()
    );
  }

  function resetFields() {
    verification.reset();
    clearInputs();
    setAction(null);
  }

  const formBlocked =
    busy ||
    verification.busy ||
    statusLoading ||
    mfaEnabled === null ||
    (mode !== 'password' && mode !== 'google') ||
    !verification.foreground;

  const submitBlocked =
    formBlocked ||
    (mode === 'password' && !password) ||
    (mode === 'google' && !verification.ready) ||
    (mfaEnabled === true && !/^[0-9]{6}$/.test(mfaCode)) ||
    (action === 'delete' && confirmation !== 'DELETE');

  function selectAction(next: Action) {
    if (
      !current() ||
      locked.current ||
      formBlocked ||
      AppState.currentState !== 'active'
    ) return;

    if (next === 'delete' && !canDelete) return;

    if (
      next === 'export' &&
      Platform.OS !== 'android'
    ) return;

    resetFields();
    setError('');
    setMessage('');
    setAction(next);
  }

  async function submit() {
    if (
      !current() ||
      locked.current ||
      submitBlocked ||
      !action ||
      AppState.currentState !== 'active'
    ) return;

    if (mode !== 'password' && mode !== 'google') {
      return;
    }

    if (
      action === 'delete' &&
      (!canDelete || confirmation !== 'DELETE')
    ) {
      setError('Type DELETE to confirm account deletion.');
      return;
    }

    if (
      action === 'export' &&
      Platform.OS !== 'android'
    ) return;

    const operationRevision = revision.current.value;
    const inputRevision = credentialRevision.current;

    const viewCurrent = () =>
      current() &&
      revision.current.value === operationRevision;

    locked.current = true;
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const token = await getToken();

      if (
        !viewCurrent() ||
        credentialRevision.current !== inputRevision ||
        AppState.currentState !== 'active'
      ) return;

      if (!token) {
        throw new Error('Sign in again.');
      }

      const otp = mfaEnabled
        ? mfaCode
        : undefined;

      const proof = mode === 'google'
        ? verification.getProof(otp)
        : null;

      if (action === 'export') {
        const data = proof
          ? await googleActionApi.exportAccount(token, proof)
          : await accountDataApi.exportAccount(
              token,
              password,
              otp,
            );

        if (!viewCurrent()) return;

        clearInputs();

        // The server has consumed the Google challenge.
        if (proof) verification.reset();

        if (AppState.currentState !== 'active') {
          setMessage(
            'Return to the app and verify again to save your data.',
          );
          return;
        }

        const saved = await saveAccountData(
          data,
          epoch,
          viewCurrent,
          user?.id ?? '',
        );

        if (!viewCurrent()) return;

        if (saved) {
          resetFields();

          const truncated =
            data.completeness.sessionsTruncated ||
            data.completeness.eventsTruncated;

          setMessage(
            truncated
              ? 'Account data saved. Some older security records were omitted.'
              : 'Account data saved successfully.',
          );
        } else {
          setMessage('File export cancelled.');
        }

        return;
      }

      const result = proof
        ? await googleActionApi.deleteAccount(
            token,
            confirmation,
            proof,
          )
        : await accountDataApi.deleteAccount(
            token,
            password,
            confirmation,
            otp,
          );

      if (!result.accountDeleted) {
        throw new Error(
          'Account deletion could not be confirmed.',
        );
      }

      // A confirmed deletion must clear the local session,
      // even if the user left this screen.
      if (epoch !== sessionGeneration()) return;

      if (viewCurrent()) {
        resetFields();
      }

      const cleanup = clearLocalSession();
      const cleanupEpoch = sessionGeneration();

      try {
        await cleanup;
      } catch {
        if (cleanupEpoch === sessionGeneration()) {
          Alert.alert(
            tr10("Account deleted"),
            t12("The server account was deleted, but local credential cleanup could not be confirmed."),
          );
        }

        return;
      }

      if (cleanupEpoch === sessionGeneration()) {
        router.replace('/welcome');

        Alert.alert(
          tr10("Account deleted"),
          result.avatarCleanupQueued
            ? 'Your account was deleted. Profile photo cleanup has been scheduled.'
            : 'Your account was deleted.',
        );
      }
    } catch (err) {
      if (viewCurrent()) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to complete this request.',
        );
      }
    } finally {
      locked.current = false;

      if (
        mounted.current &&
        epoch === sessionGeneration()
      ) {
        clearInputs();
        verification.clearCode();
        setBusy(false);
      }
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: '#EAF2F5',
            borderColor: '#D8E0E4',
            borderWidth: 1,
            borderRadius: 22,
            padding: 20,
            gap: 10,
          }}
        >
          <Text
            accessibilityRole="header"
            style={{
              fontSize: 23,
              fontWeight: '700',
              lineHeight: 30,
              color: '#1F2933',
            }}
          >
            Your data, your control.
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: '#4D5E69',
            }}
          >
            Manage and protect your personal account information.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#F4EFE6',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#CFB990',
            padding: 16,
            gap: 8,
          }}
        >
          <Text
            accessibilityRole="header"
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#1F2933',
            }}
          >
            Before exporting
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: '#1F2933',
            }}
          >
            Exported JSON files are not encrypted. Keep them in a secure location and share them only with trusted recipients.
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: '#1F2933',
            }}
          >
            Exports include up to 200 retained sessions and 1000 recent security events from the last 90 days.
          </Text>
        </View>
        <Text style={styles.description}>
          Manage your personal account information.
        </Text>

        {statusLoading && (
          <ActivityIndicator
            accessibilityLabel={t12("Checking account security")}
          />
        )}

        {statusError ? (
          <View style={styles.card}>
            <Text style={styles.warning}>
              {statusError}
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={busy || verification.busy}
              style={styles.button}
              onPress={() => {
                resetFields();
                setReload(value => value + 1);
              }}
            >
              <Text style={styles.buttonText}>{t12("Retry account verification")}</Text>
            </Pressable>
          </View>
        ) : null}

        {mode === 'unavailable' && (
          <View style={styles.card}>
            <Text style={styles.warning}>{t12("Account verification is unavailable. Check your sign-in methods in Security settings.")}</Text>

            <Pressable
              accessibilityRole="button"
              style={styles.button}
              onPress={() => router.push('/profile/connected-accounts' as Href)}
            >
              <Text style={styles.buttonText}>{t12("Open security settings")}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.headingRow}>
            <Download size={25} color={C.darkBlue} />

            <Text style={styles.heading}>{tr10("Export My Account Data")} </Text>
          </View>

          <Text style={styles.description}>{t12("Download your profile, preferences, connected accounts and recent security activity in JSON format.")}</Text>

          <Text style={styles.description}>{tr10("Medical records and avatar files are not included.")} </Text>

          <Pressable
            accessibilityRole="button"
            disabled={formBlocked || Platform.OS !== 'android'}
            style={[
              styles.button,
              (formBlocked || Platform.OS !== 'android') &&
                styles.disabled,
            ]}
            onPress={() => selectAction('export')}
          >
            <Text style={styles.buttonText}>
              {Platform.OS === 'android'
                ? tr10("Export account data")
                : tr10("Export currently available on Android")}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.headingRow}>
            <Trash2 size={25} color={C.error} />

            <Text style={styles.heading}>{tr10("Delete My Account")} </Text>
          </View>

          <Text style={styles.description}>{t12("Permanently delete your TED account and associated authentication records. Profile photo cleanup may continue after deletion.")}</Text>

          <Text style={styles.description}>{t12("This does not delete files you previously downloaded or copies retained in backups.")}</Text>

          <Pressable
            accessibilityRole="button"
            disabled={formBlocked || !canDelete}
            style={[
              styles.deleteButton,
              (formBlocked || !canDelete) && styles.disabled,
            ]}
            onPress={() => selectAction('delete')}
          >
            <Text style={styles.deleteText}>{tr10("Delete account")} </Text>
          </Pressable>

          {!canDelete && (
            <Text style={styles.description}>{t12("Contact support to delete this account.")}</Text>
          )}
        </View>

        {action && verification.foreground && (
          <View style={styles.card}>
            <Text style={styles.heading}>{tr10("Verify your identity")} </Text>

            {mode === 'google' ? (
              <GoogleActionVerification
                verification={verification}
                disabled={busy || statusLoading || mfaEnabled === null}
              />
            ) : (
              <>
                <Text style={styles.description}>{t12("Verify your current TED password.")}</Text>

                <TextInput
                  style={styles.input}
                  accessibilityLabel={tr10("Current password")}
                  placeholder={tr10("Current password")}
                  secureTextEntry
                  autoCorrect={false}
                  autoCapitalize="none"
                  maxLength={72}
                  editable={!formBlocked}
                  value={password}
                  onChangeText={setPassword}
                />
              </>
            )}

            {mfaEnabled && (
              <TextInput
                style={styles.input}
                accessibilityLabel={tr10("Authenticator code")}
                placeholder={tr10("6-digit authenticator code")}
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry
                editable={!formBlocked}
                value={mfaCode}
                onChangeText={value =>
                  setMfaCode(value.replace(/\D/g, ''))
                }
              />
            )}

            {action === 'delete' && (
              <>
                <Text style={styles.warning}>{tr10("Account deletion cannot be undone. Type DELETE to confirm.")} </Text>

                <TextInput
                  style={styles.input}
                  accessibilityLabel={tr10("Type DELETE to confirm")}
                  placeholder="DELETE"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!formBlocked}
                  maxLength={6}
                  value={confirmation}
                  onChangeText={setConfirmation}
                />
              </>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={submitBlocked}
              style={[
                action === 'delete'
                  ? styles.dangerButton
                  : styles.button,
                submitBlocked && styles.disabled,
              ]}
              onPress={() => {
                void submit();
              }}
            >
              <Text style={styles.buttonText}>
                {action === 'delete'
                  ? tr10("Permanently delete account")
                  : tr10("Verify and export")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={busy || verification.busy}
              style={styles.cancel}
              onPress={() => {
                resetFields();
                setError('');
              }}
            >
              <Text style={styles.cancelText}>{tr10("Cancel")} </Text>
            </Pressable>
          </View>
        )}

        {busy && <ActivityIndicator />}

        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.warning}
          >
            {t12(error)}
          </Text>
        ) : null}

        {message ? (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.description}
          >
            {message}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heading: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '700',
    color: C.primaryText,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: C.secondaryText,
  },
  input: {
    minHeight: 48,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: C.primaryText,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: C.darkBlue,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  dangerButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: C.error,
    alignItems: 'center',
  },
  deleteButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.error,
    alignItems: 'center',
  },
  deleteText: {
    color: C.error,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  warning: {
    color: C.error,
    fontSize: 14,
    lineHeight: 21,
  },
  cancel: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: C.darkBlue,
    fontWeight: '600',
  },
});
