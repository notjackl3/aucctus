interface BaseConceptIncubationQuestion {
  id: number;
  identifier: string;
  label: string;
  required: boolean;
  dependsOn?: string;
  dependsOnValue?: string[];
  order: number; // x for main questions, x.2, x.4, etc for sub questions
  isClarifying: boolean;
  isIgnition: boolean;
}

interface IConceptIncubationTextQuestion extends BaseConceptIncubationQuestion {
  fieldType: 'text';
  placeholder?: string;
}

interface IConceptIncubationTextareaQuestion
  extends BaseConceptIncubationQuestion {
  fieldType: 'textarea';
  placeholder?: string;
  rows?: number;
}

interface IDetailQuestion {
  fieldType: 'text' | 'textarea';
  placeholder?: string;
  rows?: number;
}

interface IConceptIncubationMultiSelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
}
interface IConceptIncubationMultiSelectQuestion
  extends BaseConceptIncubationQuestion {
  fieldType: 'multiSelect' | 'radioButton';
  options: IConceptIncubationMultiSelectOption[];
  defaultOption?: string;
  allowCustomInput: boolean;
  details?: IDetailQuestion;
}

interface ConceptIncubationClarifyingQuestion {
  title: string;
  uuid: string;
  icon: string;
  question: ConceptIncubationQuestion;
}

type ConceptIncubationQuestion =
  | IConceptIncubationTextQuestion
  | IConceptIncubationTextareaQuestion
  | IConceptIncubationMultiSelectQuestion;

type QuestionFieldType = ConceptIncubationQuestion['fieldType'];

type ExpandAnExistingIdeaQuestions =
  | 'describe'
  | 'problem'
  | 'customer'
  | 'value';
type IdentifyNewOpportunitiesQuestions =
  | 'target'
  | 'describe'
  | 'customer'
  | 'value'
  | 'interest';

type QuestionIdentifier =
  | ExpandAnExistingIdeaQuestions
  | IdentifyNewOpportunitiesQuestions;

type ConceptIncubationQuestionnaireType =
  | 'EXPAND_AN_EXISTING_IDEA'
  | 'IDENTIFY_NEW_OPPORTUNITIES';
interface IConceptIncubationQuestionnaireSection<T extends string> {
  type: ConceptIncubationQuestionnaireType;
  description: string;
  questions: { [key in T]: ConceptIncubationQuestion };
}

export interface IConceptIncubationQuestionnaire {
  expandAnExistingIdea: IConceptIncubationQuestionnaireSection<ExpandAnExistingIdeaQuestions>;
  identifyNewOpportunities: IConceptIncubationQuestionnaireSection<IdentifyNewOpportunitiesQuestions>;
}
