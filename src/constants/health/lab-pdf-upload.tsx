import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { theme } from "@/constants/theme";
import { uploadLabPdf } from "@/services/apiLabs";

export default function LabPdfUpload() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      const pdf = result.assets[0];

      setUploading(true);
      setMessage("Uploading PDF...");

      await uploadLabPdf(pdf);

      setMessage("PDF uploaded successfully!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, uploading && styles.disabledButton]}
        onPress={handleUpload}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel="Upload lab PDF"
      >
        {uploading ? (
          <ActivityIndicator color={theme.colors.background} />
        ) : (
          <Text style={styles.buttonText}>Upload Lab Report</Text>
        )}
      </Pressable>

      {message !== "" && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primaryBlue,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    minWidth: 220,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    ...theme.typography.button,
    textAlign: "center",
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    textAlign: "center",
  },
});
