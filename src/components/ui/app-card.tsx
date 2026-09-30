import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type PressableStateCallbackType,
} from "react-native";
import { theme } from "@/constants/theme";

type AppCardProps = PressableProps & {
  children: ReactNode;
};

export default function AppCard({ children, style, ...props }: AppCardProps) {
  const pressableStyle =
    typeof style === "function"
      ? (state: PressableStateCallbackType) => [
          styles.card,
          style(state) as any,
        ]
      : [styles.card, style];

  return (
    <Pressable {...props} style={pressableStyle}>
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
