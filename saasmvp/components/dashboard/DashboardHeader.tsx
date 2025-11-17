import React from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../hooks/useAppData';
import { Button } from '../ui/Button';
import { ExternalLinkIcon, MenuIcon } from '../../lib/icons';

interface DashboardHeaderProps {
    toggleSidebar: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleSidebar }) => {
  const { negocio } = useAppData();

  return (
    <header className="bg-brand-dark border-b border-gray-700/50 p-4 flex justify-between items-center">
        <div className="flex items-center">
            <button onClick={toggleSidebar} title="Abrir menu" className="md:hidden text-gray-300 hover:text-white mr-4">
                <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        </div>
        <div>
            {negocio && (
                <Link to={`/${negocio.slug}`} target="_blank" title="Visualizar meu site">
                    <Button variant="secondary">
                        <span className="hidden sm:inline">Visualizar meu site</span>
                        <ExternalLinkIcon className="h-5 w-5 ml-0 sm:ml-2"/>
                    </Button>
                </Link>
            )}
        </div>
    </header>
  );
};