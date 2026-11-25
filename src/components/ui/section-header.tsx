
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';

import { router, type Href } from 'expo-router';

import AppIcon from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/AppText';
import { theme } from '@/constants/theme';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/i18n/LanguageContext';

type SectionHeaderProps = {
  title: string;
  BackButton?: boolean;
  onBackPress?: () => void;
  backRoute?: Href;
};

export default function SectionHeader({
  title,
  BackButton = false,
  onBackPress,
  backRoute,
}: SectionHeaderProps) {
  const { highContrast } = useAccessibility();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {BackButton && (
        <Pressable
          onPress={
            onBackPress ??
            (() =>
              backRoute
                ? router.push(backRoute)
                : router.back())
          }
          accessibilityRole="button"
          accessibilityLabel={t('Go back')}
          style={styles.backButton}
        >
          <AppIcon
            icon="back"
            size={25}
            color={
              highContrast
                ? '#141414'
                : theme.colors.darkBlue
            }
            strokeWidth={2}
          />
        </Pressable>
      )}

      <AppText
        accessibilityRole="header"
        style={styles.title}
      >
        {t(title)}
      </AppText>

      {BackButton && (
        <View
          style={styles.spacer}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  backButton: {
    width: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  spacer: {
    width: 48,
  },

  title: {
    ...theme.typography.title,
    color: theme.colors.primaryText,
    textAlign: 'center',
    flex: 1,
    minWidth: 0,
  },
});
