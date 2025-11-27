import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, User, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export const ConsultDoctorsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [zoneFilter, setZoneFilter] = useState('All Zones');

  const doctorData = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      specialty: 'General Medicine',
      zone: 'West',
      experience: '15 years',
      rating: 4.8,
      patients: 1200,
      status: 'Active',
      availability: 'Mon-Fri',
      consultationFee: '₹800'
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiology',
      zone: 'South',
      experience: '12 years',
      rating: 4.9,
      patients: 980,
      status: 'Active',
      availability: 'Mon-Sat',
      consultationFee: '₹1200'
    },
    {
      id: 3,
      name: 'Dr. Amit Patel',
      specialty: 'Orthopedics',
      zone: 'North',
      experience: '18 years',
      rating: 4.7,
      patients: 1100,
      status: 'On Leave',
      availability: 'Tue-Sat',
      consultationFee: '₹1000'
    },
    {
      id: 4,
      name: 'Dr. Sunita Reddy',
      specialty: 'Pediatrics',
      zone: 'East',
      experience: '10 years',
      rating: 4.6,
      patients: 850,
      status: 'Active',
      availability: 'Mon-Fri',
      consultationFee: '₹600'
    },
    {
      id: 5,
      name: 'Dr. Vikram Singh',
      specialty: 'General Medicine',
      zone: 'Central',
      experience: '20 years',
      rating: 4.9,
      patients: 1500,
      status: 'Active',
      availability: 'Mon-Sat',
      consultationFee: '₹900'
    }
  ];

  const specialtyUtilization = [
    { specialty: 'General Medicine', utilization: 82 },
    { specialty: 'Cardiology', utilization: 78 },
    { specialty: 'Orthopedics', utilization: 75 },
    { specialty: 'Pediatrics', utilization: 68 }
  ];

  const filteredDoctors = doctorData.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All Specialties' || doctor.specialty === specialtyFilter;
    const matchesZone = zoneFilter === 'All Zones' || doctor.zone === zoneFilter;
    
    return matchesSearch && matchesSpecialty && matchesZone;
  });

  const getSpecialtyBadge = (specialty: string) => {
    return (
      <Badge className="bg-[#DCEBFE] text-blue-800">
        {specialty}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Active': 'bg-blue-100 text-blue-800',
      'On Leave': 'bg-blue-200 text-blue-900',
      'Inactive': 'bg-blue-300 text-blue-950'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-blue-100 text-blue-800'}>
        {status}
      </Badge>
    );
  };

  const getRatingColor = (rate: number) => {
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 60) return 'text-blue-500';
    return 'text-blue-700';
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Consult Doctors</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold text-blue-600">76%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Consultations</p>
                <p className="text-2xl font-bold text-blue-600">1,284</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-blue-600">4.7/5</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Doctors Table */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <CardTitle>Doctor Performance ({filteredDoctors.length} doctors)</CardTitle>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-48"
                  />
                </div>
                
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Specialties">All Specialties</SelectItem>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Zones">All Zones</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Clinics</TableHead>
                    <TableHead>Consultations</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}</TableCell>
                      <TableCell>{getSpecialtyBadge(doctor.specialty)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {/* The original code had doctor.clinics, but doctorData doesn't have clinics.
                              Assuming the intent was to show the specialty or zone if clinics are not available.
                              For now, keeping the original structure but noting the potential issue. */}
                          {doctor.specialty}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{doctor.patients}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getRatingColor(doctor.rating)}`}>
                          {doctor.rating}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Utilization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Specialty-wise Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={specialtyUtilization} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="specialty" type="category" width={60} />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
