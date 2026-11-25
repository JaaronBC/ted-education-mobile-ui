import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ReactNode } from 'react';
import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { theme } from '../../../constants/theme';

const C = theme.colors;

export default function AccountSettingsPage({
  children,
  guestDescription,
}: {
  children: ReactNode;
  guestDescription: string;
}) {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();
  const { user, loading } = useSession();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
      >
        {loading ? (
          <ActivityIndicator />
        ) : !user ? (
          <View style={styles.guest}>
            <Text style={styles.title}>{tr10("Sign in required")} </Text>

            <Text style={styles.description}>
              {t12(guestDescription)}
            </Text>

            <Pressable
              accessibilityRole="button"
              style={styles.button}
              onPress={() => {
                router.push('/(auth)/login');
              }}
            >
              <Text style={styles.buttonText}>{tr10("Sign in")} </Text>
            </Pressable>
          </View>
        ) : (
          children
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.surface,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },

  guest: {
    gap: 14,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
  },

  title: {
    color: C.primaryText,
    fontSize: 21,
    fontWeight: '700',
  },

  description: {
    color: C.secondaryText,
    fontSize: 14,
    lineHeight: 22,
  },

  button: {
    minHeight: 48,
    padding: 14,
    borderRadius: 12,
    backgroundColor: C.darkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
