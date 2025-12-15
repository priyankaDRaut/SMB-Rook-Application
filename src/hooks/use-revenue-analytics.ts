import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface RevenueBreakdownItem {
  treatmentType: string | null;
  totalRevenue: number;
  percentage: number;
}

export interface RecentTransaction {
  treatmentType: string | null;
  patientName: string;
  amount: number;
  paymentMode: string;
  date: string; // e.g. "30/10/2025"
}

export interface RevenueAnalyticsData {
  totalRevenue: number;
  netMargin: number;
  revenueBreakdown: RevenueBreakdownItem[];
  recentTransactions: RecentTransaction[];
}

export interface RevenueAnalyticsApiResponse {
  count: number;
  data: RevenueAnalyticsData;
  dataList: any[] | null;
}

export interface RevenueAnalyticsFilters {
  clinicId: string;
  startDate?: number; // Timestamp
  endDate?: number; // Timestamp
}

// Default clinic ID for when none is provided
const DEFAULT_CLINIC_ID = '677d3679f8ec817ffe72fb95';

export const useRevenueAnalytics = (filters?: Partial<RevenueAnalyticsFilters>) => {
  const [revenueAnalyticsData, setRevenueAnalyticsData] = useState<RevenueAnalyticsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();
  
  // Use provided filters or defaults (fallback dates are just safe defaults)
  const effectiveFilters = {
    clinicId: filters?.clinicId || DEFAULT_CLINIC_ID,
    startDate: filters?.startDate ,
    endDate: filters?.endDate ,
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

      console.log('=== Revenue Analytics API Debug ===');
      console.log('Clinic ID:', effectiveFilters.clinicId);
      console.log('Start Date:', effectiveFilters.startDate);
      console.log('End Date:', effectiveFilters.endDate);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.REVENUE_ANALYTICS,
          accessToken,
          {
            clinicId: effectiveFilters.clinicId,
            startDate: effectiveFilters.startDate,
            endDate: effectiveFilters.endDate
          }
        );
        console.log('✅ Revenue Analytics API request successful, received data:', data);
        setRevenueAnalyticsData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch revenue analytics';
        setError(errorMessage);
        console.error('❌ Revenue Analytics API Error:', err);
        
        // No fallback data - only show real API data
        setRevenueAnalyticsData(null);
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

  return { revenueAnalyticsData, loading, error, isUsingFallbackData };
};

