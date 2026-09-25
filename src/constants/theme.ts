export const theme = {
  colors: {
    primaryBlue: '#618FA7',
    darkBlue: '#3F6F86',
    lightBlue: '#EAF2F5',

    tanAccent: '#CFB990',
    lightTan: '#F4EFE6',

    background: '#FFFFFF',
    surface: '#F7F8F8',

    primaryText: '#1F2933',
    secondaryText: '#5F6B73',
    border: '#D8E0E4',

    success: '#2E7D32',
    warning: '#A66A00',
    error: '#B42318',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },

  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  layout: {
    screenPadding: 16,
    maxContentWidth: 600,
    headerHeight: 56,
  },
} as const;

export type Theme = typeof theme;