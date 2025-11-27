import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface PatientTrend {
  month: string;
  newPatients: number;
  returningPatients: number;
  totalFootfall: number;
}

export interface RevenueVsExpense {
  expenses: number;
  month: string;
  revenue: number;
}

export interface RevenueAnalytics {
  detailsLink: string;
  totalRevenue: number;
}

export interface ExpenseAnalytics {
  detailsLink: string;
  totalExpenses: number;
}

export interface MonthlySummaryData {
  clinicId: string;
  expenseAnalytics: ExpenseAnalytics;
  month: number;
  patientTrends: PatientTrend[];
  revenueAnalytics: RevenueAnalytics;
  revenueVsExpenses: RevenueVsExpense[];
  year: number;
}

export interface MonthlySummaryApiResponse {
  count: number;
  data: MonthlySummaryData;
  dataList: any[];
}

export interface MonthlySummaryFilters {
  clinicId: string;
  month: number;
  year: number;
}

// Default clinic ID for when none is provided
const DEFAULT_CLINIC_ID = 'smilebird-andheri';

export const useMonthlySummary = (filters?: Partial<MonthlySummaryFilters>) => {
  const [monthlySummaryData, setMonthlySummaryData] = useState<MonthlySummaryApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();
  
  // Use provided filters or defaults
  const effectiveFilters = {
    clinicId: filters?.clinicId || DEFAULT_CLINIC_ID,
    month: filters?.month || new Date().getMonth() + 1,
    year: filters?.year || new Date().getFullYear()
  };

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    clinicId: effectiveFilters.clinicId,
    month: effectiveFilters.month,
    year: effectiveFilters.year
  }), [
    effectiveFilters.clinicId,
    effectiveFilters.month,
    effectiveFilters.year
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

      console.log('=== Monthly Summary API Debug ===');
      console.log('ClinicId:', effectiveFilters.clinicId);
      console.log('Month:', effectiveFilters.month);
      console.log('Year:', effectiveFilters.year);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.MONTHLY_SUMMARY,
          accessToken,
          {
            clinicId: effectiveFilters.clinicId,
            month: effectiveFilters.month,
            year: effectiveFilters.year
          }
        );
        console.log('✅ API request successful, received data:', data);
        setMonthlySummaryData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch monthly summary';
        setError(errorMessage);
        console.error('❌ Monthly Summary API Error:', err);
        
        // No fallback data - only show real API data
        setMonthlySummaryData(null);
        setIsUsingFallbackData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filterDeps.clinicId,
    filterDeps.month,
    filterDeps.year,
    accessToken
  ]);

  return { monthlySummaryData, loading, error, isUsingFallbackData };
};
