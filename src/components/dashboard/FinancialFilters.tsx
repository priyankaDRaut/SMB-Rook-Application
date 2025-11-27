import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowRightLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addMonths, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FinancialFiltersProps {
  onFiltersChange: (filters: {
    selectedMonth: Date;
    comparisonMonth?: Date;
    analysisType: 'monthly' | 'comparison';
    category: string;
    type: string;
    zone: string;
    clinic: string;
  }, isLoading?: boolean) => void;
}

export const FinancialFilters = ({ onFiltersChange }: FinancialFiltersProps) => {
  const [filters, setFilters] = useState({
    selectedMonth: new Date(),
    comparisonMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    analysisType: 'monthly' as 'monthly' | 'comparison',
    category: 'All',
    type: 'All',
    zone: 'All',
    clinic: 'All'
  });

  const [tempMonths, setTempMonths] = useState({
    selectedMonth: filters.selectedMonth,
    comparisonMonth: filters.comparisonMonth
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Filter options
  const categories = ['All', 'Revenue', 'Expenses', 'EBITDA', 'Net Profit'];
  const types = ['All', 'Clinical', 'Non-Clinical', 'Marketing', 'Operations'];
  const zones = ['All', 'North', 'South', 'East', 'West'];
  const clinics = ['All', 'Andheri', 'Bandra', 'Pune Central', 'Koramangala', 'Whitefield'];

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters, false);
  };

  const resetFilters = () => {
    const resetState = {
      selectedMonth: new Date(),
      comparisonMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      analysisType: 'monthly' as 'monthly' | 'comparison',
      category: 'All',
      type: 'All',
      zone: 'All',
      clinic: 'All'
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
              <Tabs 
                value={filters.analysisType} 
                onValueChange={(value) => {
                  const newAnalysisType = value as 'monthly' | 'comparison';
                  setFilters(prev => ({ 
                    ...prev, 
                    analysisType: newAnalysisType,
                    // Ensure comparisonMonth is set when switching to comparison mode
                    comparisonMonth: newAnalysisType === 'comparison' && !prev.comparisonMonth 
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
            </PopoverContent>
          </Popover>

          {/* Category Filter */}
          <Select
            value={filters.category}
            onValueChange={(value) => updateFilters({ category: value })}
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={filters.type}
            onValueChange={(value) => updateFilters({ type: value })}
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Zone Filter */}
          <Select
            value={filters.zone}
            onValueChange={(value) => updateFilters({ zone: value })}
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clinic Filter */}
          <Select
            value={filters.clinic}
            onValueChange={(value) => updateFilters({ clinic: value })}
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Clinic" />
            </SelectTrigger>
            <SelectContent>
              {clinics.map((clinic) => (
                <SelectItem key={clinic} value={clinic}>
                  {clinic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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