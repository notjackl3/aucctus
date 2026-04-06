import { FunctionComponent, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Scale,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Target,
  Award,
  AlertCircle,
  X,
} from 'lucide-react';
import LiquidGlassModal from '@components/ui/LiquidGlassModal';
import { useCompareConcepts } from '@hooks/query/concepts.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { toast } from '@components';
import {
  ICompareConceptsResponse,
  IConceptAnalysis,
} from '@libs/api/types/concept/conceptComparer';
import {
  IConceptComparisonCompletedMessage,
  IConceptComparisonErrorMessage,
} from '@libs/api/types/socketMessages/inbound';
import { cn } from '@libs/utils/react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';

interface ConceptComparisonModalProps {
  conceptUuids: string[];
  conceptUuidToIdentifier: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnalysisSection: FunctionComponent<{
  icon: React.ReactNode;
  title: string;
  borderColor: string;
  dotColor: string;
  items: string[];
  index: number;
}> = ({ icon, title, borderColor, dotColor, items, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: index * 0.08 }}
    className={cn(
      'aucctus-bg-primary aucctus-border-secondary rounded-lg border border-l-4 p-4',
      borderColor,
    )}
  >
    <div className='mb-3 flex items-center gap-2'>
      {icon}
      <h3 className='aucctus-text-sm-semibold aucctus-text-primary'>{title}</h3>
    </div>
    <ul className='space-y-2'>
      {items.map((item, i) => (
        <li
          key={i}
          className='aucctus-text-sm aucctus-text-secondary flex items-start gap-2'
        >
          <span
            className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', dotColor)}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

/**
 * ConceptComparisonModal
 *
 * Shows AI-generated comparison results for 2-5 concepts:
 * - Left sidebar: clickable concept cards list
 * - Right panel: selected concept analysis (pros, cons, unknowns, recommendation)
 * - Footer: Overall winner recommendation with justification
 */
const ConceptComparisonModal: FunctionComponent<
  ConceptComparisonModalProps
> = ({ conceptUuids, conceptUuidToIdentifier, open, onOpenChange }) => {
  const [comparisonResult, setComparisonResult] =
    useState<ICompareConceptsResponse | null>(null);
  const [selectedConceptUuid, setSelectedConceptUuid] = useState<string | null>(
    null,
  );
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();
  const compareMutation = useCompareConcepts();

  // Listen for comparison results via WebSocket
  useSocketEvent<'concept.comparison.completed.user'>(
    'concept.comparison.completed.user',
    useCallback((data: IConceptComparisonCompletedMessage) => {
      const result: ICompareConceptsResponse = {
        concepts: data.concepts as IConceptAnalysis[],
        winner: data.winner as ICompareConceptsResponse['winner'],
      };
      setComparisonResult(result);
      setIsWaiting(false);
      // Auto-select the winner
      if (result.winner?.conceptUuid) {
        setSelectedConceptUuid(result.winner.conceptUuid);
      } else if (result.concepts.length > 0) {
        setSelectedConceptUuid(result.concepts[0].conceptUuid);
      }
    }, []),
  );

  // Listen for comparison errors via WebSocket
  useSocketEvent<'concept.comparison.error.user'>(
    'concept.comparison.error.user',
    useCallback((data: IConceptComparisonErrorMessage) => {
      setIsWaiting(false);
      setHasError(true);
      toast.error('Comparison Failed', data.message);
    }, []),
  );

  // Auto-trigger comparison on mount
  useEffect(() => {
    if (open && conceptUuids.length >= 2) {
      setIsWaiting(true);
      setHasError(false);
      compareMutation.mutate(conceptUuids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setComparisonResult(null);
      setSelectedConceptUuid(null);
      setIsWaiting(false);
      setHasError(false);
    }
  }, [open]);

  const selectedConcept: IConceptAnalysis | undefined =
    comparisonResult?.concepts.find(
      (c) => c.conceptUuid === selectedConceptUuid,
    );

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={onOpenChange}
      size='xl'
      hideCloseButton
      className='!max-h-[85vh] !overflow-hidden !p-0'
    >
      <div className='flex h-[80vh] flex-col gap-0 overflow-hidden'>
        {/* Header */}
        <div className='aucctus-border-secondary flex shrink-0 items-center justify-between border-b px-6 py-5'>
          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
              <Scale className='aucctus-stroke-secondary h-5 w-5' />
            </div>
            <div>
              <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
                Compare Concepts
              </h2>
              <p className='aucctus-text-sm aucctus-text-tertiary mt-0.5'>
                Review and compare {conceptUuids.length} concepts side by side
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenChange(false)}
            className='aucctus-bg-secondary hover:aucctus-bg-tertiary rounded-lg p-2 transition-colors'
          >
            <X className='aucctus-stroke-secondary h-5 w-5' />
          </motion.button>
        </div>

        {/* Loading State */}
        {isWaiting && (
          <div className='flex flex-1 flex-col items-center justify-center py-16'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className='aucctus-bg-brand-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full'
            >
              <Loader2 className='aucctus-stroke-brand-primary h-8 w-8 animate-spin' />
            </motion.div>
            <p className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
              Analyzing concepts...
            </p>
            <p className='aucctus-text-sm aucctus-text-tertiary'>
              Our AI is comparing the selected concepts
            </p>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className='flex flex-1 flex-col items-center justify-center py-16'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className='aucctus-bg-error-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full'
            >
              <X className='aucctus-stroke-error-primary h-8 w-8' />
            </motion.div>
            <p className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
              Comparison failed
            </p>
            <p className='aucctus-text-sm aucctus-text-tertiary mb-4'>
              Unable to compare the selected concepts
            </p>
            <button
              onClick={() => {
                setHasError(false);
                setIsWaiting(true);
                compareMutation.mutate(conceptUuids);
              }}
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
              {/* Left Side - Concept Cards List */}
              <div className='aucctus-border-secondary aucctus-bg-secondary/30 w-80 shrink-0 overflow-y-auto border-r p-4'>
                <h3 className='aucctus-text-xs-semibold aucctus-text-tertiary mb-3 uppercase tracking-wide'>
                  Concepts Being Compared
                </h3>
                <div className='space-y-3'>
                  {comparisonResult.concepts.map((concept, index) => {
                    const isWinner =
                      concept.conceptUuid ===
                      comparisonResult.winner.conceptUuid;
                    const isSelected =
                      concept.conceptUuid === selectedConceptUuid;

                    return (
                      <motion.div
                        key={concept.conceptUuid}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.08,
                        }}
                        whileHover={{ y: -2 }}
                        onClick={() =>
                          setSelectedConceptUuid(concept.conceptUuid)
                        }
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
                        <h4 className='aucctus-text-sm-semibold aucctus-text-primary line-clamp-2 pr-14'>
                          {concept.conceptName}
                        </h4>
                        {concept.completenessNote && (
                          <p className='mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700'>
                            <AlertCircle className='mt-0.5 h-3 w-3 shrink-0' />
                            <span className='line-clamp-2'>
                              {concept.completenessNote}
                            </span>
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side - Selected Concept Analysis */}
              <div className='flex-1 overflow-y-auto p-6'>
                <AnimatePresence mode='wait'>
                  {selectedConcept ? (
                    <motion.div
                      key={selectedConcept.conceptUuid}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className='space-y-4'
                    >
                      {/* Completeness Note Banner */}
                      {selectedConcept.completenessNote && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className='flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3'
                        >
                          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
                          <p className='aucctus-text-sm text-amber-700'>
                            {selectedConcept.completenessNote}
                          </p>
                        </motion.div>
                      )}

                      {/* Pros */}
                      <AnalysisSection
                        icon={
                          <ThumbsUp className='aucctus-stroke-secondary h-4 w-4' />
                        }
                        title='Pros'
                        borderColor='border-l-green-500'
                        dotColor='bg-green-500'
                        items={selectedConcept.pros}
                        index={0}
                      />

                      {/* Cons */}
                      <AnalysisSection
                        icon={
                          <ThumbsDown className='aucctus-stroke-secondary h-4 w-4' />
                        }
                        title='Cons'
                        borderColor='border-l-red-500'
                        dotColor='bg-red-500'
                        items={selectedConcept.cons}
                        index={1}
                      />

                      {/* Unknowns */}
                      <AnalysisSection
                        icon={
                          <HelpCircle className='aucctus-stroke-secondary h-4 w-4' />
                        }
                        title='Unknowns'
                        borderColor='border-l-amber-500'
                        dotColor='bg-amber-500'
                        items={selectedConcept.unknowns}
                        index={2}
                      />

                      {/* Recommendation */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.24 }}
                        className='aucctus-bg-primary aucctus-border-secondary rounded-lg border border-l-4 border-l-blue-500 p-4'
                      >
                        <div className='mb-3 flex items-center gap-2'>
                          <Target className='aucctus-stroke-secondary h-4 w-4' />
                          <h3 className='aucctus-text-sm-semibold aucctus-text-primary'>
                            Recommendation
                          </h3>
                        </div>
                        <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                          {selectedConcept.recommendation}
                        </p>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className='aucctus-text-tertiary flex h-full items-center justify-center'>
                      Select a concept to view analysis
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Winner Recommendation Footer */}
            <div className='shrink-0 border-t-2 border-green-500/30 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent px-6 py-6'>
              <div className='flex items-start gap-4'>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className='rounded-xl border border-green-500/30 bg-green-500/15 p-3'
                >
                  <Award className='h-6 w-6 text-green-600' />
                </motion.div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
                      Overall Recommendation
                    </h3>
                    <span className='rounded-full border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700'>
                      AI Analysis
                    </span>
                  </div>
                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                    <span className='font-semibold text-green-700'>
                      &ldquo;{comparisonResult.winner.conceptName}&rdquo;
                    </span>{' '}
                    {comparisonResult.winner.justification}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const identifier =
                      conceptUuidToIdentifier[
                        comparisonResult.winner.conceptUuid
                      ];
                    if (identifier) {
                      onOpenChange(false);
                      navigate(
                        AppPath.ConceptOverview.replace(':id', identifier),
                      );
                    }
                  }}
                  className='btn btn-md shrink-0 bg-green-600 text-white hover:bg-green-700'
                >
                  View Winner
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </LiquidGlassModal>
  );
};

export default ConceptComparisonModal;
