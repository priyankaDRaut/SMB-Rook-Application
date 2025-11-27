import React, { createContext, useContext, useState, useMemo, useRef, useCallback } from 'react';
import { useKPIData } from '@/hooks/use-kpi-data';

interface KPIContextType {
  networkRevenue: number | undefined;
  networkARR: number | undefined;
  kpiData: any[];
  loading: boolean;
  error: string | null;
  filters: {
    selectedMonth: Date;
    cities: string[];
    zones: string[];
    specialties: string[];
    doctors: string[];
    clinics: string[];
    comparisonMonth?: Date;
  };
  setFilters: (filters: any) => void;
}

const KPIContext = createContext<KPIContextType | undefined>(undefined);

export const useKPIContext = () => {
  const context = useContext(KPIContext);
  if (!context) {
    throw new Error('useKPIContext must be used within a KPIProvider');
  }
  return context;
};

export const KPIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a stable initial date that never changes
  const initialDateRef = useRef(new Date());
  
  const [filters, setFilters] = useState({
    selectedMonth: initialDateRef.current,
    cities: [] as string[],
    zones: [] as string[],
    specialties: [] as string[],
    doctors: [] as string[],
    clinics: [] as string[],
    comparisonMonth: undefined as Date | undefined
  });

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    selectedMonth: filters.selectedMonth,
    comparisonMonth: filters.comparisonMonth,
    cities: filters.cities,
    zones: filters.zones,
    specialties: filters.specialties,
    doctors: filters.doctors,
    clinics: filters.clinics
  }), [
    filters.selectedMonth.getTime(), // Use timestamp to avoid date object reference changes
    filters.comparisonMonth?.getTime(),
    filters.cities.join(','),
    filters.zones.join(','),
    filters.specialties.join(','),
    filters.doctors.join(','),
    filters.clinics.join(',')
  ]);

  // Fetch KPI data once at the context level
  const { kpiData, rawData, loading, error } = useKPIData(memoizedFilters);

  // Memoize setFilters callback
  const handleSetFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const value = useMemo(() => ({
    networkRevenue: rawData?.data?.totalNetworkRevenue,
    networkARR: rawData?.data?.totalNetworkARR,
    kpiData,
    loading,
    error,
    filters,
    setFilters: handleSetFilters
  }), [rawData?.data?.totalNetworkRevenue, rawData?.data?.totalNetworkARR, kpiData, loading, error, filters, handleSetFilters]);

  return <KPIContext.Provider value={value}>{children}</KPIContext.Provider>;
};

