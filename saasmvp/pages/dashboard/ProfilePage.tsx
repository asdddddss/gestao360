import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Negocio, OperatingHours, DayHours } from '../../types';

const daysOfWeek: { [key in keyof OperatingHours]: string } = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

interface ProfileFormErrors {
    name?: string;
    address?: string;
    phone?: string;
}

export const ProfilePage: React.FC = () => {
  const { negocio, updateNegocio } = useAppData();
  const [formData, setFormData] = useState<Partial<Negocio>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  useEffect(() => {
    if (negocio) {
      setFormData(negocio);
    }
  }, [negocio]);

  if (!negocio) {
    return <div>Carregando...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleLogoUpload = () => {
      // Mock logo upload
      const newLogoUrl = `https://picsum.photos/seed/${Date.now()}/200/200`;
      setFormData({ ...formData, logoUrl: newLogoUrl });
  }

  const handleOperatingHoursChange = (day: keyof OperatingHours, field: keyof DayHours, value: string | boolean) => {
    setFormData(prev => {
        const dayHours = prev.operatingHours?.[day] ? { ...prev.operatingHours[day] } : { open: '', close: '', closed: false };

        (dayHours as any)[field] = value;

        if (field === 'closed' && value === true) {
            dayHours.open = '';
            dayHours.close = '';
        }

        if ((field === 'open' || field === 'close') && value) {
            dayHours.closed = false;
        }

        return {
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                [day]: dayHours,
            } as OperatingHours,
        };
    });
  };

  const validate = (): boolean => {
      const newErrors: ProfileFormErrors = {};
      if (!formData.name?.trim()) {
          newErrors.name = "Nome do negócio é obrigatório.";
      }
      if (!formData.address?.trim()) {
          newErrors.address = "Endereço é obrigatório.";
      }
      if (!formData.phone?.trim()) {
          newErrors.phone = "Telefone é obrigatório.";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Limpar erros anteriores relacionados ao nome antes de tentar salvar
    setErrors(prev => ({ ...prev, name: undefined }));

    // Extrai apenas os campos editáveis do formulário para evitar enviar o objeto `negocio` inteiro.
    const {
        name,
        address,
        phone,
        description,
        logoUrl,
        operatingHours,
    } = formData;

    const payloadToUpdate = {
        name,
        address,
        phone,
        description,
        logoUrl,
        operatingHours,
    };

    try {
      await updateNegocio(payloadToUpdate);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      if (err.name === 'ConflictError') {
        setErrors(prev => ({...prev, name: err.message}));
      } else {
        // Lidar com outros erros genéricos, talvez com um alerta
        alert(`Erro ao salvar: ${err.message}`);
      }
      setIsSaved(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Meu Negócio</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center space-x-6">
            <img src={formData.logoUrl || ''} alt="Logo" className="w-24 h-24 rounded-full object-cover bg-gray-700"/>
            <Button type="button" variant="secondary" onClick={handleLogoUpload}>Alterar Logo</Button>
          </div>
          <Input label="Nome do Negócio" id="name" name="name" value={formData.name || ''} onChange={handleChange} error={errors.name} />
          <Input label="Endereço" id="address" name="address" value={formData.address || ''} onChange={handleChange} error={errors.address} />
          <Input label="Telefone" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} error={errors.phone} />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
            <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full bg-brand-dark-2 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                value={formData.description || ''}
                onChange={handleChange}
            />
          </div>
        </Card>
        
        <Card>
            <h3 className="text-xl font-semibold mb-4">Horário de Funcionamento</h3>
            <div className="space-y-4">
                {Object.entries(daysOfWeek).map(([key, name]) => {
                    const dayKey = key as keyof OperatingHours;
                    return (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-gray-700/50 pb-4 last:border-b-0 last:pb-0">
                            <span className="font-medium col-span-1">{name}</span>
                            <div className="flex items-center space-x-2 col-span-1">
                                <input 
                                    type="checkbox"
                                    id={`closed-${key}`}
                                    checked={formData.operatingHours?.[dayKey]?.closed || false}
                                    onChange={(e) => handleOperatingHoursChange(dayKey, 'closed', e.target.checked)}
                                    className="h-4 w-4 rounded text-brand-gold focus:ring-brand-gold border-gray-500 bg-brand-dark"
                                />
                                <label htmlFor={`closed-${key}`} className="text-gray-300">Fechado</label>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <input
                                    type="time"
                                    aria-label={`Horário de abertura para ${name}`}
                                    disabled={formData.operatingHours?.[dayKey]?.closed}
                                    value={formData.operatingHours?.[dayKey]?.open || ''}
                                    onChange={(e) => handleOperatingHoursChange(dayKey, 'open', e.target.value)}
                                    className="w-full bg-brand-dark border border-gray-600 rounded-md px-3 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span>-</span>
                                <input
                                    type="time"
                                    aria-label={`Horário de fechamento para ${name}`}
                                    disabled={formData.operatingHours?.[dayKey]?.closed}
                                    value={formData.operatingHours?.[dayKey]?.close || ''}
                                    onChange={(e) => handleOperatingHoursChange(dayKey, 'close', e.target.value)}
                                    className="w-full bg-brand-dark border border-gray-600 rounded-md px-3 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>

        <div className="flex justify-end items-center gap-4">
            {isSaved && <span className="text-green-400">Salvo com sucesso!</span>}
            <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
};