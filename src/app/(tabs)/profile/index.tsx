import { Fragment } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText as Text } from "../../../components/ui/AppText";
import { useSession } from "../../../contexts/SessionContext";
import { useAccessibility } from "../../../contexts/AccessibilityContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import {
  Accessibility, ArrowRight, Database, Info, Languages,
  LockKeyhole, ShieldCheck, UserRound, type LucideIcon,
} from "lucide-react-native";
import SettingsRow from "../../../components/profile/SettingsRow";
import { theme } from "../../../constants/theme";

const C = theme.colors;

type Setting = { title: string; description: string; icon: LucideIcon; href: Href };
const SECTIONS: { title: string; items: Setting[] }[] = [
  { title: "YOUR DETAILS", items: [
    { title: "Personal Information", description: "Name, photo and optional details", icon: UserRound, href: "/profile/personal" },
  ] },
  { title: "PREFERENCES", items: [
    { title: "Language", description: "Choose your preferred language", icon: Languages, href: "/profile/language" },
    { title: "Accessibility", description: "Text size and display options", icon: Accessibility, href: "/profile/accessibility" },
  ] },
  { title: "PRIVACY & SUPPORT", items: [
    { title: "Data Management", description: "Manage your app data", icon: Database, href: "/profile/data" },
    { title: "Privacy", description: "How your information is handled", icon: ShieldCheck, href: "/profile/privacy" },
    { title: "About", description: "About TED Education", icon: Info, href: "/profile/about" },
  ] },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { role, user, signOut } = useSession();
  const { highContrast } = useAccessibility();
  const anonymous = role === "anonymous";
  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, highContrast && { backgroundColor: "#FFFFFF" }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRule} />
        <Text style={styles.eyebrow}>YOUR TED EXPERIENCE</Text>
        <Text style={styles.heading}>My Profile</Text>
        <Text style={styles.subtitle}>A personal space for your health journey.</Text>

        <Pressable
          style={styles.identityCard}
          onPress={() => router.push(anonymous ? "/(auth)/login" : "/profile/personal")}
          accessibilityRole="button"
          accessibilityLabel={anonymous ? "Guest profile, sign in to manage your account" : "Open personal information"}
        >
          <View style={styles.avatar}><UserRound size={34} color={C.darkBlue} strokeWidth={1.8} /></View>
          <View style={styles.identityText}>
            <Text style={styles.identityName}>{anonymous ? "Guest" : (user?.fullName ?? "My account")}</Text>
            <View style={styles.guestBadge}><View style={styles.guestDot} /><Text style={styles.guestText}>{anonymous ? "Browsing without an account" : "Signed in"}</Text></View>
          </View>
          <ArrowRight size={21} color={C.primaryBlue} />
        </Pressable>

        {anonymous && <View style={styles.accountCard}>
          <View style={styles.accountIcon}><LockKeyhole size={21} color={C.darkBlue} /></View>
          <View style={styles.accountCopy}>
            <Text style={styles.accountHeading}>Save your account details</Text>
            <Text style={styles.accountDescription}>Explore TED without signing in. Sign in to manage your account information. Account features require server authentication.</Text>
          </View>
          <Pressable style={styles.signInButton} onPress={() => router.push("/(auth)/login")} accessibilityRole="button" accessibilityLabel="Sign in to your account">
            <Text style={styles.signInText}>Sign in</Text><ArrowRight size={17} color="#FFFFFF" />
          </Pressable>
        </View>}

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, i) => (
                <Fragment key={item.title}>
                  <SettingsRow icon={item.icon} title={item.title} description={item.description} onPress={() => router.push(anonymous && item.title === "Personal Information" ? "/(auth)/login" : item.href)} />
                  {i !== section.items.length - 1 && <View style={styles.separator} />}
                </Fragment>
              ))}
            </View>
          </View>
        ))}

        {!anonymous && (
          <Pressable
            style={styles.signInButton}
            onPress={() => { void signOut(); }}
            accessibilityRole="button"
          >
            <Text style={styles.signInText}>Sign out</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 38 },
  brandRule: { width: 40, height: 4, borderRadius: 4, backgroundColor: C.tanAccent, marginBottom: 18 },
  eyebrow: { color: C.darkBlue, fontSize: 11, fontWeight: "700", letterSpacing: 2.0 },
  heading: { color: C.primaryText, fontSize: 31, fontWeight: "600", fontFamily: "Georgia", marginTop: 7 },
  subtitle: { color: C.secondaryText, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 22 },
  identityCard: { backgroundColor: C.background, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 15, flexDirection: "row", alignItems: "center" },
  avatar: { height: 60, width: 60, borderRadius: 30, backgroundColor: C.lightBlue, alignItems: "center", justifyContent: "center" },
  identityText: { flex: 1, paddingLeft: 14 },
  identityName: { fontSize: 19, fontWeight: "700", color: C.primaryText, marginBottom: 7 },
  guestBadge: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  guestDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.tanAccent, marginRight: 6 },
  guestText: { fontSize: 11, color: C.secondaryText },
  accountCard: { marginTop: 15, padding: 19, borderRadius: 20, backgroundColor: C.lightBlue, flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderColor: C.border },
  accountIcon: { height: 40, width: 40, borderRadius: 12, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  accountCopy: { flex: 1, paddingLeft: 12 },
  accountHeading: { fontSize: 16, fontWeight: "700", color: C.primaryText },
  accountDescription: { color: C.secondaryText, fontSize: 12, lineHeight: 19, marginTop: 6 },
  signInButton: { marginTop: 17, width: "100%", minHeight: 45, borderRadius: 12, backgroundColor: C.darkBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  signInText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  section: { marginTop: 24 },
  sectionTitle: { color: C.secondaryText, fontWeight: "700", fontSize: 11, letterSpacing: 1.6, marginBottom: 11, marginLeft: 3 },
  sectionCard: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF", borderColor: C.border, borderWidth: 1 },
  separator: { marginHorizontal: 17, height: StyleSheet.hairlineWidth, backgroundColor: C.border },
  footer: { textAlign: "center", color: "#8995A0", fontSize: 11, marginTop: 26 },
});
