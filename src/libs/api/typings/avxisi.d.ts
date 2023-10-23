import { HttpStatusCode } from "axios";


export interface INestJSErrorResponse {
  statusCode: HttpStatusCode;
  timestamp: string;
  path: string;
  // TODO: Get all error response types
  error: "UnauthorizedException" | string;
  message: string;
}

export interface IMessageResponse {
  id: string;
  message: string;
}