import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../lib/icons';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, minDate }) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + offset, 1));
  };
  
  const minD = minDate ? new Date(minDate) : null;
  if (minD) minD.setHours(0,0,0,0);

  const renderDays = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const numDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Blanks for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`blank-${i}`} className="p-1"></div>);
    }

    // Days of the month
    for (let day = 1; day <= numDays; day++) {
      const currentDate = new Date(year, month, day);
      const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
      const isToday = new Date().toDateString() === currentDate.toDateString();
      const isDisabled = minD && currentDate < minD;
      
      let classNames = 'w-8 h-8 flex items-center justify-center rounded-full text-center transition-colors ';
      
      if (isDisabled) {
        classNames += 'text-gray-600 cursor-not-allowed';
      } else {
        if (isSelected) {
            classNames += 'bg-brand-gold text-brand-dark font-bold ';
        } else if (isToday) {
            classNames += 'bg-brand-dark ring-1 ring-brand-gold/50 ';
        } else {
             classNames += 'hover:bg-brand-gold/20 cursor-pointer ';
        }
      }
      

      days.push(
        <div key={day} className={classNames} onClick={() => !isDisabled && onDateSelect(currentDate)}>
          {day}
        </div>
      );
    }
    return days;
  };

  const monthYear = displayDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-brand-dark-2 p-4 rounded-lg shadow-lg text-white w-72">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-brand-dark"><ChevronLeftIcon className="w-5 h-5" /></button>
        <span className="font-bold text-lg capitalize whitespace-nowrap">
          {monthYear}
        </span>
        <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-brand-dark"><ChevronRightIcon className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm text-center text-gray-400 mb-2">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {renderDays()}
      </div>
    </div>
  );
};