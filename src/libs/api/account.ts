import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IAccount,
  IDashboard,
  IRegisterAccount,
  IUser,
  IUserDetailsResponse,
  IUserQueryOptions,
} from './types';

/**
 * Account API
 *
 * Handles all the requests for the accounts and users that require authentication.
 */
export class AccountApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
  }

  getAccount() {
    return this.get<IAccount>(endpoints.account);
  }

  createAccount(account: IRegisterAccount) {
    return this.post<IAccount, IRegisterAccount>(endpoints.account, account);
  }

  updateAccount(account: Partial<IAccount>) {
    return this.put<IAccount, Partial<IAccount>>(endpoints.account, account);
  }

  getUser() {
    return this.get<IUserDetailsResponse>(endpoints.user);
  }

  getAllUser(options?: IUserQueryOptions) {
    return this.get<IUser[]>(endpoints.allUsersQuery(options));
  }

  updateUser(user: Partial<IUser>) {
    return this.patch<IUserDetailsResponse>(endpoints.user, user);
  }

  getDashboard() {
    return this.get<IDashboard>(endpoints.dashboard);
  }
}
