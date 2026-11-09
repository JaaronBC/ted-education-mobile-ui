import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { AppText as Text } from '../ui/AppText';
import { theme } from '../../constants/theme';

const C = theme.colors;

type Provider = 'Google' | 'Apple' | 'Facebook';

type Props = {
  mode?: 'login' | 'register';
};

export default function SocialLoginButtons({
  mode = 'login',
}: Props) {
  const handlePress = (provider: Provider) => {
    Alert.alert(
      `${provider} Sign-In`,
      `${provider} authentication will be available soon. ` +
      'OAuth integration has not been configured yet.',
      [{ text: 'OK' }],
    );
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
        onPress={() => handlePress('Google')}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        <View style={styles.iconContainer}>
          <Text style={styles.googleIcon}>G</Text>
        </View>
        <Text style={styles.buttonText}>
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => handlePress('Apple')}
        accessibilityRole="button"
        accessibilityLabel="Continue with Apple"
      >
        <View style={styles.iconContainer}>
          <Text style={styles.appleIcon}>●</Text>
        </View>
        <Text style={styles.buttonText}>
          Continue with Apple
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => handlePress('Facebook')}
        accessibilityRole="button"
        accessibilityLabel="Continue with Facebook"
      >
        <View style={styles.iconContainer}>
          <View style={styles.facebookIcon}>
            <Text style={styles.facebookLetter}>f</Text>
          </View>
        </View>
        <Text style={styles.buttonText}>
          Continue with Facebook
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
  appleIcon: {
    fontSize: 21,
    color: '#111111',
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
    width: 23,
    height: 23,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  facebookLetter: {
    color: '#FFFFFF',
    fontSize: 23,
    lineHeight: 25,
    fontWeight: '800',
  },
  note: {
    color: C.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});
