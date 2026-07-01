'use client';

import React from 'react';
import { 
  X, ZoomOut, ZoomIn, ChevronDown, Plus, Trash2, Check, Search, AlertCircle, Calendar, Save, Download, Printer, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import { formatGermanDate } from '@/lib/dateUtils';

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};

export default function NewInvoiceSheet() {
  const {
    isNewInvoiceSheetOpen,
    setIsNewInvoiceSheetOpen,
    prefillInvoice,
    setPrefillInvoice,
    therapistName,
    address,
    phone,
    taxNumber,
    vatId,
    iban,
    bic,
    isSmallBusiness,
    clients,
    invoices,
    setNewInvoiceClientId,
    newInvoiceClientId,
    newInvoiceAmount,
    setNewInvoiceAmount,
    newInvoiceDate,
    setNewInvoiceDate,
    newInvoiceNumber,
    setNewInvoiceNumber,
    newInvoiceStatus,
    setNewInvoiceStatus,
    newInvoiceAppointmentId,
    setNewInvoiceAppointmentId,
    appointments,
    handleCreateInvoice,
    handleUpdateDraftInvoice,
    isEditingDraft,
    setIsEditingDraft,
    isViewingInvoice,
    setIsViewingInvoice,
    printInvoice,
    downloadInvoicePdf,
    markInvoicePaid,
    cancelInvoice,
    setIsNewClientModalOpen,
    setNewClientName,
    getUnbilledAppointments,
    showToast
  } = useDashboard();

  // Local state for line items in the invoice creator
  const [lineItems, setLineItems] = React.useState<{ id: string; description: string; price: number; taxRate: number }[]>([]);

  // Local state for patient dropdown and invoice due date
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false);
  const [sidebarClientSearch, setSidebarClientSearch] = React.useState('');
  const [newInvoiceDueDate, setNewInvoiceDueDate] = React.useState('');
  const [serviceDate, setServiceDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isReverseCharge, setIsReverseCharge] = React.useState(false);
  const [clientVatId, setClientVatId] = React.useState('');
  const [vatIdError, setVatIdError] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Local state for canvas patient autocomplete search
  const [canvasClientSearch, setCanvasClientSearch] = React.useState('');
  const [isCanvasSearchFocused, setIsCanvasSearchFocused] = React.useState(false);

  // Local state for canvas zoom scale
  const [zoomScale, setZoomScale] = React.useState(100);

  // Local state for responsive active tab on mobile/tablet (edit / preview)
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('edit');
  // Local state for canvas auto zoom mode
  const [isAutoZoom, setIsAutoZoom] = React.useState(true);
  
  // Ref for canvas viewport container to observe size changes
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Local state for multi-step form inside editor sidebar
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);
  // Focus field state for Stripe-style input animations
  const [focusField, setFocusField] = React.useState<string | null>(null);

  // Auto zoom observer
  React.useEffect(() => {
    if (!isAutoZoom || !isNewInvoiceSheetOpen) return;

    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        // On small screens, we want less padding, on larger screens more
        const padding = window.innerWidth < 640 ? 32 : 96; // 32px or 96px total padding
        const availableWidth = containerWidth - padding;
        const idealScale = Math.min(1.2, availableWidth / 800); // Scale up to 120%, down to fit
        setZoomScale(Math.max(20, Math.floor(idealScale * 100)));
      }
    };

    handleResize();
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(handleResize);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isNewInvoiceSheetOpen, isAutoZoom, activeTab]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedClientForInvoice = clients.find(c => c.id === newInvoiceClientId);
  const filteredClientsForSidebar = clients.filter(c => 
    c.name.toLowerCase().includes(sidebarClientSearch.toLowerCase())
  );

  // Sync new client creation with invoice selection
  const prevClientsLength = React.useRef(clients.length);
  React.useEffect(() => {
    if (clients.length > prevClientsLength.current && isNewInvoiceSheetOpen) {
      const newestClient = clients[clients.length - 1];
      if (newestClient) {
        setNewInvoiceClientId(newestClient.id);
        setCanvasClientSearch(newestClient.name);
      }
    }
    prevClientsLength.current = clients.length;
  }, [clients, isNewInvoiceSheetOpen, setNewInvoiceClientId]);

  const calculateDefaultDueDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 10);
  };

  const getDaysDifference = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 14;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 14;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 14;
  };

  const formatDateGerman = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Synchronize newInvoiceDueDate and zoomScale when the invoice modal opens or newInvoiceDate changes
  React.useEffect(() => {
    if (isNewInvoiceSheetOpen) {
      setIsAutoZoom(true);
      setActiveTab(isViewingInvoice ? 'preview' : 'edit');
      setCurrentStep(1);
      if ((isEditingDraft || isViewingInvoice) && prefillInvoice?.dueDate) {
        setNewInvoiceDueDate(prefillInvoice.dueDate);
      } else if (newInvoiceDate) {
        setNewInvoiceDueDate(calculateDefaultDueDate(newInvoiceDate));
      } else {
        const today = new Date().toISOString().slice(0, 10);
        setNewInvoiceDueDate(calculateDefaultDueDate(today));
      }
    }
  }, [isNewInvoiceSheetOpen, newInvoiceDate, isEditingDraft, isViewingInvoice, prefillInvoice]);

  // Synchronize canvasClientSearch when newInvoiceClientId or clients changes
  React.useEffect(() => {
    const client = clients.find(c => c.id === newInvoiceClientId);
    setCanvasClientSearch(client ? client.name : '');
  }, [newInvoiceClientId, clients]);

  // Memoized inline suggestion for canvas autocomplete
  const inlineSuggestion = React.useMemo(() => {
    if (!canvasClientSearch || !isCanvasSearchFocused) return '';
    const match = clients.find(c => 
      c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase())
    );
    if (match && match.name.toLowerCase() !== canvasClientSearch.toLowerCase()) {
      return match.name;
    }
    return '';
  }, [canvasClientSearch, clients, isCanvasSearchFocused]);

  const handleCanvasSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight') {
      if (inlineSuggestion) {
        const match = clients.find(c => 
          c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase())
        );
        if (match) {
          e.preventDefault();
          setNewInvoiceClientId(match.id);
          setCanvasClientSearch(match.name);
          setIsCanvasSearchFocused(false);
        }
      }
    }
  };

  const hasInitializedRef = React.useRef(false);

  // Synchronize line items when the invoice modal opens
  React.useEffect(() => {
    if (isNewInvoiceSheetOpen) {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      if (prefillInvoice) {
        setNewInvoiceClientId(prefillInvoice.clientId);
        setNewInvoiceAppointmentId(prefillInvoice.appointmentId || null);
        setServiceDate(prefillInvoice.serviceDate || '');
        setNotes(prefillInvoice.notes || '');
        setIsReverseCharge(!!prefillInvoice.isReverseCharge);
        setClientVatId(prefillInvoice.clientSnapshot?.vatId || '');
        setVatIdError('');
        
        if (isEditingDraft || isViewingInvoice) {
          setNewInvoiceDate(prefillInvoice.date || '');
          setNewInvoiceAmount(prefillInvoice.amount.toString());
          setNewInvoiceDueDate(prefillInvoice.dueDate || '');
          if (isViewingInvoice) {
            setNewInvoiceNumber(prefillInvoice.invoiceNumber || '');
          } else {
            if (prefillInvoice.invoiceNumber && !prefillInvoice.invoiceNumber.startsWith('DRAFT-')) {
              setNewInvoiceNumber(prefillInvoice.invoiceNumber);
            } else {
              setNewInvoiceNumber('');
            }
          }
        }

        // Map line items back to positive values (absolute value) if they are copied from a storno
        const copiedItems = (prefillInvoice.lineItems || []).map((item, idx) => ({
          id: item.id || String(idx + 1),
          description: item.description,
          price: Math.abs(item.price),
          taxRate: item.taxRate || 0
        }));
        setLineItems(copiedItems);
        return;
      }

      // Initialize serviceDate & notes
      const today = new Date();
      const monthNames = [
        "Januar", "Februar", "März", "April", "Mai", "Juni", 
        "Juli", "August", "September", "Oktober", "November", "Dezember"
      ];
      setServiceDate(`${monthNames[today.getMonth()]} ${today.getFullYear()}`);
      setNotes('');
      setIsReverseCharge(false);
      setClientVatId('');
      setVatIdError('');

      if (newInvoiceAppointmentId) {
        const app = appointments.find(a => a.id === newInvoiceAppointmentId);
        if (app) {
          setLineItems([
            { id: '1', description: app.serviceName, price: app.price, taxRate: 0 }
          ]);
          return;
        }
      }
      
      if (newInvoiceAmount) {
        setLineItems([
          { id: '1', description: 'Behandlung / Leistung', price: parseFloat(newInvoiceAmount.replace(',', '.')) || 0, taxRate: 0 }
        ]);
        return;
      }

      setLineItems([
        { id: '1', description: 'Physiotherapeutische Behandlung', price: 0, taxRate: 0 }
      ]);
    } else {
      hasInitializedRef.current = false;
      setLineItems([]);
      setIsReverseCharge(false);
      setClientVatId('');
      setVatIdError('');
    }
  }, [isNewInvoiceSheetOpen, newInvoiceAppointmentId, newInvoiceAmount, appointments, prefillInvoice, setNewInvoiceClientId]);

  React.useEffect(() => {
    if (isReverseCharge) {
      setLineItems(prev => prev.map(item => ({ ...item, taxRate: 0 })));
    }
  }, [isReverseCharge]);

  // Compute totals dynamically
  const netTotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const taxTotal = isSmallBusiness 
    ? 0 
    : lineItems.reduce((sum, item) => sum + (item.price * ((item.taxRate || 0) / 100)), 0);
  const grossTotal = netTotal + taxTotal;

  const isProfileIncomplete = !iban || !bic || !taxNumber;
  const isClientAddressIncomplete = selectedClientForInvoice 
    ? !(selectedClientForInvoice.street?.trim() && selectedClientForInvoice.houseNumber?.trim() && selectedClientForInvoice.zipCode?.trim() && selectedClientForInvoice.city?.trim()) 
    : false;

  // Sync computed total back to context newInvoiceAmount state
  React.useEffect(() => {
    setNewInvoiceAmount(grossTotal.toFixed(2));
  }, [grossTotal, setNewInvoiceAmount]);

  const validateVatId = (id: string) => {
    const cleaned = id.trim();
    if (!cleaned) return 'USt-IdNr. ist erforderlich.';
    if (cleaned.length < 4) return 'Mindestens 4 Zeichen.';
    const regex = /^[A-Z]{2}[A-Z0-9]{2,12}$/i;
    if (!regex.test(cleaned)) {
      return 'Format ungültig (z.B. DE123456789).';
    }
    return '';
  };

  const onSave = async (asDraft: boolean) => {
    if (isReverseCharge) {
      const err = validateVatId(clientVatId);
      if (err) {
        setVatIdError(err);
        showToast(`Ungültige USt-IdNr.: ${err}`, 'error');
        return;
      }
    }

    if (isEditingDraft && prefillInvoice) {
      await handleUpdateDraftInvoice(
        prefillInvoice.id,
        lineItems,
        newInvoiceDueDate,
        serviceDate,
        notes,
        isReverseCharge,
        clientVatId,
        !asDraft
      );
    } else {
      await handleCreateInvoice(
        null,
        lineItems,
        newInvoiceDueDate,
        serviceDate,
        notes,
        isReverseCharge,
        clientVatId,
        asDraft
      );
    }
  };

  if (!isNewInvoiceSheetOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="fixed inset-0 bg-[#f9f9f8] z-[150] flex flex-col overflow-hidden text-left font-sans"
    >
      <style>{`
        .no-datepicker-icon::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none !important;
        }
      `}</style>
      <form onSubmit={(e) => {
        if (isReverseCharge) {
          const err = validateVatId(clientVatId);
          if (err) {
            e.preventDefault();
            setVatIdError(err);
            showToast(`Ungültige USt-IdNr.: ${err}`, 'error');
            return;
          }
        }
        handleCreateInvoice(e, lineItems, newInvoiceDueDate, serviceDate, notes, isReverseCharge, clientVatId);
      }} className="h-full w-full flex flex-col overflow-hidden">
        {/* Premium SaaS Header */}
        <header className="h-16 bg-white border-b border-[#bfc9c3]/20 flex items-center justify-between px-6 flex-shrink-0 z-30 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#003527]/5 text-[#003527] flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="hidden sm:block text-left">
                <h2 className="text-sm font-extrabold text-[#003527] leading-none">
                  {isViewingInvoice ? 'Rechnung ansehen' : isEditingDraft ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}
                </h2>
                <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                  {isViewingInvoice ? `Rechnungs-Nr. ${prefillInvoice?.invoiceNumber || ''}` : 'Erstelle ein gesetzeskonformes Abrechnungsdokument'}
                </p>
              </div>
              <div className="block sm:hidden text-left">
                <h2 className="text-xs font-extrabold text-[#003527] leading-none">
                  {isViewingInvoice ? 'Rechnung' : 'Rechnung erstellen'}
                </h2>
              </div>
            </div>
          </div>

          {/* Segmented Control Tabs for Mobile/Tablet */}
          <div className="flex lg:hidden bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/40 w-52 sm:w-64">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-1.5 text-[10px] sm:text-[10.5px] font-bold rounded-lg transition-all border-none cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-white text-[#003527] shadow-sm font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-800 bg-transparent'
              }`}
            >
              {isViewingInvoice ? 'Aktionen' : 'Daten'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-1.5 text-[10px] sm:text-[10.5px] font-bold rounded-lg transition-all border-none cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-[#003527] shadow-sm font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-800 bg-transparent'
              }`}
            >
              Vorschau
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsNewInvoiceSheetOpen(false);
              setIsEditingDraft(false);
              setIsViewingInvoice(false);
              setPrefillInvoice(null);
            }}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
            title="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Split Workspace */}
        <div className="flex-grow flex min-h-0 overflow-hidden relative">

          {/* Left Side Container: DINA4 Document Canvas Workspace */}
          <div 
            ref={containerRef}
            className={`flex-grow bg-[#f3f4f3] relative flex flex-col min-h-0 ${
              activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Scrollable Canvas Viewport */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-8 lg:p-12 flex justify-center items-start min-h-0">
              
              {/* Outer Layout Container for centered layout sizing */}
              <div
                style={{
                  width: `${800 * (zoomScale / 100)}px`,
                  height: `${1150 * (zoomScale / 100)}px`,
                  position: 'relative'
                }}
                className="transition-all duration-200 flex-shrink-0 my-4"
              >
                {/* DIN A4 Canvas Sheet Wrapper for Zooming */}
                <div
                  style={{
                    transform: `scale(${zoomScale / 100})`,
                    transformOrigin: 'top left',
                    width: '800px',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  className="transition-all duration-200"
                >
                  {/* DIN A4 Canvas Sheet */}
                  <div className="bg-white shadow-2xl rounded-lg p-16 border border-[#bfc9c3]/30 w-full min-h-[1130px] flex flex-col justify-between text-[#003527] font-sans relative">
                  
                  {/* DINA4 Header: Letterhead */}
                  <div>
                    <div className="flex justify-between items-start border-b border-[#bfc9c3]/20 pb-8 mb-10">
                      <div className="text-left space-y-1">
                        <h4 className="text-base font-extrabold text-[#003527] tracking-tight">{therapistName}</h4>
                        <p className="text-[10px] text-zinc-400 font-semibold">{address}</p>
                        <p className="text-[10px] text-zinc-400 font-semibold">Tel: {phone}</p>
                      </div>
                      <div className="text-right">
                        <h1 className="text-xl font-bold tracking-widest text-[#003527]/40 font-serif">RECHNUNG</h1>
                      </div>
                    </div>

                    {/* Recipient on the left, details on the right split layout */}
                    <div className="grid grid-cols-2 gap-8 border-b border-[#bfc9c3]/20 pb-8 mb-10 text-[#003527]">
                      {/* Left: Recipient */}
                      <div className="text-left space-y-2 relative">
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Rechnungsempfänger</p>
                        
                        {/* Autocomplete Search input */}
                        <div className="relative w-full flex items-center">
                          {/* Underlay text for suggestion */}
                          {inlineSuggestion && !isViewingInvoice && (
                            <div className="absolute left-0 right-0 px-2 py-1 pointer-events-none font-extrabold text-sm select-none text-zinc-300 whitespace-pre flex items-center">
                              <span className="opacity-0">{canvasClientSearch}</span>
                              <span>{inlineSuggestion.slice(canvasClientSearch.length)}</span>
                            </div>
                          )}
                          
                          <input
                            type="text"
                            value={canvasClientSearch}
                            onFocus={() => !isViewingInvoice && setIsCanvasSearchFocused(true)}
                            onBlur={() => {
                              setTimeout(() => setIsCanvasSearchFocused(false), 200);
                            }}
                            onKeyDown={handleCanvasSearchKeyDown}
                            onChange={(e) => {
                              setCanvasClientSearch(e.target.value);
                              // If user clears name, clear ID
                              if (!e.target.value) {
                                setNewInvoiceClientId('');
                              }
                            }}
                            placeholder={isViewingInvoice ? "" : "Name des Klienten..."}
                            readOnly={isViewingInvoice}
                            className={`w-full bg-transparent border border-transparent px-2 py-1 outline-none font-extrabold text-sm text-[#003527] transition-all rounded-lg z-10 ${
                              isViewingInvoice ? 'cursor-default pointer-events-none' : 'hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5'
                            }`}
                          />
                        </div>

                        {/* Recipient Details display below input */}
                        {isViewingInvoice && prefillInvoice ? (
                          <div className="space-y-0.5 text-xs text-zinc-500 font-semibold pl-2 text-left">
                            <p className="text-[11px] text-[#003527] font-extrabold">{prefillInvoice.clientName}</p>
                            {prefillInvoice.clientSnapshot?.street && (
                              <p className="text-[11px] text-zinc-600">{prefillInvoice.clientSnapshot.street} {prefillInvoice.clientSnapshot.houseNumber}</p>
                            )}
                            {prefillInvoice.clientSnapshot?.zipCode && (
                              <p className="text-[11px] text-zinc-600">{prefillInvoice.clientSnapshot.zipCode} {prefillInvoice.clientSnapshot.city}</p>
                            )}
                            {(prefillInvoice.clientSnapshot?.email || prefillInvoice.clientSnapshot?.phone) && (
                              <p className="text-[10px] text-zinc-400 mt-1">
                                {prefillInvoice.clientSnapshot.email} {prefillInvoice.clientSnapshot.phone ? `| ${prefillInvoice.clientSnapshot.phone}` : ''}
                              </p>
                            )}
                            {isReverseCharge && prefillInvoice.clientSnapshot?.vatId && (
                              <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                                USt-IdNr.: {prefillInvoice.clientSnapshot.vatId}
                              </p>
                            )}
                          </div>
                        ) : (() => {
                          const client = clients.find(c => c.id === newInvoiceClientId);
                          if (client) {
                            const hasStreet = !!(client.street?.trim() && client.houseNumber?.trim());
                            const hasCity = !!(client.zipCode?.trim() && client.city?.trim());
                            return (
                              <div className="space-y-0.5 text-xs text-zinc-500 font-semibold pl-2 transition-all animate-in fade-in duration-200">
                                {hasStreet ? (
                                  <p className="text-[11px] text-zinc-600">{client.street} {client.houseNumber}</p>
                                ) : (
                                  <p className="text-[11px] text-red-500 inline-flex items-center gap-1 select-none animate-pulse">
                                    <AlertCircle className="w-2.5 h-2.5" /> Straße / Hausnummer fehlt
                                  </p>
                                )}
                                {hasCity ? (
                                  <p className="text-[11px] text-zinc-600">{client.zipCode} {client.city}</p>
                                ) : (
                                  <p className="text-[11px] text-red-500 inline-flex items-center gap-1 select-none animate-pulse">
                                    <AlertCircle className="w-2.5 h-2.5" /> PLZ / Ort fehlt
                                  </p>
                                )}
                                <p className="text-[10px] text-zinc-400 mt-1">{client.email} | {client.phone}</p>
                                {isReverseCharge && (
                                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                                    {clientVatId ? `USt-IdNr.: ${clientVatId.toUpperCase()}` : (
                                      <span className="text-red-500 select-none animate-pulse flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5" /> USt-IdNr. des Klienten fehlt
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            );
                          }
                          
                          if (inlineSuggestion) {
                            const match = clients.find(c => c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase()));
                            if (match) {
                              return (
                                <div className="space-y-0.5 text-xs text-zinc-300/55 font-semibold pl-2 transition-all animate-in fade-in duration-200">
                                  <p className="text-[11px]">{match.email} (Vorschau)</p>
                                  <p className="text-[11px]">{match.phone} (Vorschau)</p>
                                </div>
                              );
                            }
                          }
                          if (canvasClientSearch && !clients.some(c => c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase()))) {
                            return (
                              <div className="pl-2 pt-1 animate-in fade-in duration-200">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewClientName(canvasClientSearch);
                                    setIsNewClientModalOpen(true);
                                  }}
                                  className="text-[10.5px] text-[#003527] hover:text-[#0b513d] font-bold hover:underline cursor-pointer flex items-center gap-1.5 transition-all border-none bg-transparent"
                                >
                                  <Plus className="w-3.5 h-3.5" /> "{canvasClientSearch}" als neuen Klienten anlegen
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-0.5 text-xs text-zinc-300 font-semibold pl-2 select-none">
                              <p className="text-[11px] text-zinc-300/60">[Straße & Hausnummer]</p>
                              <p className="text-[11px] text-zinc-300/60">[PLZ & Ort]</p>
                              <p className="text-[10px] text-amber-600/80 font-bold mt-1.5 animate-pulse">
                                ⚠️ Bitte Namen eingeben, um Klienten auszuwählen
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Right: Details (Rechnungsdaten) */}
                      <div className="flex flex-col items-end justify-start text-right">
                        <div className="w-full max-w-[240px] space-y-2 text-xs font-bold">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Rechnungs-Nr.</span>
                            <input
                              type="text"
                              required
                              value={newInvoiceNumber}
                              onChange={(e) => setNewInvoiceNumber(e.target.value)}
                              readOnly={isViewingInvoice}
                              className={`w-28 bg-transparent border border-transparent px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg ${
                                isViewingInvoice ? 'cursor-default pointer-events-none' : 'hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5'
                              }`}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Datum</span>
                            <div className="relative w-28">
                              <input
                                type="date"
                                required
                                value={newInvoiceDate}
                                onChange={(e) => setNewInvoiceDate(e.target.value)}
                                onClick={(e) => {
                                  if (isViewingInvoice) return;
                                  try {
                                    e.currentTarget.showPicker();
                                  } catch (err) {}
                                }}
                                readOnly={isViewingInvoice}
                                className={`w-full bg-transparent border border-transparent px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg animate-none no-datepicker-icon ${
                                  isViewingInvoice ? 'cursor-default pointer-events-none pr-2' : 'hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 cursor-pointer pr-6'
                                }`}
                              />
                              {!isViewingInvoice && <Calendar className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#003527]/40 pointer-events-none" />}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col items-start text-left">
                              <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Zahlungsziel</span>
                              <span className="text-[8.5px] text-zinc-400 font-semibold leading-none mt-0.5">
                                ({getDaysDifference(newInvoiceDate || new Date().toISOString().slice(0, 10), newInvoiceDueDate)} Tage)
                              </span>
                            </div>
                            <div className="relative w-28">
                              <input
                                type="date"
                                required
                                value={newInvoiceDueDate}
                                onChange={(e) => setNewInvoiceDueDate(e.target.value)}
                                onClick={(e) => {
                                  if (isViewingInvoice) return;
                                  try {
                                    e.currentTarget.showPicker();
                                  } catch (err) {}
                                }}
                                readOnly={isViewingInvoice}
                                className={`w-full bg-transparent border border-transparent px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg no-datepicker-icon ${
                                  isViewingInvoice ? 'cursor-default pointer-events-none pr-2' : 'hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 cursor-pointer pr-6'
                                }`}
                              />
                              {!isViewingInvoice && <Calendar className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#003527]/40 pointer-events-none" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-4">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider border-b border-[#bfc9c3]/20 pb-2">Rechnungspositionen</p>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] border-b border-[#bfc9c3]/20">
                            <th className="py-2 w-12 font-bold">Pos.</th>
                            <th className="py-2 font-bold">Leistungsbeschreibung</th>
                            {!isSmallBusiness && !isReverseCharge && <th className="py-2 text-right w-20 font-bold">USt.</th>}
                            <th className="py-2 text-right w-28 font-bold">Betrag</th>
                            <th className="py-2 text-right w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item, idx) => (
                            <tr key={item.id} className="border-b border-[#bfc9c3]/10 group/row font-bold text-[#003527]">
                              <td className="py-3.5 font-mono text-zinc-400 text-left">{idx + 1}</td>
                              <td className="py-2">
                                <input
                                  type="text"
                                  required
                                  value={item.description}
                                  onChange={(e) => {
                                    const updated = lineItems.map(li => li.id === item.id ? { ...li, description: e.target.value } : li);
                                    setLineItems(updated);
                                  }}
                                  readOnly={isViewingInvoice}
                                  className={`w-full bg-transparent border border-transparent px-2 py-1 outline-none font-bold text-xs text-[#003527] transition-all text-left rounded-lg ${
                                    isViewingInvoice ? 'cursor-default pointer-events-none' : 'hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 focus:ring-0'
                                  }`}
                                  placeholder="z.B. Osteopathische Behandlung"
                                />
                              </td>
                              {!isSmallBusiness && !isReverseCharge && (
                                <td className="py-2 text-right">
                                  <select
                                    value={item.taxRate}
                                    onChange={(e) => {
                                      const rate = parseInt(e.target.value) || 0;
                                      const updated = lineItems.map(li => li.id === item.id ? { ...li, taxRate: rate } : li);
                                      setLineItems(updated);
                                    }}
                                    disabled={isViewingInvoice}
                                    className={`bg-transparent border border-transparent px-1.5 py-1 outline-none text-xs font-bold text-[#003527] rounded ${
                                      isViewingInvoice ? 'cursor-default pointer-events-none appearance-none' : 'hover:border-zinc-200 focus:border-[#003527] cursor-pointer'
                                    }`}
                                  >
                                    <option value={0}>0%</option>
                                    <option value={7}>7%</option>
                                    <option value={19}>19%</option>
                                  </select>
                                </td>
                              )}
                              <td className="py-2 text-right">
                                <div className="inline-flex items-center justify-end">
                                  <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={item.price || ''}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      const updated = lineItems.map(li => li.id === item.id ? { ...li, price: val } : li);
                                      setLineItems(updated);
                                    }}
                                    readOnly={isViewingInvoice}
                                    className={`w-20 bg-transparent border border-transparent px-2 py-1 outline-none font-bold text-right text-xs text-[#003527] transition-all rounded-lg ${
                                      isViewingInvoice ? 'cursor-default pointer-events-none' : 'hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 focus:ring-0'
                                    }`}
                                    placeholder="0,00"
                                  />
                                  <span className="ml-1 text-zinc-400 font-bold">€</span>
                                </div>
                              </td>
                              <td className="py-2 text-right">
                                {!isViewingInvoice && lineItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLineItems(lineItems.filter(li => li.id !== item.id));
                                    }}
                                    className="text-rose-600 hover:text-rose-700 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer p-1 border-none bg-transparent"
                                    title="Position löschen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Add item button */}
                      {!isViewingInvoice && (
                        <button
                          type="button"
                          onClick={() => {
                            setLineItems([
                              ...lineItems,
                              { id: `li-${Date.now()}`, description: 'Neue Leistung', price: 0, taxRate: 0 }
                            ]);
                          }}
                          className="w-full mt-4 border border-dashed border-[#003527]/20 hover:border-[#003527]/40 bg-[#003527]/5 hover:bg-[#003527]/10 text-[#003527] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                        >
                          <Plus className="w-4 h-4" /> Position hinzufügen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DINA4 Footer & Total Block */}
                  <div className="mt-16 space-y-12">
                    {/* Total Sum */}
                    {isSmallBusiness ? (
                      <div className="border-t border-[#bfc9c3]/20 pt-6 flex flex-col items-end gap-2">
                        <div className="flex justify-end items-baseline gap-4">
                          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Gesamtsumme:</span>
                          <span className="text-2xl font-extrabold text-[#003527] font-serif">{grossTotal.toFixed(2)} €</span>
                        </div>
                        <p className="text-[9.5px] text-zinc-500 font-bold italic mt-1 text-right w-full">
                          Kein Ausweis der Umsatzsteuer aufgrund der Anwendung der Kleinunternehmerregelung gem. § 19 UStG.
                        </p>
                      </div>
                    ) : isReverseCharge ? (
                      <div className="border-t border-[#bfc9c3]/20 pt-6 flex flex-col items-end gap-2">
                        <div className="flex justify-end items-baseline gap-4">
                          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Gesamtsumme (Netto):</span>
                          <span className="text-2xl font-extrabold text-[#003527] font-serif">{netTotal.toFixed(2)} €</span>
                        </div>
                        <p className="text-[9.5px] text-zinc-500 font-bold italic mt-1 text-right w-full">
                          Steuerschuldnerschaft des Leistungsempfängers (Reverse-Charge-Verfahren nach § 13b UStG).
                        </p>
                      </div>
                    ) : (
                      <div className="border-t border-[#bfc9c3]/20 pt-6 flex justify-end">
                        <div className="space-y-1.5 text-right w-full max-w-[280px] text-[#003527]">
                          <div className="flex justify-between text-xs font-semibold text-zinc-500">
                            <span>Netto:</span>
                            <span>{netTotal.toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-zinc-500">
                            <span>Umsatzsteuer:</span>
                            <span>{taxTotal.toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between items-baseline gap-4 pt-1.5 border-t border-[#bfc9c3]/10">
                            <span className="text-[#003527] text-xs font-extrabold uppercase tracking-wider">Brutto-Gesamtsumme:</span>
                            <span className="text-xl font-extrabold text-[#003527] font-serif">{grossTotal.toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Payment Terms details */}
                    <div className="border-t border-[#bfc9c3]/20 pt-6 space-y-3 text-left">
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                        Bitte überweisen Sie den Rechnungsbetrag von <strong className="text-[#003527]">{grossTotal.toFixed(2)} €</strong> bis zum <strong className="text-[#003527]">{formatDateGerman(newInvoiceDueDate)}</strong> (innerhalb von {getDaysDifference(newInvoiceDate || new Date().toISOString().slice(0, 10), newInvoiceDueDate)} Tagen) unter Angabe der Rechnungsnummer <strong className="text-[#003527]">{newInvoiceNumber}</strong> auf das unten aufgeführte Praxiskonto.
                        {" "}Wir weisen darauf hin, dass Sie gemäß § 286 Abs. 3 BGB auch ohne gesonderte Mahnung in Verzug geraten, wenn Sie die Zahlung nicht innerhalb von 30 Tagen nach Fälligkeit und Zugang dieser Rechnung leisten.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-[9px] text-zinc-400 font-semibold border-t border-[#bfc9c3]/10 pt-3">
                        <div className="space-y-0.5 text-left">
                          <p>Inhaber: {therapistName}</p>
                          <p>
                            Steuernummer: {taxNumber ? (
                              taxNumber
                            ) : (
                              <span className="text-red-500 font-extrabold select-none animate-pulse inline-flex items-center gap-1 align-middle">
                                <AlertCircle className="w-3 h-3" /> Steuernummer fehlt
                              </span>
                            )}
                          </p>
                          {vatId && <p>USt-IdNr.: {vatId}</p>}
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p>
                            IBAN: {iban ? (
                              iban
                            ) : (
                              <span className="text-red-500 font-extrabold inline-flex items-center gap-1 select-none animate-pulse align-middle justify-end">
                                <AlertCircle className="w-3 h-3" /> IBAN fehlt
                              </span>
                            )}
                          </p>
                          <p>
                            BIC: {bic ? (
                              bic
                            ) : (
                              <span className="text-red-500 font-extrabold inline-flex items-center gap-1 select-none animate-pulse align-middle justify-end">
                                <AlertCircle className="w-3 h-3" /> BIC fehlt
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

            {/* Floating Zoom Controls */}
            <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-zinc-200/80 px-3 py-1.5 rounded-full shadow-lg items-center gap-2.5 z-30 select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                type="button"
                onClick={() => {
                  setIsAutoZoom(false);
                  setZoomScale(prev => Math.max(40, prev - 10));
                }}
                disabled={zoomScale <= 40}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100 disabled:opacity-40 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0 border-none bg-transparent"
                title="Verkleinern"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <button
                type="button"
                onClick={() => setIsAutoZoom(prev => !prev)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all border cursor-pointer flex items-center gap-1 ${
                  isAutoZoom 
                    ? 'bg-[#003527]/10 text-[#003527] border-[#003527]/20' 
                    : 'text-zinc-500 hover:text-zinc-800 bg-transparent border-transparent hover:bg-zinc-100'
                }`}
                title={isAutoZoom ? "Automatisches Einpassen aktiv" : "An Bildschirm anpassen"}
              >
                Auto ({zoomScale}%)
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsAutoZoom(false);
                  setZoomScale(prev => Math.min(150, prev + 10));
                }}
                disabled={zoomScale >= 150}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100 disabled:opacity-40 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0 border-none bg-transparent"
                title="Vergrößern"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Side: Sidebar Panel */}
          {isViewingInvoice && prefillInvoice ? (
            <aside className={`w-full lg:w-80 bg-white border-l border-[#bfc9c3]/30 p-6 flex flex-col justify-between overflow-y-auto flex-shrink-0 ${
              activeTab === 'edit' ? 'flex' : 'hidden lg:flex'
            }`}>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-wider mb-4 border-b border-[#bfc9c3]/20 pb-2">Rechnungsdetails</h4>
                </div>

                <div className="space-y-5 text-left text-xs font-semibold text-zinc-500">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Rechnungsnummer</p>
                    <p className="text-sm font-bold text-[#003527] font-mono text-left">{prefillInvoice.invoiceNumber}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Rechnungsdatum</p>
                    <p className="text-sm font-bold text-[#003527] text-left">{formatGermanDate(prefillInvoice.date)}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Zahlungsstatus</p>
                    <div className="text-left">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border inline-block mt-0.5 ${
                        prefillInvoice.status === 'paid'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : prefillInvoice.status === 'overdue'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : prefillInvoice.status === 'cancelled'
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        {prefillInvoice.status === 'paid' && 'Bezahlt'}
                        {prefillInvoice.status === 'overdue' && 'Überfällig'}
                        {prefillInvoice.status === 'open' && 'Offen'}
                        {prefillInvoice.status === 'cancelled' && 'Storniert'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Klient</p>
                    <p className="text-sm font-bold text-[#003527] text-left">{prefillInvoice.clientName}</p>
                  </div>

                  {prefillInvoice.notes && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Zahlungshinweis / Notiz</p>
                      <p className="text-xs font-semibold text-zinc-500 bg-zinc-50 border border-zinc-150 p-2.5 rounded-xl leading-relaxed text-left">{prefillInvoice.notes}</p>
                    </div>
                  )}

                  <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 p-4 rounded-2xl text-[10px] text-zinc-400 font-bold space-y-1">
                    <p className="text-[#003527] uppercase tracking-wider text-[8px] mb-1 text-left">Bruttobetrag</p>
                    <p className="text-base font-extrabold text-[#003527] text-left">{prefillInvoice.amount.toFixed(2)} €</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-6 border-t border-[#bfc9c3]/20">
                <button
                  type="button"
                  onClick={() => printInvoice(prefillInvoice)}
                  className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-none"
                >
                  <Printer className="w-3.5 h-3.5 text-white/80" /> Drucken
                </button>
                
                {prefillInvoice.status !== 'paid' && prefillInvoice.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await markInvoicePaid(prefillInvoice.id);
                      setIsNewInvoiceSheetOpen(false);
                      setIsViewingInvoice(false);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    <Check className="w-3.5 h-3.5" /> Als bezahlt markieren
                  </button>
                )}

                {prefillInvoice.status !== 'cancelled' && !prefillInvoice.invoiceNumber.startsWith('ST-') && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsNewInvoiceSheetOpen(false);
                      setIsViewingInvoice(false);
                      const success = await cancelInvoice(prefillInvoice.id);
                      if (success) {
                        if (confirm('Möchtest du einen korrigierten Entwurf auf Basis dieser stornierten Rechnung erstellen?')) {
                          setPrefillInvoice(prefillInvoice);
                          setIsNewInvoiceSheetOpen(true);
                        }
                      }
                    }}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Stornieren
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => downloadInvoicePdf(prefillInvoice)}
                  className="w-full bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-none"
                >
                  <Download className="w-3.5 h-3.5" /> PDF herunterladen
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsNewInvoiceSheetOpen(false);
                    setIsViewingInvoice(false);
                    setPrefillInvoice(null);
                  }}
                  className="w-full bg-transparent hover:bg-zinc-100 text-zinc-500 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border-none"
                >
                  Schließen
                </button>
              </div>
            </aside>
          ) : (
            <aside className={`w-full lg:w-80 bg-white border-l border-[#bfc9c3]/30 p-6 flex flex-col justify-between overflow-y-auto flex-shrink-0 ${
              activeTab === 'edit' ? 'flex' : 'hidden lg:flex'
            }`}>
              <div className="flex-grow flex flex-col justify-between min-h-0">
                <div className="space-y-5 text-left">
                  
                  {/* Stepper Progress Indicator */}
                  <div className="border-b border-[#bfc9c3]/20 pb-4 mb-4 select-none">
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                      <span className={currentStep === 1 ? "text-[#003527]" : ""}>1. Klient</span>
                      <span className="text-zinc-350 font-normal">➔</span>
                      <span className={currentStep === 2 ? "text-[#003527]" : ""}>2. Details</span>
                      <span className="text-zinc-350 font-normal">➔</span>
                      <span className={currentStep === 3 ? "text-[#003527]" : ""}>3. Positionen</span>
                    </div>
                    
                    {/* Visual progress bar */}
                    <div className="h-1 bg-zinc-100 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-[#003527] transition-all duration-300 rounded-full" 
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-5"
                    >
                      {/* STEP 1: CLIENT & APPOINTMENT */}
                      {currentStep === 1 && (
                        <>
                          <div className="space-y-2 relative" ref={dropdownRef}>
                            {/* Custom Trigger styled as Stripe Floating Input */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsClientDropdownOpen(!isClientDropdownOpen);
                                setSidebarClientSearch('');
                              }}
                              className={`relative w-full border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white text-left ${
                                isClientDropdownOpen || selectedClientForInvoice
                                  ? 'border-[#003527] ring-1 ring-[#003527]'
                                  : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                              }`}
                            >
                              <span className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                isClientDropdownOpen || selectedClientForInvoice
                                  ? 'top-1.5 text-[9px] text-[#003527]'
                                  : 'top-3.5 text-xs text-zinc-450 font-normal'
                              }`}>
                                Klient auswählen
                              </span>
                              
                              <div className="flex items-center justify-between gap-2 min-w-0 h-6 pt-0.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  {selectedClientForInvoice ? (
                                    <>
                                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-[9px] font-extrabold flex-shrink-0">
                                        {getInitials(selectedClientForInvoice.name)}
                                      </div>
                                      <span className="truncate text-xs font-bold text-[#003527]">{selectedClientForInvoice.name}</span>
                                    </>
                                  ) : (
                                    <span className="text-zinc-400 text-xs font-normal">Klient auswählen...</span>
                                  )}
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-[#003527]/50 flex-shrink-0 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                              </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isClientDropdownOpen && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-[#bfc9c3]/30 rounded-2xl shadow-xl z-50 overflow-hidden py-1 text-left flex flex-col max-h-64 animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="px-3 py-2 border-b border-zinc-100 flex items-center gap-2 flex-shrink-0">
                                  <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                                  <input
                                    type="text"
                                    placeholder="Suchen..."
                                    value={sidebarClientSearch}
                                    onChange={(e) => setSidebarClientSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-transparent text-xs font-bold text-[#003527] outline-none border-none p-0 placeholder-zinc-400"
                                  />
                                </div>
                                <div className="overflow-y-auto flex-grow max-h-48 py-1">
                                  {filteredClientsForSidebar.length === 0 ? (
                                    <p className="text-center py-4 text-[10px] text-zinc-400 font-bold">Keine Klienten gefunden</p>
                                  ) : (
                                    filteredClientsForSidebar.map(client => (
                                      <button
                                        key={client.id}
                                        type="button"
                                        onClick={() => {
                                          setNewInvoiceClientId(client.id);
                                          setIsClientDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-2 hover:bg-[#f3f4f3] text-left text-xs font-bold text-[#003527] transition-colors flex items-center justify-between gap-2 border-none bg-transparent cursor-pointer"
                                      >
                                        <span>{client.name}</span>
                                        {newInvoiceClientId === client.id && <Check className="w-3.5 h-3.5 text-[#003527]" />}
                                      </button>
                                    ))
                                  )}
                                </div>
                                <div className="border-t border-zinc-100 p-2 bg-[#f9f9f8] flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsClientDropdownOpen(false);
                                      setIsNewClientModalOpen(true);
                                    }}
                                    className="w-full py-2 bg-[#003527] hover:bg-[#0b513d] text-white rounded-xl text-[10px] font-extrabold tracking-wider uppercase transition-colors cursor-pointer border-none"
                                  >
                                    Neuen Klienten anlegen
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Appointment Link Selector */}
                          {selectedClientForInvoice && !isViewingInvoice && (() => {
                            const clientUnbilledAppointments = getUnbilledAppointments().filter(app => app.clientId === newInvoiceClientId);
                            if (clientUnbilledAppointments.length === 0) return null;
                            return (
                              <div className={`relative w-full border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                                newInvoiceAppointmentId
                                  ? 'border-[#003527] ring-1 ring-[#003527]'
                                  : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                              }`}>
                                <span className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                  newInvoiceAppointmentId
                                    ? 'top-1.5 text-[9px] text-[#003527]'
                                    : 'top-3.5 text-xs text-zinc-450 font-normal'
                                }`}>
                                  Abrechenbaren Termin verknüpfen
                                </span>
                                <select
                                  value={newInvoiceAppointmentId || ''}
                                  onChange={(e) => {
                                    const apptId = e.target.value;
                                    if (apptId) {
                                      setNewInvoiceAppointmentId(apptId);
                                      const appt = appointments.find(a => a.id === apptId);
                                      if (appt) {
                                        const apptDate = new Date(appt.startTime);
                                        const formattedDate = apptDate.toLocaleDateString('de-DE', {
                                          day: '2-digit',
                                          month: 'long',
                                          year: 'numeric'
                                        });
                                        setServiceDate(formattedDate);
                                        setNewInvoiceAmount(appt.price.toFixed(2));
                                        setLineItems([
                                          { id: `li-${Date.now()}`, description: appt.serviceName, price: appt.price, taxRate: 0 }
                                        ]);
                                        showToast(`Daten für ${appt.serviceName} wurden geladen.`, 'info');
                                      }
                                    } else {
                                      setNewInvoiceAppointmentId(null);
                                    }
                                  }}
                                  className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 cursor-pointer"
                                >
                                  <option value="">-- Kein Termin verknüpft --</option>
                                  {clientUnbilledAppointments.map(app => {
                                    const dateStr = new Date(app.startTime).toLocaleDateString('de-DE', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    });
                                    return (
                                      <option key={app.id} value={app.id}>
                                        {dateStr} - {app.serviceName} ({app.price.toFixed(2)} €)
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            );
                          })()}

                          {selectedClientForInvoice && (
                            <div className="bg-[#f9f9f8] border border-[#bfc9c3]/20 p-4 rounded-2xl space-y-2 text-xs font-semibold text-[#003527] text-left animate-in fade-in duration-200">
                              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Empfänger Details</p>
                              <p className="font-extrabold text-sm">{selectedClientForInvoice.name}</p>
                              {selectedClientForInvoice.street && (
                                <p className="text-zinc-500 font-medium">{selectedClientForInvoice.street} {selectedClientForInvoice.houseNumber}</p>
                              )}
                              {selectedClientForInvoice.zipCode && (
                                <p className="text-zinc-500 font-medium">{selectedClientForInvoice.zipCode} {selectedClientForInvoice.city}</p>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* STEP 2: INVOICE DETAILS */}
                      {currentStep === 2 && (
                        <>
                          <div 
                            className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                              focusField === 'newInvoiceNumber' || newInvoiceNumber
                                ? 'border-[#003527] ring-1 ring-[#003527]'
                                : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                            }`}
                          >
                            <label 
                              htmlFor="newInvoiceNumber" 
                              className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                focusField === 'newInvoiceNumber' || newInvoiceNumber
                                  ? 'top-1.5 text-[9px] text-[#003527]'
                                  : 'top-3.5 text-xs text-zinc-400 font-normal'
                              }`}
                            >
                              Rechnungsnummer
                            </label>
                            <input
                              id="newInvoiceNumber"
                              type="text"
                              required
                              value={newInvoiceNumber}
                              onFocus={() => setFocusField('newInvoiceNumber')}
                              onBlur={() => setFocusField(null)}
                              onChange={(e) => setNewInvoiceNumber(e.target.value)}
                              className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 text-left"
                            />
                          </div>

                          <div 
                            className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                              focusField === 'newInvoiceDate' || newInvoiceDate
                                ? 'border-[#003527] ring-1 ring-[#003527]'
                                : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                            }`}
                          >
                            <label 
                              htmlFor="newInvoiceDate" 
                              className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                focusField === 'newInvoiceDate' || newInvoiceDate
                                  ? 'top-1.5 text-[9px] text-[#003527]'
                                  : 'top-3.5 text-xs text-zinc-400 font-normal'
                              }`}
                            >
                              Rechnungsdatum
                            </label>
                            <input
                              id="newInvoiceDate"
                              type="date"
                              required
                              value={newInvoiceDate}
                              onFocus={() => setFocusField('newInvoiceDate')}
                              onBlur={() => setFocusField(null)}
                              onChange={(e) => setNewInvoiceDate(e.target.value)}
                              className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 text-left"
                            />
                          </div>

                          <div className={`relative w-full border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                            newInvoiceStatus
                              ? 'border-[#003527] ring-1 ring-[#003527]'
                              : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                          }`}>
                            <span className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                              newInvoiceStatus
                                ? 'top-1.5 text-[9px] text-[#003527]'
                                : 'top-3.5 text-xs text-zinc-450 font-normal'
                            }`}>
                              Zahlungsstatus
                            </span>
                            <select
                              required
                              value={newInvoiceStatus}
                              onChange={(e) => setNewInvoiceStatus(e.target.value as 'open' | 'paid' | 'overdue')}
                              className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 cursor-pointer"
                            >
                              <option value="open">Offen</option>
                              <option value="paid">Bezahlt</option>
                              <option value="overdue">Überfällig</option>
                            </select>
                          </div>

                          <div 
                            className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                              focusField === 'serviceDate' || serviceDate
                                ? 'border-[#003527] ring-1 ring-[#003527]'
                                : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                            }`}
                          >
                            <label 
                              htmlFor="serviceDate" 
                              className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                focusField === 'serviceDate' || serviceDate
                                  ? 'top-1.5 text-[9px] text-[#003527]'
                                  : 'top-3.5 text-xs text-zinc-400 font-normal'
                              }`}
                            >
                              Leistungszeitraum
                            </label>
                            <input
                              id="serviceDate"
                              type="text"
                              required
                              value={serviceDate}
                              onFocus={() => setFocusField('serviceDate')}
                              onBlur={() => setFocusField(null)}
                              onChange={(e) => setServiceDate(e.target.value)}
                              placeholder="z.B. Juni 2026 oder 15.06.2026"
                              className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 text-left"
                            />
                          </div>

                          <div 
                            className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                              focusField === 'notes' || notes
                                ? 'border-[#003527] ring-1 ring-[#003527]'
                                : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                            }`}
                          >
                            <label 
                              htmlFor="notes" 
                              className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                focusField === 'notes' || notes
                                  ? 'top-1.5 text-[9px] text-[#003527]'
                                  : 'top-3.5 text-xs text-zinc-400 font-normal'
                              }`}
                            >
                              Zahlungshinweis / Notiz
                            </label>
                            <textarea
                              id="notes"
                              value={notes}
                              onFocus={() => setFocusField('notes')}
                              onBlur={() => setFocusField(null)}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Zusätzliche Infos..."
                              className="block w-full border-0 p-0 text-xs font-semibold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-14 resize-none text-left"
                            />
                          </div>

                          {/* Reverse-Charge Section */}
                          <div className="space-y-3 pt-3 border-t border-[#bfc9c3]/15">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isReverseCharge}
                                onChange={(e) => {
                                  setIsReverseCharge(e.target.checked);
                                  if (!e.target.checked) {
                                    setClientVatId('');
                                    setVatIdError('');
                                  }
                                }}
                                className="rounded border-[#bfc9c3]/60 text-[#003527] focus:ring-[#003527] w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className="text-[10px] font-bold text-[#003527] uppercase tracking-wider">§ 13b UStG (Reverse-Charge)</span>
                            </label>

                            {isReverseCharge && (
                              <div 
                                className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                                  focusField === 'clientVatId' || clientVatId
                                    ? 'border-[#003527] ring-1 ring-[#003527]'
                                    : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                                }`}
                              >
                                <label 
                                  htmlFor="clientVatId" 
                                  className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                    focusField === 'clientVatId' || clientVatId
                                      ? 'top-1.5 text-[9px] text-[#003527]'
                                      : 'top-3.5 text-xs text-zinc-400 font-normal'
                                  }`}
                                >
                                  USt-IdNr. des Klienten
                                </label>
                                <input
                                  id="clientVatId"
                                  type="text"
                                  required
                                  value={clientVatId}
                                  onFocus={() => setFocusField('clientVatId')}
                                  onBlur={() => setFocusField(null)}
                                  onChange={(e) => {
                                    setClientVatId(e.target.value.toUpperCase());
                                    setVatIdError(validateVatId(e.target.value));
                                  }}
                                  placeholder="z.B. DE812345678"
                                  className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 text-left"
                                />
                                {vatIdError && (
                                  <p className="text-[9px] text-red-500 font-extrabold flex items-center gap-1 mt-1.5 pl-1"><AlertCircle className="w-3 h-3 flex-shrink-0" /> {vatIdError}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* STEP 3: POSITIONEN & FERTIGSTELLEN */}
                      {currentStep === 3 && (
                        <>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-[#bfc9c3]/15 pb-2">
                              <span className="text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Positionen ({lineItems.length})</span>
                            </div>
                            
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                              {lineItems.map((item, idx) => (
                                <div key={item.id} className="bg-[#f9f9f8] border border-[#bfc9c3]/30 p-3.5 rounded-2xl space-y-3 relative group text-left transition-all duration-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] bg-[#003527]/5 text-[#003527] px-1.5 py-0.5 rounded font-mono font-bold">Pos. {idx + 1}</span>
                                    {lineItems.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setLineItems(lineItems.filter(li => li.id !== item.id));
                                        }}
                                        className="text-rose-600 hover:text-rose-700 cursor-pointer p-0.5 border-none bg-transparent flex-shrink-0"
                                        title="Position löschen"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  
                                  <div 
                                    className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                                      focusField === `item_desc_${item.id}` || item.description
                                        ? 'border-[#003527] ring-1 ring-[#003527]'
                                        : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                                    }`}
                                  >
                                    <label 
                                      className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                        focusField === `item_desc_${item.id}` || item.description
                                          ? 'top-1.5 text-[9px] text-[#003527]'
                                          : 'top-3.5 text-xs text-zinc-400 font-normal'
                                      }`}
                                    >
                                      Beschreibung
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={item.description}
                                      onFocus={() => setFocusField(`item_desc_${item.id}`)}
                                      onBlur={() => setFocusField(null)}
                                      onChange={(e) => {
                                        const updated = lineItems.map(li => li.id === item.id ? { ...li, description: e.target.value } : li);
                                        setLineItems(updated);
                                      }}
                                      className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 text-left"
                                      placeholder="z.B. Behandlung"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <div 
                                      className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                                        focusField === `item_price_${item.id}` || item.price
                                          ? 'border-[#003527] ring-1 ring-[#003527]'
                                          : 'border-zinc-200 hover:border-zinc-350 shadow-none'
                                      }`}
                                    >
                                      <label 
                                        className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                                          focusField === `item_price_${item.id}` || item.price
                                            ? 'top-1.5 text-[9px] text-[#003527]'
                                            : 'top-3.5 text-xs text-zinc-400 font-normal'
                                        }`}
                                      >
                                        Betrag (€)
                                      </label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={item.price || ''}
                                        onFocus={() => setFocusField(`item_price_${item.id}`)}
                                        onBlur={() => setFocusField(null)}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          const updated = lineItems.map(li => li.id === item.id ? { ...li, price: val } : li);
                                          setLineItems(updated);
                                        }}
                                        className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 text-right"
                                        placeholder="0,00"
                                      />
                                    </div>

                                    {!isSmallBusiness && !isReverseCharge ? (
                                      <div className="relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white border-zinc-200 hover:border-zinc-350 shadow-none">
                                        <span className="absolute left-3.5 top-1.5 text-[9px] text-zinc-400 font-semibold pointer-events-none">
                                          USt.
                                        </span>
                                        <select
                                          value={item.taxRate}
                                          onChange={(e) => {
                                            const rate = parseInt(e.target.value) || 0;
                                            const updated = lineItems.map(li => li.id === item.id ? { ...li, taxRate: rate } : li);
                                            setLineItems(updated);
                                          }}
                                          className="block w-full border-0 p-0 text-xs font-bold text-[#003527] focus:ring-0 focus:outline-none bg-transparent h-6 cursor-pointer"
                                        >
                                          <option value={0}>0%</option>
                                          <option value={7}>7%</option>
                                          <option value={19}>19%</option>
                                        </select>
                                      </div>
                                    ) : (
                                      <div className="relative border rounded-xl px-3.5 pt-5 pb-2 bg-zinc-50 border-transparent select-none">
                                        <span className="absolute left-3.5 top-1.5 text-[9px] text-zinc-400 font-semibold">
                                          USt.
                                        </span>
                                        <div className="text-xs font-bold text-zinc-400 h-6 flex items-center">
                                          0% (befreit)
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setLineItems([
                                  ...lineItems,
                                  { id: `li-${Date.now()}`, description: 'Neue Leistung', price: 0, taxRate: 0 }
                                ]);
                              }}
                              className="w-full border border-dashed border-[#003527]/20 hover:border-[#003527]/40 bg-[#003527]/5 hover:bg-[#003527]/10 text-[#003527] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99] border-none"
                            >
                              <Plus className="w-3.5 h-3.5" /> Position hinzufügen
                            </button>
                          </div>

                          {/* Warnings and Checklist */}
                          {selectedClientForInvoice && (isProfileIncomplete || isClientAddressIncomplete) && (
                            <div className="bg-rose-50 border border-rose-200/50 p-4 rounded-2xl text-[9px] text-rose-800 font-bold space-y-2 animate-in slide-in-from-top-2 duration-200">
                              <p className="flex items-center gap-1.5 text-[10px] border-b border-rose-200/50 pb-1.5 uppercase tracking-wider"><AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" /> Pflichtangaben fehlen</p>
                              <ul className="space-y-1 text-left list-none pl-0">
                                {isProfileIncomplete && (
                                  <li className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Bankverbindung fehlt
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsNewInvoiceSheetOpen(false);
                                        window.location.href = '/dashboard/settings';
                                      }}
                                      className="text-rose-800 hover:text-rose-950 font-extrabold hover:underline cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
                                    >
                                      Hinzufügen →
                                    </button>
                                  </li>
                                )}
                                {selectedClientForInvoice && !(selectedClientForInvoice.street?.trim() && selectedClientForInvoice.houseNumber?.trim()) && (
                                  <li className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Klienten-Straße fehlt
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsNewInvoiceSheetOpen(false);
                                        window.location.href = `/dashboard/clients`;
                                      }}
                                      className="text-rose-800 hover:text-rose-950 font-extrabold hover:underline cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
                                    >
                                      Hinzufügen →
                                    </button>
                                  </li>
                                )}
                                {selectedClientForInvoice && !(selectedClientForInvoice.zipCode?.trim() && selectedClientForInvoice.city?.trim()) && (
                                  <li className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Klienten-PLZ/Ort fehlt
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsNewInvoiceSheetOpen(false);
                                        window.location.href = `/dashboard/clients`;
                                      }}
                                      className="text-rose-800 hover:text-rose-950 font-extrabold hover:underline cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
                                    >
                                      Hinzufügen →
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Total Box */}
                          <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 p-4 rounded-2xl text-[10px] text-zinc-400 font-bold space-y-1">
                            <p className="text-[#003527] uppercase tracking-wider text-[8px] mb-1">Berechneter Gesamtbetrag</p>
                            <p className="text-base font-extrabold text-[#003527]">{grossTotal.toFixed(2)} €</p>
                            <p className="font-semibold text-zinc-400">({lineItems.length} Position(en))</p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                </div>
              </div>

              {/* FOOTER ACTIONS BAR */}
              <div className="space-y-2.5 pt-6 border-t border-[#bfc9c3]/20 flex-shrink-0">
                {currentStep === 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!newInvoiceClientId}
                      className="w-full bg-[#003527] hover:bg-[#0b513d] disabled:opacity-40 disabled:hover:bg-[#003527] disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-none border-none"
                    >
                      Weiter (Rechnungsdaten) →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewInvoiceSheetOpen(false);
                        setIsEditingDraft(false);
                        setPrefillInvoice(null);
                      }}
                      className="w-full bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border-none"
                    >
                      Abbrechen
                    </button>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (isReverseCharge) {
                          const err = validateVatId(clientVatId);
                          if (err) {
                            setVatIdError(err);
                            showToast(`Ungültige USt-IdNr.: ${err}`, 'error');
                            return;
                          }
                        }
                        setCurrentStep(3);
                      }}
                      className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-none border-none"
                    >
                      Weiter (Positionen) →
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="w-full bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border-none"
                    >
                      ← Zurück
                    </button>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSave(false)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-none border-none"
                    >
                      <Check className="w-4 h-4" /> Finalisieren & Sperren
                    </button>
                    <button
                      type="button"
                      onClick={() => onSave(true)}
                      className="w-full bg-[#bfc9c3]/20 hover:bg-[#bfc9c3]/30 text-[#003527] py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-none"
                    >
                      <Save className="w-4 h-4" /> {isEditingDraft ? 'Entwurf speichern' : 'Als Entwurf speichern'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border-none"
                    >
                      ← Zurück
                    </button>
                  </>
                )}
              </div>
            </aside>
          )}
        </div>
      </form>
    </motion.div>
  );
}
