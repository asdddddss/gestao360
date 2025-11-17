import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../hooks/useAppData';
import { PublicSitePage } from '../public/PublicSitePage';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExternalLinkIcon } from '../../lib/icons';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase } from '../../lib/mappers';
import type { Service, Professional, Product } from '../../types';

export const MySitePage: React.FC = () => {
  const { negocio } = useAppData();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        if (!negocio) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const [profsRes, servicesRes, productsRes] = await Promise.all([
            supabase.from('professionals').select('*').eq('barbershop_id', negocio.id),
            supabase.from('services').select('*').eq('barbershop_id', negocio.id),
            supabase.from('products').select('*').eq('barbershop_id', negocio.id)
        ]);
        
        if(servicesRes.data) setServices(mapFromSupabase<Service[]>(servicesRes.data));
        if(productsRes.data) setProducts(mapFromSupabase<Product[]>(productsRes.data));
        
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

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Carregando pré-visualização...</p>
        </div>
    );
  }

  if (!negocio) {
    return (
      <Card>
        <p>Não foi possível carregar os dados do seu negócio para a pré-visualização.</p>
      </Card>
    );
  }

  const previewData = {
    negocio,
    services,
    professionals,
    products,
  };

  return (
    <div className="space-y-6">
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white">Meu Site Público</h2>
                <p className="text-gray-400 mt-1">Esta é uma pré-visualização de como seus clientes veem seu site. Todas as alterações feitas em "Meu Negócio", "Serviços" e "Equipe" são refletidas aqui instantaneamente.</p>
            </div>
            {negocio.slug && (
                <Link to={`/${negocio.slug}`} target="_blank" rel="noopener noreferrer" title="Abrir em nova aba">
                    <Button variant="secondary" className="w-full md:w-auto flex items-center justify-center">
                        <span>Abrir em nova aba</span>
                        <ExternalLinkIcon className="h-5 w-5 ml-2"/>
                    </Button>
                </Link>
            )}
        </Card>
        
        <div className="rounded-lg overflow-auto border-4 border-gray-700/50 relative" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <div className="sticky top-0 bg-gray-800 p-2 text-sm text-gray-400 z-10 flex items-center justify-between">
                <p className="font-semibold">Pré-visualização do Site</p>
                {negocio.slug && <p className="text-xs">URL: <span className="font-mono text-brand-gold">/{negocio.slug}</span></p>}
            </div>
            <div className="bg-brand-dark">
                <PublicSitePage isPreview={true} previewData={previewData} />
            </div>
        </div>
    </div>
  );
};