import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowRightLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addMonths, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterState, ClinicFiltersProps } from '@/types/dashboard';
import {
  aprilFirstOfFinancialYearContaining,
  formatFinancialYearAprMarLabel,
} from '@/lib/financial-year';

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
  const [isQuarterPickerOpen, setIsQuarterPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [isFinancialYearPickerOpen, setIsFinancialYearPickerOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [tempQuarterDate, setTempQuarterDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [tempYearDate, setTempYearDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [tempFinancialYearDate, setTempFinancialYearDate] = useState(
    aprilFirstOfFinancialYearContaining(new Date())
  );

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
    setTempQuarterDate(new Date(resetState.selectedMonth.getFullYear(), 0, 1));
    setTempYearDate(new Date(resetState.selectedMonth.getFullYear(), 0, 1));
    setTempFinancialYearDate(aprilFirstOfFinancialYearContaining(resetState.selectedMonth));
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
      analysisType: enableComparison
        ? filters.isComparisonMode
          ? ('comparison' as const)
          : ('monthly' as const)
        : ('monthly' as const),
    };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters, true);
    setIsDatePickerOpen(false);
    
    // Reset loading state after a short delay to allow parent to handle it
    setTimeout(() => {
      setIsApplying(false);
    }, 100);
  };

  const handleApplyQuarterly = async () => {
    setIsApplying(true);
    const quarterStartMonth = Math.floor(tempQuarterDate.getMonth() / 3) * 3;
    const previousPeriod = new Date(tempQuarterDate.getFullYear(), quarterStartMonth - 3, 1);
    const updatedFilters = {
      ...filters,
      analysisType: 'quarterly' as const,
      selectedMonth: new Date(tempQuarterDate.getFullYear(), quarterStartMonth, 1),
      comparisonMonth: enableComparison ? filters.comparisonMonth : previousPeriod,
      isComparisonMode: enableComparison ? filters.isComparisonMode : false
    };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters, true);
    setIsQuarterPickerOpen(false);
    setTimeout(() => setIsApplying(false), 100);
  };

  const handleApplyYearly = async () => {
    setIsApplying(true);
    const selectedYearDate = new Date(tempYearDate.getFullYear(), 0, 1);
    const previousYear = new Date(tempYearDate.getFullYear() - 1, 0, 1);
    const updatedFilters = {
      ...filters,
      analysisType: 'yearly' as const,
      selectedMonth: selectedYearDate,
      comparisonMonth: enableComparison ? filters.comparisonMonth : previousYear,
      isComparisonMode: enableComparison ? filters.isComparisonMode : false
    };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters, true);
    setIsYearPickerOpen(false);
    setTimeout(() => setIsApplying(false), 100);
  };

  const handleApplyFinancialYear = async () => {
    setIsApplying(true);
    const fyAprilFirst = new Date(tempFinancialYearDate.getFullYear(), 3, 1);
    const previousFY = new Date(fyAprilFirst.getFullYear() - 1, 3, 1);
    const updatedFilters = {
      ...filters,
      analysisType: 'financial_year' as const,
      selectedMonth: fyAprilFirst,
      comparisonMonth: enableComparison ? filters.comparisonMonth : previousFY,
      isComparisonMode: enableComparison ? filters.isComparisonMode : false,
    };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters, true);
    setIsFinancialYearPickerOpen(false);
    setTimeout(() => setIsApplying(false), 100);
  };

  const swapMonths = () => {
    setTempMonths({
      selectedMonth: tempMonths.comparisonMonth,
      comparisonMonth: tempMonths.selectedMonth
    });
  };

  const getDisplayText = () => {
    if (filters.analysisType === 'quarterly') {
      const quarter = Math.floor(filters.selectedMonth.getMonth() / 3) + 1;
      const quarterLabels = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
      return `Q${quarter} (${quarterLabels[quarter - 1]}) ${format(filters.selectedMonth, 'yyyy')}`;
    }
    if (filters.analysisType === 'yearly') {
      return format(filters.selectedMonth, 'yyyy');
    }
    if (filters.analysisType === 'financial_year') {
      return formatFinancialYearAprMarLabel(
        aprilFirstOfFinancialYearContaining(filters.selectedMonth)
      );
    }
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

  const YearPicker = ({
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
        <Button variant="ghost" size="sm" type="button" onClick={() => onDateChange(new Date(selectedDate.getFullYear() - 1, 0, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <div className="font-medium">{format(selectedDate, 'yyyy')}</div>
        </div>
        <Button variant="ghost" size="sm" type="button" onClick={() => onDateChange(new Date(selectedDate.getFullYear() + 1, 0, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const QuarterPicker = ({
    selectedDate,
    onDateChange,
    title
  }: {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    title: string;
  }) => {
    const quarter = Math.floor(selectedDate.getMonth() / 3) + 1;
    const quarterLabels = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-center">{title}</h4>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" type="button" onClick={() => onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 3, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="font-medium">{`Q${quarter} (${quarterLabels[quarter - 1]})`}</div>
            <div className="text-sm text-muted-foreground">{format(selectedDate, 'yyyy')}</div>
          </div>
          <Button variant="ghost" size="sm" type="button" onClick={() => onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 3, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const FinancialYearPicker = ({
    selectedDate,
    onDateChange,
    title,
  }: {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    title: string;
  }) => {
    const y = selectedDate.getFullYear();
    const label = formatFinancialYearAprMarLabel(new Date(y, 3, 1));

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-center">{title}</h4>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onDateChange(new Date(y - 1, 3, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center px-1">
            <div className="font-medium text-sm leading-snug">{label}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onDateChange(new Date(y + 1, 3, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

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

          {!enableComparison && (
            <>
              <Popover open={isQuarterPickerOpen} onOpenChange={setIsQuarterPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={filters.analysisType === 'quarterly' ? 'default' : 'ghost'}
                    size="sm"
                    type="button"
                    onClick={() => {
                      const quarterStartMonth = Math.floor(filters.selectedMonth.getMonth() / 3) * 3;
                      setTempQuarterDate(new Date(filters.selectedMonth.getFullYear(), quarterStartMonth, 1));
                    }}
                    className="h-8"
                  >
                    Quarterly
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-6" align="start">
                  <div className="space-y-4">
                    <QuarterPicker selectedDate={tempQuarterDate} onDateChange={setTempQuarterDate} title="Select Quarter for Analysis" />
                    <Button onClick={handleApplyQuarterly} className="w-full" disabled={isApplying}>
                      {isApplying ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Applying...</>) : 'Apply'}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover open={isYearPickerOpen} onOpenChange={setIsYearPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={filters.analysisType === 'yearly' ? 'default' : 'ghost'}
                    size="sm"
                    type="button"
                    onClick={() => setTempYearDate(new Date(filters.selectedMonth.getFullYear(), 0, 1))}
                    className="h-8"
                  >
                    Yearly
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-6" align="start">
                  <div className="space-y-4">
                    <YearPicker selectedDate={tempYearDate} onDateChange={setTempYearDate} title="Select Year for Analysis" />
                    <Button onClick={handleApplyYearly} className="w-full" disabled={isApplying}>
                      {isApplying ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Applying...</>) : 'Apply'}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover open={isFinancialYearPickerOpen} onOpenChange={setIsFinancialYearPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={filters.analysisType === 'financial_year' ? 'default' : 'ghost'}
                    size="sm"
                    type="button"
                    onClick={() =>
                      setTempFinancialYearDate(
                        filters.analysisType === 'financial_year'
                          ? new Date(filters.selectedMonth.getFullYear(), 3, 1)
                          : aprilFirstOfFinancialYearContaining(filters.selectedMonth)
                      )
                    }
                    className="h-8"
                  >
                    {formatFinancialYearAprMarLabel(
                      aprilFirstOfFinancialYearContaining(filters.selectedMonth)
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-6" align="start">
                  <div className="space-y-4">
                    <FinancialYearPicker
                      selectedDate={tempFinancialYearDate}
                      onDateChange={setTempFinancialYearDate}
                      title="Select Financial Year"
                    />
                    <Button onClick={handleApplyFinancialYear} className="w-full" disabled={isApplying}>
                      {isApplying ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Applying...</>) : 'Apply'}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}

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
 