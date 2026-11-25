import { useLanguage as useLocale12 , useLanguage as useLocale10 , useLanguage } from '@/i18n/LanguageContext';
import SocialLoginButtons from '../../features/auth/components/SocialLoginButtons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, Check, UserRound } from 'lucide-react-native';
import { AppText as Text } from '../../components/ui/AppText';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { authApi, type RegisterInput } from '../../services/authApi';
import { ApiError } from '../../services/apiClient';
import { theme } from '../../constants/theme';
const C = theme.colors;
const OPTIONS = ['Male', 'Female', 'Prefer not to say'] as const;



export default function RegisterScreen() {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();
  const { fontScale } = useAccessibility();
  const { t } = useLanguage();

  const duplicateAccountText = {
    help: t('Sign in to your existing account or reset your password.'),
    signIn: t('Sign In'),
    reset: t('Reset Password'),
  };
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [duplicateEmail, setDuplicateEmail] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) { setError('Full name is required (at least 2 characters).'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    if (password.length < 12) { setError('Use a password of at least 12 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');setDuplicateEmail(false);
    const selectedGender: RegisterInput['gender'] =
      gender === 'Male' ? 'MALE'
      : gender === 'Female' ? 'FEMALE'
      : gender === 'Prefer not to say' ? 'PREFER_NOT_TO_SAY'
      : undefined;

    setBusy(true);

    try {
      await authApi.register({
        fullName: name.trim(),
        email: email.trim(),
        password,
        ...(selectedGender ? { gender: selectedGender } : {}),
      });

      let requestFailed = false;

      try {
        await authApi.requestEmailVerification(email.trim());
      } catch {
        requestFailed = true;
      }

      router.replace({
        pathname: '/(auth)/verify-email',
        params: {
          email: email.trim().toLowerCase(),
          requestFailed: requestFailed ? '1' : '0',
        },
      } as never);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setDuplicateEmail(true);
        setError('This email is already registered.');

        Alert.alert(
          tr10("Account already exists"),
          tr10("This email is already registered. Sign in or reset your password."),
          [
            {
              text: tr10("Sign In"),
              onPress: () =>
                router.replace('/(auth)/login'),
            },
            {
              text: tr10("Reset Password"),
              onPress: () =>
                router.push('/(auth)/forgot-password'),
            },
            {
              text: tr10("Cancel"),
              style: 'cancel',
            },
          ],
        );
      } else if (e instanceof ApiError && e.status === 429) {
        setDuplicateEmail(false);

        const message =
          'Too many registration attempts. Please wait about one minute and try again.';

        setError(message);

        Alert.alert(
          tr10("Too many attempts"),
          message,
          [{ text: tr10("OK") }],
        );
      } else {
        setDuplicateEmail(false);
        setError(
          e instanceof Error ? e.message : 'Registration failed.'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" accessibilityLabel={tr10("Back")} style={styles.back} onPress={() => router.back()}><ArrowLeft size={24} color={C.darkBlue}/></Pressable>
        <View style={styles.symbol}><UserRound size={30} color={C.darkBlue}/></View>
        <Text style={styles.title}>{tr10("Create account")}</Text>
        <Text style={styles.subtitle}>Your personal details stay private. You can always explore TED without an account.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{tr10("Full name")} <Text style={styles.required}>*</Text></Text>
          <TextInput style={[styles.input, {fontSize:15*fontScale}]} value={name} onChangeText={(v) => {setName(v);setError('');setDuplicateEmail(false);}} placeholder={t('Enter your full name')} autoCapitalize="words" autoComplete="name" placeholderTextColor="#7B8A97" maxLength={100} accessibilityLabel="Full name, required" />
          <Text style={styles.label}>{tr10("Gender")} <Text style={styles.optional}>(optional)</Text></Text>
          <Pressable style={styles.select} onPress={() => setExpanded(!expanded)} accessibilityRole="button" accessibilityLabel={`Gender: ${gender || 'Not specified'}`}><Text style={{fontSize:15}}>{gender || 'Select gender'}</Text><ChevronDown size={20} color={C.darkBlue}/></Pressable>
          {expanded && <View style={styles.options}>{OPTIONS.map((item) => <Pressable key={item} style={styles.option} accessibilityRole="radio" accessibilityState={{ checked: gender === item }} onPress={() => {setGender(item);setExpanded(false);}}><Text style={{fontSize:14}}>{item}</Text>{gender===item && <Check size={18} color={C.darkBlue}/>}</Pressable>)}</View>}
          <Text style={styles.label}>{tr10("Email address")} <Text style={styles.required}>*</Text></Text>
          <TextInput style={[styles.input, {fontSize:15*fontScale}]} keyboardType="email-address" value={email} onChangeText={(v) => {setEmail(v);setError('');setDuplicateEmail(false);}} placeholder="name@example.com" placeholderTextColor="#7B8A97" autoCapitalize="none" autoComplete="email" accessibilityLabel="Email address, required"/>
          <Text style={styles.label}>{tr10("Password")} <Text style={styles.required}>*</Text></Text>
          <TextInput style={[styles.input, {fontSize:15*fontScale}]} value={password} onChangeText={(v) => {setPassword(v);setError('');setDuplicateEmail(false);}} placeholder={tr10("At least 12 characters")} placeholderTextColor="#7B8A97" secureTextEntry autoComplete="new-password" accessibilityLabel="Password, required"/>
          <Text style={styles.label}>{tr10("Confirm password")} <Text style={styles.required}>*</Text></Text>
          <TextInput style={[styles.input, {fontSize:15*fontScale}]} value={confirm} onChangeText={(v) => {setConfirm(v);setError('');setDuplicateEmail(false);}} placeholder={tr10("Repeat password")} placeholderTextColor="#7B8A97" secureTextEntry autoComplete="new-password" accessibilityLabel="Confirm password, required"/>
          {error ? <Text style={styles.error} accessibilityRole="alert">{t12(error)}</Text> : null}

          {duplicateEmail && (
            <View style={styles.duplicateActions}>
              <Text style={styles.duplicateHelp}>
                {duplicateAccountText.help}
              </Text>

              <Pressable
                accessibilityRole="link"
                style={styles.duplicateButton}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={styles.link}>
                  {duplicateAccountText.signIn}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="link"
                style={styles.duplicateButton}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.link}>
                  {duplicateAccountText.reset}
                </Text>
              </Pressable>
            </View>
          )}
          <Pressable accessibilityRole="button" style={styles.button} onPress={() => { void submit(); }} disabled={busy}><Text style={styles.buttonLabel}>{busy ? tr10("Creating account...") : tr10("Create account")}</Text></Pressable>
        </View>
        <SocialLoginButtons mode="register" />
        <View style={styles.footer}><Text style={{color:C.secondaryText,fontSize:14}}>{tr10("Already have an account?")} </Text><Pressable accessibilityRole="link" onPress={() => router.replace('/(auth)/login')}><Text style={styles.link}>{tr10("Sign in")}</Text></Pressable></View>
        <Pressable accessibilityRole="button" style={styles.guest} onPress={() => router.replace('/(tabs)/profile')}><Text style={styles.link}>{tr10("Continue as guest")}</Text></Pressable>
        <Text style={styles.footnote}>{tr10("Development build: use test credentials only.")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:C.surface},content:{padding:24,paddingBottom:52},back:{width:48,height:48,justifyContent:'center'},
  symbol:{marginTop:18,width:66,height:66,borderRadius:17,backgroundColor:C.lightBlue,justifyContent:'center',alignItems:'center'},
  title:{fontFamily:'Georgia',fontSize:30,fontWeight:'600',color:C.primaryText,marginTop:22},subtitle:{color:C.secondaryText,fontSize:14,lineHeight:22,marginTop:9,marginBottom:22},
  card:{backgroundColor:'#FFFFFF',borderRadius:18,borderWidth:1,borderColor:C.border,padding:18},
  label:{fontWeight:'700',fontSize:14,color:C.primaryText,marginTop:13,marginBottom:9},required:{color:C.error},optional:{fontSize:12,color:C.secondaryText,fontWeight:'400'},
  input:{borderWidth:1,borderColor:C.border,borderRadius:12,minHeight:52,paddingHorizontal:14,color:C.primaryText,backgroundColor:'#FFFFFF'},
  select:{minHeight:52,borderWidth:1,borderColor:C.border,borderRadius:12,paddingHorizontal:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  options:{borderWidth:1,borderColor:C.border,borderRadius:12,overflow:'hidden',marginTop:8},option:{minHeight:48,paddingHorizontal:14,paddingVertical:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:StyleSheet.hairlineWidth,borderColor:C.border},
  button:{marginTop:24,minHeight:52,borderRadius:12,backgroundColor:C.darkBlue,justifyContent:'center',alignItems:'center'},buttonLabel:{color:'#FFFFFF',fontSize:16,fontWeight:'700'},
  error:{color:C.error,fontSize:13,marginTop:12},
  duplicateActions:{marginTop:9,gap:8},
  duplicateHelp:{
    fontSize:13,
    color:C.secondaryText,
    lineHeight:20
  },
  duplicateButton:{
    paddingVertical:10,
    paddingHorizontal:12,
    borderWidth:1,
    borderColor:C.border,
    borderRadius:10,
    alignItems:'center'
  },
  footer:{flexDirection:'row',justifyContent:'center',flexWrap:'wrap',marginTop:24},link:{color:C.darkBlue,fontSize:14,fontWeight:'700'},guest:{minHeight:48,alignItems:'center',justifyContent:'center',marginTop:8},footnote:{marginTop:16,color:C.secondaryText,fontSize:12,lineHeight:19,textAlign:'center'},
});
