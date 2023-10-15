


export interface IUser {
  id: string;
  name: string;
  email: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthSuccessResponse {
  user: IUser;
  accessToken: string;
}

export interface ISignUpSuccessResponse {
  id: string;
  message: string;
}