
//TODO: Can be used for storing traits and debugging information for things like sentry

export interface IAnalyticsStore {
  /**
   * Contains all the analytics data
   */

  userAgent?: string;

}


class Analytics {

  private _store: IAnalyticsStore = {
    userAgent: navigator.userAgent
  }


  update(data: Partial<IAnalyticsStore>) {
    this._store = {
      ...this._store,
      ...data
    }
  }

  debug(...data: any[]) {
    if (import.meta.env.DEV) {
      console.debug('[AucctusApp]', data)
    }
  }

  log(...data: any[]) {
    console.log(data)
  }

  error(...data: any[]) {
    console.error(data)
  }


  /** TODO: Implement tracking
   * 
   * @param eventName 
   * @param data 
   */
  trackEvent(eventName: string, data: any) {
    console.log(`[AucctusApp] Event: ${eventName}`, data)
  }

}


const analytics = new Analytics()


export default analytics;