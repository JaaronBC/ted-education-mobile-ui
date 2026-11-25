import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { theme } from '../../../constants/theme';

const C = theme.colors;

const QUESTIONS = [
  {
    question: 'I forgot my password',
    answer:
      'Use the Forgot password option on the sign-in screen. ' +
      'You will need access to your registered email address.',
    action: 'Open sign-in',
    href: '/(auth)/login',
    requiresAccount: false,
  },
  {
    question: 'I noticed unfamiliar account activity',
    answer:
      'Review your security activity and active sessions. ' +
      'If you suspect unauthorized access, change your password ' +
      'and revoke sessions you do not recognize.',
    action: 'Review security activity',
    href: '/profile/security-activity',
    requiresAccount: true,
  },
  {
    question: 'I lost my authenticator',
    answer:
      'Use an unused recovery code when signing in. ' +
      'If you still have access to your authenticator, ' +
      'you can generate replacement recovery codes. ' +
      'Never share your recovery codes.',
    action: 'Manage two-factor authentication',
    href: '/profile/security',
    requiresAccount: true,
  },
  {
    question: 'How do I manage my Google account?',
    answer:
      'Connected Accounts allows eligible users to manage ' +
      'their Google sign-in method or set an account password.',
    action: 'Manage connected accounts',
    href: '/profile/connected-accounts',
    requiresAccount: true,
  },
  {
    question: 'How do I export or delete my data?',
    answer:
      'Open Data Management to review the available account ' +
      'export and deletion options. Identity verification is required.',
    action: 'Open Data Management',
    href: '/profile/data',
    requiresAccount: true,
  },
];

export default function SupportScreen() {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();
  const { user, loading } = useSession();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.page}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{tr10("How can we help?")} </Text>

        <Text style={styles.description}>
          Find answers to common account and application questions.
        </Text>

        {QUESTIONS.map(item => (
          <View
            key={item.question}
            style={styles.card}
          >
            <Text style={styles.heading}>
              {item.question}
            </Text>

            <Text style={styles.description}>
              {item.answer}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
              disabled={loading}
              style={[
                styles.button,
                loading && { opacity: 0.5 },
              ]}
              onPress={() => {
                router.push(
                  item.requiresAccount && !user
                    ? '/(auth)/login'
                    : item.href as Href,
                );
              }}
            >
              <Text style={styles.buttonText}>
                {item.action}
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.heading}>{tr10("Contact support")} </Text>

          <Text style={styles.description}>
            A public support contact has not yet been configured
            for this development build.
            If you are participating in project testing,
            contact the project team through your existing
            communication channel.
          </Text>

          <Text style={styles.description}>{t12("Do not send passwords, verification codes, recovery codes, or sensitive medical information in support messages.")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>{tr10("Medical questions")} </Text>

          <Text style={styles.description}>{t12("TED Education provides educational information. It does not provide medical diagnosis, treatment, or emergency services. Contact a qualified healthcare professional for medical concerns.")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.surface,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },

  title: {
    color: C.primaryText,
    fontSize: 26,
    fontWeight: '700',
  },

  heading: {
    color: C.primaryText,
    fontSize: 17,
    fontWeight: '700',
  },

  description: {
    color: C.secondaryText,
    fontSize: 14,
    lineHeight: 22,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    gap: 12,
  },

  button: {
    minHeight: 48,
    padding: 14,
    backgroundColor: C.lightBlue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: C.darkBlue,
    fontWeight: '700',
    textAlign: 'center',
  },
});
