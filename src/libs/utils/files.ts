import { Mimetype } from '../api/types';

/**
 * Downloads a PDF file from a blob response
 * @param pdfBlob - The PDF blob data
 * @param fileName - The desired filename for the downloaded file
 * @returns Promise<void>
 */
export const downloadPdf = async (
  pdfBlob: BlobPart,
  fileName: string,
): Promise<void> => {
  const blob = new Blob([pdfBlob], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Downloads an Excel file from a blob response
 * @param xlsxBlob - The Excel blob data
 * @param fileName - The desired filename for the downloaded file
 */
export const downloadExcel = (xlsxBlob: BlobPart, fileName: string): void => {
  const blob = new Blob([xlsxBlob], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Triggers a browser download for a CSV file from a Blob.
 * @param csvBlob - The CSV data as a BlobPart
 * @param fileName - The desired filename for the downloaded file
 */
export const downloadCsv = (csvBlob: BlobPart, fileName: string): void => {
  const blob = new Blob([csvBlob], {
    type: 'text/csv',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generates a filename for a concept snapshot
 * @param companyName - The company name
 * @param conceptTitle - The concept title
 * @returns string - The generated filename
 */
export const generateConceptSnapshotFileName = (
  companyName: string,
  conceptTitle: string,
): string => {
  const today = new Date();
  const readableDate = today.toISOString().split('T')[0].replace(/-/g, '');
  return `${companyName.toLowerCase()}-${conceptTitle.replace(/\s+/g, '-').toLowerCase()}-${readableDate}.pdf`;
};

/**
 * Converts a File object to a base64 string with proper MIME type handling
 * @param file The File object to convert
 * @returns A promise that resolves to an object containing the base64 data and file metadata
 */
export async function fileToBase64(file: File): Promise<{
  mediaData: string;
  mimetype: Mimetype;
  filename: string;
}> {
  return {
    mediaData: await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }),
    mimetype: file.type as unknown as Mimetype,
    filename: file.name,
  };
}

/**
 * Processes uploaded media file for sending
 */
export async function processMediaMessage(media: File | undefined) {
  if (!media) {
    return undefined;
  }

  const file = await fileToBase64(media);
  return {
    mediaData: file.mediaData,
    mimetype: file.mimetype,
    filename: file.filename,
  };
}

/**
 * Converts a base64 string to a Blob
 * @param base64 - The base64 string (with or without data URL prefix)
 * @param contentType - The MIME type of the content (default: 'application/pdf')
 * @returns Blob
 */
export function base64ToBlob(
  base64: string,
  contentType: string = 'application/pdf',
): Blob {
  // Remove the data URL prefix if present (e.g., "data:application/pdf;base64,")
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  // Decode base64 string
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

/**
 * Converts a base64 string to a File object
 * @param base64 - The base64 string (with or without data URL prefix)
 * @param filename - The desired filename
 * @param contentType - The MIME type of the content (default: 'application/pdf')
 * @returns File
 */
export function base64ToFile(
  base64: string,
  filename: string = 'download.pdf',
  contentType: string = 'application/pdf',
): File {
  const blob = base64ToBlob(base64, contentType);
  return new File([blob], filename, { type: contentType });
}

/**
 * Downloads a file from a base64 string
 * @param base64 - The base64 string (with or without data URL prefix)
 * @param filename - The desired filename for the downloaded file
 * @param contentType - The MIME type of the content (default: 'application/pdf')
 */
export function downloadBase64File(
  base64: string,
  filename: string = 'download.pdf',
  contentType: string = 'application/pdf',
): void {
  const blob = base64ToBlob(base64, contentType);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
