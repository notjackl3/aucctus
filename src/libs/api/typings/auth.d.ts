


export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}


export interface IAuthSuccessResponse {
  user: IUser;
  organization?: IOrganization;
  accessToken: string;
}

export interface ISignUpSuccessResponse {
  id: string;
  message: string;
}