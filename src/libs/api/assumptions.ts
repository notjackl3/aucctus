import Api from './api';
import { ApiService, IApiServiceConfig } from './apiService';
import { endpoints } from './endpoints';
import {
  IAssumption,
  IAssumptionCreate,
  IAssumptionTestDetails,
  IPageResponse,
} from './types'; // Import the missing type

export class AssumptionsApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  getAll(conceptUuid: string) {
    return this.get<IPageResponse<IAssumption>>(
      endpoints.conceptKeyAssumptions(conceptUuid),
    );
  }

  update(uuid: string, data: Partial<IAssumption>) {
    return this.patch<IAssumption, Partial<IAssumption>>(
      endpoints.conceptKeyAssumption(uuid),
      data,
    );
  }

  create(conceptUuid: string, data: IAssumptionCreate) {
    return this.post<IAssumption, IAssumptionCreate>(
      endpoints.conceptKeyAssumptions(conceptUuid),
      data,
    );
  }

  deleteAssumption(assumptionUuid: string) {
    return this.delete<IAssumption>(
      endpoints.conceptKeyAssumption(assumptionUuid),
    );
  }

  getAllAssumptionTests(assumptionUuid: string) {
    return this.get<[IAssumptionTestDetails]>(
      endpoints.assumptionTestsDetails(assumptionUuid),
    );
  }

  startTest(assumptionUuid: string, assumptionTestDetailsUuid: string) {
    return this.post<IAssumptionTestDetails>(
      endpoints.assumptionStartTest(assumptionUuid, assumptionTestDetailsUuid),
    );
  }
}
