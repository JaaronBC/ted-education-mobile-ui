
import { useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet,
  TextInput, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText as Text } from '../../components/ui/AppText';
import { authApi } from '../../services/authApi';
import { theme } from '../../constants/theme';

const C = theme.colors;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError('Enter a valid email.');
    }

    if (step === 'code') {
      if (!/^\d{8}$/.test(code)) {
        return setError('Enter the 8-digit code.');
      }
      if (password.length < 12 || password.length > 72) {
        return setError('Password must be 12-72 characters.');
      }
      if (password !== confirm) {
        return setError('Passwords do not match.');
      }
    }

    setBusy(true);
    setError('');

    try {
      if (step === 'email') {
        await authApi.forgotPassword(email.trim().toLowerCase());
        setStep('code');

        Alert.alert(
          'Check your email',
          'If an eligible account exists, a reset code will be sent.',
        );
      } else {
        await authApi.resetPassword(
          email.trim().toLowerCase(),
          code,
          password,
        );

        Alert.alert(
          'Password updated',
          'Sign in with your new password.',
          [{
            text: 'Sign in',
            onPress: () => router.replace('/(auth)/login'),
          }],
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={s.page}>
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.title}>
          {step === 'email' ? 'Forgot password?' : 'Reset password'}
        </Text>

        <Text style={s.info}>
          {step === 'email'
            ? 'Enter your email to request a code.'
            : 'Enter the email code and choose a new TED password. This can also add a password to an account created with Google.'}
        </Text>

        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          value={email}
          editable={step === 'email' && !busy}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email address"
        />

        {step === 'code' && (
          <View>
            <Text style={s.label}>8-digit code</Text>
            <TextInput
              style={s.input}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={8}
              placeholder="12345678"
            />

            <Text style={s.label}>New password (12+ characters)</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="New password"
            />

            <Text style={s.label}>Confirm password</Text>
            <TextInput
              style={s.input}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Confirm password"
            />
          </View>
        )}

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Pressable
          style={s.button}
          onPress={() => { void submit(); }}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={s.buttonText}>
                {step === 'email'
                  ? 'Email me a code'
                  : 'Reset password'}
              </Text>}
        </Pressable>

        {step === 'code' && (
          <Pressable onPress={() => {
            setStep('email');
            setCode('');
          }}>
            <Text style={s.link}>Request new code</Text>
          </Pressable>
        )}

        <Pressable onPress={() =>
          router.replace('/(auth)/login')
        }>
          <Text style={s.link}>Back to sign in</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.surface,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: C.primaryText,
  },
  info: {
    fontSize: 14,
    color: C.secondaryText,
    marginTop: 12,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primaryText,
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    color: C.primaryText,
  },
  error: {
    color: C.error,
    marginVertical: 10,
  },
  button: {
    height: 52,
    backgroundColor: C.darkBlue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  link: {
    color: C.darkBlue,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
