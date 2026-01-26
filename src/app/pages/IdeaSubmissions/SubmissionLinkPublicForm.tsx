import { animationStyles } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import { FunctionComponent, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { Loader2, AlertTriangle } from 'lucide-react';
import api from '@libs/api';
import { ICreateIdeaSubmissionViaLink } from '@libs/api/types/ideaSubmissions';
import utils from '@libs/utils';
import {
  VideoBackground,
  SubmissionForm,
} from './components/SubmissionFormComponents';

/**
 * Public Idea Submission Form (New Design)
 *
 * This is a standalone page accessible via a shareable link using slug URLs.
 * No authentication is required - employees can submit ideas directly.
 *
 * URL format: /submit/:accountSlug/:linkSlug
 *
 * Features:
 * - Split layout: video background left with company logo, form right
 * - Password protection support
 * - Simplified form fields (no department/category)
 * - Success state with "Submit Another" option
 * - "Powered by Aucctus" bubble at bottom left
 */
const SubmissionLinkPublicForm: FunctionComponent = () => {
  const { accountSlug, linkSlug } = useParams<{
    accountSlug: string;
    linkSlug: string;
  }>();

  // Component state
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Logo state - uses account logo if available, otherwise falls back to account name
  const [logoFailed, setLogoFailed] = useState(false);

  // Fetch link info
  const {
    data: linkInfo,
    isLoading: isLoadingLink,
    error: linkError,
  } = useQuery({
    queryKey: ['publicLinkInfo', accountSlug, linkSlug],
    queryFn: () =>
      api.ideaSubmissions.getSubmissionLinkInfo(accountSlug!, linkSlug!),
    enabled: !!accountSlug && !!linkSlug,
    retry: false,
  });

  // Use account logo if available (no logo.dev fallback - will show account name instead)
  const companyLogoUrl = linkInfo?.accountLogoUrl || null;

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: ICreateIdeaSubmissionViaLink) =>
      api.ideaSubmissions.submitIdeaViaLink(accountSlug!, linkSlug!, data),
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const handleFormSubmit = useCallback(
    (data: {
      firstName: string;
      lastName: string;
      email: string;
      title: string;
      ideaDescription: string;
      problemStatement: string;
      expectedImpact: string;
      password: string;
      website: string;
      captchaToken: string;
    }) => {
      submitMutation.mutate({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        title: data.title,
        description: data.ideaDescription,
        problem_statement: data.problemStatement,
        expected_impact: data.expectedImpact || undefined,
        password: linkInfo?.requiresPassword ? data.password : undefined,
        website: data.website, // Honeypot field
        captcha_token: data.captchaToken, // Cloudflare Turnstile token
      });
    },
    [submitMutation, linkInfo?.requiresPassword],
  );

  const resetForm = useCallback(() => {
    setIsSubmitted(false);
    submitMutation.reset();
  }, [submitMutation]);

  const handleLogoError = useCallback(() => {
    setLogoFailed(true);
  }, []);

  // Error state - invalid link
  if (linkError || (!isLoadingLink && !linkInfo)) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50'>
            <AlertTriangle className='h-8 w-8 text-red-500' />
          </div>
          <h2 className='mb-2 text-xl font-semibold text-gray-900'>
            Invalid Link
          </h2>
          <p className='text-gray-600'>
            This submission link is not valid or has been deactivated. Please
            contact your administrator for a working link.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingLink) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-12 w-12 animate-spin text-gray-400' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className='flex min-h-screen'>
        {/* Video Background Side */}
        <VideoBackground
          headquartersVideoUrl={linkInfo?.headquartersVideoUrl}
          accountName={linkInfo?.accountName}
          companyLogoUrl={companyLogoUrl}
          logoFailed={logoFailed}
          onLogoError={handleLogoError}
        />

        {/* Success Content - offset for fixed left panel */}
        <div className='flex min-h-screen flex-1 items-center justify-center bg-white p-8 lg:ml-[50%]'>
          <div className='w-full max-w-md text-center'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50'>
              <svg
                className='h-10 w-10 text-green-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h2 className='mb-3 text-2xl font-bold text-gray-900'>
              Thank you for your submission!
            </h2>
            <p className='mb-6 text-gray-600'>
              Your idea has been submitted successfully. The team will review it
              soon.
            </p>
            <button
              onClick={resetForm}
              className='rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-200'
            >
              Submit Another Idea
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Animation styles for background */}
      <style>{animationStyles}</style>

      <div className='flex min-h-screen'>
        {/* Video Background Side */}
        <VideoBackground
          headquartersVideoUrl={linkInfo?.headquartersVideoUrl}
          accountName={linkInfo?.accountName}
          companyLogoUrl={companyLogoUrl}
          logoFailed={logoFailed}
          onLogoError={handleLogoError}
        />

        {/* Form Side */}
        <SubmissionForm
          linkInfo={linkInfo || { requiresPassword: false }}
          companyLogoUrl={companyLogoUrl}
          logoFailed={logoFailed}
          isSubmitting={submitMutation.isLoading}
          isError={submitMutation.isError}
          errorMessage={
            submitMutation.error
              ? utils.osiris.parseFormError(submitMutation.error)
              : null
          }
          onSubmit={handleFormSubmit}
        />
      </div>
    </>
  );
};

export default SubmissionLinkPublicForm;
