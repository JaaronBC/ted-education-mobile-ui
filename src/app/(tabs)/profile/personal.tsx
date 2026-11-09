import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Camera, ChevronDown, LockKeyhole, UserRound, Check } from 'lucide-react-native';
import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { theme } from '../../../constants/theme';

const C = theme.colors;
const GENDERS = ['Male', 'Female', 'Prefer not to say'] as const;
type Gender = typeof GENDERS[number] | '';

export default function PersonalInformationScreen() {
  const { role } = useSession();
  if (role === 'anonymous') return <Redirect href="/(auth)/login" />;
  return <PersonalForm />;
}

function PersonalForm() {
  const router = useRouter();
  const { fontScale } = useAccessibility();
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('');
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  const save = () => {
    if (fullName.trim().length < 2) {
      setError('Full name is required (at least 2 characters).');
      return;
    }
    setError('');
    // Profile-write endpoint and secure local persistence have not been implemented.
    Alert.alert('Account storage unavailable', 'Profile changes cannot be saved until authenticated profile storage is connected.');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.intro}>Manage your personal details and account security.</Text>
          <View style={styles.photoCard}>
            <View style={styles.avatar}><UserRound size={36} color={C.darkBlue} /></View>
            <View style={{ flex: 1, paddingLeft: 14 }}>
              <Text style={styles.photoTitle}>Profile photo</Text>
              <Text style={styles.note}>Choose or update your photo</Text>
            </View>
            <Pressable style={styles.photoButton} accessibilityRole="button" accessibilityLabel="Upload profile photo" onPress={() => Alert.alert('Profile photo', 'Photo uploading is not connected yet.')}>
              <Camera size={20} color={C.darkBlue} />
            </Pressable>
          </View>

          <Text style={styles.section}>PERSONAL DETAILS</Text>
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Full name <Text style={styles.required}>*</Text></Text>
            <TextInput style={[styles.input, { fontSize: 15 * fontScale, minHeight: 52 * fontScale }]} value={fullName} onChangeText={(v) => { setFullName(v); setError(''); }} placeholder="Enter your full name" placeholderTextColor="#7B8A97" autoCapitalize="words" autoComplete="name" maxLength={100} accessibilityLabel="Full name, required" />
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            <View style={styles.separator} />
            <Text style={styles.fieldLabel}>Gender <Text style={styles.optional}>(optional)</Text></Text>
            <Pressable style={styles.select} onPress={() => setExpanded(!expanded)} accessibilityRole="button" accessibilityLabel={`Gender: ${gender || 'Not specified'}`} accessibilityState={{ expanded }}>
              <Text style={styles.selectText}>{gender || 'Select gender'}</Text><ChevronDown size={19} color={C.darkBlue} />
            </Pressable>
            {expanded && <View style={styles.options}>{GENDERS.map((option) => (
              <Pressable key={option} style={styles.option} accessibilityRole="radio" accessibilityState={{ checked: gender === option }} onPress={() => { setGender(option); setExpanded(false); }}>
                <Text style={styles.selectText}>{option}</Text>{gender === option && <Check size={20} color={C.darkBlue} />}
              </Pressable>
            ))}</View>}
          </View>

          <Text style={styles.section}>ACCOUNT & SECURITY</Text>
          <Pressable style={styles.photoCard} accessibilityRole="button" accessibilityLabel="Change password" onPress={() => router.push('/(auth)/forgot-password')}>
            <View style={styles.smallIcon}><LockKeyhole size={22} color={C.darkBlue} /></View>
            <View style={{ flex: 1, marginLeft: 14 }}><Text style={styles.photoTitle}>Password and security</Text><Text style={styles.note}>Update account security settings</Text></View>
          </Pressable>
          <Pressable style={styles.primaryButton} accessibilityRole="button" onPress={save}>
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 56 },
  intro: { fontSize: 14, color: C.secondaryText, lineHeight: 22, marginBottom: 20 },
  photoCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18, borderColor: C.border, borderWidth: 1, backgroundColor: '#FFFFFF' },
  avatar: { width: 66, height: 66, borderRadius: 33, backgroundColor: C.lightBlue, justifyContent: 'center', alignItems: 'center' },
  photoTitle: { color: C.primaryText, fontSize: 16, fontWeight: '700' },
  note: { color: C.secondaryText, fontSize: 12, lineHeight: 18, marginTop: 5 },
  photoButton: { width: 46, height: 46, borderRadius: 12, backgroundColor: C.lightBlue, justifyContent: 'center', alignItems: 'center' },
  section: { marginTop: 26, marginBottom: 10, marginLeft: 3, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: C.darkBlue },
  formCard: { backgroundColor: '#FFFFFF', padding: 18, borderWidth: 1, borderColor: C.border, borderRadius: 18 },
  fieldLabel: { fontSize: 15, fontWeight: '700', color: C.primaryText, marginBottom: 11 },
  required: { color: C.error, fontWeight: '700' },
  optional: { fontSize: 12, fontWeight: '400', color: C.secondaryText },
  input: { borderColor: C.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 14, color: C.primaryText },
  error: { color: C.error, marginTop: 8, fontSize: 12 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginVertical: 20 },
  select: { borderWidth: 1, borderColor: C.border, borderRadius: 12, minHeight: 53, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, color: C.primaryText },
  options: { marginTop: 8, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden' },
  option: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: C.border },
  smallIcon: { width: 45, height: 45, borderRadius: 12, backgroundColor: C.lightBlue, justifyContent: 'center', alignItems: 'center' },
  primaryButton: { backgroundColor: C.darkBlue, minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
