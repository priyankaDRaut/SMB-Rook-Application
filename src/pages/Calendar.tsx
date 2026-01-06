import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import { CalendarSidebar } from '../components/calendar/CalendarSidebar';
import { AppointmentModal } from '../components/calendar/AppointmentModal';
import { Card } from '@/components/ui/card';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../components/calendar/calendar-styles.css';

const localizer = momentLocalizer(moment);

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  type: 'appointment' | 'shift';
  doctor: string;
  clinic: string;
  zone: string;
  patient?: string;
  notes?: string;
}

const Calendar = () => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    clinics: [] as string[],
    zones: [] as string[],
    doctors: [] as string[],
    statuses: [] as string[],
    eventTypes: ['appointment', 'shift'] as string[]
  });

  // Event styling based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6'; // default blue
    
    switch (event.status) {
      case 'confirmed':
        backgroundColor = '#10b981'; // green
        break;
      case 'pending':
        backgroundColor = '#f59e0b'; // orange
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // red
        break;
      case 'completed':
        backgroundColor = '#3b82f6'; // blue
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    // Handle saving event - implement your logic here
    console.log('Saving event:', eventData);
    handleCloseModal();
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-blue-50">
      <CalendarSidebar filters={filters} setFilters={setFilters} />
      
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Calendar</h1>
          <p className="text-blue-600">Manage appointments and doctor shifts</p>
        </div>
      
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          event={selectedEvent}
          slot={selectedSlot}
        />
      </div>
    </div>
  );
};

export default Calendar;
