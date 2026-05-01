import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { RevenueAnalyticsCard } from '@/components/dashboard/RevenueAnalyticsCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useClinic } from '@/contexts/ClinicContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

function parseQueryDate(param: string | null): Date | undefined {
  if (!param) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(param);
  if (!match) return undefined;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return undefined;
  return new Date(Date.UTC(year, monthIndex, day));
}

function formatUtcYmd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const RevenueAnalytics = () => {
  const navigate = useNavigate();
  const { clinicName } = useParams<{ clinicName: string }>();
  const { setCurrentClinic } = useClinic();
  const [searchParams, setSearchParams] = useSearchParams();

  const getMonthFromQuery = (monthParam: string | null): Date => {
    if (monthParam) {
      const match = /^(\d{4})-(\d{2})$/.exec(monthParam);
      if (match) {
        const year = Number(match[1]);
        const monthIndex = Number(match[2]) - 1;
        if (monthIndex >= 0 && monthIndex <= 11) {
          return new Date(Date.UTC(year, monthIndex, 1));
        }
      }
    }

    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  };

  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    // Initialize from query param when available; fallback to current month.
    return getMonthFromQuery(searchParams.get('month'));
  });
  const [tempMonth, setTempMonth] = useState<Date>(selectedMonth);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(() => {
    const from = parseQueryDate(searchParams.get('fromDate'));
    const to = parseQueryDate(searchParams.get('toDate'));
    if (from && to) return { from, to };
    return undefined;
  });

  const customRangeActive = Boolean(customDateRange?.from && customDateRange?.to);

  // Fetch clinic details to get the clinic name for navbar
  const memoizedDateRange = useMemo(() => {
    if (customRangeActive && customDateRange?.from && customDateRange?.to) {
      const from = customDateRange.from;
      const to = customDateRange.to;
      return {
        startDate: Date.UTC(
          from.getUTCFullYear(),
          from.getUTCMonth(),
          from.getUTCDate(),
          18,
          30,
          0,
          0
        ),
        endDate: Date.UTC(
          to.getUTCFullYear(),
          to.getUTCMonth(),
          to.getUTCDate(),
          18,
          29,
          0,
          0
        ),
      };
    }

    const year = selectedMonth.getUTCFullYear();
    const monthIndex = selectedMonth.getUTCMonth();

    // Use GMT/UTC-based timestamps for API (end-of-day UTC).
    const startOfMonth = Date.UTC(year, monthIndex, 0, 18, 30, 0, 0);
    const endOfMonth = Date.UTC(year, monthIndex + 1, 0, 18, 29, 0, 0);

    return {
      startDate: startOfMonth,
      endDate: endOfMonth,
    };
  }, [selectedMonth, customRangeActive, customDateRange?.from, customDateRange?.to]);

  const dateRangeForCard: DateRange = useMemo(() => {
    if (customRangeActive && customDateRange?.from && customDateRange?.to) {
      return { from: customDateRange.from, to: customDateRange.to };
    }
    const year = selectedMonth.getUTCFullYear();
    const monthIndex = selectedMonth.getUTCMonth();
    const from = new Date(Date.UTC(year, monthIndex, 0, 18, 30, 0, 0));
    const to = new Date(Date.UTC(year, monthIndex + 1, 0, 18, 29, 0, 0));
    return { from, to };
  }, [selectedMonth, customRangeActive, customDateRange?.from, customDateRange?.to]);

  const handleApplyMonth = () => {
    setSelectedMonth(new Date(Date.UTC(tempMonth.getUTCFullYear(), tempMonth.getUTCMonth(), 1)));
    setIsMonthPickerOpen(false);
  };

  useEffect(() => {
    const month = format(selectedMonth, 'yyyy-MM');
    if (searchParams.get('month') === month) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('month', month);
    setSearchParams(nextParams, { replace: true });
  }, [selectedMonth, searchParams, setSearchParams]);

  useEffect(() => {
    const from = customDateRange?.from;
    const to = customDateRange?.to;
    const nextParams = new URLSearchParams(searchParams);

    if (from && to) {
      const fromStr = formatUtcYmd(from);
      const toStr = formatUtcYmd(to);
      if (
        searchParams.get('fromDate') === fromStr &&
        searchParams.get('toDate') === toStr
      ) {
        return;
      }
      nextParams.set('fromDate', fromStr);
      nextParams.set('toDate', toStr);
    } else {
      if (!searchParams.get('fromDate') && !searchParams.get('toDate')) return;
      nextParams.delete('fromDate');
      nextParams.delete('toDate');
    }

    setSearchParams(nextParams, { replace: true });
  }, [customDateRange?.from, customDateRange?.to, searchParams, setSearchParams]);

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
          <h1 className="text-2xl font-bold">Revenue Analytics</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <DatePickerWithRange
            className="[&_button]:h-9 [&_button]:min-w-[220px] [&_button]:w-auto"
            date={customDateRange ?? { from: undefined, to: undefined }}
            setDate={(range) => {
              if (range?.from && range?.to) {
                setCustomDateRange({ from: range.from, to: range.to });
              } else if (range?.from || range?.to) {
                setCustomDateRange(range);
              } else {
                setCustomDateRange(undefined);
              }
            }}
          />
          {customRangeActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              onClick={() => setCustomDateRange(undefined)}
            >
              Clear range
            </Button>
          )}
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
      </div>
      <RevenueAnalyticsCard clinicId={clinicName || undefined} dateRange={dateRangeForCard} />
    </div>
  );
}; 