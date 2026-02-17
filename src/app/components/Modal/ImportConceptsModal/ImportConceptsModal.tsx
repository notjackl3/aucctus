import images from '@assets/img';
import { toast } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { useSubmissionLinks } from '@hooks/query/idea-submissions.hook';
import api from '@libs/api';
import {
  IFileUploadResponse,
  ISubmissionLink,
} from '@libs/api/types/ideaSubmissions';
import utils from '@libs/utils';
import { cn } from '@libs/utils/react';
import SubmissionLinkModal from '@pages/IdeaSubmissions/components/SubmissionLinkModal';
import { AppPath } from '@routes/routes';
import {
  ArrowLeft,
  ChevronDown,
  File,
  FileUp,
  Link2,
  Loader2,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import {
  DragEvent,
  FunctionComponent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

type ImportStep = 'select' | 'submission-link' | 'file-upload';

interface ImportConceptsModalProps {
  onSubmissionLinkClick?: () => void;
  onFileUploadClick?: () => void;
}

/**
 * Import Concepts Modal
 *
 * Provides options for importing concepts into the bank:
 * 1. Create a new submission link for others to submit concepts
 * 2. Upload a CSV/Excel file with concepts
 */
const ImportConceptsModal: FunctionComponent<ImportConceptsModalProps> = ({
  onSubmissionLinkClick,
  onFileUploadClick,
}) => {
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [importStep, setImportStep] = useState<ImportStep>('select');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSourceUuid, setSelectedSourceUuid] = useState<string | null>(
    null,
  );
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isCreatingNewSource, setIsCreatingNewSource] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch submission links for source dropdown
  const { submissionLinks } = useSubmissionLinks();

  const handleSubmissionLinkClick = useCallback(() => {
    setImportStep('submission-link');
    onSubmissionLinkClick?.();
  }, [onSubmissionLinkClick]);

  const handleFileUploadClick = useCallback(() => {
    setImportStep('file-upload');
    onFileUploadClick?.();
  }, [onFileUploadClick]);

  const handleSubmissionLinkSuccess = useCallback(
    (link: ISubmissionLink) => {
      queryClient.invalidateQueries({ queryKey: ['submissionLinks'] });

      // If we came from file upload (creating new source), go back to file upload
      if (isCreatingNewSource) {
        setSelectedSourceUuid(link.uuid);
        setIsCreatingNewSource(false);
        setImportStep('file-upload');
        return;
      }

      closeModal();
      // Navigate to the new submission link detail page
      navigate(
        AppPath.ConceptBankSubmissionDetail.replace(':linkUuid', link.uuid),
      );
    },
    [closeModal, navigate, queryClient, isCreatingNewSource],
  );

  const handleSubmissionLinkClose = useCallback(() => {
    if (isCreatingNewSource) {
      setIsCreatingNewSource(false);
      setImportStep('file-upload');
    } else {
      setImportStep('select');
    }
  }, [isCreatingNewSource]);

  const handleBackToSelect = useCallback(() => {
    setImportStep('select');
    setSelectedFile(null);
    setSelectedSourceUuid(null);
  }, []);

  // File handling
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        const validExtensions = [
          '.csv',
          '.xls',
          '.xlsx',
          '.tsv',
          '.pdf',
          '.doc',
          '.docx',
          '.txt',
        ];
        const hasValidExtension = validExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext),
        );

        if (!hasValidExtension) {
          toast.error('Please upload a CSV, Excel, PDF, Word, or text file');
          return;
        }
        setSelectedFile(file);
      }
    },
    [],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validExtensions = [
        '.csv',
        '.xls',
        '.xlsx',
        '.tsv',
        '.pdf',
        '.doc',
        '.docx',
        '.txt',
      ];
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext),
      );

      if (!hasValidExtension) {
        toast.error('Please upload a CSV, Excel, PDF, Word, or text file');
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  // File upload mutation
  const uploadMutation = useMutation<
    IFileUploadResponse,
    unknown,
    { file: File; submissionLinkUuid?: string }
  >({
    mutationFn: ({ file, submissionLinkUuid }) =>
      api.ideaSubmissions.uploadFile(file, submissionLinkUuid),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['submissionLinkSubmissions'],
      });
      queryClient.invalidateQueries({ queryKey: ['ideaSubmissions'] });
      toast.success(`File uploaded successfully! ${data.message}`);
      closeModal();
    },
    onError: (error) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to upload file');
    },
  });

  const handleUploadConfirm = useCallback(() => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    // Source is now optional - backend will auto-create if not provided
    uploadMutation.mutate({
      file: selectedFile,
      submissionLinkUuid: selectedSourceUuid || undefined,
    });
  }, [selectedFile, selectedSourceUuid, uploadMutation]);

  const handleCreateNewSource = useCallback(() => {
    setIsCreatingNewSource(true);
    setImportStep('submission-link');
    setIsSourceDropdownOpen(false);
  }, []);

  const getSelectedSourceName = () => {
    if (!selectedSourceUuid) return 'Auto-create from file name';
    const link = submissionLinks.find((l) => l.uuid === selectedSourceUuid);
    return link?.title || 'Auto-create from file name';
  };

  // Show SubmissionLinkModal when creating a new link
  if (importStep === 'submission-link') {
    return (
      <SubmissionLinkModal
        link={null}
        onClose={closeModal}
        onSuccess={handleSubmissionLinkSuccess}
        onBack={handleSubmissionLinkClose}
        embedded
      />
    );
  }

  // File Upload Screen
  if (importStep === 'file-upload') {
    return (
      <div className='flex w-[640px] max-w-[90vw] flex-col overflow-hidden rounded-lg'>
        {/* Header with background */}
        <div
          className='rounded-tlg relative px-6 pb-10 pt-6'
          style={{
            backgroundImage: `url(${images.aiExplorationsBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Back button */}
          <button
            onClick={handleBackToSelect}
            className='mb-4 flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Go Back
          </button>

          <div className='text-center'>
            <h2 className='text-2xl font-semibold text-white'>Upload File</h2>
            <p className='mt-1 text-white/70'>
              Import concepts from a CSV or Excel file
            </p>
          </div>
        </div>

        {/* Content */}
        <div className='space-y-6 p-6'>
          {/* Source Selector (Optional) */}
          <div className='space-y-2'>
            <label className='aucctus-text-xs-semibold aucctus-text-tertiary block uppercase tracking-wide'>
              Source (Optional)
            </label>
            <p className='aucctus-text-xs aucctus-text-secondary mb-2'>
              Select an existing source or leave blank to auto-create one based
              on the file name
            </p>
            <div className='relative'>
              <button
                onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                className={cn(
                  'aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary flex h-11 w-full items-center justify-between rounded-lg border px-4 py-3 transition-colors',
                  'focus:aucctus-border-brand focus:outline-none',
                )}
              >
                <span
                  className={cn({
                    'aucctus-text-placeholder': !selectedSourceUuid,
                  })}
                >
                  {getSelectedSourceName()}
                </span>
                <ChevronDown
                  className={cn(
                    'aucctus-stroke-tertiary h-4 w-4 transition-transform',
                    {
                      'rotate-180': isSourceDropdownOpen,
                    },
                  )}
                />
              </button>

              {/* Dropdown */}
              {isSourceDropdownOpen && (
                <div className='aucctus-bg-primary aucctus-border-secondary absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border shadow-lg'>
                  {/* Create New Source Option */}
                  <button
                    onClick={handleCreateNewSource}
                    className='aucctus-bg-primary aucctus-text-brand-primary hover:aucctus-bg-secondary sticky top-0 flex w-full items-center gap-2 px-4 py-3 text-left transition-colors'
                  >
                    <Plus className='h-4 w-4' />
                    <span className='aucctus-text-sm-semibold'>
                      Create New Source
                    </span>
                  </button>

                  {/* Divider */}
                  {submissionLinks.length > 0 && (
                    <div className='aucctus-border-secondary border-t' />
                  )}

                  {/* Existing Sources */}
                  {submissionLinks.map((link) => (
                    <button
                      key={link.uuid}
                      onClick={() => {
                        setSelectedSourceUuid(link.uuid);
                        setIsSourceDropdownOpen(false);
                      }}
                      className={cn(
                        'hover:aucctus-bg-secondary flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
                        {
                          'aucctus-bg-secondary':
                            selectedSourceUuid === link.uuid,
                        },
                      )}
                    >
                      <div>
                        <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                          {link.title}
                        </span>
                        <span className='aucctus-text-xs aucctus-text-tertiary ml-2'>
                          ({link.submissionCount} submissions)
                        </span>
                      </div>
                      {selectedSourceUuid === link.uuid && (
                        <span className='aucctus-text-brand-primary text-sm'>
                          ✓
                        </span>
                      )}
                    </button>
                  ))}

                  {submissionLinks.length === 0 && (
                    <div className='aucctus-text-sm aucctus-text-tertiary px-4 py-3'>
                      No existing sources. Create a new one above.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Drag and Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
              {
                'aucctus-border-brand aucctus-bg-brand-secondary': isDragging,
                'aucctus-border-secondary hover:aucctus-border-brand/50 hover:aucctus-bg-secondary':
                  !isDragging && !selectedFile,
                'border-green-500 bg-green-50 dark:bg-green-900/20':
                  selectedFile,
              },
            )}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='.csv,.xls,.xlsx,.tsv,.pdf,.doc,.docx,.txt'
              onChange={handleFileSelect}
              className='hidden'
            />

            {selectedFile ? (
              <>
                <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800'>
                  <File className='h-6 w-6 text-green-600 dark:text-green-400' />
                </div>
                <p className='aucctus-text-md-semibold aucctus-text-primary mb-1'>
                  {selectedFile.name}
                </p>
                <p className='aucctus-text-sm aucctus-text-tertiary'>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className='aucctus-text-sm aucctus-text-error-primary mt-2 hover:underline'
                >
                  Remove file
                </button>
              </>
            ) : (
              <>
                <div className='aucctus-bg-secondary mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
                  <Upload className='aucctus-stroke-tertiary h-6 w-6' />
                </div>
                <p className='aucctus-text-md-semibold aucctus-text-primary mb-1'>
                  Drag and drop your file here
                </p>
                <p className='aucctus-text-sm aucctus-text-tertiary'>
                  or click to browse (CSV, Excel, PDF, Word, TXT)
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-3'>
            <button
              onClick={handleBackToSelect}
              className='btn btn-secondary btn-md'
            >
              Cancel
            </button>
            <button
              onClick={handleUploadConfirm}
              disabled={!selectedFile || uploadMutation.isLoading}
              className='btn btn-primary btn-md flex items-center gap-2 disabled:opacity-50'
            >
              {uploadMutation.isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-[640px] max-w-[90vw] flex-col rounded-lg'>
      {/* Header */}
      <div className='relative px-6 pb-2 pt-6'>
        {/* Close button */}
        <button
          onClick={closeModal}
          className='absolute right-4 top-4 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <X className='aucctus-stroke-tertiary h-5 w-5' />
        </button>

        <h2 className='aucctus-text-md-semibold aucctus-text-primary text-center'>
          Import Concepts
        </h2>
        <p className='aucctus-text-sm aucctus-text-secondary mt-2 text-center'>
          Choose how you&apos;d like to import concepts into your bank.
        </p>
      </div>

      {/* Content */}
      <div className='px-6 pb-6 pt-4'>
        {importStep === 'select' && (
          <div className='grid grid-cols-2 gap-4'>
            {/* Submission Link Option */}
            <button
              onClick={handleSubmissionLinkClick}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-5 text-left transition-all',
                'aucctus-border-secondary hover:aucctus-bg-secondary hover:border-gray-300 dark:hover:border-gray-600',
              )}
            >
              <div
                className='flex-shrink-0 self-center rounded-lg p-2'
                style={{ backgroundColor: 'hsla(0, 27%, 29%, 0.1)' }}
              >
                <Link2
                  className='h-4 w-4'
                  style={{ color: 'hsl(0, 27%, 29%)' }}
                />
              </div>
              <div>
                <h4 className='aucctus-text-md-semibold aucctus-text-primary'>
                  New Submission Link
                </h4>
                <p className='aucctus-text-sm aucctus-text-secondary mt-0.5'>
                  Generate a link for others to submit concepts
                </p>
              </div>
            </button>

            {/* File Upload Option */}
            <button
              onClick={handleFileUploadClick}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-5 text-left transition-all',
                'aucctus-border-secondary hover:aucctus-bg-secondary hover:border-gray-300 dark:hover:border-gray-600',
              )}
            >
              <div
                className='flex-shrink-0 self-center rounded-lg p-2'
                style={{ backgroundColor: 'hsla(0, 27%, 29%, 0.1)' }}
              >
                <FileUp
                  className='h-4 w-4'
                  style={{ color: 'hsl(0, 27%, 29%)' }}
                />
              </div>
              <div>
                <h4 className='aucctus-text-md-semibold aucctus-text-primary'>
                  Upload File
                </h4>
                <p className='aucctus-text-sm aucctus-text-secondary mt-0.5'>
                  Import concepts from a CSV or Excel file
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportConceptsModal;
