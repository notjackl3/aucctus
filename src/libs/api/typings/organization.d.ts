

interface IOrganization {
  id: string;
  name: string;
  domain: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
}

interface IOrganizationSuccessResponse {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
}

interface IRegisterOrganization {
  name: string;
  domain: string;
  goal: string;
  competitors: string;
  kpis: string;
}