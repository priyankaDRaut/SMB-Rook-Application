
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Wrench, CheckCircle, Plus } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  clinic: string;
  category: 'supplies' | 'equipment' | 'maintenance';
  status: 'normal' | 'low' | 'critical' | 'maintenance';
  quantity: number;
  minThreshold: number;
  lastUpdated: string;
}

export const InventoryLogCards = () => {
  const [inventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Medical Supplies',
      clinic: 'Andheri',
      category: 'supplies',
      status: 'low',
      quantity: 15,
      minThreshold: 25,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      name: 'Medical Equipment',
      clinic: 'Bandra',
      category: 'equipment',
      status: 'maintenance',
      quantity: 1,
      minThreshold: 1,
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      name: 'Surgical Gloves',
      clinic: 'Koramangala',
      category: 'supplies',
      status: 'critical',
      quantity: 5,
      minThreshold: 50,
      lastUpdated: '2024-01-16'
    },
    {
      id: '4',
      name: 'Dental Chairs',
      clinic: 'Pune Central',
      category: 'equipment',
      status: 'normal',
      quantity: 4,
      minThreshold: 3,
      lastUpdated: '2024-01-16'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      low: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800',
      normal: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'supplies': return <Package className="h-4 w-4" />;
      case 'equipment': return <Wrench className="h-4 w-4" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const alertItems = inventoryItems.filter(item => 
    item.status === 'critical' || item.status === 'low' || item.status === 'maintenance'
  );

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Inventory Alerts</span>
              <Badge className="bg-red-100 text-red-800">
                {alertItems.length}
              </Badge>
            </CardTitle>
            <Button size="sm" className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(item.category)}
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    {getStatusIcon(item.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Clinic:</span>
                      <span className="font-medium">{item.clinic}</span>
                    </div>
                    
                    {item.status !== 'maintenance' && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Stock:</span>
                        <span className={`font-medium ${item.quantity <= item.minThreshold ? 'text-red-600' : ''}`}>
                          {item.quantity}/{item.minThreshold}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Updated:</span>
                      <span>{item.lastUpdated}</span>
                    </div>
                    
                    <Badge className={`w-full text-center text-xs ${getStatusBadge(item.status)}`}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {alertItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All inventory items are in good condition</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Inventory Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {inventoryItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(item.category)}
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.clinic}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {item.status !== 'maintenance' && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.quantity}</p>
                      <p className="text-xs text-gray-500">Available</p>
                    </div>
                  )}
                  
                  <Badge className={`text-xs ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </Badge>
                  
                  {getStatusIcon(item.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
