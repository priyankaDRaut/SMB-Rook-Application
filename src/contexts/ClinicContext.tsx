import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClinicData {
  clinicId: string;
  clinicName: string;
  revenue?: number;
  netIncome?: number;
}

interface ClinicContextType {
  currentClinic: ClinicData | null;
  setCurrentClinic: (clinic: ClinicData | null) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentClinic, setCurrentClinic] = useState<ClinicData | null>(null);

  return (
    <ClinicContext.Provider value={{ currentClinic, setCurrentClinic }}>
      {children}
    </ClinicContext.Provider>
  );
};
