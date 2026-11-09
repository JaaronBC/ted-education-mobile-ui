import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@expo/ui/community/slider';
import { Minus, Plus, RotateCcw } from 'lucide-react-native';
import { AppText as Text } from '../../../components/ui/AppText';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { theme } from '../../../constants/theme';

const C = theme.colors;

export default function AccessibilitySettingsScreen() {
  const { fontScale, setFontScale, highContrast, setHighContrast } = useAccessibility();
  const panel = highContrast ? '#FFFFFF' : C.background;
  const border = highContrast ? '#161616' : C.border;
  const percent = Math.round(fontScale * 100);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.screen, highContrast && { backgroundColor: '#FFFFFF' }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Adjust how text and information appear across TED Education. Your choices are saved on this device.</Text>
        <Text style={styles.section}>TEXT SIZE</Text>
        <View style={[styles.card, { backgroundColor: panel, borderColor: border }]}>
          <View style={styles.row}>
            <Text style={styles.label}>Font size</Text>
            <Text style={styles.percent}>{percent}%</Text>
          </View>
          <View style={styles.adjustRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Decrease font size" accessibilityState={{ disabled: fontScale <= 1 }} onPress={() => setFontScale(fontScale - 0.05)} style={styles.stepButton}><Minus size={20} color={C.darkBlue} /></Pressable>
            <Slider style={styles.slider} minimumValue={1} maximumValue={2} step={0.05} value={fontScale} onValueChange={setFontScale} minimumTrackTintColor={C.darkBlue} />
            <Pressable accessibilityRole="button" accessibilityLabel="Increase font size" accessibilityState={{ disabled: fontScale >= 2 }} onPress={() => setFontScale(fontScale + 0.05)} style={styles.stepButton}><Plus size={20} color={C.darkBlue} /></Pressable>
          </View>
          <View style={styles.endpoints}><Text style={styles.help}>100% · Default</Text><Text style={styles.help}>200% · Maximum</Text></View>
          <Pressable accessibilityRole="button" onPress={() => setFontScale(1)} style={styles.reset}><RotateCcw size={16} color={C.darkBlue} /><Text style={styles.resetText}>Reset text size</Text></Pressable>
        </View>

        <Text style={styles.section}>DISPLAY</Text>
        <View style={[styles.card, { backgroundColor: panel, borderColor: border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.label}>High contrast</Text>
              <Text style={styles.help}>Use stronger text contrast for easier reading.</Text>
            </View>
            <Switch value={highContrast} onValueChange={setHighContrast} accessibilityLabel="High contrast" trackColor={{ false: '#C8D4DC', true: C.primaryBlue }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.section}>READING SAMPLE</Text>
        <View style={[styles.sample, { backgroundColor: panel, borderColor: border, borderWidth: highContrast ? 2 : 1 }]}>
          <Text style={styles.sampleHeading}>Thyroid Eye Disease</Text>
          <Text style={styles.sampleBody}>Learn about TED, understand your symptoms, and prepare questions for your doctor.</Text>
        </View>
        <Text style={styles.bottomNote}>The app also respects your device's accessibility settings. Larger text may wrap onto additional lines.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 },
  intro: { fontSize: 14, lineHeight: 22, color: C.secondaryText },
  section: { fontSize: 11, fontWeight: '700', color: C.darkBlue, letterSpacing: 1.5, marginTop: 26, marginBottom: 11 },
  card: { padding: 18, borderWidth: 1, borderRadius: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 16, fontWeight: '700', color: C.primaryText },
  percent: { fontSize: 19, fontWeight: '700', color: C.darkBlue },
  adjustRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 6 },
  slider: { flex: 1, height: 48 },
  stepButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: C.lightBlue },
  endpoints: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  help: { fontSize: 12, lineHeight: 18, color: C.secondaryText, marginTop: 3 },
  reset: { marginTop: 18, minHeight: 44, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: C.darkBlue, fontWeight: '700', fontSize: 13 },
  sample: { padding: 20, borderRadius: 18 },
  sampleHeading: { fontSize: 20, fontWeight: '700', color: C.primaryText },
  sampleBody: { fontSize: 16, lineHeight: 26, color: C.secondaryText, marginTop: 12 },
  bottomNote: { marginTop: 18, color: C.secondaryText, fontSize: 12, lineHeight: 19 },
});
