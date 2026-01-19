import { FunctionComponent, useState, useCallback } from 'react';
import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import { Link2, FileUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { AppPath } from '@routes/routes';
import { ISubmissionLink } from '@libs/api/types/ideaSubmissions';
import SubmissionLinkModal from '@pages/IdeaSubmissions/components/SubmissionLinkModal';

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

  const handleSubmissionLinkClick = useCallback(() => {
    setImportStep('submission-link');
    onSubmissionLinkClick?.();
  }, [onSubmissionLinkClick]);

  const handleSubmissionLinkSuccess = useCallback(
    (link: ISubmissionLink) => {
      queryClient.invalidateQueries({ queryKey: ['submissionLinks'] });
      closeModal();
      // Navigate to the new submission link detail page
      navigate(
        AppPath.ConceptBankSubmissionDetail.replace(':linkUuid', link.uuid),
      );
    },
    [closeModal, navigate, queryClient],
  );

  const handleSubmissionLinkClose = useCallback(() => {
    setImportStep('select');
  }, []);

  // File upload handler - currently disabled (coming soon)
  void onFileUploadClick; // Suppress unused prop warning until feature is implemented

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

  return (
    <div className='aucctus-bg-primary flex w-[640px] max-w-[90vw] flex-col rounded-xl'>
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
                'flex items-start gap-3 rounded-xl border p-5 text-left transition-all',
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

            {/* File Upload Option - Coming Soon */}
            <button
              disabled
              className={cn(
                'relative flex cursor-not-allowed items-start gap-3 rounded-xl border p-5 text-left opacity-60',
                'aucctus-border-secondary',
              )}
            >
              {/* Coming Soon Badge */}
              <span className='absolute right-2 top-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                Coming Soon
              </span>
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
