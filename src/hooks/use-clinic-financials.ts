import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ClinicFinancialsData {
  ebit: number;
  interest: number;
  netIncome: number;
  period: string;
  taxes: number;
  totalCosts: number;
  totalRevenue: number;
}

export interface ClinicFinancialsApiResponse {
  count: number;
  data: ClinicFinancialsData;
  dataList: any[];
}

export interface ClinicFinancialsFilters {
  clinicId: string;
  period: string;
}

// API configuration - use direct URL in production, proxy in development
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/healthco2admin/api/v1'  // Development: use Vite proxy
  : 'https://adminapiprod.healthcoco.com/healthco2admin/api/v1'; // Production: direct API URL

export const useClinicFinancials = (filters: ClinicFinancialsFilters) => {
  const [clinicFinancialsData, setClinicFinancialsData] = useState<ClinicFinancialsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    clinicId: filters.clinicId,
    period: filters.period
  }), [
    filters.clinicId,
    filters.period
  ]);

  const buildApiUrl = (filters: ClinicFinancialsFilters) => {
    const baseUrl = `${API_BASE_URL}/dashboard/clinic-financials`;
    const params = new URLSearchParams();

    // Add required parameters
    params.append('clinicId', filters.clinicId);
    params.append('period', filters.period);

    // Add access token as query parameter (same as other API patterns)
    if (accessToken) {
      params.append('access_token', accessToken);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const fetchClinicFinancials = async (url: string): Promise<ClinicFinancialsApiResponse> => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    console.log('Making Clinic Financials API request to:', url);
    console.log('Request headers:', headers);

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    console.log('Clinic Financials API Response status:', response.status);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        console.error('Clinic Financials API Error Response:', errorData);
        errorDetails = errorData?.message || JSON.stringify(errorData);
      } catch {
        errorDetails = await response.text().catch(() => 'Unknown error');
      }
      
      console.error(`Clinic Financials API Error ${response.status}:`, errorDetails);
      throw new Error(`HTTP ${response.status}: ${errorDetails}`);
    }

    const data = await response.json();
    console.log('✅ Clinic Financials API Response data:', data);
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
      // Don't fetch if no access token available or no clinicId/period
      if (!accessToken || !filters.clinicId || !filters.period) {
        if (!accessToken) {
          setError('No access token available. Please login again.');
        }
        if (!filters.clinicId) {
          setError('No clinicId provided.');
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

      console.log('=== Clinic Financials API Debug ===');
      console.log('ClinicId:', filters.clinicId);
      console.log('Period:', filters.period);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const apiUrl = buildApiUrl(filters);
        console.log('Making API request to:', apiUrl);
        const data = await fetchClinicFinancials(apiUrl);
        console.log('✅ API request successful, received data:', data);
        setClinicFinancialsData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clinic financials';
        setError(errorMessage);
        console.error('❌ Clinic Financials API Error:', err);

        // API-only mode: no mock fallback.
        setClinicFinancialsData(null);
        setIsUsingFallbackData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filterDeps.clinicId,
    filterDeps.period,
    accessToken
  ]);

  return { clinicFinancialsData, loading, error, isUsingFallbackData };
};