
import {
  TextInput,
  StyleSheet,
  type TextInputProps,
} from 'react-native';

import { useLanguage } from '@/i18n/LanguageContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';

type AccessibleInputProps = TextInputProps & {
  labelKey: string;
  labelContext?: string;
};

export function AccessibleInput({
  labelKey,
  labelContext,
  style,
  accessibilityLabel,
  placeholder,
  ...props
}: AccessibleInputProps) {
  const { t } = useLanguage();
  const { fontScale, highContrast } = useAccessibility();

  const flattened = StyleSheet.flatten(style);
  const size = flattened?.fontSize ?? 14;

  const label = accessibilityLabel ?? [
    labelContext,
    t(labelKey),
  ].filter(Boolean).join(', ');

  return (
    <TextInput
      {...props}
      accessibilityLabel={label}
      allowFontScaling={props.allowFontScaling ?? true}
      placeholder={placeholder ? t(placeholder) : placeholder}
      placeholderTextColor={
        highContrast
          ? '#454545'
          : props.placeholderTextColor
      }
      style={[
        style,
        {
          fontSize: size * fontScale,
          ...(typeof flattened?.lineHeight === 'number'
            ? { lineHeight: flattened.lineHeight * fontScale }
            : {}),
          ...(highContrast
            ? {
                color: '#141414',
                backgroundColor: '#FFFFFF',
                borderColor: '#161616',
              }
            : {}),
        },
      ]}
    />
  );
}
