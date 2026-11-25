import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { AppText as Text } from '../../../components/ui/AppText';
import { theme } from '../../../constants/theme';
import { useRouter } from 'expo-router';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useSession } from '../../../contexts/SessionContext';
import '../services/googleSignIn';

const C = theme.colors;




type Props = {
  mode?: 'login' | 'register';
};

export default function SocialLoginButtons({
  mode = 'login',
}: Props) {
  const { tr: tr10 } = useLocale10();

  const router = useRouter();
  const { loginWithGoogleToken } = useSession();
  const [googleBusy, setGoogleBusy] = useState(false);

  const handleGooglePress = async () => {
    if (googleBusy) return;
    setGoogleBusy(true);

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      // The user cancelled account selection.
      if (!isSuccessResponse(response)) return;

      const idToken = response.data.idToken;

      if (!idToken) {
        throw new Error('Google did not return an ID token.');
      }

      const next = await loginWithGoogleToken(idToken);

      router.replace((next === 'mfa' ? '/(auth)/verify-2fa' : next === 'onboarding' ? '/(setup)/your-name' : '/(tabs)/home') as never);
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }

      Alert.alert(
        'Google sign-in failed',
        error instanceof Error
          ? error.message
          : 'Please try again.',
      );
    } finally {
      setGoogleBusy(false);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.line} />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => { void handleGooglePress(); }}
        disabled={googleBusy}
        accessibilityRole="button"
        accessibilityLabel={tr10("Continue with Google")}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.googleIcon}>G</Text>
        </View>
        <Text style={styles.buttonText}>
          {googleBusy ? tr10("Signing in...") : tr10("Continue with Google")}
        </Text>
      </Pressable>



      <Text style={styles.note}>
        {mode === 'register'
          ? 'Choose how you would like to create your account.'
          : 'Choose another way to sign in.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    gap: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    color: C.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  iconContainer: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: C.primaryText,
    fontSize: 15,
    fontWeight: '600',
    minWidth: 175,
  },
  googleIcon: {
    fontSize: 23,
    fontWeight: '800',
    color: '#4285F4',
  },
  note: {
    color: C.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});
