import type { DocumentPickerAsset } from 'expo-document-picker';

export async function uploadLabPdf(
  pdf: DocumentPickerAsset,
): Promise<never> {
  void pdf;

  throw new Error(
    'Medical document upload is disabled until secure storage is available.',
  );
}