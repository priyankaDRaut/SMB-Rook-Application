import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ClinicComparisonKPICardProps {
  title: string;
  primaryValue: string | number;
  secondaryValue: string | number;
  primaryDate: Date | string;
  secondaryDate: Date | string;
  change: number;
  changeLabel: string;
  showChangeRow?: boolean;
  icon?: React.ReactNode;
  valueFormatter?: (value: number) => string;
}

export const ClinicComparisonKPICard = ({
  title,
  primaryValue,
  secondaryValue,
  primaryDate,
  secondaryDate,
  change,
  changeLabel,
  showChangeRow = true,
  icon,
  valueFormatter = (value) => value.toString()
}: ClinicComparisonKPICardProps) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return format(date, 'MMM yyyy');
    }
    return date;
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'number' && valueFormatter) {
      return valueFormatter(value);
    }
    return (value ?? '').toString();
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatValue(primaryValue)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatDate(primaryDate)}
        </div>
        {showChangeRow && (
          <div className="flex items-center mt-2">
            <div className={cn(
              "flex items-center text-sm",
              isPositive && "text-green-600 dark:text-green-400",
              isNegative && "text-red-600 dark:text-red-400",
              isNeutral && "text-gray-500 dark:text-gray-400"
            )}>
              {isPositive ? (
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : isNegative ? (
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              ) : null}
              {isPositive && '+'}
              {change.toFixed(1)}%
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {changeLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Regular KPI Card for non-comparison mode
interface ClinicKPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon?: React.ReactNode;
  selectedMonth: Date;
}

export const ClinicKPICard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  selectedMonth
}: ClinicKPICardProps) => {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {format(selectedMonth, 'MMMM yyyy')}
        </div>
        <div className="flex items-center mt-2">
          <div className={cn(
            "flex items-center text-sm",
            isPositive && "text-green-600 dark:text-green-400",
            isNegative && "text-red-600 dark:text-red-400"
          )}>
            {isPositive ? (
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            {isPositive && '+'}
            {change.toFixed(1)}%
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {changeLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}; 