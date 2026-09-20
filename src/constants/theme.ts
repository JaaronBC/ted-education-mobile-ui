/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F2933',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#5F6B73',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
  TEDColors: {
    // Blue Colors
    primaryBlue: '#618FA7',
    darkBlue: '#3F6F86',
    lightBlue: '#EAF2F5',
    // Tan Colors
    tanAccent: '#CFB990',
    lightTan: '#F4EFE6',
    // Background Colors
    background: '#FFFFFF',
    surface: '#F7F8F8',
    // Text Colors
    text: '#1F2933',
    textSecondary: '#5F6B73',
    // Border Colors
    border: '#D8E0E4',
    // Status Colors
    success: '#2E7D32',
    warning: '#A66A00',
    error: '#B42318',
  }
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark & keyof typeof Colors.TEDColors;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Typography = {
  display: {
    fontFamily: Fonts?.serif,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '400',
  },

  h1: {
    fontFamily: Fonts?.serif,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '400',
  },

  h2: {
    fontFamily: Fonts?.serif,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
  },

  h3: {
    fontFamily: Fonts?.serif,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
  },

  body: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },

  bodySmall: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },

  label: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  button: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },

  caption: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
} as const;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
