import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  ShieldCheck,
  Database,
  LockKeyhole,
  HeartPulse,
  FileText,
  Trash2,
} from 'lucide-react-native';

import { AppText as Text } from '../../../components/ui/AppText';
import { theme } from '../../../constants/theme';

const C = theme.colors;

const SECTIONS = [
  {
    title: 'Information We Collect',
    icon: FileText,
    body: [
      'Account information may include your name, email address, gender selection, language preferences and accessibility settings.',
      'The account system also maintains authentication sessions, connected sign-in methods and security activity records.',
    ],
  },
  {
    title: 'Authentication and Security',
    icon: LockKeyhole,
    body: [
      'Passwords are stored as password hashes rather than plaintext passwords.',
      'The account system is designed to support session expiration, session revocation and optional two-factor authentication.',
      'These security controls remain subject to development and release validation.',
    ],
  },
  {
    title: 'Data Storage',
    icon: Database,
    body: [
      'Account records are managed through a PostgreSQL database.',
      'Mobile authentication credentials use secure device storage. Profile photos are managed through Cloudflare R2.',
      'No storage or authentication system can guarantee complete protection against every security risk.',
    ],
  },
  {
    title: 'Third-Party Services',
    icon: ShieldCheck,
    body: [
      'The application uses external infrastructure and email delivery services to support its operation.',
      'Google Sign-In is an optional authentication method. Google processes authentication information according to its own policies.',
      'The final list of service providers and their data-handling responsibilities must be reviewed before public release.',
    ],
  },
  {
    title: 'Health Information',
    icon: HeartPulse,
    body: [
      'The health features in this development build use sample data and temporary application state.',
      'Do not enter real patient information, medical documents or other sensitive health records.',
      'Medical document upload is unavailable until appropriate storage and access controls are implemented and validated.',
    ],
  },
  {
    title: 'Data Export',
    icon: FileText,
    body: [
      'The account data export feature is designed to provide account information, preferences, connected sign-in methods and recent security activity.',
      'Medical records and profile photo files are not included in the current export.',
      'Exported JSON files are not encrypted. Keep them in a secure location and share them only with trusted recipients.',
    ],
  },
  {
    title: 'Account Deletion',
    icon: Trash2,
    body: [
      'Eligible users can request account deletion after completing identity verification.',
      'Account deletion is designed to remove the account and associated authentication records from the active database.',
      'Profile photo removal may continue asynchronously. Previously downloaded files and retained backups are not automatically removed.',
    ],
  },
  {
    title: 'Data Retention',
    icon: Database,
    body: [
      'Security activity is scheduled for cleanup after approximately 90 days. Expired or revoked sessions become eligible for cleanup after seven days.',
      'Cleanup is asynchronous and may be delayed. Backup and external service retention policies require approval before production use.',
    ],
  },
  {
    title: 'Privacy Questions',
    icon: ShieldCheck,
    body: [
      'This development notice describes the intended data-handling practices of the current application.',
      'The project team must publish an approved privacy policy and official privacy contact information before public release.',
    ],
  },
];

export default function PrivacyScreen() {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.page}
    >
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <ShieldCheck
            size={38}
            color={C.darkBlue}
          />

          <Text style={styles.title}>{tr10("Privacy and Your Data")} </Text>

          <Text style={styles.description}>
            Learn how TED Education is designed
            to manage your personal information.
          </Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{tr10("Development Privacy Notice")} </Text>

          <Text style={styles.description}>{t12("This is not the final approved privacy policy. Do not use this development build to store real patient information.")}</Text>
        </View>

        {SECTIONS.map(section => {
          const Icon = section.icon;

          return (
            <View
              key={section.title}
              style={styles.card}
            >
              <View style={styles.headingRow}>
                <Icon
                  size={23}
                  color={C.darkBlue}
                />

                <Text style={styles.heading}>
                  {section.title}
                </Text>
              </View>

              {section.body.map((paragraph, index) => (
                <Text
                  key={index}
                  style={styles.description}
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          );
        })}

        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => {
            router.push('/(tabs)/profile/data');
          }}
        >
          <Text style={styles.buttonText}>{tr10("Manage My Account Data")} </Text>
        </Pressable>
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
  hero: {
    gap: 12,
    paddingVertical: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: C.primaryText,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: C.secondaryText,
  },
  notice: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#F4EFE6',
    gap: 8,
  },
  noticeTitle: {
    color: C.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heading: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: C.primaryText,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.darkBlue,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});
