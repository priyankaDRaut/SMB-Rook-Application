// Import API cache
import { apiCache } from './api-cache';

// API Configuration for different environments
export const API_CONFIG = {
  // Base URL - use proxy in development, direct URL in production
  BASE_URL: import.meta.env.DEV 
    ? '/api' // Development: use Vite proxy
    : 'https://adminapiprod.healthcoco.com', // Production: direct API URL
  
  // OAuth URL - always direct in both environments
  OAUTH_URL: 'https://adminapiprod.healthcoco.com/healthco2admin/oauth/token',
  
  // API endpoints
  ENDPOINTS: {
    OAUTH_TOKEN: '/healthco2admin/oauth/token',
    DASHBOARD_BASE: '/healthco2admin/api/v1',
    KPIS: '/dashboard/kpis',
    CLINICS: '/dashboard/clinics',
    COMPANY_FINANCIALS: '/dashboard/company-financials',
    CLINIC_FINANCIALS: '/dashboard/clinic-financials',
    CLINIC_DETAILS: '/dashboard/clinics',
    MONTHLY_SUMMARY: '/dashboard/monthly-summary',
    PERFORMANCE_METRICS: '/dashboard/performance-metrics',
    CLINIC_PERFORMANCE_COMPARISON: '/dashboard/clinic-performance-comparison',
    PATIENT_TRENDS: '/dashboard/patient-trends',
    REVENUE_ANALYTICS: '/dashboard/revenue-analytics',
    REVENUE_EXPENSE: '/dashboard/revenue-expense',
    FINANCIAL_OVERVIEW: '/dashboard/financial/overview',
  }
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, useProxy: boolean = true): string => {
  const baseUrl = useProxy ? API_CONFIG.BASE_URL : 'https://adminapiprod.healthcoco.com';
  return `${baseUrl}${endpoint}`;
};

// Helper function to get the full API URL for dashboard endpoints
export const getDashboardApiUrl = (endpoint: string): string => {
  return buildApiUrl(`${API_CONFIG.ENDPOINTS.DASHBOARD_BASE}${endpoint}`);
};

// Unified API request helper with consistent authentication
export const makeApiRequest = async (
  endpoint: string, 
  accessToken: string, 
  params: Record<string, string | number> = {}
): Promise<any> => {
  const baseUrl = import.meta.env.DEV 
    ? '/api/healthco2admin/api/v1'  // Development: use Vite proxy
    : 'https://adminapiprod.healthcoco.com/healthco2admin/api/v1'; // Production: direct API URL

  // For development, we need to use window.location.origin as the base for relative URLs
  const fullUrl = import.meta.env.DEV 
    ? `${window.location.origin}${baseUrl}${endpoint}`
    : `${baseUrl}${endpoint}`;

  const url = new URL(fullUrl);
  
  // Add access token as query parameter (consistent with existing pattern)
  url.searchParams.append('access_token', accessToken);
  
  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });

  // Use API cache to prevent duplicate requests
  const cacheKey = apiCache.generateKey(url.toString(), {});
  
  return apiCache.get(cacheKey, async () => {
    console.log('Making API request to:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        errorDetails = errorData?.message || JSON.stringify(errorData);
      } catch {
        errorDetails = await response.text().catch(() => 'Unknown error');
      }
      
      console.error(`API Error ${response.status}:`, errorDetails);
      throw new Error(`HTTP ${response.status}: ${errorDetails}`);
    }

    const data = await response.json();
    console.log('✅ API Response data:', data);
    return data;
  });
};
