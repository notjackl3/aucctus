import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IAccount,
  IDashboard,
  IRegisterAccount,
  IScoringCategory,
  IScoringCategoryCreate,
  IScoringConfig,
  IScoringConfigSave,
  IScoringConfigSaveResponse,
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

  /**
   * Get the account's logo URL.
   * Returns a presigned URL for the custom logo if one exists.
   */
  getAccountLogo() {
    return this.get<{ logoUrl: string | null }>(endpoints.accountLogo);
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

  // Scoring Configuration API

  getScoringConfig(accountUuid: string) {
    return this.get<IScoringConfig>(endpoints.scoringConfig(accountUuid));
  }

  saveScoringConfig(accountUuid: string, data: IScoringConfigSave) {
    return this.put<IScoringConfigSaveResponse, IScoringConfigSave>(
      endpoints.scoringConfig(accountUuid),
      data,
    );
  }

  createScoringCategory(accountUuid: string, data: IScoringCategoryCreate) {
    return this.post<IScoringCategory, IScoringCategoryCreate>(
      endpoints.scoringConfigCategories(accountUuid),
      data,
    );
  }

  deleteScoringCategory(accountUuid: string, categoryUuid: string) {
    return this.delete<{ success: boolean; message: string }>(
      endpoints.scoringConfigCategory(accountUuid, categoryUuid),
    );
  }
}
