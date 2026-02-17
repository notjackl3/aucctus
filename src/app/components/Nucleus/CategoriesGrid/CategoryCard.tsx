import { ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';
import StatusDropdown from '../StatusDropdown/StatusDropdown';
import StatusTooltip from '../StatusTooltip/StatusTooltip';

import { CategoryCardProps } from './types';
import {
  AlertTriangle,
  Beaker,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ClockArrowUp,
  Globe,
  RefreshCw,
  Workflow,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isExpanded,
  questions,
  onToggleExpand,
  getCategoryStateInfo,
  handleSectionStatusChange,
  activeDropdown,
  setActiveDropdown,
  expandedContent,
  isAdmin,
}) => {
  // Static icon map keyed by section_type - single source of truth for category icons
  const ICONS_BY_SECTION_TYPE: Record<string, string> = {
    basic_profile: 'building',
    geographic: 'globe',
    strategic: 'target',
    products_services: 'inbox-02',
    organizational: 'user-group',
    brand_communications: 'star-01',
    talent_culture: 'gear',
    financial: 'currency-dollar',
    ecosystem: 'link-external',
    technology: 'lightbulb',
  };

  // Status-based color schemes that match StatusDropdown colors
  const getStatusColorScheme = (status: string) => {
    switch (status) {
      case 'validated':
        return {
          bg: 'aucctus-bg-success-secondary',
          border: 'aucctus-border-success',
          stroke: 'aucctus-stroke-success-primary',
        };
      case 'new_details':
        return {
          bg: 'aucctus-bg-brand-secondary',
          border: 'aucctus-border-brand',
          stroke: 'aucctus-stroke-brand-secondary',
        };
      case 'needs_input':
        return {
          bg: 'aucctus-bg-warning-secondary',
          border: 'aucctus-border-warning-subtle',
          stroke: 'aucctus-stroke-warning-primary',
        };
      default:
        return {
          bg: 'aucctus-bg-secondary',
          border: 'aucctus-border-secondary',
          stroke: 'aucctus-stroke-quaternary',
        };
    }
  };

  // Generic category information - hardcoded for consistent card faces
  const GENERIC_CATEGORY_INFO: Record<
    string,
    { title: string; description: string }
  > = {
    basic_profile: {
      title: 'Company Identity & Value Proposition',
      description:
        "Anchor innovation in the company's core value proposition, vision, and fundamental business model.",
    },
    geographic: {
      title: 'Geographic Footprint & Market Presence',
      description:
        'Understand where the company operates and how location-specific capabilities can accelerate innovation.',
    },
    strategic: {
      title: 'Corporate Strategy & Strategic Priorities',
      description:
        'Align innovation with strategic priorities, investment themes, and growth constraints.',
    },
    products_services: {
      title: 'Offerings & Business Units',
      description:
        'Leverage existing product capabilities and formats to accelerate new offering development.',
    },
    organizational: {
      title: 'Customers & Market Insights',
      description:
        'Identify customer segments most open to innovation and understand their adoption drivers.',
    },
    brand_communications: {
      title: 'Brand & Reputation',
      description:
        'Understand how brand positioning, equities, and constraints can support or limit innovation directions.',
    },
    talent_culture: {
      title: 'Operating Model & Core Capabilities',
      description:
        'Identify core capabilities and operational strengths that can enable rapid innovation execution.',
    },
    financial: {
      title: 'Financial Performance & Resource Allocation',
      description:
        'Understand capital allocation patterns and financial constraints that shape innovation investment.',
    },
    ecosystem: {
      title: 'Ecosystem & Partnerships',
      description:
        'Identify partnerships and relationships that can accelerate innovation adoption or reduce time-to-market.',
    },
    technology: {
      title: 'Innovation Capability & Risk Profile',
      description:
        'Assess governance, culture, and risk posture that determine innovation execution speed and success.',
    },
  };

  const sectionType = category.sectionType || 'basic_profile';
  const icon = (ICONS_BY_SECTION_TYPE[sectionType] || 'help-circle') as any;
  const genericInfo =
    GENERIC_CATEGORY_INFO[sectionType] ||
    GENERIC_CATEGORY_INFO['basic_profile'];

  // Get current status and corresponding colors
  const currentStatus = getCategoryStateInfo(category.sectionType).state;
  const colorScheme = getStatusColorScheme(currentStatus);

  // Calculate metrics for individual category using real questions data
  const calculateCategoryMetrics = () => {
    const questionsWithAnswers = questions.filter(
      (q) => q.answers && q.answers.length > 0,
    );
    const allDataPoints = questions
      .flatMap((q) => q.answers || [])
      .filter((answer) => !answer.isAiReasoning);
    const allSources = allDataPoints.flatMap((answer) => answer.sources || []);
    const uniqueSources = new Set(
      allSources
        .filter((source) => source.url?.toUpperCase().trim() !== 'AI REASONING')
        .filter((source) => source.url)
        .map((source) => source.url?.trim()),
    );

    // Map P1/P2 to 'deeper' (strategic), P3 to 'core' (operational)
    const deeperQuestions = questions.filter(
      (q) => q.priority === 'P1' || q.priority === 'P2',
    );

    // Use section.hoursSaved if available, otherwise calculate estimate
    const hoursSaved =
      category.hoursSaved ||
      Math.round(Math.max(questionsWithAnswers.length * 0.25, 1));

    return {
      totalQuestions: questions.length,
      answeredQuestions: questionsWithAnswers.length,
      dataPoints: allDataPoints.length,
      uniqueSources: uniqueSources.size,
      deeperQuestions: deeperQuestions.length,
      hoursSaved: hoursSaved,
    };
  };
  return (
    <div
      key={category.sectionType}
      id={`category-${category.sectionType}`}
      className={cn('transition-all duration-300 ease-in-out', {
        'lg:col-span-2': isExpanded,
      })}
    >
      <div
        className={cn(
          'aucctus-bg-primary aucctus-border-primary rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-md',
          {
            'overflow-hidden':
              !activeDropdown ||
              (!activeDropdown.includes(
                `category-collapsed-${category.sectionType}`,
              ) &&
                !activeDropdown.includes(
                  `category-expanded-${category.sectionType}`,
                )),
          },
        )}
      >
        {/* Category Header */}
        <div
          role='button'
          tabIndex={0}
          className={cn(
            'w-full cursor-pointer p-4 text-left transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500',
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

            onToggleExpand(isExpanded ? null : category.sectionType);

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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onToggleExpand(isExpanded ? null : category.sectionType);
            }
          }}
          aria-expanded={isExpanded}
          aria-controls={`category-content-${category.sectionType}`}
        >
          {isExpanded ? (
            // Expanded layout - horizontal
            <div className='flex items-center justify-between'>
              <div className='flex flex-1 items-center gap-4'>
                {/* Icon on the left - centered to the text group with color coding */}
                <div
                  className={cn(
                    'w-fit flex-shrink-0 rounded-lg border p-2',
                    colorScheme.bg,
                    colorScheme.border,
                  )}
                >
                  <DynamicIcon
                    variant={icon}
                    className={cn('h-5 w-5', colorScheme.stroke)}
                  />
                </div>

                {/* Title and description to the right of icon */}
                <div className='min-w-0 flex-1'>
                  <h3 className='aucctus-text-lg-bold aucctus-text-primary mb-1'>
                    {genericInfo.title}
                  </h3>
                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                    {genericInfo.description}
                  </p>
                </div>
              </div>

              {/* Status Bar and Chevron on the right */}
              <div className='ml-4 flex flex-shrink-0 items-center gap-4'>
                {/* Status Bar */}
                <div className='aucctus-text-xs flex items-center gap-4'>
                  {(() => {
                    const stateInfo = getCategoryStateInfo(
                      category.sectionType,
                    );
                    const categoryMetrics = calculateCategoryMetrics();
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
                              <CheckCircle2 className='aucctus-stroke-success-primary h-4 w-4' />
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
                              <RefreshCw className='aucctus-stroke-info-primary h-4 w-4' />
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
                              <AlertTriangle className='aucctus-stroke-warning-primary h-4 w-4' />
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
                              <Beaker className='aucctus-stroke-tertiary h-4 w-4' />
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
                              <Globe className='aucctus-stroke-tertiary h-4 w-4' />
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
                              <Workflow className='aucctus-stroke-tertiary h-4 w-4' />
                              <span className='aucctus-text-tertiary font-medium'>
                                {categoryMetrics.dataPoints}
                              </span>
                            </div>
                          </ComponentTooltip>

                          <ComponentTooltip
                            tip={
                              <StatusTooltip
                                text={'Hours saved through research automation'}
                              />
                            }
                            hideDelay={0}
                          >
                            <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 transition-colors'>
                              <ClockArrowUp className='aucctus-stroke-tertiary h-4 w-4' />
                              <span className='aucctus-text-tertiary font-medium'>
                                {categoryMetrics.hoursSaved}h
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
                      activeDropdown ===
                      `category-expanded-${category.sectionType}`,
                  })}
                >
                  <StatusDropdown
                    currentStatus={
                      getCategoryStateInfo(category.sectionType || '').state
                    }
                    onStatusChange={(status) =>
                      handleSectionStatusChange(
                        category.sectionType || '',
                        status,
                      )
                    }
                    dropdownId={`category-expanded-${category.sectionType}`}
                    isCategory={true}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    disabled={!isAdmin}
                  />
                </div>

                {/* Chevron */}
                <ChevronDown className='aucctus-stroke-tertiary h-4 w-4' />
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
                        colorScheme.bg,
                        colorScheme.border,
                      )}
                    >
                      <DynamicIcon
                        variant={icon}
                        className={cn('h-5 w-5', colorScheme.stroke)}
                      />
                    </div>
                  </div>

                  {/* Title below icon, left aligned */}
                  <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
                    {genericInfo.title}
                  </h3>
                </div>

                <ChevronLeft className='aucctus-stroke-tertiary h-5 w-5 rotate-180' />
              </div>

              {/* Goal Description - left aligned */}
              <p className='aucctus-text-sm aucctus-text-secondary -mt-1 mb-4 leading-relaxed'>
                {genericInfo.description}
              </p>

              {/* Status Bar at Bottom */}
              <div className='aucctus-border-primary mt-4 border-t pt-3'>
                <div className='flex items-center justify-between'>
                  <div className='aucctus-text-xs flex items-center gap-1'>
                    {(() => {
                      const stateInfo = getCategoryStateInfo(
                        category.sectionType,
                      );
                      const categoryMetrics = calculateCategoryMetrics();
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
                                <CheckCircle2 className='aucctus-stroke-success-primary h-4 w-4' />
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
                                <RefreshCw className='aucctus-stroke-info-primary h-4 w-4' />
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
                                <AlertTriangle className='aucctus-stroke-warning-primary h-4 w-4' />
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
                                <Beaker className='aucctus-stroke-tertiary h-4 w-4' />
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
                                <Globe className='aucctus-stroke-tertiary h-4 w-4' />
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
                                <Workflow className='aucctus-stroke-tertiary h-4 w-4' />
                                <span className='aucctus-text-tertiary font-medium'>
                                  {categoryMetrics.dataPoints}
                                </span>
                              </div>
                            </ComponentTooltip>

                            <ComponentTooltip
                              tip={
                                <StatusTooltip
                                  text={
                                    'Hours saved through research automation'
                                  }
                                />
                              }
                              hideDelay={0}
                            >
                              <div className='hover:aucctus-bg-tertiary flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors'>
                                <ClockArrowUp className='aucctus-stroke-tertiary h-4 w-4' />
                                <span className='aucctus-text-tertiary font-medium'>
                                  {categoryMetrics.hoursSaved}h
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
                        activeDropdown ===
                        `category-collapsed-${category.sectionType}`,
                    })}
                  >
                    <StatusDropdown
                      currentStatus={
                        getCategoryStateInfo(category.sectionType || '').state
                      }
                      onStatusChange={(status) =>
                        handleSectionStatusChange(
                          category.sectionType || '',
                          status,
                        )
                      }
                      dropdownId={`category-collapsed-${category.sectionType}`}
                      isCategory={true}
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <div
          id={`category-content-${category.sectionType}`}
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
