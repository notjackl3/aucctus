import { FunctionComponent, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
  X,
  Loader2,
  Scale,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Target,
  Award,
  FolderPlus,
  Star,
} from 'lucide-react';
import api from '@libs/api';
import {
  IIdeaSubmission,
  ICompareSubmissionsResponse,
} from '@libs/api/types/ideaSubmissions';
import { toast } from '@components';
import { cn } from '@libs/utils/react';

interface ComparisonModalProps {
  submissions: IIdeaSubmission[];
  onClose: () => void;
}

/**
 * Comparison Modal Component
 *
 * Shows AI-generated comparison results for 2-5 submissions:
 * - Left sidebar: clickable idea cards list
 * - Right panel: selected idea analysis (pros, cons, unknowns, recommendation)
 * - Footer: Ultimate recommendation with winner and save button
 */
const ComparisonModal: FunctionComponent<ComparisonModalProps> = ({
  submissions,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [comparisonResult, setComparisonResult] =
    useState<ICompareSubmissionsResponse | null>(null);
  const [selectedIdeaUuid, setSelectedIdeaUuid] = useState<string | null>(null);

  // Compare submissions mutation
  const compareMutation = useMutation({
    mutationFn: () =>
      api.ideaSubmissions.compareSubmissions(submissions.map((s) => s.uuid)),
    onSuccess: (data) => {
      setComparisonResult(data);
      // Auto-select the winner
      if (data.winner?.uuid) {
        setSelectedIdeaUuid(data.winner.uuid);
      } else if (data.ideas.length > 0) {
        setSelectedIdeaUuid(data.ideas[0].uuid);
      }
    },
    onError: () => {
      toast.error('Failed to compare submissions');
    },
  });

  // Save winner to bank mutation
  const saveToBankMutation = useMutation({
    mutationFn: (uuid: string) => api.ideaSubmissions.saveToBank(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['submissionLinkSubmissions'],
      });
      toast.success('Winner saved to concept bank!');
    },
    onError: () => {
      toast.error('Failed to save to concept bank');
    },
  });

  // Auto-trigger comparison on mount
  useEffect(() => {
    compareMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get full submission data for a UUID
  const getSubmissionByUuid = (uuid: string): IIdeaSubmission | undefined => {
    return submissions.find((s) => s.uuid === uuid);
  };

  // Get selected idea comparison data
  const selectedIdea = comparisonResult?.ideas.find(
    (i) => i.uuid === selectedIdeaUuid,
  );

  // Check if winner is already saved
  const isWinnerSaved = comparisonResult?.winner
    ? !!getSubmissionByUuid(comparisonResult.winner.uuid)?.conceptUuid
    : false;

  // Get score color based on value
  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return 'aucctus-bg-secondary aucctus-text-tertiary';
    if (score >= 80)
      return 'bg-green-500/15 text-green-700 border-green-500/30';
    if (score >= 60)
      return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
    return 'bg-red-500/15 text-red-700 border-red-500/30';
  };

  return (
    <div className='aucctus-bg-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
      <div
        className='aucctus-bg-primary aucctus-border-secondary flex h-[80vh] w-full max-w-5xl flex-col gap-0 overflow-hidden rounded-lg border p-0 shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='aucctus-border-secondary flex shrink-0 items-center justify-between border-b px-6 py-5'>
          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
              <Scale className='aucctus-stroke-secondary h-5 w-5' />
            </div>
            <div>
              <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
                Compare Ideas
              </h2>
              <p className='aucctus-text-sm aucctus-text-tertiary mt-0.5'>
                Review and compare {submissions.length} ideas side by side
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='aucctus-bg-secondary hover:aucctus-bg-tertiary rounded-lg p-2 transition-colors'
          >
            <X className='aucctus-stroke-secondary h-5 w-5' />
          </button>
        </div>

        {/* Loading State */}
        {compareMutation.isLoading && (
          <div className='flex flex-1 flex-col items-center justify-center py-16'>
            <div className='aucctus-bg-brand-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
              <Loader2 className='aucctus-stroke-brand-primary h-8 w-8 animate-spin' />
            </div>
            <p className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
              Analyzing submissions...
            </p>
            <p className='aucctus-text-sm aucctus-text-tertiary'>
              Our AI is comparing the selected ideas
            </p>
          </div>
        )}

        {/* Error State */}
        {compareMutation.isError && (
          <div className='flex flex-1 flex-col items-center justify-center py-16'>
            <div className='aucctus-bg-error-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
              <X className='aucctus-stroke-error-primary h-8 w-8' />
            </div>
            <p className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
              Comparison failed
            </p>
            <p className='aucctus-text-sm aucctus-text-tertiary mb-4'>
              Unable to compare the selected submissions
            </p>
            <button
              onClick={() => compareMutation.mutate()}
              className='btn btn-secondary btn-md'
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results - Split Panel Layout */}
        {comparisonResult && (
          <>
            <div className='flex flex-1 overflow-hidden'>
              {/* Left Side - Idea Cards List */}
              <div className='aucctus-border-secondary aucctus-bg-secondary/30 w-80 shrink-0 overflow-y-auto border-r p-4'>
                <h3 className='aucctus-text-xs-semibold aucctus-text-tertiary mb-3 uppercase tracking-wide'>
                  Ideas Being Compared
                </h3>
                <div className='space-y-3'>
                  {comparisonResult.ideas.map((idea) => {
                    const submission = getSubmissionByUuid(idea.uuid);
                    const isWinner = idea.uuid === comparisonResult.winner.uuid;
                    const isSelected = idea.uuid === selectedIdeaUuid;

                    return (
                      <div
                        key={idea.uuid}
                        onClick={() => setSelectedIdeaUuid(idea.uuid)}
                        className={cn(
                          'aucctus-bg-primary relative cursor-pointer rounded-xl border p-4 transition-all',
                          {
                            'aucctus-border-brand ring-2 ring-blue-500/20':
                              isSelected,
                            'border-green-500 ring-2 ring-green-500/20':
                              isWinner && !isSelected,
                            'aucctus-border-secondary hover:aucctus-border-brand/50':
                              !isSelected && !isWinner,
                          },
                        )}
                      >
                        {isWinner && (
                          <span className='absolute right-3 top-3 rounded border border-green-500/30 bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-700'>
                            Winner
                          </span>
                        )}
                        <div className='mb-2 flex items-center gap-2'>
                          {submission?.theme && (
                            <span className='aucctus-bg-secondary aucctus-text-secondary rounded-full border px-2 py-0.5 text-xs font-medium'>
                              {submission.theme}
                            </span>
                          )}
                          <div
                            className={cn(
                              'flex items-center gap-1 rounded-full border px-2 py-0.5',
                              getScoreColor(submission?.totalScore),
                            )}
                          >
                            <Star className='h-2.5 w-2.5 fill-current' />
                            <span className='text-xs font-bold'>
                              {submission?.totalScore ?? '-'}
                            </span>
                          </div>
                        </div>
                        <h4 className='aucctus-text-sm-semibold aucctus-text-primary line-clamp-2'>
                          {idea.title}
                        </h4>
                        <p className='aucctus-text-xs aucctus-text-tertiary mt-1 line-clamp-2'>
                          {submission?.problemStatement ||
                            submission?.proposedSolution ||
                            'No description'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side - Selected Idea Analysis */}
              <div className='flex-1 overflow-y-auto p-6'>
                {selectedIdea ? (
                  <div className='space-y-4'>
                    {/* Pros */}
                    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border border-l-4 border-l-green-500 p-4'>
                      <div className='mb-3 flex items-center gap-2'>
                        <ThumbsUp className='aucctus-stroke-secondary h-4 w-4' />
                        <h3 className='aucctus-text-sm-semibold aucctus-text-primary'>
                          Pros
                        </h3>
                      </div>
                      <ul className='space-y-2'>
                        {selectedIdea.pros.map((pro, index) => (
                          <li
                            key={index}
                            className='aucctus-text-sm aucctus-text-secondary flex items-start gap-2'
                          >
                            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500' />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border border-l-4 border-l-red-500 p-4'>
                      <div className='mb-3 flex items-center gap-2'>
                        <ThumbsDown className='aucctus-stroke-secondary h-4 w-4' />
                        <h3 className='aucctus-text-sm-semibold aucctus-text-primary'>
                          Cons
                        </h3>
                      </div>
                      <ul className='space-y-2'>
                        {selectedIdea.cons.map((con, index) => (
                          <li
                            key={index}
                            className='aucctus-text-sm aucctus-text-secondary flex items-start gap-2'
                          >
                            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500' />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Unknowns */}
                    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border border-l-4 border-l-amber-500 p-4'>
                      <div className='mb-3 flex items-center gap-2'>
                        <HelpCircle className='aucctus-stroke-secondary h-4 w-4' />
                        <h3 className='aucctus-text-sm-semibold aucctus-text-primary'>
                          Unknowns
                        </h3>
                      </div>
                      <ul className='space-y-2'>
                        {selectedIdea.unknowns.map((unknown, index) => (
                          <li
                            key={index}
                            className='aucctus-text-sm aucctus-text-secondary flex items-start gap-2'
                          >
                            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500' />
                            <span>{unknown}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendation */}
                    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border border-l-4 border-l-blue-500 p-4'>
                      <div className='mb-3 flex items-center gap-2'>
                        <Target className='aucctus-stroke-secondary h-4 w-4' />
                        <h3 className='aucctus-text-sm-semibold aucctus-text-primary'>
                          Recommendation
                        </h3>
                      </div>
                      <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                        {selectedIdea.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='aucctus-text-tertiary flex h-full items-center justify-center'>
                    Select an idea to view analysis
                  </div>
                )}
              </div>
            </div>

            {/* Ultimate Recommendation Footer */}
            <div className='shrink-0 border-t-2 border-green-500/30 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent px-6 py-6'>
              <div className='flex items-start gap-4'>
                <div className='rounded-xl border border-green-500/30 bg-green-500/15 p-3'>
                  <Award className='h-6 w-6 text-green-600' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
                      Ultimate Recommendation
                    </h3>
                    <span className='rounded-full border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700'>
                      AI Analysis
                    </span>
                  </div>
                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                    <span className='font-semibold text-green-700'>
                      &ldquo;{comparisonResult.winner.title}&rdquo;
                    </span>{' '}
                    {comparisonResult.winner.reasoning}
                  </p>
                </div>
                <button
                  onClick={() =>
                    saveToBankMutation.mutate(comparisonResult.winner.uuid)
                  }
                  disabled={saveToBankMutation.isLoading || isWinnerSaved}
                  className='btn btn-md flex shrink-0 items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                >
                  {saveToBankMutation.isLoading ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Saving...
                    </>
                  ) : isWinnerSaved ? (
                    <>
                      <FolderPlus className='h-4 w-4' />
                      Already Saved
                    </>
                  ) : (
                    <>
                      <FolderPlus className='h-4 w-4' />
                      Save Winner
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonModal;
