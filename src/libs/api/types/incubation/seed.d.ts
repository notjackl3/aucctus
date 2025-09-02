import type { IUser } from '../auth/accounts';
import type { IPageQueryOptions } from '../osiris';
import type {
  ConceptIncubationQuestion,
  IClarifyingQuestion,
} from './questionnaire';
import type { IGeneratedConcept } from '../concept/concepts';

export interface IConceptSeedAnswer {
  answer: string[];
  details?: string;
  question: ConceptIncubationQuestion;
  id?: number;
}

export interface IConceptSeedAnswerUpdateCreate extends IConceptSeedAnswer {
  answerId: number;
}

export interface IConceptSeedCreate {
  type: ConceptIncubationQuestionnaireType;
}

export type SortableSeedProperties =
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'type';
export type SeedSort = SortableSeedProperties | `-${SortableSeedProperties}`;
export type SeedStatus = 'draft' | 'published' | 'archived';

export interface IConceptSeed {
  title?: string;
  description?: string;
  uuid: string;
  answers: IConceptSeedAnswer[];
  type: ConceptIncubationQuestionnaireType;
  createdAt: string;
  updatedAt: string;
  status?: SeedStatus;
  createdBy: IUser;
  isCloned?: boolean;

  clarifyingQuestions: IClarifyingQuestion[];
  cachedConcepts?: IGeneratedConcept[];
}

export interface IConceptSeedUpdate {
  status?: SeedStatus;
}

export interface ISeedQueryOptions extends IPageQueryOptions {
  search?: string;
  status?: string;
  type?: string;
  createdBy?: string;
  sort?: SeedSort;
}
