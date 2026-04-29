import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';
import { apiCache } from '@/lib/api-cache';
import { useLocation } from 'react-router-dom';

export interface ClinicData {
  id: string;
  clinicName: string;
  city: string;
  specialty: string;
  doctorName: string;
  doctorId: string;
  revenue: number;
  expenses: number;
  /** Operational expense (OPEX) when provided by API; used for display in clinic table */
  opexExpense?: number;
  /** Breakeven status from API: "Yes" | "No" | "Breakeven" */
  breakevenStatus?: string;
  profit: number;
  profitPercentage: number;
  adminCreatedTime?: number | null;
  createdTime?: number | null;
  updatedTime?: number;
  createdBy?: string | null;
}

export interface ClinicsListApiResponse {
  count: number;
  data: ClinicData[];
  dataList: any[];
}

export interface ClinicsListFilters {
  startDate?: number;
  endDate?: number;
  zone?: string;
  specialty?: string;
  status?: string;
}

export const useClinicsList = (filters?: ClinicsListFilters) => {
  const [clinicsData, setClinicsData] = useState<ClinicsListApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const isRequestInProgress = useRef(false);
  const location = useLocation();
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    zone: filters?.zone,
    specialty: filters?.specialty,
    status: filters?.status
  }), [
    filters?.startDate,
    filters?.endDate,
    filters?.zone,
    filters?.specialty,
    filters?.status
  ]);

  useEffect(() => {
    const triggerRefresh = () => {
      apiCache.clear();
      setRefreshTick((prev) => prev + 1);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerRefresh();
      }
    };

    window.addEventListener('focus', triggerRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', triggerRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      apiCache.clear();
      setRefreshTick((prev) => prev + 1);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      // Prevent multiple simultaneous requests
      if (isRequestInProgress.current) {
        console.log('🚫 Request already in progress, skipping...');
        return;
      }

      // Don't fetch if no access token available
      if (!accessToken) {
        setError('No access token available. Please login again.');
        setLoading(false);
        return;
      }

      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);
      setIsUsingFallbackData(false);

      console.log('=== Clinics List API Debug ===');
      console.log('Effect triggered at:', new Date().toISOString());
      console.log('Filters:', filterDeps);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.CLINICS,
          accessToken,
          filterDeps
        );
        console.log('✅ API request successful, received data:', data);
        setClinicsData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clinics list';
        setError(errorMessage);
        console.error('❌ Clinics List API Error:', err);
        
        // No fallback data - only show real API data
        setClinicsData(null);
        setIsUsingFallbackData(false);
      } finally {
        setLoading(false);
        isRequestInProgress.current = false;
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isRequestInProgress.current = false;
    };
  }, [filterDeps, refreshTick]);

  return { clinicsData, loading, error, isUsingFallbackData };
};

