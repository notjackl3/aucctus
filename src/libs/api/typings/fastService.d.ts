export interface IFastGeneralMessage {
  detail: string;
}

export interface IFastMessage {
  [key: string]: string;
  message: string;
}

export interface IFastErrorResponse {
  detail: {
    detail: string;
    code: string;
    messages: IFastMessage[];
  };
}
