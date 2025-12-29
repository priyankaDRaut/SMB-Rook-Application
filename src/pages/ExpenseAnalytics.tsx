import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ExpenseAnalyticsCard } from '@/components/dashboard/ExpenseAnalyticsCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useClinic } from '@/contexts/ClinicContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';

export const ExpenseAnalytics = () => {
  const navigate = useNavigate();
  const { clinicName } = useParams<{ clinicName: string }>();
  const { setCurrentClinic } = useClinic();
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    // Anchor at first day of the current month (UTC) to avoid timezone drift.
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });
  const [tempMonth, setTempMonth] = useState<Date>(selectedMonth);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Fetch clinic details to get the clinic name for navbar
  const memoizedDateRange = useMemo(() => {
    const year = selectedMonth.getUTCFullYear();
    const monthIndex = selectedMonth.getUTCMonth();

    // Use GMT/UTC-based timestamps for API
    const startOfMonth = Date.UTC(year, monthIndex, 1, 0, 0, 0, 0);
    // End of month at 18:29 UTC (per backend expectation)
    const endOfMonth = Date.UTC(year, monthIndex + 1, 0, 18, 29, 0, 0);
    
    return {
      startDate: startOfMonth,
      endDate: endOfMonth
    };
  }, [selectedMonth]);

  const dateRangeForCard: DateRange = useMemo(() => {
    const year = selectedMonth.getUTCFullYear();
    const monthIndex = selectedMonth.getUTCMonth();
    const from = new Date(Date.UTC(year, monthIndex, 1));
    const to = new Date(Date.UTC(year, monthIndex + 1, 0));
    return { from, to };
  }, [selectedMonth]);

  const handleApplyMonth = () => {
    setSelectedMonth(new Date(Date.UTC(tempMonth.getUTCFullYear(), tempMonth.getUTCMonth(), 1)));
    setIsMonthPickerOpen(false);
  };

  const { clinicDetailsData } = useClinicDetails({
    clinicId: clinicName || '',
    startDate: memoizedDateRange.startDate,
    endDate: memoizedDateRange.endDate
  });

  const clinic = clinicDetailsData?.data;

  // Update clinic context when data is loaded
  useEffect(() => {
    if (clinic && clinic.clinicName) {
      setCurrentClinic({
        clinicId: clinic.clinicId,
        clinicName: clinic.clinicName,
        revenue: clinic.revenue,
        netIncome: clinic.netIncome
      });
    }
  }, [clinic, setCurrentClinic]);

  // Cleanup clinic context when component unmounts
  useEffect(() => {
    return () => {
      setCurrentClinic(null);
    };
  }, [setCurrentClinic]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => navigate(`/clinics/${clinicName}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clinic
          </Button>
          <h1 className="text-2xl font-bold text-blue-900">Expense Analytics</h1>
        </div>
        <Popover
          open={isMonthPickerOpen}
          onOpenChange={(open) => {
            setIsMonthPickerOpen(open);
            if (open) setTempMonth(selectedMonth);
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 min-w-[180px] justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedMonth, 'MMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-3">
              <div className="text-sm font-medium text-center">Select month</div>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempMonth((prev) => subMonths(prev, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <div className="font-medium">{format(tempMonth, 'MMMM')}</div>
                  <div className="text-sm text-muted-foreground">{format(tempMonth, 'yyyy')}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempMonth((prev) => addMonths(prev, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleApplyMonth} className="w-full">
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <ExpenseAnalyticsCard dateRange={dateRangeForCard} />
    </div>
  );
}; 