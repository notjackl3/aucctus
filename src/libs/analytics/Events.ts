export enum AnalyticsEvents {
  pageView,
}

export interface PageViewEvent {
  eventName: AnalyticsEvents.pageView;
  page: string;
  from?: string;
}
