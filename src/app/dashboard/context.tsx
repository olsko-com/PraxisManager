'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client, Service, Appointment, SoapNote, Invoice, InvoiceLineItem, ClientSnapshot } from '@/lib/types';

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
  taxNumber: string;
  setTaxNumber: (num: string) => void;
  vatId: string;
  setVatId: (id: string) => void;
  iban: string;
  setIban: (iban: string) => void;
  bic: string;
  setBic: (bic: string) => void;
  isSmallBusiness: boolean;
  setIsSmallBusiness: (val: boolean) => void;
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
  createService: (newSrv: Omit<Service, 'id'>) => Promise<Service | null>;

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
  invoiceFilter: 'all' | 'paid' | 'open' | 'overdue' | 'draft';
  setInvoiceFilter: (filter: 'all' | 'paid' | 'open' | 'overdue' | 'draft') => void;
  invoiceSearch: string;
  setInvoiceSearch: (search: string) => void;
  invoiceSubTab: 'list' | 'analytics';
  setInvoiceSubTab: (subTab: 'list' | 'analytics') => void;
  hoveredBarIndex: number | null;
  setHoveredBarIndex: (index: number | null) => void;
  activeInvoiceActionMenuId: string | null;
  setActiveInvoiceActionMenuId: (id: string | null) => void;
  getUnbilledAppointments: () => Appointment[];
  getBilledInvoiceForAppointment: (apptId: string) => Invoice | undefined;

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
  prefillInvoice: Invoice | null;
  setPrefillInvoice: (inv: Invoice | null) => void;
  isEditingDraft: boolean;
  setIsEditingDraft: (val: boolean) => void;
  isViewingInvoice: boolean;
  setIsViewingInvoice: (val: boolean) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  isGdprModalOpen: boolean;
  setIsGdprModalOpen: (open: boolean) => void;
  gdprClientId: string | null;
  setGdprClientId: (id: string | null) => void;
  openGdprModal: (clientId: string) => void;

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
  clientFilter: 'all' | 'upcoming' | 'invoices' | 'archived';
  setClientFilter: (filter: 'all' | 'upcoming' | 'invoices' | 'archived') => void;
  isFilterMenuOpen: boolean;
  setIsFilterMenuOpen: (open: boolean) => void;

  // SOAP Edit values
  soapEditId: string | null;
  setSoapEditId: (id: string | null) => void;
  soapDate: string;
  setSoapDate: (date: string) => void;
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
  mailTopic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung' | 'erinnerung' | 'fragebogen' | 'dsgvo';
  setMailTopic: (topic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung' | 'erinnerung' | 'fragebogen' | 'dsgvo') => void;
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
  dragOverSlot: { dateStr: string; hour: number; minutes?: number } | null;
  setDragOverSlot: (slot: { dateStr: string; hour: number; minutes?: number } | null) => void;
  resizingAppId: string | null;
  setResizingAppId: (id: string | null) => void;
  tempDuration: number | null;
  setTempDuration: (duration: number | null) => void;
  startResizing: (appId: string, clientY: number, initialDuration: number) => void;

  // Action methods
  saveSettings: (e: React.FormEvent) => Promise<void>;
  handleCreateClient: (
    salutation: string,
    firstName: string,
    lastName: string,
    birthday: string,
    email: string,
    phone: string,
    emergencyContact: string,
    notes: string,
    address?: string,
    occupation?: string,
    maritalStatus?: string,
    street?: string,
    houseNumber?: string,
    zipCode?: string,
    city?: string,
    children?: string
  ) => Promise<boolean>;
  deleteClient: (id: string) => Promise<void>;
  archiveClient: (id: string) => Promise<void>;
  restoreClient: (id: string) => Promise<void>;
  updateClientName: (id: string, name: string) => Promise<void>;
  updateClientDetails: (id: string, updatedFields: Partial<Client>) => Promise<boolean>;
  deleteService: (id: string) => Promise<void>;
  updateService: (id: string, name: string) => Promise<void>;
  toggleClientFavorite: (id: string) => void;
  toggleClientFlag: (id: string) => void;
  toggleClientGdpr: (id: string) => void;
  addAppointment: (app: Omit<Appointment, 'clientName' | 'serviceName' | 'price'> & { serviceName?: string; price?: number }) => Promise<void>;
  updateAppointment: (app: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  openNewInvoiceSheet: () => void;
  openNewInvoiceSheetWithPrefill: (prefill: {
    clientId: string;
    amount: number;
    appointmentId: string;
    clientName: string;
    date?: string;
  }) => void;
  handleContextMenu: (e: React.MouseEvent, app: Appointment) => void;
  handleClientContextMenu: (e: React.MouseEvent, client: Client) => void;
  handleInvoiceContextMenu: (e: React.MouseEvent, invoice: Invoice) => void;
  handleCreateInvoice: (
    e: React.FormEvent | null,
    lineItems: InvoiceLineItem[],
    dueDate: string,
    serviceDate: string,
    notes?: string,
    isReverseCharge?: boolean,
    clientVatId?: string,
    asDraft?: boolean
  ) => Promise<boolean>;
  handleUpdateDraftInvoice: (
    invoiceId: string,
    lineItems: InvoiceLineItem[],
    dueDate: string,
    serviceDate: string,
    notes?: string,
    isReverseCharge?: boolean,
    clientVatId?: string,
    finalize?: boolean
  ) => Promise<boolean>;
  deleteDraftInvoice: (invoiceId: string) => Promise<boolean>;
  generateGdprLink: (clientId: string) => Promise<string | null>;
  applyMailTemplate: (
    topic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung' | 'erinnerung' | 'fragebogen' | 'dsgvo',
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
  cancelInvoice: (invId: string) => Promise<boolean>;
  printInvoice: (inv: Invoice) => void;
  exportInvoicesCsv: () => void;

  // Context Menu state ref
  contextMenu: { x: number; y: number; type: 'appointment' | 'client' | 'invoice'; appointment?: Appointment; client?: Client; invoice?: Invoice } | null;
  setContextMenu: (menu: { x: number; y: number; type: 'appointment' | 'client' | 'invoice'; appointment?: Appointment; client?: Client; invoice?: Invoice } | null) => void;

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
  const [taxNumber, setTaxNumber] = useState('');
  const [vatId, setVatId] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [isSmallBusiness, setIsSmallBusiness] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);

  // Client database state
  const [clients, setClients] = useState<Client[]>([]);

  // Available Services
  const [services, setServices] = useState<Service[]>([]);

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // SOAP Notes
  const [soapNotes, setSoapNotes] = useState<SoapNote[]>([]);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Invoice Filters & UI States
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'open' | 'overdue' | 'draft'>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceSubTab, setInvoiceSubTab] = useState<'list' | 'analytics'>('list');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [activeInvoiceActionMenuId, setActiveInvoiceActionMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const getInvoiceStatus = (status: string, dueDate?: string) => {
    if (status === 'open' && dueDate) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (dueDate < todayStr) {
        return 'overdue';
      }
    }
    return status as 'open' | 'paid' | 'overdue' | 'cancelled';
  };

  // Document attachments (Mock for GDPR uploads)
  const [clientDocuments, setClientDocuments] = useState<Record<string, { name: string; size: string }[]>>({});

  // Selected details sheet values
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'edit' | 'new'>('edit');
  const [newAppDate, setNewAppDate] = useState('');
  const [newAppHour, setNewAppHour] = useState(9);
  const [newAppClientId, setNewAppClientId] = useState('');
  const [newAppServiceId, setNewAppServiceId] = useState('');

  // Selected client profile values (under CRM tab)
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | 'upcoming' | 'invoices' | 'archived'>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [soapEditId, setSoapEditId] = useState<string | null>(null);
  const [soapDate, setSoapDate] = useState('');
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

  // GDPR Consent Modal state
  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);
  const [gdprClientId, setGdprClientId] = useState<string | null>(null);

  const openGdprModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setGdprClientId(clientId);
    setIsGdprModalOpen(true);
  };

  // Email sending modal states
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isInvoiceMenuOpen, setIsInvoiceMenuOpen] = useState(false);
  const [isNewInvoiceSheetOpen, setIsNewInvoiceSheetOpen] = useState(false);
  const [prefillInvoice, setPrefillInvoice] = useState<Invoice | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [isViewingInvoice, setIsViewingInvoice] = useState(false);
  const [newInvoiceClientId, setNewInvoiceClientId] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceDate, setNewInvoiceDate] = useState('');
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newInvoiceStatus, setNewInvoiceStatus] = useState<'open' | 'paid' | 'overdue'>('open');
  const [newInvoiceAppointmentId, setNewInvoiceAppointmentId] = useState<string | null>(null);
  const [mailTopic, setMailTopic] = useState<'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung' | 'erinnerung' | 'fragebogen' | 'dsgvo'>('rechnung');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [selectedMailInvoiceId, setSelectedMailInvoiceId] = useState('');
  const [selectedMailAppointmentId, setSelectedMailAppointmentId] = useState('');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'appointment' | 'client' | 'invoice'; appointment?: Appointment; client?: Client; invoice?: Invoice } | null>(null);

  // Selected calendar date
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');

  // Drag and Drop & Resizing State
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ dateStr: string; hour: number; minutes?: number } | null>(null);
  const [resizingAppId, setResizingAppId] = useState<string | null>(null);
  const [tempDuration, setTempDuration] = useState<number | null>(null);

  const initialYRef = useRef<number>(0);
  const initialDurationRef = useRef<number>(60);
  const tempDurationRef = useRef<number | null>(null);

  const startResizing = (appId: string, clientY: number, initialDuration: number) => {
    setResizingAppId(appId);
    initialYRef.current = clientY;
    initialDurationRef.current = initialDuration;
    setTempDuration(initialDuration);
    tempDurationRef.current = initialDuration;
  };

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

  // Load data from Supabase once therapistId is set
  useEffect(() => {
    if (!therapistId) return;

    const fetchDashboardData = async () => {
      try {
        // 1. Fetch practice details
        const { data: practice } = await supabase
          .from('practices')
          .select('*')
          .eq('user_id', therapistId)
          .maybeSingle();
        if (practice) {
          setTherapistName(practice.name);
          setCurrency(practice.currency);
          if (practice.address) setAddress(practice.address);
          if (practice.phone) setPhone(practice.phone);
          if (practice.tax_number) setTaxNumber(practice.tax_number);
          if (practice.vat_id) setVatId(practice.vat_id);
          if (practice.iban) setIban(practice.iban);
          if (practice.bic) setBic(practice.bic);
          if (practice.is_small_business !== undefined) setIsSmallBusiness(practice.is_small_business);
        }

        // 2. Fetch clients
        const { data: dbClients } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', therapistId);
        
        let loadedClients: Client[] = [];
        if (dbClients) {
          // Load favorites and flags from localStorage
          const favs = JSON.parse(localStorage.getItem(`client_favs_${therapistId}`) || '[]');
          const flags = JSON.parse(localStorage.getItem(`client_flags_${therapistId}`) || '[]');
          const gdpr = JSON.parse(localStorage.getItem(`client_gdpr_${therapistId}`) || '[]');
          const archived = JSON.parse(localStorage.getItem(`client_archived_${therapistId}`) || '[]');
          const childrenMap = JSON.parse(localStorage.getItem(`client_children_${therapistId}`) || '{}');

          loadedClients = dbClients.map(c => {
            let salutation = 'Keine';
            let firstName = '';
            let lastName = '';
            
            const rawName = c.name || '';
            if (rawName.includes('|')) {
              const parts = rawName.split('|');
              if (parts.length === 3) {
                salutation = parts[0];
                firstName = parts[1];
                lastName = parts[2];
              } else if (parts.length === 2) {
                firstName = parts[0];
                lastName = parts[1];
              }
            } else {
              // Fallback parser for plain names
              const parts = rawName.trim().split(/\s+/);
              if (parts.length > 1) {
                lastName = parts.pop() || '';
                firstName = parts.join(' ');
              } else {
                firstName = rawName;
                lastName = '';
              }
            }

            return {
              id: c.id,
              name: `${firstName} ${lastName}`.trim(),
              salutation,
              firstName,
              lastName,
              birthday: c.birthday,
              email: c.email,
              phone: c.phone || '',
              emergencyContact: c.emergency_contact || '',
              notes: c.notes || '',
              createdAt: c.created_at,
              isFavorite: favs.includes(c.id),
              isFlagged: flags.includes(c.id),
              isArchived: archived.includes(c.id),
              gdprAccepted: c.gdpr_accepted || gdpr.includes(c.id),
              gdprToken: c.gdpr_token,
              gdprTokenExpiresAt: c.gdpr_token_expires_at,
              gdprSignature: c.gdpr_signature,
              gdprSignedAt: c.gdpr_signed_at,
              address: c.address || '',
              street: c.street || '',
              houseNumber: c.house_number || '',
              zipCode: c.zip_code || '',
              city: c.city || '',
              occupation: c.occupation || '',
              maritalStatus: c.marital_status || '',
              children: childrenMap[c.id] || 'Keine Angabe'
            };
          });
          setClients(loadedClients);
          if (loadedClients.length > 0) {
            setSelectedClientId(prev => {
              const hasSelected = loadedClients.some(cl => cl.id === prev);
              return (!hasSelected || prev === 'c1') ? loadedClients[0].id : prev;
            });
          } else {
            setSelectedClientId('');
          }
        }

        // 3. Fetch services
        const { data: dbServices } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', therapistId);
        
        let loadedServices: Service[] = [];
        if (dbServices) {
          loadedServices = dbServices.map(s => ({
            id: s.id,
            name: s.name,
            duration: s.duration,
            price: s.price
          }));
          setServices(loadedServices);
        }

        // 4. Fetch appointments
        const { data: dbAppointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', therapistId);
        
        if (dbAppointments) {
          const mappedAppointments = dbAppointments.map(app => {
            let clientName = 'Gelöschter Klient';
            let serviceName = 'Gelöschte Leistung';
            let price = 0;
            let currentStatus = app.status;

            if (!app.client_id) {
              clientName = 'Interner Blocker';
              if (app.status && app.status.startsWith('blocker:')) {
                const parts = app.status.replace('blocker:', '').split('|');
                serviceName = parts[0] || 'Interner Termin';
                currentStatus = parts[1] || 'confirmed';
              } else {
                serviceName = 'Interner Termin';
                currentStatus = 'confirmed';
              }
            } else {
              const client = loadedClients.find(c => c.id === app.client_id);
              if (client) clientName = client.name;

              if (app.service_id) {
                const service = loadedServices.find(s => s.id === app.service_id);
                if (service) {
                  serviceName = service.name;
                  price = service.price;
                }
              } else if (app.status && app.status.startsWith('custom_service:')) {
                const parts = app.status.replace('custom_service:', '').split('|');
                serviceName = parts[0] || 'Freie Behandlung';
                price = parseFloat(parts[1]) || 0;
                currentStatus = parts[2] || 'booked';
              }
            }

            // Load appointment notes from localStorage
            const appNotes = localStorage.getItem(`app_notes_${app.id}`) || '';
            return {
              id: app.id,
              clientId: app.client_id,
              clientName,
              serviceId: app.service_id,
              serviceName,
              price,
              startTime: app.start_time,
              endTime: app.end_time,
              status: currentStatus,
              notes: appNotes
            };
          });
          setAppointments(mappedAppointments);
        }

        // 5. Fetch SOAP notes
        const { data: dbSoapNotes } = await supabase
          .from('soap_notes')
          .select('*')
          .eq('user_id', therapistId);
        
        if (dbSoapNotes) {
          const mappedSoap = dbSoapNotes.map(n => ({
            id: n.id,
            appointmentId: n.appointment_id,
            clientId: n.client_id,
            date: n.date,
            subjective: n.subjective || '',
            objective: n.objective || '',
            assessment: n.assessment || '',
            plan: n.plan || ''
          }));
          setSoapNotes(mappedSoap);
        }

        // 6. Fetch Invoices
        const { data: dbInvoices } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', therapistId);
        
        if (dbInvoices) {
          const mappedInvoices = dbInvoices.map(inv => {
            const client = loadedClients.find(c => c.id === inv.client_id);
            return {
              id: inv.id,
              appointmentId: inv.appointment_id,
              clientId: inv.client_id,
              clientName: client ? client.name : (inv.client_snapshot?.name || 'Gelöschter Klient'),
              invoiceNumber: inv.invoice_number,
              amount: inv.amount,
              date: inv.date,
              status: getInvoiceStatus(inv.status, inv.due_date),
              dueDate: inv.due_date || '',
              serviceDate: inv.service_date || '',
              clientSnapshot: inv.client_snapshot || {
                name: client ? client.name : 'Gelöschter Klient',
                email: client ? client.email : '',
                phone: client ? client.phone : '',
                address: client ? client.address : '',
                street: client ? client.street : '',
                houseNumber: client ? client.houseNumber : '',
                zipCode: client ? client.zipCode : '',
                city: client ? client.city : ''
              },
              lineItems: inv.line_items || [],
              isSmallBusiness: inv.is_small_business || false,
              relatedInvoiceId: inv.related_invoice_id || null,
              notes: inv.notes || ''
            };
          });
          setInvoices(mappedInvoices);
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      }
    };

    fetchDashboardData();
  }, [therapistId]);

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
      const { error } = await supabase
        .from('practices')
        .upsert({
          user_id: therapistId,
          name: therapistName,
          currency: currency,
          address: address,
          phone: phone,
          tax_number: taxNumber,
          vat_id: vatId,
          iban: iban,
          bic: bic,
          is_small_business: isSmallBusiness
        });
      if (error) {
        showToast(`Fehler beim Speichern: ${error.message}`, 'error');
      }
    }
    setTimeout(() => {
      setIsSavingSettings(false);
      setSettingsSuccess(true);
      showToast('Einstellungen erfolgreich gespeichert!', 'success');
      setTimeout(() => setSettingsSuccess(false), 3000);
    }, 800);
  };

  // Creating new Client / Patient
  const handleCreateClient = async (
    salutation: string,
    firstName: string,
    lastName: string,
    birthday: string,
    email: string,
    phone: string,
    emergencyContact: string,
    notes: string,
    address: string = '',
    occupation: string = '',
    maritalStatus: string = '',
    street: string = '',
    houseNumber: string = '',
    zipCode: string = '',
    city: string = '',
    children: string = 'Keine Angabe'
  ): Promise<boolean> => {
    if (!firstName || !lastName || !therapistId) return false;

    const clientId = crypto.randomUUID();
    const newClient: Client = {
      id: clientId,
      name: `${firstName} ${lastName}`.trim(),
      salutation,
      firstName,
      lastName,
      birthday: birthday || '1990-01-01',
      email: email || 'klient@email.de',
      phone: phone || '',
      emergencyContact: emergencyContact || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      isFavorite: false,
      isFlagged: false,
      gdprAccepted: false,
      address,
      street,
      houseNumber,
      zipCode,
      city,
      occupation,
      maritalStatus,
      children
    };

    // Save children status to localStorage since it's not in Postgres schema
    const childrenMap = JSON.parse(localStorage.getItem(`client_children_${therapistId}`) || '{}');
    childrenMap[clientId] = children;
    localStorage.setItem(`client_children_${therapistId}`, JSON.stringify(childrenMap));

    const { error } = await supabase
      .from('clients')
      .insert({
        id: clientId,
        user_id: therapistId,
        name: `${salutation}|${firstName}|${lastName}`,
        birthday: birthday || '1990-01-01',
        email: email || 'klient@email.de',
        phone: phone || '',
        emergency_contact: emergencyContact || '',
        notes: notes || '',
        address,
        street,
        house_number: houseNumber,
        zip_code: zipCode,
        city,
        occupation,
        marital_status: maritalStatus
      });

    if (error) {
      showToast(`Fehler beim Erstellen des Klienten: ${error.message}`, 'error');
      return false;
    }

    setClients(prev => [...prev, newClient]);
    setSelectedClientId(newClient.id);
    showToast(`Klient ${newClient.name} wurde erfolgreich angelegt!`, 'success');
    return true;
  };

  // Archiving Patient
  const archiveClient = async (id: string) => {
    if (!therapistId) return;
    const archived = JSON.parse(localStorage.getItem(`client_archived_${therapistId}`) || '[]');
    if (!archived.includes(id)) {
      const newArchived = [...archived, id];
      localStorage.setItem(`client_archived_${therapistId}`, JSON.stringify(newArchived));
      setClients(prev => prev.map(cl => cl.id === id ? { ...cl, isArchived: true } : cl));
      
      // Select another client if the currently selected one was archived
      setSelectedClientId(prev => {
        if (prev === id) {
          const remaining = clients.filter(c => c.id !== id && !JSON.parse(localStorage.getItem(`client_archived_${therapistId}`) || '[]').includes(c.id));
          return remaining.length > 0 ? remaining[0].id : '';
        }
        return prev;
      });
      
      showToast('Klient erfolgreich archiviert.', 'success');
    }
  };

  // Restoring Patient from Archive
  const restoreClient = async (id: string) => {
    if (!therapistId) return;
    const archived = JSON.parse(localStorage.getItem(`client_archived_${therapistId}`) || '[]');
    const newArchived = archived.filter((f: string) => f !== id);
    localStorage.setItem(`client_archived_${therapistId}`, JSON.stringify(newArchived));
    setClients(prev => prev.map(cl => cl.id === id ? { ...cl, isArchived: false } : cl));
    showToast('Klient erfolgreich wiederhergestellt.', 'success');
  };

  // Deleting Patient Permanently
  const deleteClient = async (id: string) => {
    if (!therapistId) return;
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      showToast(`Fehler beim Löschen des Klienten: ${error.message}`, 'error');
      return;
    }

    const favs = JSON.parse(localStorage.getItem(`client_favs_${therapistId}`) || '[]');
    localStorage.setItem(`client_favs_${therapistId}`, JSON.stringify(favs.filter((f: string) => f !== id)));
    const flags = JSON.parse(localStorage.getItem(`client_flags_${therapistId}`) || '[]');
    localStorage.setItem(`client_flags_${therapistId}`, JSON.stringify(flags.filter((f: string) => f !== id)));
    const gdpr = JSON.parse(localStorage.getItem(`client_gdpr_${therapistId}`) || '[]');
    localStorage.setItem(`client_gdpr_${therapistId}`, JSON.stringify(gdpr.filter((f: string) => f !== id)));
    const archived = JSON.parse(localStorage.getItem(`client_archived_${therapistId}`) || '[]');
    localStorage.setItem(`client_archived_${therapistId}`, JSON.stringify(archived.filter((f: string) => f !== id)));

    setClients(prev => prev.filter(cl => cl.id !== id));
    showToast('Klient endgültig gelöscht.', 'success');
  };

  // Update Patient Name
  const updateClientName = async (id: string, newName: string) => {
    if (!therapistId) return;
    const client = clients.find(c => c.id === id);
    if (!client) return;

    const parts = newName.trim().split(/\s+/);
    let firstName = newName;
    let lastName = '';
    if (parts.length > 1) {
      lastName = parts.pop() || '';
      firstName = parts.join(' ');
    }

    const dbName = `${client.salutation || 'Keine'}|${firstName}|${lastName}`;
    const { error } = await supabase
      .from('clients')
      .update({ name: dbName })
      .eq('id', id);

    if (error) {
      showToast(`Fehler beim Aktualisieren des Klientennamens: ${error.message}`, 'error');
      return;
    }

    setClients(prev => prev.map(c => c.id === id ? { ...c, name: newName.trim(), firstName, lastName } : c));
    showToast('Klientenname erfolgreich aktualisiert.', 'success');
  };

  // Update Patient Details
  const updateClientDetails = async (id: string, updatedFields: Partial<Client>): Promise<boolean> => {
    if (!therapistId) return false;
    const client = clients.find(c => c.id === id);
    if (!client) return false;

    if (updatedFields.children !== undefined) {
      const currentMap = JSON.parse(localStorage.getItem(`client_children_${therapistId}`) || '{}');
      currentMap[id] = updatedFields.children;
      localStorage.setItem(`client_children_${therapistId}`, JSON.stringify(currentMap));
    }

    const dbUpdate: any = {};
    if (updatedFields.firstName !== undefined || updatedFields.lastName !== undefined || updatedFields.salutation !== undefined) {
      const sal = updatedFields.salutation !== undefined ? updatedFields.salutation : (client.salutation || 'Keine');
      const first = updatedFields.firstName !== undefined ? updatedFields.firstName : (client.firstName || '');
      const last = updatedFields.lastName !== undefined ? updatedFields.lastName : (client.lastName || '');
      dbUpdate.name = `${sal}|${first}|${last}`;
    }
    if (updatedFields.birthday !== undefined) dbUpdate.birthday = updatedFields.birthday;
    if (updatedFields.email !== undefined) dbUpdate.email = updatedFields.email;
    if (updatedFields.phone !== undefined) dbUpdate.phone = updatedFields.phone;
    if (updatedFields.emergencyContact !== undefined) dbUpdate.emergency_contact = updatedFields.emergencyContact;
    if (updatedFields.notes !== undefined) dbUpdate.notes = updatedFields.notes;
    if (updatedFields.address !== undefined) dbUpdate.address = updatedFields.address;
    if (updatedFields.street !== undefined) dbUpdate.street = updatedFields.street;
    if (updatedFields.houseNumber !== undefined) dbUpdate.house_number = updatedFields.houseNumber;
    if (updatedFields.zipCode !== undefined) dbUpdate.zip_code = updatedFields.zipCode;
    if (updatedFields.city !== undefined) dbUpdate.city = updatedFields.city;
    if (updatedFields.occupation !== undefined) dbUpdate.occupation = updatedFields.occupation;
    if (updatedFields.maritalStatus !== undefined) dbUpdate.marital_status = updatedFields.maritalStatus;
    if (updatedFields.gdprAccepted !== undefined) dbUpdate.gdpr_accepted = updatedFields.gdprAccepted;

    const { error } = await supabase
      .from('clients')
      .update(dbUpdate)
      .eq('id', id);

    if (error) {
      showToast(`Fehler beim Aktualisieren der Klientendaten: ${error.message}`, 'error');
      return false;
    }

    setClients(prev => prev.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updatedFields };
        if (updatedFields.firstName !== undefined || updatedFields.lastName !== undefined) {
          const first = updatedFields.firstName !== undefined ? updatedFields.firstName : (c.firstName || '');
          const last = updatedFields.lastName !== undefined ? updatedFields.lastName : (c.lastName || '');
          merged.name = `${first} ${last}`.trim();
        }
        return merged;
      }
      return c;
    }));

    showToast('Klientendaten erfolgreich aktualisiert.', 'success');
    return true;
  };

  // Toggling Patient Favorite
  const toggleClientFavorite = (id: string) => {
    if (!therapistId) return;
    const favs = JSON.parse(localStorage.getItem(`client_favs_${therapistId}`) || '[]');
    let newFavs;
    if (favs.includes(id)) {
      newFavs = favs.filter((f: string) => f !== id);
    } else {
      newFavs = [...favs, id];
    }
    localStorage.setItem(`client_favs_${therapistId}`, JSON.stringify(newFavs));
    setClients(prev => prev.map(cl => cl.id === id ? { ...cl, isFavorite: !cl.isFavorite } : cl));
  };

  // Toggling Patient Flag
  const toggleClientFlag = (id: string) => {
    if (!therapistId) return;
    const flags = JSON.parse(localStorage.getItem(`client_flags_${therapistId}`) || '[]');
    let newFlags;
    if (flags.includes(id)) {
      newFlags = flags.filter((f: string) => f !== id);
    } else {
      newFlags = [...flags, id];
    }
    localStorage.setItem(`client_flags_${therapistId}`, JSON.stringify(newFlags));
    setClients(prev => prev.map(cl => cl.id === id ? { ...cl, isFlagged: !cl.isFlagged } : cl));
  };

  // Toggling GDPR Consent status
  const toggleClientGdpr = async (id: string) => {
    if (!therapistId) return;
    const client = clients.find(c => c.id === id);
    if (!client) return;

    const nextAccepted = !client.gdprAccepted;

    // Update in Supabase
    const { error } = await supabase
      .from('clients')
      .update({ 
        gdpr_accepted: nextAccepted,
        // If revoking, clear signature and signed_at
        ...(nextAccepted ? {} : { gdpr_signature: null, gdpr_signed_at: null })
      })
      .eq('id', id);

    if (error) {
      showToast(`Fehler beim Aktualisieren: ${error.message}`, 'error');
      return;
    }

    const gdpr = JSON.parse(localStorage.getItem(`client_gdpr_${therapistId}`) || '[]');
    let newGdpr;
    if (client.gdprAccepted) {
      newGdpr = gdpr.filter((f: string) => f !== id);
      showToast('DSGVO-Einwilligung widerrufen.', 'info');
    } else {
      newGdpr = [...gdpr, id];
      showToast('DSGVO-Einwilligung erteilt.', 'success');
    }
    localStorage.setItem(`client_gdpr_${therapistId}`, JSON.stringify(newGdpr));
    setClients(prev => prev.map(cl => cl.id === id ? { ...cl, gdprAccepted: nextAccepted, gdprSignature: nextAccepted ? cl.gdprSignature : null, gdprSignedAt: nextAccepted ? cl.gdprSignedAt : null } : cl));
  };

  // Create Service
  const createService = async (newSrv: Omit<Service, 'id'>) => {
    if (!therapistId) return null;
    const id = crypto.randomUUID();
    const { error } = await supabase
      .from('services')
      .insert({
        id,
        user_id: therapistId,
        name: newSrv.name,
        duration: newSrv.duration,
        price: newSrv.price
      });

    if (error) {
      showToast(`Fehler beim Erstellen der Leistung: ${error.message}`, 'error');
      return null;
    }

    const created: Service = {
      id,
      name: newSrv.name,
      duration: newSrv.duration,
      price: newSrv.price
    };

    setServices(prev => [...prev, created]);
    showToast('Leistung erfolgreich erstellt.', 'success');
    return created;
  };

  // Delete Service
  const deleteService = async (id: string) => {
    if (!therapistId) return;
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      showToast(`Fehler beim Löschen der Leistung: ${error.message}`, 'error');
      return;
    }

    setServices(prev => prev.filter(s => s.id !== id));
    if (newAppServiceId === id) {
      setNewAppServiceId('');
    }
    showToast('Leistung erfolgreich gelöscht.', 'success');
  };

  // Update Service
  const updateService = async (id: string, name: string) => {
    if (!therapistId) return;
    const { error } = await supabase
      .from('services')
      .update({ name })
      .eq('id', id);

    if (error) {
      showToast(`Fehler beim Aktualisieren der Leistung: ${error.message}`, 'error');
      return;
    }

    setServices(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    showToast('Leistung erfolgreich aktualisiert.', 'success');
  };

  // Add Appointment
  const addAppointment = async (newApp: Omit<Appointment, 'clientName' | 'serviceName' | 'price'> & { serviceName?: string; price?: number }) => {
    if (!therapistId) return;

    let dbClientId = newApp.clientId || null;
    let dbServiceId = newApp.serviceId || null;
    let dbStatus = newApp.status;

    let finalClientName = 'Gelöschter Klient';
    let finalServiceName = 'Gelöschte Leistung';
    let finalPrice = 0;

    if (!newApp.clientId) {
      // Blocker
      finalClientName = 'Interner Blocker';
      finalServiceName = newApp.serviceName || 'Interner Termin';
      finalPrice = 0;
      dbStatus = `blocker:${finalServiceName}|${newApp.status}`;
    } else {
      const cli = clients.find(c => c.id === newApp.clientId);
      if (cli) finalClientName = cli.name;

      if (newApp.serviceId) {
        const srv = services.find(s => s.id === newApp.serviceId);
        if (srv) {
          finalServiceName = srv.name;
          finalPrice = srv.price;
        }
      } else {
        // Custom Service
        finalServiceName = newApp.serviceName || 'Freie Behandlung';
        finalPrice = newApp.price || 0;
        dbStatus = `custom_service:${finalServiceName}|${finalPrice}|${newApp.status}`;
      }
    }

    const { error } = await supabase
      .from('appointments')
      .insert({
        id: newApp.id,
        user_id: therapistId,
        client_id: dbClientId,
        service_id: dbServiceId,
        start_time: newApp.startTime,
        end_time: newApp.endTime,
        status: dbStatus
      });

    if (error) {
      showToast(`Fehler beim Erstellen des Termins: ${error.message}`, 'error');
      return;
    }

    const fullApp: Appointment = {
      ...newApp,
      clientId: dbClientId,
      serviceId: dbServiceId,
      clientName: finalClientName,
      serviceName: finalServiceName,
      price: finalPrice,
      status: newApp.status,
      notes: newApp.notes || ''
    };

    if (newApp.notes) {
      localStorage.setItem(`app_notes_${newApp.id}`, newApp.notes);
    }

    setAppointments(prev => [...prev, fullApp]);
    showToast('Termin erfolgreich eingetragen.', 'success');
  };

  // Update Appointment
  const updateAppointment = async (updated: Appointment) => {
    if (!therapistId) return;

    let dbStatus = updated.status;
    if (!updated.clientId) {
      dbStatus = `blocker:${updated.serviceName}|${updated.status}`;
    } else if (!updated.serviceId) {
      dbStatus = `custom_service:${updated.serviceName}|${updated.price}|${updated.status}`;
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        start_time: updated.startTime,
        end_time: updated.endTime,
        status: dbStatus
      })
      .eq('id', updated.id);

    if (error) {
      showToast(`Fehler beim Aktualisieren des Termins: ${error.message}`, 'error');
      return;
    }

    if (updated.notes !== undefined) {
      localStorage.setItem(`app_notes_${updated.id}`, updated.notes || '');
    }

    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  // Delete Appointment
  const deleteAppointment = async (id: string) => {
    if (!therapistId) return;
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      showToast(`Fehler beim Löschen des Termins: ${error.message}`, 'error');
      return;
    }

    localStorage.removeItem(`app_notes_${id}`);
    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast('Termin erfolgreich gelöscht.', 'success');
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
    setPrefillInvoice(null);
    setIsEditingDraft(false);
    setIsViewingInvoice(false);
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
    setPrefillInvoice(null);
    setIsEditingDraft(false);
    setIsViewingInvoice(false);
    setIsSheetOpen(false);
    setIsNewInvoiceSheetOpen(true);
  };

  // Handle Right Click context menu for calendar cards
  const handleContextMenu = (e: React.MouseEvent, app: Appointment) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'appointment',
      appointment: app
    });
  };

  // Handle Right Click context menu for client records
  const handleClientContextMenu = (e: React.MouseEvent, client: Client) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'client',
      client: client
    });
  };

  // Handle Right Click context menu for invoice records
  const handleInvoiceContextMenu = (e: React.MouseEvent, invoice: Invoice) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'invoice',
      invoice: invoice
    });
  };

  // Creating new Invoice
  const handleCreateInvoice = async (
    e: React.FormEvent | null,
    lineItems: InvoiceLineItem[],
    dueDate: string,
    serviceDate: string,
    notes: string = '',
    isReverseCharge: boolean = false,
    clientVatId: string = '',
    asDraft: boolean = false
  ) => {
    if (e) e.preventDefault();
    if (!newInvoiceClientId || !newInvoiceAmount || !therapistId) {
      showToast('Bitte Klient und Betrag eingeben.', 'error');
      return false;
    }

    const selectedClient = clients.find(c => c.id === newInvoiceClientId);
    if (!selectedClient) {
      showToast('Ausgewählter Klient wurde nicht gefunden.', 'error');
      return false;
    }

    const amount = parseFloat(newInvoiceAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      showToast('Ungültiger Betrag.', 'error');
      return false;
    }

    const num = invoices.filter(i => i.status !== 'draft').length + 1;
    const invNum = asDraft 
      ? `DRAFT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
      : (newInvoiceNumber.trim() || `RE-2026-${num.toString().padStart(4, '0')}`);

    // Prevent duplicate invoice numbers (GoBD compliance) only if not draft
    if (!asDraft) {
      const isDuplicate = invoices.some(i => i.invoiceNumber.trim().toLowerCase() === invNum.trim().toLowerCase());
      if (isDuplicate) {
        showToast(`Die Rechnungsnummer "${invNum}" ist bereits vergeben. Bitte wählen Sie eine andere Nummer.`, 'error');
        return false;
      }
    }

    const dateVal = newInvoiceDate || new Date().toISOString().slice(0, 10);
    const invoiceId = crypto.randomUUID();
    const apptId = newInvoiceAppointmentId || null;

    // Create client snapshot to preserve history (GoBD compliant)
    const clientSnapshot: ClientSnapshot = {
      name: selectedClient.name,
      email: selectedClient.email,
      phone: selectedClient.phone,
      address: selectedClient.address || '',
      street: selectedClient.street || '',
      houseNumber: selectedClient.houseNumber || '',
      zipCode: selectedClient.zipCode || '',
      city: selectedClient.city || '',
      vatId: clientVatId || undefined
    };

    const statusVal = asDraft ? 'draft' : newInvoiceStatus;

    const { error } = await supabase
      .from('invoices')
      .insert({
        id: invoiceId,
        user_id: therapistId,
        appointment_id: apptId,
        client_id: selectedClient.id,
        invoice_number: invNum,
        amount: amount,
        date: dateVal,
        status: statusVal,
        due_date: dueDate || null,
        service_date: serviceDate || null,
        client_snapshot: clientSnapshot,
        line_items: lineItems,
        is_small_business: isSmallBusiness,
        is_reverse_charge: isReverseCharge,
        notes: notes
      });

    if (error) {
      showToast(`Fehler beim Erstellen der Rechnung: ${error.message}`, 'error');
      return false;
    }

    const newInv: Invoice = {
      id: invoiceId,
      appointmentId: apptId || `custom-${Date.now()}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      invoiceNumber: invNum,
      amount: amount,
      date: dateVal,
      status: asDraft ? 'draft' : getInvoiceStatus(newInvoiceStatus, dueDate),
      dueDate: dueDate,
      serviceDate: serviceDate,
      clientSnapshot: clientSnapshot,
      lineItems: lineItems,
      isSmallBusiness: isSmallBusiness,
      isReverseCharge: isReverseCharge,
      notes: notes
    };

    setInvoices(prev => [...prev, newInv]);
    setIsNewInvoiceSheetOpen(false);
    setPrefillInvoice(null);
    if (asDraft) {
      showToast(`Entwurf ${invNum} erstellt!`, 'success');
    } else {
      showToast(`Rechnung ${invNum} über ${amount.toFixed(2)} € erstellt!`, 'success');
    }

    // Reset fields
    setNewInvoiceClientId('');
    setNewInvoiceAmount('');
    setNewInvoiceDate('');
    setNewInvoiceNumber('');
    setNewInvoiceStatus('open');
    setNewInvoiceAppointmentId(null);
    return true;
  };

  const handleUpdateDraftInvoice = async (
    invoiceId: string,
    lineItems: InvoiceLineItem[],
    dueDate: string,
    serviceDate: string,
    notes: string = '',
    isReverseCharge: boolean = false,
    clientVatId: string = '',
    finalize: boolean = false
  ) => {
    if (!newInvoiceClientId || !newInvoiceAmount || !therapistId) {
      showToast('Bitte Klient und Betrag eingeben.', 'error');
      return false;
    }

    const selectedClient = clients.find(c => c.id === newInvoiceClientId);
    if (!selectedClient) {
      showToast('Ausgewählter Klient wurde nicht gefunden.', 'error');
      return false;
    }

    const amount = parseFloat(newInvoiceAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      showToast('Ungültiger Betrag.', 'error');
      return false;
    }

    // Determine invoice number
    let invNum = newInvoiceNumber.trim();
    if (finalize) {
      const num = invoices.filter(i => i.status !== 'draft').length + 1;
      invNum = invNum || `RE-2026-${num.toString().padStart(4, '0')}`;
      
      // Prevent duplicates
      const isDuplicate = invoices.some(i => i.id !== invoiceId && i.invoiceNumber.trim().toLowerCase() === invNum.trim().toLowerCase());
      if (isDuplicate) {
        showToast(`Die Rechnungsnummer "${invNum}" ist bereits vergeben. Bitte wählen Sie eine andere Nummer.`, 'error');
        return false;
      }
    } else {
      // Keep existing draft number or generate one if missing
      const existing = invoices.find(i => i.id === invoiceId);
      invNum = existing?.invoiceNumber.startsWith('DRAFT-') ? existing.invoiceNumber : `DRAFT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    }

    const dateVal = newInvoiceDate || new Date().toISOString().slice(0, 10);
    const statusVal = finalize ? getInvoiceStatus('open', dueDate) : 'draft';

    const clientSnapshot: ClientSnapshot = {
      name: selectedClient.name,
      email: selectedClient.email,
      phone: selectedClient.phone,
      address: selectedClient.address || '',
      street: selectedClient.street || '',
      houseNumber: selectedClient.houseNumber || '',
      zipCode: selectedClient.zipCode || '',
      city: selectedClient.city || '',
      vatId: clientVatId || undefined
    };

    const { error } = await supabase
      .from('invoices')
      .update({
        client_id: selectedClient.id,
        appointment_id: newInvoiceAppointmentId || null,
        invoice_number: invNum,
        amount: amount,
        date: dateVal,
        status: finalize ? 'open' : 'draft',
        due_date: dueDate || null,
        service_date: serviceDate || null,
        client_snapshot: clientSnapshot,
        line_items: lineItems,
        is_small_business: isSmallBusiness,
        is_reverse_charge: isReverseCharge,
        notes: notes
      })
      .eq('id', invoiceId);

    if (error) {
      showToast(`Fehler beim Aktualisieren des Entwurfs: ${error.message}`, 'error');
      return false;
    }

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          clientId: selectedClient.id,
          clientName: selectedClient.name,
          appointmentId: newInvoiceAppointmentId || null,
          invoiceNumber: invNum,
          amount: amount,
          date: dateVal,
          status: statusVal,
          dueDate: dueDate,
          serviceDate: serviceDate,
          clientSnapshot: clientSnapshot,
          lineItems: lineItems,
          isSmallBusiness: isSmallBusiness,
          isReverseCharge: isReverseCharge,
          notes: notes
        };
      }
      return inv;
    }));

    setIsNewInvoiceSheetOpen(false);
    setPrefillInvoice(null);
    setIsEditingDraft(false);
    
    if (finalize) {
      showToast(`Rechnung ${invNum} über ${amount.toFixed(2)} € finalisiert und gesperrt!`, 'success');
    } else {
      showToast(`Entwurf ${invNum} aktualisiert!`, 'success');
    }

    // Reset fields
    setNewInvoiceClientId('');
    setNewInvoiceAmount('');
    setNewInvoiceDate('');
    setNewInvoiceNumber('');
    setNewInvoiceStatus('open');
    setNewInvoiceAppointmentId(null);
    return true;
  };

  const deleteDraftInvoice = async (invoiceId: string) => {
    if (!confirm('Möchtest du diesen Entwurf wirklich unwiderruflich löschen?')) {
      return false;
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('status', 'draft');

    if (error) {
      showToast(`Fehler beim Löschen des Entwurfs: ${error.message}`, 'error');
      return false;
    }

    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    showToast('Entwurf gelöscht.', 'success');
    setActiveInvoiceActionMenuId(null);
    return true;
  };

  const getUnbilledAppointments = () => {
    const now = new Date();
    return appointments.filter(app => {
      if (!app.clientId) return false;
      if (app.status === 'cancelled') return false;
      const apptEnd = new Date(app.endTime);
      if (apptEnd > now) return false;
      return !invoices.some(inv => inv.appointmentId === app.id && inv.status !== 'cancelled');
    });
  };

  const getBilledInvoiceForAppointment = (apptId: string) => {
    return invoices.find(inv => inv.appointmentId === apptId && inv.status !== 'cancelled');
  };

  // Set template text for email writing modal
  const applyMailTemplate = (
    topic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom' | 'mahnung' | 'erinnerung' | 'fragebogen' | 'dsgvo',
    invoiceId?: string,
    appointmentId?: string,
    targetClient?: Client
  ) => {
    const client = targetClient || clients.find(c => c.id === selectedClientId);
    if (!client) return;

    setMailTopic(topic);
    
    let greeting = `Sehr geehrte(r) ${client.name}`;
    let informalGreeting = `Hallo ${client.firstName || client.name}`;

    if (client.salutation === 'Frau' && client.lastName) {
      greeting = `Sehr geehrte Frau ${client.lastName}`;
      informalGreeting = `Hallo Frau ${client.lastName}`;
    } else if (client.salutation === 'Herr' && client.lastName) {
      greeting = `Sehr geehrter Herr ${client.lastName}`;
      informalGreeting = `Hallo Herr ${client.lastName}`;
    } else if (client.salutation === 'Keine' && client.firstName) {
      greeting = `Hallo ${client.firstName}`;
      informalGreeting = `Hallo ${client.firstName}`;
    }
    
    if (topic === 'rechnung') {
      const activeInvoiceId = invoiceId !== undefined ? invoiceId : selectedMailInvoiceId;
      const inv = invoices.find(i => i.id === activeInvoiceId && i.clientId === client.id);
      const invNum = inv ? inv.invoiceNumber : 'RE-XXXXX';
      const invAmount = inv ? `${inv.amount.toFixed(2)} €` : 'XX,XX €';
      setMailSubject(`Rechnung zu Ihrer Behandlung - ${invNum}`);
      setMailBody(`${greeting},\n\nanbei erhalten Sie die Rechnung ${invNum} über den Betrag von ${invAmount} zu Ihrer letzten Behandlung.\n\nBitte überweisen Sie den Betrag innerhalb von 14 Tagen.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'mahnung') {
      const activeInvoiceId = invoiceId !== undefined ? invoiceId : selectedMailInvoiceId;
      const inv = invoices.find(i => i.id === activeInvoiceId && i.clientId === client.id);
      const invNum = inv ? inv.invoiceNumber : 'RE-XXXXX';
      const invAmount = inv ? `${inv.amount.toFixed(2)} €` : 'XX,XX €';
      setMailSubject(`Zahlungserinnerung: Rechnung ${invNum} ausstehend`);
      setMailBody(`${greeting},\n\nwir möchten Sie höflich daran erinnern, dass die Rechnung ${invNum} über den Betrag von ${invAmount} fällig war.\n\nBitte überweisen Sie den ausstehenden Betrag baldmöglichst auf das Ihnen bekannte Praxiskonto.\n\nSollten Sie die Überweisung bereits getätigt haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'stornierung') {
      const activeAppointmentId = appointmentId !== undefined ? appointmentId : selectedMailAppointmentId;
      const app = appointments.find(a => a.id === activeAppointmentId && a.clientId === client.id);
      const appDateStr = app ? new Date(app.startTime).toLocaleDateString('de-DE') : 'TT.MM.JJJJ';
      const appTimeStr = app ? new Date(app.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'HH:MM';
      setMailSubject(`Absage Ihres Termins am ${appDateStr}`);
      setMailBody(`${greeting},\n\nhiermit bestätigen wir die Stornierung Ihres Termins am ${appDateStr} um ${appTimeStr} Uhr.\n\nGerne können Sie online oder telefonisch einen neuen Termin vereinbaren.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'bestaetigung') {
      const activeAppointmentId = appointmentId !== undefined ? appointmentId : selectedMailAppointmentId;
      const app = appointments.find(a => a.id === activeAppointmentId && a.clientId === client.id);
      const appDateStr = app ? new Date(app.startTime).toLocaleDateString('de-DE') : 'TT.MM.JJJJ';
      const appTimeStr = app ? new Date(app.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'HH:MM';
      const appService = app ? app.serviceName : 'Behandlung';
      setMailSubject(`Terminbestätigung: ${appService} am ${appDateStr}`);
      setMailBody(`${greeting},\n\nwir freuen uns, Ihren Termin für die Behandlung (${appService}) am ${appDateStr} um ${appTimeStr} Uhr zu bestätigen.\n\nSollten Sie den Termin nicht wahrnehmen können, sagen Sie diesen bitte mindestens 24 Stunden vorher ab.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'erinnerung') {
      const clientAppointments = appointments.filter(a => a.clientId === client.id);
      const futureApps = clientAppointments.filter(a => new Date(a.startTime).getTime() >= new Date().getTime());
      const nextApp = futureApps.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || clientAppointments[0];
      
      const appDate = nextApp ? new Date(nextApp.startTime) : null;
      let dayName = 'kommenden Werktag';
      if (appDate) {
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        dayName = `kommenden ${days[appDate.getDay()]}`;
      }
      const appTimeStr = nextApp ? new Date(nextApp.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '14:00';
      
      setMailSubject(`Terminerinnerung - Praxis Ruether`);
      setMailBody(`${informalGreeting},\n\nhiermit erinnere ich an Ihren Termin am ${dayName} um ${appTimeStr} Uhr.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'fragebogen') {
      setMailSubject(`Anamnesebogen / Fragebogen zur Behandlung`);
      setMailBody(`${informalGreeting},\n\nbitte füllen Sie vor unserer ersten Sitzung den digitalen Anamnesebogen aus. Dies hilft mir, mich optimal auf Ihre Behandlung vorzubereiten:\n\nhttps://hmanager.de/anamnese/${client.id}\n\nVielen Dank für Ihre Mithilfe und bis bald!\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else if (topic === 'dsgvo') {
      const activeClient = targetClient || client;
      const token = activeClient.gdprToken || 'DSGVO_TOKEN';
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const verifyLink = `${origin}/verify/${token}`;
      setMailSubject(`Datenschutz-Einwilligung (DSGVO) erforderlich - Praxis Ruether`);
      setMailBody(`${informalGreeting},\n\num Ihre gesundheitsbezogenen Daten für die Behandlung DSGVO-konform verarbeiten und speichern zu dürfen, benötigen wir Ihre Einwilligung.\n\nBitte klicken Sie auf den folgenden Link, verifizieren Sie sich kurz mit Ihrem Geburtsdatum und unterzeichnen Sie das Formular digital:\n\n${verifyLink}\n\nDieser Link ist aus Sicherheitsgründen 7 Tage gültig.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
    } else {
      setMailSubject('');
      setMailBody('');
    }
  };

  const generateGdprLink = async (clientId: string): Promise<string | null> => {
    if (!therapistId) return null;
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('clients')
      .update({
        gdpr_token: token,
        gdpr_token_expires_at: expiresAt
      })
      .eq('id', clientId);

    if (error) {
      showToast(`Fehler beim Erzeugen des DSGVO-Links: ${error.message}`, 'error');
      return null;
    }

    // Update clients state with the generated token
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, gdprToken: token, gdprTokenExpiresAt: expiresAt } : c));

    // Return the generated token
    return token;
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
    setSoapDate(note.date);
    setSoapSubjective(note.subjective);
    setSoapObjective(note.objective);
    setSoapAssessment(note.assessment);
    setSoapPlan(note.plan);
  };

  const saveSoapNote = async () => {
    if (!soapEditId || !therapistId) return;

    const noteToEdit = soapNotes.find(n => n.id === soapEditId);

    const { error } = await supabase
      .from('soap_notes')
      .update({
        date: soapDate,
        subjective: soapSubjective,
        objective: soapObjective,
        assessment: soapAssessment,
        plan: soapPlan
      })
      .eq('id', soapEditId);

    if (error) {
      showToast(`Fehler beim Speichern: ${error.message}`, 'error');
      return;
    }

    setSoapNotes(prev => prev.map(note => {
      if (note.id === soapEditId) {
        return {
          ...note,
          date: soapDate,
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

    // Sync complaints to Anamnesis
    try {
      if (noteToEdit?.clientId) {
        const parsedSubjective = JSON.parse(soapSubjective);
        const soapComplaints = Array.isArray(parsedSubjective.complaints) ? parsedSubjective.complaints : [];
        
        if (soapComplaints.length > 0) {
          const stored = localStorage.getItem('praxis_manager_cranio_anamnesis');
          let parsed = stored ? JSON.parse(stored) : {};
          let clientAnamnesis = parsed[noteToEdit.clientId] || {
            complaints: [{ description: '', painLevel: 5 }],
            treatmentGoal: '',
            resources: '',
            diseases: [],
            otherDiseases: '',
            accidents: '',
            otherIllnesses: '',
            eventfulEvents: '',
            surgeries: [''],
            longtermCortison: false,
            longtermRheuma: false,
            otherLongtermMeds: '',
            currentMeds: '',
            emotionalHospitalization: '',
            emotionalMeds: '',
            birthKomplications: '',
            pregnant: '',
            miscarriages: '',
            cranioExperience: ''
          };

          let existingComplaints = Array.isArray(clientAnamnesis.complaints) 
            ? clientAnamnesis.complaints.filter((c: any) => c.description && c.description.trim() !== '') 
            : [];

          let addedAny = false;
          soapComplaints.forEach((soapC: any) => {
            if (soapC.description && soapC.description.trim() !== '') {
              const trimmedDesc = soapC.description.trim().toLowerCase();
              const exists = existingComplaints.some((existC: any) => existC.description.trim().toLowerCase() === trimmedDesc);
              if (!exists) {
                existingComplaints.push({
                  description: soapC.description.trim(),
                  painLevel: soapC.painLevel
                });
                addedAny = true;
              }
            }
          });

          if (addedAny) {
            clientAnamnesis.complaints = existingComplaints;
            parsed[noteToEdit.clientId] = clientAnamnesis;
            localStorage.setItem('praxis_manager_cranio_anamnesis', JSON.stringify(parsed));
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('anamnesis_updated'));
            }
          }
        }
      }
    } catch (e) {
      console.error('Error syncing SOAP complaints to Anamnesis:', e);
    }
  };

  const createSoapNote = async (appId: string, cliId: string) => {
    if (!therapistId) return;

    const soapId = crypto.randomUUID();

    // Prefill subjective complaints from client's Anamnesis
    let initialComplaints: Array<{ description: string; painLevel: number }> = [];
    try {
      const stored = localStorage.getItem('praxis_manager_cranio_anamnesis');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed[cliId] && Array.isArray(parsed[cliId].complaints)) {
          initialComplaints = parsed[cliId].complaints
            .filter((c: any) => c && c.description && c.description.trim() !== '')
            .map((c: any) => ({
              description: c.description.trim(),
              painLevel: typeof c.painLevel === 'number' ? c.painLevel : 5
            }));
        }
      }
    } catch (e) {
      console.error('Error loading initial complaints from anamnesis:', e);
    }

    const initialSubjective = JSON.stringify({
      text: 'Klient berichtet...',
      complaints: initialComplaints
    });

    const newNote: SoapNote = {
      id: soapId,
      appointmentId: appId,
      clientId: cliId,
      date: new Date().toISOString().slice(0, 10),
      subjective: initialSubjective,
      objective: 'Palpation zeigt...',
      assessment: 'Verdacht auf...',
      plan: 'Therapie fortsetzen...'
    };

    const isAppointmentUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(appId);

    const { error } = await supabase
      .from('soap_notes')
      .insert({
        id: soapId,
        user_id: therapistId,
        appointment_id: isAppointmentUuid ? appId : null,
        client_id: cliId,
        date: newNote.date,
        subjective: newNote.subjective,
        objective: newNote.objective,
        assessment: newNote.assessment,
        plan: newNote.plan
      });

    if (error) {
      showToast(`Fehler beim Erstellen des Berichts: ${error.message}`, 'error');
      return;
    }

    setSoapNotes(prev => [...prev, newNote]);
    startEditSoap(newNote);
    showToast('Neuer Behandlungsbericht angelegt.', 'success');
  };

  // Invoicing preview/actions
  const createInvoice = async (app: Appointment) => {
    if (!therapistId || !app.clientId) return;
    const num = invoices.length + 1;
    const invNum = `RE-2026-${num.toString().padStart(4, '0')}`;
    const invoiceId = crypto.randomUUID();
    const dateVal = new Date().toISOString().slice(0, 10);
    const dueVal = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const monthNames = [
      "Januar", "Februar", "März", "April", "Mai", "Juni", 
      "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];
    const serviceDateVal = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;

    const client = clients.find(c => c.id === app.clientId);
    const clientSnapshot: ClientSnapshot = {
      name: app.clientName || client?.name || 'Unbekannter Klient',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      street: client?.street || '',
      houseNumber: client?.houseNumber || '',
      zipCode: client?.zipCode || '',
      city: client?.city || ''
    };

    const lineItems: InvoiceLineItem[] = [
      { id: '1', description: app.serviceName || 'Therapeutische Behandlung', price: app.price, taxRate: 0 }
    ];

    const { error } = await supabase
      .from('invoices')
      .insert({
        id: invoiceId,
        user_id: therapistId,
        appointment_id: app.id,
        client_id: app.clientId,
        invoice_number: invNum,
        amount: app.price,
        date: dateVal,
        status: 'open',
        due_date: dueVal,
        service_date: serviceDateVal,
        client_snapshot: clientSnapshot,
        line_items: lineItems,
        is_small_business: isSmallBusiness,
        notes: ''
      });

    if (error) {
      showToast(`Fehler beim Erstellen der Rechnung: ${error.message}`, 'error');
      return;
    }

    const newInv: Invoice = {
      id: invoiceId,
      appointmentId: app.id,
      clientId: app.clientId || '',
      clientName: app.clientName,
      invoiceNumber: invNum,
      amount: app.price,
      date: dateVal,
      status: getInvoiceStatus('open', dueVal),
      dueDate: dueVal,
      serviceDate: serviceDateVal,
      clientSnapshot: clientSnapshot,
      lineItems: lineItems,
      isSmallBusiness: isSmallBusiness,
      notes: ''
    };
    setInvoices(prev => [...prev, newInv]);
    showToast(`Rechnung ${invNum} erfolgreich erstellt!`, 'success');
    if (selectedAppointment && selectedAppointment.id === app.id) {
      setSelectedAppointment({ ...selectedAppointment });
    }
  };

  const markInvoicePaid = async (invId: string) => {
    if (!therapistId) return;
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', invId);

    if (error) {
      showToast(`Fehler beim Aktualisieren der Rechnung: ${error.message}`, 'error');
      return;
    }

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
      showToast('Klient konnte nicht gefunden werden.', 'error');
    }
  };

  const sendInvoiceEmail = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    const email = client?.email || 'klient@email.de';
    showToast(`Rechnung ${inv.invoiceNumber} erfolgreich an ${email} gesendet!`, 'success');
    setActiveInvoiceActionMenuId(null);
  };

  const downloadInvoicePdf = (inv: Invoice) => {
    const invoiceText = `
RECHNUNG: ${inv.invoiceNumber}
Datum: ${new Date(inv.date).toLocaleDateString('de-DE')}
Klient: ${inv.clientName}
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
    const email = client?.email || 'klient@email.de';
    showToast(`Zahlungserinnerung für ${inv.invoiceNumber} an ${email} gesendet!`, 'info');
    setActiveInvoiceActionMenuId(null);
  };

  const cancelInvoice = async (invId: string): Promise<boolean> => {
    if (!therapistId) return false;
    
    const targetInv = invoices.find(inv => inv.id === invId);
    if (!targetInv) {
      showToast('Rechnung nicht gefunden.', 'error');
      return false;
    }

    if (targetInv.status === 'cancelled') {
      showToast('Diese Rechnung ist bereits storniert.', 'error');
      return false;
    }

    if (!confirm(`Möchtest du die Rechnung ${targetInv.invoiceNumber} wirklich stornieren? Dieser Vorgang erzeugt eine korrespondierende Stornorechnung mit negativen Beträgen.`)) {
      return false;
    }

    // 1. Update status of original invoice to 'cancelled'
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', invId);

    if (updateError) {
      showToast(`Fehler beim Aktualisieren des Rechnungsstatus: ${updateError.message}`, 'error');
      return false;
    }

    // 2. Generate new linked negative invoice
    const stornoId = crypto.randomUUID();
    const stornoSeqNum = invoices.length + 1;
    const stornoNumber = `ST-2026-${stornoSeqNum.toString().padStart(4, '0')}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    const negatedLineItems = (targetInv.lineItems || []).map(item => ({
      ...item,
      price: -item.price
    }));

    const stornoNotes = `Stornierung / Rechnungskorrektur zur Rechnung Nr. ${targetInv.invoiceNumber} vom ${new Date(targetInv.date).toLocaleDateString('de-DE')}.`;

    const { error: insertError } = await supabase
      .from('invoices')
      .insert({
        id: stornoId,
        user_id: therapistId,
        appointment_id: targetInv.appointmentId && targetInv.appointmentId.startsWith('custom-') ? null : targetInv.appointmentId,
        client_id: targetInv.clientId,
        invoice_number: stornoNumber,
        amount: -targetInv.amount,
        date: todayStr,
        status: 'paid',
        due_date: todayStr,
        service_date: targetInv.serviceDate,
        client_snapshot: targetInv.clientSnapshot,
        line_items: negatedLineItems,
        is_small_business: targetInv.isSmallBusiness,
        notes: stornoNotes,
        related_invoice_id: targetInv.id
      });

    if (insertError) {
      await supabase.from('invoices').update({ status: targetInv.status }).eq('id', invId);
      showToast(`Fehler beim Erstellen der Stornorechnung: ${insertError.message}`, 'error');
      return false;
    }

    // 3. Update React local states
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invId) {
        return { ...inv, status: 'cancelled' as const };
      }
      return inv;
    });

    const newStornoInv: Invoice = {
      id: stornoId,
      appointmentId: targetInv.appointmentId,
      clientId: targetInv.clientId,
      clientName: targetInv.clientName,
      invoiceNumber: stornoNumber,
      amount: -targetInv.amount,
      date: todayStr,
      status: 'paid',
      dueDate: todayStr,
      serviceDate: targetInv.serviceDate,
      clientSnapshot: targetInv.clientSnapshot,
      lineItems: negatedLineItems,
      isSmallBusiness: targetInv.isSmallBusiness,
      notes: stornoNotes,
      relatedInvoiceId: targetInv.id
    };

    setInvoices([...updatedInvoices, newStornoInv]);
    showToast(`Rechnung ${targetInv.invoiceNumber} storniert. Stornorechnung ${stornoNumber} erzeugt.`, 'success');
    setActiveInvoiceActionMenuId(null);
    return true;
  };

  // Invoice Printer
  const printInvoice = (inv: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const clientName = inv.clientSnapshot?.name || inv.clientName;
      const clientStreet = inv.clientSnapshot?.street || '';
      const clientHouseNumber = inv.clientSnapshot?.houseNumber || '';
      const clientZip = inv.clientSnapshot?.zipCode || '';
      const clientCity = inv.clientSnapshot?.city || '';
      const clientEmail = inv.clientSnapshot?.email || '';
      const clientPhone = inv.clientSnapshot?.phone || '';

      const tName = therapistName;
      const tAddress = address;
      const tPhone = phone;
      const tTaxNum = taxNumber;
      const tVatId = vatId;
      const tIban = iban;
      const tBic = bic;

      const items = (inv.lineItems && inv.lineItems.length > 0)
        ? inv.lineItems
        : [{ id: 'fallback', description: 'Therapeutische Behandlung / Physiotherapie', price: inv.amount, taxRate: 0 }];

      const netSum = items.reduce((sum, item) => sum + item.price, 0);
      const taxSum = (inv.isSmallBusiness || inv.isReverseCharge)
        ? 0
        : items.reduce((sum, item) => sum + (item.price * ((item.taxRate || 0) / 100)), 0);
      const grossSum = netSum + taxSum;

      // Group tax rate details for breakdown display
      const taxRateBreakdown = items.reduce((acc, item) => {
        const rate = item.taxRate || 0;
        if (!acc[rate]) {
          acc[rate] = { net: 0, tax: 0 };
        }
        acc[rate].net += item.price;
        acc[rate].tax += item.price * (rate / 100);
        return acc;
      }, {} as Record<number, { net: number; tax: number }>);

      printWindow.document.write(`
        <html>
          <head>
            <title>Rechnung ${inv.invoiceNumber}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #003527; line-height: 1.5; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #003527; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; color: #003527; }
              .header-meta { text-align: right; font-size: 11px; color: #708075; line-height: 1.6; }
              .title { font-size: 28px; font-weight: bold; margin-bottom: 30px; font-family: serif; color: #003527; }
              .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
              .details div { font-size: 12px; }
              .details strong { color: #003527; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px; color: #708075; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #bfc9c3; font-size: 12px; }
              th { background-color: #f3f4f3; font-weight: bold; color: #003527; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
              .text-right { text-align: right; }
              .totals-block { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; margin-bottom: 40px; border-top: 1px solid #bfc9c3; padding-top: 20px; }
              .totals-row { display: flex; justify-content: space-between; width: 280px; font-size: 12px; color: #506055; }
              .totals-row.grand { font-size: 18px; font-weight: bold; color: #003527; border-top: 1px solid #bfc9c3; padding-top: 8px; margin-top: 4px; }
              .notes-block { margin-top: 20px; padding: 12px; background-color: #f9f9f8; border-left: 3px solid #003527; font-size: 11px; color: #405045; }
              .footer { margin-top: 80px; font-size: 10px; color: #708075; border-top: 1px solid #bfc9c3; padding-top: 20px; line-height: 1.6; }
              .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">${tName}</div>
                <div style="font-size: 11px; color: #708075; margin-top: 5px;">${tAddress}</div>
              </div>
              <div class="header-meta">
                <strong>Datum:</strong> ${new Date(inv.date).toLocaleDateString('de-DE')}<br>
                <strong>Leistungszeitraum:</strong> ${inv.serviceDate || new Date(inv.date).toLocaleDateString('de-DE', {month: 'long', year: 'numeric'})}<br>
                ${!inv.invoiceNumber.startsWith('ST-') ? `<strong>Fälligkeitsdatum:</strong> ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('de-DE') : 'Sofort'}` : ''}
              </div>
            </div>
            
            <div class="title">${inv.invoiceNumber.startsWith('ST-') ? 'STORNORECHNUNG / RECHNUNGSKORREKTUR' : 'RECHNUNG'}</div>
            
            <div class="details">
              <div>
                <strong>Rechnungsempfänger</strong>
                <span style="font-size: 13px; font-weight: bold; color: #003527;">${clientName}</span><br>
                ${(clientStreet && clientHouseNumber) ? `${clientStreet} ${clientHouseNumber}<br>` : '<span style="color: red; font-weight: bold; font-size: 11px;">[Klienten-Anschrift fehlt]<br></span>'}
                ${(clientZip && clientCity) ? `${clientZip} ${clientCity}<br>` : '<span style="color: red; font-weight: bold; font-size: 11px;">[Klienten-PLZ/Ort fehlt]<br></span>'}
                ${clientEmail ? `E-Mail: ${clientEmail}<br>` : ''}
                ${clientPhone ? `Tel: ${clientPhone}<br>` : ''}
                ${inv.isReverseCharge ? (inv.clientSnapshot?.vatId ? `USt-IdNr. des Empfängers: ${inv.clientSnapshot.vatId}` : '<span style="color: red; font-weight: bold; font-size: 11px;">[Klienten-USt-IdNr. fehlt]</span>') : ''}
              </div>
              <div>
                <strong>Rechnungsdetails</strong>
                Rechnungsnummer: <strong>${inv.invoiceNumber}</strong><br>
                Zahlungsstatus: ${inv.status === 'paid' ? 'Bezahlt' : inv.status === 'overdue' ? 'Überfällig' : 'Offen'}
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">Pos</th>
                  <th>Leistungsbeschreibung</th>
                  ${!inv.isSmallBusiness ? '<th class="text-right" style="width: 80px;">USt.</th>' : ''}
                  <th class="text-right" style="width: 120px;">Gesamtpreis</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${item.description}</td>
                    ${!inv.isSmallBusiness ? `<td class="text-right">${item.taxRate || 0}%</td>` : ''}
                    <td class="text-right">${item.price.toFixed(2)} €</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals-block">
              ${inv.isSmallBusiness ? `
                <div class="totals-row grand">
                  <span>Gesamtsumme:</span>
                  <span>${grossSum.toFixed(2)} €</span>
                </div>
                <div style="font-size: 10px; color: #708075; font-style: italic; margin-top: 5px;">
                  Kein Ausweis der Umsatzsteuer aufgrund der Anwendung der Kleinunternehmerregelung gem. § 19 UStG.
                </div>
              ` : inv.isReverseCharge ? `
                <div class="totals-row grand">
                  <span>Gesamtsumme (Netto):</span>
                  <span>${netSum.toFixed(2)} €</span>
                </div>
                <div style="font-size: 10px; color: #708075; font-style: italic; margin-top: 5px; text-align: right;">
                  Steuerschuldnerschaft des Leistungsempfängers (Reverse-Charge-Verfahren nach § 13b UStG).
                </div>
              ` : `
                <div class="totals-row">
                  <span>Netto-Summe:</span>
                  <span>${netSum.toFixed(2)} €</span>
                </div>
                ${Object.entries(taxRateBreakdown).map(([rate, vals]) => `
                  <div class="totals-row" style="font-size: 11px; color: #708075;">
                    <span>davon Ust. ${rate}% (auf ${vals.net.toFixed(2)} €):</span>
                    <span>${vals.tax.toFixed(2)} €</span>
                  </div>
                `).join('')}
                <div class="totals-row">
                  <span>Umsatzsteuer Gesamt:</span>
                  <span>${taxSum.toFixed(2)} €</span>
                </div>
                <div class="totals-row grand">
                  <span>Brutto-Gesamtsumme:</span>
                  <span>${grossSum.toFixed(2)} €</span>
                </div>
              `}
            </div>
            
            ${inv.notes ? `
              <div class="notes-block">
                <strong>Zahlungshinweis / Bemerkung:</strong><br>
                ${inv.notes.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
            
            <div class="footer">
              ${inv.invoiceNumber.startsWith('ST-') ? `
                <p style="margin-bottom: 15px; font-weight: bold; color: #003527;">
                  Dieser Beleg dient ausschließlich der steuerlichen Verrechnung der stornierten Rechnung ${inv.notes ? `Nr. ` + inv.notes.split('Rechnung Nr. ')[1]?.split(' vom')[0] || '' : ''} und erfordert keine Zahlung.
                </p>
              ` : `
                <p style="margin-bottom: 15px;">
                  Bitte überweisen Sie den Rechnungsbetrag von <strong>${grossSum.toFixed(2)} €</strong> bis zum <strong>${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('de-DE') : 'Sofort'}</strong> unter Angabe der Rechnungsnummer <strong>${inv.invoiceNumber}</strong> auf das unten aufgeführte Praxiskonto.
                  Wir weisen darauf hin, dass Sie gemäß § 286 Abs. 3 BGB auch ohne gesonderte Mahnung in Verzug geraten, wenn Sie die Zahlung nicht innerhalb von 30 Tagen nach Fälligkeit und Zugang dieser Rechnung leisten.
                </p>
              `}
              
              <div class="footer-grid">
                <div>
                  <strong>Praxisinhaber</strong><br>
                  Inhaber: ${tName}<br>
                  Steuernummer: ${tTaxNum || '<span style="color: red; font-weight: bold;">[Steuernummer fehlt]</span>'}<br>
                  ${tVatId ? `USt-IdNr.: ${tVatId}<br>` : ''}
                  Tel: ${tPhone}
                </div>
                <div class="text-right">
                  <strong>Bankverbindung</strong><br>
                  IBAN: ${tIban || '<span style="color: red; font-weight: bold;">[IBAN fehlt]</span>'}<br>
                  BIC: ${tBic || '<span style="color: red; font-weight: bold;">[BIC fehlt]</span>'}
                </div>
              </div>
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
    let csv = 'Rechnungsnummer,Datum,Klient,Betrag,Status\n';
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
      taxNumber, setTaxNumber,
      vatId, setVatId,
      iban, setIban,
      bic, setBic,
      isSmallBusiness, setIsSmallBusiness,
      syncEnabled, setSyncEnabled,
      isSavingSettings,
      settingsSuccess,
      clients, setClients,
      services, setServices, createService,
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
      prefillInvoice, setPrefillInvoice,
      isEditingDraft, setIsEditingDraft,
      isViewingInvoice, setIsViewingInvoice,
      isSheetOpen, setIsSheetOpen,
      selectedAppointment, setSelectedAppointment,
      sheetMode, setSheetMode,
      newAppDate, setNewAppDate,
      newAppHour, setNewAppHour,
      newAppClientId, setNewAppClientId,
      newAppServiceId, setNewAppServiceId,
      isGdprModalOpen, setIsGdprModalOpen,
      gdprClientId, setGdprClientId,
      openGdprModal,
      selectedClientId, setSelectedClientId,
      clientSearch, setClientSearch,
      clientFilter, setClientFilter,
      isFilterMenuOpen, setIsFilterMenuOpen,
      soapEditId, setSoapEditId,
      soapDate, setSoapDate,
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
      startResizing,
      contextMenu, setContextMenu,
      saveSettings,
      handleCreateClient,
      deleteClient,
      archiveClient,
      restoreClient,
      updateClientName,
      updateClientDetails,
      toggleClientFavorite,
      toggleClientFlag,
      toggleClientGdpr,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      openNewInvoiceSheet,
      openNewInvoiceSheetWithPrefill,
      handleContextMenu,
      handleClientContextMenu,
      handleInvoiceContextMenu,
      handleCreateInvoice,
      handleUpdateDraftInvoice,
      deleteDraftInvoice,
      getUnbilledAppointments,
      getBilledInvoiceForAppointment,
      generateGdprLink,
      deleteService,
      updateService,
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
