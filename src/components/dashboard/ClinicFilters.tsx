import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowRightLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addMonths, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterState, ClinicFiltersProps } from '@/types/dashboard';

export const ClinicFilters = ({ 
  onFiltersChange, 
  className = "", 
  showContextLabels = true,
  enableComparison = true,
  contextData 
}: ClinicFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    selectedMonth: new Date(),
    comparisonMonth: enableComparison ? new Date(new Date().setMonth(new Date().getMonth() - 1)) : new Date(new Date().setMonth(new Date().getMonth() - 1)),
    analysisType: 'monthly',
    isComparisonMode: false,
    clinicStatus: 'All',
    revenueCategory: 'All',
    operatoriesRange: 'All',
    clinicName: contextData?.clinicName || '',
    city: contextData?.city || '',
    zone: contextData?.zone || '',
    specialty: contextData?.specialty || '',
    doctor: contextData?.doctor || '',
  });

  const [tempMonths, setTempMonths] = useState({
    selectedMonth: filters.selectedMonth,
    comparisonMonth: filters.comparisonMonth
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Filter options
  const clinicStatuses = ['All', 'Breakeven', 'New', 'Underperforming', 'Top Performer'];
  const revenueCategories = ['All', 'Consultation', 'Treatment', 'Diagnostics', 'Combined'];
  const operatoriesRanges = ['All', '1-2', '3-4', '5-6', '7+'];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters, false);
  };

  const resetFilters = () => {
    const resetState: FilterState = {
      selectedMonth: new Date(),
      comparisonMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      analysisType: 'monthly',
      isComparisonMode: false,
      clinicStatus: 'All',
      revenueCategory: 'All',
      operatoriesRange: 'All',
      clinicName: contextData?.clinicName || '',
      city: contextData?.city || '',
      zone: contextData?.zone || '',
      specialty: contextData?.specialty || '',
      doctor: contextData?.doctor || '',
    };
    setFilters(resetState);
    setTempMonths({
      selectedMonth: resetState.selectedMonth,
      comparisonMonth: resetState.comparisonMonth
    });
    onFiltersChange(resetState, false);
  };

  const handleApplyDateRange = async () => {
    setIsApplying(true);
    const previousMonth = new Date(tempMonths.selectedMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const updatedFilters = {
      ...filters,
      selectedMonth: tempMonths.selectedMonth,
      // When comparison UI is disabled, still keep a computed previous month for internal "vs previous" KPIs.
      comparisonMonth: enableComparison
        ? (filters.isComparisonMode ? tempMonths.comparisonMonth : null)
        : previousMonth,
      isComparisonMode: enableComparison ? filters.isComparisonMode : false,
      analysisType: enableComparison ? (filters.analysisType ?? 'monthly') : 'monthly'
    };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters, true);
    setIsDatePickerOpen(false);
    
    // Reset loading state after a short delay to allow parent to handle it
    setTimeout(() => {
      setIsApplying(false);
    }, 100);
  };

  const swapMonths = () => {
    setTempMonths({
      selectedMonth: tempMonths.comparisonMonth,
      comparisonMonth: tempMonths.selectedMonth
    });
  };

  const getDisplayText = () => {
    if (!enableComparison || !filters.isComparisonMode) {
      return format(filters.selectedMonth, 'MMM yyyy');
    } else {
      return `${format(filters.selectedMonth, 'MMM yyyy')} vs ${format(filters.comparisonMonth || new Date(), 'MMM yyyy')}`;
    }
  };

  // Month picker component
  const MonthPicker = ({ 
    selectedDate, 
    onDateChange, 
    title 
  }: { 
    selectedDate: Date; 
    onDateChange: (date: Date) => void; 
    title: string;
  }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-center">{title}</h4>
          <div className="flex items-center justify-between">
            <Button
          variant="ghost" 
              size="sm"
          onClick={() => onDateChange(subMonths(selectedDate, 1))}
            >
          <ChevronLeft className="h-4 w-4" />
            </Button>
        <div className="text-center">
          <div className="font-medium">{format(selectedDate, 'MMMM')}</div>
          <div className="text-sm text-muted-foreground">{format(selectedDate, 'yyyy')}</div>
          </div>
                    <Button
          variant="ghost" 
          size="sm" 
          onClick={() => onDateChange(addMonths(selectedDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
                      </div>
  );

  return (
    <Card className="bg-background">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Date Range Selector */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 min-w-[180px]">
                <CalendarIcon className="mr-2 h-3 w-3" />
                {getDisplayText()}
                    </Button>
                  </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              {enableComparison ? (
                <Tabs 
                  value={filters.isComparisonMode ? 'comparison' : 'monthly'} 
                  onValueChange={(value) => {
                    const isComparison = value === 'comparison';
                    setFilters(prev => ({ 
                      ...prev, 
                      isComparisonMode: isComparison,
                      analysisType: value as 'monthly' | 'comparison',
                      // Ensure comparisonMonth is set when switching to comparison mode
                      comparisonMonth: isComparison && !prev.comparisonMonth 
                        ? tempMonths.comparisonMonth 
                        : prev.comparisonMonth
                    }));
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
                    <TabsTrigger value="comparison">Compare Months</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="monthly" className="p-6">
                    <div className="space-y-4">
                      <MonthPicker
                        selectedDate={tempMonths.selectedMonth}
                        onDateChange={(date) => setTempMonths(prev => ({ ...prev, selectedMonth: date }))}
                        title="Select Month for Analysis"
                      />
                      <Button 
                        onClick={handleApplyDateRange} 
                        className="w-full"
                        disabled={isApplying}
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply'
                        )}
                      </Button>
                </div>
                  </TabsContent>
                  
                  <TabsContent value="comparison" className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <MonthPicker
                          selectedDate={tempMonths.selectedMonth}
                          onDateChange={(date) => setTempMonths(prev => ({ ...prev, selectedMonth: date }))}
                          title="Current Month"
                        />
                        <MonthPicker
                          selectedDate={tempMonths.comparisonMonth}
                          onDateChange={(date) => setTempMonths(prev => ({ ...prev, comparisonMonth: date }))}
                          title="Compare With"
                        />
                </div>
                      <div className="flex justify-center">
                        <Button variant="ghost" size="sm" onClick={swapMonths} className="gap-2">
                          <ArrowRightLeft className="h-4 w-4" />
                          Swap Months
                        </Button>
                      </div>
                      <Button 
                        onClick={handleApplyDateRange} 
                        className="w-full"
                        disabled={isApplying}
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply Comparison'
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="p-6">
                  <div className="space-y-4">
                    <MonthPicker
                      selectedDate={tempMonths.selectedMonth}
                      onDateChange={(date) => setTempMonths(prev => ({ ...prev, selectedMonth: date }))}
                      title="Select Month for Analysis"
                    />
                    <Button 
                      onClick={handleApplyDateRange} 
                      className="w-full"
                      disabled={isApplying}
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                </div>
              )}
                    </PopoverContent>
                  </Popover>

          {/* HIDDEN FILTERS - Commented out as per requirement to show only date picker and reset button */}
          {/* Clinic Status */}
          {/* <Select
                  value={filters.clinicStatus}
                  onValueChange={(value) => updateFilters({ clinicStatus: value })}
                >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}

          {/* Revenue Category */}
          {/* <Select
                  value={filters.revenueCategory}
                  onValueChange={(value) => updateFilters({ revenueCategory: value })}
                >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Revenue" />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}

          {/* Operatories */}
          {/* <Select
                  value={filters.operatoriesRange}
                  onValueChange={(value) => updateFilters({ operatoriesRange: value })}
                >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Operatories" />
                  </SelectTrigger>
                  <SelectContent>
                    {operatoriesRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}

          {/* Reset Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="h-8"
                    >
            Reset
          </Button>
            </div>
        </CardContent>
      </Card>
  );
};


export type { FilterState };
 