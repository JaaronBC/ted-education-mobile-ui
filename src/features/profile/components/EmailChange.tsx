import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { emailChangeApi } from '../api/emailChangeApi';
import { sessionGeneration } from '../../../services/sessionTokens';
import { theme } from '../../../constants/theme';

const C = theme.colors;

export default function EmailChange() {
  const { user } = useSession();

  if (!user) return null;

  const epoch = sessionGeneration();

  return (
    <EmailChangeContent
      key={user.id + ':' + epoch}
      epoch={epoch}
      currentEmail={user.email}
    />
  );
}

function EmailChangeContent({
  epoch,
  currentEmail,
}: {
  epoch: number;
  currentEmail: string;
}) {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();

  const {
    getToken,
    clearLocalSession,
  } = useSession();

  const [opened, setOpened] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const [requestId, setRequestId] =
    useState<string | null>(null);

  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const locked = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  function current() {
    return (
      mounted.current &&
      epoch === sessionGeneration()
    );
  }

  function begin() {
    if (!current() || locked.current) {
      return false;
    }

    locked.current = true;
    setBusy(true);
    setError('');

    return true;
  }

  function finish() {
    locked.current = false;

    if (current()) {
      setBusy(false);
    }
  }

  function reset() {
    if (locked.current) return;

    setOpened(false);
    setNewEmail('');
    setPassword('');
    setMfaCode('');
    setRequestId(null);
    setOldCode('');
    setNewCode('');
    setError('');
  }

  async function requestCodes() {
    const email = newEmail.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      setError('Enter a valid new email address.');
      return;
    }

    if (email === currentEmail.toLowerCase()) {
      setError('Choose a different email address.');
      return;
    }

    if (!password) {
      setError('Enter your current password.');
      return;
    }

    if (
      mfaCode &&
      !/^[0-9]{6}$/.test(mfaCode)
    ) {
      setError('Enter a valid authenticator code.');
      return;
    }

    if (!begin()) return;

    try {
      const token = await getToken();

      if (!current()) return;

      if (!token) {
        throw new Error('Sign in again.');
      }

      const result = await emailChangeApi.request(
        token,
        email,
        password,
        mfaCode || undefined,
      );

      if (!current()) return;

      setRequestId(result.requestId);
      setNewEmail(email);
    } catch (err) {
      if (current()) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to request verification codes.',
        );
      }
    } finally {
      if (current()) {
        setPassword('');
        setMfaCode('');
      }

      finish();
    }
  }

  async function confirmChange() {
    if (
      !requestId ||
      !/^[0-9]{8}$/.test(oldCode) ||
      !/^[0-9]{8}$/.test(newCode)
    ) {
      setError('Enter both 8-digit verification codes.');
      return;
    }

    if (!begin()) return;

    try {
      const token = await getToken();

      if (!current()) return;

      if (!token) {
        throw new Error('Sign in again.');
      }

      await emailChangeApi.confirm(
        token,
        requestId,
        oldCode,
        newCode,
      );

      if (epoch !== sessionGeneration()) {
        return;
      }

      if (current()) {
        setOldCode('');
        setNewCode('');
        setRequestId(null);
      }

      const cleanup = clearLocalSession();
      const cleanupEpoch = sessionGeneration();

      try {
        await cleanup;
      } catch {
        if (cleanupEpoch === sessionGeneration()) {
          Alert.alert(
            tr10("Email changed"),
            t12("Your email changed, but local cleanup could not be confirmed. Close the app and sign in again."),
          );
        }

        return;
      }

      if (cleanupEpoch === sessionGeneration()) {
        router.replace('/welcome');

        Alert.alert(
          tr10("Email changed"),
          tr10("Sign in using your new email address."),
        );
      }
    } catch (err) {
      if (current()) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to confirm email change.',
        );
      }
    } finally {
      finish();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Mail size={24} color={C.darkBlue} />

        <Text style={styles.heading}>{tr10("Change Email Address")} </Text>
      </View>

      <Text style={styles.description}>{tr10("Current email:")} {currentEmail}
      </Text>

      {!opened ? (
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => setOpened(true)}
        >
          <Text style={styles.buttonText}>{tr10("Change email")} </Text>
        </Pressable>
      ) : (
        <>
          {!requestId ? (
            <>
              <Text style={styles.label}>{tr10("New email address")} </Text>

              <TextInput
                style={styles.input}
                accessibilityLabel={tr10("New email address")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={newEmail}
                editable={!busy}
                maxLength={254}
                onChangeText={setNewEmail}
              />

              <Text style={styles.label}>{tr10("Current password")} </Text>

              <TextInput
                style={styles.input}
                accessibilityLabel={tr10("Current password")}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                editable={!busy}
                maxLength={72}
                onChangeText={setPassword}
              />

              <Text style={styles.label}>{t12("Authenticator code (if enabled)")}</Text>

              <TextInput
                style={styles.input}
                accessibilityLabel={tr10("Authenticator code")}
                keyboardType="number-pad"
                maxLength={6}
                value={mfaCode}
                editable={!busy}
                onChangeText={value =>
                  setMfaCode(value.replace(/\D/g, ''))
                }
              />

              <Pressable
                accessibilityRole="button"
                style={[
                  styles.button,
                  busy && styles.disabled,
                ]}
                disabled={busy}
                onPress={() => {
                  void requestCodes();
                }}
              >
                <Text style={styles.buttonText}>{tr10("Send verification codes")} </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.description}>{t12("Enter the codes sent to your current and new email addresses.")}</Text>

              <Text style={styles.label}>{tr10("Current email code")} </Text>

              <TextInput
                style={styles.input}
                accessibilityLabel={tr10("Current email code")}
                keyboardType="number-pad"
                maxLength={8}
                value={oldCode}
                editable={!busy}
                onChangeText={value =>
                  setOldCode(value.replace(/\D/g, ''))
                }
              />

              <Text style={styles.label}>{tr10("New email code")} </Text>

              <TextInput
                style={styles.input}
                accessibilityLabel={tr10("New email code")}
                keyboardType="number-pad"
                maxLength={8}
                value={newCode}
                editable={!busy}
                onChangeText={value =>
                  setNewCode(value.replace(/\D/g, ''))
                }
              />

              <Text style={styles.description}>{t12("Codes expire in 10 minutes. Changing your email signs out all sessions.")}</Text>

              <Pressable
                accessibilityRole="button"
                style={[
                  styles.button,
                  busy && styles.disabled,
                ]}
                disabled={busy}
                onPress={() => {
                  void confirmChange();
                }}
              >
                <Text style={styles.buttonText}>{tr10("Confirm email change")} </Text>
              </Pressable>
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
            disabled={busy}
            style={styles.cancel}
            onPress={reset}
          >
            <Text style={styles.cancelText}>
              {requestId ? tr10("Start again") : tr10("Cancel")}
            </Text>
          </Pressable>
        </>
      )}
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heading: {
    fontSize: 19,
    fontWeight: '700',
    color: C.primaryText,
    flex: 1,
  },
  description: {
    color: C.secondaryText,
    fontSize: 13,
    lineHeight: 20,
  },
  label: {
    color: C.primaryText,
    fontWeight: '600',
    fontSize: 13,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: C.primaryText,
    backgroundColor: '#FFFFFF',
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
  disabled: {
    opacity: 0.5,
  },
  cancel: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: C.darkBlue,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    lineHeight: 19,
    color: C.error,
  },
});
