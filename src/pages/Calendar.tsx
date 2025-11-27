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

  // Sample data - replace with your actual data source
  const allEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'John Doe - Checkup',
      start: new Date(2024, 11, 25, 10, 0),
      end: new Date(2024, 11, 25, 10, 30),
      status: 'confirmed',
      type: 'appointment',
      doctor: 'Dr. Smith',
      clinic: 'Andheri',
      zone: 'Mumbai',
      patient: 'John Doe'
    },
    {
      id: '2',
      title: 'Dr. Smith - Morning Shift',
      start: new Date(2024, 11, 25, 9, 0),
      end: new Date(2024, 11, 25, 17, 0),
      status: 'confirmed',
      type: 'shift',
      doctor: 'Dr. Smith',
      clinic: 'Andheri',
      zone: 'Mumbai'
    },
    {
      id: '3',
      title: 'Jane Smith - Consultation',
      start: new Date(2024, 11, 26, 14, 0),
      end: new Date(2024, 11, 26, 14, 45),
      status: 'pending',
      type: 'appointment',
      doctor: 'Dr. Patel',
      clinic: 'Bandra',
      zone: 'Mumbai',
      patient: 'Jane Smith'
    },
    {
      id: '4',
      title: 'Mike Johnson - Follow-up',
      start: new Date(2024, 11, 24, 11, 0),
      end: new Date(2024, 11, 24, 11, 30),
      status: 'completed',
      type: 'appointment',
      doctor: 'Dr. Kumar',
      clinic: 'Koramangala',
      zone: 'Bangalore',
      patient: 'Mike Johnson'
    }
  ];

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      if (filters.clinics.length > 0 && !filters.clinics.includes(event.clinic)) return false;
      if (filters.zones.length > 0 && !filters.zones.includes(event.zone)) return false;
      if (filters.doctors.length > 0 && !filters.doctors.includes(event.doctor)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(event.status)) return false;
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.type)) return false;
      return true;
    });
  }, [allEvents, filters]);

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

        <Card className="h-[calc(100vh-200px)]">
          <div className="p-4 h-full">
            <BigCalendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              popup
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              style={{ height: '100%' }}
              className="rbc-calendar"
            />
          </div>
        </Card>

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
