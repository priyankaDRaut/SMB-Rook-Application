import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyFinancialsData {
  ebit: number;
  interest: number;
  netIncome: number;
  period: string;
  taxes: number;
  totalCosts: number;
  totalRevenue: number;
}

export interface CompanyFinancialsApiResponse {
  count: number;
  data: CompanyFinancialsData;
  dataList: any[];
}

export interface CompanyFinancialsFilters {
  period: string;
}

// API configuration - use direct URL in production, proxy in development
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/healthco2admin/api/v1'  // Development: use Vite proxy
  : 'https://adminapiprod.healthcoco.com/healthco2admin/api/v1'; // Production: direct API URL

export const useCompanyFinancials = (filters: CompanyFinancialsFilters) => {
  const [companyFinancialsData, setCompanyFinancialsData] = useState<CompanyFinancialsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    period: filters.period
  }), [
    filters.period
  ]);

  const buildApiUrl = (filters: CompanyFinancialsFilters) => {
    const baseUrl = `${API_BASE_URL}/dashboard/company-financials`;
    const params = new URLSearchParams();

    // Add required parameters
    params.append('period', filters.period);

    // Add access token as query parameter (same as other API patterns)
    if (accessToken) {
      params.append('access_token', accessToken);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const fetchCompanyFinancials = async (url: string): Promise<CompanyFinancialsApiResponse> => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    console.log('Making Company Financials API request to:', url);
    console.log('Request headers:', headers);

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    console.log('Company Financials API Response status:', response.status);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        console.error('Company Financials API Error Response:', errorData);
        errorDetails = errorData?.message || JSON.stringify(errorData);
      } catch {
        errorDetails = await response.text().catch(() => 'Unknown error');
      }
      
      console.error(`Company Financials API Error ${response.status}:`, errorDetails);
      throw new Error(`HTTP ${response.status}: ${errorDetails}`);
    }

    const data = await response.json();
    console.log('✅ Company Financials API Response data:', data);
    console.log('✅ API Response structure:', {
      count: data?.count,
      hasData: !!data?.data,
      dataKeys: data?.data ? Object.keys(data.data) : [],
      dataListLength: data?.dataList?.length,
      period: data?.data?.period
    });
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if no access token available or no period
      if (!accessToken || !filters.period) {
        if (!accessToken) {
          setError('No access token available. Please login again.');
        }
        if (!filters.period) {
          setError('No period provided.');
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setIsUsingFallbackData(false);

      console.log('=== Company Financials API Debug ===');
      console.log('Period:', filters.period);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const apiUrl = buildApiUrl(filters);
        console.log('Making API request to:', apiUrl);
        const data = await fetchCompanyFinancials(apiUrl);
        console.log('✅ API request successful, received data:', data);
        setCompanyFinancialsData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch company financials';
        setError(errorMessage);
        console.error('❌ Company Financials API Error:', err);

        // API-only mode: no mock fallback.
        setCompanyFinancialsData(null);
        setIsUsingFallbackData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filterDeps.period,
    accessToken
  ]);

  return { companyFinancialsData, loading, error, isUsingFallbackData };
};