import type { DocumentPickerAsset } from "expo-document-picker";
import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

export async function uploadLabPdf(pdf: DocumentPickerAsset) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API URL is not configured.");
  }

  const file = new File(pdf.uri);
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${apiUrl}/health/labs/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: HTTP ${response.status}`);
  }

  return response.json();
}
