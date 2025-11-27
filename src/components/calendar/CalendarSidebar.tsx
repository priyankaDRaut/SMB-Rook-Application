
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface FilterState {
  clinics: string[];
  zones: string[];
  doctors: string[];
  statuses: string[];
  eventTypes: string[];
}

interface CalendarSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const CalendarSidebar = ({ filters, setFilters }: CalendarSidebarProps) => {
  const clinics = ['Andheri', 'Bandra', 'Pune Central', 'Koramangala', 'Whitefield'];
  const zones = ['Mumbai', 'Pune', 'Bangalore'];
  const doctors = ['Dr. Smith', 'Dr. Patel', 'Dr. Kumar', 'Dr. Shah', 'Dr. Mehta'];
  const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];
  const eventTypes = ['appointment', 'shift'];

  const handleFilterChange = (filterType: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const FilterSection = ({ 
    title, 
    items, 
    filterType 
  }: { 
    title: string; 
    items: string[]; 
    filterType: keyof FilterState;
  }) => (
    <div className="space-y-3">
      <h3 className="font-medium text-blue-900">{title}</h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`${filterType}-${item}`}
              checked={filters[filterType].includes(item)}
              onCheckedChange={(checked) => 
                handleFilterChange(filterType, item, checked as boolean)
              }
            />
            <Label 
              htmlFor={`${filterType}-${item}`}
              className="text-sm font-normal cursor-pointer"
            >
              {item}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  const StatusSection = () => (
    <div className="space-y-3">
      <h3 className="font-medium text-blue-900">Status</h3>
      <div className="space-y-2">
        {statuses.map(status => (
          <div key={status} className="flex items-center space-x-2">
            <Checkbox
              id={`status-${status}`}
              checked={filters.statuses.includes(status)}
              onCheckedChange={(checked) => 
                handleFilterChange('statuses', status, checked as boolean)
              }
            />
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: 
                    status === 'confirmed' ? '#10b981' :
                    status === 'pending' ? '#f59e0b' :
                    status === 'cancelled' ? '#ef4444' :
                    '#3b82f6'
                }}
              />
              <Label 
                htmlFor={`status-${status}`}
                className="text-sm font-normal cursor-pointer capitalize"
              >
                {status}
              </Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-blue-50 border-r border-blue-200 p-6 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FilterSection 
            title="Event Types" 
            items={eventTypes} 
            filterType="eventTypes"
          />
          
          <Separator />
          
          <StatusSection />
          
          <Separator />
          
          <FilterSection 
            title="Clinics" 
            items={clinics} 
            filterType="clinics"
          />
          
          <Separator />
          
          <FilterSection 
            title="Zones" 
            items={zones} 
            filterType="zones"
          />
          
          <Separator />
          
          <FilterSection 
            title="Doctors" 
            items={doctors} 
            filterType="doctors"
          />
        </CardContent>
      </Card>
    </div>
  );
};
