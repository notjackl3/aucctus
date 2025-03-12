export interface BaseConceptIgnitionQuestion {
  id: number;
  identifier: string;
  label: string;
  required: boolean;
  dependsOn?: string;
  dependsOnValue?: string[];
  order: number; // x for main questions, x.2, x.4, etc for sub questions
}

export interface IConceptIgnitionTextQuestion
  extends BaseConceptIgnitionQuestion {
  fieldType: 'text';
  placeholder?: string;
}

export interface IConceptIgnitionTextareaQuestion
  extends BaseConceptIgnitionQuestion {
  fieldType: 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface IDetailQuestion {
  fieldType: 'text' | 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface IConceptIgnitionMultiSelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

export type multiSelectFieldType = 'multiSelect' | 'radioButton';

export interface IConceptIgnitionMultiSelectQuestion
  extends BaseConceptIgnitionQuestion {
  fieldType: multiSelectFieldType;
  options: IConceptIgnitionMultiSelectOption[];
  defaultOption?: string;
  allowCustomInput: boolean;
  details?: IDetailQuestion;
}

export type ConceptIgnitionQuestion =
  | IConceptIgnitionTextQuestion
  | IConceptIgnitionTextareaQuestion
  | IConceptIgnitionMultiSelectQuestion;

export type QuestionFieldType = ConceptIgnitionQuestion['fieldType'];

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

export type ConceptIgnitionQuestionnaireType =
  | 'EXPAND_AN_EXISTING_IDEA'
  | 'IDENTIFY_NEW_OPPORTUNITIES';
export interface IConceptIgnitionQuestionnaireSection<T extends string> {
  type: ConceptIgnitionQuestionnaireType;
  description: string;
  questions: { [key in T]: ConceptIgnitionQuestion };
}

export interface IConceptIgnitionQuestionnaire {
  expandAnExistingIdea: IConceptIgnitionQuestionnaireSection<ExpandAnExistingIdeaQuestions>;
  identifyNewOpportunities: IConceptIgnitionQuestionnaireSection<IdentifyNewOpportunitiesQuestions>;
}
