import { ComponentTooltip, Icon } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';
import StatusDropdown from '../StatusDropdown/StatusDropdown';
import StatusTooltip from '../StatusTooltip/StatusTooltip';
import { categoryAISummaries, categoryGoals, mockQuestions } from './fixtures';
import { CategoryCardProps } from './types';

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isExpanded,
  answeredQuestions,
  onToggleExpand,
  getCategoryStateInfo,
  setCategoryStatusOverrides,
  activeDropdown,
  setActiveDropdown,
  expandedContent,
}) => {
  // Calculate metrics for individual category
  const calculateCategoryMetrics = (categoryId: string) => {
    const questions = mockQuestions[categoryId] || [];
    const answeredQuestions = questions.filter((q) => q.isAnswered);
    const allAnswers = questions.flatMap((q) => q.answers);
    const uniqueSources = new Set(allAnswers.map((a) => a.source));
    const deeperQuestions = questions.filter((q) => q?.priority === 'deeper');

    return {
      totalQuestions: questions.length,
      answeredQuestions: answeredQuestions.length,
      dataPoints: allAnswers.length,
      uniqueSources: uniqueSources.size,
      deeperQuestions: deeperQuestions.length,
      equivalentHours: Math.round(answeredQuestions.length * 2.5), // Estimate: 2.5 hours per answered question
    };
  };
  return (
    <div
      key={category.id}
      id={`category-${category.id}`}
      className={cn('transition-all duration-300 ease-in-out', {
        'lg:col-span-2': isExpanded,
      })}
    >
      <div
        className={cn(
          'aucctus-bg-primary aucctus-border-primary rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-md',
          {
            'min-h-80': !isExpanded,
            'overflow-hidden':
              !activeDropdown ||
              (!activeDropdown.includes(`category-collapsed-${category.id}`) &&
                !activeDropdown.includes(`category-expanded-${category.id}`)),
          },
        )}
      >
        {/* Category Header */}
        <button
          type='button'
          className={cn(
            'w-full cursor-pointer p-4 text-left transition-all duration-300 ease-in-out focus:outline-none',
            {
              'aucctus-bg-secondary-subtle aucctus-border-secondary border-b shadow-sm':
                isExpanded,
              'hover:aucctus-bg-primary-hover': !isExpanded,
            },
          )}
          style={{ scrollBehavior: 'auto' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            // Preserve scroll position during expansion
            const currentScrollY = window.scrollY;
            const currentTarget = e.currentTarget;
            const currentTargetRect = currentTarget.getBoundingClientRect();
            const currentTargetOffsetTop =
              currentTargetRect.top + currentScrollY;

            onToggleExpand(isExpanded ? null : category.id);

            // Restore scroll position after DOM updates complete
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const newTargetRect = currentTarget.getBoundingClientRect();
                const newTargetOffsetTop = newTargetRect.top + window.scrollY;
                const scrollDiff = newTargetOffsetTop - currentTargetOffsetTop;

                window.scrollTo({
                  top: currentScrollY + scrollDiff,
                  behavior: 'instant',
                });
              });
            });
          }}
          aria-expanded={isExpanded}
          aria-controls={`category-content-${category.id}`}
        >
          {isExpanded ? (
            // Expanded layout - horizontal
            <div className='flex items-center justify-between'>
              <div className='flex flex-1 items-center gap-4'>
                {/* Icon on the left - centered to the text group with color coding */}
                <div
                  className={cn(
                    'w-fit flex-shrink-0 rounded-lg border p-2',
                    category.colorScheme?.bg,
                    category.colorScheme?.border,
                  )}
                >
                  <Icon
                    variant={category.icon}
                    className={cn('h-5 w-5', category.colorScheme?.stroke)}
                  />
                </div>

                {/* Title and description to the right of icon */}
                <div className='min-w-0 flex-1'>
                  <h3 className='aucctus-text-lg-bold aucctus-text-primary mb-1'>
                    {category.name}
                  </h3>
                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Status Bar and Chevron on the right */}
              <div className='ml-4 flex flex-shrink-0 items-center gap-4'>
                {/* Status Bar */}
                <div className='aucctus-text-xs flex items-center gap-4'>
                  {(() => {
                    const stateInfo = getCategoryStateInfo(category.id);
                    const categoryMetrics = calculateCategoryMetrics(
                      category.id,
                    );
                    return (
                      <>
                        {/* Question Status - Higher Priority */}
                        <div className='flex items-center gap-0.5'>
                          <ComponentTooltip
                            tip={
                              <StatusTooltip
                                text={'Questions validated and confirmed'}
                              />
                            }
                            hideDelay={0}
                          >
                            <div className='hover:aucctus-bg-success-secondary flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 transition-colors'>
                              <Icon
                                variant='check-circle-broken'
                                className='aucctus-stroke-success-primary h-4 w-4'
                              />
                              <span className='aucctus-text-success-primary font-medium'>
                                {stateInfo.validated}
                              </span>
                            </div>
                          </ComponentTooltip>

                          <ComponentTooltip
                            tip={
                              <StatusTooltip
                                text={'Questions with new details to review'}
                              />
                            }
                            hideDelay={0}
                          >
                            <div className='hover:aucctus-bg-info-secondary flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 transition-colors'>
                              <Icon
                                variant='refresh'
                                className='aucctus-stroke-info-primary h-4 w-4'
                              />
                              <span className='aucctus-text-info-primary font-medium'>
                                {stateInfo.newDetails}
                              </span>
                            </div>
                          </ComponentTooltip>

                          <ComponentTooltip
                            tip={
                              <StatusTooltip
                                text={'Questions requiring your input'}
                              />
                            }
                            hideDelay={0}
                          >
                            <div className='hover:aucctus-bg-warning-secondary flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 transition-colors'>
                              <Icon
                                variant='alert-triangle'
                                className='aucctus-stroke-warning-primary h-4 w-4'
                              />
                              <span className='aucctus-text-warning-primary font-medium'>
                                {stateInfo.needsInput}
                              </span>
                            </div>
                          </ComponentTooltip>
                        </div>

                        {/* Visual Separator */}
                        <div className='aucctus-border-secondary h-4 w-px'></div>

                        {/* Research Metrics - Secondary Priority */}
                        <div className='flex items-center gap-0.5'>
                          <ComponentTooltip
                            tip={
                              <StatusTooltip
                                text={
                                  'Deep research questions for strategic insights'
                                }
                              />
                            }
                            hideDelay={0}
                          >
                            <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 transition-colors'>
                              <Icon
                                variant='beaker'
                                className='aucctus-stroke-tertiary h-4 w-4'
                              />
                              <span className='aucctus-text-tertiary font-medium'>
                                {categoryMetrics.deeperQuestions}
                              </span>
                            </div>
                          </ComponentTooltip>

                          <ComponentTooltip
                            tip={
                              <StatusTooltip
                                text={'Unique sources consulted'}
                              />
                            }
                            hideDelay={0}
                          >
                            <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 transition-colors'>
                              <Icon
                                variant='globe'
                                className='aucctus-stroke-tertiary h-4 w-4'
                              />
                              <span className='aucctus-text-tertiary font-medium'>
                                {categoryMetrics.uniqueSources}
                              </span>
                            </div>
                          </ComponentTooltip>

                          <ComponentTooltip
                            tip={
                              <StatusTooltip
                                text={'Data points captured from research'}
                              />
                            }
                            hideDelay={0}
                          >
                            <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 transition-colors'>
                              <Icon
                                variant='dataflow-04'
                                className='aucctus-stroke-tertiary h-4 w-4'
                              />
                              <span className='aucctus-text-tertiary font-medium'>
                                {categoryMetrics.dataPoints}
                              </span>
                            </div>
                          </ComponentTooltip>

                          <ComponentTooltip
                            tip={
                              <StatusTooltip
                                text={'Equivalent human hours saved'}
                              />
                            }
                            hideDelay={0}
                          >
                            <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 transition-colors'>
                              <Icon
                                variant='clock'
                                className='aucctus-stroke-tertiary h-4 w-4'
                              />
                              <span className='aucctus-text-tertiary font-medium'>
                                {categoryMetrics.equivalentHours}h
                              </span>
                            </div>
                          </ComponentTooltip>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Category Status Dropdown */}
                <div
                  className={cn('relative', {
                    'z-50':
                      activeDropdown === `category-expanded-${category.id}`,
                  })}
                >
                  <StatusDropdown
                    currentStatus={getCategoryStateInfo(category.id).state}
                    onStatusChange={(status) =>
                      setCategoryStatusOverrides((prev) => ({
                        ...prev,
                        [category.id]: status,
                      }))
                    }
                    dropdownId={`category-expanded-${category.id}`}
                    isCategory={true}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                  />
                </div>

                {/* Chevron */}
                <Icon
                  variant='chevrondown'
                  className='aucctus-stroke-tertiary h-4 w-4'
                />
              </div>
            </div>
          ) : (
            // Collapsed layout - vertical (original layout)
            <div>
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex-1'>
                  {/* Icon at top left with color coding */}
                  <div className='mb-3'>
                    <div
                      className={cn(
                        'w-fit rounded-lg border p-2',
                        category.colorScheme?.bg,
                        category.colorScheme?.border,
                      )}
                    >
                      <Icon
                        variant={category.icon}
                        className={cn('h-5 w-5', category.colorScheme?.stroke)}
                      />
                    </div>
                  </div>

                  {/* Title below icon, left aligned */}
                  <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
                    {category.name}
                  </h3>
                </div>

                <Icon
                  variant='chevronleft'
                  className='aucctus-stroke-tertiary h-5 w-5 rotate-180'
                />
              </div>

              {/* Goal Description - left aligned */}
              <p className='aucctus-text-sm aucctus-text-secondary -mt-1 mb-4 leading-relaxed'>
                {categoryGoals[category.id]}
              </p>

              {/* AI Summary - only shown when collapsed and has answers */}
              {answeredQuestions > 0 && (
                <div className='aucctus-bg-brand-primary aucctus-border-brand mb-4 rounded-lg border p-3'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Icon
                      variant='star-01'
                      className='aucctus-stroke-brand-primary h-4 w-4'
                    />
                    <span className='aucctus-text-xs aucctus-text-brand-primary font-semibold uppercase tracking-wide'>
                      AI Executive Summary
                    </span>
                  </div>
                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                    {categoryAISummaries[category.id] ||
                      'AI summary will be generated based on answered questions in this category.'}
                  </p>
                </div>
              )}

              {/* Status Bar at Bottom */}
              <div className='aucctus-border-primary mt-4 border-t pt-3'>
                <div className='flex items-center justify-between'>
                  <div className='aucctus-text-xs flex items-center gap-1'>
                    {(() => {
                      const stateInfo = getCategoryStateInfo(category.id);
                      const categoryMetrics = calculateCategoryMetrics(
                        category.id,
                      );
                      return (
                        <>
                          {/* Question Status - Higher Priority */}
                          <div className='flex items-center gap-1'>
                            <ComponentTooltip
                              tip={
                                <StatusTooltip
                                  text={'Questions validated and confirmed'}
                                />
                              }
                              hideDelay={0}
                            >
                              <div className='hover:aucctus-bg-success-secondary flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors'>
                                <Icon
                                  variant='check-circle-broken'
                                  className='aucctus-stroke-success-primary h-4 w-4'
                                />
                                <span className='aucctus-text-success-primary font-medium'>
                                  {stateInfo.validated}
                                </span>
                              </div>
                            </ComponentTooltip>

                            <ComponentTooltip
                              tip={
                                <StatusTooltip
                                  text={'Questions with new details to review'}
                                />
                              }
                              hideDelay={0}
                            >
                              <div className='hover:aucctus-bg-info-secondary flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors'>
                                <Icon
                                  variant='refresh'
                                  className='aucctus-stroke-info-primary h-4 w-4'
                                />
                                <span className='aucctus-text-info-primary font-medium'>
                                  {stateInfo.newDetails}
                                </span>
                              </div>
                            </ComponentTooltip>

                            <ComponentTooltip
                              tip={
                                <StatusTooltip
                                  text={'Questions requiring your input'}
                                />
                              }
                              hideDelay={0}
                            >
                              <div className='hover:aucctus-bg-warning-secondary flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors'>
                                <Icon
                                  variant='alert-triangle'
                                  className='aucctus-stroke-warning-primary h-4 w-4'
                                />
                                <span className='aucctus-text-warning-primary font-medium'>
                                  {stateInfo.needsInput}
                                </span>
                              </div>
                            </ComponentTooltip>
                          </div>

                          {/* Visual Separator */}
                          <div className='aucctus-border-secondary mx-2 h-4 w-px'></div>

                          {/* Research Metrics - Secondary Priority */}
                          <div className='flex items-center gap-0.5'>
                            <ComponentTooltip
                              tip={
                                <StatusTooltip
                                  text={
                                    'Deep research questions for strategic insights'
                                  }
                                />
                              }
                              hideDelay={0}
                            >
                              <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors'>
                                <Icon
                                  variant='beaker'
                                  className='aucctus-stroke-tertiary h-4 w-4'
                                />
                                <span className='aucctus-text-tertiary font-medium'>
                                  {categoryMetrics.deeperQuestions}
                                </span>
                              </div>
                            </ComponentTooltip>

                            <ComponentTooltip
                              tip={
                                <StatusTooltip
                                  text={'Unique sources consulted'}
                                />
                              }
                              hideDelay={0}
                            >
                              <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors'>
                                <Icon
                                  variant='globe'
                                  className='aucctus-stroke-tertiary h-4 w-4'
                                />
                                <span className='aucctus-text-tertiary font-medium'>
                                  {categoryMetrics.uniqueSources}
                                </span>
                              </div>
                            </ComponentTooltip>

                            <ComponentTooltip
                              tip={
                                <StatusTooltip
                                  text={'Data points captured from research'}
                                />
                              }
                              hideDelay={0}
                            >
                              <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors'>
                                <Icon
                                  variant='dataflow-04'
                                  className='aucctus-stroke-tertiary h-4 w-4'
                                />
                                <span className='aucctus-text-tertiary font-medium'>
                                  {categoryMetrics.dataPoints}
                                </span>
                              </div>
                            </ComponentTooltip>

                            <ComponentTooltip
                              tip={
                                <StatusTooltip
                                  text={'Equivalent human hours saved'}
                                />
                              }
                              hideDelay={0}
                            >
                              <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors'>
                                <Icon
                                  variant='clock'
                                  className='aucctus-stroke-tertiary h-4 w-4'
                                />
                                <span className='aucctus-text-tertiary font-medium'>
                                  {categoryMetrics.equivalentHours}h
                                </span>
                              </div>
                            </ComponentTooltip>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Category Status Dropdown */}
                  <div
                    className={cn('ml-auto', {
                      'relative z-50':
                        activeDropdown === `category-collapsed-${category.id}`,
                    })}
                  >
                    <StatusDropdown
                      currentStatus={getCategoryStateInfo(category.id).state}
                      onStatusChange={(status) =>
                        setCategoryStatusOverrides((prev) => ({
                          ...prev,
                          [category.id]: status,
                        }))
                      }
                      dropdownId={`category-collapsed-${category.id}`}
                      isCategory={true}
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </button>

        {/* Expanded Content */}
        <div
          id={`category-content-${category.id}`}
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            {
              'max-h-0 opacity-0': !isExpanded,
              'max-h-[1000px] opacity-100': isExpanded,
            },
          )}
        >
          {isExpanded && expandedContent}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
