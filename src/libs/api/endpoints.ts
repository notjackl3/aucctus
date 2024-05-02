import { ConceptCategory, ConceptStatus } from './types';

export interface IPageQueryOptions {
  page?: number;
}

export interface IConceptQueryOptions extends IPageQueryOptions {
  status?: ConceptStatus;
  category?: ConceptCategory;
  createdBy?: string;
  isGenerated?: boolean;
}

export const endpoints = {
  /* Auth */
  login: '/api/v1/login',
  signup: '/api/v1/sign-up',
  logout: '/api/v1/logout',
  refresh: '/api/v1/token/refresh',

  user: '/api/v1/user',
  confirmEmail: `/api/v1/confirm-email`,
  forgotPassword: `/api/v1/forgot-password`,
  requestPasswordReset: `/api/v1/password-reset`,
  updatePassword: `/api/v1/user/update-password`,

  /* Account */
  account: `/api/v1/account`,
  dashboard: `/api/v1/dashboard`,

  /* Concepts */
  concept: 'api/v1/concept/',
  conceptList: 'api/v1/concept/list',

  conceptIgnite: 'v1/concept/ignite',
  conceptQueries: (options?: IConceptQueryOptions) => {
    if (!options) return 'api/v1/concept';

    let query = '';
    if (options.page) query += `page=${options.page}&`;
    if (options.status) query += `status=${options.status}&`;
    if (options.category) query += `category=${options.category}&`;
    if (options.createdBy) query += `created_by=${options.createdBy}&`;
    if (options.isGenerated) query += `is_generated=${options.isGenerated}&`;

    return `api/v1/concept?${query}`;
  },
  conceptUuid: (conceptUuid: string) => `api/v1/concept/${conceptUuid}/`,
  conceptReportRetry: (conceptUuid: string) => `api/v1/concept/${conceptUuid}/retry`,

  conceptOverview: (conceptUuid: string) => `api/v1/concept/${conceptUuid}/overview`,
  conceptOverviewUuid: (overviewUuid: string) => `api/v1/concept/overview/${overviewUuid}`,

  conceptCustomerProfiles: (conceptUuid: string) => `api/v1/concept/${conceptUuid}/customer-profile`,
  conceptCustomerProfileUuid: (customerProfileUuid: string) => `api/v1/concept/customer-profile/${customerProfileUuid}`,

  conceptKeyAssumptions: (conceptUuid: string) => `api/v1/concept/${conceptUuid}/key-assumptions`,
  conceptKeyAssumption: (assumptionUuid: string) => `api/v1/concept/key-assumption/${assumptionUuid}`,

  conceptFinancialProjection: (conceptUuid: string) => `api/v1/concept/${conceptUuid}/financial-projection`,
  conceptFinancialProjectionUuid: (projectionUuid: string) => `api/v1/concept/financial-projection/${projectionUuid}`,
  conceptMarketSizeMetric: (marketSizeMetricUuid: string) =>
    `api/v1/concept/market-size-metric/${marketSizeMetricUuid}`,

  conceptMarketScan: (conceptUuid: string) => `api/v1/concept/${conceptUuid}/market-scan`,
  conceptMarketScanUuid: (marketScanUuid: string) => `api/v1/concept/market-scan/${marketScanUuid}`,
  conceptMarketScanElement: (conceptUuid: string, element: 'trends-and-drivers' | 'ecosystem') =>
    `api/v1/concept/${conceptUuid}/market-scan/${element}`,

  conceptTrendAndDriver: (trendAndDriverUuid: string) => `api/v1/concept/trends-and-drivers/${trendAndDriverUuid}`,
  conceptEcosystem: (ecosystemUuid: string) => `api/v1/concept/ecosystem/${ecosystemUuid}`,
};
