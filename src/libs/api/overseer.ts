import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IOverseerConversation,
  IOverseerConversationDetail,
} from './types/overseer';

/**
 * Overseer History API
 *
 * Handles fetching past Overseer conversations and their messages.
 */
export class OverseerApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  /**
   * List Overseer conversations scoped to a concept or account.
   */
  getConversations(params?: {
    page?: number;
    conceptUuid?: string;
    accountUuid?: string;
  }) {
    return this.get<{ items: IOverseerConversation[]; count: number }>(
      endpoints.overseerConversations(params),
    );
  }

  /**
   * Get a single conversation with all its messages.
   */
  getConversation(uuid: string) {
    return this.get<IOverseerConversationDetail>(
      endpoints.overseerConversationDetail(uuid),
    );
  }
}
