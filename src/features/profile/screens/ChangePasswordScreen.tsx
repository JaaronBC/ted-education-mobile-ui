import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { useLayoutEffect, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect } from 'expo-router';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { authApi } from '../../../services/authApi';
import { connectedAccountsApi } from '../api/connectedAccountsApi';
import ConnectedAccounts from '../components/ConnectedAccounts';
import { sessionGeneration } from '../../../services/sessionTokens';
import { theme } from '../../../constants/theme';

const C = theme.colors;

export default function ChangePasswordScreen() {
  const { user, loading } = useSession();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <PasswordAccountGate
      key={user.id + ':' + sessionGeneration()}
      epoch={sessionGeneration()}
    />
  );
}

function PasswordAccountGate({
  epoch,
}: {
  epoch: number;
}) {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const { getToken } = useSession();

  const [mode, setMode] = useState<
    'loading' | 'password' | 'google' | 'unavailable' | 'error'
  >('loading');

  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const requestGeneration = useRef(reload);
  useLayoutEffect(() => {
    requestGeneration.current = reload;
  }, [reload]);


  useFocusEffect(useCallback(() => {
    let active = true;

    const valid = () =>
      active &&
      requestGeneration.current === reload &&
      epoch === sessionGeneration();

    setMode('loading');
    setError('');

    void (async () => {
      try {
        const token = await getToken();

        if (!valid()) return;

        if (!token) {
          throw new Error('Sign in again.');
        }

        const accounts =
          await connectedAccountsApi.list(token);

        if (!valid()) return;

        if (
          accounts.hasPassword &&
          accounts.canManageConnections
        ) {
          setMode('password');
        } else if (
          !accounts.hasPassword &&
          accounts.canSetPassword
        ) {
          setMode('google');
        } else {
          setMode('unavailable');
        }
      } catch (err) {
        if (valid()) {
          setMode('error');
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to verify account type.',
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [epoch, getToken, reload]));

  if (mode === 'loading') {
    return (
      <ActivityIndicator
        accessibilityLabel={t12("Checking account sign-in methods")}
        style={{ marginTop: 24 }}
      />
    );
  }

  if (mode === 'password') {
    return <ChangePasswordForm />;
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ flex: 1, backgroundColor: C.surface }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {mode === 'google' ? (
          <>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: C.primaryText,
              }}
            >{tr10("Set your TED password")} </Text>

            <Text style={{ color: C.secondaryText, lineHeight: 22 }}>{t12("Your account uses Google sign-in and does not currently have a TED password. Verify your identity to create one.")}</Text>

            <ConnectedAccounts />
          </>
        ) : (
          <>
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: C.error, lineHeight: 22 }}
            >
              {mode === 'error'
                ? error
                : 'Password management is unavailable for this account.'}
            </Text>

            <Pressable
              accessibilityRole="button"
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: C.darkBlue,
                alignItems: 'center',
              }}
              onPress={() => setReload(value => value + 1)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{tr10("Retry")} </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChangePasswordForm() {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();


  const {
    getToken,
    clearLocalSession
  } = useSession();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStatus, setMfaStatus] =
    useState<'loading' | 'enabled' | 'disabled' | 'error'>('loading');

  const [reload, setReload] = useState(0);
  const [focused, setFocused] = useState(false);

  const [foreground, setForeground] = useState(
    AppState.currentState === 'active',
  );

  const epoch = sessionGeneration();
  const focusedRef = useRef(false);
  const lock = useRef(false);
  const revision = useRef(0);

  const clearFields = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMfaCode('');
    setShowPassword(false);
  }, []);

  useFocusEffect(useCallback(() => {
    focusedRef.current = true;
    revision.current++;

    setFocused(true);
    setMfaStatus('loading');

    return () => {
      focusedRef.current = false;
      revision.current++;

      setFocused(false);
      clearFields();
      setError('');
    };
  }, [clearFields]));

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      state => {
        setForeground(state === 'active');

        if (state !== 'active') {
          setMfaCode('');
          setShowPassword(false);
          setMfaStatus('loading');
        }
      },
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!focused || !foreground || busy || finished) {
      return;
    }

    let active = true;

    const valid = () =>
      active &&
      focusedRef.current &&
      epoch === sessionGeneration();

    void (async () => {
      try {
        const token = await getToken();

        if (!valid()) return;
        setMfaStatus('loading');
        if (!token) throw new Error('Sign in again.');

        const status = await authApi.mfaStatus(token);

        if (!valid()) return;

        setMfaStatus(
          status.enabled ? 'enabled' : 'disabled',
        );
      } catch {
        if (valid()) {
          setMfaStatus('error');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [
    epoch,
    getToken,
    focused,
    foreground,
    reload,
    busy,
    finished,
  ]);

  async function submit() {
    if (
      lock.current ||
      busy ||
      finished ||
      !focusedRef.current ||
      AppState.currentState !== 'active' ||
      epoch !== sessionGeneration()
    ) return;

    if (
      mfaStatus !== 'enabled' &&
      mfaStatus !== 'disabled'
    ) {
      setError('Verify your security settings first.');
      return;
    }

    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }

    if (newPassword.length < 12) {
      setError('Use at least 12 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Choose a different password.');
      return;
    }

    const otp = mfaCode.trim();

    if (
      mfaStatus === 'enabled' &&
      !/^[0-9]{6}$/.test(otp)
    ) {
      setError('Enter your current 6-digit authenticator code.');
      return;
    }

    const operationRevision = revision.current;

    const viewCurrent = () =>
      focusedRef.current &&
      revision.current === operationRevision &&
      epoch === sessionGeneration();

    lock.current = true;
    setBusy(true);
    setError('');

    let changed = false;

    try {
      const token = await getToken();

      if (
        !viewCurrent() ||
        AppState.currentState !== 'active'
      ) return;

      if (!token) {
        throw new Error('Sign in again.');
      }

      await authApi.changePassword(
        token,
        currentPassword,
        newPassword,
        mfaStatus === 'enabled' ? otp : undefined,
      );

      changed = true;

      if (epoch !== sessionGeneration()) {
        return;
      }

      if (viewCurrent()) {
        setFinished(true);
        clearFields();
      }

      // The server has revoked the old session.
      // Complete local cleanup even if this page lost focus.
      await clearLocalSession();

    } catch (e) {
      if (!viewCurrent()) return;

      setMfaCode('');
      setShowPassword(false);

      if (changed) {
        setError(
          'Password changed, but local cleanup could not be confirmed. Sign in again.',
        );
      } else {
        setError(
          (e instanceof Error
            ? e.message
            : 'Password update could not be confirmed.') +
          ' If the connection dropped, your password may already have changed.',
        );
      }
    } finally {
      lock.current = false;

      if (epoch === sessionGeneration()) {
        setBusy(false);
      }
    }
  }

  if (!focused || !foreground) {
    return (
      <SafeAreaView style={styles.page}>
        <Text style={styles.description}>{t12("Password information is temporarily hidden.")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>{tr10("Change Password")} </Text>

        <Text style={styles.description}>{t12("Your current password is required. All devices will be signed out after the change.")}</Text>

        <Text style={styles.label}>{tr10("Current password")} </Text>

        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showPassword}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy && !finished}
          accessibilityLabel={tr10("Current password")}
        />

        <Text style={styles.label}>{tr10("New password")} </Text>

        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy && !finished}
          accessibilityLabel={tr10("New password")}
        />

        <Text style={styles.hint}>{tr10("At least 12 characters; maximum 72 UTF-8 bytes.")} </Text>

        <Text style={styles.label}>{tr10("Confirm new password")} </Text>

        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy && !finished}
          accessibilityLabel={tr10("Confirm new password")}
        />

        {mfaStatus === 'loading' && (
          <Text style={styles.hint}>{tr10("Checking account security...")} </Text>
        )}

        {mfaStatus === 'error' && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMfaStatus('loading');
              setReload(value => value + 1);
            }}
          >
            <Text style={styles.error}>{t12("Security status unavailable. Tap to retry.")}</Text>
          </Pressable>
        )}

        {mfaStatus === 'enabled' && (
          <>
            <Text style={styles.label}>{tr10("Authenticator code")} </Text>

            <Text style={styles.hint}>{t12("Enter the current 6-digit code from your authenticator.")}</Text>

            <TextInput
              style={styles.input}
              accessibilityLabel={tr10("Authenticator code")}
              value={mfaCode}
              onChangeText={setMfaCode}
              keyboardType="number-pad"
              maxLength={6}
              autoCorrect={false}
              editable={!busy && !finished}
              secureTextEntry
              placeholder={tr10("6-digit code")}
            />
          </>
        )}

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: showPassword }}
          style={styles.toggle}
          onPress={() => setShowPassword(v => !v)}
        >
          <Text style={styles.link}>
            {showPassword ? tr10("Hide passwords") : tr10("Show passwords")}
          </Text>
        </Pressable>

        {error ? (
          <Text style={styles.error}>
            {t12(error)}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={
            busy ||
            finished ||
            mfaStatus === 'loading' ||
            mfaStatus === 'error'
          }
          style={[
            styles.button,
            {
              opacity:
                busy ||
                finished ||
                mfaStatus === 'loading' ||
                mfaStatus === 'error'
                  ? 0.6
                  : 1
            }
          ]}
          onPress={() => { void submit(); }}
        >
          <Text style={styles.buttonText}>{tr10("Update Password")} </Text>
        </Pressable>

        {busy ? (
          <ActivityIndicator style={styles.spinner} />
        ) : null}

        {finished ? (
          <Text style={styles.description}>{t12("Password updated on the server. Please sign in again.")}</Text>
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
    padding: 22,
    paddingBottom: 70,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: C.primaryText,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: C.secondaryText,
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primaryText,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    color: C.primaryText,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: C.secondaryText,
    marginTop: 6,
  },
  toggle: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    marginTop: 6,
  },
  link: {
    color: C.darkBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: C.error,
    marginVertical: 12,
  },
  button: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: C.darkBlue,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  spinner: {
    marginTop: 12,
  },
});
