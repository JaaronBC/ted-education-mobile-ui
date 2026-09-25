import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '@/constants/theme';

type AppButtonProps = {
  title: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onPress?: () => void;
};

export default function AppButton({
  title,
  variant = 'primary',
  disabled = false,
  onPress,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'secondary' && styles.secondaryText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    backgroundColor: theme.colors.primaryBlue,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButton: {
    backgroundColor: theme.colors.lightBlue,
    borderWidth: 1,
    borderColor: theme.colors.primaryBlue,
  },

  disabledButton: {
    backgroundColor: theme.colors.border,
  },

  text: {
    color: theme.colors.background,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },

  secondaryText: {
    color: theme.colors.darkBlue,
  },

  disabledText: {
    color: theme.colors.secondaryText,
  },
});