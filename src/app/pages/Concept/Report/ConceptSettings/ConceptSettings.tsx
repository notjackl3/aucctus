import { toast, ConceptReportSkeletons } from '@components';
import { useSeed } from '@hooks/query/concepts.hook';
import {
  ConceptIncubationQuestion,
  IConceptSeedAnswer,
  IAnchorThoughtWithQuestions,
} from '@libs/api/types';
import { isMultiSelectQuestion } from '@libs/api/utils/typeGuards';
import { snakeToTitleCase } from '@libs/utils/string';
import React, { useCallback, useState } from 'react';
import SettingsSidebar, { SettingsSection } from './components/SettingsSidebar';
import DataDocumentsSection from './components/DataDocumentsSection';
import ConceptInputsHeader from './components/ConceptInputsHeader';
import SeedInputCardGrid from './components/SeedInputCardGrid';
import { useClarifyingQuestionsWithAnswers } from '@hooks/concepts/clarifying-questions.hook';
import { useCloneSeed } from '@hooks/query/concepts.hook';
import { useConceptEvidence } from '@hooks/query/conceptTrainingDocument.hook';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';
import utils from '@libs/utils';

import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import { useConceptReportContext } from '../ConceptReport/ConceptReportContext';

/**
 * Parse watchtower signal description to extract structured data.
 */
interface ParsedWatchtowerData {
  context: string;
  signalBasis?: string;
  potentialImpact?: string;
  urgency?: string;
}

const parseWatchtowerDescription = (
  description: string | undefined,
): ParsedWatchtowerData | null => {
  if (!description) return null;

  const lines = description.split('\n');
  let context = '';
  let signalBasis: string | undefined;
  let potentialImpact: string | undefined;
  let urgency: string | undefined;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('Signal Basis:')) {
      signalBasis = trimmedLine.replace('Signal Basis:', '').trim();
    } else if (trimmedLine.startsWith('Potential Impact:')) {
      potentialImpact = trimmedLine.replace('Potential Impact:', '').trim();
    } else if (trimmedLine.startsWith('Urgency:')) {
      urgency = trimmedLine.replace('Urgency:', '').trim();
    } else if (trimmedLine) {
      context += (context ? '\n' : '') + trimmedLine;
    }
  }

  return { context, signalBasis, potentialImpact, urgency };
};

/**
 * Type guard to check if anchor thought has nested questions (IDEA_PLAYGROUND seed)
 */
const isIdeaPlaygroundAnchorThought = (
  anchorThought: unknown,
): anchorThought is IAnchorThoughtWithQuestions => {
  return (
    !!anchorThought &&
    typeof anchorThought === 'object' &&
    'questions' in anchorThought &&
    Array.isArray((anchorThought as IAnchorThoughtWithQuestions).questions)
  );
};

const formatAnswer = (
  answer: IConceptSeedAnswer,
  question: ConceptIncubationQuestion,
): string => {
  if (!answer) return '';

  let savedAnswers = [...answer.answer];
  let userAnswers: string[] = [];
  if (isMultiSelectQuestion(question)) {
    let multiSelectAnswer = savedAnswers.pop();
    if (multiSelectAnswer) {
      if (['b2c', 'b2b', 'b2b2c'].includes(multiSelectAnswer)) {
        multiSelectAnswer = multiSelectAnswer.toUpperCase();
      } else {
        multiSelectAnswer = snakeToTitleCase(multiSelectAnswer);
      }
      userAnswers.push(multiSelectAnswer);
    }
  }

  if (savedAnswers.length > 0) {
    userAnswers = [...userAnswers, ...savedAnswers];
  }

  if (answer.details) {
    userAnswers = [...userAnswers, answer.details];
  }

  return userAnswers.join(', ');
};

const ConceptSettings: React.FC = () => {
  const { concept, isReadOnly } = useConceptReportContext();
  const { seedDraft, isLoading } = useSeed(concept.seedUuid || '');
  const navigate = useNavigate();
  const { resetQuestionnaire, setIsNewSeed } = useConceptIncubationStore();
  const { mutate: cloneSeed, isLoading: isCloning } = useCloneSeed();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('seed-summary');

  // Fetch pending evidence count for sidebar badge
  const { pendingCount } = useConceptEvidence(concept.identifier, 'pending');

  // Get all ignition questions
  const ignitionQuestions = React.useMemo(
    () =>
      seedDraft?.answers
        ?.filter((answer) => answer.question.isIgnition)
        .sort((a, b) => a.question.order - b.question.order) || [],
    [seedDraft?.answers],
  );

  const filteredClarifyingQuestions = useClarifyingQuestionsWithAnswers(
    seedDraft?.clarifyingQuestions || [],
    seedDraft?.answers,
  );

  const isWatchtowerSeed = seedDraft?.type === 'WATCHTOWER_SIGNAL';
  const isEmployeeSubmissionSeed = seedDraft?.type === 'EMPLOYEE_SUBMISSION';

  const parsedWatchtowerData = React.useMemo(() => {
    if (isWatchtowerSeed) {
      return parseWatchtowerDescription(seedDraft?.description);
    }
    return null;
  }, [isWatchtowerSeed, seedDraft?.description]);

  const handleCloneConceptSeed = useCallback(() => {
    if (!seedDraft?.uuid) {
      toast.error('No Seed Available', 'No seed available to clone');
      return;
    }

    cloneSeed(seedDraft.uuid, {
      onSuccess: (clonedSeed) => {
        toast.success('Seed Cloned', 'Concept seed cloned successfully!');
        resetQuestionnaire();
        setIsNewSeed(false);
        let baseUrl = `${AppPath.IncubateConcept}`;

        if (clonedSeed.type === 'IDEA_PLAYGROUND') {
          baseUrl = `${AppPath.IdeaPlayground}`;
        }

        navigate(
          `${baseUrl}/?${new URLSearchParams({
            seed: clonedSeed.uuid,
          }).toString()}`,
        );
      },
      onError: (error) => {
        const message = utils.osiris.parseFormError(error);
        toast.error(
          'Seed Clone Failed',
          message || 'Failed to clone concept seed. Please try again.',
        );
      },
    });
  }, [seedDraft?.uuid, cloneSeed, resetQuestionnaire, setIsNewSeed, navigate]);

  if (isLoading) {
    return <ConceptReportSkeletons.ConceptSettingsSkeleton />;
  }

  const isIdeaPlaygroundSeed =
    seedDraft?.type === 'IDEA_PLAYGROUND' &&
    seedDraft?.anchorThought &&
    isIdeaPlaygroundAnchorThought(seedDraft.anchorThought);

  const showActions =
    !isReadOnly &&
    !!seedDraft &&
    !isWatchtowerSeed &&
    !isEmployeeSubmissionSeed;

  return (
    <div className='h-full w-full'>
      <div className='flex gap-4'>
        {/* Sidebar */}
        <SettingsSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          pendingEvidenceCount={pendingCount}
        />

        {/* Content */}
        <div className='min-w-0 flex-1'>
          <div className='no-scrollbar mt-4 flex flex-1 flex-col gap-6 pb-24'>
            {/* ============================================ */}
            {/* Concept Inputs Section                      */}
            {/* ============================================ */}
            {activeSection === 'seed-summary' && (
              <>
                <ConceptInputsHeader
                  onDuplicateSeed={handleCloneConceptSeed}
                  isDuplicatingSeed={isCloning}
                  showActions={showActions}
                />

                {seedDraft ? (
                  <SeedInputCardGrid
                    seedDraft={seedDraft}
                    ignitionQuestions={ignitionQuestions}
                    clarifyingQuestions={filteredClarifyingQuestions}
                    isWatchtowerSeed={isWatchtowerSeed}
                    isEmployeeSubmissionSeed={isEmployeeSubmissionSeed}
                    isIdeaPlaygroundSeed={!!isIdeaPlaygroundSeed}
                    parsedWatchtowerData={parsedWatchtowerData}
                    formatAnswer={formatAnswer}
                  />
                ) : (
                  <div className='flex items-center justify-center py-12'>
                    <p className='aucctus-text-secondary aucctus-text-md'>
                      No seed information available
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ============================================ */}
            {/* Data & Documents Section                     */}
            {/* ============================================ */}
            {activeSection === 'data-documents' && (
              <DataDocumentsSection
                identifier={concept.identifier}
                concept={concept}
                isReadOnly={isReadOnly}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptSettings;
