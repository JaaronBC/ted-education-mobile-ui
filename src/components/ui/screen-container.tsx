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
  // Makes screen scrollable if scrollable prop is true, otherwise just a regular view
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.container, style]}
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

  container: {
    flex: 1,
    width: "100%",
    maxWidth: theme.layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: theme.layout.screenPadding,
  },
});
