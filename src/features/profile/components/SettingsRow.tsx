import { useLanguage as useLocale12 , useLanguage } from '@/i18n/LanguageContext';
import { AppText } from "../../../components/ui/AppText";
import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "../../../constants/theme";

const C = theme.colors;
interface SettingsRowProps { icon: LucideIcon; title: string; description?: string; onPress: () => void }
export default function SettingsRow({ icon: Icon, title, description, onPress }: SettingsRowProps) {
  const { t: t12 } = useLocale12();

  const { t } = useLanguage();
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={t(title)} accessibilityHint={description ? t(description) : undefined}>
      <View style={styles.iconBox}><Icon size={22} color={C.darkBlue} strokeWidth={1.9} /></View>
      <View style={styles.textColumn}>
        <AppText style={styles.title}>{t12(title)}</AppText>
        {description ? <AppText style={styles.description}>{t12(description)}</AppText> : null}
      </View>
      <ChevronRight size={19} color="#8A9BA7" strokeWidth={1.8} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { paddingHorizontal: 15, paddingVertical: 15, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", minHeight: 74 },
  iconBox: { width: 43, height: 43, borderRadius: 12, backgroundColor: C.lightBlue, alignItems: "center", justifyContent: "center", marginRight: 13 },
  textColumn: { flex: 1, paddingRight: 10 },
  title: { color: C.primaryText, fontSize: 15, fontWeight: "700" },
  description: { color: C.secondaryText, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
