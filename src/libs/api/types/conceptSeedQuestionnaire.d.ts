export interface BaseConceptIgnitionQuestion {
  id: number;
  label: string;
  required: boolean;
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
export interface IConceptIgnitionMultiSelectQuestion
  extends BaseConceptIgnitionQuestion {
  fieldType: 'multiSelect';
  options: string[];
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

export interface IConceptIgnitionQuestionnaireSection<T extends string> {
  name: string;
  description: string;
  questions: { [key in T]: ConceptIgnitionQuestion };
}

export interface IConceptIgnitionQuestionnaire {
  expandAnExistingIdea: IConceptIgnitionQuestionnaireSection<ExpandAnExistingIdeaQuestions>;
  identifyNewOpportunities: IConceptIgnitionQuestionnaireSection<IdentifyNewOpportunitiesQuestions>;
}

export type IConceptIgnitionQuestionnaireType =
  keyof IConceptIgnitionQuestionnaire;
