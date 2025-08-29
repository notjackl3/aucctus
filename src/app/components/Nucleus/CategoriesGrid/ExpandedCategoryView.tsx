import { Avatar, Button, Icon, Input, ToggleSwitch } from '@components';
import { cn } from '@libs/utils/react';
import SourceBadgeList from '@pages/Concept/Report/MarketScan/v3/components/SourceBadgeList';
import React, { useCallback, useMemo, useState } from 'react';
import StatusDropdown from '../StatusDropdown/StatusDropdown';
import { expandedCategoryViewUIText } from './expandedCategoryViewFixtures';
import { mockSources } from './fixtures';
import { ExpandedCategoryViewProps, QuestionState } from './types';

const ExpandedCategoryView: React.FC<ExpandedCategoryViewProps> = ({
  questions,
  handleQuestionStatusChange,
  activeDropdown,
  setActiveDropdown,
  getQuestionState,
}) => {
  // State management for Core/Deeper Questions structure
  const [deeperResearchExpanded, setDeeperResearchExpanded] = useState(false);
  const [includeInContext, setIncludeInContext] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(
    questions.find((q) => q.isAnswered)?.id || questions[0]?.id || null,
  );

  // Sort questions by priority: needs input first, then new details, then validated
  const sortQuestions = useCallback(
    (questionsToSort: typeof questions) => {
      return [...questionsToSort].sort((a, b) => {
        const statusA = getQuestionState(a);
        const statusB = getQuestionState(b);

        // Priority order: needs-input (0), new-detail (1), validated (2)
        const getPriority = (status: string) => {
          if (status === 'needs-input') return 0;
          if (status === 'new-detail') return 1;
          return 2;
        };

        return getPriority(statusA) - getPriority(statusB);
      });
    },
    [getQuestionState],
  );

  // Separate core and deeper research questions
  const coreQuestions = useMemo(() => {
    return questions
      .filter((q) => q.priority === 'core' || !q.priority)
      .slice(0, 12);
  }, [questions]);

  const deeperQuestions = useMemo(() => {
    return questions.filter((q) => q.priority === 'deeper');
  }, [questions]);

  const sortedCoreQuestions = useMemo(
    () => sortQuestions(coreQuestions),
    [coreQuestions, sortQuestions],
  );
  const sortedDeeperQuestions = useMemo(
    () => sortQuestions(deeperQuestions),
    [deeperQuestions, sortQuestions],
  );

  // Render individual question card with proper styling and dropdown functionality
  const renderQuestion = useCallback(
    (
      question: (typeof questions)[0],
      index: number,
      isCore: boolean = true,
    ) => {
      return (
        <div
          key={question.id}
          className={cn(
            'cursor-pointer rounded-lg border p-3 transition-all duration-200',
            {
              'aucctus-bg-brand-primary aucctus-border-brand shadow-sm':
                selectedQuestion === question.id && isCore,
              'aucctus-bg-secondary aucctus-border-secondary shadow-sm':
                selectedQuestion === question.id && !isCore,
              'aucctus-bg-secondary aucctus-border-secondary hover:aucctus-bg-secondary-hover':
                selectedQuestion !== question.id && isCore,
              'aucctus-bg-tertiary aucctus-border-tertiary hover:aucctus-bg-tertiary-hover':
                selectedQuestion !== question.id && !isCore,
            },
          )}
          onClick={() => setSelectedQuestion(question.id)}
        >
          <div className='mb-2 flex items-start justify-between gap-2'>
            <span
              className={cn('aucctus-text-xs font-medium', {
                'aucctus-text-tertiary': isCore,
                'aucctus-text-quaternary': !isCore,
              })}
            >
              {isCore ? `Q${index + 1}` : `D${index + 1}`}
            </span>
            <div
              className='flex items-center gap-2'
              onClick={(e) => e.stopPropagation()}
            >
              <StatusDropdown
                currentStatus={getQuestionState(question)}
                onStatusChange={(status) =>
                  handleQuestionStatusChange(
                    question.id,
                    status as QuestionState,
                  )
                }
                dropdownId={`question-${question.id}`}
                isCategory={false}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                compact={true}
              />
            </div>
          </div>
          <p
            className={cn('aucctus-text-sm line-clamp-3 leading-relaxed', {
              'aucctus-text-secondary': isCore,
              'aucctus-text-tertiary': !isCore,
            })}
          >
            {question.question}
          </p>
        </div>
      );
    },
    [
      selectedQuestion,
      getQuestionState,
      handleQuestionStatusChange,
      setActiveDropdown,
      activeDropdown,
    ],
  );

  const selectedQuestionData = questions.find((q) => q.id === selectedQuestion);

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
              <button
                className='aucctus-bg-primary-hover aspect-square rounded-lg p-1'
                aria-label={expandedCategoryViewUIText.buttons.addNewAssumption}
              >
                <Icon
                  variant='plus'
                  className='aucctus-stroke-brand-primary h-5 w-5'
                />
              </button>
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
                    {sortedCoreQuestions.map((question, index) =>
                      renderQuestion(question, index, true),
                    )}
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
                        <ToggleSwitch
                          checked={includeInContext}
                          onChange={setIncludeInContext}
                          size='md'
                          variant='primary'
                          aria-label='Include deeper research questions in agent context'
                        />
                      </div>
                    </div>

                    {/* Deeper Questions */}
                    <div className='px-4 py-3 pb-6'>
                      <div className='mb-4 space-y-2'>
                        {sortedDeeperQuestions.map((question, index) =>
                          renderQuestion(question, index, false),
                        )}
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
          {selectedQuestionData ? (
            <div className='flex h-full flex-col'>
              {/* Answers Header */}
              <div className='mb-4 flex items-center justify-between'>
                <h4 className='aucctus-text-primary font-semibold'>
                  {expandedCategoryViewUIText.headers.answers}
                </h4>
                <button
                  className='aucctus-bg-primary-hover aspect-square rounded-lg p-1'
                  aria-label={expandedCategoryViewUIText.buttons.addNewAnswer}
                  onClick={() => {
                    const form = document.querySelector(
                      '.answer-form',
                    ) as HTMLElement;
                    if (form) {
                      form.style.display =
                        form.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                >
                  <Icon
                    variant='plus'
                    className='aucctus-stroke-brand-primary h-5 w-5'
                  />
                </button>
              </div>

              {/* Answer Content */}
              <div className='flex-1 overflow-y-auto'>
                {selectedQuestionData.isAnswered ? (
                  <div className='space-y-4'>
                    {/* Multiple Answers */}
                    {selectedQuestionData.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className='aucctus-bg-tertiary aucctus-border-tertiary rounded-lg border p-4'
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            {/* Answer content first */}
                            <p className='aucctus-text-sm aucctus-text-secondary mb-3 leading-relaxed'>
                              {answer.content}
                            </p>
                          </div>

                          {/* Icon-only buttons at top right */}
                          <div className='ml-2 flex gap-1'>
                            <button
                              className='aucctus-bg-primary-hover aucctus-border-secondary rounded-md border p-2 shadow-sm'
                              aria-label='Edit answer'
                            >
                              <Icon
                                variant='edit'
                                className='aucctus-stroke-secondary h-4 w-4'
                              />
                            </button>
                            <button
                              className='aucctus-bg-primary-hover aucctus-border-secondary rounded-md border p-2 shadow-sm'
                              aria-label='Delete assumption'
                            >
                              <Icon
                                variant='trash'
                                className='aucctus-stroke-error-primary h-4 w-4'
                              />
                            </button>
                          </div>
                        </div>

                        {/* Bottom row spanning full width with source left and updated right */}
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='aucctus-bg-quaternary aucctus-text-quaternary aucctus-text-xs flex items-center gap-1.5 rounded-full px-2 py-1 font-medium'>
                              <div className='aucctus-bg-primary flex h-3 w-3 items-center justify-center rounded-sm'>
                                <span className='aucctus-text-primary aucctus-text-xs font-bold'>
                                  {answer.source.charAt(0)}
                                </span>
                              </div>
                              <span>{answer.source}</span>
                            </div>
                            {answer.author && (
                              <span className='aucctus-text-xs aucctus-text-tertiary'>
                                by {answer.author}
                              </span>
                            )}
                          </div>

                          {/* Last updated badge aligned to far right */}
                          <div className='aucctus-bg-secondary flex items-center gap-1 rounded-md px-1.5 py-0.5'>
                            <Icon
                              variant='calendar'
                              className='aucctus-stroke-tertiary h-2.5 w-2.5'
                            />
                            <span className='aucctus-text-xs aucctus-text-tertiary font-medium'>
                              {(() => {
                                const date = new Date(answer.lastUpdated);
                                const month = date
                                  .toLocaleDateString('en-US', {
                                    month: 'short',
                                  })
                                  .toUpperCase();
                                const year = date.toLocaleDateString('en-US', {
                                  year: '2-digit',
                                });
                                return `${month} '${year}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add New Answer Form - appears above button */}
                    <div
                      className='answer-form aucctus-bg-brand-primary aucctus-border-brand mb-4 rounded-lg border p-4'
                      style={{ display: 'none' }}
                    >
                      <div className='space-y-3'>
                        {/* Header with cancel button */}
                        <div className='aucctus-border-brand flex items-center justify-between border-b pb-3'>
                          <div className='flex items-center gap-3'>
                            <Avatar
                              firstName='John'
                              lastName='Smith'
                              className='h-8 w-8'
                            />
                            <div>
                              <p className='aucctus-text-sm aucctus-text-primary font-medium'>
                                John Smith
                              </p>
                              <p className='aucctus-text-xs aucctus-text-tertiary'>
                                {
                                  expandedCategoryViewUIText.buttons
                                    .addingNewAnswer
                                }
                              </p>
                            </div>
                          </div>
                          <button
                            className='aucctus-bg-primary-hover aucctus-border-secondary rounded-md border p-2 shadow-sm'
                            onClick={(e) => {
                              const form = (e.target as HTMLElement).closest(
                                '.answer-form',
                              ) as HTMLElement;
                              if (form) {
                                // Reset form
                                (
                                  form.querySelector(
                                    '#answer-content',
                                  ) as HTMLTextAreaElement
                                ).value = '';
                                (
                                  form.querySelector(
                                    '#answer-source',
                                  ) as HTMLInputElement
                                ).value = '';
                                form.style.display = 'none';
                              }
                            }}
                          >
                            <Icon
                              variant='closeX'
                              className='aucctus-stroke-tertiary h-4 w-4'
                            />
                          </button>
                        </div>
                        <div className='flex flex-col gap-2'>
                          <Input.TextArea
                            name='answer-content'
                            placeholder={
                              expandedCategoryViewUIText.forms.answerContent
                                .placeholder
                            }
                            className='aucctus-bg-primary min-h-[100px] w-full'
                            id='answer-content'
                          />
                          <Input.Field
                            placeholder={
                              expandedCategoryViewUIText.forms.sourceField
                                .placeholder
                            }
                            name='familySize'
                            type='text'
                          />
                        </div>

                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            color='secondary'
                            size='sm'
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.multiple = true;
                              input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
                              input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement)
                                  .files;
                                if (files) {
                                  // TODO: Handle file upload
                                }
                              };
                              input.click();
                            }}
                          >
                            <Icon
                              variant='upload'
                              className='aucctus-stroke-brand-primary h-4 w-4'
                            />
                          </Button>
                          <Button
                            color='primary'
                            size='sm'
                            onClick={(e) => {
                              const form = (e.target as HTMLElement).closest(
                                '.answer-form',
                              );
                              const content = (
                                form?.querySelector(
                                  '#answer-content',
                                ) as HTMLTextAreaElement
                              )?.value;
                              if (content?.trim()) {
                                // TODO: Handle answer submission
                                // Reset form
                                if (form) {
                                  (
                                    form.querySelector(
                                      '#answer-content',
                                    ) as HTMLTextAreaElement
                                  ).value = '';
                                  (
                                    form.querySelector(
                                      '#answer-source',
                                    ) as HTMLInputElement
                                  ).value = '';
                                  (form as HTMLElement).style.display = 'none';
                                }
                              }
                            }}
                          >
                            Add Answer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <div className='aucctus-text-tertiary py-8 text-center'>
                      <Icon
                        variant='clock'
                        className='mx-auto mb-3 h-8 w-8 opacity-50'
                      />
                      <p className='aucctus-text-sm mb-3'>
                        {
                          expandedCategoryViewUIText.placeholders
                            .questionNotAnswered
                        }
                      </p>
                      <Button size='sm' color='secondary'>
                        <Icon variant='beaker' className='mr-2 h-4 w-4' />
                        {expandedCategoryViewUIText.buttons.generateAiAnswer}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='aucctus-text-tertiary py-8 text-center'>
                <Icon
                  variant='file'
                  className='mx-auto mb-2 h-8 w-8 opacity-50'
                />
                <p className='aucctus-text-sm'>
                  {expandedCategoryViewUIText.placeholders.selectQuestionToView}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Source Metrics at Bottom */}
      <div className='aucctus-border-primary aucctus-bg-tertiary border-t p-4'>
        {(() => {
          return <SourceBadgeList sources={mockSources} />;
        })()}
      </div>
    </div>
  );
};

export default ExpandedCategoryView;
