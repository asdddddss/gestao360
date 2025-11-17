import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase } from '../../../lib/mappers';
import type { Appointment } from '../../../types';

interface HeatmapReportViewProps {
    startDate?: Date;
    endDate?: Date;
}

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const HeatmapReportView: React.FC<HeatmapReportViewProps> = ({ startDate, endDate }) => {
    const { negocio } = useAppData();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!negocio || !startDate || !endDate) return;
        setIsLoading(true);
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        
        const { data } = await supabase
            .from('appointments')
            .select('start_time')
            .eq('barbershop_id', negocio.id)
            .gte('start_time', start.toISOString())
            .lte('start_time', end.toISOString());
            
        setAppointments(mapFromSupabase<Appointment[]>(data || []));
        setIsLoading(false);
    }, [negocio, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const heatmapData = useMemo(() => {
        const grid: number[][] = Array(24).fill(0).map(() => Array(7).fill(0));
        appointments.forEach(appt => {
            if (appt.startTime) {
                const date = new Date(appt.startTime);
                const hour = date.getHours();
                const day = date.getDay();
                if (grid[hour]) {
                    grid[hour][day]++;
                }
            }
        });
        return grid;
    }, [appointments]);

    const maxCount = useMemo(() => Math.max(1, ...heatmapData.flat()), [heatmapData]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-brand-dark';
        const opacity = Math.min(1, 0.1 + (count / maxCount) * 0.9);
        return `bg-brand-gold/${Math.round(opacity * 100)}`;
    };

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="p-2 border-r border-gray-700">Hora</th>
                            {daysOfWeek.map(day => <th key={day} className="p-2">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                             <tr><td colSpan={8} className="p-8 text-center">Carregando dados...</td></tr>
                        ) : hours.map((hour, hourIndex) => (
                            <tr key={hour} className="border-b border-gray-800">
                                <td className="p-2 font-semibold border-r border-gray-700">{hour}</td>
                                {daysOfWeek.map((_, dayIndex) => {
                                    const count = heatmapData[hourIndex]?.[dayIndex] || 0;
                                    return (
                                        <td key={`${hour}-${dayIndex}`} className="p-0">
                                            <div className={`w-full h-full p-2 ${getColor(count)}`} title={`${count} agendamentos`}>
                                                {count}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};