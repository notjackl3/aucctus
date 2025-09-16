import { Icon, ToggleSwitch, Modal } from '@components';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@libs/utils/react';
import { expandedCategoryViewUIText } from './expandedCategoryViewFixtures';
import { useModal } from '../../../context/ModalContextProvider';
import {
  useDeleteQuestion,
  useDeleteAnswer,
  useUpdateSection,
} from '../../../hooks/query/nucleusCrud.hook';

import { ExpandedCategoryViewProps } from './types';
import QuestionAnswerDisplay from './QuestionAnswerDisplay';
import QuestionCard from './QuestionCard';

const ExpandedCategoryView: React.FC<ExpandedCategoryViewProps> = ({
  questions,
  handleQuestionStatusChange,
  activeDropdown,
  setActiveDropdown,
  getQuestionState,
  onClose,
  reportUuid,
  sectionUuid,
  section, // Add section prop to get the includeDeepResearchContext value
  isAdmin,
}) => {
  // State management for Core/Deeper Questions structure
  const [deeperResearchExpanded, setDeeperResearchExpanded] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(
    questions.find((q) => q.answers && q.answers.length > 0)?.uuid ||
      questions[0]?.uuid ||
      null,
  );

  // Modal and CRUD operations
  const { openModal, closeModal } = useModal();
  const { mutate: deleteQuestion, isLoading: isQuestionDeleting } =
    useDeleteQuestion(reportUuid);
  const { mutate: deleteAnswer, isLoading: isAnswerDeleting } =
    useDeleteAnswer(reportUuid);
  const { mutate: updateSection, isLoading: isSectionUpdating } =
    useUpdateSection(reportUuid);

  // CRUD handlers
  const handleAddQuestion = useCallback(() => {
    openModal(Modal.AddQuestionModal, {
      reportUuid,
      sectionUuid,
    });
  }, [openModal, reportUuid, sectionUuid]);

  const handleEditQuestion = useCallback(
    (question: (typeof questions)[0]) => {
      openModal(Modal.EditQuestionModal, {
        reportUuid,
        question,
      });
    },
    [openModal, reportUuid],
  );

  const handleDeleteQuestion = useCallback(
    (question: (typeof questions)[0]) => {
      openModal(Modal.Confirmation, {
        title: 'Delete Question',
        subtitle:
          'Are you sure you want to delete this question? This action cannot be undone.',
        actions: [
          {
            title: 'Cancel',
            variant: 'light',
            onClick: () => {
              closeModal();
            },
          },
          {
            title: 'Delete',
            variant: 'danger',
            onClick: () => {
              deleteQuestion(
                { questionUuid: question.uuid },
                {
                  onSuccess: () => {
                    closeModal();
                  },
                  onError: () => {
                    // Keep modal open on error so user can see the error toast
                  },
                },
              );
            },
          },
        ],
      });
    },
    [openModal, closeModal, deleteQuestion],
  );

  const handleAddAnswer = useCallback(
    (questionUuid: string) => {
      openModal(Modal.AddAnswerModal, {
        reportUuid,
        questionUuid,
      });
    },
    [openModal, reportUuid],
  );

  const handleEditAnswer = useCallback(
    (answer: any) => {
      openModal(Modal.EditAnswerModal, {
        reportUuid,
        answer,
      });
    },
    [openModal, reportUuid],
  );

  const handleDeleteAnswer = useCallback(
    (answer: any) => {
      openModal(Modal.Confirmation, {
        title: 'Delete Answer',
        subtitle:
          'Are you sure you want to delete this answer? This action cannot be undone.',
        actions: [
          {
            title: 'Cancel',
            variant: 'light',
            onClick: () => {
              closeModal();
            },
          },
          {
            title: 'Delete',
            variant: 'danger',
            onClick: () => {
              deleteAnswer(
                { answerUuid: answer.uuid },
                {
                  onSuccess: () => {
                    closeModal();
                  },
                  onError: () => {
                    // Keep modal open on error so user can see the error toast
                  },
                },
              );
            },
          },
        ],
      });
    },
    [openModal, closeModal, deleteAnswer],
  );

  // Handler for updating include in context toggle
  const handleIncludeInContextChange = useCallback(
    (newValue: boolean) => {
      // Only allow admin users to change include in context
      if (!isAdmin) {
        return;
      }
      updateSection({
        sectionUuid,
        data: { includeDeepResearchContext: newValue },
      });
    },
    [updateSection, sectionUuid, isAdmin],
  );

  // Sort questions alphabetically by question text
  const sortQuestions = useCallback(
    (questionsToSort: typeof questions) => {
      return [...questionsToSort].sort((a, b) => {
        // Sort alphabetically by question text
        return a.question.localeCompare(b.question);
      });
    },
    [], // No dependencies needed for alphabetical sorting
  );

  // Separate core and deeper research questions
  // Map real data: P1 = 'core' (high priority), P2/P3 = 'deeper' (strategic research)
  const coreQuestions = useMemo(() => {
    return questions
      .filter((q) => q.priority === 'P1' || !q.priority)
      .slice(0, 12);
  }, [questions]);

  const deeperQuestions = useMemo(() => {
    return questions.filter((q) => q.priority === 'P2' || q.priority === 'P3');
  }, [questions]);

  const sortedCoreQuestions = useMemo(
    () => sortQuestions(coreQuestions),
    [coreQuestions, sortQuestions],
  );
  const sortedDeeperQuestions = useMemo(
    () => sortQuestions(deeperQuestions),
    [deeperQuestions, sortQuestions],
  );

  const selectedQuestionData = questions.find(
    (q) => q.uuid === selectedQuestion,
  );

  return (
    <div className='aucctus-border-primary border-t'>
      <div className='flex h-[500px]'>
        {/* Left Side - Core/Deeper Questions Structure */}
        <div className='aucctus-border-primary aucctus-bg-primary relative w-1/3 border-r'>
          {/* Header */}
          <div className='aucctus-border-primary aucctus-bg-primary border-b p-4'>
            <div className='flex items-center justify-between'>
              <h4 className='aucctus-text-sm aucctus-text-primary font-semibold'>
                {expandedCategoryViewUIText.headers.researchQuestions}
              </h4>
              <div className='flex items-center gap-2'>
                <button
                  className={cn(
                    'aspect-square rounded-lg p-1',
                    isAdmin
                      ? 'aucctus-bg-primary-hover cursor-pointer'
                      : 'aucctus-bg-disabled cursor-not-allowed opacity-50',
                  )}
                  onClick={isAdmin ? handleAddQuestion : undefined}
                  disabled={!isAdmin}
                  aria-label='Add Question'
                  title={isAdmin ? 'Add Question' : 'Admin access required'}
                >
                  <Icon
                    variant='plus'
                    className={cn(
                      'h-5 w-5',
                      isAdmin
                        ? 'aucctus-stroke-brand-primary'
                        : 'aucctus-stroke-disabled',
                    )}
                  />
                </button>
                <button
                  className='aucctus-bg-primary-hover aucctus-border-secondary hover:aucctus-bg-secondary-hover aspect-square rounded-lg border p-1'
                  onClick={onClose}
                  aria-label='Close expanded view'
                >
                  <Icon
                    variant='closeX'
                    className='aucctus-stroke-tertiary h-4 w-4'
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className='aucctus-bg-primary h-[440px] overflow-y-auto pb-8'>
            {/* Core Questions Section - Distinct Visual Container */}
            <div className='aucctus-bg-primary aucctus-border-secondary border-b'>
              <div className='aucctus-bg-secondary aucctus-border-secondary border-b px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <div className='aucctus-bg-quinary h-2 w-2 rounded-full'></div>
                  <h5 className='aucctus-text-sm aucctus-text-secondary font-bold'>
                    {expandedCategoryViewUIText.headers.coreQuestions}
                  </h5>
                  <div className='aucctus-bg-quaternary aucctus-text-quaternary aucctus-border-tertiary rounded border px-1.5 py-0.5 text-xs'>
                    {sortedCoreQuestions.length}
                  </div>
                </div>
              </div>

              <div className='p-4'>
                {sortedCoreQuestions.length > 0 ? (
                  <div className='space-y-2'>
                    {sortedCoreQuestions.map((question, index) => (
                      <QuestionCard
                        key={question.uuid}
                        question={question}
                        index={index}
                        isCore={true}
                        isSelected={selectedQuestion === question.uuid}
                        questionState={getQuestionState(question)}
                        activeDropdown={activeDropdown}
                        onSelect={setSelectedQuestion}
                        onStatusChange={handleQuestionStatusChange}
                        onEdit={handleEditQuestion}
                        onDelete={handleDeleteQuestion}
                        setActiveDropdown={setActiveDropdown}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='aucctus-text-tertiary py-6 text-center'>
                    <p className='aucctus-text-sm'>
                      {
                        expandedCategoryViewUIText.placeholders
                          .noQuestionsAvailable
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Deeper Research Section - Collapsible */}
            {deeperQuestions.length > 0 && (
              <div className='aucctus-bg-secondary'>
                {/* Collapsible Trigger */}
                <button
                  className='aucctus-border-tertiary hover:aucctus-bg-tertiary group flex w-full items-center justify-between border-b px-4 py-3 transition-colors'
                  onClick={() =>
                    setDeeperResearchExpanded(!deeperResearchExpanded)
                  }
                >
                  <div className='flex items-center gap-2'>
                    <div className='aucctus-bg-quinary h-2 w-2 rounded-full'></div>
                    <h5 className='aucctus-text-sm aucctus-text-secondary font-medium'>
                      {expandedCategoryViewUIText.headers.deeperResearch}
                    </h5>
                    <div className='aucctus-bg-tertiary aucctus-text-tertiary aucctus-border-quaternary rounded border px-1.5 py-0.5 text-xs'>
                      {deeperQuestions.length}
                    </div>
                    <Icon
                      variant='help-circle'
                      className='aucctus-stroke-quaternary hover:aucctus-stroke-tertiary h-3 w-3 transition-colors'
                    />
                  </div>
                  <div className='flex items-center gap-1'>
                    <Icon
                      variant={
                        deeperResearchExpanded ? 'chevrondown' : 'chevronright'
                      }
                      className='aucctus-stroke-quaternary group-hover:aucctus-stroke-tertiary h-4 w-4'
                    />
                  </div>
                </button>

                {/* Collapsible Content */}
                {deeperResearchExpanded && (
                  <>
                    {/* Context Control Toggle */}
                    <div className='aucctus-border-tertiary border-b px-4 py-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='aucctus-text-xs aucctus-text-tertiary font-medium'>
                            {
                              expandedCategoryViewUIText.toggles
                                .includeInContext
                            }
                          </span>
                          <Icon
                            variant='help-circle'
                            className='aucctus-stroke-quaternary hover:aucctus-stroke-tertiary h-3 w-3'
                          />
                        </div>
                        <div title={isAdmin ? '' : 'Admin access required'}>
                          <ToggleSwitch
                            checked={
                              section?.includeDeepResearchContext ?? true
                            }
                            onChange={handleIncludeInContextChange}
                            disabled={isSectionUpdating || !isAdmin}
                            size='md'
                            variant='primary'
                            aria-label='Include deeper research questions in agent context'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deeper Questions */}
                    <div className='px-4 py-3 pb-6'>
                      <div className='mb-4 space-y-2'>
                        {sortedDeeperQuestions.map((question, index) => (
                          <QuestionCard
                            key={question.uuid}
                            question={question}
                            index={index}
                            isCore={false}
                            isSelected={selectedQuestion === question.uuid}
                            questionState={getQuestionState(question)}
                            activeDropdown={activeDropdown}
                            onSelect={setSelectedQuestion}
                            onStatusChange={handleQuestionStatusChange}
                            onEdit={handleEditQuestion}
                            onDelete={handleDeleteQuestion}
                            setActiveDropdown={setActiveDropdown}
                            isAdmin={isAdmin}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Answer Cards */}
        <div className='flex-1 p-6'>
          <QuestionAnswerDisplay
            selectedQuestionData={selectedQuestionData}
            onAddAnswer={handleAddAnswer}
            onEditAnswer={handleEditAnswer}
            onDeleteAnswer={handleDeleteAnswer}
            isDeletingLoading={isAnswerDeleting}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      {/* Category Metrics at Bottom */}
      <div className='aucctus-border-primary aucctus-bg-tertiary border-t p-4'></div>

      {/* Loading overlay for question operations */}
      <LoadingMask isLoading={isQuestionDeleting} />
    </div>
  );
};

export default ExpandedCategoryView;
