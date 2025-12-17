import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface OpexCategoryAmount {
  category: string;
  amount: number;
  percentage?: number;
}

export interface OpexMonthlyTrend {
  month: string;
  opexExpenses: number;
}

export interface OpexDetailData {
  totalOpexExpenses: number;
  averageMonthly: number;
  growthRate: number;
  expenseDistribution: OpexCategoryAmount[];
  categoryBreakdown: OpexCategoryAmount[];
  monthlyTrends: OpexMonthlyTrend[];
  categoryComparison: Array<Pick<OpexCategoryAmount, 'category' | 'amount'>>;
}

export interface OpexDetailApiResponse {
  data: OpexDetailData;
  dataList: any[] | null;
  count: number;
}

export interface OpexDetailFilters {
  clinicId: string;
  startDate?: number;
  endDate?: number;
}

const DEFAULT_CLINIC_ID = '677d3679f8ec817ffe72fb95';

export const useOpexDetail = (filters?: Partial<OpexDetailFilters>) => {
  const [opexDetailData, setOpexDetailData] = useState<OpexDetailApiResponse | null>(null);
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
          API_CONFIG.ENDPOINTS.OPEX_DETAIL,
          accessToken,
          {
            clinicId: effectiveFilters.clinicId,
            startDate: effectiveFilters.startDate,
            endDate: effectiveFilters.endDate,
          }
        );
        setOpexDetailData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch OPEX detail';
        setError(errorMessage);
        setOpexDetailData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterDeps.clinicId, filterDeps.startDate, filterDeps.endDate, accessToken]);

  return { opexDetailData, loading, error };
};


