


export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthSuccessResponse {
  user: IUser;
  accessToken: string;
}

