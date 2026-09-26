
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
        borderRadius: theme.borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },

  secondaryButton: {
    backgroundColor: theme.colors.tanAccent,
    borderWidth: 1,
    borderColor: theme.colors.tanAccent,
  },

  disabledButton: {
    backgroundColor: theme.colors.border,
  },

  text: {
    ...theme.typography.button,
  },

  secondaryText: {
    color: theme.colors.background,
  },

  disabledText: {
    color: theme.colors.secondaryText,
  },
});

