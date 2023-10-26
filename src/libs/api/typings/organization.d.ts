

interface IOrganization {
  id: string;
  name: string;
  domain: string;
  goal: string;
  kpis: string[];
  competitors: string[];
  createdAt: string;
  updatedAt: string;
}

interface IOrganizationSuccessResponse {
  user: IUser,
  organization: IOrganization,
}

interface IRegisterOrganization {
  name: string;
  domain: string;
  industry: string;
  goal: string;
  competitors: string;
  kpis: string;
}


export interface IArticle {
  source: {
    id: string | null;
    name: string;
  },
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string
  content: string;
}
