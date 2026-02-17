import { FunctionComponent, useMemo } from 'react';
import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import { usePocModalContent } from '@hooks/query/pocPlan.hook';
import type { IPocModalItemContent } from '@libs/api/types';
import { HelpCircle, Rocket } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

// Mapping from backend keys to icon variants
const KEY_TO_ICON: Record<string, string> = {
  strategic_objectives: 'target',
  milestone_plan: 'calendar',
  resource_requirements: 'users-02',
  risk_assessment: 'alert-triangle',
  success_metrics: 'barchart',
  timeline_visualization: 'clock',
};

// Default fallback content when dynamic content is loading or unavailable
const DEFAULT_POC_ITEMS: IPocModalItemContent[] = [
  {
    key: 'strategic_objectives',
    title: 'Strategic Objectives',
    description:
      'Clear hypotheses to validate and success criteria for your POC',
  },
  {
    key: 'milestone_plan',
    title: 'Milestone Plan',
    description: 'Week-by-week deliverables with dependencies and checkpoints',
  },
  {
    key: 'resource_requirements',
    title: 'Resource Requirements',
    description: 'Personnel, technology, and budget estimates for the POC',
  },
  {
    key: 'risk_assessment',
    title: 'Risk Assessment',
    description:
      'Key risks identified with mitigation strategies and contingencies',
  },
  {
    key: 'success_metrics',
    title: 'Success Metrics',
    description: 'Measurable KPIs and go/no-go decision criteria',
  },
  {
    key: 'timeline_visualization',
    title: 'Timeline Visualization',
    description: '12-week POC timeline with phased approach and key milestones',
  },
];

interface IProceedToPocModalProps {
  conceptTitle: string;
  conceptUuid: string;
  conceptIdentifier: string;
  onProceed: () => void;
}

const ProceedToPocModal: FunctionComponent<IProceedToPocModalProps> = ({
  conceptTitle,
  conceptUuid,
  onProceed,
}) => {
  const { closeModal } = useModal();
  const { modalContent, isLoadingContent } = usePocModalContent(conceptUuid);

  // Use dynamic content if available, otherwise fall back to defaults
  const displayItems = useMemo(() => {
    if (modalContent.length > 0) {
      return modalContent;
    }
    return DEFAULT_POC_ITEMS;
  }, [modalContent]);

  const handleProceed = () => {
    onProceed();
    closeModal();
  };

  return (
    <div className='aucctus-bg-primary flex max-h-[90vh] w-[600px] max-w-[90vw] flex-col rounded-lg'>
      {/* Modern Header with gradient background */}
      <div className='relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-6 py-5'>
        {/* Decorative background pattern */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-white/10' />
          <div className='absolute bottom-0 left-0 h-14 w-14 -translate-x-4 translate-y-4 rounded-full bg-white/10' />
        </div>

        {/* Header content */}
        <div className='relative flex flex-col gap-2'>
          <div className='flex items-center gap-3'>
            {/* Icon with glass effect */}
            <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 shadow-lg ring-1 ring-white/30 backdrop-blur-sm'>
              <Rocket className='h-5 w-5 stroke-white' />
            </div>
            <div className='flex flex-col'>
              <span className='text-[10px] font-semibold uppercase tracking-wider text-white/70'>
                Ready to validate
              </span>
              <h1 className='text-xl font-bold text-white'>Proceed to POC</h1>
            </div>
          </div>
          <p className='text-sm text-white/80'>
            Generate a comprehensive POC plan for{' '}
            <span className='font-semibold text-white'>{conceptTitle}</span>
          </p>
        </div>
      </div>

      {/* Body content */}
      <div className='flex flex-col gap-4 p-6'>
        {/* What will be generated */}
        <div className='flex flex-col gap-3'>
          <h2 className='aucctus-text-primary aucctus-text-xs-semibold uppercase tracking-wider opacity-60'>
            What we will generate for you
          </h2>
          <div className='grid grid-cols-2 gap-2'>
            {displayItems.map((item) => (
              <div
                key={item.key}
                className={cn(
                  'aucctus-bg-secondary flex items-start gap-2.5 rounded-lg p-3',
                  'transition-colors duration-200',
                  isLoadingContent && 'animate-pulse',
                )}
              >
                <div className='aucctus-bg-brand-secondary flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md'>
                  <DynamicIcon
                    variant={KEY_TO_ICON[item.key] || 'check'}
                    className='aucctus-stroke-brand-primary h-3.5 w-3.5'
                  />
                </div>
                <div className='flex flex-col gap-0.5'>
                  <span className='aucctus-text-primary aucctus-text-xs-medium'>
                    {item.title}
                  </span>
                  <span className='aucctus-text-tertiary text-[11px] leading-tight'>
                    {item.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info banner */}
        <div className='aucctus-bg-brand-secondary flex items-start gap-2.5 rounded-lg p-3'>
          <HelpCircle className='aucctus-stroke-brand-primary mt-0.5 h-4 w-4 flex-shrink-0' />
          <p className='aucctus-text-secondary text-xs leading-relaxed'>
            The concept will be locked while the POC plan is being generated.
            This typically takes 30-60 seconds. Once complete, you will be taken
            to the POC plan view.
          </p>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-end gap-3 pt-2'>
          <button
            onClick={closeModal}
            className='btn btn-secondary btn-sm px-5'
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            className='btn btn-primary btn-sm flex items-center gap-2 px-5'
          >
            <Rocket className='h-3.5 w-3.5 stroke-current' />
            Generate POC Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProceedToPocModal;
