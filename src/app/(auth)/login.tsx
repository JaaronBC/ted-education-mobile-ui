import SocialLoginButtons from '../../components/profile/SocialLoginButtons';
import { useSession } from '../../contexts/SessionContext';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { AppText as Text } from '../../components/ui/AppText';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { theme } from '../../constants/theme';

const C = theme.colors;
export default function LoginScreen() {
  const router = useRouter();
  const { fontScale } = useAccessibility();
  const { login: authenticate } = useSession();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password) {
      setError('Enter a valid email address and password.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await authenticate(email.trim(), password);
      router.replace('/(tabs)/profile');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" style={styles.back} onPress={() => router.back()}><ArrowLeft size={24} color={C.darkBlue} /></Pressable>
        <View style={styles.symbol}><LockKeyhole size={32} color={C.darkBlue} /></View>
        <Text style={styles.eyebrow}>TED EDUCATION</Text>
        <Text style={styles.heading}>Sign in</Text>
        <Text style={styles.subtitle}>Access your account and manage your personal details.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputRow}><Mail size={19} color={C.primaryBlue} /><TextInput style={[styles.input, { fontSize: 15 * fontScale }]} value={email} onChangeText={(v) => {setEmail(v);setError('');}} keyboardType="email-address" placeholder="name@example.com" placeholderTextColor="#80909E" autoCapitalize="none" autoComplete="email" accessibilityLabel="Email address" /></View>
          <Text style={[styles.label, { marginTop: 19 }]}>Password</Text>
          <View style={styles.inputRow}><LockKeyhole size={19} color={C.primaryBlue} /><TextInput style={[styles.input, { fontSize: 15 * fontScale }]} value={password} onChangeText={(v) => {setPassword(v);setError('');}} secureTextEntry={!showPassword} placeholder="Password" placeholderTextColor="#80909E" autoComplete="current-password" accessibilityLabel="Password" /><Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} color={C.darkBlue}/> : <Eye size={18} color={C.darkBlue}/>}</Pressable></View>
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <Pressable style={styles.forgot} accessibilityRole="link" onPress={() => router.push('/(auth)/forgot-password')}><Text style={styles.link}>Forgot password?</Text></Pressable>
          <Pressable style={styles.button} accessibilityRole="button" onPress={submit} disabled={busy}><Text style={styles.buttonText}>{busy ? 'Signing in...' : 'Sign in'}</Text><ArrowRight size={18} color="#FFFFFF"/></Pressable>
        </View>
        <SocialLoginButtons mode="login" />
        <View style={styles.newAccount}><Text style={styles.detail}>Don't have an account? </Text><Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/register')}><Text style={styles.link}>Create account</Text></Pressable></View>
        <Pressable style={styles.guest} onPress={() => router.replace('/(tabs)/profile')} accessibilityRole="button"><Text style={styles.link}>Continue without signing in</Text></Pressable>
        
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  content: { flexGrow: 1, padding: 24, paddingBottom: 55 },
  back: { minHeight: 48, width: 48, justifyContent: 'center' },
  symbol: { width: 72, height: 72, borderRadius: 20, backgroundColor: C.lightBlue, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.9, color: C.darkBlue, marginTop: 24 },
  heading: { color: C.primaryText, fontSize: 31, fontFamily: 'Georgia', fontWeight: '600', marginTop: 7 },
  subtitle: { fontSize: 14, lineHeight: 22, color: C.secondaryText, marginTop: 8, marginBottom: 22 },
  card: { borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 19, backgroundColor: '#FFFFFF' },
  label: { color: C.primaryText, fontSize: 14, fontWeight: '700', marginBottom: 9 },
  inputRow: { borderWidth: 1, borderColor: C.border, borderRadius: 12, minHeight: 54, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, paddingVertical: 12, color: C.primaryText },
  forgot: { marginTop: 15, alignSelf: 'flex-end' },
  link: { color: C.darkBlue, fontSize: 14, fontWeight: '700' },
  button: { minHeight: 52, marginTop: 22, paddingHorizontal: 14, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: C.darkBlue, borderRadius: 12 },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  error: { color: C.error, fontSize: 12, lineHeight: 18, marginTop: 12 },
  newAccount: { marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  detail: { color: C.secondaryText, fontSize: 14 },
  guest: { minHeight: 48, marginTop: 14, alignItems: 'center', justifyContent: 'center' },
  safety: { color: C.secondaryText, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 24 },
});


