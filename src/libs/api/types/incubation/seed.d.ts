import type { IUser } from '../auth/accounts';
import type { IPageQueryOptions } from '../osiris';
interface IConceptSeedAnswer {
  answer: string[];
  details?: string;
  question: ConceptIncubationQuestion;
  id?: number;
}

interface IConceptSeedAnswerUpdateCreate extends IConceptSeedAnswer {
  answerId: number;
}

interface IClarifyingQuestion {
  title: string;
  uuid: string;
  icon: string;
  question: ConceptIncubationQuestion;
}

interface IConceptSeedCreate {
  type: ConceptIncubationQuestionnaireType;
}

type SortableSeedProperties = 'createdAt' | 'updatedAt' | 'status' | 'type';
type SeedSort = SortableSeedProperties | `-${SortableSeedProperties}`;
type SeedStatus = 'draft' | 'published' | 'archived';

interface IConceptSeed {
  uuid: string;
  answers: IConceptSeedAnswer[];
  type: ConceptIncubationQuestionnaireType;
  createdAt: string;
  updatedAt: string;
  status?: SeedStatus;
  createdBy: IUser;

  clarifyingQuestions: IClarifyingQuestion[];
}

interface ISeedQueryOptions extends IPageQueryOptions {
  search?: string;
  status?: string;
  type?: string;
  createdBy?: string;
  sort?: SeedSort;
}
