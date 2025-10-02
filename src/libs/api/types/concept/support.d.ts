export interface ISource {
  uuid: string;
  title: string;
  description?: string;
  url: string;
  classification?: string;
  nucleusFileSource?: {
    title: string;
  };
}

export interface IInsight {
  uuid: string;
  summary: string;
  description: string;
  sources: ISource[];
}

export interface ISupport {
  uuid: string;
  insights: IInsight[];
}
