// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { TrendingUp, TrendingDown, ArrowUpDown, IndianRupee, BarChart3, PieChartIcon, TableIcon } from 'lucide-react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { cn } from '@/lib/utils';

// interface ClinicData {
//   name: string;
//   city: string;
//   zone: string;
//   revenue: number;
//   expenses: number;
//   netProfit: number;
//   profitMargin: number;
//   rank: number;
//   expenseBreakdown: {
//     staff: number;
//     utilities: number;
//     equipment: number;
//     marketing: number;
//     other: number;
//   };
//   revenueBreakdown: { 
//     consultation: number;
//     surgery: number;
//     diagnostics: number;
//     medication: number;
//     checkup: number;
//   };
// }


// const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0
//   }).format(amount);
// };

// export const ClinicComparisonAnalysis = () => {
//   const [expenseComparisonOpen, setExpenseComparisonOpen] = useState(false);
//   const [revenueComparisonOpen, setRevenueComparisonOpen] = useState(false);
//   const [selectedClinic1, setSelectedClinic1] = useState(mockClinicData[0]);
//   const [selectedClinic2, setSelectedClinic2] = useState(mockClinicData[1]);

//   const prepareExpenseComparisonData = () => {
//     const clinic1Expenses = [
//       { name: 'Staff', value: selectedClinic1.expenseBreakdown.staff },
//       { name: 'Utilities', value: selectedClinic1.expenseBreakdown.utilities },
//       { name: 'Equipment', value: selectedClinic1.expenseBreakdown.equipment },
//       { name: 'Marketing', value: selectedClinic1.expenseBreakdown.marketing },
//       { name: 'Other', value: selectedClinic1.expenseBreakdown.other }
//     ];
// // 
//     const clinic2Expenses = [
//       { name: 'Staff', value: selectedClinic2.expenseBreakdown.staff },
//       { name: 'Utilities', value: selectedClinic2.expenseBreakdown.utilities },
//       { name: 'Equipment', value: selectedClinic2.expenseBreakdown.equipment },
//       { name: 'Marketing', value: selectedClinic2.expenseBreakdown.marketing },
//       { name: 'Other', value: selectedClinic2.expenseBreakdown.other }
//     ];

//     return { clinic1Expenses, clinic2Expenses };
//   };

//   const prepareRevenueComparisonData = () => {
//     const clinic1Revenue = [
//       { name: 'Consultation', value: selectedClinic1.revenueBreakdown.consultation },
//       { name: 'Surgery', value: selectedClinic1.revenueBreakdown.surgery },
//       { name: 'Diagnostics', value: selectedClinic1.revenueBreakdown.diagnostics },
//       { name: 'Medication', value: selectedClinic1.revenueBreakdown.medication },
//       { name: 'Checkup', value: selectedClinic1.revenueBreakdown.checkup }
//     ];

//     const clinic2Revenue = [
//       { name: 'Consultation', value: selectedClinic2.revenueBreakdown.consultation },
//       { name: 'Surgery', value: selectedClinic2.revenueBreakdown.surgery },
//       { name: 'Diagnostics', value: selectedClinic2.revenueBreakdown.diagnostics },
//       { name: 'Medication', value: selectedClinic2.revenueBreakdown.medication },
//       { name: 'Checkup', value: selectedClinic2.revenueBreakdown.checkup }
//     ];

//     return { clinic1Revenue, clinic2Revenue };
//   };

//   const ComparisonDialog = ({ 
//     isOpen, 
//     onClose, 
//     title, 
//     type 
//   }: { 
//     isOpen: boolean; 
//     onClose: () => void; 
//     title: string;
//     type: 'expense' | 'revenue';
//   }) => {
//     const { clinic1Expenses, clinic2Expenses } = prepareExpenseComparisonData();
//     const { clinic1Revenue, clinic2Revenue } = prepareRevenueComparisonData();
    
//     const data1 = type === 'expense' ? clinic1Expenses : clinic1Revenue;
//     const data2 = type === 'expense' ? clinic2Expenses : clinic2Revenue;

//     const barChartData = data1.map((item, index) => ({
//       category: item.name,
//       [selectedClinic1.name]: item.value,
//       [selectedClinic2.name]: data2[index].value
//     }));

//     return (
//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
//           </DialogHeader>
          
//           <div className="space-y-6">
//             {/* Clinic Selection */}
//             <div className="flex gap-4 items-center">
//               <div className="flex-1">
//                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
//                   Select First Clinic
//                 </label>
//                 <Select
//                   value={selectedClinic1.name}
//                   onValueChange={(value) => {
//                     const clinic = mockClinicData.find(c => c.name === value);
//                     if (clinic) setSelectedClinic1(clinic);
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {mockClinicData.map((clinic) => (
//                       <SelectItem key={clinic.name} value={clinic.name}>
//                         {clinic.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="flex-1">
//                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
//                   Select Second Clinic
//                 </label>
//                 <Select
//                   value={selectedClinic2.name}
//                   onValueChange={(value) => {
//                     const clinic = mockClinicData.find(c => c.name === value);
//                     if (clinic) setSelectedClinic2(clinic);
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {mockClinicData.map((clinic) => (
//                       <SelectItem key={clinic.name} value={clinic.name}>
//                         {clinic.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <Tabs defaultValue="charts" className="w-full">
//               <TabsList className="grid w-full grid-cols-3">
//                 <TabsTrigger value="charts" className="flex items-center gap-2">
//                   <BarChart3 className="h-4 w-4" />
//                   Charts
//                 </TabsTrigger>
//                 <TabsTrigger value="pie" className="flex items-center gap-2">
//                   <PieChartIcon className="h-4 w-4" />
//                   Pie Comparison
//                 </TabsTrigger>
//                 <TabsTrigger value="table" className="flex items-center gap-2">
//                   <TableIcon className="h-4 w-4" />
//                   Table View
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="charts" className="mt-6">
//                 <div className="h-[400px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
//                       <YAxis />
//                       <Tooltip formatter={(value) => formatCurrency(value as number)} />
//                       <Legend />
//                       <Bar dataKey={selectedClinic1.name} fill="#3b82f6" />
//                       <Bar dataKey={selectedClinic2.name} fill="#10b981" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </TabsContent>

//               <TabsContent value="pie" className="mt-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div>
//                     <h3 className="text-lg font-semibold mb-4 text-center">{selectedClinic1.name}</h3>
//                     <div className="h-[300px]">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie
//                             data={data1}
//                             dataKey="value"
//                             nameKey="name"
//                             cx="50%"
//                             cy="50%"
//                             outerRadius={100}
//                             label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
//                           >
//                             {data1.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(value) => formatCurrency(value as number)} />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold mb-4 text-center">{selectedClinic2.name}</h3>
//                     <div className="h-[300px]">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie
//                             data={data2}
//                             dataKey="value"
//                             nameKey="name"
//                             cx="50%"
//                             cy="50%"
//                             outerRadius={100}
//                             label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
//                           >
//                             {data2.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(value) => formatCurrency(value as number)} />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </div>
//               </TabsContent>

//               <TabsContent value="table" className="mt-6">
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Category</TableHead>
//                         <TableHead className="text-right">{selectedClinic1.name}</TableHead>
//                         <TableHead className="text-right">{selectedClinic2.name}</TableHead>
//                         <TableHead className="text-right">Difference</TableHead>
//                         <TableHead className="text-right">% Difference</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {data1.map((item, index) => {
//                         const clinic2Value = data2[index].value;
//                         const difference = item.value - clinic2Value;
//                         const percentDifference = ((difference / clinic2Value) * 100).toFixed(1);
                        
//                         return (
//                           <TableRow key={item.name}>
//                             <TableCell className="font-medium">{item.name}</TableCell>
//                             <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
//                             <TableCell className="text-right">{formatCurrency(clinic2Value)}</TableCell>
//                             <TableCell className={cn(
//                               "text-right font-medium",
//                               difference > 0 ? "text-blue-600 dark:text-blue-400" : "text-blue-500 dark:text-blue-400"
//                             )}>
//                               {formatCurrency(Math.abs(difference))}
//                             </TableCell>
//                             <TableCell className={cn(
//                               "text-right font-medium",
//                               difference > 0 ? "text-blue-600 dark:text-blue-400" : "text-blue-500 dark:text-blue-400"
//                             )}>
//                               {difference > 0 ? '+' : ''}{percentDifference}%
//                             </TableCell>
//                           </TableRow>
//                         );
//                       })}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Clinic Comparison Analysis</h2>
//           <p className="text-gray-600 dark:text-gray-400">Compare financial performance between different clinic locations</p>
//         </div>
//       </div>

//       {/* Comparison Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card 
//           className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
//           onClick={() => setExpenseComparisonOpen(true)}
//         >
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//               Expense Comparison Analysis
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="text-sm text-gray-600 dark:text-gray-400">
//                 Compare expense breakdowns across clinics
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Bar Charts</span>
//                 <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Pie Charts</span>
//                 <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Tables</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card 
//           className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
//           onClick={() => setRevenueComparisonOpen(true)}
//         >
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
//               Revenue Comparison Analysis
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="text-sm text-gray-600 dark:text-gray-400">
//                 Compare revenue streams across clinics
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 <span className="text-xs text-green-600 dark:text-green-400 hover:underline cursor-pointer">Bar Charts</span>
//                 <span className="text-xs text-green-600 dark:text-green-400 hover:underline cursor-pointer">Pie Charts</span>
//                 <span className="text-xs text-green-600 dark:text-green-400 hover:underline cursor-pointer">Tables</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Performance Ranking Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold flex items-center gap-2">
//             <ArrowUpDown className="h-5 w-5" />
//             Clinic Performance Ranking
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Rank</TableHead>
//                   <TableHead>Clinic Name</TableHead>
//                   <TableHead className="text-right">Revenue</TableHead>
//                   <TableHead className="text-right">Expenses</TableHead>
//                   <TableHead className="text-right">Net Profit</TableHead>
//                   <TableHead className="text-right">Profit Margin</TableHead>
//                   <TableHead>Performance</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {mockClinicData.map((clinic) => (
//                   <TableRow key={clinic.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
//                     <TableCell>
//                       <Badge variant={clinic.rank <= 2 ? "default" : "secondary"}>
//                         #{clinic.rank}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="font-medium">{clinic.name}</TableCell>
//                     <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
//                       {formatCurrency(clinic.revenue)}
//                     </TableCell>
//                     <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
//                       {formatCurrency(clinic.expenses)}
//                     </TableCell>
//                     <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
//                       {formatCurrency(clinic.netProfit)}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <span className="font-medium">{clinic.profitMargin.toFixed(1)}%</span>
//                         {clinic.profitMargin > 25 ? (
//                           <TrendingUp className="h-4 w-4 text-blue-500" />
//                         ) : clinic.profitMargin < 15 ? (
//                           <TrendingDown className="h-4 w-4 text-blue-500" />
//                         ) : null}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge 
//                         className={cn(
//                           clinic.profitMargin > 25 
//                             ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
//                             : clinic.profitMargin > 20
//                             ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
//                             : clinic.profitMargin > 15
//                             ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
//                             : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
//                         )}
//                       >
//                         {clinic.profitMargin > 25 ? 'Excellent' : 
//                          clinic.profitMargin > 20 ? 'Good' : 
//                          clinic.profitMargin > 15 ? 'Fair' : 'Needs Improvement'}
//                       </Badge>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Comparison Dialogs */}
//       <ComparisonDialog
//         isOpen={expenseComparisonOpen}
//         onClose={() => setExpenseComparisonOpen(false)}
//         title="Clinic Expense Comparison"
//         type="expense"
//       />

//       <ComparisonDialog
//         isOpen={revenueComparisonOpen}
//         onClose={() => setRevenueComparisonOpen(false)}
//         title="Clinic Revenue Comparison"
//         type="revenue"
//       />
//     </div>
//   );
// }; 