import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface CapexCategoryAmount {
  category: string;
  amount: number;
  percentage?: number;
}

export interface CapexMonthlyTrend {
  month: string;
  capexExpenses: number;
}

export interface CapexDetailData {
  totalCapexExpenses: number;
  averageMonthly: number;
  growthRate: number;
  capexDistribution: CapexCategoryAmount[];
  categoryBreakdown: CapexCategoryAmount[];
  monthlyTrends: CapexMonthlyTrend[];
  categoryComparison: Array<Pick<CapexCategoryAmount, 'category' | 'amount'>>;
}

export interface CapexDetailApiResponse {
  data: CapexDetailData;
  dataList: any[] | null;
  count: number;
}

export interface CapexDetailFilters {
  clinicId: string;
  startDate?: number;
  endDate?: number;
}

const DEFAULT_CLINIC_ID = '677d3679f8ec817ffe72fb95';

export const useCapexDetail = (filters?: Partial<CapexDetailFilters>) => {
  const [capexDetailData, setCapexDetailData] = useState<CapexDetailApiResponse | null>(null);
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

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.CAPEX_DETAIL,
          accessToken,
          {
            clinicId: effectiveFilters.clinicId,
            startDate: effectiveFilters.startDate,
            endDate: effectiveFilters.endDate,
          }
        );
        setCapexDetailData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch CAPEX detail';
        setError(errorMessage);
        setCapexDetailData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterDeps.clinicId, filterDeps.startDate, filterDeps.endDate, accessToken]);

  return { capexDetailData, loading, error };
};


