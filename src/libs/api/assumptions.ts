import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IAssumptionV1,
  IAssumptionV2,
  IAssumptionCreate,
  IAssumptionTestDetails,
  IAssumptionTestStatus,
  IConceptTestDetails,
  IPageResponse,
  ITestStep,
  AssumptionCategory,
} from './types'; // Import the missing type

// Define the category metrics structure for V2 API response
interface CategoryMetric {
  category: AssumptionCategory;
  count: number;
  cumulativeCertainty: number;
  cumulativeImportance: number;
  averageRisk: number;
}

// Extended response interface for V2 API
interface IAssumptionsV2PageResponse extends IPageResponse<IAssumptionV2> {
  categoryMetrics?: Record<AssumptionCategory, CategoryMetric>;
}

export class AssumptionsApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  // TODO: DEPRECATE - V1 API method. Remove once all components use getAllFiltered (V2)
  getAll(conceptUuid: string) {
    return this.get<IPageResponse<IAssumptionV1>>(
      endpoints.conceptKeyAssumptions(conceptUuid),
    );
  }

  getAllFiltered(rootIdentifier: string, filters?: Record<string, any>) {
    return this.get<IAssumptionsV2PageResponse>(
      endpoints.conceptKeyAssumptionsFiltered(rootIdentifier, filters),
    );
  }

  // TODO: DEPRECATE - V1 API method. Remove once assumption editing migrates to V2
  update(uuid: string, data: Partial<IAssumptionV1>) {
    return this.patch<IAssumptionV1, Partial<IAssumptionV1>>(
      endpoints.conceptKeyAssumption(uuid),
      data,
    );
  }

  // TODO: DEPRECATE - V1 API method. Remove once assumption creation migrates to V2
  create(conceptUuid: string, data: IAssumptionCreate) {
    return this.post<IAssumptionV1, IAssumptionCreate>(
      endpoints.conceptKeyAssumptions(conceptUuid),
      data,
    );
  }

  // TODO: DEPRECATE - V1 API method. Remove once assumption deletion migrates to V2
  deleteAssumption(assumptionUuid: string) {
    return this.delete<IAssumptionV1>(
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

  getAllConceptTestDetails(conceptUuid: string) {
    return this.get<IPageResponse<IConceptTestDetails>>(
      endpoints.conceptTestDetails(conceptUuid),
    );
  }

  getConceptTestDetails(conceptUuid: string, conceptTestUuid: string) {
    return this.get<IConceptTestDetails>(
      endpoints.conceptTestDetailsUuid(conceptUuid, conceptTestUuid),
    );
  }

  getAssumptionTestStatusOverview(conceptUuid: string) {
    return this.get<IAssumptionTestStatus>(
      endpoints.assumptionTestStatusOverview(conceptUuid),
    );
  }

  updateAssumptionTestDetails(
    assumptionUuid: string,
    assumptionTestDetailsUuid: string,
    data: Partial<IAssumptionTestDetails>,
  ) {
    return this.patch<IAssumptionTestDetails, Partial<IAssumptionTestDetails>>(
      endpoints.assumptionTestDetailsUuid(
        assumptionUuid,
        assumptionTestDetailsUuid,
      ),
      data,
    );
  }

  updateConceptTestStep(
    conceptTestUuid: string,
    stepUuid: string,
    data: Partial<ITestStep> & { uuid: string },
  ) {
    return this.patch<ITestStep, Partial<ITestStep> & { uuid: string }>(
      endpoints.conceptTestStepUuid(conceptTestUuid, stepUuid),
      data,
    );
  }
}
