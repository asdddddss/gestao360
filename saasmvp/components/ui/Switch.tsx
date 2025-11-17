import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, id, disabled = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange(e.target.checked);
  };
  
  const cursorClass = disabled ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <label htmlFor={id} className={`flex items-center ${cursorClass}`}>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${checked ? 'bg-brand-gold' : 'bg-brand-dark'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${checked ? 'transform translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
};