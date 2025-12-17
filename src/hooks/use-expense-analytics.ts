import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface ExpenseBreakdownItem {
  expenseType: string;
  totalCost: number;
  percentage: number;
}

export interface RecentExpense {
  expenseType: string;
  vendor: string;
  amount: number;
  paymentMode: string;
  note?: string | null;
  date: string; // e.g. "30/10/2025"
}

export interface ExpenseAnalyticsData {
  totalExpenses: number;
  expenseRatio: number;
  expenseBreakdown: ExpenseBreakdownItem[];
  recentExpenses: RecentExpense[];
}

export interface ExpenseAnalyticsApiResponse {
  count: number;
  data: ExpenseAnalyticsData;
  dataList: any[] | null;
}

export interface ExpenseAnalyticsFilters {
  clinicId: string;
  startDate?: number; // Timestamp (ms)
  endDate?: number; // Timestamp (ms)
}

// Default clinic ID for when none is provided (same as revenue analytics)
const DEFAULT_CLINIC_ID = '677d3679f8ec817ffe72fb95';

export const useExpenseAnalytics = (filters?: Partial<ExpenseAnalyticsFilters>) => {
  const [expenseAnalyticsData, setExpenseAnalyticsData] = useState<ExpenseAnalyticsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { accessToken } = useAuth();

  const effectiveFilters = {
    clinicId: filters?.clinicId || DEFAULT_CLINIC_ID,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
  };

  const filterDeps = useMemo(
    () => ({
      clinicId: effectiveFilters.clinicId,
      startDate: effectiveFilters.startDate,
      endDate: effectiveFilters.endDate,
    }),
    [effectiveFilters.clinicId, effectiveFilters.startDate, effectiveFilters.endDate]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setError('No access token available. Please login again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('=== Expense Analytics API Debug ===');
      console.log('Clinic ID:', effectiveFilters.clinicId);
      console.log('Start Date:', effectiveFilters.startDate);
      console.log('End Date:', effectiveFilters.endDate);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.EXPENSE_ANALYTICS,
          accessToken,
          {
            clinicId: effectiveFilters.clinicId,
            startDate: effectiveFilters.startDate,
            endDate: effectiveFilters.endDate,
          }
        );
        console.log('✅ Expense Analytics API request successful, received data:', data);
        setExpenseAnalyticsData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expense analytics';
        setError(errorMessage);
        console.error('❌ Expense Analytics API Error:', err);
        setExpenseAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterDeps.clinicId, filterDeps.startDate, filterDeps.endDate, accessToken]);

  return { expenseAnalyticsData, loading, error };
};


