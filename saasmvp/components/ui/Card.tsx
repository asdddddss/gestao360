import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-brand-dark-2 p-6 rounded-lg shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
};
