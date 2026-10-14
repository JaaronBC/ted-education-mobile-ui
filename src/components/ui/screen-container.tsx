import { ScrollView, StyleSheet, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";

type ScreenContainerProps = ViewProps & {
  scrollable?: boolean;
};

export default function ScreenContainer({
  children,
  style,
  scrollable = false,
  ...props
  // makes screen scrollable if scrollable prop is true, otherwise just a view
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContainer, style]}
          {...props}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, style]} {...props}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Non-scrollable container styles
  container: {
    flex: 1,
    width: "100%",
    maxWidth: theme.layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: theme.layout.screenPadding,
  },
  // Scrollable container styles
  scrollView: {
    flex: 1,
  },

  scrollContainer: {
    width: "100%",
    maxWidth: theme.layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: theme.layout.screenPadding,
  },
});
