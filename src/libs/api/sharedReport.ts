import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IShareInfo,
  ISharedReport,
  ISendCodeRequest,
  IVerifyCodeRequest,
  IConceptShare,
  ICreateShareRequest,
  IShareConfig,
} from './types/sharedReport';

/**
 * Shared Report API
 *
 * Handles public (no-auth) shared report viewing and
 * authenticated share management operations.
 */
export class SharedReportApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Public Endpoints (No Auth Required)
  // ============================================

  /**
   * Get metadata for a shared report (concept title, account name, required email domain).
   */
  getShareInfo(token: string) {
    return this.get<IShareInfo>(endpoints.sharedReportInfo(token));
  }

  /**
   * Send a verification code to the recipient's email.
   */
  sendVerificationCode(token: string, data: ISendCodeRequest) {
    return this.post<{ detail: string }, ISendCodeRequest>(
      endpoints.sharedReportSendCode(token),
      data,
    );
  }

  /**
   * Verify the email code. Sets a session cookie on success.
   */
  verifyCode(token: string, data: IVerifyCodeRequest) {
    return this.post<{ detail: string }, IVerifyCodeRequest>(
      endpoints.sharedReportVerify(token),
      data,
    );
  }

  /**
   * Get the full read-only report data. Requires a valid session cookie.
   */
  getReport(token: string) {
    return this.get<ISharedReport>(endpoints.sharedReportData(token));
  }

  // ============================================
  // Authenticated Endpoints (Share Management)
  // ============================================

  /**
   * Get allowed sharing domains for the current user/account.
   */
  getShareConfig(identifier: string) {
    return this.get<IShareConfig>(endpoints.conceptShareConfig(identifier));
  }

  /**
   * Create a share invite for a concept report.
   */
  createShare(identifier: string, data: ICreateShareRequest) {
    return this.post<IConceptShare, ICreateShareRequest>(
      endpoints.conceptShares(identifier),
      data,
    );
  }

  /**
   * List all shares for a concept report.
   */
  listShares(identifier: string) {
    return this.get<IConceptShare[]>(endpoints.conceptShares(identifier));
  }

  /**
   * Revoke a share invite.
   */
  revokeShare(identifier: string, shareUuid: string) {
    return this.delete<{ detail: string }>(
      endpoints.conceptShareRevoke(identifier, shareUuid),
    );
  }
}
