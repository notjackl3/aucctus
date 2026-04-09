import { createContext, useContext, useEffect, useState } from 'react';
import { listCompanies } from '../api/client';
import type { CompanyResponse } from '../api/client';

const ACTIVE_COMPANY_KEY = 'aucctus_active_company_id';

interface CompanyContextValue {
  companies: CompanyResponse[];
  activeCompany: CompanyResponse | null;
  loading: boolean;
  setActiveCompany: (c: CompanyResponse) => void;
  addCompany: (c: CompanyResponse) => void;
  reload: () => void;
}

const CompanyContext = createContext<CompanyContextValue>({
  companies: [],
  activeCompany: null,
  loading: true,
  setActiveCompany: () => {},
  addCompany: () => {},
  reload: () => {},
});

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [activeCompany, setActiveCompanyState] = useState<CompanyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listCompanies()
      .then((list) => {
        setCompanies(list);
        const savedId = localStorage.getItem(ACTIVE_COMPANY_KEY);
        const active = list.find((c) => c.id === savedId) || list[0] || null;
        setActiveCompanyState(active);
        if (active) localStorage.setItem(ACTIVE_COMPANY_KEY, active.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setActiveCompany = (c: CompanyResponse) => {
    setActiveCompanyState(c);
    localStorage.setItem(ACTIVE_COMPANY_KEY, c.id);
  };

  const addCompany = (c: CompanyResponse) => {
    setCompanies((prev) => [...prev, c]);
    setActiveCompany(c);
  };

  return (
    <CompanyContext.Provider value={{ companies, activeCompany, loading, setActiveCompany, addCompany, reload: load }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
