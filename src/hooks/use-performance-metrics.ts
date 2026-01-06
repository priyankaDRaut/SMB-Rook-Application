import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface PerformanceMetricsData {
  expenses: number;
  month: string;
  netProfit: number;
  newPatients: number;
  returningPatients: number;
  revenue: number;
  totalFootfall: number;
  /**
   * Backward/forward compatible fields:
   * - Some APIs return these instead of/alongside totalFootfall.
   */
  // Canonical naming (preferred)
  uniqueVisitedPatients?: number;
  totalVisitedPatients?: number;
  visitedPatients?: number;

  // Alternate naming used by some backend responses / older screens
  uniqueVisitedPatient?: number;
  totalVisitedPatient?: number;

  // Common misspellings seen in some payloads/screens (keep optional to avoid TS breakage)
  uniqueVistedPatient?: number;
  uniqueVistedPatients?: number;
  totalVisistedPatient?: number;
  totalVisistedPatients?: number;
}

export interface PerformanceMetricsApiResponse {
  count: number;
  data: PerformanceMetricsData[];
  dataList: any[];
}

export interface PerformanceMetricsFilters {
  clinicId: string;
  startDate?: string;
  endDate?: string;
}

// Default clinic ID for when none is provided
const DEFAULT_CLINIC_ID = null;

export const usePerformanceMetrics = (filters?: Partial<PerformanceMetricsFilters>) => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetricsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();
  
  // Use provided filters or defaults
  const effectiveFilters = {
    clinicId: filters?.clinicId || DEFAULT_CLINIC_ID,
    startDate: filters?.startDate || '',
    endDate: filters?.endDate || '1758812900498'
  };

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    clinicId: effectiveFilters.clinicId,
    startDate: effectiveFilters.startDate,
    endDate: effectiveFilters.endDate
  }), [
    effectiveFilters.clinicId,
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

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.PERFORMANCE_METRICS,
          accessToken,
          {
            clinicId: effectiveFilters.clinicId,
            startDate: effectiveFilters.startDate,
            endDate: effectiveFilters.endDate
          }
        );
        console.log('✅ API request successful, received data:', data);
        setPerformanceData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch performance metrics';
        setError(errorMessage);
        
        // No fallback data - only show real API data
        setPerformanceData(null);
        setIsUsingFallbackData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filterDeps.clinicId,
    filterDeps.startDate,
    filterDeps.endDate,
    accessToken
  ]);

  return { performanceData, loading, error, isUsingFallbackData };
};
