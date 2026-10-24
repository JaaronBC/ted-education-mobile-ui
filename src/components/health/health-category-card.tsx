import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, type Href } from "expo-router";
import { LucideIcon } from "lucide-react-native";
import AppCard from "@/components/ui/app-card";
import { theme } from "@/constants/theme";
import AppIcon from "../ui/app-icon";
// Define the props for the HealthCategoryCard component
type HealthCategoryCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  route: Href;
  children?: React.ReactNode;
};
// Main component for rendering health category cards
export default function HealthCategoryCard({
  title,
  description,
  icon: Icon,
  route,
  children,
}: HealthCategoryCardProps) {
  return (
    <Pressable
      onPress={() => router.push(route)}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${description}`}
    >
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.row}>
            <AppIcon icon={Icon} size={28} />

            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>
        </View>

        {children && (
          <View style={styles.summaryContainer}>
            <View style={styles.divider} />
            <View style={styles.summaryContent}>{children}</View>
          </View>
        )}
      </AppCard>
    </Pressable>
  );
}
// Define styles for the HealthCategoryCard component

const styles = StyleSheet.create({
  card: {
    padding: 0,
    backgroundColor: theme.colors.lightBlue,
    overflow: "hidden",
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.border,
  },
  summaryContainer: {
    backgroundColor: theme.colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  summaryContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  description: {
    ...theme.typography.subheading,
  },
});
