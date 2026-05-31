'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client, Service, Appointment, SoapNote, Invoice } from '@/lib/types';

interface DashboardContextProps {
  // Therapist Settings
  therapistName: string;
  setTherapistName: (name: string) => void;
  therapistId: string;
  currency: string;
  setCurrency: (currency: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  address: string;
  setAddress: (address: string) => void;
  syncEnabled: boolean;
  setSyncEnabled: (enabled: boolean) => void;
  isSavingSettings: boolean;
  settingsSuccess: boolean;

  // Client database
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;

  // Services
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;

  // Appointments
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;

  // SOAP Notes
  soapNotes: SoapNote[];
  setSoapNotes: React.Dispatch<React.SetStateAction<SoapNote[]>>;

  // Invoices
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;

  // Invoice Filters & UI States
  invoiceFilter: 'all' | 'paid' | 'open' | 'overdue';
  setInvoiceFilter: (filter: 'all' | 'paid' | 'open' | 'overdue') => void;
  invoiceSearch: string;
  setInvoiceSearch: (search: string) => void;
  invoiceSubTab: 'list' | 'analytics';
  setInvoiceSubTab: (subTab: 'list' | 'analytics') => void;
  hoveredBarIndex: number | null;
  setHoveredBarIndex: (index: number | null) => void;
  activeInvoiceActionMenuId: string | null;
  setActiveInvoiceActionMenuId: (id: string | null) => void;

  // Toast
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  setToast: (toast: { message: string; type: 'success' | 'info' | 'error' } | null) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Client Documents
  clientDocuments: Record<string, { name: string; size: string }[]>;
  setClientDocuments: React.Dispatch<React.SetStateAction<Record<string, { name: string; size: string }[]>>>;

  // Modals & Navigation States
  isCmdkOpen: boolean;
  setIsCmdkOpen: (open: boolean) => void;
  isNewClientModalOpen: boolean;
  setIsNewClientModalOpen: (open: boolean) => void;
  isMailModalOpen: boolean;
  setIsMailModalOpen: (open: boolean) => void;
  isInvoiceMenuOpen: boolean;
  setIsInvoiceMenuOpen: (open: boolean) => void;
  isNewInvoiceSheetOpen: boolean;
  setIsNewInvoiceSheetOpen: (open: boolean) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;

  // Selected Profile/Appt/Mail references
  selectedAppointment: Appointment | null;
  setSelectedAppointment: (app: Appointment | null) => void;
  sheetMode: 'edit' | 'new';
  setSheetMode: (mode: 'edit' | 'new') => void;
  newAppDate: string;
  setNewAppDate: (date: string) => void;
  newAppHour: number;
  setNewAppHour: (hour: number) => void;
  newAppClientId: string;
  setNewAppClientId: (id: string) => void;
  newAppServiceId: string;
  setNewAppServiceId: (id: string) => void;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  clientSearch: string;
  setClientSearch: (search: string) => void;
  clientFilter: 'all' | 'upcoming' | 'invoices';
  setClientFilter: (filter: 'all' | 'upcoming' | 'invoices') => void;
  isFilterMenuOpen: boolean;
  setIsFilterMenuOpen: (open: boolean) => void;

  // SOAP Edit values
  soapEditId: string | null;
  setSoapEditId: (id: string | null) => void;
  soapSubjective: string;
  setSoapSubjective: (text: string) => void;
  soapObjective: string;
  setSoapObjective: (text: string) => void;
  soapAssessment: string;
  setSoapAssessment: (text: string) => void;
  soapPlan: string;
  setSoapPlan: (text: string) => void;

  // New Client Form values
  newClientName: string;
  setNewClientName: (name: string) => void;
  newClientBirthday: string;
  setNewClientBirthday: (date: string) => void;
  newClientEmail: string;
  setNewClientEmail: (email: string) => void;
  newClientPhone: string;
  setNewClientPhone: (phone: string) => void;
  newClientEmergency: string;
  setNewClientEmergency: (contact: string) => void;
  newClientNotes: string;
  setNewClientNotes: (notes: string) => void;

  // New Invoice Form values
  newInvoiceClientId: string;
  setNewInvoiceClientId: (id: string) => void;
  newInvoiceAmount: string;
  setNewInvoiceAmount: (amount: string) => void;
  newInvoiceDate: string;
  setNewInvoiceDate: (date: string) => void;
  newInvoiceNumber: string;
  setNewInvoiceNumber: (number: string) => void;
  newInvoiceStatus: 'open' | 'paid' | 'overdue';
  setNewInvoiceStatus: (status: 'open' | 'paid' | 'overdue') => void;
  newInvoiceAppointmentId: string | null;
  setNewInvoiceAppointmentId: (id: string | null) => void;

  // Email form values
  mailTopic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung';
  setMailTopic: (topic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung') => void;
  mailSubject: string;
  setMailSubject: (subject: string) => void;
  mailBody: string;
  setMailBody: (body: string) => void;
  selectedMailInvoiceId: string;
  setSelectedMailInvoiceId: (id: string) => void;
  selectedMailAppointmentId: string;
  setSelectedMailAppointmentId: (id: string) => void;

  // Calendar selections
  currentCalendarDate: Date;
  setCurrentCalendarDate: (date: Date) => void;
  calendarView: 'day' | 'week' | 'month';
  setCalendarView: (view: 'day' | 'week' | 'month') => void;

  // Drag-and-drop / Resizing
  draggedAppId: string | null;
  setDraggedAppId: (id: string | null) => void;
  dragOverSlot: { dateStr: string; hour: number } | null;
  setDragOverSlot: (slot: { dateStr: string; hour: number } | null) => void;
  resizingAppId: string | null;
  setResizingAppId: (id: string | null) => void;
  tempDuration: number | null;
  setTempDuration: (duration: number | null) => void;

  // Action methods
  saveSettings: (e: React.FormEvent) => Promise<void>;
  handleCreateClient: (e: React.FormEvent) => void;
  openNewInvoiceSheet: () => void;
  openNewInvoiceSheetWithPrefill: (prefill: {
    clientId: string;
    amount: number;
    appointmentId: string;
    clientName: string;
    date?: string;
  }) => void;
  handleContextMenu: (e: React.MouseEvent, app: Appointment) => void;
  handleCreateInvoice: (e: React.FormEvent) => void;
  applyMailTemplate: (
    topic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung',
    invoiceId?: string,
    appointmentId?: string,
    targetClient?: Client
  ) => void;
  handleSendMail: (e: React.FormEvent) => void;
  startEditSoap: (note: SoapNote) => void;
  saveSoapNote: () => void;
  createSoapNote: (appId: string, cliId: string) => void;
  createInvoice: (app: Appointment) => void;
  markInvoicePaid: (invId: string) => void;
  handleOpenMahnung: (inv: Invoice) => void;
  sendInvoiceEmail: (inv: Invoice) => void;
  downloadInvoicePdf: (inv: Invoice) => void;
  sendInvoiceReminder: (inv: Invoice) => void;
  cancelInvoice: (invId: string) => void;
  printInvoice: (inv: Invoice) => void;
  exportInvoicesCsv: () => void;

  // Context Menu state ref
  contextMenu: { x: number; y: number; appointment: Appointment } | null;
  setContextMenu: (menu: { x: number; y: number; appointment: Appointment } | null) => void;

  // Sign out
  handleSignOut: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [therapistName, setTherapistName] = useState('Praxis Ruether');
  const [therapistId, setTherapistId] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [phone, setPhone] = useState('+49 123 456789');
  const [address, setAddress] = useState('Hauptstraße 12, 10117 Berlin');
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);

  // Client database state
  const [clients, setClients] = useState<Client[]>([
    { id: 'c1', name: 'Alexander Hoffmann', birthday: '1984-05-12', email: 'alex@hoffmann.de', phone: '+49 176 1234567', emergencyContact: 'Sarah Hoffmann (Ehefrau) - +49 176 7654321', notes: 'Rückenschmerzen im Lendenbereich, Schreibtischtätigkeit.', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'c2', name: 'Emma Schmidt', birthday: '1992-11-23', email: 'emma.schmidt@gmx.de', phone: '+49 152 9887766', emergencyContact: 'Karl Schmidt (Vater) - +49 30 5551234', notes: 'Migräne-Patientin, wöchentliche Akupunktur.', createdAt: '2026-02-15T11:30:00Z' },
    { id: 'c3', name: 'Maximilian Müller', birthday: '1978-02-05', email: 'max.mueller@web.de', phone: '+49 171 5554433', emergencyContact: 'Dr. Becker (Hausarzt) - +49 171 1112223', notes: 'Reha nach Knie-OP, physiotherapeutische Betreuung.', createdAt: '2026-03-01T09:00:00Z' }
  ]);

  // Available Services
  const [services, setServices] = useState<Service[]>([
    { id: 's1', name: 'Physiotherapie Erstgespräch & Befund', duration: 60, price: 90.00 },
    { id: 's2', name: 'Klassische Massagetherapie', duration: 30, price: 45.00 },
    { id: 's3', name: 'Manuelle Therapie (MT)', duration: 45, price: 70.00 },
    { id: 's4', name: 'Osteopathische Behandlung', duration: 60, price: 110.00 }
  ]);

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 'a1', clientId: 'c1', clientName: 'Alexander Hoffmann', serviceId: 's1', serviceName: 'Physiotherapie Erstgespräch & Befund', price: 90.00, startTime: '2026-06-01T09:00:00.000Z', endTime: '2026-06-01T10:00:00.000Z', status: 'confirmed', notes: 'Erstgespräch und Bewegungsanalyse.' },
    { id: 'a2', clientId: 'c2', clientName: 'Emma Schmidt', serviceId: 's3', serviceName: 'Manuelle Therapie (MT)', price: 70.00, startTime: '2026-06-01T11:00:00.000Z', endTime: '2026-06-01T11:45:00.000Z', status: 'booked' },
    { id: 'a3', clientId: 'c3', clientName: 'Maximilian Müller', serviceId: 's4', serviceName: 'Osteopathische Behandlung', price: 110.00, startTime: '2026-06-02T14:00:00.000Z', endTime: '2026-06-02T15:00:00.000Z', status: 'confirmed' },
    { id: 'a4', clientId: 'c1', clientName: 'Alexander Hoffmann', serviceId: 's2', serviceName: 'Klassische Massagetherapie', price: 45.00, startTime: '2026-06-03T10:00:00.000Z', endTime: '2026-06-03T10:30:00.000Z', status: 'confirmed' },
    { id: 'a5', clientId: 'c2', clientName: 'Emma Schmidt', serviceId: 's1', serviceName: 'Physiotherapie Erstgespräch & Befund', price: 90.00, startTime: '2026-06-04T15:30:00.000Z', endTime: '2026-06-04T16:30:00.000Z', status: 'booked' }
  ]);

  // SOAP Notes
  const [soapNotes, setSoapNotes] = useState<SoapNote[]>([
    { 
      id: 'sn1', 
      appointmentId: 'a1', 
      clientId: 'c1', 
      date: '2026-06-01', 
      subjective: 'Kläger klagt über anhaltende Lendenwirbelschmerzen (L4/L5) nach längerem Sitzen. Intensität 6/10.', 
      objective: 'Eingeschränkte Flexion der LWS. Palpatorischer Hartspann M. erector spinae beidseitig.', 
      assessment: 'Verdacht auf haltungsbedingtes LWS-Syndrom bei verkürztem Iliopsoas.', 
      plan: 'Mobilisierung der LWS, Dehnung Iliopsoas, Eigenübungen für den Alltag mitgegeben (Katze-Kuh).' 
    }
  ]);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'i1', appointmentId: 'a1', clientId: 'c1', clientName: 'Alexander Hoffmann', invoiceNumber: 'RE-2026-0001', amount: 90.00, date: '2026-06-01', status: 'paid' },
    { id: 'i2', appointmentId: 'a3', clientId: 'c3', clientName: 'Maximilian Müller', invoiceNumber: 'RE-2026-0002', amount: 110.00, date: '2026-06-02', status: 'open' },
    { id: 'i3', appointmentId: 'a2', clientId: 'c2', clientName: 'Emma Schmidt', invoiceNumber: 'RE-2026-0003', amount: 70.00, date: '2026-06-03', status: 'paid' },
    { id: 'i4', appointmentId: 'a4', clientId: 'c1', clientName: 'Alexander Hoffmann', invoiceNumber: 'RE-2026-0004', amount: 45.00, date: '2026-05-15', status: 'overdue' }
  ]);

  // Invoice Filters & UI States
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'open' | 'overdue'>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceSubTab, setInvoiceSubTab] = useState<'list' | 'analytics'>('list');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [activeInvoiceActionMenuId, setActiveInvoiceActionMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Document attachments (Mock for GDPR uploads)
  const [clientDocuments, setClientDocuments] = useState<Record<string, { name: string; size: string }[]>>({
    c1: [
      { name: 'Anamnesebogen_Alexander.pdf', size: '245 KB' },
      { name: 'Befund_MRT_LWS_1.2MB.pdf', size: '1.2 MB' }
    ]
  });

  // Selected details sheet values
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'edit' | 'new'>('edit');
  const [newAppDate, setNewAppDate] = useState('');
  const [newAppHour, setNewAppHour] = useState(9);
  const [newAppClientId, setNewAppClientId] = useState('');
  const [newAppServiceId, setNewAppServiceId] = useState('');

  // Selected client profile values (under CRM tab)
  const [selectedClientId, setSelectedClientId] = useState<string>('c1');
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | 'upcoming' | 'invoices'>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [soapEditId, setSoapEditId] = useState<string | null>(null);
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');

  // Form states for creating new patients
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientBirthday, setNewClientBirthday] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmergency, setNewClientEmergency] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Email sending modal states
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isInvoiceMenuOpen, setIsInvoiceMenuOpen] = useState(false);
  const [isNewInvoiceSheetOpen, setIsNewInvoiceSheetOpen] = useState(false);
  const [newInvoiceClientId, setNewInvoiceClientId] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceDate, setNewInvoiceDate] = useState('');
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newInvoiceStatus, setNewInvoiceStatus] = useState<'open' | 'paid' | 'overdue'>('open');
  const [newInvoiceAppointmentId, setNewInvoiceAppointmentId] = useState<string | null>(null);
  const [mailTopic, setMailTopic] = useState<'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung'>('rechnung');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [selectedMailInvoiceId, setSelectedMailInvoiceId] = useState('');
  const [selectedMailAppointmentId, setSelectedMailAppointmentId] = useState('');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; appointment: Appointment } | null>(null);

  // Selected calendar date
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date('2026-06-01'));
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');

  // Drag and Drop & Resizing State
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ dateStr: string; hour: number } | null>(null);
  const [resizingAppId, setResizingAppId] = useState<string | null>(null);
  const [tempDuration, setTempDuration] = useState<number | null>(null);

  const initialYRef = useRef<number>(0);
  const initialDurationRef = useRef<number>(60);
  const tempDurationRef = useRef<number | null>(null);

  // Auth session check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        const redirectCount = parseInt(sessionStorage.getItem('dashboard_redirect_count') || '0', 10);
        if (redirectCount > 3) {
          console.error("Potential redirect loop detected on dashboard. Staying on page.");
          return;
        }
        sessionStorage.setItem('dashboard_redirect_count', (redirectCount + 1).toString());
        router.push('/login');
      } else {
        sessionStorage.removeItem('dashboard_redirect_count');
        const storedName = localStorage.getItem(`therapist_name_${session.user.id}`);
        if (storedName) setTherapistName(storedName);
        setTherapistId(session.user.id);
      }
    });
  }, [router]);

  // Window resize effect for snapper
  useEffect(() => {
    if (!resizingAppId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - initialYRef.current;
      const deltaMinutes = (deltaY / 88) * 60;
      let newDuration = initialDurationRef.current + deltaMinutes;

      // Snapping in 15 minute increments
      newDuration = Math.round(newDuration / 15) * 15;

      // Clamps
      if (newDuration < 15) newDuration = 15;

      const app = appointments.find(a => a.id === resizingAppId);
      if (app) {
        const start = new Date(app.startTime);
        const maxDuration = (17 - start.getHours()) * 60 - start.getMinutes();
        if (newDuration > maxDuration) {
          newDuration = maxDuration;
        }
      }

      setTempDuration(newDuration);
      tempDurationRef.current = newDuration;
    };

    const handleMouseUp = () => {
      if (tempDurationRef.current !== null) {
        const finalDuration = tempDurationRef.current;
        setAppointments(prev => prev.map(app => {
          if (app.id === resizingAppId) {
            const start = new Date(app.startTime);
            const end = new Date(start.getTime() + finalDuration * 60000);
            return {
              ...app,
              endTime: end.toISOString()
            };
          }
          return app;
        }));
      }
      setResizingAppId(null);
      setTempDuration(null);
      tempDurationRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingAppId, appointments]);

  // Clear toast alert auto timer
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Close context menu on click or scroll
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    window.addEventListener('contextmenu', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('contextmenu', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, []);

  // Sync settings saver
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    if (therapistId) {
      localStorage.setItem(`therapist_name_${therapistId}`, therapistName);
    }
    setTimeout(() => {
      setIsSavingSettings(false);
      setSettingsSuccess(true);
      showToast('Einstellungen erfolgreich gespeichert!', 'success');
      setTimeout(() => setSettingsSuccess(false), 3000);
    }, 800);
  };

  // Creating new Client / Patient
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    const newClient: Client = {
      id: `c-${Date.now()}`,
      name: newClientName,
      birthday: newClientBirthday || '1990-01-01',
      email: newClientEmail || 'patient@email.de',
      phone: newClientPhone || '',
      emergencyContact: newClientEmergency || '',
      notes: newClientNotes || '',
      createdAt: new Date().toISOString()
    };

    setClients(prev => [...prev, newClient]);
    setSelectedClientId(newClient.id);
    setIsNewClientModalOpen(false);
    showToast(`Patient ${newClient.name} wurde erfolgreich angelegt!`, 'success');

    // reset fields
    setNewClientName('');
    setNewClientBirthday('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientEmergency('');
    setNewClientNotes('');
  };

  // Open the new invoice sheet with pre-populated values
  const openNewInvoiceSheet = () => {
    if (clients.length > 0) {
      setNewInvoiceClientId(clients[0].id);
    } else {
      setNewInvoiceClientId('');
    }
    setNewInvoiceAmount('');
    const num = invoices.length + 1;
    setNewInvoiceNumber(`RE-2026-${num.toString().padStart(4, '0')}`);
    setNewInvoiceDate(new Date().toISOString().slice(0, 10));
    setNewInvoiceStatus('open');
    setNewInvoiceAppointmentId(null);
    setIsNewInvoiceSheetOpen(true);
  };

  // Open the new invoice sheet with prefilled appointment details
  const openNewInvoiceSheetWithPrefill = (prefill: {
    clientId: string;
    amount: number;
    appointmentId: string;
    clientName: string;
    date?: string;
  }) => {
    setNewInvoiceClientId(prefill.clientId);
    setNewInvoiceAmount(prefill.amount.toFixed(2));
    const dateVal = prefill.date || new Date().toISOString().slice(0, 10);
    setNewInvoiceDate(dateVal);
    const num = invoices.length + 1;
    setNewInvoiceNumber(`RE-2026-${num.toString().padStart(4, '0')}`);
    setNewInvoiceStatus('open');
    setNewInvoiceAppointmentId(prefill.appointmentId);
    setIsSheetOpen(false);
    setIsNewInvoiceSheetOpen(true);
  };

  // Handle Right Click context menu for calendar cards
  const handleContextMenu = (e: React.MouseEvent, app: Appointment) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      appointment: app
    });
  };

  // Creating new Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceClientId || !newInvoiceAmount) {
      showToast('Bitte Patient und Betrag eingeben.', 'error');
      return;
    }

    const selectedClient = clients.find(c => c.id === newInvoiceClientId);
    if (!selectedClient) {
      showToast('Ausgewählter Patient wurde nicht gefunden.', 'error');
      return;
    }

    const amount = parseFloat(newInvoiceAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      showToast('Ungültiger Betrag.', 'error');
      return;
    }

    const num = invoices.length + 1;
    const invNum = newInvoiceNumber.trim() || `RE-2026-${num.toString().padStart(4, '0')}`;
    const dateVal = newInvoiceDate || new Date().toISOString().slice(0, 10);

    const newInv: Invoice = {
      id: `i-${Date.now()}`,
      appointmentId: newInvoiceAppointmentId || `custom-${Date.now()}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      invoiceNumber: invNum,
      amount: amount,
      date: dateVal,
      status: newInvoiceStatus
    };

    setInvoices(prev => [...prev, newInv]);
    setIsNewInvoiceSheetOpen(false);
    showToast(`Rechnung ${invNum} über ${amount.toFixed(2)} € erstellt!`, 'success');

    // Reset fields
    setNewInvoiceClientId('');
    setNewInvoiceAmount('');
    setNewInvoiceDate('');
    setNewInvoiceNumber('');
    setNewInvoiceStatus('open');
    setNewInvoiceAppointmentId(null);
  };

  // Set template text for email writing modal
  const applyMailTemplate = (
    topic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung',
    invoiceId?: string,
    appointmentId?: string,
    targetClient?: Client
  ) => {
    const client = targetClient || clients.find(c => c.id === selectedClientId);
    if (!client) return;

    setMailTopic(topic);
    
    if (topic === 'rechnung') {
      const activeInvoiceId = invoiceId !== undefined ? invoiceId : selectedMailInvoiceId;
      const inv = invoices.find(i => i.id === activeInvoiceId && i.clientId === client.id);
      const invNum = inv ? inv.invoiceNumber : 'RE-XXXXX';
      const invAmount = inv ? `${inv.amount.toFixed(2)} €` : 'XX,XX €';
      setMailSubject(`Rechnung zu Ihrer Behandlung - ${invNum}`);
      setMailBody(`Sehr geehrte(r) ${client.name},\n\nanbei erhalten Sie die Rechnung ${invNum} über den Betrag von ${invAmount} zu Ihrer letzten Behandlung.\n\nBitte überweisen Sie den Betrag innerhalb von 14 Tagen.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'mahnung') {
      const activeInvoiceId = invoiceId !== undefined ? invoiceId : selectedMailInvoiceId;
      const inv = invoices.find(i => i.id === activeInvoiceId && i.clientId === client.id);
      const invNum = inv ? inv.invoiceNumber : 'RE-XXXXX';
      const invAmount = inv ? `${inv.amount.toFixed(2)} €` : 'XX,XX €';
      setMailSubject(`Zahlungserinnerung: Rechnung ${invNum} ausstehend`);
      setMailBody(`Sehr geehrte(r) ${client.name},\n\nwir möchten Sie höflich daran erinnern, dass die Rechnung ${invNum} über den Betrag von ${invAmount} fällig war.\n\nBitte überweisen Sie den ausstehenden Betrag baldmöglichst auf das Ihnen bekannte Praxiskonto.\n\nSollten Sie die Überweisung bereits getätigt haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'stornierung') {
      const activeAppointmentId = appointmentId !== undefined ? appointmentId : selectedMailAppointmentId;
      const app = appointments.find(a => a.id === activeAppointmentId && a.clientId === client.id);
      const appDateStr = app ? new Date(app.startTime).toLocaleDateString('de-DE') : 'TT.MM.JJJJ';
      const appTimeStr = app ? new Date(app.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'HH:MM';
      setMailSubject(`Absage Ihres Termins am ${appDateStr}`);
      setMailBody(`Sehr geehrte(r) ${client.name},\n\nhiermit bestätigen wir die Stornierung Ihres Termins am ${appDateStr} um ${appTimeStr} Uhr.\n\nGerne können Sie online oder telefonisch einen neuen Termin vereinbaren.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'bestaetigung') {
      const activeAppointmentId = appointmentId !== undefined ? appointmentId : selectedMailAppointmentId;
      const app = appointments.find(a => a.id === activeAppointmentId && a.clientId === client.id);
      const appDateStr = app ? new Date(app.startTime).toLocaleDateString('de-DE') : 'TT.MM.JJJJ';
      const appTimeStr = app ? new Date(app.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'HH:MM';
      const appService = app ? app.serviceName : 'Behandlung';
      setMailSubject(`Terminbestätigung: ${appService} am ${appDateStr}`);
      setMailBody(`Sehr geehrte(r) ${client.name},\n\nwir freuen uns, Ihren Termin für die Behandlung (${appService}) am ${appDateStr} um ${appTimeStr} Uhr zu bestätigen.\n\nSollten Sie den Termin nicht wahrnehmen können, sagen Sie diesen bitte mindestens 24 Stunden vorher ab.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else {
      setMailSubject('');
      setMailBody('');
    }
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    
    showToast(`E-Mail an ${client.name} wurde erfolgreich gesendet!`, 'success');
    setIsMailModalOpen(false);
  };

  // SOAP Edit panel activation
  const startEditSoap = (note: SoapNote) => {
    setSoapEditId(note.id);
    setSoapSubjective(note.subjective);
    setSoapObjective(note.objective);
    setSoapAssessment(note.assessment);
    setSoapPlan(note.plan);
  };

  const saveSoapNote = () => {
    if (!soapEditId) return;
    setSoapNotes(prev => prev.map(note => {
      if (note.id === soapEditId) {
        return {
          ...note,
          subjective: soapSubjective,
          objective: soapObjective,
          assessment: soapAssessment,
          plan: soapPlan
        };
      }
      return note;
    }));
    setSoapEditId(null);
    showToast('Therapiebericht erfolgreich gespeichert.', 'success');
  };

  const createSoapNote = (appId: string, cliId: string) => {
    const newNote: SoapNote = {
      id: `sn-${Date.now()}`,
      appointmentId: appId,
      clientId: cliId,
      date: new Date().toISOString().slice(0, 10),
      subjective: 'Patient berichtet...',
      objective: 'Palpation zeigt...',
      assessment: 'Verdacht auf...',
      plan: 'Therapie fortsetzen...'
    };
    setSoapNotes(prev => [...prev, newNote]);
    startEditSoap(newNote);
    showToast('Neuer Behandlungsbericht angelegt.', 'success');
  };

  // Invoicing preview/actions
  const createInvoice = (app: Appointment) => {
    const num = invoices.length + 1;
    const invNum = `RE-2026-${num.toString().padStart(4, '0')}`;
    const newInv: Invoice = {
      id: `i-${Date.now()}`,
      appointmentId: app.id,
      clientId: app.clientId,
      clientName: app.clientName,
      invoiceNumber: invNum,
      amount: app.price,
      date: new Date().toISOString().slice(0, 10),
      status: 'open'
    };
    setInvoices(prev => [...prev, newInv]);
    showToast(`Rechnung ${invNum} erfolgreich erstellt!`, 'success');
    if (selectedAppointment && selectedAppointment.id === app.id) {
      setSelectedAppointment({ ...selectedAppointment });
    }
  };

  const markInvoicePaid = (invId: string) => {
    setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, status: 'paid' } : inv));
    showToast('Rechnung als bezahlt markiert.', 'success');
    setActiveInvoiceActionMenuId(null);
  };

  const handleOpenMahnung = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    if (client) {
      setSelectedClientId(client.id);
      setSelectedMailInvoiceId(inv.id);
      applyMailTemplate('mahnung', inv.id, undefined, client);
      setIsMailModalOpen(true);
    } else {
      showToast('Patient konnte nicht gefunden werden.', 'error');
    }
  };

  const sendInvoiceEmail = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    const email = client?.email || 'patient@email.de';
    showToast(`Rechnung ${inv.invoiceNumber} erfolgreich an ${email} gesendet!`, 'success');
    setActiveInvoiceActionMenuId(null);
  };

  const downloadInvoicePdf = (inv: Invoice) => {
    const invoiceText = `
RECHNUNG: ${inv.invoiceNumber}
Datum: ${new Date(inv.date).toLocaleDateString('de-DE')}
Patient: ${inv.clientName}
Betrag: ${inv.amount.toFixed(2)} EUR
Status: ${inv.status.toUpperCase()}
Vielen Dank fuer Ihr Vertrauen!
`;
    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rechnung_${inv.invoiceNumber}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`PDF für Rechnung ${inv.invoiceNumber} heruntergeladen!`, 'success');
    setActiveInvoiceActionMenuId(null);
  };

  const sendInvoiceReminder = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    const email = client?.email || 'patient@email.de';
    showToast(`Zahlungserinnerung für ${inv.invoiceNumber} an ${email} gesendet!`, 'info');
    setActiveInvoiceActionMenuId(null);
  };

  const cancelInvoice = (invId: string) => {
    if (confirm('Möchtest du diese Rechnung wirklich stornieren?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== invId));
      showToast('Rechnung storniert.', 'info');
    }
    setActiveInvoiceActionMenuId(null);
  };

  // Invoice Printer
  const printInvoice = (inv: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Rechnung ${inv.invoiceNumber}</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; color: #191c1c; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #003527; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; color: #003527; }
              .title { font-size: 28px; font-weight: bold; margin-bottom: 20px; }
              .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
              .details div { line-height: 1.6; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #bfc9c3; }
              th { background-color: #f3f4f3; font-weight: bold; color: #003527; }
              .total { text-align: right; font-size: 18px; font-weight: bold; color: #003527; }
              .footer { margin-top: 80px; font-size: 11px; color: #404944; border-top: 1px solid #bfc9c3; padding-top: 20px; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">${therapistName}</div>
              <div>Datum: ${new Date(inv.date).toLocaleDateString('de-DE')}</div>
            </div>
            <div class="title">RECHNUNG</div>
            <div class="details">
              <div>
                <strong>Rechnungsempfänger:</strong><br>
                ${inv.clientName}
              </div>
              <div>
                <strong>Rechnungsdetails:</strong><br>
                Rechnungsnummer: ${inv.invoiceNumber}<br>
                Status: ${inv.status === 'paid' ? 'Bezahlt' : 'Offen'}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Beschreibung</th>
                  <th>Menge</th>
                  <th>Einzelpreis</th>
                  <th>Gesamtpreis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Therapeutische Behandlung / Physiotherapie</td>
                  <td>1</td>
                  <td>${inv.amount.toFixed(2)} €</td>
                  <td>${inv.amount.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
            <div class="total">Gesamtbetrag: ${inv.amount.toFixed(2)} €</div>
            <div class="footer">
              Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.<br>
              Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt ohne Abzug.<br>
              Vielen Dank für das Vertrauen!
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // CSV Export
  const exportInvoicesCsv = () => {
    let csv = 'Rechnungsnummer,Datum,Patient,Betrag,Status\n';
    invoices.forEach(inv => {
      csv += `"${inv.invoiceNumber}","${new Date(inv.date).toLocaleDateString('de-DE')}","${inv.clientName}",${inv.amount},"${inv.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rechnungen_${therapistName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <DashboardContext.Provider value={{
      therapistName, setTherapistName,
      therapistId,
      currency, setCurrency,
      phone, setPhone,
      address, setAddress,
      syncEnabled, setSyncEnabled,
      isSavingSettings,
      settingsSuccess,
      clients, setClients,
      services, setServices,
      appointments, setAppointments,
      soapNotes, setSoapNotes,
      invoices, setInvoices,
      invoiceFilter, setInvoiceFilter,
      invoiceSearch, setInvoiceSearch,
      invoiceSubTab, setInvoiceSubTab,
      hoveredBarIndex, setHoveredBarIndex,
      activeInvoiceActionMenuId, setActiveInvoiceActionMenuId,
      toast, setToast, showToast,
      clientDocuments, setClientDocuments,
      isCmdkOpen, setIsCmdkOpen,
      isNewClientModalOpen, setIsNewClientModalOpen,
      isMailModalOpen, setIsMailModalOpen,
      isInvoiceMenuOpen, setIsInvoiceMenuOpen,
      isNewInvoiceSheetOpen, setIsNewInvoiceSheetOpen,
      isSheetOpen, setIsSheetOpen,
      selectedAppointment, setSelectedAppointment,
      sheetMode, setSheetMode,
      newAppDate, setNewAppDate,
      newAppHour, setNewAppHour,
      newAppClientId, setNewAppClientId,
      newAppServiceId, setNewAppServiceId,
      selectedClientId, setSelectedClientId,
      clientSearch, setClientSearch,
      clientFilter, setClientFilter,
      isFilterMenuOpen, setIsFilterMenuOpen,
      soapEditId, setSoapEditId,
      soapSubjective, setSoapSubjective,
      soapObjective, setSoapObjective,
      soapAssessment, setSoapAssessment,
      soapPlan, setSoapPlan,
      newClientName, setNewClientName,
      newClientBirthday, setNewClientBirthday,
      newClientEmail, setNewClientEmail,
      newClientPhone, setNewClientPhone,
      newClientEmergency, setNewClientEmergency,
      newClientNotes, setNewClientNotes,
      newInvoiceClientId, setNewInvoiceClientId,
      newInvoiceAmount, setNewInvoiceAmount,
      newInvoiceDate, setNewInvoiceDate,
      newInvoiceNumber, setNewInvoiceNumber,
      newInvoiceStatus, setNewInvoiceStatus,
      newInvoiceAppointmentId, setNewInvoiceAppointmentId,
      mailTopic, setMailTopic,
      mailSubject, setMailSubject,
      mailBody, setMailBody,
      selectedMailInvoiceId, setSelectedMailInvoiceId,
      selectedMailAppointmentId, setSelectedMailAppointmentId,
      currentCalendarDate, setCurrentCalendarDate,
      calendarView, setCalendarView,
      draggedAppId, setDraggedAppId,
      dragOverSlot, setDragOverSlot,
      resizingAppId, setResizingAppId,
      tempDuration, setTempDuration,
      contextMenu, setContextMenu,
      saveSettings,
      handleCreateClient,
      openNewInvoiceSheet,
      openNewInvoiceSheetWithPrefill,
      handleContextMenu,
      handleCreateInvoice,
      applyMailTemplate,
      handleSendMail,
      startEditSoap,
      saveSoapNote,
      createSoapNote,
      createInvoice,
      markInvoicePaid,
      handleOpenMahnung,
      sendInvoiceEmail,
      downloadInvoicePdf,
      sendInvoiceReminder,
      cancelInvoice,
      printInvoice,
      exportInvoicesCsv,
      handleSignOut
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
