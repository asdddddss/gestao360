
import type { Negocio, Service, Professional, Appointment, Transaction, TransactionCategory } from '../types';

// A robust mapper that converts a single object or an array of objects from snake_case to camelCase.
// It is now recursive to handle nested objects/arrays from Supabase joins.
// It also handles converting specific string fields from Supabase into Date objects.
export const mapFromSupabase = <T>(data: any): T => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(item => mapFromSupabase(item)) as T;
    }

    if (typeof data !== 'object' || data === null || data instanceof Date) {
        return data;
    }

    const snakeCaseDateKeys = ['start_time', 'date', 'next_payment_date', 'start_date', 'birth_date', 'created_at'];
    const mapped: { [key: string]: any } = {};

    for (const key in data) {
        let camelCaseKey = key.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
        if (camelCaseKey === 'barbershopId') {
            camelCaseKey = 'negocioId';
        }
        
        // Recursively map nested objects and arrays
        const value = mapFromSupabase(data[key]);

        // The original value (data[key]) must be used for date parsing checks
        if (snakeCaseDateKeys.includes(key) && typeof data[key] === 'string' && data[key]) {
            const parsedDate = new Date(data[key]);
            mapped[camelCaseKey] = isNaN(parsedDate.getTime()) ? null : parsedDate;
        } else {
            mapped[camelCaseKey] = value;
        }
    }
    return mapped as T;
};

// A robust mapper that converts a single object from camelCase to snake_case.
// It also handles converting Date objects into the appropriate string format for Supabase.
export const mapToSupabase = (data: any): any => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(item => mapToSupabase(item));
    }

    if (typeof data !== 'object' || data === null) {
        return data;
    }
    
    const mapped: { [key: string]: any } = {};
    const dateOnlyKeys = ['date', 'birth_date'];
    for (const key in data) {
        let snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (key === 'negocioId') {
            snakeCaseKey = 'barbershop_id';
        }
        
        const value = data[key];

        if (value instanceof Date) {
            // Supabase 'date' type expects 'YYYY-MM-DD'
            if (dateOnlyKeys.includes(snakeCaseKey)) {
                // Use en-CA locale for guaranteed YYYY-MM-DD format, handles timezones.
                mapped[snakeCaseKey] = value.toLocaleDateString('en-CA');
            } else { // Assumes timestamptz for other date objects
                mapped[snakeCaseKey] = value.toISOString();
            }
        } else {
            mapped[snakeCaseKey] = value;
        }
    }
    return mapped;
};
