export type Concept = {
  uuid: string;
  title: string;
  isGenerated: boolean;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type ConceptsGetRequest = {
  status: string;
  category: string;
};

export type Concepts = Concept[];

export type GetConceptResponse = {
  count: number;
  results: Concepts;
};
