
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Filter } from 'lucide-react';

export const ExpenseManagementSection = () => {
  const currentMonth = new Date();
  const [selectedCity, setSelectedCity] = useState<string>('Select City');
  const [selectedZone, setSelectedZone] = useState<string>('All Zones');
  
  const expenseCategoryData = [
    { name: 'Rent', value: 35, amount: 8.5, color: '#1E40AF' },
    { name: 'HR/Salaries', value: 30, amount: 7.2, color: '#3B82F6' },
    { name: 'Marketing', value: 15, amount: 3.6, color: '#60A5FA' },
    { name: 'Equipment', value: 10, amount: 2.4, color: '#93C5FD' },
    { name: 'Utilities', value: 6, amount: 1.44, color: '#DBEAFE' },
    { name: 'Others', value: 4, amount: 0.96, color: '#EFF6FF' }
  ];

  // Enhanced zone expense data with city hierarchy
  const fullZoneExpenseData = [
    // Mumbai
    { city: 'Mumbai', zone: 'West', expenses: 12.5, clinics: ['Andheri', 'Bandra'] },
    { city: 'Mumbai', zone: 'Central', expenses: 10.2, clinics: ['Dadar', 'Kurla'] },
    { city: 'Mumbai', zone: 'East', expenses: 8.8, clinics: ['Thane', 'Mulund'] },
    { city: 'Mumbai', zone: 'South', expenses: 9.5, clinics: ['Fort', 'Colaba'] },
    
    // Bangalore
    { city: 'Bangalore', zone: 'North', expenses: 6.8, clinics: ['Hebbal', 'Yelahanka'] },
    { city: 'Bangalore', zone: 'South', expenses: 8.2, clinics: ['Koramangala', 'HSR Layout'] },
    { city: 'Bangalore', zone: 'East', expenses: 7.1, clinics: ['Whitefield', 'Marathahalli'] },
    { city: 'Bangalore', zone: 'West', expenses: 5.9, clinics: ['Rajajinagar', 'Malleswaram'] },
    
    // Pune
    { city: 'Pune', zone: 'East', expenses: 4.1, clinics: ['Kharadi', 'Wagholi'] },
    { city: 'Pune', zone: 'West', expenses: 5.5, clinics: ['Hinjewadi', 'Aundh'] },
    { city: 'Pune', zone: 'Central', expenses: 6.2, clinics: ['FC Road', 'Deccan'] },
    { city: 'Pune', zone: 'North', expenses: 3.8, clinics: ['Pimpri', 'Chinchwad'] },
    
    // Delhi
    { city: 'Delhi', zone: 'North', expenses: 9.1, clinics: ['Civil Lines', 'Rohini'] },
    { city: 'Delhi', zone: 'South', expenses: 8.7, clinics: ['Lajpat Nagar', 'GK'] },
    { city: 'Delhi', zone: 'East', expenses: 6.9, clinics: ['Laxmi Nagar', 'Preet Vihar'] },
    { city: 'Delhi', zone: 'West', expenses: 7.3, clinics: ['Rajouri Garden', 'Janakpuri'] },
    
    // Chennai
    { city: 'Chennai', zone: 'North', expenses: 5.2, clinics: ['Kilpauk', 'Anna Nagar'] },
    { city: 'Chennai', zone: 'South', expenses: 6.8, clinics: ['Adyar', 'Velachery'] },
    { city: 'Chennai', zone: 'East', expenses: 4.9, clinics: ['Sholinganallur', 'OMR'] },
    { city: 'Chennai', zone: 'West', expenses: 5.7, clinics: ['T.Nagar', 'Kodambakkam'] },
  ];

  const monthlyExpenseData = [
    { month: 'Jan', expenses: 18.2 },
    { month: 'Feb', expenses: 19.8 },
    { month: 'Mar', expenses: 17.5 },
    { month: 'Apr', expenses: 21.2 },
    { month: 'May', expenses: 20.1 },
    { month: 'Jun', expenses: 22.4 }
  ];

  // Get unique cities for dropdown
  const cities = ['Select City', ...Array.from(new Set(fullZoneExpenseData.map(item => item.city)))];
  
  // Get zones based on selected city
  const availableZones = useMemo(() => {
    if (selectedCity === 'Select City') {
      return ['All Zones', ...Array.from(new Set(fullZoneExpenseData.map(item => item.zone)))];
    }
    return ['All Zones', ...Array.from(new Set(
      fullZoneExpenseData
        .filter(item => item.city === selectedCity)
        .map(item => item.zone)
    ))];
  }, [selectedCity, fullZoneExpenseData]);

  // Filter zone expense data based on selections
  const filteredZoneExpenseData = useMemo(() => {
    let filtered = fullZoneExpenseData;
    
    if (selectedCity !== 'Select City') {
      filtered = filtered.filter(item => item.city === selectedCity);
    }
    
    if (selectedZone !== 'All Zones') {
      filtered = filtered.filter(item => item.zone === selectedZone);
    }
    
    // If showing all cities but specific zone, group by zone
    if (selectedCity === 'Select City' && selectedZone !== 'All Zones') {
      const zoneTotal = filtered.reduce((sum, item) => sum + item.expenses, 0);
      return [{ zone: selectedZone, expenses: zoneTotal }];
    }
    
    // If showing all cities and all zones, group by zone
    if (selectedCity === 'Select City' && selectedZone === 'All Zones') {
      const zoneGroups = filtered.reduce((acc, item) => {
        if (!acc[item.zone]) {
          acc[item.zone] = 0;
        }
        acc[item.zone] += item.expenses;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(zoneGroups).map(([zone, expenses]) => ({
        zone, 
        expenses: Math.round(expenses * 10) / 10 
      }));
    }
    
    // For specific city, show zones in that city
    return filtered.map(item => ({
      zone: item.zone,
      expenses: item.expenses
    }));
  }, [selectedCity, selectedZone, fullZoneExpenseData]);

  // Reset zone when city changes
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedZone('All Zones');
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Expense Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing data for: <span className="font-medium text-blue-600 dark:text-blue-400">{format(currentMonth, 'MMMM yyyy')}</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Total Expenses Card - Redesigned */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">This Month's Total Expenses</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{format(currentMonth, 'MMMM yyyy')}</p>
              </div>
              
              <div className="space-y-3">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">₹22.4L</div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">+12%</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">vs last month</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fixed Costs</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">₹15.2L</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">68%</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Variable Costs</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">₹7.2L</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">32%</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories Pie Chart - Redesigned */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Network Expense Breakdown</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Breakdown for {format(currentMonth, 'MMMM yyyy')}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {expenseCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          padding: '8px 12px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                        formatter={(value, name) => [`${value}%`, name]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-shrink-0 ml-6">
                  <div className="space-y-2">
                    {expenseCategoryData.map((category, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-sm flex-shrink-0" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone-wise Expenses with Filters */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Zone-wise Expenses (₹L)
              </CardTitle>
            </div>
            <div className="flex gap-2 mb-2">
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableZones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedCity !== 'Select City' && selectedZone !== 'All Zones' 
                ? `${selectedZone} zone in ${selectedCity}`
                : selectedCity !== 'Select City' 
                ? `All zones in ${selectedCity}`
                : selectedZone !== 'All Zones'
                ? `${selectedZone} zone across all cities`
                : `Monthly data for ${format(currentMonth, 'MMMM yyyy')}`
              }
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filteredZoneExpenseData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="zone" 
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12 }}
                />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}
                  formatter={(value) => [`₹${value}L`, 'Expenses']} 
                />
                <Bar dataKey="expenses" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Summary info */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Expenses:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  ₹{(filteredZoneExpenseData.reduce((sum, item) => sum + item.expenses, 0) / 100000).toFixed(2)}L
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-400">Avg per Zone:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  ₹{(filteredZoneExpenseData.reduce((sum, item) => sum + item.expenses, 0) / filteredZoneExpenseData.length / 100000).toFixed(2)}L
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expense Trend */}
        <Card className="xl:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Monthly Expense Trend</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400">Historical data up to {format(currentMonth, 'MMMM yyyy')}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenseData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}
                  formatter={(value) => [`₹${value}L`, 'Total Expenses']} 
                />
                <Bar dataKey="expenses" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Summary info */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Expenses:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  ₹{(monthlyExpenseData.reduce((sum, item) => sum + item.expenses, 0) / 100000).toFixed(2)}L
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-400">Avg per Month:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  ₹{(monthlyExpenseData.reduce((sum, item) => sum + item.expenses, 0) / monthlyExpenseData.length / 100000).toFixed(2)}L
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories Breakdown */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Category Breakdown</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400">{format(currentMonth, 'MMMM yyyy')} expenses</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseCategoryData.map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">₹{category.amount}L</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{category.value}%</div>
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
