import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IAccount,
  IDashboard,
  IRegisterAccount,
  IScoringConfig,
  IScoringConfigCreate,
  IScoringConfigSave,
  IScoringConfigSaveResponse,
  IScoringConfigSummary,
  IScoringConfigUpdate,
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
    return this.patch<IAccount>(endpoints.account, account);
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

  // Per-config detail API (categories/questions for a specific config)

  getScoringConfigDetail(accountUuid: string, configUuid: string) {
    return this.get<IScoringConfig>(
      endpoints.scoringConfigFullDetail(accountUuid, configUuid),
    );
  }

  saveScoringConfigDetail(
    accountUuid: string,
    configUuid: string,
    data: IScoringConfigSave,
  ) {
    return this.put<IScoringConfigSaveResponse, IScoringConfigSave>(
      endpoints.scoringConfigFullDetail(accountUuid, configUuid),
      data,
    );
  }

  // Multi-config Scoring Configuration API

  listScoringConfigs(accountUuid: string) {
    return this.get<IScoringConfigSummary[]>(
      endpoints.scoringConfigs(accountUuid),
    );
  }

  createScoringConfig(accountUuid: string, data: IScoringConfigCreate) {
    return this.post<IScoringConfigSummary, IScoringConfigCreate>(
      endpoints.scoringConfigs(accountUuid),
      data,
    );
  }

  updateScoringConfigName(
    accountUuid: string,
    configUuid: string,
    data: IScoringConfigUpdate,
  ) {
    return this.put<{ message: string }, IScoringConfigUpdate>(
      endpoints.scoringConfigDetail(accountUuid, configUuid),
      data,
    );
  }

  deleteScoringConfig(accountUuid: string, configUuid: string) {
    return this.delete<{ message: string }>(
      endpoints.scoringConfigDetail(accountUuid, configUuid),
    );
  }

  setDefaultScoringConfig(accountUuid: string, configUuid: string) {
    return this.post<{ message: string }>(
      endpoints.scoringConfigSetDefault(accountUuid, configUuid),
    );
  }
}
