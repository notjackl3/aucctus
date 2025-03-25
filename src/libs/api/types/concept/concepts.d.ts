import type { IPageQueryOptions, IPageResponse } from '../osiris';

type ConceptStatus =
  | 'new'
  | 'ideating'
  | 'inReview'
  | 'prototyping'
  | 'proofOfConcept'
  | 'minimumViableProduct'
  | 'commercialized'
  | 'archived';

type ConceptCategory = 'active' | 'draft' | 'archive';

type DraftConceptStatus = Exclude<
  ConceptStatus,
  | 'prototyping'
  | 'proofOfConcept'
  | 'minimumViableProduct'
  | 'commercialized'
  | 'archived'
>;

type ArchivedConceptStatus = Exclude<
  ConceptStatus,
  | 'new'
  | 'ideating'
  | 'inReview'
  | 'prototyping'
  | 'proofOfConcept'
  | 'minimumViableProduct'
  | 'commercialized'
>;

type ActiveConceptStatus = Exclude<
  ConceptStatus,
  ArchivedConceptStatus | DraftConceptStatus
>;

type ConceptReportStatus =
  | 'notStarted'
  | 'complete'
  | 'pending'
  | 'error'
  | 'draft';

interface IBaseConceptEntity {
  uuid: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface IGeneratedConcept {
  uuid: string;
  title: string;
  summary: string;
  overview: string;
  valueProposition: string;

  clarifyingQuestions?: IClarifyingQuestion[];
  isGenerating?: boolean;
}

interface IConcept extends IBaseConceptEntity {
  uuid: string;
  title: string;
  description: string;
  identifier: string;
  reportStatus: ConceptReportStatus;
  status: ConceptStatus;
  category: ConceptCategory;
  createdBy: IUser;
  hasSeed: boolean;

  marketScanVersion: 'v1' | 'v2';
}

export interface IConceptOverview extends IBaseConceptEntity {
  text: string;
  valueProposition: string;
  problemStatement?: string;

  // TODO: Remove and use API instead.
  persona?: ICustomerProfile;
  financialProjection?: IFinancialProjection;
}

interface ICustomerProfile extends IBaseConceptEntity {
  name: string;
  description: string;
  nickname: string;
  geoLocation: string;
  familySize: number;
  ageUpper: number;
  ageLower: number;
  ageRange: string;
  incomeUpper: number;
  incomeLower: number;
  incomeRange: string;
  jobs: string[];
  pains: string[];
  quotes: string[];
}

interface ICustomerProfileCreate {
  name: string;
  description: string;
  nickname: string;
  geoLocation: string;
  familySize: number;
  ageUpper: number;
  ageLower: number;
  incomeUpper: number;
  incomeLower: number;
  jobs: string[];
  pains: string[];
  quotes: string[];
}

type SortableConceptProperties = 'createdAt' | 'updatedAt' | 'status' | 'title';
type ConceptSort = SortableConceptProperties | `-${SortableConceptProperties}`;

interface IConceptQueryOptions extends IPageQueryOptions {
  search?: string;
  user?: string;
  status?: string;
  category?: string;
  createdBy?: string;
  sort?: ConceptSort;
}

interface IConceptPage extends IPageResponse<IConcept> {
  statusCounts: { [key in ConceptStatus]: number };
}
