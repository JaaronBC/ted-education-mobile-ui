import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { authApi } from '../../../services/authApi';
import { theme } from '../../../constants/theme';

const C = theme.colors;

export default function ChangePasswordScreen() {
  const router = useRouter();

  const {
    user,
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

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  async function submit() {
    if (busy || finished) return;

    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }

    if (newPassword.length < 12) {
      setError('New password must contain at least 12 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        'Choose a password different from the current password.'
      );
      return;
    }

    setBusy(true);
    setError('');

    let changed = false;

    try {
      const token = await getToken();

      if (!token) {
        throw new Error('Sign in again.');
      }

      await authApi.changePassword(
        token,
        currentPassword,
        newPassword
      );

      changed = true;
      setFinished(true);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Do not use remote signOut().
      // The server has invalidated all existing tokens.
      await clearLocalSession();

      router.replace('/(auth)/login');

      Alert.alert(
        'Password changed',
        'All sessions were revoked. Sign in again with your new password.'
      );
    } catch (e) {
      if (changed) {
        setError(
          'Password changed, but local credentials could not be cleared. ' +
          'Close the app and sign in again.'
        );
      } else {
        setError(
          (e instanceof Error
            ? e.message
            : 'Password update could not be confirmed.') +
          ' If the connection dropped, your password may already have changed.'
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Change Password
        </Text>

        <Text style={styles.description}>
          Your current password is required.
          All devices will be signed out after the change.
        </Text>

        <Text style={styles.label}>
          Current password
        </Text>

        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showPassword}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy && !finished}
          accessibilityLabel="Current password"
        />

        <Text style={styles.label}>
          New password
        </Text>

        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy && !finished}
          accessibilityLabel="New password"
        />

        <Text style={styles.hint}>
          At least 12 characters; maximum 72 UTF-8 bytes.
        </Text>

        <Text style={styles.label}>
          Confirm new password
        </Text>

        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy && !finished}
          accessibilityLabel="Confirm new password"
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: showPassword }}
          style={styles.toggle}
          onPress={() => setShowPassword(v => !v)}
        >
          <Text style={styles.link}>
            {showPassword ? 'Hide passwords' : 'Show passwords'}
          </Text>
        </Pressable>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={busy || finished}
          style={[
            styles.button,
            { opacity: busy || finished ? 0.6 : 1 }
          ]}
          onPress={() => { void submit(); }}
        >
          <Text style={styles.buttonText}>
            Update Password
          </Text>
        </Pressable>

        {busy ? (
          <ActivityIndicator style={styles.spinner} />
        ) : null}

        {finished ? (
          <Text style={styles.description}>
            Password updated on the server.
            Please sign in again.
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
