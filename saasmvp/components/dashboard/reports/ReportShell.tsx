import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { DatePicker } from '../../ui/DatePicker';
import { ChevronLeftIcon } from '../../../lib/icons';

interface ReportShellProps {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}

export const ReportShell: React.FC<ReportShellProps> = ({ title, onBack, children }) => {
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
    
    // Pass date filters down to children
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { startDate, endDate } as any);
        }
        return child;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="!p-2 h-10 w-10">
                        <ChevronLeftIcon className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <p className="text-gray-400 text-sm">Analisando dados do seu negócio</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DatePicker label="" selectedDate={startDate} onDateChange={setStartDate} />
                    <span className="pt-5 text-gray-400">até</span>
                    <DatePicker label="" selectedDate={endDate} onDateChange={setEndDate} />
                </div>
            </div>
            
            <div>
                {childrenWithProps}
            </div>
        </div>
    );
};