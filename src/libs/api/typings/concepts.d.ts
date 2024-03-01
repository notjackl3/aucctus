export enum ConceptStatus {
  ideating = 'ideating',
  inReview = 'in_review',
  prototyping = 'prototyping',
  proofOfConcept = 'proof_of_concept',
  minimumViableProduct = 'minimum_viable_product',
  commercialized = 'commercialized',
  archived = 'archived',
}
export enum ConceptCategory {
  active = 'active',
  draft = 'draft',
  archive = 'archive',
}
export interface IConcept {
  uuid: string;
  title: string;
  isGenerated: boolean;
  status: ConceptStatus;
  category: ConceptCategory;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface IConceptCreate {
  title: string;
  description: string;
  status?: ConceptStatus;
  createdBy?: string;
}

export type IConceptsGetRequest = {
  status: string;
  category: string;
};
