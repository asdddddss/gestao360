
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, id, children, error, ...props }) => {
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-brand-gold';
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={id}
        className={`w-full bg-brand-dark-2 border rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50 ${errorClasses}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
