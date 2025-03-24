import { ConceptStatus } from '..';

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
  goal: string;
  hasConcepts: boolean;
  hasSeeds: boolean;
  owner: {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface IRegisterAccount {
  name: string;
  domain: string;
  goal: string;
}

export interface IAccountDetails {
  uuid: string;
  name: string;
  domain: string;
}

export interface IUser {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  account?: IAccountDetails | null;
  jobTitle?: string;
  profileImage?: string;
  role: 'Admin' | 'Employee';
}

export interface IUserPassword {
  current_password: string;
  password: string;
  confirm_password: string;
}

export interface IUserDetailsResponse {
  user: IUser;
  account?: IAccount | null;
}

export interface IRegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface ISignInRequest {
  email: string;
  password: string;
}

export interface ISignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ITokenResponse {
  access: string;
  refresh: string;
}

export interface IAuthSuccessResponse extends ITokenResponse {
  user: IUser;
  account: IAccount;
}

export interface IPasswordResetForm {
  password: string;
  confirmPassword: string;
}

export interface IUpdateForgottenPasswordRequest extends IPasswordResetForm {
  token: string;
}

export interface IDashboard {
  conceptDetails: IConceptDetails;
}

export interface IUserQueryOptions extends IPageQueryOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
  search?: string;
}

export interface IConceptDetails {
  count: { [key in ConceptStatus | 'total']: number };
  som: Record<ConceptStatus, number>;
}
