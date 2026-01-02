
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingDown } from 'lucide-react';
import { FinancialOverviewSection } from '../components/dashboard/FinancialOverviewSection';
import { ExpenseManagementSection } from '../components/dashboard/ExpenseManagementSection';
import { DetailedFinancialSection } from '../components/dashboard/DetailedFinancialSection';
import { ClinicLevelFinancialSection } from '../components/dashboard/ClinicLevelFinancialSection';
import { FinancialAnalyticsDialog } from '../components/dashboard/FinancialAnalyticsDialog';
import { useRole } from '../contexts/RoleContext';

const FinancialContent = () => {
  const { userRole, clinicId } = useRole();
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [analyticsType, setAnalyticsType] = useState<'expense' | 'revenue'>('expense');
  
  // Use default clinic ID if none is set in context
  const effectiveClinicId = clinicId;

  // Combined company and clinic financial data
  const combinedFinancialData = {
    totalRevenue: 62.8, // Company-wide revenue across all clinics
    totalExpenses: 45.6, // Company-wide expenses across all clinics
    netIncome: 17.2,
    clinicsCount: 25
  };

  const openAnalytics = (type: 'expense' | 'revenue') => {
    setAnalyticsType(type);
    setAnalyticsDialogOpen(true);
  };

  const DetailedAnalysisContent = () => (
    <>
      <FinancialOverviewSection clinicId={effectiveClinicId} period="current-month" />
      <ExpenseManagementSection />
      <DetailedFinancialSection />
      
      {/* Combined Financial Analytics Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Combined Financial Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive analysis across all operations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
            onClick={() => openAnalytics('expense')}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Combined Expense Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Complete expense breakdown across 25 clinics
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹45.6L
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Expense Ratio: <span className="font-semibold text-blue-600 dark:text-blue-400">72.6%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
            onClick={() => openAnalytics('revenue')}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Revenue Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Revenue streams from 25 clinics
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ₹62.8L
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Net Margin: <span className="font-semibold text-green-600 dark:text-green-400">27.4%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Dialog */}
      <FinancialAnalyticsDialog
        isOpen={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        type={analyticsType}
      />
    </>
  );

  // Clinic-level admin can only see clinic data
  if (userRole === 'clinic-admin') {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clinic Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Your clinic's financial overview and performance metrics.</p>
        </div>

        <ClinicLevelFinancialSection />
      </div>
    );
  }

  // Smilebird-level admin can see detailed analysis
  if (userRole === 'smilebird-admin') {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Smilebird Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive financial analytics and detailed analysis.</p>
        </div>

        <DetailedAnalysisContent />
      </div>
    );
  }

  // Super admin can see clinic level and detailed analysis
  return (
    <div className="space-y-6 p-6">
      <Tabs defaultValue="clinic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger 
            value="clinic" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Clinic Level
          </TabsTrigger>
          <TabsTrigger 
            value="detailed" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Detailed Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinic" className="space-y-6">
          <ClinicLevelFinancialSection />
        </TabsContent>
        
        <TabsContent value="detailed" className="space-y-6">
          <DetailedAnalysisContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Financial = () => {
  return <FinancialContent />;
};

export default Financial;
