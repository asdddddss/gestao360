
import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EditIcon, TrashIcon, CheckIcon, XIcon } from '../../lib/icons';
import type { Service } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../lib/mappers';

interface ServiceFormErrors {
    name?: string;
    duration?: string;
    price?: string;
}

const InlineInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: string }> = ({ error, ...props }) => (
    <div>
        <input
            className={`w-full bg-brand-dark border rounded-md px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${error ? 'border-red-500' : 'border-gray-600 focus:ring-brand-gold'}`}
            {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

export const ServicesPage: React.FC = () => {
  const { negocio } = useAppData();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<ServiceFormErrors>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Omit<Service, 'id' | 'negocioId'>>({ name: '', duration: 0, price: 0 });
  const [editErrors, setEditErrors] = useState<ServiceFormErrors>({});

  useEffect(() => {
    const fetchServices = async () => {
        if (!negocio) return;
        setIsLoading(true);
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('barbershop_id', negocio.id)
            .order('name');
        
        if (data && !error) {
            setServices(mapFromSupabase<Service[]>(data));
        }
        setIsLoading(false);
    }
    fetchServices();
  }, [negocio]);

  const validateNewService = (): boolean => {
    const newErrors: ServiceFormErrors = {};
    if (!name.trim()) newErrors.name = "Nome é obrigatório.";
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) newErrors.duration = "Deve ser > 0.";
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) newErrors.price = "Deve ser >= 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const addService = async (serviceData: Omit<Service, 'id' | 'negocioId'>) => {
    if (!negocio) return;
    const { data: newService, error } = await supabase
        .from('services')
        .insert({ ...mapToSupabase(serviceData), barbershop_id: negocio.id })
        .select()
        .single();
    if (newService && !error) {
        setServices(prev => [...prev, mapFromSupabase<Service>(newService)].sort((a,b) => (a.name || '').localeCompare(b.name || '')));
    }
  };

  const updateService = async (id: string, serviceData: Partial<Omit<Service, 'id' | 'negocioId'>>) => {
      const { data: updatedService, error } = await supabase
          .from('services')
          .update(mapToSupabase(serviceData))
          .eq('id', id)
          .select()
          .single();
      if (updatedService && !error) {
          setServices(prev => prev.map(s => s.id === id ? mapFromSupabase<Service>(updatedService) : s));
      }
  };

  const deleteService = async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (!error) {
          setServices(prev => prev.filter(s => s.id !== id));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateNewService()) return;
    addService({ name, duration: parseInt(duration), price: parseFloat(price) });
    setName('');
    setDuration('');
    setPrice('');
    setErrors({});
  };
  
  const validateEditedService = (): boolean => {
    const newErrors: ServiceFormErrors = {};
    if (!editedData.name?.trim()) newErrors.name = "Nome é obrigatório.";
    if (editedData.duration <= 0) newErrors.duration = "Inválido.";
    if ((editedData.price || 0) < 0) newErrors.price = "Inválido.";
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartEdit = (service: Service) => {
    setEditingId(service.id);
    setEditedData({ name: service.name || '', duration: service.duration, price: service.price });
    setEditErrors({});
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditErrors({});
  };
  
  const handleSaveEdit = () => {
    if (!editingId || !validateEditedService()) return;
    updateService(editingId, editedData);
    setEditingId(null);
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumberField = name === 'duration' || name === 'price';
    setEditedData(prev => ({ ...prev, [name]: isNumberField ? parseFloat(value) || 0 : value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Gerenciar Serviços</h2>
      <Card>
        <h3 className="text-xl font-semibold mb-4">Adicionar Novo Serviço</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <Input label="Nome do Serviço" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Corte de Cabelo" error={errors.name} />
          <Input label="Duração (min)" id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 45" error={errors.duration} />
          <Input label="Preço (R$)" id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 50.00" error={errors.price} />
          <div className="pt-7">
            <Button type="submit" className="h-11 w-full">Adicionar</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold mb-4">Lista de Serviços</h3>
        <div className="overflow-x-auto">
          {isLoading ? <p>Carregando serviços...</p> : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Duração</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  editingId === service.id ? (
                    <tr key={service.id} className="bg-brand-dark-2">
                      <td className="p-2"><InlineInput name="name" value={editedData.name || ''} onChange={handleEditChange} error={editErrors.name} /></td>
                      <td className="p-2"><InlineInput name="duration" type="number" value={editedData.duration} onChange={handleEditChange} error={editErrors.duration} /></td>
                      <td className="p-2"><InlineInput name="price" type="number" step="0.01" value={editedData.price ?? ''} onChange={handleEditChange} error={editErrors.price} /></td>
                      <td className="p-2">
                        <div className="flex justify-end space-x-2">
                            <button onClick={handleSaveEdit} title="Salvar" className="text-green-400 hover:text-green-300"><CheckIcon className="h-5 w-5" /></button>
                            <button onClick={handleCancelEdit} title="Cancelar" className="text-gray-400 hover:text-white"><XIcon className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={service.id} className="border-b border-gray-800">
                      <td className="p-3">{service.name || 'Serviço Sem Nome'}</td>
                      <td className="p-3">{service.duration} min</td>
                      <td className="p-3">R$ {(service.price || 0).toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => handleStartEdit(service)} title="Editar" className="text-gray-400 hover:text-white"><EditIcon className="h-5 w-5" /></button>
                            <button onClick={() => deleteService(service.id)} title="Excluir" className="text-red-500 hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};