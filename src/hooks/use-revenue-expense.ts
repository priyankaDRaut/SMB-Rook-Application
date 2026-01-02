import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface RevenueExpenseData {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface RevenueExpenseApiResponse {
  count: number;
  data: RevenueExpenseData[];
  dataList: any[];
}

export interface RevenueExpenseFilters {
  clinicId: string;
  year: number;
  months?: number; // Number of months to fetch
}

// Default clinic ID for when none is provided
const DEFAULT_CLINIC_ID = null;

export const useRevenueExpense = (filters?: Partial<RevenueExpenseFilters>) => {
  const [revenueExpenseData, setRevenueExpenseData] = useState<RevenueExpenseApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();
  
  // Use provided filters or defaults
  const effectiveFilters = {
    clinicId: filters?.clinicId || DEFAULT_CLINIC_ID,
    year: filters?.year || new Date().getFullYear(),
    months: filters?.months || 12
  };

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    clinicId: effectiveFilters.clinicId,
    year: effectiveFilters.year,
    months: effectiveFilters.months
  }), [
    effectiveFilters.clinicId,
    effectiveFilters.year,
    effectiveFilters.months
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

      console.log('=== Revenue vs Expense API Debug ===');
      console.log('Clinic ID:', effectiveFilters.clinicId);
      console.log('Year:', effectiveFilters.year);
      console.log('Months:', effectiveFilters.months);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.REVENUE_EXPENSE,
          accessToken,
          {
            clinicId: effectiveFilters.clinicId,
            year: effectiveFilters.year,
            months: effectiveFilters.months
          }
        );
        console.log('✅ API request successful, received data:', data);
        setRevenueExpenseData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch revenue vs expense data';
        setError(errorMessage);
        console.error('❌ Revenue vs Expense API Error:', err);
        
        // Fallback to mock data on error
        console.log('🔄 Falling back to mock data for clinic:', effectiveFilters.clinicId);
        const mockData = getMockRevenueExpenseData(effectiveFilters.clinicId, effectiveFilters.year, effectiveFilters.months);
        setRevenueExpenseData(mockData);
        setIsUsingFallbackData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filterDeps.clinicId,
    filterDeps.year,
    filterDeps.months,
    accessToken
  ]);

  return { revenueExpenseData, loading, error, isUsingFallbackData };
};

// Mock data fallback function (temporary until API is stable)
const getMockRevenueExpenseData = (clinicId: string, year: number, months: number): RevenueExpenseApiResponse => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Generate deterministic mock data based on clinicId
  const clinicSeed = clinicId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const data: RevenueExpenseData[] = Array.from({ length: months }, (_, index) => {
    const monthSeed = (clinicSeed + index + year) % 100;
    const baseRevenue = 3000000 + (monthSeed * 50000); // ₹30L base
    const baseExpenses = 2250000 + (monthSeed * 40000); // ₹22.5L base (75% of revenue)
    const netProfit = baseRevenue - baseExpenses;
    
    return {
      month: monthNames[index % 12],
      revenue: baseRevenue,
      expenses: baseExpenses,
      netProfit: netProfit
    };
  });

  return {
    count: data.length,
    data,
    dataList: []
  };
};
