import { Text as NativeText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useLanguage } from '../../i18n/LanguageContext';

// Shared text primitive: applies the saved app font scale, including NativeWind text sizes.
// Normal OS font scaling remains enabled for accessibility.
export function AppText({ style, className, children, ...props }: TextProps & { className?: string }) {
  const { t } = useLanguage();
  const { fontScale, highContrast } = useAccessibility();
  const flattened = StyleSheet.flatten(style) as TextStyle | undefined;
  const classSize = className?.match(/(?:^|\s)text-\[(\d+(?:\.\d+)?)px\](?=\s|$)/);
  const classLine = className?.match(/(?:^|\s)leading-\[(\d+(?:\.\d+)?)px\](?=\s|$)/);
  const spacingLine = className?.match(/(?:^|\s)leading-(\d+)(?=\s|$)/);
  const size = typeof flattened?.fontSize === 'number' ? flattened.fontSize : classSize ? Number(classSize[1]) : 14;
  const height = typeof flattened?.lineHeight === 'number' ? flattened.lineHeight :
    classLine ? Number(classLine[1]) : spacingLine ? Number(spacingLine[1]) * 4 : undefined;
  const color = flattened?.color;
  const whiteText = color === '#FFFFFF' || color === '#ffffff' || color === '#FFF' || color === 'white' ||
    /(?:^|\s)(?:text-white|text-\[#(?:fff|ffffff)\])(?=\s|$)/i.test(className ?? '');
  const scaledStyle: TextStyle = {
    fontSize: size * fontScale,
    ...(height ? { lineHeight: height * fontScale } : { lineHeight: size * fontScale * 1.35 }),
    ...(highContrast && !whiteText ? { color: '#141A20' } : {}),
  };
  return <NativeText {...props} className={className} style={[style, scaledStyle]}>{typeof children === 'string' ? t(children) : children}</NativeText>;
}
