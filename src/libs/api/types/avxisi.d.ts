import { ConceptCategory, ConceptStatus } from './concepts';

export type IFormError<T = object> = IServerErrorMessage | IFormErrorResponse<T>;
export interface IServerErrorMessage {
  id: string;
  error: string;
}

export interface IFormDetailsError {
  message: string;
  code: string;
}
export interface IFormErrorResponse<T = unknown> {
  error: Record<keyof T, IFormDetailsError[]>;
}

export interface IMessageResponse {
  id: string;
  message: string;
}

export interface IPageQueryOptions {
  page?: number;
}

export interface IConceptQueryOptions extends IPageQueryOptions {
  search?: string;
  status?: ConceptStatus;
  category?: ConceptCategory;
  createdBy?: string;
  isGenerated?: boolean;
}

export interface IPageResponse<T> {
  count: number;
  // The next page URL
  next: string | null;
  // The previous page URL
  previous: string | null;
  numberOfPages?: number;
  results: T[];
}
