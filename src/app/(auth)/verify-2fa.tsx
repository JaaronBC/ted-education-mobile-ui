import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText as Text } from '../../components/ui/AppText';
import { useSession } from '../../contexts/SessionContext';
import { theme } from '../../constants/theme';
const C = theme.colors;
export default function Verify2FAScreen() {
  const router = useRouter();
  const { pendingMfa, completeMfa, cancelMfa } = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const verify = async () => {
    if (!pendingMfa) { router.replace('/(auth)/login'); return; }
    setBusy(true); setError('');
    try {
      const next = await completeMfa(code.trim());
      router.replace((next === 'onboarding' ? '/(setup)/your-name' : '/(tabs)/home') as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally { setBusy(false); }
  };
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.panel}>
        <Text style={styles.title}>Two-factor verification</Text>
        <Text style={styles.body}>Open your Authenticator app and enter its 6-digit code. You can also enter a saved recovery code.</Text>
        <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} style={styles.input} placeholder="6-digit code or recovery code" accessibilityLabel="Authenticator or recovery code" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} disabled={busy || !pendingMfa} onPress={() => { void verify(); }}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify and sign in</Text>}
        </Pressable>
        <Pressable onPress={() => { cancelMfa(); router.replace('/(auth)/login'); }}>
          <Text style={styles.link}>Cancel and return to sign in</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.surface, padding: 24, justifyContent: 'center' },
  panel: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, padding: 24, borderRadius: 18 },
  title: { fontSize: 25, fontWeight: '700', color: C.primaryText },
  body: { fontSize: 14, lineHeight: 21, color: C.secondaryText, marginTop: 12, marginBottom: 24 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, color: C.primaryText, fontSize: 16 },
  error: { color: C.error, marginTop: 12 },
  button: { borderRadius: 12, backgroundColor: C.darkBlue, marginTop: 22, minHeight: 52, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 20, textAlign: 'center', color: C.darkBlue },
});
