export interface ISource {
  uuid: string;
  title: string;
  description?: string;
  citations?: string; // Verbatim quotes from the source
  url: string;
  classification?: string;
  nucleusFileSource?: {
    title: string;
  };
  sourceType?: 'url' | 'file' | 'nucleus' | 'user_conversation' | 'seed';
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
