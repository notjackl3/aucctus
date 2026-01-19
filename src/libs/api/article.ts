import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';

export interface IArticlePublishedDateResponse {
  publishedDate: string;
}

export interface ILogoSearchResult {
  name: string;
  domain: string;
  logoUrl?: string; // Django Ninja converts snake_case to camelCase
  claimed?: boolean;
}

export interface ILogoSearchResponse {
  results: ILogoSearchResult[];
}

export class ArticleApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  getArticlePublishedDate(url: string, method: string = 'GET') {
    return this.get<IArticlePublishedDateResponse>(
      endpoints.articlePublishedDate,
      {
        params: { url, method },
      },
    );
  }

  /**
   * Search for company logos using logo.dev brand search API.
   * This proxies through the backend to avoid CORS issues and keep the secret key secure.
   * @param companyName - The company name to search for
   * @returns Promise with search results containing logo URLs
   */
  searchCompanyLogo(companyName: string) {
    return this.get<ILogoSearchResponse>(endpoints.logoSearch, {
      params: { q: companyName },
    });
  }
}
