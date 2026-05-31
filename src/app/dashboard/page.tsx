'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, Users, FileText, Settings, LogOut, Search, Plus, 
  Trash2, X, CheckCircle2, AlertCircle, Sparkles, Copy, Printer, Download, 
  Mail, CalendarRange, Clock, User, Phone, Check, RefreshCw, Paperclip,
  ChevronLeft, ChevronRight, Ban, Edit2, Filter, Star, MoreVertical, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CommandPalette from '@/components/CommandPalette';
import { Client, Service, Appointment, SoapNote, Invoice } from '@/lib/types';

interface ClientListItemProps {
  client: Client;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onToggleFlag: () => void;
  onDelete: () => void;
}

function ClientListItem({ client, isSelected, onSelect, onToggleFavorite, onToggleFlag, onDelete }: ClientListItemProps) {
  const [swipeState, setSwipeState] = useState<'left' | 'right' | 'closed'>('closed');

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) {
      setSwipeState('left');
    } else if (info.offset.x > 50) {
      setSwipeState('right');
    } else {
      setSwipeState('closed');
    }
  };

  const xOffset = swipeState === 'left' ? -128 : swipeState === 'right' ? 64 : 0;

  return (
    <div className="relative overflow-hidden border-b border-[#bfc9c3]/30 select-none bg-[#bfc9c3]/10">
      {/* Behind layer left: Flag button (revealed when swiping right) */}
      <div className="absolute left-0 top-0 bottom-0 flex z-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFlag();
            setSwipeState('closed');
          }}
          className={`w-16 flex flex-col items-center justify-center transition-colors cursor-pointer text-[10px] font-bold gap-1 border-r border-[#bfc9c3]/30 ${
            client.isFlagged 
              ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          <Flag className={`w-3.5 h-3.5 ${client.isFlagged ? 'fill-current' : ''}`} />
          <span>{client.isFlagged ? 'Un-Flag' : 'Markieren'}</span>
        </button>
      </div>

      {/* Behind layer right: Action buttons (revealed when swiping left) */}
      <div className="absolute right-0 top-0 bottom-0 flex z-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
            setSwipeState('closed');
          }}
          className={`w-16 flex flex-col items-center justify-center transition-colors cursor-pointer text-[10px] font-bold gap-1 ${
            client.isFavorite 
              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${client.isFavorite ? 'fill-current' : ''}`} />
          <span>{client.isFavorite ? 'Un-Fav' : 'Favorit'}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            setSwipeState('closed');
          }}
          className="w-16 bg-rose-50 text-rose-600 hover:bg-rose-100 flex flex-col items-center justify-center border-l border-[#bfc9c3]/30 transition-colors cursor-pointer text-[10px] font-bold gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Löschen</span>
        </button>
      </div>

      {/* Front layer: Draggable card content */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -128, right: 64 }}
        dragElastic={{ left: 0.1, right: 0.1 }}
        animate={{ x: xOffset }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (swipeState !== 'closed') {
            setSwipeState('closed');
          } else {
            onSelect();
          }
        }}
        className={`px-6 py-4 cursor-pointer flex items-center justify-between bg-white relative z-10 select-none transition-colors ${
          isSelected 
            ? 'bg-[#003527]/5 text-[#003527]' 
            : 'hover:bg-zinc-50 text-[#404944]'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-xs">{client.name}</h4>
            {client.isFavorite && (
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            )}
            {client.isFlagged && (
              <Flag className="w-3 h-3 text-rose-500 fill-rose-500" />
            )}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">Geb: {new Date(client.birthday).toLocaleDateString('de-DE')}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('calendar');
  const [therapistName, setTherapistName] = useState('Praxis Ruether');
  const [therapistId, setTherapistId] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [phone, setPhone] = useState('+49 123 456789');
  const [address, setAddress] = useState('Hauptstraße 12, 10117 Berlin');
  const [primaryColor, setPrimaryColor] = useState('#003527');
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);

  // Reminders config
  const [reminderEmail, setReminderEmail] = useState(true);
  const [reminderSms, setReminderSms] = useState(false);
  const [reminderHours, setReminderHours] = useState('24');

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
  const [isDetailsMenuOpen, setIsDetailsMenuOpen] = useState(false);
  const [isInvoiceMenuOpen, setIsInvoiceMenuOpen] = useState(false);
  const [isNewInvoiceSheetOpen, setIsNewInvoiceSheetOpen] = useState(false);
  const [newInvoiceClientId, setNewInvoiceClientId] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceDate, setNewInvoiceDate] = useState('');
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newInvoiceStatus, setNewInvoiceStatus] = useState<'open' | 'paid' | 'overdue'>('open');
  const [newInvoiceAppointmentId, setNewInvoiceAppointmentId] = useState<string | null>(null);
  const [mailTopic, setMailTopic] = useState<'rechnung' | 'stornierung' | 'bestaetigung' | 'custom'>('rechnung');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [selectedMailInvoiceId, setSelectedMailInvoiceId] = useState('');
  const [selectedMailAppointmentId, setSelectedMailAppointmentId] = useState('');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    appointment: Appointment;
  } | null>(null);

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

  // CMD+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdkOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    topic: 'rechnung' | 'stornierung' | 'bestaetigung' | 'custom',
    invoiceId?: string,
    appointmentId?: string,
    targetClient?: Client
  ) => {
    const client = targetClient || currentClient;
    if (!client) return;

    setMailTopic(topic);
    
    if (topic === 'rechnung') {
      const activeInvoiceId = invoiceId !== undefined ? invoiceId : selectedMailInvoiceId;
      const inv = invoices.find(i => i.id === activeInvoiceId && i.clientId === client.id);
      const invNum = inv ? inv.invoiceNumber : 'RE-XXXXX';
      const invAmount = inv ? `${inv.amount.toFixed(2)} €` : 'XX,XX €';
      setMailSubject(`Rechnung zu Ihrer Behandlung - ${invNum}`);
      setMailBody(`Sehr geehrte(r) ${client.name},\n\nanbei erhalten Sie die Rechnung ${invNum} über den Betrag von ${invAmount} zu Ihrer letzten Behandlung.\n\nBitte überweisen Sie den Betrag innerhalb von 14 Tagen.\n\nMit freundlichen Grüßen,\nIhr Praxis-Team`);
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
    if (!currentClient) return;
    
    showToast(`E-Mail an ${currentClient.name} wurde erfolgreich gesendet!`, 'success');
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

  // Format Helper
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatAppTimeRange = (startTimeStr: string, durationMin: number) => {
    const start = new Date(startTimeStr);
    const end = new Date(start.getTime() + durationMin * 60000);
    const startStr = start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const endStr = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  const getWeekDays = (date: Date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getMonthDaysGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;

    const grid = [];
    const prevMonthEnd = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      grid.push({ date: new Date(year, month - 1, prevMonthEnd - i), isCurrentMonth: false });
    }
    const currentMonthEnd = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= currentMonthEnd; i++) {
      grid.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const totalCells = Math.ceil(grid.length / 7) * 7;
    const nextMonthPadding = totalCells - grid.length;
    for (let i = 1; i <= nextMonthPadding; i++) {
      grid.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return grid;
  };

  const isSameDay = (d1: Date, d2Str: string) => {
    const d2 = new Date(d2Str);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getAppointmentStyle = (app: Appointment) => {
    const start = new Date(app.startTime);
    const end = new Date(app.endTime);
    const hours = start.getHours();
    const minutes = start.getMinutes();

    const minutesSince09 = (hours - 9) * 60 + minutes;
    const dur = resizingAppId === app.id && tempDuration !== null 
      ? tempDuration 
      : Math.round((end.getTime() - start.getTime()) / 60000);

    const topPx = (minutesSince09 / 60) * 88;
    const heightPx = (dur / 60) * 88;

    return {
      top: `${topPx + 6}px`,
      height: `${heightPx - 12}px`
    };
  };

  const handleCellClick = (dateStr: string, hour: number) => {
    setSheetMode('new');
    setNewAppDate(dateStr);
    setNewAppHour(hour);
    if (clients.length > 0) setNewAppClientId(clients[0].id);
    if (services.length > 0) setNewAppServiceId(services[0].id);
    setIsSheetOpen(true);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppDate || !newAppClientId || !newAppServiceId) return;

    const cli = clients.find(c => c.id === newAppClientId);
    const srv = services.find(s => s.id === newAppServiceId);
    if (!cli || !srv) return;

    const start = new Date(newAppDate);
    start.setHours(newAppHour, 0, 0, 0);
    const end = new Date(start.getTime() + srv.duration * 60000);

    const newApp: Appointment = {
      id: `a-${Date.now()}`,
      clientId: cli.id,
      clientName: cli.name,
      serviceId: srv.id,
      serviceName: srv.name,
      price: srv.price,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: 'booked'
    };

    setAppointments(prev => [...prev, newApp]);
    setIsSheetOpen(false);
  };

  const handleDrop = (targetDateStr: string, targetHour: number) => {
    if (!draggedAppId) return;

    setAppointments(prev => prev.map(app => {
      if (app.id === draggedAppId) {
        const origStart = new Date(app.startTime);
        const origEnd = new Date(app.endTime);
        const duration = origEnd.getTime() - origStart.getTime();

        const newStart = new Date(targetDateStr);
        newStart.setHours(targetHour, 0, 0, 0);

        // Clamping to not run past 17:00
        const durationMins = duration / 60000;
        let finalStart = newStart;
        if (targetHour * 60 + durationMins > 17 * 60) {
          const shiftMinutes = (targetHour * 60 + durationMins) - 17 * 60;
          finalStart = new Date(newStart.getTime() - shiftMinutes * 60000);
        }

        const newEnd = new Date(finalStart.getTime() + duration);

        return {
          ...app,
          startTime: finalStart.toISOString(),
          endTime: newEnd.toISOString()
        };
      }
      return app;
    }));

    setDraggedAppId(null);
    setDragOverSlot(null);
  };

  const handleMonthCellDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedAppId) return;

    setAppointments(prev => prev.map(app => {
      if (app.id === draggedAppId) {
        const origStart = new Date(app.startTime);
        const origEnd = new Date(app.endTime);
        const duration = origEnd.getTime() - origStart.getTime();

        const newStart = new Date(targetDate);
        newStart.setHours(origStart.getHours(), origStart.getMinutes(), 0, 0);
        const newEnd = new Date(newStart.getTime() + duration);

        return {
          ...app,
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString()
        };
      }
      return app;
    }));

    setDraggedAppId(null);
    setDragOverSlot(null);
  };

  const handleResizeStart = (e: React.MouseEvent, app: Appointment) => {
    e.preventDefault();
    e.stopPropagation();

    initialYRef.current = e.clientY;
    const start = new Date(app.startTime);
    const end = new Date(app.endTime);
    const dur = Math.round((end.getTime() - start.getTime()) / 60000);
    initialDurationRef.current = dur;

    setResizingAppId(app.id);
    setTempDuration(dur);
    tempDurationRef.current = dur;
  };

  const handlePrevDate = () => {
    const d = new Date(currentCalendarDate);
    if (calendarView === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (calendarView === 'month') {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentCalendarDate(d);
  };

  const handleNextDate = () => {
    const d = new Date(currentCalendarDate);
    if (calendarView === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (calendarView === 'month') {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentCalendarDate(d);
  };

  const handleToday = () => {
    setCurrentCalendarDate(new Date('2026-06-01'));
  };

  const getCalendarTitleText = () => {
    const days = getWeekDays(currentCalendarDate);
    const startStr = days[0].toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
    const endStr = days[4].toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

    if (calendarView === 'day') {
      return currentCalendarDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    } else if (calendarView === 'week') {
      return `Woche: ${startStr} - ${endStr}`;
    } else {
      return currentCalendarDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // SOAP History for Client Profile
  const clientSoapNotes = soapNotes.filter(n => n.clientId === selectedClientId);
  const currentClient = clients.find(c => c.id === selectedClientId);

  const cmdkActions = [
    {
      id: 'calendar',
      title: 'Kalender anzeigen',
      icon: CalendarIcon,
      onSelect: () => setActiveTab('calendar')
    },
    {
      id: 'new-app',
      title: 'Neuen Termin eintragen',
      icon: Plus,
      onSelect: () => {
        setSheetMode('new');
        setNewAppDate(new Date('2026-06-01').toISOString().slice(0, 10));
        setNewAppHour(9);
        if (clients.length > 0) setNewAppClientId(clients[0].id);
        if (services.length > 0) setNewAppServiceId(services[0].id);
        setIsSheetOpen(true);
      }
    },
    {
      id: 'patients',
      title: 'Patienten anzeigen',
      icon: Users,
      onSelect: () => setActiveTab('clients')
    },
    {
      id: 'new-patient',
      title: 'Neuen Patienten anlegen',
      icon: Plus,
      onSelect: () => {
        setActiveTab('clients');
        setIsNewClientModalOpen(true);
      }
    },
    {
      id: 'invoices',
      title: 'Rechnungen anzeigen',
      icon: FileText,
      onSelect: () => setActiveTab('invoices')
    },
    {
      id: 'settings',
      title: 'Einstellungen öffnen',
      icon: Settings,
      onSelect: () => setActiveTab('settings')
    }
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f8] text-[#191c1c] font-sans antialiased overflow-hidden flex">
      
      {/* SideNavBar Shell */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#f3f4f3] flex flex-col p-6 z-50 border-r border-[#bfc9c3]/30">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-[#003527] flex items-center justify-center text-white font-serif text-lg font-bold">
            P
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#043F2D] leading-none tracking-tight">HManager</h1>
            <p className="text-[10px] text-[#003527]/70 font-semibold mt-1 max-w-[140px] truncate">{therapistName}</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'calendar'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <CalendarIcon className="w-4 h-4" /> Termine & Kalender
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'clients'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <Users className="w-4 h-4" /> Patienten & CRM
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'invoices'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <FileText className="w-4 h-4" /> Abrechnung
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <Settings className="w-4 h-4" /> Einstellungen
          </button>
        </nav>

        <div className="pt-6 border-t border-[#bfc9c3]/30 space-y-4">
          <button 
            onClick={() => setIsCmdkOpen(true)}
            className="w-full flex items-center justify-between bg-white border border-[#bfc9c3]/30 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-400 hover:border-[#003527]/30 transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#003527]" /> Suche...
            </span>
            <kbd className="bg-zinc-100 text-[10px] text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">⌘K</kbd>
          </button>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
        
        {/* TopAppBar */}
        {activeTab !== 'clients' && (
          <header className="bg-[#f9f9f8]/80 backdrop-blur-xl z-30 flex-shrink-0 border-b border-[#bfc9c3]/20 px-12 py-6 flex justify-between items-center">
            <h2 className="text-xl font-bold font-serif text-[#043F2D]">
              {activeTab === 'calendar' && 'Terminkalender'}
              {activeTab === 'invoices' && 'Rechnungen & Finanzen'}
              {activeTab === 'settings' && 'Einstellungen'}
            </h2>
            
            <div className="flex items-center gap-4">
              {activeTab === 'calendar' && (
                <button 
                  onClick={() => {
                    setSheetMode('new');
                    setNewAppDate(new Date('2026-06-01').toISOString().slice(0, 10));
                    setNewAppHour(9);
                    if (clients.length > 0) setNewAppClientId(clients[0].id);
                    if (services.length > 0) setNewAppServiceId(services[0].id);
                    setIsSheetOpen(true);
                  }}
                  className="bg-[#003527] hover:bg-[#0b513d] text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-none transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Termin eintragen
                </button>
              )}
            </div>
          </header>
        )}

        {/* Tab Content Panels */}
        <div className={`flex-1 ${activeTab === 'clients' ? 'flex flex-col min-h-0 h-screen' : 'overflow-y-auto px-12 py-8'}`}>
          
          {/* TAB 1: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              
              {/* Calendar Controls */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex border border-[#bfc9c3]/50 rounded-xl overflow-hidden bg-white">
                    <button 
                      onClick={handlePrevDate}
                      className="p-2.5 text-[#003527] hover:bg-zinc-50 border-r border-[#bfc9c3]/50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleToday}
                      className="px-4 py-2 text-xs font-bold text-[#003527] hover:bg-zinc-50 border-r border-[#bfc9c3]/50 transition-colors"
                    >
                      Heute
                    </button>
                    <button 
                      onClick={handleNextDate}
                      className="p-2.5 text-[#003527] hover:bg-zinc-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-sm font-bold text-[#043F2D] pl-2">{getCalendarTitleText()}</h3>
                </div>

                {/* Segmented Picker */}
                <div className="bg-zinc-200/50 p-1 rounded-2xl flex border border-zinc-200/20">
                  {(['day', 'week', 'month'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setCalendarView(view)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        calendarView === view 
                          ? 'bg-white text-[#003527] border border-[#bfc9c3]/30' 
                          : 'text-zinc-500 hover:text-[#003527]'
                      }`}
                    >
                      {view === 'day' && 'Tag'}
                      {view === 'week' && 'Woche'}
                      {view === 'month' && 'Monat'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar View Renders */}
              <AnimatePresence mode="wait">
                
                {/* DAY VIEW */}
                {calendarView === 'day' && (
                  <motion.div
                    key="day-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white border border-[#bfc9c3]/40 rounded-2xl py-6 px-0 shadow-none overflow-x-auto"
                  >
                    {/* Header Row */}
                    <div className="min-w-[600px] grid grid-cols-6 border-b border-[#bfc9c3]/20 pb-4 mb-6">
                      <div className="col-span-1" />
                      <div className="col-span-5 text-left pl-3 flex flex-col gap-1 select-none">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {currentCalendarDate.toLocaleDateString('de-DE', { weekday: 'long' })}
                        </span>
                        <span className="text-xl font-semibold text-[#003527]">
                          {currentCalendarDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-[600px] grid grid-cols-6 divide-x divide-zinc-200/50 relative">
                      {/* Timeline column */}
                      <div className="col-span-1 relative h-[704px] select-none pr-4">
                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, idx) => (
                          <div 
                            key={time} 
                            className="absolute right-4 text-[10px] font-bold text-zinc-400 -translate-y-1/2"
                            style={{ top: `${idx * 88}px` }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>

                      {/* Content column */}
                      <div className="col-span-5 relative h-[704px] w-full pl-0">
                        {/* Background hour lines */}
                        <div className="absolute inset-y-0 left-0 right-0 divide-y divide-zinc-100 flex flex-col pointer-events-none">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-[88px]" />
                          ))}
                        </div>

                        {/* Interactive cell slot blocks */}
                        <div className="absolute inset-y-0 left-0 right-0 grid grid-rows-8">
                          {Array.from({ length: 8 }).map((_, hourIdx) => {
                            const hour = hourIdx + 9;
                            const dateStr = currentCalendarDate.toISOString().slice(0, 10);
                            return (
                              <div
                                key={hour}
                                onClick={() => handleCellClick(dateStr, hour)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={() => setDragOverSlot({ dateStr, hour })}
                                className="h-[88px] hover:bg-[#003527]/3 transition-colors cursor-pointer"
                              />
                            );
                          })}
                        </div>

                        {/* Draggable appointment cards overlay */}
                        <div className="absolute inset-y-0 left-0 right-0 pointer-events-none">
                          {appointments
                            .filter(app => isSameDay(currentCalendarDate, app.startTime))
                            .map((app) => {
                              const isDragging = draggedAppId === app.id;
                              const isResizing = resizingAppId === app.id;
                              const dur = isResizing && tempDuration !== null ? tempDuration : Math.round((new Date(app.endTime).getTime() - new Date(app.startTime).getTime()) / 60000);
                              const appInvoice = invoices.find(inv => inv.appointmentId === app.id);
                              
                              return (
                                <div
                                  key={app.id}
                                  draggable={!isResizing}
                                  onDragStart={() => setDraggedAppId(app.id)}
                                  onDragEnd={() => { setDraggedAppId(null); setDragOverSlot(null); }}
                                  onContextMenu={(e) => handleContextMenu(e, app)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAppointment(app);
                                    setSheetMode('edit');
                                    setIsSheetOpen(true);
                                  }}
                                  style={getAppointmentStyle(app)}
                                  className={`absolute left-2 right-2 rounded-lg p-4 border select-none cursor-grab flex flex-col justify-between overflow-hidden pointer-events-auto group ${
                                    isDragging ? 'opacity-40 shadow-none' : 'hover:scale-[1.01]'
                                  } ${
                                    isResizing ? 'z-30 cursor-ns-resize ring-2 ring-[#003527]' : 'z-10'
                                  } ${
                                    isResizing || isDragging ? '' : 'transition-all duration-200 ease-out'
                                  } ${
                                    app.status === 'booked' 
                                      ? 'bg-amber-50/90 border-amber-200/60 text-amber-900' 
                                      : app.status === 'confirmed' 
                                      ? 'bg-blue-50/90 border-blue-200/60 text-blue-900'
                                      : app.status === 'noshow' 
                                      ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900' 
                                      : 'bg-rose-50/90 border-rose-200/60 text-rose-900'
                                  } shadow-none`}
                                >
                                  <div>
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-extrabold text-xs tracking-tight">{app.serviceName}</h4>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {appInvoice ? (
                                          <span 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveTab('invoices');
                                              setInvoiceFilter('all');
                                              setInvoiceSearch(appInvoice.invoiceNumber);
                                            }}
                                            className={`p-1 rounded border flex items-center justify-center cursor-pointer ${
                                              appInvoice.status === 'paid'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                : appInvoice.status === 'overdue'
                                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                                : 'bg-amber-50 border-amber-200 text-amber-800'
                                            }`}
                                            title={`Rechnung: ${appInvoice.invoiceNumber} (${appInvoice.status === 'paid' ? 'Bezahlt' : appInvoice.status === 'overdue' ? 'Überfällig' : 'Offen'})`}
                                          >
                                            <FileText className="w-2.5 h-2.5" />
                                          </span>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openNewInvoiceSheetWithPrefill({
                                                clientId: app.clientId,
                                                amount: app.price,
                                                appointmentId: app.id,
                                                clientName: app.clientName,
                                                date: app.startTime.slice(0, 10)
                                              });
                                            }}
                                            className="opacity-20 hover:opacity-100 p-1 bg-white hover:bg-zinc-100 border border-[#bfc9c3]/40 rounded text-[#003527] transition-all cursor-pointer flex items-center justify-center shadow-none"
                                            title="Rechnung erstellen"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                        <span className="text-[10px] font-bold opacity-75">{app.price.toFixed(2)} €</span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] font-semibold mt-1 opacity-80 text-left">{app.clientName}</p>
                                  </div>

                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-[9px] font-extrabold flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatAppTimeRange(app.startTime, dur)}
                                    </span>
                                    {isResizing && (
                                      <span className="text-[9px] bg-[#003527] text-white px-1.5 py-0.5 rounded-full font-bold">
                                        {dur} Min.
                                      </span>
                                    )}
                                  </div>

                                  {/* Resize Handle */}
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, app)}
                                    className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center z-20 group-hover:bg-[#003527]/5"
                                  >
                                    <div className="w-8 h-1 bg-[#003527]/20 rounded-full group-hover:bg-[#003527]/40" />
                                  </div>
                                </div>
                              );
                            })}

                          {/* Drag ghost preview */}
                          {draggedAppId && dragOverSlot && isSameDay(currentCalendarDate, dragOverSlot.dateStr) && (
                            (() => {
                              const draggedApp = appointments.find(a => a.id === draggedAppId);
                              if (!draggedApp) return null;
                              const dur = Math.round((new Date(draggedApp.endTime).getTime() - new Date(draggedApp.startTime).getTime()) / 60000);
                              
                              const topPx = (dragOverSlot.hour - 9) * 88;
                              const heightPx = (dur / 60) * 88;

                              return (
                                <div
                                  style={{ top: `${topPx + 6}px`, height: `${heightPx - 12}px` }}
                                  className="absolute left-2 right-2 rounded-lg border-2 border-dashed border-[#003527]/30 bg-[#003527]/5 flex flex-col justify-between p-4 z-20"
                                >
                                  <div>
                                    <h4 className="font-bold text-xs text-[#003527]/60">{draggedApp.serviceName}</h4>
                                    <p className="text-[10px] text-zinc-400 font-semibold mt-1">{draggedApp.clientName}</p>
                                  </div>
                                  <span className="text-[9px] font-bold text-[#003527]/70">
                                    Verschieben nach: {dragOverSlot.hour}:00 ({dur} Min)
                                  </span>
                                </div>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* WEEK VIEW */}
                {calendarView === 'week' && (
                  <motion.div
                    key="week-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white border border-[#bfc9c3]/40 rounded-2xl py-6 px-0 shadow-none overflow-x-auto"
                  >
                    {/* Week Header Row */}
                    <div className="min-w-[800px] grid grid-cols-6 border-b border-[#bfc9c3]/20 pb-4 mb-6">
                      <div className="col-span-1" />
                      {getWeekDays(currentCalendarDate).map((dayDate) => {
                        const isToday = new Date().toDateString() === dayDate.toDateString();
                        return (
                          <div key={dayDate.toISOString()} className="col-span-1 flex flex-col items-center gap-1 select-none">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              {dayDate.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '')}
                            </span>
                            <span className={`text-base font-semibold w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isToday 
                                ? 'text-white bg-[#003527]' 
                                : 'text-[#043F2D] hover:bg-zinc-100'
                            }`}>
                              {dayDate.getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="min-w-[800px] grid grid-cols-6 divide-x divide-zinc-200/50 relative">
                      
                      {/* Hours Column */}
                      <div className="col-span-1 relative h-[704px] select-none pr-4">
                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, idx) => (
                          <div 
                            key={time} 
                            className="absolute right-4 text-[10px] font-bold text-zinc-400 -translate-y-1/2"
                            style={{ top: `${idx * 88}px` }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>

                      {/* Day Columns */}
                      {getWeekDays(currentCalendarDate).map((dayDate) => {
                        const dateStr = dayDate.toISOString().slice(0, 10);
                        const isOverThisDay = dragOverSlot && dragOverSlot.dateStr === dateStr;

                        return (
                          <div 
                            key={dateStr} 
                            className="relative h-[704px] w-full"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(dateStr, dragOverSlot?.hour || 9)}
                          >
                            {/* Background Slots */}
                            <div className="absolute inset-0 divide-y divide-zinc-100 flex flex-col pointer-events-none">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-[88px]" />
                              ))}
                            </div>

                            {/* Interactive cell overlay slots */}
                            <div className="absolute inset-0 grid grid-rows-8">
                              {Array.from({ length: 8 }).map((_, hourIdx) => {
                                const hour = hourIdx + 9;
                                return (
                                  <div
                                    key={hour}
                                    onClick={() => handleCellClick(dateStr, hour)}
                                    onDragEnter={() => setDragOverSlot({ dateStr, hour })}
                                    className="h-[88px] hover:bg-[#003527]/3 transition-colors cursor-pointer"
                                  />
                                );
                              })}
                            </div>

                            {/* Foreground Appointments Overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                              {appointments
                                .filter(app => isSameDay(dayDate, app.startTime))
                                .map((app) => {
                                  const isDragging = draggedAppId === app.id;
                                  const isResizing = resizingAppId === app.id;
                                  const dur = isResizing && tempDuration !== null ? tempDuration : Math.round((new Date(app.endTime).getTime() - new Date(app.startTime).getTime()) / 60000);
                                  const appInvoice = invoices.find(inv => inv.appointmentId === app.id);

                                  return (
                                    <div
                                      key={app.id}
                                      draggable={!isResizing}
                                      onDragStart={() => setDraggedAppId(app.id)}
                                      onDragEnd={() => { setDraggedAppId(null); setDragOverSlot(null); }}
                                      onContextMenu={(e) => handleContextMenu(e, app)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAppointment(app);
                                        setSheetMode('edit');
                                        setIsSheetOpen(true);
                                      }}
                                      style={getAppointmentStyle(app)}
                                      className={`absolute left-1 inset-x-1 rounded-lg p-2.5 border select-none cursor-grab flex flex-col justify-between overflow-hidden pointer-events-auto group ${
                                        isDragging ? 'opacity-40 shadow-none' : 'hover:scale-[1.01]'
                                      } ${
                                        isResizing ? 'z-30 cursor-ns-resize ring-2 ring-[#003527]' : 'z-10'
                                      } ${
                                        isResizing || isDragging ? '' : 'transition-all duration-200 ease-out'
                                      } ${
                                        app.status === 'booked' 
                                          ? 'bg-amber-50/90 border-amber-200/60 text-amber-900' 
                                          : app.status === 'confirmed' 
                                          ? 'bg-blue-50/90 border-blue-200/60 text-blue-900'
                                          : app.status === 'noshow' 
                                          ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900' 
                                          : 'bg-rose-50/90 border-rose-200/60 text-rose-900'
                                      } shadow-none`}
                                    >
                                      <div>
                                        <div className="flex justify-between items-start">
                                          <div className="flex-grow">
                                            <h4 className="font-extrabold text-[10px] tracking-tight leading-tight line-clamp-1">{app.serviceName}</h4>
                                            <p className="text-[9px] font-semibold opacity-75 mt-0.5 text-left">{app.clientName}</p>
                                          </div>
                                           <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                             {appInvoice ? (
                                               <span 
                                                 onClick={(e) => {
                                                   e.stopPropagation();
                                                   setActiveTab('invoices');
                                                   setInvoiceFilter('all');
                                                   setInvoiceSearch(appInvoice.invoiceNumber);
                                                 }}
                                                className={`p-0.5 rounded border flex items-center justify-center cursor-pointer ${
                                                  appInvoice.status === 'paid'
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                    : appInvoice.status === 'overdue'
                                                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                                }`}
                                                title={`Rechnung: ${appInvoice.invoiceNumber} (${appInvoice.status === 'paid' ? 'Bezahlt' : appInvoice.status === 'overdue' ? 'Überfällig' : 'Offen'})`}
                                              >
                                                <FileText className="w-2 h-2" />
                                              </span>
                                            ) : (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openNewInvoiceSheetWithPrefill({
                                                    clientId: app.clientId,
                                                    amount: app.price,
                                                    appointmentId: app.id,
                                                    clientName: app.clientName,
                                                    date: app.startTime.slice(0, 10)
                                                  });
                                                }}
                                                className="opacity-20 hover:opacity-100 p-0.5 bg-white hover:bg-zinc-100 border border-[#bfc9c3]/40 rounded text-[#003527] transition-all cursor-pointer flex items-center justify-center shadow-none"
                                                title="Rechnung erstellen"
                                              >
                                                <Plus className="w-2 h-2" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-between items-center text-[8px] font-bold">
                                        <span className="flex items-center gap-0.5 opacity-80">
                                          <Clock className="w-2 h-2" />
                                          {formatAppTimeRange(app.startTime, dur)}
                                        </span>
                                        {isResizing && (
                                          <span className="bg-[#003527] text-white px-1 py-0.2 rounded font-bold">{dur} Min.</span>
                                        )}
                                      </div>

                                      {/* Snapped Resize Handle */}
                                      <div 
                                        onMouseDown={(e) => handleResizeStart(e, app)}
                                        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center z-20 group-hover:bg-[#003527]/5"
                                      >
                                        <div className="w-6 h-0.5 bg-[#003527]/20 rounded-full group-hover:bg-[#003527]/40" />
                                      </div>
                                    </div>
                                  );
                                })}

                              {/* Ghost preview block */}
                              {isOverThisDay && draggedAppId && (
                                (() => {
                                  const draggedApp = appointments.find(a => a.id === draggedAppId);
                                  if (!draggedApp) return null;
                                  const dur = Math.round((new Date(draggedApp.endTime).getTime() - new Date(draggedApp.startTime).getTime()) / 60000);
                                  
                                  const topPx = ((dragOverSlot?.hour || 9) - 9) * 88;
                                  const heightPx = (dur / 60) * 88;

                                  return (
                                    <div
                                      style={{ top: `${topPx + 6}px`, height: `${heightPx - 12}px` }}
                                      className="absolute left-1 right-1 rounded-lg border-2 border-dashed border-[#003527]/30 bg-[#003527]/5 flex flex-col justify-between p-2 z-20"
                                    >
                                      <h4 className="font-bold text-[9px] text-[#003527]/60 truncate">{draggedApp.serviceName}</h4>
                                      <span className="text-[8px] font-bold text-[#003527]/70">
                                        {formatAppTimeRange(new Date(dayDate).setHours(dragOverSlot?.hour || 9, 0, 0, 0).toString(), dur)}
                                      </span>
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* MONTH VIEW */}
                {calendarView === 'month' && (
                  <motion.div
                    key="month-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden grid grid-cols-7 gap-[1px]"
                  >
                    {/* Day Headers */}
                    {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                      <div key={day} className="bg-[#f3f4f3] py-2 text-center text-[10px] font-bold text-zinc-400 select-none">
                        {day}
                      </div>
                    ))}

                    {/* Month Cell Grid */}
                    {getMonthDaysGrid(currentCalendarDate).map(({ date, isCurrentMonth }, idx) => {
                      const dateStr = date.toISOString().slice(0, 10);
                      const dayApps = appointments.filter(app => isSameDay(date, app.startTime));
                      const isToday = new Date().toDateString() === date.toDateString();

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setCurrentCalendarDate(date);
                            setCalendarView('day');
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleMonthCellDrop(e, date)}
                          className={`bg-white min-h-[100px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-[#f9f9f8] ${
                            isCurrentMonth ? '' : 'text-zinc-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-xs font-bold ${
                              isToday 
                                ? 'bg-[#003527] text-white w-5 h-5 rounded-full flex items-center justify-center font-sans' 
                                : isCurrentMonth ? 'text-[#043F2D]' : 'text-zinc-300'
                            }`}>
                              {date.getDate()}
                            </span>
                          </div>

                          <div className="space-y-1 mt-2">
                            {dayApps.map((app) => (
                              <div
                                key={app.id}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  setDraggedAppId(app.id);
                                }}
                                onDragEnd={() => setDraggedAppId(null)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(app);
                                  setSheetMode('edit');
                                  setIsSheetOpen(true);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold truncate border ${
                                  app.status === 'booked' 
                                    ? 'bg-amber-50/70 border-amber-200/50 text-amber-800' 
                                    : app.status === 'confirmed' 
                                    ? 'bg-blue-50/70 border-blue-200/50 text-blue-800'
                                    : app.status === 'noshow' 
                                    ? 'bg-emerald-50/70 border-emerald-200/50 text-emerald-800' 
                                    : 'bg-rose-50/70 border-rose-200/50 text-rose-800'
                                }`}
                              >
                                {formatTime(app.startTime)} {app.clientName.split(' ')[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 2: CLIENT CRM */}
          {activeTab === 'clients' && (
            <div className="relative flex-1 flex flex-col min-h-0">
              
              {/* Left Side: Client List as a secondary Sidebar */}
              <div className="fixed left-64 top-0 bottom-0 w-80 bg-white border-r border-[#bfc9c3]/30 flex flex-col z-40">
                {/* Title and Search in secondary sidebar */}
                <div className="p-6 pt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    {(() => {
                      const count = clients.filter(c => {
                        if (clientFilter === 'upcoming') {
                          return appointments.some(a => a.clientId === c.id && new Date(a.startTime) >= new Date(new Date().setHours(0,0,0,0)));
                        }
                        if (clientFilter === 'invoices') {
                          return invoices.some(i => i.clientId === c.id && (i.status === 'open' || i.status === 'overdue'));
                        }
                        return true;
                      }).length;
                      return <h3 className="text-sm font-bold text-[#003527]">Patienten ({count})</h3>;
                    })()}
                    <button
                      onClick={() => setIsNewClientModalOpen(true)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-[#003527] hover:bg-[#003527]/5 transition-all cursor-pointer animate-fade-in"
                      title="Patient anlegen"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Patient suchen..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      onFocus={() => setIsFilterMenuOpen(true)}
                      onBlur={() => setTimeout(() => setIsFilterMenuOpen(false), 200)}
                      className="w-full bg-[#f3f4f3] focus:bg-white border border-[#bfc9c3]/30 focus:border-[#003527]/60 focus:ring-1 focus:ring-[#003527]/60 rounded-xl pl-9 pr-4 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400"
                    />
                  </div>

                  {/* Accordion Filter Options */}
                  <AnimatePresence initial={false}>
                    {(isFilterMenuOpen || clientFilter !== 'all' || clientSearch !== '') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            onClick={() => setClientFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              clientFilter === 'all'
                                ? 'bg-[#003527] text-white'
                                : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                            }`}
                          >
                            Alle
                          </button>
                          <button
                            onClick={() => setClientFilter('upcoming')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              clientFilter === 'upcoming'
                                ? 'bg-[#003527] text-white'
                                : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                            }`}
                          >
                            Termine
                          </button>
                          <button
                            onClick={() => setClientFilter('invoices')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              clientFilter === 'invoices'
                                ? 'bg-[#003527] text-white'
                                : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                            }`}
                          >
                            Offene Abrechnungen
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto pb-6 border-t border-[#bfc9c3]/30">
                  {(() => {
                    const filtered = clients
                      .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
                      .filter(c => {
                        if (clientFilter === 'upcoming') {
                          return appointments.some(a => a.clientId === c.id && new Date(a.startTime) >= new Date(new Date().setHours(0,0,0,0)));
                        }
                        if (clientFilter === 'invoices') {
                          return invoices.some(i => i.clientId === c.id && (i.status === 'open' || i.status === 'overdue'));
                        }
                        return true;
                      });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs text-zinc-400 font-medium">
                          Keine Patienten gefunden
                        </div>
                      );
                    }

                    const sorted = [...filtered].sort((a, b) => {
                      // 1. Favorites first
                      if (a.isFavorite && !b.isFavorite) return -1;
                      if (!a.isFavorite && b.isFavorite) return 1;
                      // 2. Flagged first (if neither is favorite)
                      if (a.isFlagged && !b.isFlagged) return -1;
                      if (!a.isFlagged && b.isFlagged) return 1;
                      return 0;
                    });

                    return sorted.map((c) => (
                      <ClientListItem
                        key={c.id}
                        client={c}
                        isSelected={selectedClientId === c.id}
                        onSelect={() => setSelectedClientId(c.id)}
                        onToggleFavorite={() => {
                          setClients(prev => prev.map(cl => cl.id === c.id ? { ...cl, isFavorite: !cl.isFavorite } : cl));
                        }}
                        onToggleFlag={() => {
                          setClients(prev => prev.map(cl => cl.id === c.id ? { ...cl, isFlagged: !cl.isFlagged } : cl));
                        }}
                        onDelete={() => {
                          if (confirm(`Möchtest du ${c.name} wirklich löschen?`)) {
                            setClients(prev => prev.filter(cl => cl.id !== c.id));
                            if (selectedClientId === c.id) {
                              const remaining = clients.filter(cl => cl.id !== c.id);
                              setSelectedClientId(remaining.length > 0 ? remaining[0].id : '');
                            }
                          }
                        }}
                      />
                    ));
                  })()}
                </div>
              </div>

              {/* Right Side: Profile Details */}
              <div className="lg:ml-80 flex-1 flex flex-col min-h-0 h-screen">
                {currentClient ? (
                  <div className="flex-grow flex flex-col min-h-0">
                    {/* Patient Header at the very top (100% width border below, always static) */}
                    <div className="border-b border-[#bfc9c3]/30 px-12 py-6 flex justify-between items-center bg-[#f9f9f8]/95 backdrop-blur-xl z-20 flex-shrink-0">
                      <div>
                        <h3 className="text-xl font-bold text-[#043F2D]">{currentClient.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1">Registriert seit {new Date(currentClient.createdAt).toLocaleDateString('de-DE')}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                            const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                            const firstInvId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                            const firstAppId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                            setSelectedMailInvoiceId(firstInvId);
                            setSelectedMailAppointmentId(firstAppId);
                            applyMailTemplate('custom', firstInvId, firstAppId, currentClient);
                            setIsMailModalOpen(true);
                          }}
                          className="bg-[#003527] hover:bg-[#0b513d] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" /> Mail schreiben
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setIsDetailsMenuOpen(!isDetailsMenuOpen)}
                            className="p-2.5 bg-white border border-[#bfc9c3]/50 rounded-xl hover:bg-zinc-50 text-[#003527] transition-all cursor-pointer flex items-center justify-center"
                            title="Optionen anzeigen"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {isDetailsMenuOpen && (
                            <>
                              {/* Backdrop to close dropdown on click outside */}
                              <div 
                                className="fixed inset-0 z-40 bg-transparent" 
                                onClick={() => setIsDetailsMenuOpen(false)}
                              />
                              <div className="absolute top-12 right-0 w-52 bg-white border border-[#bfc9c3]/50 rounded-2xl shadow-xl overflow-hidden py-1.5 flex flex-col z-50 animate-fade-in">
                                <button
                                  onClick={() => {
                                    setIsDetailsMenuOpen(false);
                                    setSheetMode('new');
                                    setNewAppDate(new Date().toISOString().slice(0, 10));
                                    setNewAppHour(9);
                                    setNewAppClientId(currentClient.id);
                                    if (services.length > 0) setNewAppServiceId(services[0].id);
                                    setIsSheetOpen(true);
                                  }}
                                  className="px-4 py-2.5 text-xs text-[#003527] hover:bg-[#f3f4f3] font-bold text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <CalendarIcon className="w-3.5 h-3.5 text-[#003527]/70" />
                                  Termin hinzufügen
                                </button>
                                <button
                                  onClick={() => {
                                    setIsDetailsMenuOpen(false);
                                    const name = prompt('Dokumentenname (z.B. Rezept_Befund.pdf):');
                                    if (name) {
                                      const docs = clientDocuments[currentClient.id] || [];
                                      setClientDocuments(prev => ({
                                        ...prev,
                                        [currentClient.id]: [...docs, { name, size: '150 KB' }]
                                      }));
                                      showToast('Dokument erfolgreich hinzugefügt.', 'success');
                                    }
                                  }}
                                  className="px-4 py-2.5 text-xs text-[#003527] hover:bg-[#f3f4f3] font-bold text-left flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100/80"
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-[#003527]/70" />
                                  Dokument hinzufügen
                                </button>
                                <button
                                  onClick={() => {
                                    setIsDetailsMenuOpen(false);
                                    const amountStr = prompt('Rechnungsbetrag in € eingeben (z.B. 90.00):');
                                    if (amountStr) {
                                      const amount = parseFloat(amountStr.replace(',', '.'));
                                      if (!isNaN(amount) && amount > 0) {
                                        const num = invoices.length + 1;
                                        const invNum = `RE-2026-${num.toString().padStart(4, '0')}`;
                                        const newInv: Invoice = {
                                          id: `i-${Date.now()}`,
                                          appointmentId: `custom-${Date.now()}`,
                                          clientId: currentClient.id,
                                          clientName: currentClient.name,
                                          invoiceNumber: invNum,
                                          amount: amount,
                                          date: new Date().toISOString().slice(0, 10),
                                          status: 'open'
                                        };
                                        setInvoices(prev => [...prev, newInv]);
                                        showToast(`Rechnung ${invNum} über ${amount.toFixed(2)} € erstellt!`, 'success');
                                      } else {
                                        showToast('Ungültiger Betrag.', 'error');
                                      }
                                    }
                                  }}
                                  className="px-4 py-2.5 text-xs text-[#003527] hover:bg-[#f3f4f3] font-bold text-left flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100/80"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#003527]/70" />
                                  Rechnung erstellen
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scrollable details content */}
                    <div className="flex-grow overflow-y-auto px-12 py-8 space-y-6">
                      {/* Quick profile info grid */}
                      <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[#404944]">
                        {/* Stammdaten */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-widest border-b border-[#bfc9c3]/30 pb-1.5">Stammdaten</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Geburtstag</span>
                              <span className="block text-xs font-bold text-[#043F2D]">{new Date(currentClient.birthday).toLocaleDateString('de-DE')}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Telefon</span>
                              <span className="block text-xs font-bold text-[#043F2D]">{currentClient.phone || 'Keine Angabe'}</span>
                            </div>
                            <div className="space-y-0.5 col-span-2">
                              <span className="block text-[10px] font-medium text-zinc-400">E-Mail</span>
                              <span className="block text-xs font-bold text-[#043F2D] break-all">{currentClient.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Notfallkontakt & Notizen */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-widest border-b border-[#bfc9c3]/30 pb-1.5">Notfallkontakt & Notizen</h4>
                          <div className="space-y-4">
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Kontakt</span>
                              <span className="block text-xs font-bold text-[#043F2D]">{currentClient.emergencyContact || 'Kein Kontakt hinterlegt'}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Notizen</span>
                              <span className="block text-xs font-bold text-[#043F2D] leading-relaxed">{currentClient.notes || 'Keine Notizen hinterlegt'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patient Document Locker */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <h4 className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-widest">Dokumenten-Ablage (DSGVO-safe)</h4>
                          <button 
                            onClick={() => {
                              const name = prompt('Dokumentenname (z.B. Rezept_Befund.pdf):');
                              if (name) {
                                const docs = clientDocuments[currentClient.id] || [];
                                setClientDocuments(prev => ({
                                  ...prev,
                                  [currentClient.id]: [...docs, { name, size: '150 KB' }]
                                }));
                              }
                            }}
                            className="text-[10px] font-bold text-[#003527] hover:text-[#0b513d] flex items-center gap-1 cursor-pointer transition-colors bg-transparent border-none p-0"
                          >
                            <Paperclip className="w-3.5 h-3.5" /> PDF hochladen
                          </button>
                        </div>

                        <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-4 divide-y divide-zinc-200/50">
                          {(clientDocuments[currentClient.id] || []).length > 0 ? (
                            (clientDocuments[currentClient.id] || []).map((doc, idx) => (
                              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs font-semibold text-zinc-800">
                                <span className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-[#003527]/70" />
                                  <span>{doc.name}</span> 
                                  <span className="text-[9px] text-zinc-400 font-medium">({doc.size})</span>
                                </span>
                                <a href="#" className="text-[10px] font-bold text-[#003527] hover:underline transition-all">Ansehen</a>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-xs text-zinc-400 font-semibold italic">Keine Befunde oder Anamnesebögen hochgeladen.</div>
                          )}
                        </div>
                      </div>

                      {/* SOAP Notes Section */}
                      <div className="space-y-4 pt-4 border-t border-[#bfc9c3]/20">
                        <div className="flex justify-between items-center px-1">
                          <h4 className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-widest">Therapieverlauf (SOAP-Notes)</h4>
                          <button 
                            onClick={() => createSoapNote(`app-${Date.now()}`, currentClient.id)}
                            className="bg-[#003527] hover:bg-[#0b513d] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Eintrag anlegen
                          </button>
                        </div>

                        <div className="space-y-4">
                          {clientSoapNotes.length > 0 ? (
                            clientSoapNotes.map((note) => (
                              <div key={note.id} className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-5 space-y-3.5 relative">
                                <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-2">
                                  <span className="text-[10px] font-bold text-zinc-400">Behandlungs-Eintrag vom {new Date(note.date).toLocaleDateString('de-DE')}</span>
                                  {soapEditId === note.id ? (
                                    <button onClick={saveSoapNote} className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer">Speichern</button>
                                  ) : (
                                    <button onClick={() => startEditSoap(note)} className="text-[10px] font-bold text-[#003527] hover:text-[#0b513d] transition-colors flex items-center gap-0.5 cursor-pointer">
                                      <Edit2 className="w-3 h-3" /> Bearbeiten
                                    </button>
                                  )}
                                </div>

                                {soapEditId === note.id ? (
                                  <div className="space-y-3.5 text-xs">
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#003527]/70">Subjective (Befund)</label>
                                      <textarea 
                                        value={soapSubjective} 
                                        onChange={(e) => setSoapSubjective(e.target.value)} 
                                        className="w-full bg-white border border-[#bfc9c3]/50 rounded-xl p-2.5 mt-1 text-xs text-zinc-950 focus:ring-1 focus:ring-[#003527]/30 focus:border-[#003527] outline-none transition-all resize-y min-h-[60px]" 
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#003527]/70">Objective (Untersuchung)</label>
                                      <textarea 
                                        value={soapObjective} 
                                        onChange={(e) => setSoapObjective(e.target.value)} 
                                        className="w-full bg-white border border-[#bfc9c3]/50 rounded-xl p-2.5 mt-1 text-xs text-zinc-950 focus:ring-1 focus:ring-[#003527]/30 focus:border-[#003527] outline-none transition-all resize-y min-h-[60px]" 
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#003527]/70">Assessment (Beurteilung)</label>
                                      <textarea 
                                        value={soapAssessment} 
                                        onChange={(e) => setSoapAssessment(e.target.value)} 
                                        className="w-full bg-white border border-[#bfc9c3]/50 rounded-xl p-2.5 mt-1 text-xs text-zinc-950 focus:ring-1 focus:ring-[#003527]/30 focus:border-[#003527] outline-none transition-all resize-y min-h-[60px]" 
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#003527]/70">Plan (Fortsetzung)</label>
                                      <textarea 
                                        value={soapPlan} 
                                        onChange={(e) => setSoapPlan(e.target.value)} 
                                        className="w-full bg-white border border-[#bfc9c3]/50 rounded-xl p-2.5 mt-1 text-xs text-zinc-950 focus:ring-1 focus:ring-[#003527]/30 focus:border-[#003527] outline-none transition-all resize-y min-h-[60px]" 
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3.5">
                                    <div className="border-l-2 border-amber-500/80 pl-3">
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Subjective (Befund)</span>
                                      <p className="text-xs text-zinc-800 font-medium mt-0.5 leading-relaxed italic">{note.subjective}</p>
                                    </div>
                                    <div className="border-l-2 border-blue-500/80 pl-3">
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Objective (Untersuchung)</span>
                                      <p className="text-xs text-zinc-800 font-medium mt-0.5 leading-relaxed">{note.objective}</p>
                                    </div>
                                    <div className="border-l-2 border-emerald-500/80 pl-3">
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Assessment (Beurteilung)</span>
                                      <p className="text-xs text-zinc-800 font-medium mt-0.5 leading-relaxed">{note.assessment}</p>
                                    </div>
                                    <div className="border-l-2 border-[#003527]/50 pl-3">
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Plan (Fortsetzung)</span>
                                      <p className="text-xs text-zinc-800 font-medium mt-0.5 leading-relaxed">{note.plan}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-xs text-zinc-400 font-semibold italic bg-[#f9f9f8] border border-[#bfc9c3]/20 rounded-2xl">Keine Behandlungsberichte für diesen Patienten vorhanden.</div>
                          )}
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="pt-6 border-t border-rose-200/50 flex justify-between items-center">
                        <div>
                          <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Gefahrenbereich</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">Diesen Patienten unwiderruflich aus der Datenbank entfernen.</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Möchtest du diesen Patienten wirklich löschen?')) {
                              setClients(prev => prev.filter(c => c.id !== currentClient.id));
                              setSelectedClientId(clients.find(c => c.id !== currentClient.id)?.id || '');
                            }
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Patient löschen
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-12 text-center text-xs text-zinc-400 font-semibold italic">
                    Bitte wähle einen Patienten aus der Liste aus.
                  </div>
                )}
              </div>
            </div>
          )}
                    {/* TAB 3: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="bg-white border border-[#bfc9c3]/50 rounded-2xl p-8 shadow-none space-y-8 relative">
              
              {/* Dropdown Backdrop */}
              {activeInvoiceActionMenuId && (
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setActiveInvoiceActionMenuId(null)}
                />
              )}

              {/* Financial Status Summary (Apple-Style Horizontal Bar) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-6 gap-y-3 text-xs border-b border-[#bfc9c3]/20 pb-5">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Metric 1 */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#003527]/70 font-semibold">Bezahlt</span>
                    <span className="font-extrabold text-[#003527] bg-[#003527]/5 border border-[#003527]/10 rounded-full px-2.5 py-0.5 text-[11px] font-sans">
                      {invoices
                        .filter(inv => inv.status === 'paid')
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toFixed(2)}{' '}
                      €
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      ({invoices.filter(inv => inv.status === 'paid').length})
                    </span>
                  </div>
                  
                  <div className="w-px h-3 bg-[#bfc9c3]/40 hidden md:block" />
                  
                  {/* Metric 2 */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#003527]/70 font-semibold">Ausstehend</span>
                    <span className="font-extrabold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 text-[11px] font-sans">
                      {invoices
                        .filter(inv => inv.status === 'open')
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toFixed(2)}{' '}
                      €
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      ({invoices.filter(inv => inv.status === 'open').length})
                    </span>
                  </div>
                  
                  <div className="w-px h-3 bg-[#bfc9c3]/40 hidden md:block" />
                  
                  {/* Metric 3 */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#003527]/70 font-semibold">Überfällig</span>
                    <span className="font-extrabold text-rose-800 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5 text-[11px] font-sans">
                      {invoices
                        .filter(inv => inv.status === 'overdue')
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toFixed(2)}{' '}
                      €
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      ({invoices.filter(inv => inv.status === 'overdue').length})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={openNewInvoiceSheet}
                    className="bg-[#003527] hover:bg-[#0b513d] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
                  >
                    <Plus className="w-3.5 h-3.5" /> Rechnung erstellen
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsInvoiceMenuOpen(!isInvoiceMenuOpen)}
                      className="p-2.5 bg-white border border-[#bfc9c3]/50 rounded-xl hover:bg-zinc-50 text-[#003527] transition-all cursor-pointer flex items-center justify-center"
                      title="Optionen anzeigen"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isInvoiceMenuOpen && (
                      <>
                        {/* Backdrop to close dropdown on click outside */}
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={() => setIsInvoiceMenuOpen(false)}
                        />
                        <div className="absolute top-12 right-0 w-52 bg-white border border-[#bfc9c3]/50 rounded-2xl shadow-xl overflow-hidden py-1.5 flex flex-col z-50 animate-fade-in">
                          <button
                            onClick={() => {
                              setIsInvoiceMenuOpen(false);
                              exportInvoicesCsv();
                            }}
                            className="px-4 py-2.5 text-xs text-[#003527] hover:bg-[#f3f4f3] font-bold text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-[#003527]/70" />
                            CSV Export
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls & Table Grouped Together */}
              <div className="space-y-5">
                {/* Controls: Search & Filters in a unified row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Suchen..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/40 rounded-xl pl-9 pr-4 py-2 font-bold text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] focus:border-[#003527] outline-none transition-all"
                    />
                  </div>

                  {/* Filter segmented selector */}
                  <div className="bg-zinc-200/50 p-0.5 rounded-xl flex border border-zinc-200/20 w-full sm:w-auto">
                    {[
                      { id: 'all', label: 'Alle' },
                      { id: 'open', label: 'Offen' },
                      { id: 'paid', label: 'Bezahlt' },
                      { id: 'overdue', label: 'Überfällig' }
                    ].map((seg) => (
                      <button
                        key={seg.id}
                        onClick={() => setInvoiceFilter(seg.id as any)}
                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          invoiceFilter === seg.id 
                            ? 'bg-white text-[#003527] border border-[#bfc9c3]/30' 
                            : 'text-zinc-500 hover:text-[#003527]'
                        }`}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invoice List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-separate border-spacing-y-0">
                    <thead>
                      <tr className="text-zinc-400 uppercase tracking-widest font-extrabold text-[9px]">
                        <th className="py-3.5 px-5 bg-[#f9f9f8] border-y border-l border-[#bfc9c3]/30 rounded-l-xl font-extrabold">Rechnungs-Nr.</th>
                        <th className="py-3.5 px-5 bg-[#f9f9f8] border-y border-[#bfc9c3]/30 font-extrabold">Datum</th>
                        <th className="py-3.5 px-5 bg-[#f9f9f8] border-y border-[#bfc9c3]/30 font-extrabold">Empfänger</th>
                        <th className="py-3.5 px-5 bg-[#f9f9f8] border-y border-[#bfc9c3]/30 font-extrabold">Betrag</th>
                        <th className="py-3.5 px-5 bg-[#f9f9f8] border-y border-[#bfc9c3]/30 font-extrabold">Status</th>
                        <th className="py-3.5 px-5 bg-[#f9f9f8] border-y border-r border-[#bfc9c3]/30 rounded-r-xl text-right font-extrabold">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                        {invoices
                          .filter(inv => {
                            const matchesSearch = inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                                                  inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
                            const matchesFilter = invoiceFilter === 'all' || inv.status === invoiceFilter;
                            return matchesSearch && matchesFilter;
                          })
                          .map((inv) => (
                            <tr
                              key={inv.id}
                              className="text-[#003527] group"
                            >
                              <td className="py-3.5 px-5 font-mono rounded-l-xl border-b border-zinc-100 group-hover:bg-[#003527]/3 transition-colors">{inv.invoiceNumber}</td>
                              <td className="py-3.5 px-5 font-semibold text-zinc-400 border-b border-zinc-100 group-hover:bg-[#003527]/3 transition-colors">{new Date(inv.date).toLocaleDateString('de-DE')}</td>
                              <td className="py-3.5 px-5 border-b border-zinc-100 group-hover:bg-[#003527]/3 transition-colors">{inv.clientName}</td>
                              <td className="py-3.5 px-5 font-semibold text-xs border-b border-zinc-100 group-hover:bg-[#003527]/3 transition-colors">{inv.amount.toFixed(2)} €</td>
                              <td className="py-3.5 px-5 border-b border-zinc-100 group-hover:bg-[#003527]/3 transition-colors">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                                  inv.status === 'paid'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : inv.status === 'overdue'
                                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                }`}>
                                  {inv.status === 'paid' && 'Bezahlt'}
                                  {inv.status === 'overdue' && 'Überfällig'}
                                  {inv.status === 'open' && 'Offen'}
                                </span>
                              </td>
                              <td className="py-3.5 pl-5 pr-0 text-right relative rounded-r-xl border-b border-zinc-100 group-hover:bg-[#003527]/3 transition-colors">
                                <div className="relative inline-block text-left">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveInvoiceActionMenuId(
                                        activeInvoiceActionMenuId === inv.id ? null : inv.id
                                      );
                                    }}
                                    className="bg-white hover:bg-zinc-50 border border-[#bfc9c3]/50 text-[#003527] px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-none"
                                  >
                                    Aktionen <ChevronRight className="w-3 h-3 rotate-90" />
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  <AnimatePresence>
                                    {activeInvoiceActionMenuId === inv.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute right-0 mt-2 w-48 bg-white border border-[#bfc9c3]/50 rounded-2xl shadow-none overflow-hidden py-1.5 flex flex-col z-50 text-left"
                                      >
                                        <button
                                          onClick={() => sendInvoiceEmail(inv)}
                                          className="px-4 py-2 text-left text-xs font-bold text-[#003527] hover:bg-[#f3f4f3] transition-colors flex items-center gap-2 w-full"
                                        >
                                          <Mail className="w-3.5 h-3.5 text-[#003527]/60" /> Per E-Mail senden
                                        </button>
                                        
                                        <button
                                          onClick={() => downloadInvoicePdf(inv)}
                                          className="px-4 py-2 text-left text-xs font-bold text-[#003527] hover:bg-[#f3f4f3] transition-colors flex items-center gap-2 w-full"
                                        >
                                          <Download className="w-3.5 h-3.5 text-[#003527]/60" /> PDF laden
                                        </button>
                                        
                                        <button
                                          onClick={() => printInvoice(inv)}
                                          className="px-4 py-2 text-left text-xs font-bold text-[#003527] hover:bg-[#f3f4f3] transition-colors flex items-center gap-2 w-full"
                                        >
                                          <Printer className="w-3.5 h-3.5 text-[#003527]/60" /> Drucken
                                        </button>
 
                                        {inv.status !== 'paid' && (
                                          <button
                                            onClick={() => markInvoicePaid(inv.id)}
                                            className="px-4 py-2 text-left text-xs font-bold text-emerald-700 hover:bg-[#f3f4f3] transition-colors border-t border-zinc-100 flex items-center gap-2 w-full"
                                          >
                                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Als bezahlt marken
                                          </button>
                                        )}
 
                                        {(inv.status === 'open' || inv.status === 'overdue') && (
                                          <button
                                            onClick={() => sendInvoiceReminder(inv)}
                                            className="px-4 py-2 text-left text-xs font-bold text-amber-700 hover:bg-[#f3f4f3] transition-colors flex items-center gap-2 w-full"
                                          >
                                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Mahnung senden
                                          </button>
                                        )}
 
                                        <button
                                          onClick={() => cancelInvoice(inv.id)}
                                          className="px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border-t border-zinc-100 flex items-center gap-2 w-full"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Stornieren
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-white border border-[#bfc9c3]/50 rounded-2xl p-8 shadow-none space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#043F2D]">Praxis-Einstellungen</h3>
                <p className="text-xs text-zinc-400 font-semibold mt-1">Hier verwaltest du deine Stammdaten, automatische SMS/E-Mail-Erinnerungen und Syncs.</p>
              </div>

              <form onSubmit={saveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Praxisname */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Praxisname / Bezeichnung</label>
                    <input 
                      type="text" 
                      required
                      value={therapistName}
                      onChange={(e) => setTherapistName(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
                    />
                  </div>

                  {/* Währung */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Währung</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </div>

                  {/* Telefon */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Telefonnummer</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
                    />
                  </div>

                  {/* Anschrift */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Adresse / Anschrift</label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-none h-20"
                    />
                  </div>
                </div>

                {/* Integrations */}
                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">Verknüpfungen & Kalender</h4>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#404944]">
                    <div>
                      <p className="font-bold text-[#003527]">Google Calendar Sync</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Automatisches Synchronisieren aller Termine in beide Richtungen.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSyncEnabled(!syncEnabled)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        syncEnabled ? 'bg-[#003527]' : 'bg-[#bfc9c3]/50'
                      }`}
                    >
                      <motion.div 
                        layout
                        className="bg-white w-4 h-4 rounded-full border border-zinc-200"
                        animate={{ x: syncEnabled ? 24 : 0 }}
                      />
                    </button>
                  </div>

                  {syncEnabled && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] font-bold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Google Sync aktiv: {therapistName.toLowerCase().replace(/\s+/g, '')}@gmail.com
                    </div>
                  )}
                </div>

                {/* Automatic Reminders */}
                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">Automatischer No-Show Schutz (Erinnerungen)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-[#404944]">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-[#003527]">
                        <input type="checkbox" checked={reminderEmail} onChange={() => setReminderEmail(!reminderEmail)} className="rounded text-[#003527]" />
                        E-Mail Erinnerung senden
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-[#003527]">
                        <input type="checkbox" checked={reminderSms} onChange={() => setReminderSms(!reminderSms)} className="rounded text-[#003527]" />
                        SMS Erinnerung senden
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Zeitraum vor dem Termin</label>
                      <select
                        value={reminderHours}
                        onChange={(e) => setReminderHours(e.target.value)}
                        className="w-full bg-white border border-[#bfc9c3]/50 rounded-xl px-3 py-2 font-bold text-xs text-[#003527]"
                      >
                        <option value="12">12 Stunden vorher</option>
                        <option value="24">24 Stunden vorher</option>
                        <option value="48">48 Stunden vorher</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Public Booking Link */}
                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-3">
                  <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">Dein Buchungs-Link</h4>
                  <p className="text-xs text-zinc-400 font-semibold">Teile diesen Link auf deiner Website, in E-Mails oder auf Social Media, um Klienten direkt online buchen zu lassen.</p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`https://praxism.de/book/${therapistName.toLowerCase().replace(/\s+/g, '-')}`}
                      className="bg-white border border-[#bfc9c3]/40 rounded-xl px-4 py-2.5 font-bold text-xs text-[#003527] flex-1 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://praxism.de/book/${therapistName.toLowerCase().replace(/\s+/g, '-')}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="bg-[#003527] text-white hover:bg-[#0b513d] px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Kopiert' : 'Kopieren'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-[#003527] hover:bg-[#0b513d] text-white px-8 py-3.5 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingSettings ? 'Speichert...' : 'Einstellungen speichern'}
                  </button>

                  {settingsSuccess && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
                      <Check className="w-4 h-4" /> Erfolgreich gespeichert!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* DETAIL VIEW / DETAILS APPOINTMENT SIDE SHEET */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[80]"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[90] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-[#043F2D]">
                    {sheetMode === 'new' ? 'Neuer Termin' : 'Termindetails'}
                  </h3>
                  <button 
                    onClick={() => setIsSheetOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-[#003527]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {sheetMode === 'new' ? (
                  /* Form to book a new appointment */
                  <form onSubmit={handleCreateAppointment} className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Patient / Klient</label>
                      <select
                        value={newAppClientId}
                        onChange={(e) => setNewAppClientId(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527]"
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Leistung</label>
                      <select
                        value={newAppServiceId}
                        onChange={(e) => setNewAppServiceId(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527]"
                      >
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.duration} Min - {s.price} €)</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Datum</label>
                        <input
                          type="date"
                          value={newAppDate}
                          onChange={(e) => setNewAppDate(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Uhrzeit (Start)</label>
                        <select
                          value={newAppHour}
                          onChange={(e) => setNewAppHour(parseInt(e.target.value))}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527]"
                        >
                          {Array.from({ length: 8 }).map((_, i) => {
                            const hr = i + 9;
                            return (
                              <option key={hr} value={hr}>{hr.toString().padStart(2, '0')}:00 Uhr</option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs mt-6 transition-all"
                    >
                      Termin eintragen
                    </button>
                  </form>
                ) : (
                  /* Detail summary card and inline actions */
                  selectedAppointment && (
                    <div className="space-y-6">
                      
                      {/* Visual Session Summary Card */}
                      <div className="bg-[#f9f9f8] border border-[#bfc9c3]/40 rounded-[1.5rem] p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-extrabold text-[#003527] bg-[#003527]/5 border border-[#003527]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {selectedAppointment.serviceName.split(' ')[0]}
                          </span>
                          <span className="font-extrabold text-sm text-[#003527]">{selectedAppointment.price.toFixed(2)} €</span>
                        </div>
                        
                        <h4 className="font-extrabold text-sm text-[#043F2D] leading-tight">{selectedAppointment.serviceName}</h4>
                        
                        <div className="space-y-1.5 text-xs text-[#404944] font-semibold">
                          <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#003527]/60" /> {selectedAppointment.clientName}</p>
                          <p className="flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5 text-[#003527]/60" /> {new Date(selectedAppointment.startTime).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#003527]/60" /> {formatAppTimeRange(selectedAppointment.startTime, Math.round((new Date(selectedAppointment.endTime).getTime() - new Date(selectedAppointment.startTime).getTime()) / 60000))} Uhr</p>
                        </div>
                      </div>

                      {/* Status Pills Selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Status ändern</label>
                        <div className="flex gap-2">
                          {[
                            { id: 'booked', label: 'Reserviert', activeClass: 'bg-amber-500 text-white border-amber-500', defaultClass: 'bg-amber-50 text-amber-800 border-amber-200' },
                            { id: 'confirmed', label: 'Bestätigt', activeClass: 'bg-blue-600 text-white border-blue-600', defaultClass: 'bg-blue-50 text-blue-800 border-blue-200' },
                            { id: 'noshow', label: 'Erledigt', activeClass: 'bg-emerald-600 text-white border-emerald-600', defaultClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                            { id: 'cancelled', label: 'Absage', activeClass: 'bg-rose-500 text-white border-rose-500', defaultClass: 'bg-rose-50 text-rose-800 border-rose-200' }
                          ].map((st) => {
                            const isActive = selectedAppointment.status === st.id;
                            return (
                              <button
                                key={st.id}
                                onClick={() => {
                                  const updated = { ...selectedAppointment, status: st.id as any };
                                  setSelectedAppointment(updated);
                                  setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updated : a));
                                }}
                                className={`flex-1 py-2 text-[10px] font-bold border rounded-xl transition-all ${
                                  isActive ? st.activeClass : st.defaultClass
                                }`}
                              >
                                {st.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Invoicing Integration */}
                      <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#003527]" /> Abrechnung & Rechnung
                        </h4>
                        
                        {(() => {
                          const invoice = invoices.find(inv => inv.appointmentId === selectedAppointment.id);
                          if (invoice) {
                            return (
                              <div className="flex justify-between items-center text-xs font-semibold text-[#404944]">
                                <div 
                                  onClick={() => {
                                    setIsSheetOpen(false);
                                    setActiveTab('invoices');
                                    setInvoiceFilter('all');
                                    setInvoiceSearch(invoice.invoiceNumber);
                                  }}
                                  className="cursor-pointer hover:bg-zinc-100/80 p-1.5 rounded-lg transition-colors text-left"
                                  title="Zur Rechnung navigieren"
                                >
                                  <p className="font-bold text-[#003527]">Rechnungsnummer: {invoice.invoiceNumber}</p>
                                  <p className="text-[10px] text-zinc-400 mt-0.5">Erstellt am: {new Date(invoice.date).toLocaleDateString('de-DE')}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                                    invoice.status === 'paid' 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                      : 'bg-rose-50 border-rose-200 text-rose-800'
                                  }`}>
                                    {invoice.status === 'paid' ? 'Bezahlt' : 'Offen'}
                                  </span>
                                  {invoice.status === 'open' && (
                                    <button 
                                      onClick={() => markInvoicePaid(invoice.id)}
                                      className="text-[9px] bg-emerald-600 text-white px-2 py-1 rounded transition-colors"
                                    >
                                      Bezahlen
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => printInvoice(invoice)}
                                    className="p-1 bg-zinc-200 hover:bg-zinc-300 text-[#003527] rounded transition-colors"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-zinc-400 italic font-semibold">Keine Rechnung für diesen Termin erstellt.</span>
                                <button 
                                  onClick={() => openNewInvoiceSheetWithPrefill({
                                    clientId: selectedAppointment.clientId,
                                    amount: selectedAppointment.price,
                                    appointmentId: selectedAppointment.id,
                                    clientName: selectedAppointment.clientName,
                                    date: selectedAppointment.startTime.slice(0, 10)
                                  })}
                                  className="bg-[#003527] hover:bg-[#0b513d] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <Sparkles className="w-3 h-3 text-white" /> Abrechnen
                                </button>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* SOAP Notes Integration */}
                      <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">SOAP-Verlauf</h4>
                        {(() => {
                          const note = soapNotes.find(n => n.appointmentId === selectedAppointment.id);
                          if (note) {
                            return (
                              <div className="space-y-2 text-xs font-semibold text-[#404944]">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-zinc-400 font-bold">Diagnose / SOAP vorhanden</span>
                                  <button 
                                    onClick={() => {
                                      setActiveTab('clients');
                                      setSelectedClientId(selectedAppointment.clientId);
                                      startEditSoap(note);
                                      setIsSheetOpen(false);
                                    }}
                                    className="text-[10px] text-[#003527] hover:underline flex items-center gap-0.5"
                                  >
                                    Bearbeiten
                                  </button>
                                </div>
                                <p className="line-clamp-2 text-zinc-500 mt-1 italic"><strong>S:</strong> {note.subjective}</p>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-zinc-400 italic">Keine Behandlungsnotiz hinterlegt.</span>
                                <button 
                                  onClick={() => createSoapNote(selectedAppointment.id, selectedAppointment.clientId)}
                                  className="text-[10px] text-[#003527] hover:underline font-bold"
                                >
                                  Bericht anlegen
                                </button>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* Session Private Notes */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Private Anmerkungen zu dieser Sitzung</label>
                        <textarea
                          rows={3}
                          value={selectedAppointment.notes || ''}
                          onChange={(e) => {
                            const updated = { ...selectedAppointment, notes: e.target.value };
                            setSelectedAppointment(updated);
                            setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updated : a));
                          }}
                          placeholder="z.B. Patient kam 5 Min später, Schwerpunkt heute LWS Mobilisierung..."
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-semibold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-none"
                        />
                      </div>

                      {/* Deletion action */}
                      <div className="pt-6 border-t border-[#bfc9c3]/20 flex justify-between items-center">
                        <button
                          onClick={() => {
                            if (confirm('Möchtest du diesen Termin wirklich löschen?')) {
                              setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id));
                              setIsSheetOpen(false);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" /> Termin löschen
                        </button>

                        <button
                          onClick={() => setIsSheetOpen(false)}
                          className="bg-[#003527] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
                        >
                          Fertig
                        </button>
                      </div>

                    </div>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NEW CLIENT CREATION SIDE SHEET */}
      <AnimatePresence>
        {isNewClientModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewClientModalOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[100]"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[110] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-[#043F2D]">Neuen Patienten anlegen</h3>
                  <button 
                    onClick={() => setIsNewClientModalOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateClient} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Vollständiger Name</label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="z.B. Alexander Hoffmann"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Geburtsdatum</label>
                      <input
                        type="date"
                        value={newClientBirthday}
                        onChange={(e) => setNewClientBirthday(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Telefonnummer</label>
                      <input
                        type="text"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        placeholder="z.B. +49 176 123456"
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">E-Mail</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="z.B. alex@hoffmann.de"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Notfallkontakt & Bezugsperson</label>
                    <input
                      type="text"
                      value={newClientEmergency}
                      onChange={(e) => setNewClientEmergency(e.target.value)}
                      placeholder="z.B. Sarah Hoffmann (Ehefrau) - +49 176 7654321"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Anmerkungen & Vorerkrankungen</label>
                    <textarea
                      rows={4}
                      value={newClientNotes}
                      onChange={(e) => setNewClientNotes(e.target.value)}
                      placeholder="Chronische LWS-Schmerzen, Schreibtischjob..."
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none resize-none h-24 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsNewClientModalOpen(false)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Patient speichern
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EMAIL WRITING MODAL */}
      <AnimatePresence>
        {isMailModalOpen && currentClient && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMailModalOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[120]"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[560px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[130] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-[#043F2D]">E-Mail schreiben</h3>
                  <button 
                    onClick={() => setIsMailModalOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Minimalist Quick Selection for Template */}
                <div className="space-y-2 mb-5">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Vorlage</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyMailTemplate('custom', undefined, undefined, currentClient)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'custom'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Ohne
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                        const invId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                        applyMailTemplate('rechnung', invId, undefined, currentClient);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'rechnung'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Rechnung
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                        const appId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                        applyMailTemplate('bestaetigung', undefined, appId, currentClient);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'bestaetigung'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Terminbestätigung
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                        const appId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                        applyMailTemplate('stornierung', undefined, appId, currentClient);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'stornierung'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Terminabsage
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendMail} className="space-y-4">
                  {/* Invoice Dropdown if Invoice Topic is selected */}
                  {mailTopic === 'rechnung' && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Zugehörige Rechnung auswählen</label>
                      <select
                        value={selectedMailInvoiceId}
                        onChange={(e) => {
                          setSelectedMailInvoiceId(e.target.value);
                          applyMailTemplate('rechnung', e.target.value, undefined, currentClient);
                        }}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                      >
                        {invoices.filter(i => i.clientId === currentClient.id).map(i => (
                          <option key={i.id} value={i.id}>
                            Rechnung {i.invoiceNumber} vom {new Date(i.date).toLocaleDateString('de-DE')} ({i.amount.toFixed(2)} €)
                          </option>
                        ))}
                        {invoices.filter(i => i.clientId === currentClient.id).length === 0 && (
                          <option value="">Keine Rechnungen vorhanden</option>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Appointment Dropdown if Cancellation or Confirmation Topic is selected */}
                  {(mailTopic === 'stornierung' || mailTopic === 'bestaetigung') && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Zugehörigen Termin auswählen</label>
                      <select
                        value={selectedMailAppointmentId}
                        onChange={(e) => {
                          setSelectedMailAppointmentId(e.target.value);
                          applyMailTemplate(mailTopic, undefined, e.target.value, currentClient);
                        }}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                      >
                        {appointments.filter(a => a.clientId === currentClient.id).map(a => {
                          const dateStr = new Date(a.startTime).toLocaleDateString('de-DE');
                          const timeStr = new Date(a.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                          return (
                            <option key={a.id} value={a.id}>
                              {a.serviceName} - {dateStr} um {timeStr} Uhr
                            </option>
                          );
                        })}
                        {appointments.filter(a => a.clientId === currentClient.id).length === 0 && (
                          <option value="">Keine Termine vorhanden</option>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Recipient Field */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Empfänger</label>
                    <input
                      type="email"
                      value={currentClient.email}
                      disabled
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-400 rounded-2xl px-4 py-3 font-semibold text-xs outline-none cursor-not-allowed text-left"
                    />
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Betreff</label>
                    <input
                      type="text"
                      required
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      placeholder="z.B. Ihre Rechnung zur Behandlung"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  {/* Body Text Field */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">E-Mail Text</label>
                    <textarea
                      rows={8}
                      required
                      value={mailBody}
                      onChange={(e) => setMailBody(e.target.value)}
                      placeholder="Sehr geehrte Damen und Herren..."
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none resize-none h-64 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsMailModalOpen(false)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      E-Mail senden
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NEW INVOICE CREATION SIDE SHEET */}
      <AnimatePresence>
        {isNewInvoiceSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewInvoiceSheetOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[100]"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[110] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-[#043F2D]">Rechnung erstellen</h3>
                  <button 
                    onClick={() => setIsNewInvoiceSheetOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateInvoice} className="space-y-5 text-left">
                  {/* Patient selection */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Patient</label>
                    <select
                      required
                      value={newInvoiceClientId}
                      onChange={(e) => setNewInvoiceClientId(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                    >
                      <option value="" disabled>Patient auswählen...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Betrag */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Betrag in €</label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. 90,00"
                      value={newInvoiceAmount}
                      onChange={(e) => setNewInvoiceAmount(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  {/* Rechnungsnummer & Datum */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Rechnungsnummer</label>
                      <input
                        type="text"
                        required
                        value={newInvoiceNumber}
                        onChange={(e) => setNewInvoiceNumber(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Datum</label>
                      <input
                        type="date"
                        required
                        value={newInvoiceDate}
                        onChange={(e) => setNewInvoiceDate(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Status</label>
                    <select
                      required
                      value={newInvoiceStatus}
                      onChange={(e) => setNewInvoiceStatus(e.target.value as 'open' | 'paid' | 'overdue')}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                    >
                      <option value="open">Offen</option>
                      <option value="paid">Bezahlt</option>
                      <option value="overdue">Überfällig</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsNewInvoiceSheetOpen(false)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Rechnung speichern
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCmdkOpen} setIsOpen={setIsCmdkOpen} actions={cmdkActions} />

      {/* Local Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-8 right-8 z-[200] px-5 py-4 rounded-2xl border flex items-center gap-3 max-w-sm font-sans shadow-none ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-zinc-50 border-zinc-200 text-[#003527]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {toast.type === 'info' && <Clock className="w-5 h-5 text-[#003527]/60 flex-shrink-0" />}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `${contextMenu.y + 250 > window.innerHeight ? Math.max(10, contextMenu.y - 250) : contextMenu.y}px`,
              left: `${contextMenu.x + 224 > window.innerWidth ? Math.max(10, contextMenu.x - 224) : contextMenu.x}px`,
              zIndex: 9999,
            }}
            className="w-56 bg-white/80 backdrop-blur-xl border border-[#bfc9c3]/30 rounded-2xl shadow-xl p-1.5 flex flex-col font-sans text-xs text-[#003527] divide-y divide-[#bfc9c3]/15 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Info */}
            <div className="px-3 py-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider select-none text-left">
              {contextMenu.appointment.clientName}
            </div>

            {/* Invoicing Options */}
            <div className="py-1 flex flex-col">
              {(() => {
                const invoice = invoices.find(inv => inv.appointmentId === contextMenu.appointment.id);
                if (invoice) {
                  return (
                    <>
                      <button
                        onClick={() => {
                          setContextMenu(null);
                          setActiveTab('invoices');
                          setInvoiceFilter('all');
                          setInvoiceSearch(invoice.invoiceNumber);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Rechnung anzeigen
                      </button>
                      <button
                        onClick={() => {
                          setContextMenu(null);
                          printInvoice(invoice);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Rechnung drucken
                      </button>
                      <button
                        onClick={() => {
                          setContextMenu(null);
                          downloadInvoicePdf(invoice);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Als PDF laden
                      </button>
                    </>
                  );
                } else {
                  return (
                    <button
                      onClick={() => {
                        setContextMenu(null);
                        openNewInvoiceSheetWithPrefill({
                          clientId: contextMenu.appointment.clientId,
                          amount: contextMenu.appointment.price,
                          appointmentId: contextMenu.appointment.id,
                          clientName: contextMenu.appointment.clientName,
                          date: contextMenu.appointment.startTime.slice(0, 10)
                        });
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold text-emerald-700 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      Rechnung erstellen
                    </button>
                  );
                }
              })()}
            </div>

            {/* General Actions */}
            <div className="py-1 flex flex-col">
              <button
                onClick={() => {
                  setContextMenu(null);
                  setSelectedAppointment(contextMenu.appointment);
                  setSheetMode('edit');
                  setIsSheetOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                Termin bearbeiten
              </button>
              
              <button
                onClick={() => {
                  setContextMenu(null);
                  const client = clients.find(c => c.id === contextMenu.appointment.clientId);
                  if (client) {
                    setSelectedClientId(client.id);
                    createSoapNote(contextMenu.appointment.id, client.id);
                    setActiveTab('clients');
                  }
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                SOAP-Bericht erstellen
              </button>

              <button
                onClick={() => {
                  setContextMenu(null);
                  const client = clients.find(c => c.id === contextMenu.appointment.clientId);
                  if (client) {
                    setSelectedClientId(client.id);
                    setSelectedMailAppointmentId(contextMenu.appointment.id);
                    const invoice = invoices.find(inv => inv.appointmentId === contextMenu.appointment.id);
                    if (invoice) {
                      setSelectedMailInvoiceId(invoice.id);
                      applyMailTemplate('rechnung', invoice.id, contextMenu.appointment.id, client);
                    } else {
                      applyMailTemplate('bestaetigung', undefined, contextMenu.appointment.id, client);
                    }
                    setIsMailModalOpen(true);
                  }
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                E-Mail schreiben
              </button>
            </div>

            {/* Delete Option */}
            <div className="py-1 flex flex-col">
              <button
                onClick={() => {
                  setContextMenu(null);
                  if (confirm(`Möchtest du den Termin für ${contextMenu.appointment.clientName} wirklich löschen?`)) {
                    setAppointments(prev => prev.filter(a => a.id !== contextMenu.appointment.id));
                    showToast('Termin gelöscht.', 'info');
                  }
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Termin löschen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}