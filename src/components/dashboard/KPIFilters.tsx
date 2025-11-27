import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowRightLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KPIFiltersProps {
  onFiltersChange: (filters: {
    selectedMonth: Date;
    comparisonMonth?: Date;
    analysisType: 'monthly' | 'comparison';
    cities: string[];
    zones: string[];
    specialties: string[];
    doctors: string[];
    clinics: string[];
  }, isLoading?: boolean) => void;
}

export const KPIFilters = ({ onFiltersChange }: KPIFiltersProps) => {
  const [filters, setFilters] = useState({
    selectedMonth: new Date(),
    comparisonMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    analysisType: 'monthly' as 'monthly' | 'comparison',
    cities: [] as string[],
    zones: [] as string[],
    specialties: [] as string[],
    doctors: [] as string[],
    clinics: [] as string[]
  });

  const [tempMonths, setTempMonths] = useState({
    selectedMonth: filters.selectedMonth,
    comparisonMonth: filters.comparisonMonth
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const resetFilters = () => {
    const resetState = {
      selectedMonth: new Date(),
      comparisonMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      analysisType: 'monthly' as 'monthly' | 'comparison',
      cities: [] as string[],
      zones: [] as string[],
      specialties: [] as string[],
      doctors: [] as string[],
      clinics: [] as string[]
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
    const updatedFilters = {
      ...filters,
      selectedMonth: tempMonths.selectedMonth,
      comparisonMonth: filters.analysisType === 'comparison' ? tempMonths.comparisonMonth : undefined
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
    if (filters.analysisType === 'monthly') {
      return format(filters.selectedMonth, 'MMM yyyy');
    } else {
      const comparisonMonth = filters.comparisonMonth || tempMonths.comparisonMonth || new Date(new Date().setMonth(new Date().getMonth() - 1));
      return `${format(filters.selectedMonth, 'MMM yyyy')} vs ${format(comparisonMonth, 'MMM yyyy')}`;
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
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDateChange(subMonths(selectedDate, 1));
            }}
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
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDateChange(addMonths(selectedDate, 1));
            }}
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
              <Tabs 
                value={filters.analysisType} 
                onValueChange={(value) => {
                  const newAnalysisType = value as 'monthly' | 'comparison';
                  const updatedFilters = { 
                    ...filters, 
                    analysisType: newAnalysisType,
                    // Ensure comparisonMonth is set when switching to comparison mode
                    comparisonMonth: newAnalysisType === 'comparison' && !filters.comparisonMonth 
                      ? tempMonths.comparisonMonth 
                      : filters.comparisonMonth
                  };
                  setFilters(updatedFilters);
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
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleApplyDateRange();
                      }} 
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          swapMonths();
                        }} 
                        className="gap-2"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                        Swap Months
                      </Button>
                      </div>
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleApplyDateRange();
                      }} 
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
                  </PopoverContent>
                </Popover>

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
