export interface IInsightSource {
  name: string;
  url: string;
  description: string;
  type: string;
}
export interface ISupport {
  insight: str;
  sources: IInsightSource[];
}
