import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import type { Service, Professional, Appointment, Negocio, OperatingHours } from '../../types';
import { mapFromSupabase, mapToSupabase } from '../../lib/mappers';
import { Input } from '../ui/Input';
import { Calendar } from '../ui/Calendar';

interface BookingFlowProps {
  initialServiceId?: string | null;
  negocioId: string;
}

interface BookingFormErrors {
    clientName?: string;
    clientPhone?: string;
}

const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export const BookingFlow: React.FC<BookingFlowProps> = ({ initialServiceId = null, negocioId }) => {
    const [negocio, setNegocio] = useState<Negocio | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    const [step, setStep] = useState(1);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(getToday());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [errors, setErrors] = useState<BookingFormErrors>({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBookingData = async () => {
        if (!negocioId) return;
        setIsLoading(true);

        const [bsDataRes, servicesRes, profsRes, apptsRes] = await Promise.all([
            supabase.from('barbershops').select('*').eq('id', negocioId).single(),
            supabase.from('services').select('*').eq('barbershop_id', negocioId),
            supabase.from('professionals').select('*').eq('barbershop_id', negocioId),
            supabase.from('appointments').select('*').eq('barbershop_id', negocioId),
        ]);

        if (bsDataRes.error || servicesRes.error || profsRes.error || apptsRes.error) {
            console.error("Error fetching booking data:", bsDataRes.error || servicesRes.error || profsRes.error || apptsRes.error);
            setIsLoading(false);
            return;
        }

        setNegocio(mapFromSupabase<Negocio>(bsDataRes.data));
        setServices(mapFromSupabase<Service[]>(servicesRes.data || []));
        setAppointments(mapFromSupabase<Appointment[]>(apptsRes.data || []));

        const mappedProfessionals = mapFromSupabase<Omit<Professional, 'services'>[]>(profsRes.data || []);
        const professionalIds = mappedProfessionals.map(p => p.id);

        let profServicesLinks: { professional_id: string, service_id: string }[] = [];
        if (professionalIds.length > 0) {
            const { data, error: linkError } = await supabase.from('professionals_services').select('service_id, professional_id').in('professional_id', professionalIds);
            if (linkError) {
                console.error("Error fetching professional services:", linkError);
                setIsLoading(false);
                return;
            }
            profServicesLinks = data || [];
        }

        const professionalsWithServices = mappedProfessionals.map(p => ({
            ...p,
            services: profServicesLinks
                .filter(link => link.professional_id === p.id)
                .map(link => link.service_id),
        }));
        
        setProfessionals(professionalsWithServices);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBookingData();
    }, [negocioId]);

    useEffect(() => {
        if (initialServiceId) {
            setSelectedServiceId(initialServiceId);
            setStep(2);
            setSelectedProfessionalId(null);
            setSelectedDate(getToday());
            setSelectedTime(null);
        } else {
           setStep(1);
           setSelectedServiceId(null);
        }
    }, [initialServiceId]);


    const availableProfessionals = useMemo(() => {
        if (!selectedServiceId) return [];
        return professionals.filter(p => p.services.includes(selectedServiceId));
    }, [selectedServiceId, professionals]);

    const filteredAvailableTimes = useMemo(() => {
        if (!selectedDate || !selectedProfessionalId || !negocio || !selectedServiceId) return [];

        const professional = professionals.find(p => p.id === selectedProfessionalId);
        const service = services.find(s => s.id === selectedServiceId);
        if (!professional || !service || !service.duration) return [];
        
        const serviceDuration = service.duration;
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours;

        const businessHours = negocio.operatingHours?.[dayOfWeek];
        const professionalHours = professional.workingHours?.[dayOfWeek];

        if (!businessHours || businessHours.closed) return []; // Business is closed

        const parseTime = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };
        const formatTime = (minutes: number) => {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        const businessStart = parseTime(businessHours.open);
        const businessEnd = parseTime(businessHours.close);

        let effectiveStart, effectiveEnd;

        if (professionalHours && !professionalHours.closed && professionalHours.open && professionalHours.close) {
            const profStart = parseTime(professionalHours.open);
            const profEnd = parseTime(professionalHours.close);
            effectiveStart = Math.max(businessStart, profStart);
            effectiveEnd = Math.min(businessEnd, profEnd);
        } else {
            effectiveStart = businessStart;
            effectiveEnd = businessEnd;
        }

        if (effectiveStart >= effectiveEnd) return [];

        const potentialSlots: string[] = [];
        let currentTimeInMinutes = effectiveStart;
        while (currentTimeInMinutes < effectiveEnd) {
            potentialSlots.push(formatTime(currentTimeInMinutes));
            currentTimeInMinutes += 15; // Generate slots every 15 mins to allow flexibility
        }

        const selectedDayStart = new Date(selectedDate); selectedDayStart.setHours(0, 0, 0, 0);
        const selectedDayEnd = new Date(selectedDate); selectedDayEnd.setHours(23, 59, 59, 999);
        
        const bookedIntervals = appointments
            .filter(a =>
                a.professionalId === selectedProfessionalId &&
                a.startTime &&
                new Date(a.startTime) >= selectedDayStart &&
                new Date(a.startTime) <= selectedDayEnd
            ).map(a => {
                const bookedService = services.find(s => s.id === a.serviceId);
                const start = new Date(a.startTime!).getHours() * 60 + new Date(a.startTime!).getMinutes();
                const end = start + (bookedService?.duration || 0);
                return { start, end };
            });

        const checkAvailability = (slotStart: number) => {
            const slotEnd = slotStart + serviceDuration;
            if (slotEnd > effectiveEnd) return false;
            for (const interval of bookedIntervals) {
                if (slotStart < interval.end && slotEnd > interval.start) {
                    return false; // Overlap
                }
            }
            return true;
        };

        let available = potentialSlots.filter(time => checkAvailability(parseTime(time)));

        if (selectedDate.toDateString() === new Date().toDateString()) {
            const now = new Date();
            const currentTimeString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            available = available.filter(time => time > currentTimeString);
        }

        return available;
    }, [selectedDate, selectedProfessionalId, appointments, negocio, selectedServiceId, services, professionals]);

    const handleServiceSelect = (serviceId: string) => {
        setSelectedServiceId(serviceId);
        setSelectedProfessionalId(null);
        setStep(2);
    };
    
    const handleProfessionalSelect = (profId: string) => {
        setSelectedProfessionalId(profId);
        setStep(3);
        setShowDatePicker(true);
    };
    
    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setShowDatePicker(false);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep(4);
    };

    const validate = (): boolean => {
        const newErrors: BookingFormErrors = {};
        if (!clientName.trim()) {
            newErrors.clientName = 'Seu nome é obrigatório.';
        }
        if (!clientPhone.trim()) {
            newErrors.clientPhone = 'Seu telefone é obrigatório.';
        } else if (!/^\d{10,11}$/.test(clientPhone.replace(/\D/g, ''))) {
            newErrors.clientPhone = 'Formato de telefone inválido. Use apenas números (ex: 11987654321).';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !selectedServiceId || !selectedProfessionalId || !selectedDate || !selectedTime) {
            return;
        }
    
        try {
            // 1. Find or create the client
            let clientId: string;
            const cleanedPhone = clientPhone.replace(/\D/g, '');
    
            const { data: existingClient, error: findClientError } = await supabase
                .from('clients')
                .select('id')
                .eq('barbershop_id', negocioId)
                .eq('phone', cleanedPhone)
                .maybeSingle();
    
            if (findClientError) {
                throw findClientError;
            }
    
            if (existingClient) {
                clientId = existingClient.id;
            } else {
                const { data: newClient, error: createClientError } = await supabase
                    .from('clients')
                    .insert({
                        barbershop_id: negocioId,
                        name: clientName,
                        phone: cleanedPhone,
                    })
                    .select('id')
                    .single();
    
                if (createClientError) {
                    throw createClientError;
                }
                clientId = newClient.id;
            }
    
            // 2. Create the appointment
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const startTime = new Date(selectedDate);
            startTime.setHours(hours, minutes, 0, 0);
    
            const appointmentData = {
                barbershop_id: negocioId,
                client_id: clientId,
                service_id: selectedServiceId,
                professional_id: selectedProfessionalId,
                start_time: startTime.toISOString(),
                status: 'confirmed',
                payment_status: 'pending',
            };
    
            const { error: createAppointmentError } = await supabase
                .from('appointments')
                .insert(appointmentData);
    
            if (createAppointmentError) {
                throw createAppointmentError;
            }
    
            // 3. Success
            alert("Agendamento realizado com sucesso!");
            setStep(1);
            setSelectedServiceId(null);
            setSelectedProfessionalId(null);
            setSelectedDate(getToday());
            setSelectedTime(null);
            setClientName('');
            setClientPhone('');
            setErrors({});
            fetchBookingData();
    
        } catch (error: any) {
            alert("Houve um erro ao agendar. Tente novamente.");
            console.error("Booking Error:", error.message);
        }
    };
    
    const formatDisplayDate = (date: Date) => {
        if (date.toDateString() === getToday().toDateString()) {
            return `Hoje, ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`;
        }
        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    };

    if (isLoading) {
        return <div className="text-center p-8">Carregando opções de agendamento...</div>;
    }

    return (
        <div className="bg-brand-dark-2 p-8 rounded-lg">
            {step === 1 && (
                <div>
                    <h3 className="text-2xl font-semibold text-white mb-6 text-center">1. Escolha um Serviço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map(service => (
                            <button key={service.id} onClick={() => handleServiceSelect(service.id)} className="text-left p-4 bg-brand-dark rounded-lg hover:bg-brand-gold/10 border border-transparent hover:border-brand-gold transition-all">
                                <p className="font-bold text-white">{service.name || 'Serviço Sem Nome'}</p>
                                <p className="text-gray-400">{service.duration} min - R$ {(service.price || 0).toFixed(2)}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h3 className="text-2xl font-semibold text-white mb-6 text-center">2. Escolha um Profissional</h3>
                    <div className="flex flex-wrap justify-center gap-6">
                       {availableProfessionals.map(prof => (
                           <button key={prof.id} onClick={() => handleProfessionalSelect(prof.id)} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-brand-gold/10">
                               <img src={prof.photoUrl || ''} alt={prof.name || 'Foto do profissional'} className="w-24 h-24 rounded-full object-cover border-2 border-gray-600" />
                               <p className="text-white font-semibold">{prof.name || 'Sem Nome'}</p>
                           </button>
                       ))}
                    </div>
                     <Button variant="secondary" onClick={() => setStep(1)} className="mt-6">Voltar</Button>
                </div>
            )}
            {step === 3 && (
                <div>
                    <h3 className="text-2xl font-semibold text-white mb-6 text-center">3. Escolha Data e Hora</h3>
                    <div className="space-y-6">
                        <div 
                            className="bg-brand-dark p-4 rounded-lg text-center cursor-pointer hover:bg-gray-800/50"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <p className="text-lg font-semibold text-brand-gold">{formatDisplayDate(selectedDate)}</p>
                            <p className="text-sm text-gray-300">{showDatePicker ? 'Fechar Calendário' : 'Clique para alterar o dia'}</p>
                        </div>
                        
                        {showDatePicker && (
                            <div className="flex justify-center">
                                <Calendar 
                                    selectedDate={selectedDate} 
                                    onDateSelect={handleDateSelect} 
                                    minDate={getToday()} 
                                />
                            </div>
                        )}
                        
                        {!showDatePicker && (
                             <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {filteredAvailableTimes.length > 0 ? (
                                    filteredAvailableTimes.map(time => (
                                        <Button key={time} variant={selectedTime === time ? 'primary' : 'secondary'} onClick={() => handleTimeSelect(time)}>{time}</Button>
                                    ))
                                ) : (
                                    <p className="col-span-full text-center text-gray-400">Nenhum horário disponível para esta data.</p>
                                )}
                            </div>
                        )}
                     </div>
                     <Button variant="secondary" onClick={() => setStep(2)} className="mt-6">Voltar</Button>
                </div>
            )}
            {step === 4 && (
                <div>
                    <h3 className="text-2xl font-semibold text-white mb-6 text-center">4. Seus Dados</h3>
                    <form onSubmit={handleConfirmBooking} className="space-y-4 max-w-md mx-auto">
                        <Input label="Seu Nome Completo" id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} required error={errors.clientName} />
                        <Input label="Seu Telefone (apenas números)" id="clientPhone" type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} required error={errors.clientPhone} />
                        <div className="flex justify-between items-center gap-4 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setStep(3)}>Voltar</Button>
                            <Button type="submit">Confirmar Agendamento</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};