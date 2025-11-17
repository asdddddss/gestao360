import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks/useAppData';
import { Logo } from '../ui/Logo';
import { 
    HomeIcon, CalendarIcon, ClipboardListIcon, UsersIcon, 
    UserIcon, SettingsIcon, LogOutIcon, DollarSignIcon,
    GlobeIcon, BotIcon, ShieldIcon, FileTextIcon,
    MessageSquareIcon,
    ArchiveIcon,
    TrendingUpIcon
} from '../../lib/icons';
import { Button } from '../ui/Button';

interface SidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick: () => void }> = ({ to, icon, label, onClick }) => {
    return (
        <NavLink
            to={to}
            end
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                    ? 'bg-brand-gold text-brand-dark'
                    : 'text-gray-300 hover:bg-brand-dark-2 hover:text-white'
                }`
            }
        >
            <span className="mr-3">{icon}</span>
            {label}
        </NavLink>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, closeSidebar }) => {
  const { logout, user, negocio } = useAppData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const isAdmin = user?.email === 'admin@admin.com';

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-dark border-r border-gray-700/50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700/50">
                <Logo />
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <NavItem to="/dashboard" icon={<HomeIcon className="h-5 w-5" />} label="Dashboard" onClick={closeSidebar} />
                <NavItem to="/dashboard/appointments" icon={<CalendarIcon className="h-5 w-5" />} label="Agenda" onClick={closeSidebar} />
                <NavItem to="/dashboard/clients" icon={<UsersIcon className="h-5 w-5" />} label="Clientes" onClick={closeSidebar} />
                <NavItem to="/dashboard/inactive-clients" icon={<MessageSquareIcon className="h-5 w-5" />} label="Clientes Inativos" onClick={closeSidebar} />
                <NavItem to="/dashboard/reports" icon={<TrendingUpIcon className="h-5 w-5" />} label="Relatórios" onClick={closeSidebar} />
                <NavItem to="/dashboard/finance" icon={<DollarSignIcon className="h-5 w-5" />} label="Financeiro" onClick={closeSidebar} />
                <NavItem to="/dashboard/services" icon={<ClipboardListIcon className="h-5 w-5" />} label="Serviços" onClick={closeSidebar} />
                <NavItem to="/dashboard/store" icon={<ArchiveIcon className="h-5 w-5" />} label="Loja" onClick={closeSidebar} />
                <NavItem to="/dashboard/professionals" icon={<UsersIcon className="h-5 w-5" />} label="Equipe" onClick={closeSidebar} />
                <NavItem to="/dashboard/subscriptions" icon={<FileTextIcon className="h-5 w-5" />} label="Assinaturas e Pacotes" onClick={closeSidebar} />
                <NavItem to="/dashboard/automations" icon={<BotIcon className="h-5 w-5" />} label="WhatsApp" onClick={closeSidebar} />
                <NavItem to="/dashboard/profile" icon={<SettingsIcon className="h-5 w-5" />} label="Configurações" onClick={closeSidebar} />
                <NavItem to="/dashboard/my-site" icon={<GlobeIcon className="h-5 w-5" />} label="Meu Site" onClick={closeSidebar} />
                
                {isAdmin && (
                    <div className="pt-4 mt-4 border-t border-gray-700/50">
                        <NavItem to="/dashboard/admin" icon={<ShieldIcon className="h-5 w-5" />} label="Painel Admin" onClick={closeSidebar} />
                    </div>
                )}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-700/50">
                <div className="text-center mb-4">
                    <p className="text-sm text-white font-semibold">{negocio?.name || 'Carregando...'}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <Button variant="secondary" className="w-full" onClick={handleLogout}>
                    <LogOutIcon className="h-5 w-5 mr-2" />
                    Sair da Conta
                </Button>
            </div>
        </div>
    </aside>
  );
};