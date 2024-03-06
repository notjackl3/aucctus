export interface IFastGeneralMessage {
  detail: string;
}

export interface IFastMessage {
  [key: string]: string;
  message: string;
}

export interface IFastErrorDetailResponse {
  detail: string;
  code: string;
  messages: IFastMessage[];
}

export interface IFastErrorBodyResponse {
  detail: IFactBodyError[];
}

interface IFactBodyError {
  type: string;
  loc: string[];
  msg: string;
  input: { [key: string]: unknown };
  url: string;
}

export interface IFastErrorResponse {
  detail: IFastErrorDetailResponse | IFastErrorBodyResponse[];
}
