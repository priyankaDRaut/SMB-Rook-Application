
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useClinicsList } from '@/hooks/use-clinics-list';
import { useKPIContext } from '@/contexts/KPIContext';
import { format } from 'date-fns';

interface ClinicPerformanceSectionProps {
  selectedZone?: string;
}

export const ClinicPerformanceSection = ({ selectedZone }: ClinicPerformanceSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [profitabilityFilter, setProfitabilityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  
  // Get date filters from KPI context to sync with KPI API
  const { filters: kpiFilters } = useKPIContext();
  
  // Calculate date range from KPI context selectedMonth - same as KPI API
  const { startDate, endDate, currentMonth } = useMemo(() => {
    const selectedMonth = kpiFilters.selectedMonth;
    const year = selectedMonth.getUTCFullYear();
    const monthIndex = selectedMonth.getUTCMonth();

    // Use GMT/UTC-based timestamps for API date range
    const startOfMonth = Date.UTC(year, monthIndex, 1);
    // End of month at 11:59 PM GMT
    const endOfMonth = Date.UTC(year, monthIndex + 1, 0, 23, 59, 0, 0);

    return {
      startDate: startOfMonth,
      endDate: endOfMonth,
      currentMonth: format(selectedMonth, 'MMM yyyy')
    };
  }, [kpiFilters.selectedMonth]); // Use selectedMonth from KPI context

  // Memoize filters object to prevent creating new object reference on every render
  const clinicsFilters = useMemo(() => ({
    startDate,
    endDate,
    zone: zoneFilter === 'All Zones' ? undefined : zoneFilter,
    specialty: specialtyFilter === 'All Specialties' ? undefined : specialtyFilter,
    status: profitabilityFilter === 'All' ? undefined : profitabilityFilter
  }), [startDate, endDate, zoneFilter, specialtyFilter, profitabilityFilter]);

  // Use the clinics list hook to get real data
  const { clinicsData, loading, error, isUsingFallbackData } = useClinicsList(clinicsFilters);

  // Use real API data instead of hardcoded data
  // API returns data in dataList field, not data field
  const clinicData = clinicsData?.dataList || [];

  // Check if API is already filtering by specialty
  const isSpecialtyFilteredByAPI = specialtyFilter !== 'All Specialties' && clinicsFilters.specialty !== undefined;

  // Debug logging when specialty filter is active
  if (isSpecialtyFilteredByAPI && clinicData.length > 0) {
    console.log('🔍 Specialty filter active - API filtered data:', {
      specialtyFilter,
      apiSpecialty: clinicsFilters.specialty,
      clinicCount: clinicData.length,
      firstClinic: clinicData[0] ? {
        name: clinicData[0].clinicName,
        specialty: clinicData[0].specialty,
        hasSpecialtyField: 'specialty' in (clinicData[0] || {})
      } : null
    });
  }

  const filteredData = clinicData.filter(clinic => {
    const matchesSearch = clinic.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clinic.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'All Cities' || clinic.city === cityFilter;
    // Zone filter is not available in API response, so always match
    const matchesZone = zoneFilter === 'All Zones';
    // If API is already filtering by specialty, trust the API data (don't filter again)
    // Otherwise, do client-side filtering with case-insensitive comparison
    const matchesSpecialty = isSpecialtyFilteredByAPI || 
                             specialtyFilter === 'All Specialties' || 
                             (clinic.specialty && clinic.specialty.toLowerCase() === specialtyFilter.toLowerCase());
    // Profitability filter based on profit percentage
    const ebitda = (clinic.revenue || 0) - (clinic.expenses || 0);
    const matchesProfitability = profitabilityFilter === 'All' || 
      (profitabilityFilter === 'Yes' && ebitda > 0) ||
      (profitabilityFilter === 'Breakeven' && ebitda === 0) ||
      (profitabilityFilter === 'No' && ebitda < 0);
    
    return matchesSearch && matchesCity && matchesZone && matchesSpecialty && matchesProfitability;
  });

  // Debug logging for filtered results
  if (isSpecialtyFilteredByAPI) {
    console.log('📊 After client-side filtering:', {
      originalCount: clinicData.length,
      filteredCount: filteredData.length,
      filters: {
        searchTerm,
        cityFilter,
        zoneFilter,
        specialtyFilter,
        profitabilityFilter
      }
    });
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const resetFilters = () => {
    setSearchTerm('');
    setZoneFilter('All Zones');
    setSpecialtyFilter('All Specialties');
    setProfitabilityFilter('All');
    setCurrentPage(1);
  };

  const handleClinicClick = (clinicId: string) => {
    navigate(`/clinics/${clinicId}`);
  };

  const getSpecialtyBadge = (specialty: string) => {
    return (
      <Badge className="bg-[#DCEBFE] text-blue-800 dark:bg-[#DCEBFE] dark:text-blue-800">
        {specialty}
      </Badge>
    );
  };

  // Show loading state
  if (loading && !clinicsData) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Loading Clinic Data</h3>
                <p className="text-muted-foreground">Please wait while we fetch the clinic information...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error && !clinicsData) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-600">Error Loading Data</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardContent className="p-6">
        {/* Show data source indicator */}
        {isUsingFallbackData && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
            Using Mock Data
          </div>
        )}
        {/* Table Header with Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clinics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2">
              <Select 
                value={cityFilter} 
                onValueChange={(value) => {
                  setCityFilter(value);
                  // Reset zone filter when city is changed to "All Cities"
                  if (value === 'All Cities') {
                    setZoneFilter('All Zones');
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Cities">All Cities</SelectItem>
                  <SelectItem value="Nagpur">Nagpur</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zone Filter - Enabled only when a city is selected */}
            <div className="flex items-center gap-2">
              <Select 
                value={zoneFilter} 
                onValueChange={setZoneFilter}
                disabled={cityFilter === 'All Cities'}
              >
                <SelectTrigger className="w-40" disabled={cityFilter === 'All Cities'}>
                  <SelectValue placeholder="Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Zones">All Zones</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="East">East</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specialty Filter */}
            <div className="flex items-center gap-2">
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Specialties">All Specialties</SelectItem>
                  <SelectItem value="General Dentistry">General Dentistry</SelectItem>
                  <SelectItem value="Orthodontics">Orthodontics</SelectItem>
                  <SelectItem value="Endodontics">Endodontics</SelectItem>
                  <SelectItem value="Periodontics">Periodontics</SelectItem>
                  <SelectItem value="Prosthodontics">Prosthodontics</SelectItem>
                  <SelectItem value="Oral Surgery">Oral Surgery</SelectItem>
                  <SelectItem value="Pediatric Dentistry">Pediatric Dentistry</SelectItem>
                  <SelectItem value="Cosmetic Dentistry">Cosmetic Dentistry</SelectItem>
                  <SelectItem value="Implantology">Implantology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Select value={profitabilityFilter} onValueChange={setProfitabilityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="Breakeven">Breakeven</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Button */}
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="whitespace-nowrap hover:bg-muted"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <div className="relative">
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading clinic data...</p>
                </div>
              </div>
            )}
            
            {/* Table Headers */}
            <div className="grid grid-cols-7 gap-2 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground">
              <div className="col-span-2">CLINIC NAME</div>
              <div className="text-center">REVENUE<br/>({currentMonth})</div>
              <div className="text-center">EXPENSE<br/>({currentMonth})</div>
              <div className="text-center">EBITDA<br/>({currentMonth})</div>
              <div className="text-center">BREAKEVEN<br/>({currentMonth})</div>
              <div className="text-center">DOCTOR</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {paginatedData.length > 0 ? paginatedData.map((clinic, index) => {
                // Calculate EBITDA (assuming expenses include all operational costs)
                const ebitda = clinic.revenue - clinic.expenses;
                
                // Determine breakeven status
                const getBreakevenStatus = () => {
                  if (ebitda > 0) {
                    return { status: 'Yes', color: 'text-gray-700 bg-blue-100 rounded-full px-3 py-1 text-sm font-medium shadow-sm' };
                  } else if (ebitda === 0) {
                    return { status: 'Breakeven', color: 'text-gray-700 bg-blue-100 rounded-full px-3 py-1 text-sm font-medium shadow-sm' };
                  } else {
                    return { status: 'No', color: 'text-gray-700 bg-blue-100 rounded-full px-3 py-1 text-sm font-medium shadow-sm' };
                  }
                };
                
                const breakevenInfo = getBreakevenStatus();
                
                return (
                  <div 
                    key={clinic.id} 
                    className={cn(
                      "grid grid-cols-7 gap-2 px-4 py-4 cursor-pointer transition-all duration-200",
                      "hover:bg-muted/50",
                      "group relative"
                    )}
                    onClick={() => handleClinicClick(clinic.id)}
                  >
                    <div className="col-span-2">
                      <span className="font-medium text-primary group-hover:text-primary/80 transition-colors">
                        {clinic.clinicName}
                      </span>
                    </div>
                    <div className="font-semibold text-foreground text-center">₹{(clinic.revenue / 100000).toFixed(2)}L</div>
                    <div className="font-semibold text-foreground text-center">₹{(clinic.expenses / 100000).toFixed(2)}L</div>
                    <div className={cn(
                      "font-semibold text-center",
                      ebitda >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      ₹{(ebitda / 100000).toFixed(2)}L
                    </div>
                    <div className="text-center">
                      <div className={cn("inline-block", breakevenInfo.color)}>
                        {breakevenInfo.status}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground text-center">Dr. {clinic.doctorName}</div>
                  </div>
                );
              }) : (
                <div className="col-span-7 py-8 text-center text-muted-foreground">
                  <p>No clinic data available</p>
                  <p className="text-sm">Data will appear when API provides this information</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
