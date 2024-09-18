export type IFormError<T = object | str | number> =
  | IServerErrorMessage
  | IPydanticValidationErrorResponse<T>;
export interface IServerErrorMessage {
  id: string;
  detail: string;
}

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? K | `${K}.${NestedKeyOf<T[K]>}`
        : never;
    }[keyof T]
  : never;

export interface IPydanticValidationError<T = unknown> {
  loc: T extends object ? (NestedKeyOf<T> | number)[] : (string | number)[];
  msg: string;
  type: string;
  ctx?: Record<string, unknown>;
  input: T;
  url?: string;
}

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? K | `${K}.${NestedKeyOf<T[K]>}`
        : never;
    }[keyof T]
  : never;

export interface IPydanticValidationErrorResponse<T = unknown> {
  detail: IPydanticValidationError<T>[];
}

export interface IMessageResponse {
  id: string;
  message: string;
}

export interface IPageQueryOptions {
  page?: number;
}
export type SortableConceptProperties =
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'title';
export type ConceptSort =
  | SortableConceptProperties
  | `-${SortableConceptProperties}`;

export interface IConceptQueryOptions extends IPageQueryOptions {
  search?: string;
  user?: string;
  status?: string;
  category?: string;
  createdBy?: string;
  isGenerated?: boolean;
  sort?: ConceptSort;
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
