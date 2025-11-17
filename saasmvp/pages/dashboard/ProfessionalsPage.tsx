import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EditIcon, TrashIcon, UserIcon } from '../../lib/icons';
import { EditProfessionalModal } from '../../components/dashboard/EditProfessionalModal';
import type { Professional, Service, OperatingHours } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../lib/mappers';
import { v4 as uuidv4 } from 'uuid';

interface ProfFormErrors {
    name?: string;
    services?: string;
    photoFile?: string;
}

export const ProfessionalsPage: React.FC = () => {
  const { negocio } = useAppData();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProfFormErrors>({});
  
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  useEffect(() => {
      const fetchData = async () => {
          if (!negocio) return;
          setIsLoading(true);
          const [profsRes, servicesRes] = await Promise.all([
              supabase.from('professionals').select('*').eq('barbershop_id', negocio.id),
              supabase.from('services').select('*').eq('barbershop_id', negocio.id)
          ]);

          if (servicesRes.data) {
              setServices(mapFromSupabase<Service[]>(servicesRes.data));
          }

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
  
  const uploadPhoto = async (photoFile: File): Promise<string | null> => {
    if (!negocio) return null;
    
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${negocio.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('professional-photos')
        .upload(filePath, photoFile);

    if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        alert(`Falha no upload: ${uploadError.message}`);
        return null;
    }

    const { data } = supabase.storage
        .from('professional-photos')
        .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addProfessional = async (data: { name: string; services: string[]; photoFile: File | null; }) => {
      if (!negocio) return;
      
      let photoUrl: string | null = null;
      if (data.photoFile) {
          photoUrl = await uploadPhoto(data.photoFile);
          if (!photoUrl) {
              alert('Falha no upload da foto. O profissional não foi adicionado.');
              return;
          }
      } else {
          const initial = data.name.charAt(0).toUpperCase() || 'P';
          photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=D4AF37&color=1C1C1E&size=256`;
      }

      const { services: serviceIds, name } = data;
      const profData = { name, photoUrl };
      
      const { data: newProf, error } = await supabase
          .from('professionals')
          .insert({ 
              ...mapToSupabase(profData), 
              barbershop_id: negocio.id, 
              commission_type: 'percentage', 
              commission_value: 0, 
              base_salary: 0 
          })
          .select()
          .single();

      if (newProf && !error) {
          const links = serviceIds.map(service_id => ({ professional_id: newProf.id, service_id }));
          await supabase.from('professionals_services').insert(links);
          
          const mappedNewProf = mapFromSupabase<Professional>(newProf);
          setProfessionals(prev => [...prev, { ...mappedNewProf, services: serviceIds }]);
      } else {
        console.error('Failed to add professional', error);
      }
  };
  
  const updateProfessional = async (id: string, data: Partial<Omit<Professional, 'id' | 'negocioId' | 'photoUrl'>> & { photoFile?: File, workingHours?: OperatingHours | null }) => {
      const { services: serviceIds, photoFile, ...profData } = data;

      let newPhotoUrl: string | undefined = undefined;
      if (photoFile) {
          const uploadedUrl = await uploadPhoto(photoFile);
          if (uploadedUrl) {
              newPhotoUrl = uploadedUrl;
          } else {
              alert("Falha ao carregar a nova foto. As outras informações serão salvas.");
          }
      }

      const updatePayload = { ...mapToSupabase(profData) };
      if (newPhotoUrl) {
          updatePayload.photo_url = newPhotoUrl;
      }
      
      const { data: updatedProf, error } = await supabase
        .from('professionals')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      
      if (updatedProf && !error) {
        if (serviceIds) {
            await supabase.from('professionals_services').delete().eq('professional_id', id);
            const links = serviceIds.map(service_id => ({ professional_id: id, service_id }));
            await supabase.from('professionals_services').insert(links);
        }
        
        const mappedUpdatedProf = mapFromSupabase<Professional>(updatedProf);
        const currentProf = professionals.find(p => p.id === id);
        const finalServices = serviceIds || currentProf?.services || [];
        
        setProfessionals(prev => prev.map(p => (p.id === id ? { ...mappedUpdatedProf, services: finalServices } : p)));
      } else {
        console.error('Failed to update professional', error);
      }
  };

  const deleteProfessional = async (id: string) => {
      const { error } = await supabase.from('professionals').delete().eq('id', id);
      if (!error) {
          setProfessionals(prev => prev.filter(p => p.id !== id));
      }
  };


  const validate = (): boolean => {
    const newErrors: ProfFormErrors = {};
    if (!name.trim()) newErrors.name = 'O nome é obrigatório.';
    if (selectedServices.length === 0) newErrors.services = 'Selecione pelo menos um serviço.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setPhotoFile(file);
          setPhotoPreview(URL.createObjectURL(file));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    addProfessional({ name, photoFile, services: selectedServices });
    setName('');
    setSelectedServices([]);
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
  };
  
  const handleServiceToggle = (serviceId: string) => {
      setSelectedServices(prev => 
          prev.includes(serviceId) 
          ? prev.filter(id => id !== serviceId) 
          : [...prev, serviceId]
      );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Gerenciar Equipe</h2>
      
      <Card>
        <h3 className="text-xl font-semibold mb-4">Adicionar Membro à Equipe</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <Input label="Nome do Membro" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ricardo" error={errors.name} />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Foto do Profissional (Opcional):</label>
                  <Input label="" id="photo" type="file" accept="image/*" onChange={handlePhotoChange} error={errors.photoFile} />
                </div>
              </div>
              <div className="w-full md:w-40 flex flex-col items-center">
                  <label className="text-sm font-medium text-gray-300 mb-2">Pré-visualização</label>
                  <div className="w-32 h-32 bg-brand-dark flex items-center justify-center rounded-full overflow-hidden border-2 border-gray-600">
                      {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                          <UserIcon className="w-16 h-16 text-gray-500" />
                      )}
                  </div>
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Serviços que realiza:</label>
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 border rounded-md p-2 ${errors.services ? 'border-red-500' : 'border-transparent'}`}>
                {services.map(service => (
                    <label key={service.id} className="flex items-center space-x-2 p-2 bg-brand-dark-2 rounded-md cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={selectedServices.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            className="rounded text-brand-gold focus:ring-brand-gold"
                        />
                        <span>{service.name}</span>
                    </label>
                ))}
            </div>
            {errors.services && <p className="text-sm text-red-500 mt-1">{errors.services}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit">Adicionar Membro</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold mb-4">Membros da Equipe</h3>
        {isLoading ? <p>Carregando equipe...</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {professionals.map(prof => (
                    <div key={prof.id} className="bg-brand-dark rounded-lg p-4 flex flex-col items-center text-center">
                        <img src={prof.photoUrl || ''} alt={prof.name || 'Foto do profissional'} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-brand-gold"/>
                        <h4 className="text-lg font-bold text-white">{prof.name || 'Sem Nome'}</h4>
                        <p className="text-sm text-gray-400 mt-2 flex-grow">
                            Realiza: {prof.services.map(sId => services.find(s => s.id === sId)?.name).join(', ')}
                        </p>
                        <div className="flex space-x-3 mt-4">
                            <button onClick={() => setEditingProfessional(prof)} title="Editar Membro" className="text-gray-400 hover:text-white"><EditIcon className="h-5 w-5" /></button>
                            <button onClick={() => deleteProfessional(prof.id)} title="Excluir Membro" className="text-red-500 hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </Card>
      
      {editingProfessional && (
        <EditProfessionalModal
          professional={editingProfessional}
          onClose={() => setEditingProfessional(null)}
          onSave={updateProfessional}
          allServices={services}
        />
      )}
    </div>
  );
};