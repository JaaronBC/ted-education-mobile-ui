import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MailCheck } from 'lucide-react-native';

import { AppText as Text } from '../../components/ui/AppText';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { authApi } from '../../services/authApi';
import { ApiError } from '../../services/apiClient';
import { theme } from '../../constants/theme';

const C = theme.colors;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { fontScale } = useAccessibility();

  const params = useLocalSearchParams<{
    email?: string;
    requestFailed?: string;
  }>();

  const [email, setEmail] = useState(
    typeof params.email === 'string' ? params.email : ''
  );

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [message, setMessage] = useState(
    params.requestFailed === '1'
      ? 'The email request failed. Please use Resend Code.'
      : 'Check your inbox and spam folder for your code.'
  );

  const validEmail = () =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function verify() {
    if (!validEmail() || !/^\d{8}$/.test(code)) {
      setError('Enter a valid email and 8-digit code.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await authApi.confirmEmailVerification(
        email.trim().toLowerCase(),
        code
      );

      router.replace('/(auth)/login');
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 400
          ? 'Invalid or expired code.'
          : e instanceof Error
            ? e.message
            : 'Verification failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!validEmail()) {
      setError('Enter a valid email address.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await authApi.requestEmailVerification(
        email.trim().toLowerCase()
      );

      setMessage(
        'If verification is needed, a code will be sent. ' +
        'Wait at least 60 seconds between requests.'
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not request a code.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Sign In"
          style={styles.back}
          onPress={() => router.replace('/(auth)/login')}
        >
          <ArrowLeft size={24} color={C.darkBlue} />
        </Pressable>

        <View style={styles.icon}>
          <MailCheck size={32} color={C.darkBlue} />
        </View>

        <Text style={styles.title}>
          Verify your email
        </Text>

        <Text style={styles.subtitle}>
          Enter the 8-digit code from your email.
          It expires after 10 minutes.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email address</Text>

          <TextInput
            style={[styles.input, { fontSize: 15 * fontScale }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="name@example.com"
            accessibilityLabel="Email address"
          />

          <Text style={styles.label}>Verification code</Text>

          <TextInput
            style={[
              styles.input,
              styles.code,
              { fontSize: 20 * fontScale },
            ]}
            value={code}
            onChangeText={v => setCode(v.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={8}
            autoComplete="one-time-code"
            placeholder="12345678"
            accessibilityLabel="8-digit verification code"
          />

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}

          {message ? (
            <Text style={styles.subtitle}>
              {message}
            </Text>
          ) : null}

          <Pressable
            style={styles.button}
            disabled={busy}
            accessibilityRole="button"
            onPress={() => { void verify(); }}
          >
            <Text style={styles.buttonText}>
              {busy ? 'Please wait...' : 'Verify Email'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.resend}
            disabled={busy}
            accessibilityRole="button"
            onPress={() => { void resend(); }}
          >
            <Text style={styles.link}>Resend Code</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.surface,
  },
  content: {
    padding: 24,
    paddingBottom: 56,
  },
  back: {
    width: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: C.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 29,
    fontWeight: '600',
    color: C.primaryText,
    marginTop: 22,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: C.secondaryText,
    marginTop: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  label: {
    fontSize: 14,
    color: C.primaryText,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    color: C.primaryText,
  },
  code: {
    textAlign: 'center',
    letterSpacing: 4,
  },
  error: {
    color: C.error,
    fontSize: 13,
    marginTop: 12,
  },
  button: {
    minHeight: 52,
    backgroundColor: C.darkBlue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resend: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    color: C.darkBlue,
    fontSize: 14,
    fontWeight: '700',
  },
});
