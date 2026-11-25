
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Eye,
  Type,
  Contrast,
  BookOpen,
  Minus,
  Plus,
  RotateCcw,
  Check,
} from 'lucide-react-native';

import { AppText as Text } from '@/components/ui/AppText';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { theme } from '@/constants/theme';

const C = theme.colors;

const PRESETS = [
  1,
  1.25,
  1.5,
  1.75,
  2,
];

export default function AccessibilitySettingsScreen() {
  const { t, language } = useLanguage();

  const {
    fontScale,
    highContrast,
    ready,
    saveStatus,
    setFontScale,
    setHighContrast,
    retrySave,
  } = useAccessibility();

  const percent = Math.round(fontScale * 100);

  const accent = highContrast
    ? '#163F56'
    : C.darkBlue;

  const ink = highContrast
    ? '#141414'
    : C.primaryText;

  const muted = highContrast
    ? '#141414'
    : '#4D5E69';

  const border = highContrast
    ? '#161616'
    : C.border;

  const controlBorder = highContrast
    ? '#161616'
    : '#82949D';

  const page = highContrast
    ? '#FFFFFF'
    : '#F4F7F9';

  const soft = highContrast
    ? '#FFFFFF'
    : C.lightBlue;

  const cardStyle = [
    styles.card,
    {
      borderColor: border,
      borderWidth: highContrast ? 2 : 1,
    },
  ];

  function formatPercent(value: number): string {
    return new Intl.NumberFormat(language, {
      style: 'percent',
      maximumFractionDigits: 0,
    }).format(value);
  }

  const statusMessage =
    saveStatus === 'saving'
      ? t('Saving preferences...')
      : saveStatus === 'saved'
        ? t('Preferences saved.')
        : saveStatus === 'error'
          ? t('Could not save preferences.')
          : t('Preferences are saved automatically.');

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.screen,
        { backgroundColor: page },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      >
        {/* Welcome panel */}

        <View
          style={[
            styles.hero,
            {
              backgroundColor: soft,
              borderColor: border,
              borderWidth: highContrast ? 2 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: accent },
            ]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Eye size={25} color="#FFFFFF" />
          </View>

          <Text
            accessibilityRole="header"
            style={[
              styles.heroTitle,
              { color: ink },
            ]}
          >
            {t('Make TED easier to read')}
          </Text>

          <Text
            style={[
              styles.description,
              { color: muted },
            ]}
          >
            {t('Personalize your reading and display preferences.')}
          </Text>
        </View>

        {/* Text size */}

        <View style={cardStyle}>
          <View style={styles.cardHeading}>
            <Type size={23} color={accent} />

            <Text
              accessibilityRole="header"
              style={[
                styles.heading,
                { color: ink },
              ]}
            >
              {t('Text size')}
            </Text>
          </View>

          <View style={styles.fontControl}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Decrease font size')}
              accessibilityState={{
                disabled: !ready || percent <= 100,
              }}
              disabled={!ready || percent <= 100}
              onPress={() => {
                setFontScale(fontScale - 0.05);
              }}
              style={({ pressed }) => [
                styles.stepButton,
                {
                  backgroundColor: soft,
                  borderColor: controlBorder,
                },
                pressed && styles.pressed,
                (!ready || percent <= 100) &&
                  styles.disabled,
              ]}
            >
              <Minus size={24} color={accent} />
            </Pressable>

            <View style={styles.fontValue}>
              <Text
                style={[
                  styles.letters,
                  { color: accent },
                ]}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                Aa
              </Text>

              <Text
                accessibilityLiveRegion="polite"
                style={[
                  styles.percentage,
                  { color: ink },
                ]}
              >
                {formatPercent(fontScale)}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Increase font size')}
              accessibilityState={{
                disabled: !ready || percent >= 200,
              }}
              disabled={!ready || percent >= 200}
              onPress={() => {
                setFontScale(fontScale + 0.05);
              }}
              style={({ pressed }) => [
                styles.stepButton,
                {
                  backgroundColor: soft,
                  borderColor: controlBorder,
                },
                pressed && styles.pressed,
                (!ready || percent >= 200) &&
                  styles.disabled,
              ]}
            >
              <Plus size={24} color={accent} />
            </Pressable>
          </View>

          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={t('Text size')}
            style={styles.presets}
          >
            {PRESETS.map(value => {
              const selected =
                Math.abs(fontScale - value) < 0.001;

              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={formatPercent(value)}
                  accessibilityState={{
                    checked: selected,
                    disabled: !ready,
                  }}
                  disabled={!ready}
                  onPress={() => setFontScale(value)}
                  style={({ pressed }) => [
                    styles.preset,
                    {
                      backgroundColor: selected
                        ? accent
                        : '#FFFFFF',

                      borderColor: selected
                        ? accent
                        : controlBorder,

                      borderWidth: selected ? 2 : 1,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color: selected
                          ? '#FFFFFF'
                          : ink,
                      },
                    ]}
                  >
                    {formatPercent(value)}
                  </Text>

                  {selected && (
                    <Check
                      size={15}
                      color="#FFFFFF"
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: border },
            ]}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !ready || percent === 100,
            }}
            disabled={!ready || percent === 100}
            onPress={() => setFontScale(1)}
            style={({ pressed }) => [
              styles.reset,
              pressed && styles.pressed,
              (!ready || percent === 100) &&
                styles.disabled,
            ]}
          >
            <RotateCcw size={18} color={accent} />

            <Text
              style={[
                styles.resetText,
                { color: accent },
              ]}
            >
              {t('Reset text size')}
            </Text>
          </Pressable>
        </View>

        {/* Display preferences */}

        <View style={cardStyle}>
          <View style={styles.displayRow}>
            <View
              style={[
                styles.displayIcon,
                { backgroundColor: soft },
              ]}
            >
              <Contrast size={23} color={accent} />
            </View>

            <View style={styles.displayCopy}>
              <Text
                style={[
                  styles.heading,
                  { color: ink },
                ]}
              >
                {t('High contrast')}
              </Text>

              <Text
                style={[
                  styles.smallDescription,
                  { color: muted },
                ]}
              >
                {t('Use stronger text contrast for easier reading.')}
              </Text>
            </View>

            <View style={styles.switchTarget}>
              <Switch
                accessibilityLabel={t('High contrast')}
                accessibilityHint={t(
                  'Use stronger text contrast for easier reading.'
                )}
                value={highContrast}
                disabled={!ready}
                onValueChange={setHighContrast}
                trackColor={{
                  false: '#AAB8C1',
                  true: accent,
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#AAB8C1"
              />
            </View>
          </View>
        </View>

        {/* Live reading preview */}

        <View style={cardStyle}>
          <View style={styles.cardHeading}>
            <BookOpen size={22} color={accent} />

            <Text
              accessibilityRole="header"
              style={[
                styles.heading,
                { color: ink },
              ]}
            >
              {t('Live preview')}
            </Text>
          </View>

          <View
            style={[
              styles.preview,
              {
                backgroundColor: highContrast
                  ? '#FFFFFF'
                  : '#F4F7F9',

                borderColor: border,
                borderWidth: highContrast ? 2 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.previewAccent,
                { backgroundColor: accent },
              ]}
            />

            <Text
              accessibilityRole="header"
              style={[
                styles.previewTitle,
                { color: ink },
              ]}
            >
              {t('Your eye health')}
            </Text>

            <Text
              style={[
                styles.previewBody,
                { color: muted },
              ]}
            >
              {t(
                'Learn about TED, understand your symptoms, and prepare questions for your doctor.'
              )}
            </Text>
          </View>
        </View>

        {/* Persistence feedback */}

        <View style={styles.status}>
          {(!ready || saveStatus === 'saving') && (
            <ActivityIndicator color={accent} />
          )}

          {saveStatus === 'saved' && (
            <Check size={18} color={accent} />
          )}

          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.statusText,
              {
                color: saveStatus === 'error'
                  ? '#A12218'
                  : muted,
              },
            ]}
          >
            {!ready ? t('Loading...') : statusMessage}
          </Text>
        </View>

        {saveStatus === 'error' && (
          <Pressable
            accessibilityRole="button"
            onPress={retrySave}
            style={[
              styles.retry,
              { borderColor: controlBorder },
            ]}
          >
            <Text
              style={[
                styles.resetText,
                { color: accent },
              ]}
            >
              {t('Retry saving')}
            </Text>
          </Pressable>
        )}

        <Text
          style={[
            styles.note,
            { color: muted },
          ]}
        >
          {t(
            'Your preferences are saved to your account when signed in, or to this device when using guest mode.'
          )}
        </Text>

        <Text
          style={[
            styles.note,
            { color: muted },
          ]}
        >
          {t(
            "The app also respects your device's accessibility settings. Larger text may wrap onto additional lines."
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 16,
  },

  hero: {
    padding: 22,
    borderRadius: 24,
    gap: 13,
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 31,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    gap: 18,
  },

  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  heading: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    flexShrink: 1,
  },

  fontControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 6,
  },

  stepButton: {
    width: 52,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fontValue: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  letters: {
    fontSize: 29,
    fontWeight: '600',
    textAlign: 'center',
  },

  percentage: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  preset: {
    minWidth: 80,
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexGrow: 1,
    flexBasis: '29%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },

  presetText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },

  divider: {
    height: 1,
  },

  reset: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 9,
    paddingVertical: 8,
  },

  resetText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },

  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },

  displayIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  displayCopy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 120,
    gap: 5,
  },

  smallDescription: {
    fontSize: 13,
    lineHeight: 20,
  },

  switchTarget: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  preview: {
    padding: 18,
    borderRadius: 17,
    gap: 13,
  },

  previewAccent: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },

  previewTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },

  previewBody: {
    fontSize: 15,
    lineHeight: 24,
  },

  status: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  statusText: {
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'center',
  },

  retry: {
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  note: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  pressed: {
    opacity: 0.75,
  },

  disabled: {
    opacity: 0.5,
  },
});
