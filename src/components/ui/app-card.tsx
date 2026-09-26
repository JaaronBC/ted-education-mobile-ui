import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

type AppCardProps = ViewProps & {
  children: ReactNode;
};

export default function AppCard({ children, style, ...props }: AppCardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
  },
});