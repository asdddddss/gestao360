
import React from 'react';
import { RefreshCwIcon } from '../../lib/icons';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
        <RefreshCwIcon className="h-8 w-8 text-brand-gold" />
        <span className="text-2xl font-bold text-white">Gestão 360</span>
    </div>
  );
};