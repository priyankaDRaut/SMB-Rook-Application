import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface MarketingDetailData {
  overallMarketingSpend: number;
  digitalAdsMarketingSpend: number;
  offlineMarketingSpend: number;
  insuranceLedMarketingSpend: number;
  cppViaOverallMarketingSpend: number;
  cppViaDigitalAdsMarketingSpend: number;
  cppViaInsuranceLedMarketingSpend: number;
  marketingAttributedRevenuePercent: number;
  digitalMarketingAttributedRevenuePercent: number;
  insuranceMarketingAttributedRevenuePercent: number;
  marketingPaybackRatioOverall: number;
  marketingPaybackRatioOnline: number;
  marketingPaybackRatioOffline: number;
  marketingPaybackRatioInsurance: number;
}

export interface MarketingDetailApiResponse {
  data: MarketingDetailData;
  dataList: unknown[] | null;
  count: number;
}

export interface MarketingDetailFilters {
  clinicId: string;
  startDate?: number;
  endDate?: number;
}

export const useMarketingDetail = (filters?: Partial<MarketingDetailFilters>) => {
  const [marketingDetailData, setMarketingDetailData] = useState<MarketingDetailApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { accessToken } = useAuth();

  const effectiveFilters = {
    clinicId: filters?.clinicId ?? '',
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

      if (!effectiveFilters.clinicId) {
        setError('No clinicId provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.MARKETING_DETAIL,
          accessToken,
          {
            clinicId: effectiveFilters.clinicId,
            startDate: effectiveFilters.startDate,
            endDate: effectiveFilters.endDate,
          }
        );
        setMarketingDetailData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch marketing detail';
        setError(errorMessage);
        setMarketingDetailData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterDeps.clinicId, filterDeps.startDate, filterDeps.endDate, accessToken]);

  return { marketingDetailData, loading, error };
};
