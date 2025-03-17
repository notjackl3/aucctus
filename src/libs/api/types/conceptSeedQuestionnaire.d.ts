export interface BaseConceptIncubationQuestion {
  id: number;
  identifier: string;
  label: string;
  required: boolean;
  dependsOn?: string;
  dependsOnValue?: string[];
  order: number; // x for main questions, x.2, x.4, etc for sub questions
}

export interface IConceptIncubationTextQuestion
  extends BaseConceptIncubationQuestion {
  fieldType: 'text';
  placeholder?: string;
}

export interface IConceptIncubationTextareaQuestion
  extends BaseConceptIncubationQuestion {
  fieldType: 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface IDetailQuestion {
  fieldType: 'text' | 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface IConceptIncubationMultiSelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

export type multiSelectFieldType = 'multiSelect' | 'radioButton';

export interface IConceptIncubationMultiSelectQuestion
  extends BaseConceptIncubationQuestion {
  fieldType: multiSelectFieldType;
  options: IConceptIncubationMultiSelectOption[];
  defaultOption?: string;
  allowCustomInput: boolean;
  details?: IDetailQuestion;
}

export interface ConceptIncubationClarifyingQuestion {
  title: string;
  uuid: string;
  icon: string;
  question: ConceptIncubationQuestion;
}

export type ConceptIncubationQuestion =
  | IConceptIncubationTextQuestion
  | IConceptIncubationTextareaQuestion
  | IConceptIncubationMultiSelectQuestion;

export type QuestionFieldType = ConceptIncubationQuestion['fieldType'];

export type ExpandAnExistingIdeaQuestions =
  | 'describe'
  | 'problem'
  | 'customer'
  | 'value';
export type IdentifyNewOpportunitiesQuestions =
  | 'target'
  | 'describe'
  | 'customer'
  | 'value'
  | 'interest';

export type QuestionIdentifier =
  | ExpandAnExistingIdeaQuestions
  | IdentifyNewOpportunitiesQuestions;

export type ConceptIncubationQuestionnaireType =
  | 'EXPAND_AN_EXISTING_IDEA'
  | 'IDENTIFY_NEW_OPPORTUNITIES';
export interface IConceptIncubationQuestionnaireSection<T extends string> {
  type: ConceptIncubationQuestionnaireType;
  description: string;
  questions: { [key in T]: ConceptIncubationQuestion };
}

export interface IConceptIncubationQuestionnaire {
  expandAnExistingIdea: IConceptIncubationQuestionnaireSection<ExpandAnExistingIdeaQuestions>;
  identifyNewOpportunities: IConceptIncubationQuestionnaireSection<IdentifyNewOpportunitiesQuestions>;
}
