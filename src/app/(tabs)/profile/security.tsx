import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { authApi } from '../../../services/authApi';
import { theme } from '../../../constants/theme';
const C = theme.colors;
type Setup = { secret: string; uri: string };
export default function SecurityScreen() {
  const router = useRouter();
  const { user, getToken, replaceSession } = useSession();
  const [enabled, setEnabled] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (!user) return;
    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw Error('Sign in again');
        const info = await authApi.mfaStatus(token);
        if (active) { setEnabled(info.enabled); setRemaining(info.recoveryCodesRemaining); }
      } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Cannot load security settings'); }
    })();
    return () => { active = false; };
  }, [user, getToken]);

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
      setEnabled(true); setSetup(null); setCode('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Cannot enable 2FA'); }
    finally { setBusy(false); }
  }
  async function disable() {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      if (!token) throw Error('Sign in again');
      const result = await authApi.mfaDisable(token, code.trim());
      await replaceSession(result);
      setEnabled(false); setRemaining(0); setCode(''); setRecoveryCodes([]);
      Alert.alert('Two-factor authentication disabled', 'Your account no longer requires an authenticator code.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Cannot disable 2FA'); }
    finally { setBusy(false); }
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
        <Text style={styles.title}>Authenticator 2FA</Text>
        <Text style={styles.text}>Status: {enabled ? 'Enabled' : 'Not enabled'}</Text>
        <Text style={styles.text}>Use Google Authenticator, Microsoft Authenticator, or another TOTP-compatible app.</Text>
        {recoveryCodes.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Save your recovery codes now</Text>
            <Text style={styles.text}>Each code works only once. They will not be shown again. Keep them outside TED in a safe place.</Text>
            {recoveryCodes.map(c => <Text selectable key={c} style={styles.recovery}>{c}</Text>)}
            <Pressable style={styles.button} onPress={() => setRecoveryCodes([])}><Text style={styles.buttonText}>I saved these codes</Text></Pressable>
          </View>
        ) : null}
        {!enabled && !setup && (
          <Pressable style={styles.button} disabled={busy} onPress={() => { void beginSetup(); }}>
            <Text style={styles.buttonText}>{busy ? 'Loading...' : 'Enable two-factor authentication'}</Text>
          </Pressable>
        )}
        {!enabled && setup && (
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
        {enabled && recoveryCodes.length === 0 && (
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
