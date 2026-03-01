import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IAccountBranding,
  IUpdateAccountBrandingPayload,
} from './types/accountBranding';

/**
 * Account Branding API
 *
 * Handles all requests for account branding functionality
 * including brand colors, logo, and headquarters image.
 */
export class AccountBrandingApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Branding CRUD
  // ============================================

  /**
   * Get the account's branding information.
   * Returns brand colors, logo URL, HQ image URL, typography, etc.
   */
  getBranding() {
    return this.get<IAccountBranding>(endpoints.accountBranding);
  }

  /**
   * Update the account's branding information.
   * Partial update — only provided fields are changed.
   */
  updateBranding(data: IUpdateAccountBrandingPayload) {
    return this.patch<IAccountBranding, IUpdateAccountBrandingPayload>(
      endpoints.accountBranding,
      data,
    );
  }

  // ============================================
  // File Uploads
  // ============================================

  /**
   * Upload a headquarters or branch image for the account.
   * Accepts image files up to 10MB.
   */
  uploadHqImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData<IAccountBranding>(
      endpoints.accountBrandingHqImage,
      formData,
    );
  }

  /**
   * Upload a logo for the account.
   * Accepts image files up to 5MB.
   */
  uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData<IAccountBranding>(
      endpoints.accountBrandingLogo,
      formData,
    );
  }
}
