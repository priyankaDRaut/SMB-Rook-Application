
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { usePatientTrends } from '@/hooks/use-patient-trends';
import { Loader2 } from 'lucide-react';

export const PatientMetricsSection = () => {
  // Use the patient trends hook to get real data
  const { patientTrendsData, loading, error, isUsingFallbackData } = usePatientTrends({
    range: 'Year',
    clinicId: '',
    startDate: 1756665000000,
    endDate: 1759170600000
  });

  // Transform API data for charts - only use real API data
  const monthlyVisitsData = React.useMemo(() => {
    if (!patientTrendsData?.data) {
      return []; // Return empty array if no API data
    }
    
    return patientTrendsData.data.map(item => ({
      month: item.month,
      visits: item.totalFootfall
    }));
  }, [patientTrendsData]);

  // Remove hardcoded data - these should come from API
  const conversionFunnelData: any[] = []; // Empty until API provides this data
  const satisfactionTrendData: any[] = []; // Empty until API provides this data

  // Show loading state
  if (loading && !patientTrendsData) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Analytics</h2>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Loading Patient Data</h3>
              <p className="text-muted-foreground">Please wait while we fetch the patient trends...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error && !patientTrendsData) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Analytics</h2>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600">Error Loading Data</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Patient Analytics</h2>
        {isUsingFallbackData && (
          <span className="text-xs text-muted-foreground bg-yellow-100 px-2 py-1 rounded">
            Using Mock Data
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Monthly Visits - Only show if API data is available */}
        {monthlyVisitsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Patient Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyVisitsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Patient Satisfaction Trend - Only show if API data is available */}
        {satisfactionTrendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Patient Satisfaction Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={satisfactionTrendData}>
                  <defs>
                    <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[3.8, 5]} />
                  <Tooltip formatter={(value) => [`${value}/5`, 'Satisfaction Score']} />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSatisfaction)"
                    dot={false}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Cards - Remove hardcoded data, these should come from API */}
        {/* These cards are commented out until API provides this data */}
        {/* 
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average Ticket Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₹2,450</div>
              <p className="text-sm text-gray-500">+8% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rebook Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">72%</div>
              <p className="text-sm text-gray-500">Follow-up appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">No-Show Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">8%</div>
              <p className="text-sm text-gray-500">-2% vs last month</p>
            </CardContent>
          </Card>
        </div>
        */}

        {/* Conversion Funnel - Only show if API data is available */}
        {conversionFunnelData.length > 0 && (
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Patient Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {conversionFunnelData.map((stage, index) => (
                  <div key={index} className="text-center">
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-lg h-20 flex items-center justify-center mb-2">
                        <div 
                          className="bg-blue-600 rounded-lg h-full flex items-center justify-center text-white font-bold transition-all duration-300"
                          style={{ width: `${stage.percentage}%`, minWidth: '60px' }}
                        >
                          {stage.count}
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800">{stage.stage}</h4>
                      <p className="text-sm text-gray-500">{stage.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};
