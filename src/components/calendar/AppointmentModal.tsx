
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from '../../pages/Calendar';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>) => void;
  event?: CalendarEvent | null;
  slot?: { start: Date; end: Date } | null;
}

export const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  event, 
  slot 
}: AppointmentModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'appointment' as 'appointment' | 'shift',
    status: 'pending' as 'confirmed' | 'pending' | 'cancelled' | 'completed',
    doctor: '',
    clinic: '',
    zone: '',
    patient: '',
    notes: '',
    start: new Date(),
    end: new Date()
  });

  const clinics = ['Andheri', 'Bandra', 'Pune Central', 'Koramangala', 'Whitefield'];
  const zones = ['Mumbai', 'Pune', 'Bangalore'];
  const doctors = ['Dr. Smith', 'Dr. Patel', 'Dr. Kumar', 'Dr. Shah', 'Dr. Mehta'];

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title,
        type: event.type,
        status: event.status,
        doctor: event.doctor,
        clinic: event.clinic,
        zone: event.zone,
        patient: event.patient || '',
        notes: event.notes || '',
        start: event.start,
        end: event.end
      });
    } else if (slot) {
      // Creating new event
      setFormData({
        title: '',
        type: 'appointment',
        status: 'pending',
        doctor: '',
        clinic: '',
        zone: '',
        patient: '',
        notes: '',
        start: slot.start,
        end: slot.end
      });
    }
  }, [event, slot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Partial<CalendarEvent> = {
      ...formData,
      id: event?.id || Date.now().toString(),
      title: formData.type === 'appointment' 
        ? `${formData.patient} - ${formData.title}` 
        : `${formData.doctor} - ${formData.title}`
    };

    onSave(eventData);
  };

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: new Date(value)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'appointment' | 'shift') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="shift">Doctor Shift</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              {formData.type === 'appointment' ? 'Procedure/Service' : 'Shift Title'}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={formData.type === 'appointment' ? 'e.g., Checkup, Consultation' : 'e.g., Morning Shift'}
              required
            />
          </div>

          {formData.type === 'appointment' && (
            <div className="space-y-2">
              <Label htmlFor="patient">Patient Name</Label>
              <Input
                id="patient"
                value={formData.patient}
                onChange={(e) => setFormData(prev => ({ ...prev, patient: e.target.value }))}
                placeholder="Enter patient name"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="datetime-local"
                value={formatDateTime(formData.start)}
                onChange={(e) => handleDateTimeChange('start', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Time</Label>
              <Input
                id="end"
                type="datetime-local"
                value={formatDateTime(formData.end)}
                onChange={(e) => handleDateTimeChange('end', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select 
              value={formData.doctor} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, doctor: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doctor => (
                  <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zone">Zone</Label>
              <Select 
                value={formData.zone} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, zone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic">Clinic</Label>
              <Select 
                value={formData.clinic} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, clinic: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map(clinic => (
                    <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'confirmed' | 'pending' | 'cancelled' | 'completed') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? 'Update' : 'Create'} Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
