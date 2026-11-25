import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
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
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import '../../auth/services/googleSignIn';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { sessionGeneration } from '../../../services/sessionTokens';

import {
  connectedAccountsApi,
  type ConnectedAccountsResponse,
} from '../api/connectedAccountsApi';

import { authApi } from '../../../services/authApi';
import { googleActionApi } from '../api/googleActionApi';
import { useGoogleActionChallenge } from '../hooks/useGoogleActionChallenge';
import GoogleActionVerification from './GoogleActionVerification';

import { theme } from '../../../constants/theme';

const C = theme.colors;

export default function ConnectedAccounts() {
  const { user } = useSession();

  if (!user) return null;

  const epoch = sessionGeneration();

  return (
    <ConnectionsContent
      key={user.id + ':' + epoch}
      epoch={epoch}
    />
  );
}

function ConnectionsContent({
  epoch,
}: {
  epoch: number;
}) {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();

  const {
    getToken,
    clearLocalSession,
  } = useSession();

  const [data, setData] =
    useState<ConnectedAccountsResponse | null>(null);

  const [action, setAction] =
    useState<'link' | 'unlink' | 'set-password' | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const requestGeneration = useRef(revision);
  useLayoutEffect(() => {
    requestGeneration.current = revision;
  }, [revision]);


  const [mfaEnabled, setMfaEnabled] =
    useState<boolean | null>(null);

  const verification = useGoogleActionChallenge(
    action === 'set-password'
      ? 'SET_PASSWORD'
      : null,
    epoch,
  );

  const mounted = useRef(false);
  const locked = useRef(false);
  const focused = useRef(false);
  const viewRevision = useRef(0);

  const clearFields = useCallback(() => {
    setPassword('');
    setConfirmPassword('');
    setMfaCode('');
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      state => {
        if (state !== 'active') {
          clearFields();
        }
      },
    );

    return () => subscription.remove();
  }, [clearFields]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  function current() {
    return (
      mounted.current &&
      focused.current &&
      epoch === sessionGeneration()
    );
  }

  useFocusEffect(useCallback(() => {
    let active = true;

    focused.current = true;
    viewRevision.current++;

    function valid() {
      return (
        active &&
        requestGeneration.current === revision &&
      epoch === sessionGeneration()
      );
    }

    async function load() {
      setLoading(true);
      setMfaEnabled(null);
      setError('');

      try {
        const token = await getToken();

        if (!valid()) return;

        if (!token) {
          throw new Error('Sign in again.');
        }

        const [result, status] = await Promise.all([
          connectedAccountsApi.list(token),
          authApi.mfaStatus(token),
        ]);

        if (valid()) {
          setData(result);
          setMfaEnabled(status.enabled);
        }
      } catch (err) {
        if (valid()) {
          setData(null);
          setMfaEnabled(null);

          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load connected accounts.',
          );
        }
      } finally {
        if (valid()) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
      focused.current = false;
      viewRevision.current++;

      setAction(null);
      clearFields();
      setError('');
    };
  }, [epoch, getToken, revision, clearFields]));

  function cancel() {
    if (locked.current || verification.busy) return;

    verification.reset();

    setAction(null);
    clearFields();
    setError('');
  }

  async function submit() {
    if (
      !current() ||
      locked.current ||
      verification.busy ||
      AppState.currentState !== 'active' ||
      mfaEnabled === null ||
      !action ||
      loading ||
      !(action === 'set-password'
        ? data?.canSetPassword
        : data?.canManageConnections)
    ) {
      return;
    }

    if (action === 'set-password') {
      if (!verification.ready) {
        setError('Complete email verification first.');
        return;
      }

      if (password.length < 12) {
        setError('Use at least 12 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else if (!password) {
      setError('Enter your current password.');
      return;
    }

    if (
      (mfaEnabled || mfaCode.length > 0) &&
      !/^[0-9]{6}$/.test(mfaCode)
    ) {
      setError('Enter a valid authenticator code.');
      return;
    }

    const operationRevision = viewRevision.current;

    const valid = () =>
      current() &&
      viewRevision.current === operationRevision;

    locked.current = true;
    setBusy(true);
    setError('');

    try {
      let idToken: string | undefined;

      if (action === 'link') {
        if (Platform.OS === 'web') {
          throw new Error(
            'Google linking is available in the mobile app.',
          );
        }

        if (Platform.OS === 'android') {
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });
        }

        if (!valid()) return;

        // Clear the SDK account selection before linking.
        await GoogleSignin.signOut();

        if (!valid()) return;

        const response = await GoogleSignin.signIn();

        if (!valid()) return;

        if (!isSuccessResponse(response)) {
          return;
        }

        idToken = response.data.idToken ?? undefined;

        if (!idToken) {
          throw new Error(
            'Google did not return an ID token.',
          );
        }
      }

      const token = await getToken();

      if (!valid()) return;

      if (!token) {
        throw new Error('Sign in again.');
      }

      if (AppState.currentState !== 'active') {
        return;
      }

      if (action === 'link' && idToken) {
        await connectedAccountsApi.linkGoogle(
          token,
          idToken,
          password,
          mfaCode || undefined,
        );
      } else if (action === 'set-password') {
        const proof = verification.getProof(
          mfaEnabled ? mfaCode : undefined,
        );

        await googleActionApi.setPassword(
          token,
          password,
          proof,
        );
      } else if (action === 'unlink') {
        await connectedAccountsApi.unlinkGoogle(
          token,
          password,
          mfaCode || undefined,
        );
      } else {
        throw new Error('Google identity is missing.');
      }

      if (epoch !== sessionGeneration()) return;

      const cleanup = clearLocalSession();
      const cleanupEpoch = sessionGeneration();

      try {
        await cleanup;
      } catch {
        if (cleanupEpoch === sessionGeneration()) {
          Alert.alert(
            action === 'set-password' ? 'Password configured' : 'Connection updated',
            t12("Local sign-out could not be confirmed. Close the app and sign in again."),
          );
        }

        return;
      }

      if (cleanupEpoch === sessionGeneration()) {
        router.replace('/welcome');

        Alert.alert(
          action === 'set-password' ? 'Password configured' : 'Connection updated',
          tr10("For your security, please sign in again."),
        );
      }
    } catch (err) {
      if (valid()) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to update the connection.',
        );
      }
    } finally {
      locked.current = false;

      if (
        mounted.current &&
        epoch === sessionGeneration()
      ) {
        clearFields();
        verification.clearCode();
        setBusy(false);
      }
    }
  }

  const formBlocked =
    busy ||
    verification.busy ||
    loading ||
    mfaEnabled === null;

  const submitBlocked =
    formBlocked ||
    !verification.foreground ||
    (
      action === 'set-password' &&
      !verification.ready
    );

  const googleConnected = Boolean(
    data?.providers.some(
      item => item.provider === 'GOOGLE',
    ),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{tr10("Connected Accounts")} </Text>

      <Text style={styles.description}>
        Manage the methods you use to sign in.
      </Text>

      {loading && <ActivityIndicator />}

      {data && (
        <>
          <View style={styles.accountRow}>
            <Text style={styles.label}>{tr10("Email & Password")} </Text>

            <Text style={styles.description}>
              {data.hasPassword
                ? tr10("Password sign-in configured")
                : tr10("Not configured")}
            </Text>

            {data.canSetPassword && Platform.OS !== 'web' && (
              <Pressable
                accessibilityRole="button"
                disabled={formBlocked}
                style={styles.secondaryButton}
                onPress={() => {
                  cancel();
                  setAction('set-password');
                }}
              >
                <Text style={styles.link}>{tr10("Set password")} </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.accountRow}>
            <Text style={styles.label}>
              Google
            </Text>

            <Text style={styles.description}>
              {googleConnected
                ? tr10("Connected")
                : tr10("Not connected")}
            </Text>

            {data.canManageConnections && (
              <Pressable
                accessibilityRole="button"
                disabled={formBlocked}
                style={styles.secondaryButton}
                onPress={() => {
                  cancel();
                  setAction(
                    googleConnected ? 'unlink' : 'link',
                  );
                }}
              >
                <Text style={styles.link}>
                  {googleConnected
                    ? tr10("Disconnect Google")
                    : tr10("Connect Google")}
                </Text>
              </Pressable>
            )}
          </View>

          {!data.canManageConnections && (
            <Text style={styles.description}>{t12("A verified password sign-in method is required before changing connections.")}</Text>
          )}

          {action && verification.foreground && (
            <>
              {action === 'set-password' ? (
                <GoogleActionVerification
                  verification={verification}
                  disabled={busy || loading || mfaEnabled === null}
                />
              ) : (
                <Text style={styles.label}>{tr10("Verify your identity")} </Text>
              )}

              <TextInput
                style={styles.input}
                accessibilityLabel={
                  action === 'set-password'
                    ? tr10("New password")
                    : tr10("Current password")
                }
                placeholder={
                  action === 'set-password'
                    ? 'New password (12+ characters)'
                    : tr10("Current password")
                }
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={72}
                editable={!formBlocked}
                value={password}
                onChangeText={setPassword}
              />

              {action === 'set-password' && (
                <TextInput
                  style={styles.input}
                  accessibilityLabel={tr10("Confirm new password")}
                  placeholder={tr10("Confirm new password")}
                  secureTextEntry
                  autoCorrect={false}
                  autoCapitalize="none"
                  maxLength={72}
                  editable={!formBlocked}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
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

              <Text style={styles.description}>{t12("This security change signs out all existing sessions.")}</Text>

              <Pressable
                accessibilityRole="button"
                disabled={submitBlocked}
                style={[
                  styles.button,
                  submitBlocked && { opacity: 0.5 },
                ]}
                onPress={() => {
                  void submit();
                }}
              >
                <Text style={styles.buttonText}>
                  {action === 'set-password'
                    ? tr10("Set password")
                    : action === 'link'
                      ? tr10("Verify and connect")
                      : tr10("Verify and disconnect")}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={busy || verification.busy}
                style={styles.secondaryButton}
                onPress={cancel}
              >
                <Text style={styles.link}>{tr10("Cancel")} </Text>
              </Pressable>
            </>
          )}


        </>
      )}

      {busy && <ActivityIndicator />}

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={styles.error}
        >
          {t12(error)}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={formBlocked}
        style={styles.secondaryButton}
        onPress={() => {
          cancel();
          setRevision(value => value + 1);
        }}
      >
        <Text style={styles.link}>{tr10("Refresh connected accounts")} </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  heading: {
    fontSize: 19,
    fontWeight: '700',
    color: C.primaryText,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: C.secondaryText,
  },
  accountRow: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: C.lightBlue,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primaryText,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: C.border,
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
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  link: {
    color: C.darkBlue,
    fontWeight: '600',
  },
  error: {
    color: C.error,
    fontSize: 13,
    lineHeight: 19,
  },
});
