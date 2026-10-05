const colors = {
  primaryBlue: "#618FA7",
  darkBlue: "#3F6F86",
  lightBlue: "#EAF2F5",
  tanAccent: "#CFB990",
  lightTan: "#F4EFE6",
  background: "#FFFFFF",
  surface: "#F7F8F8",
  primaryText: "#1F2933",
  secondaryText: "#5F6B73",
  border: "#D8E0E4",
  success: "#2E7D32",
  warning: "#A66A00",
  error: "#B42318",
} as const;

export const theme = {
  colors,

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  /*
  Typography system to keep consistent text styles across the app
  consistent
  Title Text Styles 
  */
  typography: {
    title: {
      fontFamily: "Georgia",
      fontSize: 32,
      fontWeight: "600",
      color: colors.darkBlue,
    },

    subtitle: {
      fontFamily: "Georgia",
      fontSize: 18,
      fontWeight: "400",
      color: colors.primaryBlue,
    },
    //Heading Text Styles for headings and App Card text
    heading: {
      fontFamily: "Georgia",
      fontSize: 20,
      fontWeight: "700",
      color: colors.darkBlue,
    },

    subheading: {
      fontFamily: "Georgia",
      fontSize: 16,
      fontWeight: "400",
      color: colors.primaryBlue,
    },
    //Body Text Styles
    body: {
      fontFamily: "Georgia",
      fontSize: 16,
      fontWeight: "400",
      color: colors.primaryText,
    },
    caption: {
      fontFamily: "Georgia",
      fontSize: 12,
      fontWeight: "400",
      color: colors.secondaryText,
    },
    //Button text style
    button: {
      fontFamily: "Georgia",
      fontSize: 20,
      fontWeight: "600",
      color: colors.background,
    },
  },

  layout: {
    screenPadding: 16,
    maxContentWidth: 600,
    headerHeight: 56,
  },
} as const;

export type Theme = typeof theme;
