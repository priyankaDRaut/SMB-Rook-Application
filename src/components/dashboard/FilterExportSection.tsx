
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText } from 'lucide-react';

interface FilterExportSectionProps {
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  selectedClinic: string;
  setSelectedClinic: (clinic: string) => void;
}

export const FilterExportSection = ({ 
  selectedZone, 
  setSelectedZone, 
  selectedClinic, 
  setSelectedClinic 
}: FilterExportSectionProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>
            
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-32 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="All Zones" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">All Zones</SelectItem>
                <SelectItem value="West" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">West Zone</SelectItem>
                <SelectItem value="South" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">South Zone</SelectItem>
                <SelectItem value="North" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">North Zone</SelectItem>
                <SelectItem value="East" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">East Zone</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger className="w-40 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
            </Select>

            <Select defaultValue="All Specialties">
              <SelectTrigger className="w-36 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="All Specialties" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">All Specialties</SelectItem>
                <SelectItem value="General Medicine" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">General Medicine</SelectItem>
                <SelectItem value="Cardiology" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Cardiology</SelectItem>
                <SelectItem value="Orthopedics" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Orthopedics</SelectItem>
                <SelectItem value="Pediatrics" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Pediatrics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">
            {filters.length} filters applied
          </div>
          <div className="px-3 py-1 bg-blue-200 dark:bg-blue-800/30 text-blue-900 dark:text-blue-400 rounded-full text-xs font-medium">
            {exportFormats.length} export options
          </div>
          <div className="px-3 py-1 bg-blue-300 dark:bg-blue-700/30 text-blue-950 dark:text-blue-300 rounded-full text-xs font-medium">
            Alert: Revenue Drop - Koramangala Clinic
          </div>
          <div className="px-3 py-1 bg-blue-400 dark:bg-blue-600/30 text-blue-950 dark:text-blue-200 rounded-full text-xs font-medium">
            Warning: High No-Show Rate - Whitefield
          </div>
          <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs font-medium">
            Alert: Low NPS Score - Pune Central
          </div>
          <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-full text-xs font-medium">
            Alert: Doctor Underutilized - Dr. Reddy
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
