export interface IAnalyticsStore {
  /**
   * Contains all the analytics data
   */
}

class AnalyticsStore {
  private _store: IAnalyticsStore = {};

  update(data: Partial<IAnalyticsStore>) {
    this._store = {
      ...this._store,
      ...data,
    };
  }
}

export default AnalyticsStore;
