import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from './Calendar';

interface DatePickerProps {
    label?: string;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, selectedDate, onDateChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const handleDateSelect = (date: Date) => {
        onDateChange(date);
        setIsOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [pickerRef]);
    
    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    return (
        <div className="relative w-full" ref={pickerRef}>
            {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-brand-dark-2 border rounded-md px-3 py-2 text-white text-left h-11 focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-brand-gold'}`}
            >
                {formatDate(selectedDate)}
            </button>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            
            {isOpen && (
                <div className="absolute z-10 mt-2 right-0">
                    <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
                </div>
            )}
        </div>
    );
};