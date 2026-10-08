import type { ReactNode } from "react";
import { Pressable, StyleSheet, type PressableProps } from "react-native";
import { theme } from "@/constants/theme";

type AppCardProps = {
  children: ReactNode;
  onPress?: () => void;
};
export default function AppCard({ children, onPress }: AppCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.sm,
  },
});
