import type { IUser } from '../auth/accounts';
import type { IPageQueryOptions } from '../osiris';
export interface IConceptSeedAnswer {
  answer: string[];
  details?: string;
  question: ConceptIncubationQuestion;
  id?: number;
}

export interface IConceptSeedAnswerUpdateCreate extends IConceptSeedAnswer {
  answerId: number;
}

export interface IClarifyingQuestion {
  title: string;
  uuid: string;
  icon: string;
  question: ConceptIncubationQuestion;
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
  uuid: string;
  answers: IConceptSeedAnswer[];
  type: ConceptIncubationQuestionnaireType;
  createdAt: string;
  updatedAt: string;
  status?: SeedStatus;
  createdBy: IUser;

  clarifyingQuestions: IClarifyingQuestion[];
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
