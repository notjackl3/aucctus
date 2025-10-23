import { Icon } from '@components';
import {
  useConceptIncubationQuestionnaire,
  useSaveSeed,
} from '@hooks/query/concepts.hook';
import { AppPath } from '@routes/routes';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React from 'react';
import { toast } from '@components';
import LoadingMask from './util/LoadingMask';

type QuestionPath = 'expand-an-existing-idea' | 'identify-new-opportunities';

const ideaCards = [
  {
    title: 'Expand An Existing Idea',
    description:
      "Describe an idea you already have and we'll help you validate it.",
    icon: 'lightbulb' as IconVariant,
    path: 'expand-an-existing-idea' as QuestionPath,
    animationDelay: 600,
    disabled: false,
  },
  {
    title: 'Identify New Opportunities',
    description:
      "Describe the problem you want to solve and we'll suggest ideas.",
    icon: 'telescope' as IconVariant,
    path: 'identify-new-opportunities' as QuestionPath,
    animationDelay: 800,
  },
];

interface IdeaCardProps {
  title: string;
  description: string;
  icon: IconVariant;
  path: QuestionPath;
  style: React.CSSProperties;
  onSelect: (path: QuestionPath) => void;
  disabled: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({
  title,
  description,
  icon,
  path,
  style,
  onSelect,
  disabled,
}) => (
  <div
    className='aucctus-bg-primary aucctus-border-secondary flex flex-1 flex-col gap-4 rounded-xl border p-4'
    style={style}
  >
    <div>
      <span className='aucctus-bg-tertiary flex h-14 w-14 items-center justify-center rounded-full align-middle'>
        <Icon variant={icon} className='h-8 w-8 stroke-primary-900' />
      </span>
    </div>
    <div className='aucctus-text-brand-secondary aucctus-text-xl-medium'>
      {title}
    </div>
    <div className='aucctus-text-secondary aucctus-text-lg'>{description}</div>
    <div className='flex-1'></div>
    <div>
      <button
        className='btn btn-bold btn-primary w-full'
        onClick={() => onSelect(path)}
        disabled={disabled}
      >
        {disabled ? 'Coming Soon' : 'Start'}
      </button>
    </div>
  </div>
);

const GenerateNewIdeas: React.FC = () => {
  const { data: questionnaires } = useConceptIncubationQuestionnaire();
  const {
    setActiveQuestionnaire,
    setDraftSeedUuid,
    setCurrentQuestionOrder,
    resetQuestionnaire,
  } = useConceptIncubationStore();
  const contentRef = React.useRef<HTMLDivElement>(null);

  const {
    mutate: saveConceptSeedDraft,
    isLoading: isSaveConceptSeedDraftLoading,
  } = useSaveSeed();

  const getAnimationStyle = React.useCallback(
    (duration: number, offset: number) => ({
      opacity: 0,
      animation: `slideInCenter ${duration}ms ease-out forwards`,
      animationDelay: `${offset}ms`,
    }),
    [],
  );

  const handleTransition = React.useCallback(
    (contentElement?: HTMLDivElement, callback?: () => void) => {
      if (!contentElement) {
        callback?.();
        return;
      }
      const handleTransitionEnd = () => {
        contentElement.removeEventListener(
          'transitionend',
          handleTransitionEnd,
        );
        callback?.();
      };
      contentElement.addEventListener('transitionend', handleTransitionEnd);
      contentElement.classList.replace('opacity-100', 'opacity-0');
    },
    [],
  );

  const selectQuestionPath = React.useCallback(
    (questionPath: QuestionPath) => {
      const contentElement = contentRef.current;
      if (questionPath === 'expand-an-existing-idea' && contentElement) {
        saveConceptSeedDraft(
          {
            type: 'EXPAND_AN_EXISTING_IDEA',
          },
          {
            onSuccess: (response) => {
              handleTransition(contentElement, () => {
                resetQuestionnaire();
                setActiveQuestionnaire(questionnaires?.expandAnExistingIdea);
                setDraftSeedUuid(response.uuid);
                setCurrentQuestionOrder(1);
                // Update the URL to include the seed UUID without refreshing the page
                window.history.pushState(
                  { seedUuid: response.uuid },
                  '',
                  `${AppPath.IncubateConcept}?seed=${response.uuid}`,
                );
              });
            },
            onError: () => {
              toast.errorAnimated(
                'Save Failed',
                'Could not save concept seed draft.',
              );
            },
          },
        );
      } else if (
        questionPath === 'identify-new-opportunities' &&
        contentElement
      ) {
        saveConceptSeedDraft(
          {
            type: 'IDENTIFY_NEW_OPPORTUNITIES',
          },
          {
            onSuccess: (response) => {
              handleTransition(contentElement, () => {
                resetQuestionnaire();
                setActiveQuestionnaire(
                  questionnaires?.identifyNewOpportunities,
                );
                setDraftSeedUuid(response.uuid);
                setCurrentQuestionOrder(1);
                // Update the URL to include the seed UUID without refreshing the page
                window.history.pushState(
                  { seedUuid: response.uuid },
                  '',
                  `${AppPath.IncubateConcept}?seed=${response.uuid}`,
                );
              });
            },
            onError: () => {
              toast.errorAnimated(
                'Save Failed',
                'Could not save concept seed draft.',
              );
            },
          },
        );
      }
    },
    [
      questionnaires,
      setDraftSeedUuid,
      handleTransition,
      saveConceptSeedDraft,
      setActiveQuestionnaire,
      setCurrentQuestionOrder,
      resetQuestionnaire,
    ],
  );

  return (
    <>
      <div
        ref={contentRef}
        className='ease flex min-h-full flex-col justify-center opacity-100 !transition-all duration-300'
      >
        <div
          style={getAnimationStyle(500, 200)}
          className='aucctus-text-brand-primary aucctus-header-sm'
        >
          Generate New Ideas
        </div>
        <div
          style={getAnimationStyle(500, 400)}
          className='aucctus-text-secondary aucctus-text-lg'
        >
          Let Aucctus AI ignite your imagination and suggest new ideas to
          transform your business
        </div>
        <div className='mt-4 flex flex-row gap-4'>
          {ideaCards.map((ideaCard) => (
            <IdeaCard
              key={ideaCard.path}
              title={ideaCard.title}
              description={ideaCard.description}
              icon={ideaCard.icon}
              path={ideaCard.path}
              disabled={!!ideaCard.disabled}
              style={getAnimationStyle(500, ideaCard.animationDelay)}
              onSelect={selectQuestionPath}
            />
          ))}
        </div>
      </div>

      <LoadingMask isLoading={isSaveConceptSeedDraftLoading} />
    </>
  );
};

export default GenerateNewIdeas;
