import { Text, View, StyleSheet } from "react-native";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import ScreenContainer from "@/components/ui/screen-container";
import { theme } from "@/constants/theme";

export default function LanguageScreen() {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Language</Text>

        <Text style={styles.subtitle}>
          You can change this later in Settings.
        </Text>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>English</Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Español</Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>日本語</Text>
        </AppCard>

        <View style={styles.buttonContainer}>
          <AppButton
            title="Continue"
            variant="secondary"

            onPress={() => console.log("test")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: theme.spacing.xxl,
  },

  title: {
    marginTop: theme.spacing.xxl,
    ...theme.typography.title,
    marginBottom: theme.spacing.sm,

    textAlign: "center",
  },

  subtitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,

    textAlign: "center",
  },

  cardTitle: {
    ...theme.typography.heading,
    marginBottom: theme.spacing.xs,
  },

  cardSubtitle: {
    ...theme.typography.subheading,
  },

  buttonContainer: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },

  card: {
    marginBottom: theme.spacing.sm,
  },
});
