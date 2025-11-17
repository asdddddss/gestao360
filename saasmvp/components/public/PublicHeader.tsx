import React from 'react';
import type { Negocio } from '../../types';
import { Button } from '../ui/Button';

interface PublicHeaderProps {
  negocio: Negocio;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ negocio }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-brand-dark/80 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <img src={negocio.logoUrl || ''} alt={`${negocio.name} Logo`} className="h-12 w-12 rounded-full object-cover border-2 border-brand-gold"/>
            <span className="text-2xl font-bold text-white">{negocio.name}</span>
        </div>
        <nav className="hidden md:flex space-x-6">
            <a href="#sobre" onClick={(e) => handleNavClick(e, 'sobre')} className="text-gray-300 hover:text-brand-gold transition-colors">Sobre</a>
            <a href="#servicos" onClick={(e) => handleNavClick(e, 'servicos')} className="text-gray-300 hover:text-brand-gold transition-colors">Serviços</a>
            <a href="#equipe" onClick={(e) => handleNavClick(e, 'equipe')} className="text-gray-300 hover:text-brand-gold transition-colors">Equipe</a>
            <a href="#produtos" onClick={(e) => handleNavClick(e, 'produtos')} className="text-gray-300 hover:text-brand-gold transition-colors">Produtos</a>
            <a href="#horarios" onClick={(e) => handleNavClick(e, 'horarios')} className="text-gray-300 hover:text-brand-gold transition-colors">Horários</a>
        </nav>
        <a href="#agendar" onClick={(e) => handleNavClick(e, 'agendar')}>
            <Button>Agendar Agora</Button>
        </a>
      </div>
    </header>
  );
};