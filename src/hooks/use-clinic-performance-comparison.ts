import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

interface ClinicPerformanceData {
  capex: number;
  clinicName: string;
  ebitda: number;
  netProfit: number;
  profitShare: number;
  revenue: number;
  specialty: string;
  status: string;
  zone: string | null;
}

interface ClinicPerformanceResponse {
  count: number;
  data: ClinicPerformanceData[];
  dataList: any[] | null;
}

interface UseClinicPerformanceComparisonProps {
  period?: string;
  startDate?: number;
  endDate?: number;
}

export const useClinicPerformanceComparison = ({ period, startDate, endDate }: UseClinicPerformanceComparisonProps = {}) => {
  const [data, setData] = useState<ClinicPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const { accessToken } = useAuth();

  // Default period for when none is provided
  const DEFAULT_PERIOD = 'current-month';

  // Use effective period
  const effectivePeriod = period || DEFAULT_PERIOD;

  // Helper function to convert period to startDate and endDate
  const getDateRangeFromPeriod = (period: string): { startDate: number; endDate: number } => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
      case 'current-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'current-year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        // Handle YYYY-MM format
        if (period.match(/^\d{4}-\d{2}$/)) {
          const [year, month] = period.split('-').map(Number);
          start = new Date(year, month - 1, 1);
          end = new Date(year, month, 0, 23, 59, 59, 999);
        } else {
          // Default to current month
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }
    }

    return {
      startDate: start.getTime(),
      endDate: end.getTime()
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setError('No access token available. Please login again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setIsUsingFallbackData(false);

      try {
        // Determine the date range to use
        let dateRange: { startDate: number; endDate: number };
        
        if (startDate && endDate) {
          // Use provided startDate and endDate
          dateRange = { startDate, endDate };
        } else {
          // Convert period to date range
          dateRange = getDateRangeFromPeriod(effectivePeriod);
        }

        console.log('🔍 Fetching clinic performance comparison data for period:', effectivePeriod);
        console.log('🔍 Date range:', { startDate: dateRange.startDate, endDate: dateRange.endDate });
        console.log('🔍 Environment:', import.meta.env.DEV ? 'Development' : 'Production');
        
        const result = await makeApiRequest(
          API_CONFIG.ENDPOINTS.CLINIC_PERFORMANCE_COMPARISON,
          accessToken,
          { 
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        );
        console.log('✅ Clinic performance comparison API response:', result);
        
        setData(result);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clinic performance comparison data';
        setError(errorMessage);
        console.error('❌ Clinic performance comparison API Error:', err);
        
        // No fallback data - only show real API data
        setData(null);
        setIsUsingFallbackData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [effectivePeriod, startDate, endDate
    // Removed accessToken from dependencies to prevent infinite loops
    // accessToken is stable and doesn't need to trigger re-fetches
  ]);

  return { 
    clinicPerformanceData: data, 
    loading, 
    error, 
    isUsingFallbackData 
  };
}; 