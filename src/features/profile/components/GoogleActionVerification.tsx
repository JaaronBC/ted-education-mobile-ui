import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText as Text } from '../../../components/ui/AppText';

import type {
  useGoogleActionChallenge,
} from '../hooks/useGoogleActionChallenge';

import { theme } from '../../../constants/theme';

const C = theme.colors;

type Props = {
  verification: ReturnType<
    typeof useGoogleActionChallenge
  >;
  disabled?: boolean;
};

export default function GoogleActionVerification({
  verification,
  disabled = false,
}: Props) {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const {
    challenge,
    emailCode,
    setEmailCode,
    requestCode,
    remainingSeconds,
    resendSeconds,
    foreground,
    busy,
    error,
  } = verification;

  if (!foreground) return null;

  const blocked = disabled || busy;
  const resendBlocked = blocked || resendSeconds > 0;

  const expired = Boolean(
    challenge && remainingSeconds <= 0,
  );

  const minutes = Math.floor(
    remainingSeconds / 60,
  );

  const seconds = String(
    remainingSeconds % 60,
  ).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{tr10("Identity verification")} </Text>

      <Text style={styles.description}>{t12("Verify your linked Google account and enter the code sent to your TED account email.")}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tr10("Verify Google and send code")}
        accessibilityState={{
          disabled: resendBlocked,
          busy,
        }}
        disabled={resendBlocked}
        style={[
          styles.googleButton,
          resendBlocked && styles.disabled,
        ]}
        onPress={() => {
          void requestCode();
        }}
      >
        {busy ? (
          <ActivityIndicator color={C.darkBlue} />
        ) : (
          <>
            <Text style={styles.googleIcon}>G</Text>

            <Text style={styles.buttonText}>
              {resendSeconds > 0
                ? 'Resend available in ' + resendSeconds + 's'
                : challenge
                  ? tr10("Request another code")
                  : tr10("Verify Google and send code")}
            </Text>
          </>
        )}
      </Pressable>

      {challenge && !expired && (
        <>
          <Text style={styles.description}>{t12("A verification code was sent to your account email.")}</Text>

          <Text style={styles.label}>{tr10("Email verification code")} </Text>

          <TextInput
            accessibilityLabel={tr10("Email verification code")}
            style={styles.input}
            value={emailCode}
            onChangeText={setEmailCode}
            keyboardType="number-pad"
            maxLength={8}
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="one-time-code"
            secureTextEntry
            editable={!blocked}
            placeholder={tr10("8-digit code")}
            placeholderTextColor={C.secondaryText}
          />

          <Text style={styles.description}>
            {'Code expires in ' + minutes + ':' + seconds}
          </Text>
        </>
      )}

      {expired && (
        <Text style={styles.error}>{tr10("Your code has expired. Request another code.")} </Text>
      )}

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={styles.error}
        >
          {t12(error)}
        </Text>
      ) : null}

      <Text style={styles.description}>{tr10("Do not share your verification code.")} </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },

  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primaryText,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: C.secondaryText,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primaryText,
  },

  googleButton: {
    flexDirection: 'row',
    minHeight: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  googleIcon: {
    color: '#4285F4',
    fontSize: 23,
    fontWeight: '800',
  },

  buttonText: {
    color: C.darkBlue,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 17,
    color: C.primaryText,
  },

  error: {
    color: C.error,
    fontSize: 13,
    lineHeight: 19,
  },

  disabled: {
    opacity: 0.5,
  },
});
