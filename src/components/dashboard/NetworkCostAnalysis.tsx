import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { 
  Users, 
  Lightbulb, 
  Megaphone, 
  Wrench, 
  Building2, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface NetworkCostAnalysisProps {
  selectedMonth: Date;
  costBreakdownData: {
    category: string;
    amount: number;
    color: string;
  }[];
}

const categoryIcons = {
  'Staff': Users,
  'Utilities': Lightbulb,
  'Marketing': Megaphone,
  'Equipment': Wrench,
  'Other': MoreHorizontal
};

export const NetworkCostAnalysis = ({ selectedMonth, costBreakdownData }: NetworkCostAnalysisProps) => {
  const totalCosts = costBreakdownData.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <Card className="rounded-xl shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center justify-between">
          <div>
            Network Cost Analysis
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              - {format(selectedMonth, 'MMMM yyyy')}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-1">
          {costBreakdownData.map((cost, index) => {
            const Icon = categoryIcons[cost.category as keyof typeof categoryIcons];
            const percentage = (cost.amount / totalCosts) * 100;
            
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="group cursor-pointer">
                      <div className="flex items-center justify-between mb-2 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 p-3 rounded-lg transition-colors">
                        <div className="flex items-center space-x-4 w-1/3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${cost.color}20` }}>
                            {Icon && <Icon className="w-5 h-5" style={{ color: cost.color }} />}
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{cost.category}</span>
                        </div>
                        
                        <div className="w-1/3">
                          <Progress 
                            value={percentage} 
                            className="h-2"
                            indicatorClassName={`bg-[${cost.color}]`}
                          />
                        </div>

                        <div className="flex items-center justify-end space-x-4 w-1/3">
                          <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-gray-100">₹{(cost.amount / 100000).toFixed(2)}L</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {percentage.toFixed(1)}% of total
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to drill down into {cost.category.toLowerCase()} costs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Total Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 -mx-6 -mb-6 p-6 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Network Costs</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(totalCosts / 100000).toFixed(2)}L</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Month-over-Month</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">-2.3%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 