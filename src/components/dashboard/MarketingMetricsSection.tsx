
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MarketingMetricsSection = () => {
  const leadSourceData = [
    { name: 'Meta Ads', value: 45, color: '#1E40AF' },
    { name: 'Google Ads', value: 30, color: '#3B82F6' },
    { name: 'Walk-ins', value: 20, color: '#60A5FA' },
    { name: 'Referrals', value: 5, color: '#93C5FD' }
  ];

  const campaignData = [
    { campaign: 'General Medicine Special', roi: 5.1, leads: 203 }
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketing Metrics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign ROI */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={campaignData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="campaign" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}x`, 'ROI']} />
                <Bar dataKey="roi" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Marketing KPIs */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost Per Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₹485</div>
              <p className="text-sm text-gray-500">-12% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Referral Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">68%</div>
              <p className="text-sm text-gray-500">Patient referrals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2,487</div>
              <p className="text-sm text-gray-500">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Campaigns */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {campaignData.map((campaign, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">{campaign.campaign}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">ROI:</span>
                      <span className="font-bold text-blue-600">{campaign.roi}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Leads:</span>
                      <span className="font-semibold">{campaign.leads}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
