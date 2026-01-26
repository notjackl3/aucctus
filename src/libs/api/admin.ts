import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  AccountMetrics,
  MetricsTimeRange,
  AccountLogoUploadResponse,
  UserMetricsListResponse,
  UserMetricsDetail,
} from './types/admin';

/**
 * Admin API
 *
 * Handles admin-only API requests like metrics and dashboard data.
 */
export class AdminApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  /**
   * Get account metrics for the admin dashboard.
   * Admin only. Returns computed metrics for the current account.
   *
   * @param timeRange - Time range for metrics filtering (7d, 30d, 90d, all)
   */
  getMetrics(timeRange: MetricsTimeRange = 'all') {
    return this.get<AccountMetrics>(endpoints.adminMetrics, {
      params: { time_range: timeRange },
    });
  }

  /**
   * Upload a custom logo for the account.
   * Admin only. The logo will be displayed on Nucleus page and public forms.
   *
   * @param image - The image file to upload (PNG recommended for transparency)
   */
  uploadAccountLogo(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    return this.post<AccountLogoUploadResponse>(
      endpoints.adminAccountLogoUpload,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  /**
   * Get user metrics leaderboard for the admin dashboard.
   * Admin only. Returns ranked users by activity score.
   *
   * @param timeRange - Time range for metrics filtering (7d, 30d, 90d, all)
   * @param page - Page number for pagination
   * @param pageSize - Number of items per page
   */
  getUserMetrics(
    timeRange: MetricsTimeRange = 'all',
    page: number = 1,
    pageSize: number = 20,
  ) {
    return this.get<UserMetricsListResponse>(endpoints.adminUserMetrics, {
      params: { time_range: timeRange, page, page_size: pageSize },
    });
  }

  /**
   * Get detailed metrics for a specific user.
   * Admin only. Returns breakdown of activity for a user.
   *
   * @param userUuid - UUID of the user to get metrics for
   * @param timeRange - Time range for metrics filtering (7d, 30d, 90d, all)
   */
  getUserMetricsDetail(userUuid: string, timeRange: MetricsTimeRange = 'all') {
    return this.get<UserMetricsDetail>(
      endpoints.adminUserMetricsDetail(userUuid),
      {
        params: { time_range: timeRange },
      },
    );
  }
}
