export type IFormError<T> = IServerErrorMessage | IFormErrorResponse<T>;
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
  // [key as keyof T]: IFormDetailsError[]
}

export interface IMessageResponse {
  id: string;
  message: string;
}
