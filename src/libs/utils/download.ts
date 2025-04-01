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
