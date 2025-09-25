import { toast } from '@components';
import api from '@libs/api';
import telemetry from '@libs/telemetry';
import {
  useCreateTestResultWithFiles,
  useDeleteTestResult,
  useDeleteTestResultSilent,
  useDeleteTestResultFile,
  useDeleteTestResultFileSilent,
  useUpdateTestResult,
} from '@hooks/query/testing.hook';
import { UploadedFile, ConfirmationDialogState } from '../TestResults.types';
import { ITestResultProcessingState } from '../TestResultProcessingStatus';

interface UseTestResultsOperationsProps {
  conceptUuid?: string;
  testUuid?: string;
  results?: any[]; // ITestResult[]
  setProcessingState: (
    state:
      | ITestResultProcessingState
      | ((prev: ITestResultProcessingState) => ITestResultProcessingState),
  ) => void;
  setConfirmationDialog: (dialog: ConfirmationDialogState | null) => void;
  setIsDeletingAll: (deleting: boolean) => void;
  setIsDownloading: (downloading: boolean) => void;
  resetDropzone: () => void;
}

export const useTestResultsOperations = ({
  conceptUuid,
  testUuid,
  results = [],
  setProcessingState,
  setConfirmationDialog,
  setIsDeletingAll,
  setIsDownloading,
  resetDropzone,
}: UseTestResultsOperationsProps) => {
  // Mutation hooks
  const createTestResultWithFiles = useCreateTestResultWithFiles();
  const deleteTestResult = useDeleteTestResult();
  const deleteTestResultSilent = useDeleteTestResultSilent();
  const deleteTestResultFile = useDeleteTestResultFile();
  const deleteTestResultFileSilent = useDeleteTestResultFileSilent();
  const updateTestResult = useUpdateTestResult();

  // Handle file upload
  const handleFilesUpload = async (uploadedFiles: UploadedFile[]) => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing concept or test information');
      return;
    }

    if (uploadedFiles.length === 0) {
      return;
    }

    try {
      // Extract files and summary
      const files = uploadedFiles.map((uploadedFile) => uploadedFile.file);
      const summary =
        uploadedFiles.length > 0
          ? uploadedFiles[0].description || undefined
          : undefined;

      // Check if there are existing results
      const hasExistingResults = results && results.length > 0;

      if (hasExistingResults) {
        // Update the first existing result with additional files
        const firstResult = results[0];

        const updatedResult = await updateTestResult.mutateAsync({
          conceptUuid,
          testUuid,
          resultUuid: firstResult.uuid,
          data: {
            // Keep existing data, just add files
            title: firstResult.title,
            description: firstResult.description,
          },
          files, // Add the new files
        });

        // Set processing state for the updated result
        setProcessingState({
          isProcessing: true,
          stage: null,
          message: `Adding ${files.length} more files to existing results...`,
          progress: 0,
          error: null,
          testResultUuid: updatedResult.uuid,
          conceptUuid: conceptUuid,
          testUuid: testUuid,
          summary: undefined,
          learnings: [],
          keywords: [],
        });

        telemetry.log('test.result.update.success', {
          testResultUuid: updatedResult.uuid,
          conceptUuid,
          testUuid,
          fileCount: files.length,
          totalSize: uploadedFiles.reduce((sum, f) => sum + f.file.size, 0),
        });
      } else {
        // Create new test results
        const newResults = await createTestResultWithFiles.mutateAsync({
          conceptUuid,
          testUuid,
          files,
          summary,
          recommendations: undefined,
        });

        // Set initial processing state for the batch
        if (newResults.length > 0) {
          setProcessingState({
            isProcessing: true,
            stage: null,
            message: `Starting analysis of ${newResults.length} files...`,
            progress: 0,
            error: null,
            testResultUuid: newResults[0].uuid,
            conceptUuid: conceptUuid,
            testUuid: testUuid,
            summary: undefined,
            learnings: [],
            keywords: [],
          });
        }

        telemetry.log('test.result.batch.upload.success', {
          testResultUuids: newResults.map((r) => r.uuid),
          conceptUuid,
          testUuid,
          fileCount: files.length,
          totalSize: uploadedFiles.reduce((sum, f) => sum + f.file.size, 0),
        });
      }

      // Clear the dropzone by updating its key to force re-render
      resetDropzone();

      // The query will be invalidated and refetch the updated results
    } catch (error) {
      // The hook already shows a toast error message
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        error: 'Upload failed. Please try again.',
      }));
    }
  };

  // Handle delete result
  const handleDeleteResult = async (
    resultUuid: string,
    resultTitle: string,
  ) => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing concept or test information');
      return;
    }

    // Show local confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'deleteResult',
      title: 'Delete Test Result',
      message: `Are you sure you want to delete "${resultTitle}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteTestResult.mutateAsync({
            conceptUuid,
            testUuid,
            resultUuid,
          });

          // The query will be invalidated and refetch the updated results
        } catch (error) {
          // The hook already shows a toast error message
        }
        setConfirmationDialog(null);
      },
    });
  };

  // Handle delete individual file
  const handleDeleteFile = async (
    resultUuid: string,
    fileUuid: string,
    fileName: string,
  ) => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing concept or test information');
      return;
    }

    // Show local confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'deleteFile',
      title: 'Delete File',
      message: `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteTestResultFile.mutateAsync({
            conceptUuid,
            testUuid,
            resultUuid,
            fileUuid,
          });

          // The query will be invalidated and refetch the updated results
        } catch (error) {
          // The hook already shows a toast error message
        }
        setConfirmationDialog(null);
      },
    });
  };

  // Handle bulk delete of all test results
  const handleDeleteAll = async () => {
    if (!conceptUuid || !testUuid || results.length === 0) return;

    // Show local confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'deleteAll',
      title: 'Delete All Test Results',
      message: `Are you sure you want to delete all ${results.length} test results? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setIsDeletingAll(true);

          // Delete all test results sequentially using silent version to avoid multiple toasts
          for (const result of results) {
            await deleteTestResultSilent.mutateAsync({
              conceptUuid,
              testUuid,
              resultUuid: result.uuid,
            });
          }

          toast.success(
            `Successfully deleted all ${results.length} test results`,
          );
        } catch (error) {
          toast.error('Failed to delete some results. Please try again.');
        } finally {
          setIsDeletingAll(false);
        }
        setConfirmationDialog(null);
      },
    });
  };

  // Handle bulk delete of all files
  const handleDeleteAllFiles = async () => {
    if (!conceptUuid || !testUuid || results.length === 0) return;

    // Collect all files from all results
    const allFiles: Array<{
      resultUuid: string;
      fileUuid: string;
      filename: string;
    }> = [];
    results.forEach((result) => {
      if (result.files && Array.isArray(result.files)) {
        result.files.forEach((file: any) => {
          allFiles.push({
            resultUuid: result.uuid,
            fileUuid: file.uuid,
            filename: file.originalFilename,
          });
        });
      }
    });

    if (allFiles.length === 0) return;

    // Show local confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'deleteAll',
      title: 'Delete All Files',
      message: `Are you sure you want to delete all ${allFiles.length} files? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setIsDeletingAll(true);

          // Delete all files sequentially using silent version to avoid multiple toasts
          for (const file of allFiles) {
            await deleteTestResultFileSilent.mutateAsync({
              conceptUuid,
              testUuid,
              resultUuid: file.resultUuid,
              fileUuid: file.fileUuid,
            });
          }

          toast.success(`Successfully deleted all ${allFiles.length} files`);
        } catch (error) {
          toast.error('Failed to delete some files. Please try again.');
        } finally {
          setIsDeletingAll(false);
        }
        setConfirmationDialog(null);
      },
    });
  };

  // Handle download of synthetic test results as CSV
  const handleDownloadResults = async () => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing test information. Please try again.');
      return;
    }

    try {
      setIsDownloading(true);

      // Filter only synthetic results for CSV export
      const syntheticResults = results.filter((result) => result.isSynthetic);

      if (syntheticResults.length === 0) {
        toast.error('No synthetic test results found to download.');
        return;
      }

      // Call the backend export API
      const blob = await api.testing.exportTestResults(
        conceptUuid,
        testUuid,
        'pdf',
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synthetic_customer_interviews_${testUuid}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(
        `Downloaded ${syntheticResults.length} synthetic test results as PDF`,
      );
    } catch (error) {
      toast.error('Failed to download test results. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    // Operations
    handleFilesUpload,
    handleDeleteResult,
    handleDeleteFile,
    handleDeleteAll,
    handleDeleteAllFiles,
    handleDownloadResults,

    // Loading states
    isCreating: createTestResultWithFiles.isLoading,
    isUpdating: updateTestResult.isLoading,
    isDeleting: deleteTestResult.isLoading,
    isDeletingFile: deleteTestResultFile.isLoading,
  };
};
