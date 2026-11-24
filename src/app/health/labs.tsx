import { Text, View, StyleSheet } from "react-native";
import LabPdfUpload from "@/constants/health/lab-pdf-upload";
import { theme } from "@/constants/theme";

export default function LabsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Labs</Text>
      <LabPdfUpload />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.layout.screenPadding,
    gap: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    textAlign: "center",
  },
});
