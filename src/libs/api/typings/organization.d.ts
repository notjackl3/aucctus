

interface IOrganization {
  id: string;
  name: string;
  domain: string;
  goal: string;
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