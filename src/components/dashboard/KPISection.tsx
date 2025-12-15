import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Loader2 } from 'lucide-react';
import { KPIFilters } from './KPIFilters';
import { ClinicPerformanceSection } from './ClinicPerformanceSection';
import { useKPIContext } from '@/contexts/KPIContext';
import { format } from 'date-fns';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon?: React.ReactNode;
}

interface ComparisonKPICardProps {
  title: string;
  currentValue: string;
  comparisonValue: string;
  currentMonth: string;
  comparisonMonth: string;
  percentageChange: number;
  icon?: React.ReactNode;
}

const KPICard = ({ title, value, change, changeLabel, icon }: KPICardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
        {icon && <div className="text-teal-600 dark:text-teal-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        {/* Only show percentage change text when a comparison label is provided.
            This ensures values like \"4.4% vs Oct 2025\" only appear in explicit
            comparison mode (when a comparison month is selected). */}
        {changeLabel && (
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span>{Math.abs(change).toFixed(1)}% {changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ComparisonKPICard = ({ title, currentValue, comparisonValue, currentMonth, comparisonMonth, percentageChange, icon }: ComparisonKPICardProps) => {
  const isPositive = percentageChange >= 0;
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
        {icon && <div className="text-teal-600 dark:text-teal-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{currentValue}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{currentMonth}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{comparisonValue}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{comparisonMonth}</div>
          </div>
        </div>
        <div className={`flex items-center justify-center text-sm mt-2 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          <span>{Math.abs(percentageChange).toFixed(1)}% {isPositive ? 'increase' : 'decrease'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface FilterState {
  selectedMonth: Date;
  cities: string[];
  zones: string[];
  specialties: string[];
  doctors: string[];
  clinics: string[];
  analysisType: 'monthly' | 'comparison';
  comparisonMonth?: Date;
}

export const KPISection = () => {
  // Get KPI data from context
  const { kpiData, loading, error, filters: contextFilters, setFilters: updateContextFilters } = useKPIContext();

  const handleFiltersChange = (newFilters: FilterState, isLoading?: boolean) => {
    // isLoading parameter is handled by ClinicPerformanceSection which shows the table loader
    updateContextFilters(newFilters);
  };

  const isComparisonMode = contextFilters.comparisonMonth !== undefined;

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Key Performance Indicators</h2>
          {isComparisonMode && contextFilters.comparisonMonth && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Comparison Mode: {format(contextFilters.selectedMonth, 'MMM yyyy')} vs {format(contextFilters.comparisonMonth, 'MMM yyyy')}
            </div>
          )}
        </div>
        
        {/* Filters */}
        <KPIFilters onFiltersChange={handleFiltersChange} />
        
        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400">
              <strong>Error loading KPI data:</strong> {error}
            </div>
            <div className="text-xs text-red-500 dark:text-red-400 mt-1">
              Showing fallback data. Please check your network connection or contact support.
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading KPI data...
            </div>
          </div>
        )}
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {isComparisonMode ? (
            // Use ComparisonKPICard for comparison mode
            kpiData.map((kpi) => {
              // Extract current and comparison values from the KPI data
              const currentValue = kpi.value;
              const comparisonValue = kpi.comparisonValue || 'N/A';
              const currentMonth = format(contextFilters.selectedMonth, 'MMM yyyy');
              const comparisonMonth = contextFilters.comparisonMonth 
                ? format(contextFilters.comparisonMonth, 'MMM yyyy')
                : 'N/A';
              
              return (
                <ComparisonKPICard
                  key={kpi.title}
                  title={kpi.title}
                  currentValue={currentValue}
                  comparisonValue={comparisonValue}
                  currentMonth={currentMonth}
                  comparisonMonth={comparisonMonth}
                  percentageChange={kpi.change}
                />
              );
            })
          ) : (
            // Use regular KPICard for normal mode
            kpiData.map((kpi) => (
              <KPICard 
                key={kpi.title} 
                {...kpi}
              />
            ))
          )}
        </div>

        {/* Month Data Label */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {isComparisonMode ? (
              <>
                All metrics above compare data between: 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> {format(contextFilters.selectedMonth, 'MMMM yyyy')}</span> and
                {contextFilters.comparisonMonth && (
                  <span className="font-semibold text-orange-600 dark:text-orange-400"> {format(contextFilters.comparisonMonth, 'MMMM yyyy')}</span>
                )}
              </>
            ) : (
              <>
                All metrics above reflect data for:  
                <span className="font-semibold text-blue-600 dark:text-blue-400">{format(contextFilters.selectedMonth, 'MMMM yyyy')}</span>
                {contextFilters.cities.length > 0 && (
                  <span className="ml-2 text-gray-400">| Cities: {contextFilters.cities.join(', ')}</span>
                )}
                {contextFilters.zones.length > 0 && (
                  <span className="ml-2 text-gray-400">| Zones: {contextFilters.zones.join(', ')}</span>
                )}
                {contextFilters.specialties.length > 0 && (
                  <span className="ml-2 text-gray-400">| Specialties: {contextFilters.specialties.join(', ')}</span>
                )}
              </>
            )}
          </p>
        </div>
      </section>

      {/* Clinic Performance Section - Now directly below KPI cards */}
      <section>
        <ClinicPerformanceSection selectedZone="All Zones" />
      </section>
    </div>
  );
};
