export interface BaseConceptIncubationQuestion {
  id: number;
  identifier: string;
  label: string;
  required: boolean;
  dependsOn?: string;
  dependsOnValue?: string[];
  order: number; // x for main questions, x.2, x.4, etc for sub questions
  isClarifying: boolean;
  isIgnition: boolean;
  isSuggestionsEnabled: boolean;
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

export interface IConceptIncubationMultiSelectQuestion
  extends BaseConceptIncubationQuestion {
  fieldType: 'multiSelect' | 'radioButton';
  options: IConceptIncubationMultiSelectOption[];
  defaultOption?: string;
  allowCustomInput: boolean;
  details?: IDetailQuestion;
}

export interface IClarifyingQuestion {
  title: string;
  uuid: string;
  icon: IconVariant;
  question: ConceptIncubationQuestion;
}

export type ConceptIncubationQuestion =
  | IConceptIncubationTextQuestion
  | IConceptIncubationTextareaQuestion
  | IConceptIncubationMultiSelectQuestion;

export type QuestionFieldType = ConceptIncubationQuestion['fieldType'];

export type ConceptIncubationQuestionnaireType =
  | 'EXPAND_AN_EXISTING_IDEA'
  | 'IDENTIFY_NEW_OPPORTUNITIES'
  | 'IDEA_PLAYGROUND'
  | 'EMPLOYEE_SUBMISSION'
  | 'WATCHTOWER_SIGNAL';

export interface IConceptIncubationQuestionnaireSection<
  T extends string = string,
> {
  type: ConceptIncubationQuestionnaireType;
  description: string;
  questions: { [key in T]: ConceptIncubationQuestion };
}

export interface IConceptIncubationQuestionnaire {
  expandAnExistingIdea: IConceptIncubationQuestionnaireSection;
  identifyNewOpportunities: IConceptIncubationQuestionnaireSection;
}
