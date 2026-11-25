import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export default function LabPdfUpload() {
  const { tr: tr10 } = useLocale10();

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{tr10("Medical document upload is unavailable in this development version. Do not select or upload real patient documents.")} </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  message: {
    color: theme.colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
  },
});
