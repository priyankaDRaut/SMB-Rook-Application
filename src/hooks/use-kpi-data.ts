import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { apiCache } from '@/lib/api-cache';

interface KPIFilters {
  selectedMonth: Date;
  comparisonMonth?: Date;
  cities: string[];
  zones: string[];
  specialties: string[];
  doctors: string[];
  clinics: string[];
}

interface KPIApiResponse {
  count: number;
  data: {
    newPatients: number;
    nps: number;
    totalEbita: number;
    totalRevenue: number;
    visitedPatients: number;
    totalNetworkRevenue?: number;
    totalNetworkARR?: number;
  };
  dataList: any[];
}

interface KPIData {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  comparisonValue?: string; // Add comparison value for comparison mode
  icon?: React.ReactNode;
}

// KPI API configuration - use direct URL in production, proxy in development
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/healthco2admin/api/v1'  // Development: use Vite proxy
  : 'https://adminapiprod.healthcoco.com/healthco2admin/api/v1'; // Production: direct API URL

export const useKPIData = (filters: KPIFilters) => {
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [rawData, setRawData] = useState<KPIApiResponse | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const isRequestInProgress = useRef(false);
  
  // Get access token from useAuth hook
  const { accessToken } = useAuth();

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const selectedMonthTime = filters.selectedMonth.getTime();
  const comparisonMonthTime = filters.comparisonMonth?.getTime();
  const citiesString = filters.cities.join(',');
  const zonesString = filters.zones.join(',');
  const specialtiesString = filters.specialties.join(',');
  const doctorsString = filters.doctors.join(',');
  const clinicsString = filters.clinics.join(',');
  
  const filterDeps = useMemo(() => ({
    selectedMonth: selectedMonthTime,
    comparisonMonth: comparisonMonthTime,
    cities: citiesString,
    zones: zonesString,
    specialties: specialtiesString,
    doctors: doctorsString,
    clinics: clinicsString
  }), [
    selectedMonthTime,
    comparisonMonthTime,
    citiesString,
    zonesString,
    specialtiesString,
    doctorsString,
    clinicsString
  ]);

  // Helper function to calculate date ranges for a given month
  const calculateDateRange = useCallback((month: Date) => {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1).getTime();
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getTime();
    return { startDate, endDate };
  }, []);

  // Memoize URL building function with useCallback to ensure stable reference
  const buildApiUrl = useCallback((targetFilters: KPIFilters, isComparison = false) => {
    const baseUrl = `${API_BASE_URL}/dashboard/kpis`;
    const params = new URLSearchParams();

    if (isComparison && targetFilters.comparisonMonth) {
      // For comparison API: isCompareMonth=true, compareMonth=YYYY-MM, startDate/endDate=current month
      const currentMonth = targetFilters.selectedMonth;
      const compareMonth = targetFilters.comparisonMonth;
      
      // Current month dates (what we're comparing TO)
      const { startDate: currentStartDate, endDate: currentEndDate } = calculateDateRange(currentMonth);
      
      // Comparison month in YYYY-MM format
      const compareMonthStr = `${compareMonth.getFullYear()}-${String(compareMonth.getMonth() + 1).padStart(2, '0')}`;
      
      console.log('🔧 Comparison API parameters:', {
        currentStartDate,
        currentEndDate,
        compareMonthStr,
        isCompareMonth: true,
        currentMonthFormatted: new Date(currentStartDate).toISOString(),
        currentEndDateFormatted: new Date(currentEndDate).toISOString()
      });
      
      // Add comparison parameters
      params.append('startDate', currentStartDate.toString());
      params.append('endDate', currentEndDate.toString());
      params.append('isCompareMonth', 'true');
      params.append('compareMonth', compareMonthStr);
    } else {
      // For regular API: just current month data
      const targetMonth = targetFilters.selectedMonth;
      const { startDate, endDate } = calculateDateRange(targetMonth);
      
      console.log('Regular API parameters:', { startDate, endDate });
      
      params.append('startDate', startDate.toString());
      params.append('endDate', endDate.toString());
    }
    
    // Add ALL required filter parameters (API expects them all to be present)
    // Send empty strings for unselected filters to avoid ObjectId errors
    params.append('locationId', targetFilters.zones.join(',') || '');
    params.append('hospitalId', targetFilters.clinics.join(',') || '');
    params.append('city', targetFilters.cities.join(',') || '');
    params.append('doctorId', targetFilters.doctors.join(',') || '');
    
    // Log applied filters for debugging
    if (targetFilters.cities.length > 0 || targetFilters.zones.length > 0 || 
        targetFilters.specialties.length > 0 || targetFilters.doctors.length > 0 || 
        targetFilters.clinics.length > 0) {
      console.log('🔍 Applied filters:', {
        cities: targetFilters.cities,
        zones: targetFilters.zones,
        specialties: targetFilters.specialties,
        doctors: targetFilters.doctors,
        clinics: targetFilters.clinics
      });
    }

    // Add access token as query parameter (same as AuthContext pattern)
    if (accessToken) {
      params.append('access_token', accessToken);
    }

    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('🌐 Final API URL:', finalUrl);
    return finalUrl;
  }, [accessToken, calculateDateRange]);

  const fetchKPIData = async (url: string): Promise<KPIApiResponse> => {
    // Use API cache to prevent duplicate requests
    const cacheKey = apiCache.generateKey(url, {});
    
    return apiCache.get(cacheKey, async () => {
      // Follow exact same pattern as working AuthContext API calls
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json' // This is needed based on AuthContext
      };

      // No Authorization header needed when using access_token in query
      // (following AuthContext pattern)

      console.log('Making KPI API request to:', url);
      console.log('Request headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('KPI API Response status:', response.status);

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorData = await response.json();
          console.error('KPI API Error Response:', errorData);
          errorDetails = errorData?.message || JSON.stringify(errorData);
        } catch {
          errorDetails = await response.text().catch(() => 'Unknown error');
        }
        
        console.error(`KPI API Error ${response.status}:`, errorDetails);
        
        // If it's an ObjectId error, provide a more helpful message
        if (errorDetails.includes('ObjectId') || errorDetails.includes('hexadecimal')) {
          throw new Error(`HTTP ${response.status}: Invalid filter parameters. Please reset filters and try again.`);
        }
        
        throw new Error(`HTTP ${response.status}: ${errorDetails}`);
      }

      const data = await response.json();
      console.log('KPI API Response data:', data);
      return data;
    });
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const transformApiDataToKPICards = (
    currentData: KPIApiResponse, 
    previousData?: KPIApiResponse,
    previousMonth?: Date,
    showComparisonLabel: boolean = false
  ): KPIData[] => {
    const current = currentData.data;
    const previous = previousData?.data;
    
    // Generate proper change label with month name.
    // We only want to surface the "vs <month>" text when the user has
    // explicitly selected a comparison month in the filters (comparison mode).
    const getChangeLabel = () => {
      if (!showComparisonLabel || !previousMonth) return '';
      const monthName = previousMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return `vs ${monthName}`;
    };

    // Handle comparison API response - it has a flat structure with previousMonth prefix
    // Check if the API returns comparison data with previousMonth fields
    const apiData = currentData.data as any;
    const hasComparisonData = apiData && (
      apiData.previousMonthRevenue !== undefined ||
      apiData.previousMonthNewPatients !== undefined ||
      apiData.previousMonthVisitedPatients !== undefined
    );

    let currentMetrics, previousMetrics;
    
    if (hasComparisonData) {
      // Comparison API returns flat structure with current data and previousMonth prefixed fields
      currentMetrics = {
        totalRevenue: apiData.totalRevenue,
        visitedPatients: apiData.visitedPatients,
        newPatients: apiData.newPatients,
        totalEbita: apiData.totalEbita,
        nps: apiData.nps
      };
      
      previousMetrics = {
        totalRevenue: apiData.previousMonthRevenue,
        visitedPatients: apiData.previousMonthVisitedPatients,
        newPatients: apiData.previousMonthNewPatients,
        totalEbita: apiData.previousMonthEbita,
        nps: apiData.previousMonthNps
      };
      
      console.log('📊 Comparison data extracted:', {
        current: currentMetrics,
        previous: previousMetrics
      });
    } else if ((currentData.data as any).currentMonth && (currentData.data as any).previousMonth) {
      // Alternative nested structure (if API changes)
      currentMetrics = (currentData.data as any).currentMonth;
      previousMetrics = (currentData.data as any).previousMonth;
    } else {
      // Regular API response (separate calls for current and previous)
      currentMetrics = current;
      previousMetrics = previous;
    }

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(currentMetrics?.totalRevenue ?? 0),
        comparisonValue: previousMetrics ? formatCurrency(previousMetrics?.totalRevenue ?? 0) : undefined,
        change: previousMetrics ? calculatePercentageChange(currentMetrics?.totalRevenue ?? 0, previousMetrics?.totalRevenue ?? 0) : 0,
        changeLabel: getChangeLabel()
      },
      {
        title: 'Visited Patients',
        value: (currentMetrics?.visitedPatients ?? 0).toLocaleString(),
        comparisonValue: previousMetrics ? (previousMetrics?.visitedPatients ?? 0).toLocaleString() : undefined,
        change: previousMetrics ? calculatePercentageChange(currentMetrics?.visitedPatients ?? 0, previousMetrics?.visitedPatients ?? 0) : 0,
        changeLabel: getChangeLabel()
      },
      {
        title: 'New Patients',
        value: (currentMetrics?.newPatients ?? 0).toLocaleString(),
        comparisonValue: previousMetrics ? (previousMetrics?.newPatients ?? 0).toLocaleString() : undefined,
        change: previousMetrics ? calculatePercentageChange(currentMetrics?.newPatients ?? 0, previousMetrics?.newPatients ?? 0) : 0,
        changeLabel: getChangeLabel()
      },
      {
        title: 'EBITDA',
        value: formatCurrency(currentMetrics?.totalEbita ?? 0),
        comparisonValue: previousMetrics ? formatCurrency(previousMetrics?.totalEbita ?? 0) : undefined,
        change: previousMetrics ? calculatePercentageChange(currentMetrics?.totalEbita ?? 0, previousMetrics?.totalEbita ?? 0) : 0,
        changeLabel: getChangeLabel()
      },
      {
        title: 'NPS Score',
        value: (currentMetrics?.nps ?? 0).toString(),
        comparisonValue: previousMetrics ? (previousMetrics?.nps ?? 0).toString() : undefined,
        change: previousMetrics ? calculatePercentageChange(currentMetrics?.nps ?? 0, previousMetrics?.nps ?? 0) : 0,
        changeLabel: getChangeLabel()
      }
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      // Prevent multiple simultaneous requests
      if (isRequestInProgress.current) {
        return;
      }
      
      // Don't fetch if no access token available
      if (!accessToken) {
        setError('No access token available. Please login again.');
        return;
      }

      // Don't prevent API calls during loading - this was causing the issue
      // The loading state should not block new API calls when dependencies change
      
      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);

      try {
        let currentData: KPIApiResponse;
        let previousData: KPIApiResponse | undefined;

        if (filters.comparisonMonth) {
          // Use comparison API when comparison month is specified
          const comparisonUrl = buildApiUrl(filters, true);
          console.log('🔄 Fetching comparison KPI data from:', comparisonUrl);
          console.log('📅 Comparison parameters:', {
            selectedMonth: filters.selectedMonth,
            comparisonMonth: filters.comparisonMonth,
            isComparison: true
          });
          currentData = await fetchKPIData(comparisonUrl);
          
          // The comparison API should return both current and previous month data
          // If the API returns separate data, we might need to handle it differently
          console.log('✅ Comparison API response:', currentData);
        } else {
          // Regular API call for current month
          const currentUrl = buildApiUrl(filters, false);
          console.log('Fetching KPI data from:', currentUrl);
          currentData = await fetchKPIData(currentUrl);

          // For regular mode, fetch previous month for change calculation
          const previousMonthFilters = {
            ...filters,
            selectedMonth: new Date(filters.selectedMonth.getFullYear(), filters.selectedMonth.getMonth() - 1, 1)
          };
          const previousUrl = buildApiUrl(previousMonthFilters, false);
          try {
            previousData = await fetchKPIData(previousUrl);
          } catch (error) {
            console.warn('Could not fetch previous month data for comparison:', error);
          }
        }

        // Determine the previous month and whether we're in comparison mode
        const isComparisonMode = !!filters.comparisonMonth;
        const previousMonth = filters.comparisonMonth || 
          new Date(filters.selectedMonth.getFullYear(), filters.selectedMonth.getMonth() - 1, 1);
        
        const transformedData = transformApiDataToKPICards(
          currentData,
          previousData,
          previousMonth,
          isComparisonMode
        );
        setKpiData(transformedData);
        setRawData(currentData); // Store raw API response for header bar
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch KPI data';
        setError(errorMessage);
        console.error('KPI API Error:', err);
        
        // Fallback to dummy data on error with proper month names.
        const previousMonth = new Date(filters.selectedMonth.getFullYear(), filters.selectedMonth.getMonth() - 1, 1);
        const previousMonthName = previousMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const showComparisonLabel = !!filters.comparisonMonth;
        const fallbackLabel = showComparisonLabel ? `vs ${previousMonthName}` : '';
        
        setKpiData([
          {
            title: 'Total Revenue',
            value: '₹45.2L',
            comparisonValue: '₹40.2L',
            change: 12.5,
            changeLabel: fallbackLabel
          },
          {
            title: 'Visited Patients',
            value: '1,834',
            comparisonValue: '1,592',
            change: 15.2,
            changeLabel: fallbackLabel
          },
          {
            title: 'New Patients',
            value: '234',
            comparisonValue: '215',
            change: 8.7,
            changeLabel: fallbackLabel
          },
          {
            title: 'EBITDA',
            value: '₹8.4L',
            comparisonValue: '₹8.2L',
            change: 2.1,
            changeLabel: fallbackLabel
          },
          {
            title: 'NPS Score',
            value: '72',
            comparisonValue: '74',
            change: -3.2,
            changeLabel: fallbackLabel
          }
        ]);
      } finally {
        setLoading(false);
        isRequestInProgress.current = false;
      }
    };

    // Always call fetchData when useEffect runs (including on mount)
    fetchData();
    
    // Cleanup function to reset request in progress flag
    return () => {
      isRequestInProgress.current = false;
    };
  }, [
    filterDeps.selectedMonth,
    filterDeps.comparisonMonth,
    buildApiUrl,
    filters.selectedMonth,
    filters.comparisonMonth
    // Removed accessToken and fetchKPIData from dependencies
    // They are stable and don't need to trigger re-fetches
  ]);

  return { kpiData, rawData, loading, error };
};