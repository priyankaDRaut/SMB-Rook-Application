import React, { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const MarketingExpenseAnalytics = () => {
  const navigate = useNavigate();
  const { clinicName } = useParams<{ clinicName: string }>();
  const [searchParams] = useSearchParams();

  const selectedMonthLabel = useMemo(() => {
    const monthParam = searchParams.get('month');
    if (!monthParam) return null;

    const match = /^(\d{4})-(\d{2})$/.exec(monthParam);
    if (!match) return null;

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    if (monthIndex < 0 || monthIndex > 11) return null;

    return new Date(Date.UTC(year, monthIndex, 1)).toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }, [searchParams]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/clinics/${clinicName}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Marketing Expense Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Marketing and promotional spend details
            </p>
            {selectedMonthLabel ? (
              <p className="text-sm text-muted-foreground">Selected month: {selectedMonthLabel}</p>
            ) : null}
          </div>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">Marketing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[240px] items-center justify-center rounded-md border bg-muted/20">
            <p className="text-lg font-medium text-muted-foreground">No Data Available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingExpenseAnalytics;
