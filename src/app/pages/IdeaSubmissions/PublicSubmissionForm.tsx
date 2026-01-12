import { FunctionComponent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import api from '@libs/api';
import {
  ICreateIdeaSubmission,
  IdeaSubmissionCategory,
  CATEGORY_LABELS,
} from '@libs/api/types/ideaSubmissions';

// Department options - can be customized per organization in the future
const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Success',
  'Operations',
  'Finance',
  'HR',
  'Legal',
  'Other',
];

// Category options
const CATEGORY_OPTIONS: IdeaSubmissionCategory[] = [
  'process_improvement',
  'product_service',
  'cost_reduction',
  'customer_experience',
  'technology',
  'sustainability',
  'culture',
  'other',
];

/**
 * Public Idea Submission Form
 *
 * This is a standalone page accessible via a shareable link.
 * No authentication is required - employees can submit ideas directly.
 */
const PublicSubmissionForm: FunctionComponent = () => {
  const { accountUuid } = useParams<{ accountUuid: string }>();

  // Form state
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState<IdeaSubmissionCategory | ''>('');
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch account info for display
  const {
    data: accountInfo,
    isLoading: isLoadingAccount,
    error: accountError,
  } = useQuery({
    queryKey: ['publicAccountInfo', accountUuid],
    queryFn: () => api.ideaSubmissions.getPublicAccountInfo(accountUuid!),
    enabled: !!accountUuid,
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: ICreateIdeaSubmission) =>
      api.ideaSubmissions.submitIdea(accountUuid!, data),
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!submitterName.trim()) {
      newErrors.submitterName = 'Your name is required';
    }
    if (!submitterEmail.trim()) {
      newErrors.submitterEmail = 'Your email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
      newErrors.submitterEmail = 'Please enter a valid email address';
    }
    if (!department) {
      newErrors.department = 'Please select your department';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!title.trim()) {
      newErrors.title = 'Idea title is required';
    }
    if (!problemStatement.trim()) {
      newErrors.problemStatement = 'Problem statement is required';
    }
    if (!proposedSolution.trim()) {
      newErrors.proposedSolution = 'Proposed solution is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitMutation.mutate({
      submitter_name: submitterName.trim(),
      submitter_email: submitterEmail.trim(),
      department: department,
      category: category as IdeaSubmissionCategory,
      title: title.trim(),
      problem_statement: problemStatement.trim(),
      proposed_solution: proposedSolution.trim(),
      expected_impact: expectedImpact.trim() || undefined,
    });
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSubmitterName('');
    setSubmitterEmail('');
    setDepartment('');
    setCategory('');
    setTitle('');
    setProblemStatement('');
    setProposedSolution('');
    setExpectedImpact('');
    setErrors({});
  };

  // Input class helper
  const getInputClass = (hasError: boolean) =>
    `w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${
      hasError ? 'border-red-500' : 'border-slate-600'
    }`;

  // Select class helper
  const getSelectClass = (hasError: boolean) =>
    `w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all appearance-none cursor-pointer ${
      hasError ? 'border-red-500' : 'border-slate-600'
    }`;

  // Error state - invalid account
  if (accountError || (!isLoadingAccount && !accountInfo)) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4'>
        <div className='w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center backdrop-blur-sm'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
            <svg
              className='h-8 w-8 text-red-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <h2 className='mb-2 text-xl font-semibold text-white'>
            Invalid Link
          </h2>
          <p className='text-slate-400'>
            This submission link is not valid. Please contact your administrator
            for a working link.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingAccount) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <div className='flex animate-pulse flex-col items-center gap-4'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500' />
          <p className='text-slate-400'>Loading...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4'>
        <div className='w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center backdrop-blur-sm'>
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10'>
            <svg
              className='h-10 w-10 text-emerald-400'
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
          <h2 className='mb-3 text-2xl font-bold text-white'>Thank You!</h2>
          <p className='mb-6 text-slate-300'>
            Your idea has been submitted successfully. The team at{' '}
            <span className='font-medium text-amber-400'>
              {accountInfo?.name}
            </span>{' '}
            will review it soon.
          </p>
          <button
            onClick={resetForm}
            className='rounded-lg bg-slate-700 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-600'
          >
            Submit Another Idea
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12'>
      <div className='mx-auto max-w-2xl'>
        {/* Header */}
        <div className='mb-10 text-center'>
          <div className='mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20'>
            <svg
              className='h-8 w-8 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
              />
            </svg>
          </div>
          <h1 className='mb-2 text-3xl font-bold text-white'>
            Submit Your Innovation Idea
          </h1>
          <p className='text-lg text-slate-400'>
            Share your idea with{' '}
            <span className='font-medium text-amber-400'>
              {accountInfo?.name}
            </span>
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 shadow-xl backdrop-blur-sm'
        >
          <div className='space-y-6'>
            {/* Your Information Section */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Name */}
              <div>
                <label
                  htmlFor='submitterName'
                  className='mb-2 block text-sm font-medium text-slate-300'
                >
                  Your Name <span className='text-red-400'>*</span>
                </label>
                <input
                  type='text'
                  id='submitterName'
                  value={submitterName}
                  onChange={(e) => {
                    setSubmitterName(e.target.value);
                    if (errors.submitterName)
                      setErrors({ ...errors, submitterName: '' });
                  }}
                  placeholder='John Doe'
                  className={getInputClass(!!errors.submitterName)}
                />
                {errors.submitterName && (
                  <p className='mt-2 text-sm text-red-400'>
                    {errors.submitterName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor='submitterEmail'
                  className='mb-2 block text-sm font-medium text-slate-300'
                >
                  Email Address <span className='text-red-400'>*</span>
                </label>
                <input
                  type='email'
                  id='submitterEmail'
                  value={submitterEmail}
                  onChange={(e) => {
                    setSubmitterEmail(e.target.value);
                    if (errors.submitterEmail)
                      setErrors({ ...errors, submitterEmail: '' });
                  }}
                  placeholder='john@company.com'
                  className={getInputClass(!!errors.submitterEmail)}
                />
                {errors.submitterEmail && (
                  <p className='mt-2 text-sm text-red-400'>
                    {errors.submitterEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Department and Category Row */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Department */}
              <div>
                <label
                  htmlFor='department'
                  className='mb-2 block text-sm font-medium text-slate-300'
                >
                  Department <span className='text-red-400'>*</span>
                </label>
                <div className='relative'>
                  <select
                    id='department'
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (errors.department)
                        setErrors({ ...errors, department: '' });
                    }}
                    className={getSelectClass(!!errors.department)}
                  >
                    <option value='' className='bg-slate-800'>
                      Select department
                    </option>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept} className='bg-slate-800'>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-4'>
                    <svg
                      className='h-4 w-4 text-slate-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </div>
                {errors.department && (
                  <p className='mt-2 text-sm text-red-400'>
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor='category'
                  className='mb-2 block text-sm font-medium text-slate-300'
                >
                  Innovation Category <span className='text-red-400'>*</span>
                </label>
                <div className='relative'>
                  <select
                    id='category'
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as IdeaSubmissionCategory);
                      if (errors.category)
                        setErrors({ ...errors, category: '' });
                    }}
                    className={getSelectClass(!!errors.category)}
                  >
                    <option value='' className='bg-slate-800'>
                      Select category
                    </option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat} className='bg-slate-800'>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-4'>
                    <svg
                      className='h-4 w-4 text-slate-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </div>
                {errors.category && (
                  <p className='mt-2 text-sm text-red-400'>{errors.category}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className='relative py-2'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-slate-700' />
              </div>
              <div className='relative flex justify-center'>
                <span className='bg-slate-800/50 px-4 text-sm text-slate-500'>
                  Idea Details
                </span>
              </div>
            </div>

            {/* Idea Title */}
            <div>
              <label
                htmlFor='title'
                className='mb-2 block text-sm font-medium text-slate-300'
              >
                Idea Title <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                id='title'
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder='Give your idea a catchy, descriptive title'
                className={getInputClass(!!errors.title)}
              />
              {errors.title && (
                <p className='mt-2 text-sm text-red-400'>{errors.title}</p>
              )}
            </div>

            {/* Problem Statement */}
            <div>
              <label
                htmlFor='problemStatement'
                className='mb-2 block text-sm font-medium text-slate-300'
              >
                Problem Statement <span className='text-red-400'>*</span>
              </label>
              <textarea
                id='problemStatement'
                value={problemStatement}
                onChange={(e) => {
                  setProblemStatement(e.target.value);
                  if (errors.problemStatement)
                    setErrors({ ...errors, problemStatement: '' });
                }}
                placeholder='What problem does your idea solve? Describe the current pain point or challenge...'
                rows={4}
                className={`${getInputClass(!!errors.problemStatement)} resize-none`}
              />
              {errors.problemStatement && (
                <p className='mt-2 text-sm text-red-400'>
                  {errors.problemStatement}
                </p>
              )}
            </div>

            {/* Proposed Solution */}
            <div>
              <label
                htmlFor='proposedSolution'
                className='mb-2 block text-sm font-medium text-slate-300'
              >
                Proposed Solution <span className='text-red-400'>*</span>
              </label>
              <textarea
                id='proposedSolution'
                value={proposedSolution}
                onChange={(e) => {
                  setProposedSolution(e.target.value);
                  if (errors.proposedSolution)
                    setErrors({ ...errors, proposedSolution: '' });
                }}
                placeholder='Describe your idea in detail. How would it work? What would be needed to implement it?'
                rows={5}
                className={`${getInputClass(!!errors.proposedSolution)} resize-none`}
              />
              {errors.proposedSolution && (
                <p className='mt-2 text-sm text-red-400'>
                  {errors.proposedSolution}
                </p>
              )}
            </div>

            {/* Expected Impact */}
            <div>
              <label
                htmlFor='expectedImpact'
                className='mb-2 block text-sm font-medium text-slate-300'
              >
                Expected Impact{' '}
                <span className='text-slate-500'>(Optional)</span>
              </label>
              <textarea
                id='expectedImpact'
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder='What benefits would this bring? Cost savings, efficiency gains, revenue increase, better customer satisfaction...'
                rows={3}
                className={`${getInputClass(false)} resize-none`}
              />
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={submitMutation.isLoading}
              className='flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-200 hover:from-amber-600 hover:to-orange-700 hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {submitMutation.isLoading ? (
                <>
                  <svg className='h-5 w-5 animate-spin' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                    />
                  </svg>
                  Submit Idea
                </>
              )}
            </button>

            {/* Error message */}
            {submitMutation.isError && (
              <div className='rounded-xl border border-red-500/30 bg-red-500/10 p-4'>
                <p className='text-center text-sm text-red-400'>
                  Something went wrong. Please try again.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <p className='mt-8 text-center text-sm text-slate-500'>
          Powered by Aucctus Innovation Platform
        </p>
      </div>
    </div>
  );
};

export default PublicSubmissionForm;
