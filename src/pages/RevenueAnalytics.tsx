import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { RevenueAnalyticsCard } from '@/components/dashboard/RevenueAnalyticsCard';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useClinic } from '@/contexts/ClinicContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

function formatUtcYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseUtcYmd(s: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return null;
  const y = Number(match[1]);
  const mo = Number(match[2]) - 1;
  const d = Number(match[3]);
  const dt = new Date(Date.UTC(y, mo, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo || dt.getUTCDate() !== d) return null;
  return dt;
}

function getMonthStartFromQuery(monthParam: string | null): Date {
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
}

/** Same calendar boundaries as the legacy single-month picker (UTC date parts → API windows via card hook). */
function legacyCalendarDaysFromMonthStart(monthStart: Date): DateRange {
  const year = monthStart.getUTCFullYear();
  const monthIndex = monthStart.getUTCMonth();
  const legacyFromMs = Date.UTC(year, monthIndex, 0, 18, 30, 0, 0);
  const legacyToMs = Date.UTC(year, monthIndex + 1, 0, 18, 29, 0, 0);
  const fromBoundary = new Date(legacyFromMs);
  const toBoundary = new Date(legacyToMs);
  return {
    from: new Date(
      Date.UTC(
        fromBoundary.getUTCFullYear(),
        fromBoundary.getUTCMonth(),
        fromBoundary.getUTCDate()
      )
    ),
    to: new Date(
      Date.UTC(
        toBoundary.getUTCFullYear(),
        toBoundary.getUTCMonth(),
        toBoundary.getUTCDate()
      )
    ),
  };
}

function initialRangeFromSearchParams(params: URLSearchParams): DateRange {
  const fd = params.get('fromDate');
  const td = params.get('toDate');
  if (fd && td) {
    const from = parseUtcYmd(fd);
    const to = parseUtcYmd(td);
    if (from && to && from.getTime() <= to.getTime()) {
      return { from, to };
    }
  }
  return legacyCalendarDaysFromMonthStart(getMonthStartFromQuery(params.get('month')));
}

function rangeToApiTimestamps(range: DateRange): { startDate: number; endDate: number } | null {
  if (!range.from || !range.to) return null;
  const from = range.from;
  const to = range.to;
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

export const RevenueAnalytics = () => {
  const navigate = useNavigate();
  const { clinicName } = useParams<{ clinicName: string }>();
  const { setCurrentClinic } = useClinic();
  const [searchParams, setSearchParams] = useSearchParams();
  const fdParam = searchParams.get('fromDate');
  const tdParam = searchParams.get('toDate');
  const monthParam = searchParams.get('month');

  const [dateRange, setDateRange] = useState<DateRange>(() =>
    initialRangeFromSearchParams(searchParams)
  );
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (fdParam) sp.set('fromDate', fdParam);
    if (tdParam) sp.set('toDate', tdParam);
    if (monthParam) sp.set('month', monthParam);
    const parsed = initialRangeFromSearchParams(sp);
    setDateRange((prev) => {
      if (
        prev.from &&
        prev.to &&
        parsed.from &&
        parsed.to &&
        formatUtcYmd(prev.from) === formatUtcYmd(parsed.from) &&
        formatUtcYmd(prev.to) === formatUtcYmd(parsed.to)
      ) {
        return prev;
      }
      return parsed;
    });
  }, [fdParam, tdParam, monthParam]);

  useEffect(() => {
    if (!dateRange.from || !dateRange.to) return;
    const fd = formatUtcYmd(dateRange.from);
    const td = formatUtcYmd(dateRange.to);
    if (fdParam === fd && tdParam === td && !monthParam) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('fromDate', fd);
    nextParams.set('toDate', td);
    nextParams.delete('month');
    setSearchParams(nextParams, { replace: true });
  }, [dateRange, fdParam, tdParam, monthParam, searchParams, setSearchParams]);

  const memoizedDateRange = useMemo(() => {
    const ts = rangeToApiTimestamps(dateRange);
    if (ts) return ts;
    const fallback = legacyCalendarDaysFromMonthStart(getMonthStartFromQuery(null));
    return rangeToApiTimestamps(fallback)!;
  }, [dateRange]);

  const dateRangeForCard: DateRange = dateRange;

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
      <div className="flex items-center gap-4 mb-6">
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

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs font-normal">
              From date
            </Label>
            <Popover open={isFromPickerOpen} onOpenChange={setIsFromPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(selected) => {
                    if (!selected) return;
                    const nextFrom = new Date(Date.UTC(selected.getFullYear(), selected.getMonth(), selected.getDate()));
                    const currentTo = dateRange.to;
                    if (currentTo && nextFrom.getTime() > currentTo.getTime()) {
                      setDateRange({ from: nextFrom, to: nextFrom });
                    } else {
                      setDateRange({ from: nextFrom, to: currentTo });
                    }
                    setIsFromPickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs font-normal">
              To date
            </Label>
            <Popover open={isToPickerOpen} onOpenChange={setIsToPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(selected) => {
                    if (!selected) return;
                    const nextTo = new Date(Date.UTC(selected.getFullYear(), selected.getMonth(), selected.getDate()));
                    const currentFrom = dateRange.from;
                    if (currentFrom && nextTo.getTime() < currentFrom.getTime()) {
                      setDateRange({ from: nextTo, to: nextTo });
                    } else {
                      setDateRange({ from: currentFrom, to: nextTo });
                    }
                    setIsToPickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <RevenueAnalyticsCard clinicId={clinicName || undefined} dateRange={dateRangeForCard} />
    </div>
  );
}; 