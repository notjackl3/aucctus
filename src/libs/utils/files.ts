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
