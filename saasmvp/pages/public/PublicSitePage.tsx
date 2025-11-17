

import React, { useState, useEffect } from 'react';
import type { Negocio, Service, Professional, OperatingHours, Product } from '../../types';
import { useParams } from 'react-router-dom';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { BookingFlow } from '../../components/public/BookingFlow';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase } from '../../lib/mappers';

interface SiteData {
  negocio: Negocio;
  services: Service[];
  professionals: Professional[];
  products: Product[];
}

interface PublicSitePageProps {
  isPreview?: boolean;
  previewData?: SiteData | null;
}

const daysOfWeek: { [key in keyof OperatingHours]: string } = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

export const PublicSitePage: React.FC<PublicSitePageProps> = ({ isPreview = false, previewData = null }) => {
  const params = useParams();
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteData = async () => {
        const slug = params.slug;
        if (!slug) {
            setError("Negócio não especificado.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const { data: bsData, error: bsError } = await supabase
            .from('barbershops')
            .select('*')
            .eq('slug', slug)
            .single();

        if (bsError || !bsData) {
            setError('Negócio não encontrado.');
            setIsLoading(false);
            return;
        }

        const negocioId = bsData.id;

        // Step 1: Fetch main entities
        const [servicesRes, profsRes, productsRes] = await Promise.all([
            supabase.from('services').select('*').eq('barbershop_id', negocioId),
            supabase.from('professionals').select('*').eq('barbershop_id', negocioId),
            supabase.from('products').select('*').eq('barbershop_id', negocioId),
        ]);

        if (servicesRes.error || profsRes.error || productsRes.error) {
            setError('Falha ao carregar dados do negócio.');
            console.error(servicesRes.error || profsRes.error || productsRes.error);
            setIsLoading(false);
            return;
        }

        const mappedProfessionals = mapFromSupabase<Omit<Professional, 'services'>[]>(profsRes.data || []);
        const professionalIds = mappedProfessionals.map(p => p.id);

        // Step 2: Fetch junction table data
        let profServicesLinks: { professional_id: string, service_id: string }[] = [];
        if (professionalIds.length > 0) {
            const { data, error: linkError } = await supabase.from('professionals_services').select('service_id, professional_id').in('professional_id', professionalIds);
            if (linkError) {
                setError('Falha ao carregar dados dos profissionais.');
                console.error(linkError);
                setIsLoading(false);
                return;
            }
            profServicesLinks = data || [];
        }

        // Step 3: Combine data
        const professionalsWithServices = mappedProfessionals.map(p => ({
            ...p,
            services: profServicesLinks
                .filter(link => link.professional_id === p.id)
                .map(link => link.service_id),
        }));


        setSiteData({
            negocio: mapFromSupabase<Negocio>(bsData),
            services: mapFromSupabase<Service[]>(servicesRes.data || []),
            professionals: professionalsWithServices,
            products: mapFromSupabase<Product[]>(productsRes.data || []),
        });
        setIsLoading(false);
    };

    if (isPreview) {
        if (previewData) {
            setSiteData(previewData);
            setIsLoading(false);
        } else {
            setIsLoading(true); // Waiting for preview data
        }
    } else {
        fetchSiteData();
    }
  }, [params.slug, isPreview, previewData]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">Carregando...</div>;
  }
  
  if (error || !siteData) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
            <h1 className="text-3xl">{error || 'Negócio não encontrado.'}</h1>
        </div>
    );
  }

  const { negocio, services, professionals, products } = siteData;

  const handleServiceClick = (serviceId: string) => {
    setPreselectedServiceId(serviceId);
    const bookingSection = document.getElementById('agendar');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-brand-dark text-brand-light">
      <PublicHeader negocio={negocio} />
      <main>
        {/* Hero Section */}
        <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599351431202-145b2319fde0?q=80&w=2070&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h1 className="text-5xl font-bold mb-2">{negocio.name}</h1>
              <p className="text-lg">{negocio.address || 'Endereço não informado'}</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="sobre" className="py-16 bg-brand-dark-2">
            <div className="container mx-auto px-6 text-center max-w-3xl">
                <h2 className="text-3xl font-bold text-white mb-4">Sobre Nós</h2>
                <p className="text-gray-300">{negocio.description || 'Bem-vindo ao nosso espaço! Estamos ansiosos para atender você.'}</p>
            </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="py-16">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Nossos Serviços</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(service => (
                        <div 
                            key={service.id} 
                            onClick={() => handleServiceClick(service.id)}
                            className="bg-brand-dark-2 p-6 rounded-lg text-center cursor-pointer hover:bg-brand-gold/10 border border-transparent hover:border-brand-gold transition-all"
                        >
                            <h3 className="text-xl font-semibold text-brand-gold">{service.name || 'Serviço Sem Nome'}</h3>
                            <p className="text-gray-400 my-2">{service.duration} min</p>
                            <p className="text-2xl font-bold text-white">R$ {(service.price || 0).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Professionals Section */}
        <section id="equipe" className="py-16 bg-brand-dark-2">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Nossa Equipe</h2>
                <div className="flex justify-center flex-wrap gap-8">
                    {professionals.map(prof => (
                         <div key={prof.id} className="text-center">
                            <img src={prof.photoUrl || ''} alt={prof.name || 'Foto do profissional'} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-brand-gold"/>
                            <h3 className="text-xl font-semibold text-white">{prof.name || 'Sem Nome'}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Products Section */}
        {products.length > 0 && (
            <section id="produtos" className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Nossos Produtos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <div 
                                key={product.id} 
                                className="bg-brand-dark-2 p-6 rounded-lg text-center border border-transparent"
                            >
                                <h3 className="text-xl font-semibold text-brand-gold">{product.name}</h3>
                                <p className="text-2xl font-bold text-white mt-2">R$ {product.salePrice.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* Operating Hours Section */}
        <section id="horarios" className="py-16 bg-brand-dark-2">
            <div className="container mx-auto px-6 text-center max-w-lg">
                <h2 className="text-3xl font-bold text-white mb-8">Nosso Horário</h2>
                <div className="bg-brand-dark p-6 rounded-lg space-y-3 text-lg">
                    {Object.entries(daysOfWeek).map(([key, name]) => {
                        if (!negocio.operatingHours) return null;
                        const hours = negocio.operatingHours[key as keyof OperatingHours];
                        return (
                            <div key={key} className="flex justify-between items-center border-b border-gray-700/50 pb-2 last:border-b-0 last:pb-0">
                                <span className="text-gray-300">{name}</span>
                                <span className="font-semibold text-white">
                                    {hours ? (hours.closed ? 'Fechado' : `${hours.open} - ${hours.close}`) : 'Não disponível'}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>

        {/* Booking Section */}
        <section id="agendar" className="py-16">
            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Faça seu Agendamento</h2>
                <BookingFlow negocioId={negocio.id} initialServiceId={preselectedServiceId} />
            </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};