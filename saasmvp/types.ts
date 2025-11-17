// types.ts

export type DayHours = {
  open: string;
  close: string;
  closed: boolean;
};

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface Negocio {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  operatingHours: OperatingHours | null;
  plan: 'basic' | 'premium';
  status: 'active' | 'inactive';
}

export interface Service {
  id: string;
  negocioId: string;
  name: string | null;
  duration: number; // in minutes
  price: number | null;
}

export interface Professional {
  id: string;
  negocioId: string;
  name: string | null;
  photoUrl: string | null;
  services: string[]; // array of service IDs
  commissionType: 'percentage' | 'fixed';
  commissionValue: number | null;
  baseSalary: number | null;
  workingHours?: OperatingHours | null;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'paid';

export interface Client {
    id: string;
    negocioId: string;
    name: string | null;
    phone: string;
    email?: string;
    notes?: string;
    birthDate?: Date | null;
    createdAt?: Date;
}

export interface Appointment {
  id: string;
  negocioId: string;
  clientId: string;
  serviceId: string;
  professionalId: string;
  startTime: Date | null;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  tip: number;
}

export type PlanFrequency = 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';

export interface Plan {
    id: string;
    negocioId: string;
    name: string | null;
    price: number | null;
    frequency: PlanFrequency;
    description?: string;
    professionalId?: string;
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface ClientSubscription {
    id:string;
    clientId: string;
    planId: string;
    startDate: Date | null;
    status: SubscriptionStatus;
    nextPaymentDate?: Date | null;
}


// --- NEW FINANCIAL TYPES ---

export type TransactionType = 'revenue' | 'expense' | 'investment';
export type TransactionSourceType = 'appointment' | 'subscription' | 'manual_revenue' | 'manual_expense' | 'manual_investment' | 'product_sale';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'pix' | 'prepaid' | 'other';

export interface TransactionCategory {
    id: string;
    negocioId: string;
    name: string;
    type: 'revenue' | 'expense' | 'investment';
    group?: string; // e.g., 'Despesas Fixas'
    relationType: 'none' | 'professional' | 'supplier';
    status: 'active' | 'inactive';
}

export interface Transaction {
    id: string;
    negocioId: string;
    type: TransactionType;
    amount: number;
    description: string;
    date: Date | null;
    sourceType?: TransactionSourceType;
    sourceId?: string; // e.g., appointment ID or subscription ID
    categoryId?: string;
    clientId?: string;
    professionalId?: string;
    serviceId?: string;
    paymentMethod?: PaymentMethod;
}

export interface Product {
    id: string;
    negocioId: string;
    name: string;
    stockQuantity: number;
    salePrice: number;
    costPrice: number;
    minStockAlert: number;
}

export interface ProductSale {
    id: string;
    negocioId: string;
    transactionId: string;
    productId: string;
    quantity: number;
    salePriceAtTime: number;
    costPriceAtTime: number;
    createdAt: Date;
}

export interface ProfessionalPayment {
    id: string;
    negocioId: string;
    professionalId: string;
    startDate: Date;
    endDate: Date;
    totalToPay: number;
    revenueGenerated: number;
    commission: number;
    tips: number;
    baseSalary: number;
    deductions: number;
    paymentDate: Date;
    transactionId: string | null;
    createdAt: Date;
}