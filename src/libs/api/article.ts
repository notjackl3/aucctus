import { ApiService, IApiServiceConfig } from './apiService';
import { Endpoints as endpoints } from './endpoints';
import Api from './api';

export interface IArticlePublishedDateResponse {
  publishedDate: string;
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
}
