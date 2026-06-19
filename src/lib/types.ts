export interface Client {
  id: string;
  name: string;
  salutation?: 'Frau' | 'Herr' | 'Keine' | string;
  firstName?: string;
  lastName?: string;
  birthday: string;
  email: string;
  phone: string;
  emergencyContact: string;
  notes?: string;
  createdAt: string;
  isFavorite?: boolean;
  isFlagged?: boolean;
  gdprAccepted?: boolean;
}


export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number; // in EUR
}

export interface Appointment {
  id: string;
  clientId: string | null;
  clientName: string;
  serviceId: string | null;
  serviceName: string;
  price: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'booked' | 'confirmed' | 'cancelled' | 'noshow' | string;
  notes?: string;
}

export interface SoapNote {
  id: string;
  appointmentId: string;
  clientId: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  status: 'paid' | 'open' | 'overdue';
}
