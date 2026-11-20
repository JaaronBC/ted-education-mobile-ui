import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { authApi } from '../../../services/authApi';
import { theme } from '../../../constants/theme';
const C = theme.colors;
type Setup = { secret: string; uri: string };
export default function SecurityScreen() {
  const router = useRouter();
  const { user, getToken, replaceSession, signOutAll } = useSession();
  const [mfaStatus, setMfaStatus] = useState<'loading' | 'enabled' | 'disabled' | 'error'>('loading');
  const [statusError, setStatusError] = useState('');
  const [statusReload, setStatusReload] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryTotp, setRecoveryTotp] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;

    if (!user) return;

    setMfaStatus('loading');
    setStatusError('');

    void (async () => {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error('Sign in again');
        }

        const info = await authApi.mfaStatus(token);

        if (active) {
          setRemaining(info.recoveryCodesRemaining);
          setMfaStatus(
            info.enabled ? 'enabled' : 'disabled'
          );
        }
      } catch (e) {
        if (active) {
          setRemaining(0);
          setMfaStatus('error');
          setStatusError(
            e instanceof Error
              ? e.message
              : 'Cannot load security settings'
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [user?.id, getToken, statusReload]);

  async function beginSetup() {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      if (!token) throw Error('Sign in again');
      const result = await authApi.mfaSetup(token);
      setSetup(result); setCode('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Cannot start 2FA'); }
    finally { setBusy(false); }
  }
  async function enable() {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      if (!token) throw Error('Sign in again');
      const result = await authApi.mfaEnable(token, code.trim());
      await replaceSession(result);
      setRecoveryCodes(result.recoveryCodes);
      setRemaining(result.recoveryCodes.length);
      setMfaStatus('enabled'); setSetup(null); setCode('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Cannot enable 2FA'); }
    finally { setBusy(false); }
  }
  async function regenerateRecoveryCodes() {
    if (busy || mfaStatus !== 'enabled' || recoveryCodes.length > 0) return;

    const otp = recoveryTotp.trim();

    if (!/^[0-9]{6}$/.test(otp)) {
      setError('Enter the current 6-digit Authenticator code.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) throw Error('Sign in again');

      const result = await authApi.mfaRegenerateRecoveryCodes(token, otp);

      setRecoveryCodes(result.recoveryCodes);
      setRemaining(result.recoveryCodesRemaining);
      setRecoveryTotp('');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not confirm recovery code rotation. Refresh 2FA status.'
      );
      setStatusReload(value => value + 1);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      if (!token) throw Error('Sign in again');
      const result = await authApi.mfaDisable(token, code.trim());
      await replaceSession(result);
      setMfaStatus('disabled'); setRemaining(0); setCode(''); setRecoveryCodes([]);
      Alert.alert('Two-factor authentication disabled', 'Your account no longer requires an authenticator code.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Cannot disable 2FA'); }
    finally { setBusy(false); }
  }
  async function handleSignOutAll() {
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      await signOutAll();
      router.replace('/welcome');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Please check your connection and try again.';

      setError('Could not confirm sign-out on all devices. ' + message);

      Alert.alert(
        'Sign-out not confirmed',
        'Other devices might still be signed in. Check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (!user) return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.text}>Sign in to manage account security.</Text>
      <Pressable onPress={() => router.replace('/(auth)/login')}><Text style={styles.link}>Sign in</Text></Pressable>
    </SafeAreaView>
  );
  return (
    <SafeAreaView edges={['bottom']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.heading}>Password</Text>

          <Text style={styles.text}>
            Update your password and sign out of every device.
          </Text>

          <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={() =>
              router.push('/profile/change-password' as Href)
            }
          >
            <Text style={styles.buttonText}>
              Change Password
            </Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Authenticator 2FA</Text>
        <Text style={styles.text}>
          Status: {mfaStatus === 'enabled'
            ? 'Enabled'
            : mfaStatus === 'disabled'
              ? 'Not enabled'
              : mfaStatus === 'loading'
                ? 'Checking...'
                : 'Unavailable'}
        </Text>

        {mfaStatus === 'loading' ? (
          <ActivityIndicator
            accessibilityLabel="Checking two-factor authentication status"
          />
        ) : null}

        {mfaStatus === 'error' ? (
          <View style={styles.card}>
            <Text style={styles.error}>
              Could not verify 2FA status. {statusError}
            </Text>

            <Text style={styles.text}>
              Enable and disable controls are unavailable
              until the server responds.
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={[
                styles.button,
                { opacity: busy ? 0.6 : 1 }
              ]}
              onPress={() =>
                setStatusReload(value => value + 1)
              }
            >
              <Text style={styles.buttonText}>
                Retry security status
              </Text>
            </Pressable>
          </View>
        ) : null}
        <Text style={styles.text}>Use Google Authenticator, Microsoft Authenticator, or another TOTP-compatible app.</Text>
        {recoveryCodes.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Save your recovery codes now</Text>
            <Text style={styles.text}>Each code works only once. They will not be shown again. Keep them outside TED in a safe place.</Text>
            {recoveryCodes.map(c => <Text selectable key={c} style={styles.recovery}>{c}</Text>)}
            <Pressable style={styles.button} onPress={() => setRecoveryCodes([])}><Text style={styles.buttonText}>I saved these codes</Text></Pressable>
          </View>
        ) : null}
        {mfaStatus === 'disabled' && !setup && (
          <Pressable style={styles.button} disabled={busy} onPress={() => { void beginSetup(); }}>
            <Text style={styles.buttonText}>{busy ? 'Loading...' : 'Enable two-factor authentication'}</Text>
          </Pressable>
        )}
        {mfaStatus === 'disabled' && setup && (
          <View style={styles.card}>
            <Text style={styles.heading}>1. Add TED to your Authenticator</Text>
            <View style={styles.qr}><QRCode value={setup.uri} size={205} /></View>
            <Text style={styles.text}>Scan this QR code on another device, or manually add the key below if Authenticator is on this phone.</Text>
            <Text selectable style={styles.secret}>{setup.secret}</Text>
            <Text style={styles.heading}>2. Enter the current 6-digit code</Text>
            <TextInput style={styles.input} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="123456" />
            <Pressable disabled={busy} style={styles.button} onPress={() => { void enable(); }}><Text style={styles.buttonText}>Confirm & enable</Text></Pressable>
            <Pressable onPress={() => { setSetup(null); setCode(''); }}><Text style={styles.link}>Cancel setup</Text></Pressable>
          </View>
        )}
        {mfaStatus === 'enabled' && recoveryCodes.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.heading}>Recovery codes</Text>
            <Text style={styles.text}>
              Unused recovery codes: {remaining}
            </Text>
            <Text style={styles.text}>
              Lost your recovery codes? Generate 8 new ones.
              All previous codes will stop working immediately.
              Have a safe place ready to save the new codes.
            </Text>
            <TextInput
              style={styles.input}
              value={recoveryTotp}
              onChangeText={setRecoveryTotp}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="off"
              placeholder="Current 6-digit Authenticator code"
              accessibilityLabel="Authenticator code for new recovery codes"
            />
            <Pressable
              accessibilityRole="button"
              disabled={busy || !/^[0-9]{6}$/.test(recoveryTotp.trim())}
              style={[
                styles.button,
                { opacity: busy || !/^[0-9]{6}$/.test(recoveryTotp.trim()) ? 0.5 : 1 }
              ]}
              onPress={() => Alert.alert(
                'Replace all recovery codes?',
                'Every existing recovery code will become invalid. Continue only if you can save the new codes.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Replace codes',
                    style: 'destructive',
                    onPress: () => { void regenerateRecoveryCodes(); }
                  }
                ]
              )}
            >
              <Text style={styles.buttonText}>
                Generate new recovery codes
              </Text>
            </Pressable>
          </View>
        )}
        {mfaStatus === 'enabled' && recoveryCodes.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.text}>Unused recovery codes: {remaining}</Text>
            <Text style={styles.heading}>Disable 2FA</Text>
            <Text style={styles.text}>Enter the current Authenticator code or a recovery code. Disabling 2FA reduces account security.</Text>
            <TextInput style={styles.input} value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} placeholder="Authenticator or recovery code" />
            <Pressable disabled={busy} style={[styles.button, { backgroundColor: C.error }]} onPress={() => {
              Alert.alert('Disable two-factor authentication?', 'Your next sign-in will no longer need an Authenticator code.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Disable', style: 'destructive', onPress: () => { void disable(); } },
              ]);
            }}><Text style={styles.buttonText}>Disable 2FA</Text></Pressable>
          </View>
        )}
        <Pressable
          disabled={busy}
          style={[
            styles.button,
            { backgroundColor: C.error, opacity: busy ? 0.6 : 1 },
          ]}
          onPress={() => {
            Alert.alert(
              'Sign out of all devices?',
              'This revokes every active TED session.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Sign out all',
                  style: 'destructive',
                  onPress: () => { void handleSignOutAll(); },
                },
              ],
            );
          }}
        >
          <Text style={styles.buttonText}>
            Sign out all devices
          </Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {busy ? <ActivityIndicator style={{ marginTop: 14 }} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.surface },
  content: { padding: 22, paddingBottom: 70 },
  title: { fontSize: 27, fontWeight: '700', color: C.primaryText, marginBottom: 15 },
  heading: { fontSize: 17, fontWeight: '700', color: C.primaryText, marginTop: 14, marginBottom: 12 },
  text: { fontSize: 14, lineHeight: 22, color: C.secondaryText, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderColor: C.border, borderWidth: 1, borderRadius: 16, padding: 18, marginTop: 20 },
  qr: { alignItems: 'center', backgroundColor: '#fff', padding: 20, marginVertical: 12 },
  secret: { fontSize: 16, fontWeight: '700', color: C.darkBlue, letterSpacing: 1, marginBottom: 20 },
  recovery: { fontSize: 17, fontWeight: '700', marginBottom: 8, color: C.primaryText },
  input: { borderWidth: 1, borderRadius: 12, borderColor: C.border, padding: 14, fontSize: 16, color: C.primaryText },
  button: { backgroundColor: C.darkBlue, padding: 16, marginTop: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  link: { textAlign: 'center', color: C.darkBlue, marginTop: 16 },
  error: { color: C.error, marginTop: 14 },
});
