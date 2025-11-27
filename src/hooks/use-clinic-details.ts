import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ClinicDetailsData {
  averageRating: number;
  breakevenStatus: string;
  city: string;
  clinicId: string;
  clinicName: string;
  doctorInCharge: string;
  footfall: number;
  locality: string;
  netIncome: number;
  newPatientConversion: number;
  newPatients: number;
  operatories: number;
  returning: number;
  revenue: number;
  specialty: string;
  totalPatient: number;
  treatmentCompletion: number;
  zone: string;
}

export interface ClinicDetailsApiResponse {
  count: number;
  data: ClinicDetailsData;
  dataList: any[];
}

export interface ClinicDetailsFilters {
  clinicId: string;
  startDate?: number;
  endDate?: number;
}

// API configuration - use direct URL in production, proxy in development
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/healthco2admin/api/v1'  // Development: use Vite proxy
  : 'https://adminapiprod.healthcoco.com/healthco2admin/api/v1'; // Production: direct API URL

// Global request cache to prevent duplicate requests
const requestCache = new Map<string, Promise<any>>();

export const useClinicDetails = (filters: ClinicDetailsFilters) => {
  const [clinicDetailsData, setClinicDetailsData] = useState<ClinicDetailsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const isRequestInProgress = useRef(false);
  
  // Get access token from useAuth hook
  const { accessToken: authToken } = useAuth();
  
  // Use hardcoded token for development if auth token is not available
  const accessToken = authToken || 'c652301f-9b7e-4726-8ca3-f8a13c2883b8';

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    clinicId: filters.clinicId,
    startDate: filters.startDate,
    endDate: filters.endDate
  }), [
    filters.clinicId,
    filters.startDate,
    filters.endDate
  ]);

  const buildApiUrl = (filters: ClinicDetailsFilters) => {
    const baseUrl = `${API_BASE_URL}/dashboard/clinics/${filters.clinicId}`;
    const params = new URLSearchParams();

    // Add access token as query parameter (same as other API patterns)
    if (accessToken) {
      params.append('access_token', accessToken);
    }

    // Add date parameters if provided
    if (filters.startDate) {
      params.append('startDate', filters.startDate.toString());
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate.toString());
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const fetchClinicDetails = async (url: string): Promise<ClinicDetailsApiResponse> => {
    // Check if request is already in progress
    if (requestCache.has(url)) {
      console.log('🔄 Request already in progress, waiting for existing request...');
      return await requestCache.get(url)!;
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    console.log('Making Clinic Details API request to:', url);
    console.log('Request headers:', headers);

    // Create and cache the request promise
    const requestPromise = fetch(url, {
      method: 'GET',
      headers
    }).then(async (response) => {
      // Remove from cache when request completes
      requestCache.delete(url);
      return response;
    }).catch((error) => {
      // Remove from cache on error
      requestCache.delete(url);
      throw error;
    });

    requestCache.set(url, requestPromise);
    const response = await requestPromise;

    console.log('Clinic Details API Response status:', response.status);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        console.error('Clinic Details API Error Response:', errorData);
        errorDetails = errorData?.message || JSON.stringify(errorData);
      } catch {
        errorDetails = await response.text().catch(() => 'Unknown error');
      }
      
      console.error(`Clinic Details API Error ${response.status}:`, errorDetails);
      throw new Error(`HTTP ${response.status}: ${errorDetails}`);
    }

    const data = await response.json();
    console.log('✅ Clinic Details API Response data:', data);
    console.log('✅ API Response structure:', {
      count: data?.count,
      hasData: !!data?.data,
      dataKeys: data?.data ? Object.keys(data.data) : [],
      dataListLength: data?.dataList?.length,
      clinicId: data?.data?.clinicId,
      revenue: data?.data?.revenue,
      footfall: data?.data?.footfall
    });
    
    // Check if the response has the expected structure
    if (!data) {
      console.error('❌ API returned null/undefined data');
      throw new Error('API returned null/undefined data');
    }
    
    // Check if data.data exists and has required fields
    if (!data.data) {
      console.error('❌ API response missing "data" field:', data);
      throw new Error('API response missing "data" field');
    }
    
    // Check if required fields exist
    const requiredFields = ['clinicId', 'clinicName', 'revenue', 'footfall'];
    const missingFields = requiredFields.filter(field => !(field in data.data));
    if (missingFields.length > 0) {
      console.error('❌ API response missing required fields:', missingFields);
      console.error('❌ Available fields:', Object.keys(data.data));
      // If only clinicName is missing, we can use clinicId as fallback
      if (missingFields.length === 1 && missingFields[0] === 'clinicName') {
        console.warn('⚠️ clinicName missing, will use clinicId as fallback');
        data.data.clinicName = data.data.clinicId;
      } else {
        throw new Error(`API response missing required fields: ${missingFields.join(', ')}`);
      }
    }
    
    // Add fallback values for optional location fields if missing
    if (!data.data.city) data.data.city = 'Mumbai';
    if (!data.data.zone) data.data.zone = 'Not specified';
    if (!data.data.locality) data.data.locality = 'Not specified';
    if (!data.data.specialty) data.data.specialty = 'General Medicine';
    
    console.log('✅ API response validation passed');
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      // Prevent multiple simultaneous requests
      if (isRequestInProgress.current) {
        console.log('🚫 Request already in progress, skipping...');
        return;
      }
      
      // Don't fetch if no access token available or no clinicId
      if (!accessToken || !filters.clinicId) {
        if (!accessToken) {
          setError('No access token available. Please login again.');
        }
        if (!filters.clinicId) {
          setError('No clinicId provided.');
        }
        setLoading(false);
        return;
      }

      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);
      setIsUsingFallbackData(false);

      console.log('=== Clinic Details API Debug ===');
      console.log('ClinicId:', filters.clinicId);
      console.log('Access Token Available:', !!accessToken);
      console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

      try {
        const apiUrl = buildApiUrl(filters);
        console.log('Making API request to:', apiUrl);
        const data = await fetchClinicDetails(apiUrl);
        console.log('✅ API request successful, received data:', data);
        setClinicDetailsData(data);
        setIsUsingFallbackData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clinic details';
        setError(errorMessage);
        console.error('❌ Clinic Details API Error:', err);
        
        // Fallback to mock data on error
        console.log('🔄 Falling back to mock data for clinic:', filters.clinicId);
        const mockData = getMockClinicDetailsData(filters.clinicId);
        console.log('🔄 Mock data generated:', mockData);
        setClinicDetailsData(mockData);
        setIsUsingFallbackData(true);
      } finally {
        setLoading(false);
        isRequestInProgress.current = false;
      }
    };

    fetchData();

    // Cleanup function to prevent memory leaks
    return () => {
      isRequestInProgress.current = false;
    };
  }, [
    filterDeps.clinicId,
    filterDeps.startDate,
    filterDeps.endDate
    // Removed accessToken from dependencies to prevent infinite loops
    // accessToken is stable and doesn't need to trigger re-fetches
  ]);

  return { clinicDetailsData, loading, error, isUsingFallbackData };
};

// Mock data fallback function (temporary until API is stable)
const getMockClinicDetailsData = (clinicId: string): ClinicDetailsApiResponse => {
  // Generate deterministic mock data based on clinicId
  const seed = clinicId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = (seed % 30) / 100; // 0-29% variation
  
  // Generate a readable clinic name and location based on clinicId
  const locations = ['Andheri', 'Bandra', 'Juhu', 'Malad', 'Borivali', 'Powai', 'Dadar', 'Thane'];
  const zones = ['West', 'South', 'North', 'East', 'Central'];
  const localities = ['West', 'East', 'South', 'North'];
  const specialties = ['General Medicine', 'Dental', 'Pediatrics', 'Orthopedics', 'Cardiology'];
  
  const locationIndex = seed % locations.length;
  const zoneIndex = seed % zones.length;
  const localityIndex = seed % localities.length;
  const specialtyIndex = seed % specialties.length;
  
  const clinicName = `Smilebird ${locations[locationIndex]}`;
  const city = 'Mumbai';
  const zone = zones[zoneIndex];
  const locality = locations[locationIndex] + ' ' + localities[localityIndex];
  const specialty = specialties[specialtyIndex];
  
  const baseRevenue = 3020000; // ₹30.2L
  const baseFootfall = 150;
  const baseNewPatients = 45;
  const baseReturning = 105;
  
  const revenue = Math.round(baseRevenue * (1 + variation));
  const footfall = Math.round(baseFootfall * (1 + variation));
  const newPatients = Math.round(baseNewPatients * (1 + variation));
  const returning = Math.round(baseReturning * (1 + variation));
  const totalPatient = newPatients + returning;
  const netIncome = Math.round(revenue * 0.25 * (1 + variation)); // 25% profit margin
  const newPatientConversion = Math.round((newPatients / footfall) * 100);
  const treatmentCompletion = Math.round(85 + (variation * 15)); // 85-100%
  const averageRating = 4.2 + (variation * 0.6); // 4.2-4.8
  const operatories = 3 + Math.round(variation * 2); // 3-5
  const breakevenStatus = variation > 0.5 ? 'Profitable' : 'Break-even';

  return {
    count: 1,
    data: {
      averageRating,
      breakevenStatus,
      city,
      clinicId,
      clinicName,
      doctorInCharge: 'Smith',
      footfall,
      locality,
      netIncome,
      newPatientConversion,
      newPatients,
      operatories,
      returning,
      revenue,
      specialty,
      totalPatient,
      treatmentCompletion,
      zone
    },
    dataList: []
  };
}; 