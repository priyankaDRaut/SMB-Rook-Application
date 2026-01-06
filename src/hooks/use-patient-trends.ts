import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface PatientTrendData {
  month: string;
  newPatients: number;
  uniqueVisitedPatients: number;
  uniqueVisitedPatient: number;
  totalVisitedPatients: number;
  totalVisistedPatients: number;

}

export interface PatientTrendsApiResponse {
  count: number;
  data: PatientTrendData[];
  dataList: any[];
}

export interface PatientTrendsFilters {
  clinicId: string;
  range: string; // Year, Month, etc.
  startDate?: number; // Timestamp
  endDate?: number; // Timestamp
}

// Default clinic ID for when none is provided
const DEFAULT_CLINIC_ID = '';

export const usePatientTrends = (filters?: Partial<PatientTrendsFilters>) => {
  const [patientTrendsData, setPatientTrendsData] = useState<PatientTrendsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();
  
  // Use provided filters or defaults
  const effectiveFilters = {
    clinicId: filters?.clinicId || DEFAULT_CLINIC_ID,
    range: filters?.range || 'Year',
    startDate: filters?.startDate || 1756665000000,
    endDate: filters?.endDate || 1759170600000
  };

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    clinicId: effectiveFilters.clinicId,
    range: effectiveFilters.range,
    startDate: effectiveFilters.startDate,
    endDate: effectiveFilters.endDate
  }), [
    effectiveFilters.clinicId,
    effectiveFilters.range,
    effectiveFilters.startDate,
    effectiveFilters.endDate
  ]);

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if no access token available
      if (!accessToken) {
        setError('No access token available. Please login again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setIsUsingFallbackData(false);

      console.log('=== Patient Trends API Debug ===');
      console.log('Clinic ID:', effectiveFilters.clinicId);
      console.log('Range:', effectiveFilters.range);
      console.log('Start Date:', effectiveFilters.startDate);
      console.log('End Date:', effectiveFilters.endDate);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.PATIENT_TRENDS,
          accessToken,
          {
            range: effectiveFilters.range,
            clinicId: effectiveFilters.clinicId,
            startDate: effectiveFilters.startDate,
            endDate: effectiveFilters.endDate
          }
        );
        console.log('✅ API request successful, received data:', data);
        setPatientTrendsData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient trends';
        setError(errorMessage);
        console.error('❌ Patient Trends API Error:', err);
        
        // No fallback data - only show real API data
        setPatientTrendsData(null);
        setIsUsingFallbackData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filterDeps.clinicId,
    filterDeps.range,
    filterDeps.startDate,
    filterDeps.endDate,
    accessToken
  ]);

  return { patientTrendsData, loading, error, isUsingFallbackData };
};

