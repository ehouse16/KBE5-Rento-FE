import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CompanyContextType {
  companyCode: string | null;
  setCompanyCode: (code: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companyCode, setCompanyCode] = useState<string | null>(null);

  return (
    <CompanyContext.Provider value={{ companyCode, setCompanyCode }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}; 