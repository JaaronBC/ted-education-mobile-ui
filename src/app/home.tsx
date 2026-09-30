import { Text, View, StyleSheet } from "react-native";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import ScreenContainer from "@/components/ui/screen-container";
import { theme } from "@/constants/theme";

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>

        <Text style={styles.subtitle}>
          Learn. Track. Organize. Understand. Take control of your eye health
        </Text>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Learn</Text>
          <Text style={styles.cardSubtitle}>Education & Resources</Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Track</Text>
          <Text style={styles.cardSubtitle}>Symptoms, CAS & Photos</Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>My Health</Text>
          <Text style={styles.cardSubtitle}>Labs, imaging & Records</Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Treatment</Text>
          <Text style={styles.cardSubtitle}>Options & Guidance</Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Share With My Doctor</Text>
          <Text style={styles.cardSubtitle}>Export Your Summary</Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },

  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.sm,
  },

  subtitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
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
