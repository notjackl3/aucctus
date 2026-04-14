import { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSubmissionLinks } from '@hooks/query/idea-submissions.hook';
import { AppPath } from '@routes/routes';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SubmissionLinkModal from './components/SubmissionLinkModal';
import type { ISubmissionLink } from '@libs/api/types/ideaSubmissions';

/**
 * Submissions Tab Wrapper
 *
 * This component handles the case when no linkUuid is provided.
 * It fetches all submission links and redirects to the first one,
 * or shows the detail page if a linkUuid is already in the URL.
 */
const SubmissionsTab: FunctionComponent = () => {
  const navigate = useNavigate();
  const { linkUuid } = useParams<{ linkUuid?: string }>();
  const { submissionLinks, isLoading, refetch } = useSubmissionLinks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    // If we have a linkUuid, we're already on a detail page - no redirect needed
    if (linkUuid) return;

    // If still loading, wait
    if (isLoading) return;

    // If we have links, redirect to the first active one (or first overall)
    if (submissionLinks.length > 0) {
      const activeLink = submissionLinks.find((l) => l.isActive);
      const targetLink = activeLink || submissionLinks[0];
      navigate(
        AppPath.ConceptBankSubmissionDetail.replace(
          ':linkUuid',
          targetLink.uuid,
        ),
        { replace: true },
      );
    }
  }, [linkUuid, submissionLinks, isLoading, navigate]);

  // Show loading while fetching links or redirecting
  if (isLoading || (!linkUuid && submissionLinks.length > 0)) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='flex animate-pulse flex-col items-center gap-4'>
          <div className='aucctus-border-brand h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Loading submissions...
          </p>
        </div>
      </div>
    );
  }

  // Handler for successful submission link creation
  const handleSubmissionLinkSuccess = (newLink: ISubmissionLink) => {
    setIsCreateModalOpen(false);
    refetch();
    navigate(
      AppPath.ConceptBankSubmissionDetail.replace(':linkUuid', newLink.uuid),
      { replace: true },
    );
  };

  // If no links exist and not loading, show empty state
  if (!linkUuid && submissionLinks.length === 0) {
    return (
      <>
        <div className='flex h-96 items-center justify-center'>
          <motion.div
            className='text-center'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className='aucctus-bg-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
              <svg
                className='aucctus-stroke-tertiary h-10 w-10'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
                />
              </svg>
            </div>
            <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
              No submission links yet
            </h3>
            <p className='aucctus-text-sm aucctus-text-secondary mb-6 max-w-sm'>
              Create your first submission link to start collecting ideas.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className='btn btn-primary btn-md inline-flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              <span>Create Submission Link</span>
            </motion.button>
          </motion.div>
        </div>

        {isCreateModalOpen && (
          <SubmissionLinkModal
            link={null}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleSubmissionLinkSuccess}
          />
        )}
      </>
    );
  }

  // This shouldn't render - either redirecting or showing empty state
  return null;
};

export default SubmissionsTab;
