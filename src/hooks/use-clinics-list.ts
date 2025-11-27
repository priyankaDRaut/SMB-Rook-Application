import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';
import { apiCache } from '@/lib/api-cache';

export interface ClinicData {
  id: string;
  clinicName: string;
  city: string;
  specialty: string;
  doctorName: string;
  doctorId: string;
  revenue: number;
  expenses: number;
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
  const isRequestInProgress = useRef(false);
  
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
  }, [filterDeps]);

  return { clinicsData, loading, error, isUsingFallbackData };
};

