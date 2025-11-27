import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ClinicsFilters {
  startDate: Date;
  endDate: Date;
  city?: string;
  zone?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
}

interface ClinicsApiResponse {
  count: number;
  data: any[];
  dataList: any[];
}

// API configuration - use direct URL in production, proxy in development
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/healthco2admin/api/v1'  // Development: use Vite proxy
  : 'https://adminapiprod.healthcoco.com/healthco2admin/api/v1'; // Production: direct API URL

export const useClinicsData = (filters: ClinicsFilters) => {
  const [clinicsData, setClinicsData] = useState<ClinicsApiResponse | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    startDate: filters.startDate.getTime(),
    endDate: filters.endDate.getTime(),
    city: filters.city || '',
    zone: filters.zone || '',
    searchTerm: filters.searchTerm || '',
    page: filters.page || 0,
    size: filters.size || 10
  }), [
    filters.startDate,
    filters.endDate,
    filters.city,
    filters.zone,
    filters.searchTerm,
    filters.page,
    filters.size
  ]);

  const buildApiUrl = (filters: ClinicsFilters) => {
    const baseUrl = `${API_BASE_URL}/dashboard/clinics`;
    const params = new URLSearchParams();

    // Date parameters - Convert to timestamps
    const startDate = filters.startDate.getTime();
    const endDate = filters.endDate.getTime();
    
    console.log('Clinics API - Date timestamps:', { startDate, endDate });
    
    // Add ALL required parameters (API expects them all to be present)
    params.append('city', filters.city || '');
    params.append('endDate', endDate.toString());
    params.append('page', (filters.page || 0).toString());
    params.append('searchTerm', filters.searchTerm || '');
    params.append('size', (filters.size || 10).toString());
    params.append('startDate', startDate.toString());
    params.append('zone', filters.zone || '');

    // Add access token as query parameter (same as KPI API pattern)
    if (accessToken) {
      params.append('access_token', accessToken);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const fetchClinicsData = async (url: string): Promise<ClinicsApiResponse> => {
    // Follow exact same pattern as working KPI API calls
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    console.log('Making Clinics API request to:', url);
    console.log('Request headers:', headers);

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    console.log('Clinics API Response status:', response.status);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        console.error('Clinics API Error Response:', errorData);
        errorDetails = errorData?.message || JSON.stringify(errorData);
      } catch {
        errorDetails = await response.text().catch(() => 'Unknown error');
      }
      
      console.error(`Clinics API Error ${response.status}:`, errorDetails);
      throw new Error(`HTTP ${response.status}: ${errorDetails}`);
    }

    const data = await response.json();
    console.log('Clinics API Response data:', data);
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if no access token available
      if (!accessToken) {
        setError('No access token available. Please login again.');
        return;
      }

      // Don't prevent API calls during loading - this was causing navigation issues
      // The loading state should not block new API calls when dependencies change
      
      setLoading(true);
      setError(null);

      try {
        const apiUrl = buildApiUrl(filters);
        console.log('Fetching Clinics data from:', apiUrl);
        const data = await fetchClinicsData(apiUrl);
        setClinicsData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clinics data';
        setError(errorMessage);
        console.error('Clinics API Error:', err);
        
        // Fallback to empty data on error
        setClinicsData({
          count: 0,
          data: [],
          dataList: []
        });
      } finally {
        setLoading(false);
      }
    };

    // Always call fetchData when useEffect runs (including on mount)
    fetchData();
  }, [
    filterDeps.startDate,
    filterDeps.endDate,
    filterDeps.city,
    filterDeps.zone,
    filterDeps.searchTerm,
    filterDeps.page,
    filterDeps.size,
    accessToken
  ]);

  return { clinicsData, loading, error };
}; 