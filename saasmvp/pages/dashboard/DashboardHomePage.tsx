
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { UsersIcon, CalendarIcon, ClipboardListIcon, CheckCircleIcon, SettingsIcon, DollarSignIcon, TrendingUpIcon } from '../../lib/icons';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase } from '../../lib/mappers';
import type { Service, Client, Appointment, Professional, DayHours, OperatingHours } from '../../types';
import { Button } from '../../components/ui/Button';

const DashboardStatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; extra?: string; }> = ({ icon, title, value, extra }) => (
    <Card className="p-4 relative">
        <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400">{title}</p>
            <div className="text-gray-500">{icon}</div>
        </div>
        <div className="mt-2">
            <p className="text-3xl font-bold text-white flex items-baseline">
                {extra && <span className="text-xl mr-1">{extra}</span>}
                {value}
            </p>
            <div className="w-12 h-0.5 bg-brand-gold/50 rounded-full mt-2"></div>
        </div>
    </Card>
);

export const DashboardHomePage: React.FC = () => {
  const { negocio } = useAppData();
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupGuide, setShowSetupGuide] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!negocio) return;
      setIsLoading(true);

      const [servicesRes, clientsRes, apptsRes, profsRes] = await Promise.all([
        supabase.from('services').select('*').eq('barbershop_id', negocio.id),
        supabase.from('clients').select('*').eq('barbershop_id', negocio.id),
        supabase.from('appointments').select('*').eq('barbershop_id', negocio.id),
        supabase.from('professionals').select('*').eq('barbershop_id', negocio.id),
      ]);

      setServices(mapFromSupabase<Service[]>(servicesRes.data || []));
      setClients(mapFromSupabase<Client[]>(clientsRes.data || []));
      setAppointments(mapFromSupabase<Appointment[]>(apptsRes.data || []));

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
    };

    fetchData();
  }, [negocio]);

  const dashboardData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaysAppointments = appointments.filter(a => {
        if (!a.startTime) return false;
        const appDate = new Date(a.startTime);
        return appDate >= today && appDate < tomorrow;
    });

    const faturamentoHoje = todaysAppointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => {
            const service = services.find(s => s.id === a.serviceId);
            return sum + (service?.price || 0);
        }, 0);

    const clientesAtendidosHoje = new Set(todaysAppointments.map(a => a.clientId)).size;

    const agendamentosHojeCount = todaysAppointments.length;

    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours;
    const hours = negocio?.operatingHours?.[dayOfWeek];
    let taxaOcupacao = 0;
    if (hours && !hours.closed && hours.open && hours.close) {
        const [openHour, openMin] = hours.open.split(':').map(Number);
        const [closeHour, closeMin] = hours.close.split(':').map(Number);
        const totalAvailableMinutes = (closeHour * 60 + closeMin) - (openHour * 60 + openMin);

        const totalBookedMinutes = todaysAppointments.reduce((sum, a) => {
            const service = services.find(s => s.id === a.serviceId);
            return sum + (service?.duration || 0);
        }, 0);

        if (totalAvailableMinutes > 0) {
            taxaOcupacao = (totalBookedMinutes / totalAvailableMinutes) * 100;
        }
    }

    const ocupacaoPorProfissional = professionals.map(prof => {
        const count = todaysAppointments.filter(a => a.professionalId === prof.id).length;
        return { name: prof.name, count: count };
    });

    return {
        faturamentoHoje,
        clientesAtendidosHoje,
        agendamentosHojeCount,
        taxaOcupacao: Math.min(100, taxaOcupacao),
        todaysAppointments: todaysAppointments.sort((a,b) => a.startTime!.getTime() - b.startTime!.getTime()),
        ocupacaoPorProfissional
    };
  }, [appointments, services, professionals, negocio]);

  if (isLoading || !negocio) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>;
  }
  
  if (appointments.length < 5 && showSetupGuide) {
      const hasServices = services.length > 0;
      const hasProfessionals = professionals.length > 0;
      const hasOperatingHours = negocio.operatingHours ? Object.values(negocio.operatingHours).some((day: DayHours) => !day.closed && day.open && day.close) : false;

      const steps = [
          {
              title: "1. Cadastre seus Serviços",
              description: "Defina os serviços que você oferece, com duração e preço, para que seus clientes possam agendar.",
              link: "/dashboard/services",
              icon: <ClipboardListIcon className="h-8 w-8 text-brand-gold" />,
              completed: hasServices,
          },
          {
              title: "2. Adicione sua Equipe",
              description: "Cadastre os profissionais que realizarão os serviços. Você pode atribuir serviços específicos para cada um.",
              link: "/dashboard/professionals",
              icon: <UsersIcon className="h-8 w-8 text-brand-gold" />,
              completed: hasProfessionals,
          },
          {
              title: "3. Defina seus Horários",
              description: "Configure seu horário de funcionamento para que os clientes saibam quando podem agendar.",
              link: "/dashboard/profile",
              icon: <SettingsIcon className="h-8 w-8 text-brand-gold" />,
              completed: hasOperatingHours,
          }
      ];

      return (
          <div className="space-y-8 animate-fade-in-up">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-white">Bem-vindo ao Gestão 360!</h2>
                  <p className="text-gray-400 text-lg mt-1">Vamos configurar seu negócio para receber os primeiros agendamentos. Siga estes 3 passos simples:</p>
                </div>
                <Button variant="secondary" onClick={() => setShowSetupGuide(false)}>
                    Pular Tutorial
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {steps.map((step, index) => (
                      <Card key={index} className="flex flex-col text-center items-center p-8 transform hover:-translate-y-1 transition-transform">
                          <div className="relative mb-4">
                              <div className="p-4 bg-brand-dark rounded-full">
                                  {step.icon}
                              </div>
                              {step.completed && (
                                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-brand-dark-2">
                                      <CheckCircleIcon className="h-5 w-5 text-white" />
                                  </div>
                              )}
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                          <p className="text-gray-400 flex-grow mb-6">{step.description}</p>
                          <Link to={step.link}>
                              <Button variant={step.completed ? 'secondary' : 'primary'}>
                                  {step.completed ? 'Editar' : 'Configurar'}
                              </Button>
                          </Link>
                      </Card>
                  ))}
              </div>
              
              <Card className="text-center bg-brand-dark border-2 border-dashed border-gray-700">
                  <h3 className="text-xl font-semibold text-white">Tudo pronto?</h3>
                  <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    Após configurar, seu site de agendamento estará pronto para ser compartilhado! Você também pode adicionar um agendamento manual a qualquer momento na página de <Link to="/dashboard/appointments" className="font-semibold text-brand-gold hover:underline">Agendamentos</Link>.
                  </p>
              </Card>
          </div>
      );
  }

  const todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in-up">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-white">Olá, {negocio.name}!</h2>
                <p className="text-gray-400 capitalize">{todayFormatted}</p>
            </div>
            {appointments.length < 5 && (
                <Button variant="secondary" onClick={() => setShowSetupGuide(true)}>
                    Ver Dicas
                </Button>
            )}
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardStatCard icon={<DollarSignIcon className="h-6 w-6" />} title="Faturamento Hoje" value={dashboardData.faturamentoHoje.toFixed(2)} extra="R$" />
            <DashboardStatCard icon={<UsersIcon className="h-6 w-6" />} title="Clientes Ativos" value={dashboardData.clientesAtendidosHoje} />
            <DashboardStatCard icon={<CalendarIcon className="h-6 w-6" />} title="Agendamentos Hoje" value={dashboardData.agendamentosHojeCount} />
            <DashboardStatCard icon={<TrendingUpIcon className="h-6 w-6" />} title="Taxa de Ocupação" value={`${dashboardData.taxaOcupacao.toFixed(0)}%`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Agenda de Hoje</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm px-2 py-1 bg-brand-dark-2 rounded-md">{dashboardData.todaysAppointments.length} agendamentos</span>
                        <Link to="/dashboard/appointments" className="text-sm font-semibold text-brand-gold hover:underline">
                            Ver Todos &gt;
                        </Link>
                    </div>
                </div>

                {dashboardData.todaysAppointments.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {dashboardData.todaysAppointments.map(appointment => {
                            const service = services.find(s => s.id === appointment.serviceId);
                            const professional = professionals.find(p => p.id === appointment.professionalId);
                            const client = clients.find(c => c.id === appointment.clientId);
                            return (
                                <div key={appointment.id} className="p-3 bg-brand-dark rounded-md flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="font-bold text-brand-gold mr-4">
                                            {appointment.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-white">{client?.name || 'Cliente'}</p>
                                            <p className="text-sm text-gray-400">{service?.name || 'Serviço'} com {professional?.name || 'Profissional'}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-white">R$ {(service?.price || 0).toFixed(2)}</span>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <CalendarIcon className="h-12 w-12 mx-auto text-gray-600 mb-2"/>
                        <h4 className="font-semibold text-white">Nenhum agendamento para hoje</h4>
                        <p className="text-gray-500 text-sm mb-4">Que tal aproveitar para planejar o amanhã?</p>
                        <Link to="/dashboard/appointments"><Button>Criar Agendamento</Button></Link>
                    </div>
                )}
            </Card>

            <Card className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Ocupação por Profissional</h3>
                <p className="text-sm text-gray-400 mb-4">Distribuição de agendamentos hoje</p>
                {professionals.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.ocupacaoPorProfissional.map(prof => (
                            <div key={prof.name} className="flex justify-between items-center bg-brand-dark p-2 rounded-md">
                                <span className="text-gray-300">{prof.name}</span>
                                <span className="font-semibold text-white text-sm">{prof.count} agend.</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <UsersIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm mb-4">Nenhum profissional cadastrado</p>
                        <Link to="/dashboard/professionals">
                            <Button variant="secondary" size="sm">Cadastrar Profissional</Button>
                        </Link>
                    </div>
                )}
            </Card>
        </div>
    </div>
  );
};
