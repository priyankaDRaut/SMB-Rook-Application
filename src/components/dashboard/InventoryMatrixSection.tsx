
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Download, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Sample inventory data
const inventoryData = [
  {
    id: 1,
    itemName: "Medical X-Ray Films",
    clinic: "SmileCare Central",
    zone: "North Delhi",
    quantity: 50,
    minStock: 100,
    abcClass: "A",
    vedClass: "V",
    fsnClass: "F",
    lastUsed: "2024-06-20",
    itemType: "Medical Supplies",
    unitCost: 25,
    totalValue: 1250
  },
  {
    id: 2,
    itemName: "Medical Chairs",
    clinic: "SmileCare East",
    zone: "East Delhi",
    quantity: 2,
    minStock: 3,
    abcClass: "A",
    vedClass: "V",
    fsnClass: "S",
    lastUsed: "2024-06-15",
    itemType: "Equipment",
    unitCost: 50000,
    totalValue: 100000
  },
  {
    id: 3,
    itemName: "Disposable Gloves",
    clinic: "SmileCare West",
    zone: "West Delhi",
    quantity: 200,
    minStock: 150,
    abcClass: "B",
    vedClass: "E",
    fsnClass: "F",
    lastUsed: "2024-06-23",
    itemType: "Consumables",
    unitCost: 2,
    totalValue: 400
  },
  {
    id: 4,
    itemName: "Office Decorations",
    clinic: "SmileCare South",
    zone: "South Delhi",
    quantity: 10,
    minStock: 5,
    abcClass: "C",
    vedClass: "D",
    fsnClass: "N",
    lastUsed: "2024-05-01",
    itemType: "Office Supplies",
    unitCost: 15,
    totalValue: 150
  },
  {
    id: 5,
    itemName: "Anesthetic Injections",
    clinic: "SmileCare Central",
    zone: "North Delhi",
    quantity: 25,
    minStock: 50,
    abcClass: "A",
    vedClass: "V",
    fsnClass: "F",
    lastUsed: "2024-06-22",
    itemType: "Medical Supplies",
    unitCost: 45,
    totalValue: 1125
  },
  {
    id: 6,
    itemName: "Cleaning Supplies",
    clinic: "SmileCare East",
    zone: "East Delhi",
    quantity: 15,
    minStock: 20,
    abcClass: "B",
    vedClass: "E",
    fsnClass: "S",
    lastUsed: "2024-06-18",
    itemType: "Maintenance",
    unitCost: 8,
    totalValue: 120
  }
];

const zones = ["All Zones", "North Delhi", "East Delhi", "West Delhi", "South Delhi"];
const clinics = ["All Clinics", "SmileCare Central", "SmileCare East", "SmileCare West", "SmileCare South"];
const itemTypes = ["All Types", "Medical Supplies", "Equipment", "Consumables", "Office Supplies", "Maintenance"];
const classTypes = ["All Classes", "A", "B", "C", "V", "E", "D", "F", "S", "N"];

export const InventoryMatrixSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [selectedClinic, setSelectedClinic] = useState("All Clinics");
  const [selectedItemType, setSelectedItemType] = useState("All Types");
  const [selectedClassType, setSelectedClassType] = useState("All Classes");
  const [matrixView, setMatrixView] = useState("ABC");

  // Filter data based on selections
  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.clinic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === "All Zones" || item.zone === selectedZone;
    const matchesClinic = selectedClinic === "All Clinics" || item.clinic === selectedClinic;
    const matchesItemType = selectedItemType === "All Types" || item.itemType === selectedItemType;
    const matchesClass = selectedClassType === "All Classes" || 
                        item.abcClass === selectedClassType || 
                        item.vedClass === selectedClassType || 
                        item.fsnClass === selectedClassType;
    
    return matchesSearch && matchesZone && matchesClinic && matchesItemType && matchesClass;
  });

  // Get chart data based on matrix view
  const getChartData = () => {
    const counts = {};
    filteredData.forEach(item => {
      const key = matrixView === "ABC" ? item.abcClass : 
                  matrixView === "VED" ? item.vedClass : item.fsnClass;
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts).map(([key, value]) => ({
      name: key,
      value: value as number
    }));
  };

  const chartData = getChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getClassBadgeColor = (classType: string, value: string) => {
    if (classType === "ABC") {
      return value === "A" ? "bg-red-100 text-red-800" :
             value === "B" ? "bg-yellow-100 text-yellow-800" :
             "bg-green-100 text-green-800";
    } else if (classType === "VED") {
      return value === "V" ? "bg-red-100 text-red-800" :
             value === "E" ? "bg-yellow-100 text-yellow-800" :
             "bg-blue-100 text-blue-800";
    } else {
      return value === "F" ? "bg-green-100 text-green-800" :
             value === "S" ? "bg-yellow-100 text-yellow-800" :
             "bg-red-100 text-red-800";
    }
  };

  const isReorderNeeded = (item: any) => {
    return item.quantity <= item.minStock;
  };

  const isCritical = (item: any) => {
    return item.vedClass === "V" && isReorderNeeded(item);
  };

  const exportToCSV = () => {
    const headers = ["Item Name", "Clinic", "Zone", "Quantity", "ABC Class", "VED Class", "FSN Class", "Last Used", "Reorder Status"];
    const csvData = [
      headers,
      ...filteredData.map(item => [
        item.itemName,
        item.clinic,
        item.zone,
        item.quantity.toString(),
        item.abcClass,
        item.vedClass,
        item.fsnClass,
        item.lastUsed,
        isReorderNeeded(item) ? "Reorder Now" : "OK"
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_matrix.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management Matrix</h2>
          <p className="text-gray-600">Track and categorize inventory across all clinics using ABC, VED, and FSN analysis</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger>
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger>
                <SelectValue placeholder="Clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map(clinic => (
                  <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedItemType} onValueChange={setSelectedItemType}>
              <SelectTrigger>
                <SelectValue placeholder="Item Type" />
              </SelectTrigger>
              <SelectContent>
                {itemTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClassType} onValueChange={setSelectedClassType}>
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {classTypes.map(classType => (
                  <SelectItem key={classType} value={classType}>{classType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={matrixView} onValueChange={setMatrixView}>
              <SelectTrigger>
                <SelectValue placeholder="Matrix View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABC">ABC Analysis</SelectItem>
                <SelectItem value="VED">VED Classification</SelectItem>
                <SelectItem value="FSN">FSN Classification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chart and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{matrixView} Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredData.filter(item => isCritical(item)).length}
                </div>
                <div className="text-sm text-gray-600">Critical Items</div>
                <div className="text-xs text-gray-500">Vital & Low Stock</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredData.filter(item => isReorderNeeded(item)).length}
                </div>
                <div className="text-sm text-gray-600">Reorder Required</div>
                <div className="text-xs text-gray-500">Below Min Stock</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredData.length}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
                <div className="text-xs text-gray-500">In Inventory</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Matrix ({filteredData.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>ABC</TableHead>
                  <TableHead>VED</TableHead>
                  <TableHead>FSN</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className={isCritical(item) ? "bg-red-50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{item.itemName}</span>
                        {isCritical(item) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.clinic}</div>
                        <div className="text-sm text-gray-500">{item.zone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.quantity}</div>
                        <div className="text-sm text-gray-500">Min: {item.minStock}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getClassBadgeColor("ABC", item.abcClass)}>
                        {item.abcClass}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getClassBadgeColor("VED", item.vedClass)}>
                        {item.vedClass}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getClassBadgeColor("FSN", item.fsnClass)}>
                        {item.fsnClass}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.lastUsed}</TableCell>
                    <TableCell>
                      {isReorderNeeded(item) ? (
                        <Badge className="bg-orange-100 text-orange-800">
                          Reorder Now
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          OK
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
