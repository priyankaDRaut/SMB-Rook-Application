
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MonthPickerProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  className?: string;
}

export const MonthPicker = ({ selectedMonth, onMonthChange, className }: MonthPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewingYear, setViewingYear] = useState(selectedMonth.getFullYear());
  const [tempSelectedMonth, setTempSelectedMonth] = useState(selectedMonth);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewingYear, monthIndex, 1);
    setTempSelectedMonth(newDate);
  };

  const handleApply = () => {
    onMonthChange(tempSelectedMonth);
    setIsOpen(false);
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setViewingYear(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  // Reset temp selection when popover opens
  React.useEffect(() => {
    if (isOpen) {
      setTempSelectedMonth(selectedMonth);
      setViewingYear(selectedMonth.getFullYear());
    }
  }, [isOpen, selectedMonth]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-48 justify-start text-left font-normal bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {format(selectedMonth, 'MMMM yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="start">
        <div className="p-4">
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {viewingYear}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => {
              const isSelected = tempSelectedMonth.getMonth() === index && tempSelectedMonth.getFullYear() === viewingYear;
              const isCurrent = new Date().getMonth() === index && new Date().getFullYear() === viewingYear;
              
              return (
                <Button
                  key={month}
                  variant="ghost"
                  onClick={() => handleMonthSelect(index)}
                  className={cn(
                    "h-10 text-sm font-normal",
                    isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                    isCurrent && !isSelected && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {month.slice(0, 3)}
                </Button>
              );
            })}
          </div>

          {/* Apply Button */}
          <div className="flex justify-end pt-3 border-t mt-4">
            <Button onClick={handleApply} size="sm">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
