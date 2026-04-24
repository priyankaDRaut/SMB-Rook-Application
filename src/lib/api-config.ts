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
    // Revenue analytics detail endpoint (uses clinicId, startDate, endDate as query params)
    REVENUE_ANALYTICS: '/dashboard/revenue-analytics/detail',
    // Expense analytics detail endpoint (uses clinicId, startDate, endDate as query params)
    EXPENSE_ANALYTICS: '/dashboard/expense-analytics/detail',
    // Operational expense (OPEX) detail endpoint (uses clinicId, startDate, endDate as query params)
    OPEX_DETAIL: '/dashboard/opex-detail',
    // Paginated OPEX line items (uses locationId, fromDate, toDate, page, size)
    OPEX_EXPENSES_LIST: '/dashboard/expenses/opex',
    // Capex detail endpoint (uses clinicId, startDate, endDate as query params)
    CAPEX_DETAIL: '/dashboard/capex-detail',
    REVENUE_EXPENSE: '/dashboard/revenue-expense',
    FINANCIAL_OVERVIEW: '/dashboard/financial/overview',
    // v3 admin - update operatories for a location (clinic)
    UPDATE_OPERATORIES: '/healthco2admin/api/v3/admin/location/updateOperatories',
    // v1 - add/update zone for a city
    ZONE_ADD: '/healthco2admin/api/v1/appointment/zone/add',
    // v3 - list cities for zone dropdown
    CITIES: '/healthco2admin/api/v3/appointment/cities',
  }
};

/** City item from cities API (normalized for dropdown) */
export interface CityOption {
  id: string;
  name: string;
}

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

const getApiBaseForV3 = (): string =>
  import.meta.env.DEV
    ? `${window.location.origin}/api`
    : 'https://adminapiprod.healthcoco.com';

/**
 * Fetch cities list for zone dropdown (v3 appointment/cities).
 * @param accessToken - Auth token
 * @returns Normalized list of { id, name } for dropdown
 */
export const fetchCitiesApi = async (accessToken: string): Promise<CityOption[]> => {
  const base = getApiBaseForV3();
  const url = new URL(base + API_CONFIG.ENDPOINTS.CITIES);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('page', '0');
  url.searchParams.set('size', '0');
  url.searchParams.set('isDiscarded', 'false');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorData = await response.json();
      errorDetails = errorData?.message || JSON.stringify(errorData);
    } catch {
      errorDetails = await response.text().catch(() => 'Unknown error');
    }
    throw new Error('Failed to fetch cities: ' + errorDetails);
  }

  const data = await response.json();
  // Support common response shapes: content[], data[], dataList, or array root
  const rawList: any[] = Array.isArray(data)
    ? data
    : data?.content ?? data?.data ?? data?.dataList ?? [];
  return rawList.map((item: any, index: number) => {
    // API returns city name in "city" field (e.g. city: "Nagpur")
    const rawName =
      item?.city ??
      item?.name ??
      item?.cityName ??
      item?.city_name ??
      '';
    const name = typeof rawName === 'string' ? rawName : String(rawName ?? '');
    const rawId =
      item?.id ??
      item?.cityId ??
      item?.city_id ??
      item?._id ??
      item?.uid ??
      (name || String(index));
    const id = typeof rawId === 'string' ? rawId : String(rawId ?? '');
    return { id, name };
  }).filter((c) => c.name);
};

/**
 * Call the v3 update operatories API (POST with JSON body).
 * @param clinicId - Location/clinic ID
 * @param operatories - New operatories count
 * @param accessToken - Auth token
 */
export const updateOperatoriesApi = async (
  clinicId: string,
  operatories: number,
  accessToken: string
): Promise<void> => {
  const base = getApiBaseForV3();
  const url = new URL(
    base + API_CONFIG.ENDPOINTS.UPDATE_OPERATORIES + '/' + encodeURIComponent(clinicId)+
    '?operatories=' + operatories
  );
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body:JSON.stringify({})
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorData = await response.json();
      errorDetails = errorData?.message || JSON.stringify(errorData);
    } catch {
      errorDetails = await response.text().catch(() => 'Unknown error');
    }
    throw new Error('Failed to update operatories: ' + errorDetails);
  }
};

/**
 * Call the v1 zone add/update API (POST with JSON body).
 * @param cityId - City ID
 * @param zoneName - Zone name to set
 * @param accessToken - Auth token
 */
export const updateZoneApi = async (
  cityId: string,
  zoneName: string,
  accessToken: string
): Promise<void> => {
  const base = getApiBaseForV3();
  const url = new URL(base + API_CONFIG.ENDPOINTS.ZONE_ADD);
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ cityId, zoneName }),
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorData = await response.json();
      errorDetails = errorData?.message || JSON.stringify(errorData);
    } catch {
      errorDetails = await response.text().catch(() => 'Unknown error');
    }
    throw new Error('Failed to update zone: ' + errorDetails);
  }
};
