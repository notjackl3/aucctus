export type IFormError<T = any> =
  | IServerErrorMessage
  | IPydanticValidationErrorResponse<T>;
export interface IServerErrorMessage {
  id: string;
  detail: string;
}
export interface IPydanticValidationError<T = unknown> {
  loc: T extends object ? (NestedKeyOf<T> | number)[] : (string | number)[];
  msg: string;
  type: string;
  ctx?: Record<string, unknown>;
  input: T;
  url?: string;
}

export type NestedKeyOf<T> = T extends object
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

export interface IArticlePublishedQueryOptions extends IPageQueryOptions {
  url?: string;
}

export interface IPageResponse<T> {
  count: number;
  // The next page URL
  next: string | null;
  // The previous page URL
  previous: string | null;
  numberOfPages?: number;
  pageSize: number;
  // The current Page results
  results: T[];
}

export interface IFullListAndPageResponse<T> extends IPageResponse<T> {
  // All results given the filter and sorting without being sorted
  items: T[];
}

export type Mimetype = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text
  'text/plain',
  'text/csv',
  'text/html',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
];
