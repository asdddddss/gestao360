import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Professional, Service, OperatingHours, DayHours } from '../../types';

interface EditProfessionalModalProps {
  professional: Professional;
  onClose: () => void;
  onSave: (id: string, data: Partial<Omit<Professional, 'id' | 'negocioId' | 'photoUrl'>> & { photoFile?: File, workingHours?: OperatingHours | null }) => Promise<void>;
  allServices: Service[];
}

interface ProfFormErrors {
    name?: string;
    services?: string;
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

export const EditProfessionalModal: React.FC<EditProfessionalModalProps> = ({ professional, onClose, onSave, allServices }) => {
  const [name, setName] = useState(professional.name || '');
  const [selectedServices, setSelectedServices] = useState<string[]>(professional.services);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(professional.photoUrl);
  const [errors, setErrors] = useState<ProfFormErrors>({});
  const [workingHours, setWorkingHours] = useState<OperatingHours | null | undefined>(professional.workingHours);
  
  useEffect(() => {
    setName(professional.name || '');
    setSelectedServices(professional.services);
    setPhotoPreview(professional.photoUrl);
    setPhotoFile(null);
    setWorkingHours(professional.workingHours);
  }, [professional]);

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
    onSave(professional.id, { 
        name, 
        services: selectedServices,
        photoFile: photoFile || undefined,
        workingHours: workingHours,
    });
    onClose();
  };
  
  const handleServiceToggle = (serviceId: string) => {
      setSelectedServices(prev => 
          prev.includes(serviceId) 
          ? prev.filter(id => id !== serviceId) 
          : [...prev, serviceId]
      );
  };

  const handleWorkingHoursChange = (day: keyof OperatingHours, field: keyof DayHours, value: string | boolean) => {
    setWorkingHours(prev => {
        const currentHours = prev || {} as OperatingHours;
        const dayHours = currentHours?.[day] ? { ...currentHours[day] } : { open: '', close: '', closed: true };

        (dayHours as any)[field] = value;

        if (field === 'closed' && value === true) {
            dayHours.open = '';
            dayHours.close = '';
        }

        if ((field === 'open' || field === 'close') && value) {
            dayHours.closed = false;
        }

        return {
            ...currentHours,
            [day]: dayHours,
        } as OperatingHours;
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4 text-white">Editar Membro</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <img src={photoPreview || ''} alt="Foto" className="w-20 h-20 rounded-full object-cover bg-brand-dark" />
            <div className="flex-1">
                <Input label="Alterar Foto" id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>
          </div>
          <Input label="Nome do Membro" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Serviços que realiza:</label>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-2 ${errors.services ? 'border-red-500' : 'border-transparent'}`}>
                {allServices.map(service => (
                    <label key={service.id} className="flex items-center space-x-2 p-2 bg-brand-dark rounded-md cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={selectedServices.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            className="rounded text-brand-gold focus:ring-brand-gold"
                        />
                        <span className="text-sm">{service.name}</span>
                    </label>
                ))}
            </div>
             {errors.services && <p className="text-sm text-red-500 mt-1">{errors.services}</p>}
          </div>

          <div className="pt-4 border-t border-gray-700/50">
            <h4 className="text-md font-semibold text-white mb-2">Horário de Trabalho Individual</h4>
            <p className="text-xs text-gray-400 mb-4">Se nenhum horário for definido, o horário de funcionamento do negócio será usado como padrão.</p>
            <div className="space-y-3">
                {Object.entries(daysOfWeek).map(([key, name]) => {
                    const dayKey = key as keyof OperatingHours;
                    return (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                            <span className="font-medium col-span-1 text-sm">{name}</span>
                            <div className="flex items-center space-x-2 col-span-1">
                                <input 
                                    type="checkbox"
                                    id={`closed-${key}`}
                                    checked={workingHours?.[dayKey]?.closed ?? true}
                                    onChange={(e) => handleWorkingHoursChange(dayKey, 'closed', e.target.checked)}
                                    className="h-4 w-4 rounded text-brand-gold focus:ring-brand-gold border-gray-500 bg-brand-dark"
                                />
                                <label htmlFor={`closed-${key}`} className="text-gray-300 text-sm">Fechado</label>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <input
                                    type="time"
                                    aria-label={`Horário de abertura para ${name}`}
                                    disabled={workingHours?.[dayKey]?.closed ?? true}
                                    value={workingHours?.[dayKey]?.open || ''}
                                    onChange={(e) => handleWorkingHoursChange(dayKey, 'open', e.target.value)}
                                    className="w-full bg-brand-dark border border-gray-600 rounded-md px-2 py-1 text-white text-sm disabled:opacity-50"
                                />
                                <span>-</span>
                                <input
                                    type="time"
                                    aria-label={`Horário de fechamento para ${name}`}
                                    disabled={workingHours?.[dayKey]?.closed ?? true}
                                    value={workingHours?.[dayKey]?.close || ''}
                                    onChange={(e) => handleWorkingHoursChange(dayKey, 'close', e.target.value)}
                                    className="w-full bg-brand-dark border border-gray-600 rounded-md px-2 py-1 text-white text-sm disabled:opacity-50"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};