import { CategoryData, QuestionData } from './fixtures';

export type CategoryState = 'validated' | 'new-details' | 'needs-input';
export type QuestionState = 'validated' | 'new-detail' | 'needs-input';

export interface CategoryStateInfo {
  state: CategoryState;
  validated: number;
  newDetails: number;
  needsInput: number;
  totalSources: number;
}

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
  calculateProgress: (categoryId: string) => number;
  expandedCategory: string | null;
  setExpandedCategory: (categoryId: string | null) => void;
  getCategoryStateInfo: (categoryId: string) => CategoryStateInfo;
  getStateConfig: (state: any) => any;
  setCategoryStatusOverrides: React.Dispatch<
    React.SetStateAction<Record<string, CategoryState>>
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

export interface CategoryCardProps {
  category: CategoryData;
  isExpanded: boolean;
  questions: QuestionData[];
  answeredQuestions: number;
  onToggleExpand: (categoryId: string | null) => void;
  getCategoryStateInfo: (categoryId: string) => any;
  setCategoryStatusOverrides: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  expandedContent?: React.ReactNode;
}

export interface ExpandedCategoryViewProps {
  questions: Array<{
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
    priority?: 'core' | 'deeper';
    cluster?: string;
  }>;
  handleQuestionStatusChange: (
    questionId: string,
    newStatus: QuestionState,
  ) => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  getQuestionState: (question: any) => QuestionState;
}
