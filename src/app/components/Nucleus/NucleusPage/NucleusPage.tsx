import images from '@assets/img';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React, { useEffect, useState } from 'react';
import { CategoriesGrid } from '../CategoriesGrid';
import { mockCompanyContext, mockQuestions } from '../CategoriesGrid/fixtures';
import { Overview } from '../Overview';
import { CategoryState, QuestionState } from '../StatusDropdown';
import { proposedAdditions } from './fixtures';
import { CategoryStateInfo, CompanyContext, Question } from './types';

const NucleusPage: React.FC = () => {
  const [companyContext] = useState<CompanyContext>(mockCompanyContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTimelineTab, setActiveTimelineTab] = useState('short');
  const [shortTermCarousel, setShortTermCarousel] = useState(0);
  const [midTermCarousel, setMidTermCarousel] = useState(0);
  const [longTermCarousel, setLongTermCarousel] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Manual status override states
  const [categoryStatusOverrides, setCategoryStatusOverrides] = useState<
    Record<string, CategoryState>
  >({
    // Set some categories to different statuses for demonstration
    'company-identity': 'validated',
    'geographic-footprint': 'validated',
    'corporate-strategy': 'new-details',
    offerings: 'new-details',
    customers: 'needs-input',
    brand: 'needs-input',
    'operating-model': 'validated',
    financial: 'new-details',
    ecosystem: 'needs-input',
    'innovation-capability': 'needs-input',
  });
  const [questionStatusOverrides, setQuestionStatusOverrides] = useState<
    Record<string, QuestionState>
  >({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Helper functions for state determination
  const getQuestionState = (question: Question): QuestionState => {
    if (questionStatusOverrides[question.id]) {
      return questionStatusOverrides[question.id];
    }

    if (!question.isAnswered) return 'needs-input';

    // Check if recent updates (within 7 days) indicate new details
    const hasRecentUpdates = question.answers.some((answer) => {
      const updateDate = new Date(answer.lastUpdated);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updateDate > weekAgo;
    });

    if (hasRecentUpdates) return 'new-detail';
    return 'validated';
  };

  const getCategoryStateInfo = (categoryId: string): CategoryStateInfo => {
    if (categoryStatusOverrides[categoryId]) {
      const questions = mockQuestions[categoryId] || [];
      let validated = 0;
      let newDetails = 0;
      let needsInput = 0;
      let totalSources = 0;

      questions.forEach((question) => {
        const state = getQuestionState(question);
        if (state === 'validated') validated++;
        else if (state === 'new-detail') newDetails++;
        else if (state === 'needs-input') needsInput++;

        totalSources += question.answers.length;
      });

      return {
        state: categoryStatusOverrides[categoryId],
        validated,
        newDetails,
        needsInput,
        totalSources,
      };
    }

    const questions = mockQuestions[categoryId] || [];
    let validated = 0;
    let newDetails = 0;
    let needsInput = 0;
    let totalSources = 0;

    questions.forEach((question) => {
      const state = getQuestionState(question);
      if (state === 'validated') validated++;
      else if (state === 'new-detail') newDetails++;
      else if (state === 'needs-input') needsInput++;

      totalSources += question.answers.length;
    });

    // Determine overall category state
    let overallState: CategoryState = 'validated';
    if (needsInput > 0) overallState = 'needs-input';
    else if (newDetails > 0) overallState = 'new-details';

    return {
      state: overallState,
      validated,
      newDetails,
      needsInput,
      totalSources,
    };
  };

  const handleQuestionStatusChange = (
    questionId: string,
    newStatus: QuestionState,
  ) => {
    setQuestionStatusOverrides((prev) => ({
      ...prev,
      [questionId]: newStatus,
    }));
    setActiveDropdown(null);
  };

  const getStateConfig = (state: CategoryState | QuestionState) => {
    switch (state) {
      case 'validated':
        return {
          icon: 'check',
          color: 'aucctus-text-success-primary',
          bgColor: 'aucctus-bg-success-secondary',
          borderColor: 'aucctus-border-success',
          label: 'Validated',
        };
      case 'new-details':
      case 'new-detail':
        return {
          icon: 'refresh',
          color: 'aucctus-text-brand-primary',
          bgColor: 'aucctus-bg-brand-secondary',
          borderColor: 'aucctus-border-brand',
          label: state === 'new-details' ? 'New Details Found' : 'New Detail',
        };
      case 'needs-input':
        return {
          icon: 'alert-triangle',
          color: 'aucctus-text-warning-primary',
          bgColor: 'aucctus-bg-warning-secondary',
          borderColor: 'aucctus-border-warning-subtle',
          label: 'Needs Input',
        };
      default:
        return {
          icon: 'alert-triangle',
          color: 'aucctus-text-quaternary',
          bgColor: 'aucctus-bg-secondary',
          borderColor: 'aucctus-border-secondary',
          label: 'Unknown',
        };
    }
  };

  // Add click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        !(event.target as Element).closest('[data-dropdown]')
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const handleCategoryBadgeClick = (categoryId: string) => {
    setActiveTab('categories');
    setExpandedCategory(categoryId);

    // Use multiple RAF to ensure DOM has fully updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const categoryElement = document.getElementById(
            `category-${categoryId}`,
          );

          if (categoryElement) {
            // Scroll to category with proper offset for header
            const elementRect = categoryElement.getBoundingClientRect();
            const targetScrollY = window.scrollY + elementRect.top - 120; // 120px offset for header

            window.scrollTo({
              top: Math.max(0, targetScrollY),
              behavior: 'smooth',
            });
          } else {
            // Fallback: scroll to categories section with preserved position
            const categoriesSection = document.querySelector(
              '[data-tab="categories"]',
            );
            if (categoriesSection) {
              const sectionRect = categoriesSection.getBoundingClientRect();
              const targetScrollY = window.scrollY + sectionRect.top - 80;

              window.scrollTo({
                top: Math.max(0, targetScrollY),
                behavior: 'smooth',
              });
            }
          }
        });
      });
    });
  };

  const allCategories = companyContext.categories;
  const disruptionRisk = Math.round((5 - companyContext.overallMaturity) * 20);

  return (
    <div className='aucctus-bg-primary min-h-screen'>
      {/* Hero Header Section */}
      <div className='relative h-[32rem] overflow-hidden'>
        <div className='absolute inset-0'>
          {/* Video Background Placeholder */}
          <div
            className='h-full w-full bg-cover bg-center'
            style={{
              backgroundImage: `url(${images.aiExplorationsBackground})`,
            }}
          ></div>
        </div>

        {/* Header Content */}
        <div className='relative z-10 flex h-full flex-col items-center justify-center px-6 py-12'>
          <div className='mb-4'>
            <div className='aucctus-border-success relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1 shadow-lg backdrop-blur-md'>
              <div className='relative'>
                <div className='aucctus-bg-success-primary h-1.5 w-1.5 animate-pulse rounded-full'></div>
                <div className='aucctus-bg-success-primary absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full opacity-75'></div>
              </div>
              <span className='aucctus-text-xs-medium tracking-wide text-white'>
                {companyContext.status}
              </span>
            </div>
          </div>

          {/* Company Name */}
          <h1 className='aucctus-header-2xl-bold mb-4 text-center tracking-tight text-white drop-shadow-xl'>
            {companyContext.companyName}
          </h1>

          {/* Subtitle */}
          <p className='aucctus-text-lg mx-auto mb-12 max-w-2xl text-center leading-relaxed text-white/80'>
            Your central hub of company context used by Aucctus AI Agents
          </p>

          {/* Context Status Pills */}
          <div className='mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3'>
            {allCategories.map((category) => {
              const shortName =
                category.name === 'Corporate Strategy & Structure'
                  ? 'Strategy'
                  : category.name === 'Innovation Maturity'
                    ? 'Innovation'
                    : category.name === 'Customer Profiles & Segments'
                      ? 'Customers'
                      : category.name === 'SWOT Analysis (Innovation Lens)'
                        ? 'SWOT'
                        : category.name === 'Brand & Brand Equity'
                          ? 'Brand'
                          : category.name ===
                              'Market Research & Customer Behavior'
                            ? 'Research'
                            : category.name === 'Financial Performance'
                              ? 'Financial'
                              : category.name === 'Ecosystem & Partnerships'
                                ? 'Ecosystem'
                                : category.name === 'Risk Aversion / Risk Index'
                                  ? 'Risk'
                                  : category.name
                                      .split(' & ')[0]
                                      .split(' /')[0]
                                      .split(' ')[0];
              const stateInfo = getCategoryStateInfo(category.id);
              const stateConfig = getStateConfig(stateInfo.state);

              return (
                <button
                  key={category.id}
                  className='group relative cursor-pointer border-0 bg-transparent p-0'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCategoryBadgeClick(category.id);
                  }}
                >
                  {/* Glassmorphic pill container */}
                  <div className='rounded-full border border-white/20 bg-white/10 px-4 py-2.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/15'>
                    <div className='flex items-center gap-2'>
                      <div
                        className={cn(
                          'relative h-2 w-2 rounded-full transition-all duration-500',
                          {
                            'aucctus-bg-brand-solid':
                              stateInfo.state === 'new-details',
                            'aucctus-bg-warning-solid':
                              stateInfo.state === 'needs-input',
                            'aucctus-bg-success-solid':
                              stateInfo.state === 'validated',
                          },
                        )}
                      ></div>
                      {/* Category name */}
                      <span className='aucctus-text-xs-medium text-white/90'>
                        {shortName}
                      </span>
                      {/* State label */}
                      <span className='aucctus-text-xs-bold text-white'>
                        {stateConfig.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Tab Navigation */}
      <div className='relative'>
        <div className='absolute left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 transform'>
          <div className='aucctus-border-primary rounded-lg border bg-white px-1 py-1 shadow-sm backdrop-blur-sm'>
            <div className='grid h-auto grid-cols-3 gap-0.5 rounded-lg border-0 bg-transparent'>
              <button
                onClick={() => setActiveTab('overview')}
                className={cn({
                  'aucctus-text-sm-medium rounded-md px-3 py-1.5 transition-all duration-200':
                    true,
                  'btn btn-bold btn-primary': activeTab === 'overview',
                  'aucctus-text-secondary hover:aucctus-text-primary hover:aucctus-bg-secondary-hover':
                    activeTab !== 'overview',
                })}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={cn({
                  'aucctus-text-sm-medium rounded-md px-3 py-1.5 transition-all duration-200':
                    true,
                  'btn btn-bold btn-primary': activeTab === 'categories',
                  'aucctus-text-secondary hover:aucctus-text-primary hover:aucctus-bg-secondary-hover':
                    activeTab !== 'categories',
                })}
              >
                Categories
              </button>
              <div className='aucctus-text-sm-medium aucctus-text-quaternary aucctus-bg-disabled flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-1.5 opacity-60 transition-all duration-200'>
                <Icon variant='lock' className='h-3 w-3' />
                AI Insights
              </div>
            </div>
          </div>
        </div>

        {/* Dividing line */}
        <div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Overview
          companyContext={companyContext}
          disruptionRisk={disruptionRisk}
          activeTimelineTab={activeTimelineTab}
          setActiveTimelineTab={setActiveTimelineTab}
          shortTermCarousel={shortTermCarousel}
          setShortTermCarousel={setShortTermCarousel}
          midTermCarousel={midTermCarousel}
          setMidTermCarousel={setMidTermCarousel}
          longTermCarousel={longTermCarousel}
          setLongTermCarousel={setLongTermCarousel}
          expandedCategory={expandedCategory}
          setExpandedCategory={setExpandedCategory}
          proposedAdditions={proposedAdditions}
        />
      )}

      {activeTab === 'categories' && (
        <div
          className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'
          data-tab='categories'
        >
          <CategoriesGrid
            companyContext={companyContext}
            allCategories={allCategories}
            mockQuestions={mockQuestions}
            expandedCategory={expandedCategory}
            setExpandedCategory={setExpandedCategory}
            getCategoryStateInfo={getCategoryStateInfo}
            getStateConfig={getStateConfig}
            setCategoryStatusOverrides={setCategoryStatusOverrides}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            questionStatusOverrides={questionStatusOverrides}
            handleQuestionStatusChange={handleQuestionStatusChange}
            getQuestionState={getQuestionState}
          />
        </div>
      )}
    </div>
  );
};

export default NucleusPage;
