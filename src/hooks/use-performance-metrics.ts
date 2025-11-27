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
const DEFAULT_CLINIC_ID = '677d3679f8ec817ffe72fb95';

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

      console.log('=== Performance Metrics API Debug ===');
      console.log('Clinic ID:', effectiveFilters.clinicId);
      console.log('Start Date:', effectiveFilters.startDate);
      console.log('End Date:', effectiveFilters.endDate);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

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
        console.error('❌ Performance Metrics API Error:', err);
        
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
