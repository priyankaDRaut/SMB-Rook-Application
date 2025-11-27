import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ExpenseAnalyticsCard } from '@/components/dashboard/ExpenseAnalyticsCard';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns';
import { useClinic } from '@/contexts/ClinicContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';

export const ExpenseAnalytics = () => {
  const navigate = useNavigate();
  const { clinicName } = useParams<{ clinicName: string }>();
  const { setCurrentClinic } = useClinic();
  const [date, setDate] = useState<{
    from: Date;
    to: Date;
  }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Fetch clinic details to get the clinic name for navbar
  const memoizedDateRange = useMemo(() => {
    const currentDateForRange = new Date();
    const startOfMonth = new Date(currentDateForRange.getFullYear(), currentDateForRange.getMonth(), 1);
    const endOfMonth = new Date(currentDateForRange.getFullYear(), currentDateForRange.getMonth() + 1, 0);
    
    return {
      startDate: startOfMonth.getTime(),
      endDate: endOfMonth.getTime()
    };
  }, []);

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
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>
      <ExpenseAnalyticsCard dateRange={date} />
    </div>
  );
}; 