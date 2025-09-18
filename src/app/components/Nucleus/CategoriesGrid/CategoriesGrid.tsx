import React from 'react';
import { NucleusReportQuestion } from '@libs/api/types';
import CategoryCard from './CategoryCard';
import ExpandedCategoryView from './ExpandedCategoryView';
import { CategoriesGridProps } from './types';

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  allCategories,
  expandedCategory,
  setExpandedCategory,
  getCategoryStateInfo,
  setCategoryStatusOverrides,
  activeDropdown,
  setActiveDropdown,
  handleQuestionStatusChange,
  handleSectionStatusChange,
  getQuestionState,
  reportUuid,
  isAdmin,
}) => {
  const getQuestionsForCategory = (sectionType: string) => {
    const section = allCategories.find((s) => s.sectionType === sectionType);
    return section ? section.questions : [];
  };

  // Reorganize cards for proper expansion layout - avoid solo cards above expansion
  const organizeCardsForExpansion = () => {
    if (!expandedCategory) {
      return allCategories.map((category, index) => ({
        category,
        isExpanded: false,
        index,
      }));
    }

    const expandedIndex = allCategories.findIndex(
      (section) => section.sectionType === expandedCategory,
    );

    // If expanded category not found, fall back to showing all categories collapsed
    if (expandedIndex === -1) {
      return allCategories.map((category, index) => ({
        category,
        isExpanded: false,
        index,
      }));
    }

    const cardsBeforeExpanded = allCategories.slice(0, expandedIndex);
    const cardsAfterExpanded = allCategories.slice(expandedIndex + 1);
    const expandedCard = allCategories[expandedIndex];

    // If odd number of cards before expansion, move the last one after expansion
    let beforeCards = [...cardsBeforeExpanded];
    let afterCards = [...cardsAfterExpanded];

    if (beforeCards.length % 2 === 1 && beforeCards.length > 0) {
      const lastCard = beforeCards.pop();
      if (lastCard) afterCards.unshift(lastCard);
    }

    const result = [];

    // Add cards before expanded card (now guaranteed to be in pairs)
    beforeCards.forEach((category) => {
      result.push({
        category,
        isExpanded: false,
        index: allCategories.indexOf(category),
      });
    });

    // Add expanded card
    result.push({
      category: expandedCard,
      isExpanded: true,
      index: expandedIndex,
    });

    // Add cards after expanded card
    afterCards.forEach((category) => {
      result.push({
        category,
        isExpanded: false,
        index: allCategories.indexOf(category),
      });
    });

    return result;
  };

  const organizedCards = organizeCardsForExpansion();

  return (
    <div className='grid auto-rows-min grid-cols-1 gap-6 lg:grid-cols-2'>
      {organizedCards.map(({ category, isExpanded }) => {
        const questions = getQuestionsForCategory(category.sectionType);
        const answeredQuestions = questions.filter(
          (q: NucleusReportQuestion) => q.answers.length > 0,
        ).length;

        return (
          <CategoryCard
            key={category.sectionType}
            category={category}
            isExpanded={isExpanded}
            questions={questions}
            answeredQuestions={answeredQuestions}
            onToggleExpand={setExpandedCategory}
            getCategoryStateInfo={getCategoryStateInfo}
            setCategoryStatusOverrides={setCategoryStatusOverrides}
            handleSectionStatusChange={handleSectionStatusChange}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            isAdmin={isAdmin}
            expandedContent={
              <ExpandedCategoryView
                questions={questions}
                handleQuestionStatusChange={handleQuestionStatusChange}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                getQuestionState={getQuestionState}
                onClose={() => setExpandedCategory(null)}
                reportUuid={reportUuid}
                sectionUuid={category.uuid}
                section={category}
                isAdmin={isAdmin}
              />
            }
          />
        );
      })}
    </div>
  );
};

export default CategoriesGrid;
