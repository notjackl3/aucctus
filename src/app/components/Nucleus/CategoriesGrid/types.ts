import { NucleusReportQuestion, NucleusReportSection } from '@libs/api/types';

export type CategoryState = 'validated' | 'new_details' | 'needs_input';
export type QuestionState = 'validated' | 'new_details' | 'needs_input';

export interface CategoryStateInfo {
  state: CategoryState;
  validated: number;
  newDetails: number;
  needsInput: number;
  totalSources: number;
}

export interface CategoriesGridProps {
  allCategories: NucleusReportSection[];
  expandedCategory: string | null;
  setExpandedCategory: (categoryId: string | null) => void;
  getCategoryStateInfo: (categoryId: string) => CategoryStateInfo;
  getStateConfig: (state: CategoryState | QuestionState) => any;
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
  handleSectionStatusChange: (
    sectionId: string,
    newStatus: CategoryState,
  ) => void;
  getQuestionState: (question: NucleusReportQuestion) => QuestionState;
  reportUuid: string;
  isAdmin: boolean;
}

export interface CategoryCardProps {
  category: NucleusReportSection;
  isExpanded: boolean;
  questions: NucleusReportQuestion[];
  answeredQuestions: number;
  onToggleExpand: (categoryId: string | null) => void;
  getCategoryStateInfo: (categoryId: string) => any;
  setCategoryStatusOverrides: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  handleSectionStatusChange: (
    sectionId: string,
    newStatus: CategoryState,
  ) => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  expandedContent?: React.ReactNode;
  isAdmin: boolean;
}

export interface ExpandedCategoryViewProps {
  questions: NucleusReportQuestion[];
  handleQuestionStatusChange: (
    questionId: string,
    newStatus: QuestionState,
  ) => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  getQuestionState: (question: any) => QuestionState;
  onClose: () => void;
  reportUuid: string;
  sectionUuid: string;
  section?: NucleusReportSection; // Add section prop for accessing includeDeepResearchContext
  isAdmin: boolean;
}
