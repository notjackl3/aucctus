interface ISource {
  uuid: string;
  title: string;
  description?: string;
  url: string;
}

interface IInsight {
  uuid: string;
  summary: string;
  description: string;
  sources: ISource[];
}

interface ISupport {
  uuid: string;
  insights: IInsight[];
}
