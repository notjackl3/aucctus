export interface IToken {
  token: string;
}

export interface IAccount {
  /**
   * Accounts are the organizations or Companies that use the Aucctus platform
   *
   *
   */

  uuid: string;
  name: string;
  domain: string;
  createdAt: string;
}

export interface IRegisterAccount {
  name: string;
  domain: string;
}

export interface IUser {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  account?: string;
  role: 'Admin' | 'Employee';
}

export interface IRegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IAuthSuccessResponse {
  user: IUser;
  token: string;
}
