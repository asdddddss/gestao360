import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseClasses = "font-semibold text-white transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    md: "px-4 py-2 rounded-md",
    sm: "px-2 py-1 text-sm rounded-md",
  };
  
  const variantClasses = {
    primary: "bg-brand-gold hover:bg-yellow-500 text-brand-dark",
    secondary: "bg-brand-dark-2 hover:bg-gray-700 border border-brand-gold",
    danger: "bg-red-600 hover:bg-red-700",
  };

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};