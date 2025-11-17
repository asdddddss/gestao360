import React, { useState, useMemo, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Button } from '../../components/ui/Button';
import { AddAppointmentModal } from '../../components/dashboard/AddAppointmentModal';
import { AppointmentDetailModal } from '../../components/dashboard/AppointmentDetailModal';
import { ChevronLeftIcon, ChevronRightIcon } from '../../lib/icons';
import type { Appointment, Service, Client, Professional, AppointmentStatus } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../lib/mappers';
import { Select } from '../../components/ui/Select';

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
};
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
const isSameDay = (d1: Date | null, d2: Date) => {
    if (!d1) return false;
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
const isToday = (d: Date) => isSameDay(new Date(), d);

const statusFilters: { label: string; value: AppointmentStatus | 'all' }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Confirmados', value: 'confirmed' },
    { label: 'Em Andamento', value: 'in-progress' },
    { label: 'Concluídos', value: 'completed' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Cancelados', value: 'cancelled' },
    { label: 'Não Compareceu', value: 'no-show' },
];


export const AppointmentsPage: React.FC = () => {
  const { negocio } = useAppData();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [professionalFilter, setProfessionalFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!negocio) return;
      setIsLoading(true);
      const [apptsRes, servicesRes, clientsRes, profsRes] = await Promise.all([
        supabase.from('appointments').select('*').eq('barbershop_id', negocio.id),
        supabase.from('services').select('*').eq('barbershop_id', negocio.id),
        supabase.from('clients').select('*').eq('barbershop_id', negocio.id).order('name'),
        supabase.from('professionals').select('*').eq('barbershop_id', negocio.id),
      ]);
      setAppointments(mapFromSupabase<Appointment[]>(apptsRes.data || []));
      setServices(mapFromSupabase<Service[]>(servicesRes.data || []));
      setClients(mapFromSupabase<Client[]>(clientsRes.data || []));
      
      if (profsRes.data) {
          const mappedProfessionals = mapFromSupabase<Omit<Professional, 'services'>[]>(profsRes.data);
          const professionalIds = mappedProfessionals.map(p => p.id);
          if (professionalIds.length > 0) {
              const { data: profServicesLinks } = await supabase.from('professionals_services').select('service_id, professional_id').in('professional_id', professionalIds);
              const professionalsWithServices = mappedProfessionals.map(p => ({
                  ...p,
                  services: (profServicesLinks || [])
                      .filter(link => link.professional_id === p.id)
                      .map(link => link.service_id),
              }));
              setProfessionals(professionalsWithServices);
          } else {
              setProfessionals([]);
          }
      }

      setIsLoading(false);
    }
    fetchData();
  }, [negocio]);

  const filteredAppointments = useMemo(() => {
    let results = appointments;
    if (statusFilter !== 'all') {
        results = results.filter(app => app.status === statusFilter);
    }
    if (professionalFilter !== 'all') {
        results = results.filter(app => app.professionalId === professionalFilter);
    }
    return results;
  }, [appointments, statusFilter, professionalFilter]);

  const handleClientAdded = (newClient: Client) => {
    setClients(prev => [...prev, newClient].sort((a,b) => (a.name || '').localeCompare(b.name || '')));
  };
  
  const addAppointment = async (data: Omit<Appointment, 'id' | 'negocioId' | 'status' | 'paymentStatus' | 'tip'>) => {
    if (!negocio) return;
    const newAppointmentData = {
        ...mapToSupabase(data),
        barbershop_id: negocio.id,
        status: 'confirmed',
        payment_status: 'pending',
        tip: 0,
    };
    const { data: newAppointment, error } = await supabase
        .from('appointments')
        .insert(newAppointmentData)
        .select()
        .single();
    if (newAppointment && !error) {
        setAppointments(prev => [...prev, mapFromSupabase<Appointment>(newAppointment)]);
    }
  };

  const createTransactionFromAppointment = async (appointment: Appointment) => {
      const service = services.find(s => s.id === appointment.serviceId);
      const client = clients.find(c => c.id === appointment.clientId);
      if (!service || !service.price || !client || !negocio || !appointment.startTime) return;
      
      const { count } = await supabase.from('transactions').select('*', { count: 'exact' }).eq('source_id', appointment.id);
      if (count !== null && count > 0) return; // Transaction already exists

      const transactionData = {
          barbershop_id: negocio.id,
          type: 'revenue',
          amount: service.price,
          description: `Serviço: ${service.name} - Cliente: ${client.name}`,
          date: appointment.startTime.toISOString(),
          source_type: 'appointment',
          source_id: appointment.id,
          client_id: appointment.clientId,
          professional_id: appointment.professionalId,
          service_id: appointment.serviceId
      };
      
      const { error } = await supabase.from('transactions').insert(transactionData);
      if (error) console.error("Failed to create transaction for appointment:", error);
  };

  const updateAppointment = async (id: string, data: Partial<Pick<Appointment, 'status' | 'tip'>>) => {
      const { data: updatedAppointment, error } = await supabase
          .from('appointments')
          .update(mapToSupabase(data))
          .eq('id', id)
          .select()
          .single();
      if (updatedAppointment && !error) {
          const mapped = mapFromSupabase<Appointment>(updatedAppointment);
          setAppointments(prev => prev.map(a => a.id === id ? mapped : a));
          if(viewingAppointment?.id === id) {
              setViewingAppointment(mapped);
          }
          if (data.status === 'completed') {
              createTransactionFromAppointment(mapped);
          }
      }
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) {
        setAppointments(prev => prev.filter(a => a.id !== id));
        setViewingAppointment(null);
    }
  };


  const CalendarHeader = () => {
    const handlePrev = () => {
        if (view === 'month') setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        if (view === 'week') setCurrentDate(prev => addDays(prev, -7));
        if (view === 'day') setCurrentDate(prev => addDays(prev, -1));
    };
    const handleNext = () => {
        if (view === 'month') setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        if (view === 'week') setCurrentDate(prev => addDays(prev, 7));
        if (view === 'day') setCurrentDate(prev => addDays(prev, 1));
    };
    const handleToday = () => setCurrentDate(new Date());

    const getHeaderText = () => {
        if (view === 'month') return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        if (view === 'week') {
            const start = startOfWeek(currentDate);
            const end = addDays(start, 6);
            return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
        }
        return currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-brand-dark-2 p-1 rounded-md">
                    <button onClick={handlePrev} className="p-2 rounded hover:bg-brand-dark"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <button onClick={handleNext} className="p-2 rounded hover:bg-brand-dark"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
                <Button variant="secondary" onClick={handleToday}>Hoje</Button>
                <h2 className="text-xl font-bold text-white capitalize">{getHeaderText()}</h2>
            </div>
             <div className="flex items-center gap-2">
                <div className="flex items-center bg-brand-dark-2 p-1 rounded-md">
                    {(['month', 'week', 'day'] as const).map(v => (
                        <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-sm rounded capitalize ${view === v ? 'bg-brand-gold text-brand-dark' : 'hover:bg-brand-dark'}`}>
                            {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
                        </button>
                    ))}
                </div>
                <div className="w-48">
                    <Select
                        label=""
                        id="professional-filter"
                        value={professionalFilter}
                        onChange={(e) => setProfessionalFilter(e.target.value)}
                    >
                        <option value="all">Toda a Equipe</option>
                        {professionals.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </Select>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>Novo Agendamento</Button>
            </div>
        </div>
    );
  };
  
  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    
    const days = [];
    let day = calendarStart;
    while (days.length < 42) {
        days.push(new Date(day));
        day = addDays(day, 1);
    }

    return (
        <div className="grid grid-cols-7 h-[calc(100vh-268px)]">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dayName => (
                <div key={dayName} className="text-center font-semibold text-sm text-gray-400 p-2 border-b border-r border-gray-700/50">{dayName}</div>
            ))}
            {days.map((d, i) => {
                const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                const appointmentsForDay = filteredAppointments.filter(a => a.startTime && isSameDay(a.startTime, d));
                return (
                    <div key={i} className={`border-b border-r border-gray-700/50 p-1.5 overflow-y-auto relative ${isCurrentMonth ? '' : 'bg-brand-dark-2/40'}`}>
                        <span className={`text-xs font-bold ${isToday(d) ? 'bg-brand-gold text-brand-dark rounded-full w-5 h-5 flex items-center justify-center' : isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>{d.getDate()}</span>
                        <div className="mt-1 space-y-1">
                            {appointmentsForDay.map(app => {
                                const client = clients.find(c => c.id === app.clientId);
                                return (
                                    <button key={app.id} onClick={() => setViewingAppointment(app)} className="w-full text-left text-xs bg-blue-500/80 text-white p-1 rounded hover:bg-blue-400 truncate">
                                        {app.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {client?.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  const TimeGridView = ({ daysToShow }: { daysToShow: Date[] }) => {
    const timeSlots = Array.from({ length: 28 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    const slotHeight = 60; // height in pixels for one hour

    const getAppointmentStyle = (app: Appointment) => {
        const service = services.find(s => s.id === app.serviceId);
        if (!service || !app.startTime) return { display: 'none' };
        const startHour = app.startTime.getHours() + app.startTime.getMinutes() / 60;
        const durationHours = service.duration / 60;
        return {
            top: `${(startHour - 8) * slotHeight}px`,
            height: `${durationHours * slotHeight}px`,
        };
    };

    return (
        <div className="flex h-[calc(100vh-268px)] overflow-y-auto">
            <div className="w-16">
                {timeSlots.map(time => <div key={time} className="h-[60px] text-xs text-center text-gray-400 pt-1 border-t border-gray-700/50">{time}</div>)}
            </div>
            <div className="flex-grow grid" style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)`}}>
                {daysToShow.map(day => (
                    <div key={day.toISOString()} className="relative border-r border-gray-700/50">
                        {timeSlots.map(time => <div key={time} className="h-[60px] border-t border-gray-700/50"></div>)}
                        {filteredAppointments.filter(a => a.startTime && isSameDay(a.startTime, day)).map(app => {
                             const client = clients.find(c => c.id === app.clientId);
                             const service = services.find(s => s.id === app.serviceId);
                            return (
                                <button key={app.id} onClick={() => setViewingAppointment(app)} style={getAppointmentStyle(app)} className="absolute left-1 right-1 z-10 bg-blue-500/80 p-1.5 rounded-lg text-white text-xs text-left overflow-hidden hover:bg-blue-400">
                                    <p className="font-bold">{client?.name}</p>
                                    <p className="truncate">{service?.name}</p>
                                    <p>{app.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
  };
  
  const WeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
        <div>
            <div className="flex">
                <div className="w-16"></div>
                <div className="flex-grow grid grid-cols-7">
                    {days.map(day => (
                        <div key={day.toISOString()} className="text-center p-2 border-b border-gray-700/50">
                            <p className="text-sm text-gray-400">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                            <p className={`text-xl font-bold ${isToday(day) ? 'text-brand-gold' : 'text-white'}`}>{day.getDate()}</p>
                        </div>
                    ))}
                </div>
            </div>
            <TimeGridView daysToShow={days} />
        </div>
    );
  };

  const DayView = () => {
    const day = currentDate;
    return (
         <div>
            <div className="flex">
                <div className="w-16"></div>
                <div className="flex-grow grid grid-cols-1">
                    <div className="text-center p-2 border-b border-gray-700/50">
                         <p className="text-sm text-gray-400">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                         <p className={`text-xl font-bold ${isToday(day) ? 'text-brand-gold' : 'text-white'}`}>{day.getDate()}</p>
                    </div>
                </div>
            </div>
            <TimeGridView daysToShow={[day]} />
        </div>
    )
  };

  const renderView = () => {
    if (isLoading) {
        return <div className="p-4 text-center">Carregando agendamentos...</div>
    }
    switch (view) {
        case 'month': return <MonthView />;
        case 'week': return <WeekView />;
        case 'day': return <DayView />;
        default: return null;
    }
  }

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader />
      <div className="border-b border-gray-700/50 mb-4">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
            {statusFilters.map(filter => (
                <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`whitespace-nowrap px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                        statusFilter === filter.value
                            ? 'border-brand-gold text-brand-gold'
                            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                >
                    {filter.label}
                </button>
            ))}
        </nav>
      </div>
      <div className="bg-brand-dark-2 rounded-lg overflow-hidden border border-gray-700/50 flex-grow">
        {renderView()}
      </div>
      {isAddModalOpen && <AddAppointmentModal 
        onClose={() => setIsAddModalOpen(false)} 
        onAddAppointment={addAppointment}
        onClientAdded={handleClientAdded}
        services={services}
        professionals={professionals}
        clients={clients}
      />}
      {viewingAppointment && <AppointmentDetailModal 
        appointment={viewingAppointment} 
        onClose={() => setViewingAppointment(null)}
        onUpdateAppointment={updateAppointment}
        onDelete={deleteAppointment}
        services={services}
        professionals={professionals}
        clients={clients}
      />}
    </div>
  );
};