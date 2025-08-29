import React from 'react';
import CategoryCard from './CategoryCard';
import ExpandedCategoryView from './ExpandedCategoryView';
import { QuestionState } from './types';

export interface CategoriesGridProps {
  companyContext: any;
  allCategories: any[];
  mockQuestions: Record<
    string,
    Array<{
      id: string;
      question: string;
      answers: Array<{
        id: string;
        content: string;
        source: string;
        sourceType: 'external' | 'internal' | 'ai-reasoning';
        lastUpdated: string;
        author?: string;
      }>;
      isAnswered: boolean;
    }>
  >;
  expandedCategory: string | null;
  setExpandedCategory: (categoryId: string | null) => void;
  getCategoryStateInfo: (categoryId: string) => any;
  getStateConfig: (state: any) => any;
  setCategoryStatusOverrides: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  questionStatusOverrides: Record<string, QuestionState>;
  handleQuestionStatusChange: (
    questionId: string,
    newStatus: QuestionState,
  ) => void;
  getQuestionState: (question: any) => QuestionState;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  allCategories,
  mockQuestions,
  expandedCategory,
  setExpandedCategory,
  getCategoryStateInfo,
  setCategoryStatusOverrides,
  activeDropdown,
  setActiveDropdown,
  handleQuestionStatusChange,
  getQuestionState,
}) => {
  const getQuestionsForCategory = (categoryId: string) => {
    return mockQuestions[categoryId] || [];
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
      (cat) => cat.id === expandedCategory,
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
        const questions = getQuestionsForCategory(category.id);
        const answeredQuestions = questions.filter((q) => q.isAnswered).length;

        return (
          <CategoryCard
            key={category.id}
            category={category}
            isExpanded={isExpanded}
            questions={questions}
            answeredQuestions={answeredQuestions}
            onToggleExpand={setExpandedCategory}
            getCategoryStateInfo={getCategoryStateInfo}
            setCategoryStatusOverrides={setCategoryStatusOverrides}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            expandedContent={
              <ExpandedCategoryView
                questions={questions}
                handleQuestionStatusChange={handleQuestionStatusChange}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                getQuestionState={getQuestionState}
              />
            }
          />
        );
      })}
    </div>
  );
};

export default CategoriesGrid;
